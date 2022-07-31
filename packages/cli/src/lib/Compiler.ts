/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-function */

import {
  copyArtifactsFromBuildImage,
  createBuildImage,
  displayPath,
  generateDockerfile,
  generateDockerImageName,
  intlMsg,
  outputManifest,
  outputMetadata,
  PolywrapProject,
  resetDir,
  SchemaComposer,
  withSpinner,
} from "./";

import { PolywrapManifest } from "@polywrap/polywrap-manifest-types-js";
import {
  WrapManifest,
  WrapAbi,
  validateWrapManifest,
} from "@polywrap/wrap-manifest-types-js";
import { msgpackEncode } from "@polywrap/msgpack-js";
import { WasmWrapper } from "@polywrap/client-js";
import { WrapImports } from "@polywrap/client-js/build/wasm/types";
import { AsyncWasmInstance } from "@polywrap/asyncify-js";
import { Abi } from "@polywrap/schema-parse";
import { ComposerOutput } from "@polywrap/schema-compose";
import {
  normalizePath,
  writeDirectorySync,
  writeFileSync,
} from "@polywrap/os-js";
import * as gluegun from "gluegun";
import fs from "fs";
import path from "path";

interface CompilerState {
  composerOutput: ComposerOutput;
  compilerOverrides?: CompilerOverrides;
}

export interface CompilerOverrides {
  validateManifest: (manifest: PolywrapManifest) => void;
  generationSubPath: string;
}

export interface CompilerConfig {
  outputDir: string;
  project: PolywrapProject;
  schemaComposer: SchemaComposer;
}

export class Compiler {
  private _state: CompilerState | undefined;

  constructor(private _config: CompilerConfig) {}

  public async codegen(): Promise<boolean> {
    const { project } = this._config;

    const run = async (): Promise<void> => {
      const state = await this._getCompilerState();

      if (!(await this._isInterface())) {
        // Generate the bindings
        await this._generateCode(state);
      }
    };

    if (project.quiet) {
      try {
        await run();
        return true;
      } catch (e) {
        gluegun.print.error(e);
        return false;
      }
    } else {
      try {
        await withSpinner(
          intlMsg.lib_compiler_codegenText(),
          intlMsg.lib_compiler_codegenError(),
          intlMsg.lib_compiler_codegenWarning(),
          async () => {
            return run();
          }
        );
        return true;
      } catch (e) {
        gluegun.print.error(e);
        return false;
      }
    }
  }

  public async compile(): Promise<boolean> {
    const { project } = this._config;

    const run = async (): Promise<void> => {
      const state = await this._getCompilerState();

      // Init & clean output directory
      resetDir(this._config.outputDir);

      // Output: schema.graphql
      await this._outputComposedSchema(state);

      // Output: wrap.info
      await this._outputWrapManifest(state);

      if (!(await this._isInterface())) {
        // Generate the bindings
        await this._generateCode(state);

        // Compile the Wrapper
        await this._buildModules();
      }

      // Output Polywrap Metadata
      await this._outputPolywrapMetadata();
    };

    if (project.quiet) {
      try {
        await run();
        return true;
      } catch (e) {
        gluegun.print.error(e);
        return false;
      }
    } else {
      try {
        await withSpinner(
          intlMsg.lib_compiler_compileText(),
          intlMsg.lib_compiler_compileError(),
          intlMsg.lib_compiler_compileWarning(),
          async () => {
            return run();
          }
        );
        return true;
      } catch (e) {
        gluegun.print.error(e);
        return false;
      }
    }
  }

  public reset(): void {
    this._config.project.reset();
    this._config.schemaComposer.reset();
    this._state = undefined;
  }

  private async _getCompilerState(): Promise<CompilerState> {
    if (this._state) {
      return this._state;
    }

    const { project } = this._config;

    // Get the PolywrapManifest
    const polywrapManifest = await project.getManifest();

    // Compose the schema
    const composerOutput = await this._composeSchema();

    // Allow the build-image to validate the manifest & override functionality
    const buildImageDir = `${__dirname}/defaults/build-images/${polywrapManifest.language}`;
    const buildImageEntryFile = path.join(buildImageDir, "index.ts");
    let compilerOverrides: CompilerOverrides | undefined;

    if (fs.existsSync(buildImageEntryFile)) {
      const module = await import(buildImageDir);

      // Get any compiler overrides for the given build-image
      if (module.getCompilerOverrides) {
        compilerOverrides = module.getCompilerOverrides() as CompilerOverrides;
      }

      if (compilerOverrides) {
        // Validate the manifest for the given build-image
        if (compilerOverrides.validateManifest) {
          compilerOverrides.validateManifest(polywrapManifest);
        }
      }
    }

    const state: CompilerState = {
      composerOutput,
      compilerOverrides,
    };

    await this._validateState(state);

    this._state = state;
    return this._state;
  }

  private async _isInterface(): Promise<boolean> {
    const { project } = this._config;
    const manifest = await project.getManifest();
    return manifest.language === "interface";
  }

  private async _composeSchema(): Promise<ComposerOutput> {
    const { schemaComposer } = this._config;

    // Get the fully composed schema
    const composerOutput = await schemaComposer.getComposedSchemas();

    if (!composerOutput) {
      throw Error(intlMsg.lib_compiler_failedSchemaReturn());
    }

    return composerOutput;
  }

  private async _generateCode(state: CompilerState): Promise<string[]> {
    const { composerOutput, compilerOverrides } = state;
    const { project } = this._config;

    // Generate the bindings
    const binding = await project.generateSchemaBindings(
      composerOutput,
      compilerOverrides?.generationSubPath
    );

    // Output the bindings
    return writeDirectorySync(binding.outputDirAbs, binding.output);
  }

  private async _buildModules(): Promise<void> {
    const { outputDir } = this._config;

    if (await this._isInterface()) {
      throw Error(intlMsg.lib_compiler_cannotBuildInterfaceModules());
    }

    // Build the sources
    await this._buildSourcesInDocker();

    // Validate the Wasm module
    await this._validateWasmModule(outputDir);
  }

  private async _buildSourcesInDocker(): Promise<string> {
    const { project, outputDir } = this._config;
    const buildManifestDir = await project.getBuildManifestDir();
    const buildManifest = await project.getBuildManifest();
    const imageName =
      buildManifest?.docker?.name ||
      generateDockerImageName(await project.getBuildUuid());
    let dockerfile = buildManifest?.docker?.dockerfile
      ? path.join(buildManifestDir, buildManifest?.docker?.dockerfile)
      : path.join(buildManifestDir, "Dockerfile");

    await project.cacheBuildManifestLinkedPackages();

    // If the dockerfile path isn't provided, generate it
    if (!buildManifest?.docker?.dockerfile) {
      // Make sure the default template is in the cached .polywrap/wasm/build/image folder
      await project.cacheDefaultBuildImage();

      dockerfile = generateDockerfile(
        project.getCachePath(
          path.join(
            PolywrapProject.cacheLayout.buildImageDir,
            "Dockerfile.mustache"
          )
        ),
        buildManifest.config || {}
      );
    }

    const dockerBuildxConfig = buildManifest?.docker?.buildx;
    const useBuildx = !!dockerBuildxConfig;

    let cacheDir: string | undefined;
    let removeBuilder = false;

    if (dockerBuildxConfig && typeof dockerBuildxConfig !== "boolean") {
      const cache = dockerBuildxConfig.cache;

      if (cache == true) {
        cacheDir = project.getCachePath(
          PolywrapProject.cacheLayout.buildImageCacheDir
        );
      } else if (cache) {
        if (!path.isAbsolute(cache)) {
          cacheDir = path.join(project.getManifestDir(), cache);
        } else {
          cacheDir = cache;
        }
      }

      removeBuilder = !!dockerBuildxConfig.removeBuilder;
    }

    const removeImage = !!buildManifest?.docker?.removeImage;

    // If the dockerfile path contains ".mustache", generate
    if (dockerfile.indexOf(".mustache") > -1) {
      dockerfile = generateDockerfile(dockerfile, buildManifest.config || {});
    }

    // Construct the build image
    const dockerImageId = await createBuildImage(
      project.getManifestDir(),
      imageName,
      dockerfile,
      cacheDir,
      useBuildx,
      project.quiet
    );

    await copyArtifactsFromBuildImage(
      outputDir,
      "wrap.wasm",
      imageName,
      removeBuilder,
      removeImage,
      useBuildx,
      project.quiet
    );

    return dockerImageId;
  }

  private async _outputComposedSchema(state: CompilerState): Promise<void> {
    const { outputDir } = this._config;

    if (!state.composerOutput.schema) {
      // This is not being shown with intlMsg because this will be removed
      throw Error("Compiler.outputComposedSchema: no schema found");
    }

    writeFileSync(
      `${outputDir}/schema.graphql`,
      state.composerOutput.schema,
      "utf-8"
    );
  }

  private async _outputWrapManifest(
    state: CompilerState,
    quiet = false
  ): Promise<unknown> {
    const { outputDir, project } = this._config;
    let manifestPath = `${outputDir}/wrap.info`;
    const run = async () => {
      if (!state.composerOutput.abi) {
        throw Error(intlMsg.lib_wrap_abi_not_found());
      }

      const manifest = await project.getManifest();

      const abi: Abi = {
        ...state.composerOutput.abi,
      };

      const filteredAbi: Record<string, unknown> = { ...abi };

      Object.keys(filteredAbi).forEach((key) => {
        const value = filteredAbi[key];

        if (value === null || value === undefined) {
          delete filteredAbi[key];
        }
      });

      const info: WrapManifest = {
        abi: (filteredAbi as unknown) as WrapAbi,
        name: manifest.name,
        type: (await this._isInterface()) ? "interface" : "wasm",
        version: "0.1",
      };

      // One last sanity check
      await validateWrapManifest(info);

      const s = JSON.stringify(info);
      const encodedInfo = msgpackEncode(JSON.parse(s));
      writeFileSync(manifestPath, encodedInfo, {
        encoding: "binary",
      });
    };

    if (quiet) {
      return await run();
    } else {
      manifestPath = displayPath(manifestPath);
      return await withSpinner(
        intlMsg.lib_helpers_wrap_manifest_outputText({
          path: normalizePath(manifestPath),
        }),
        intlMsg.lib_helpers_wrap_manifest_outputError({
          path: normalizePath(manifestPath),
        }),
        intlMsg.lib_helpers_wrap_manifest_outputWarning({
          path: normalizePath(manifestPath),
        }),
        (_spinner): Promise<unknown> => {
          return Promise.resolve(run());
        }
      );
    }
  }

  private async _outputPolywrapMetadata(): Promise<void> {
    const { outputDir, project } = this._config;

    const projectMetaManifest = await project.getMetaManifest();

    if (!projectMetaManifest) {
      return undefined;
    }

    const builtMetaManifest = await outputMetadata(
      projectMetaManifest,
      outputDir,
      project.getManifestDir(),
      project.quiet
    );

    await outputManifest(
      builtMetaManifest,
      path.join(outputDir, "polywrap.meta.json"),
      project.quiet
    );
  }

  private async _validateState(state: CompilerState): Promise<void> {
    const { composerOutput } = state;
    const { project } = this._config;
    const manifest = await project.getManifest();

    if (!composerOutput.schema) {
      const missingSchemaMessage = intlMsg.lib_compiler_missingSchema();
      throw Error(missingSchemaMessage);
    }

    if (manifest.language !== "interface" && !manifest.module) {
      const missingModuleMessage = intlMsg.lib_compiler_missingModule();
      throw Error(missingModuleMessage);
    }

    if (manifest.language === "interface" && manifest.module) {
      const noInterfaceModule = intlMsg.lib_compiler_noInterfaceModule();
      throw Error(noInterfaceModule);
    }
  }

  private async _validateWasmModule(buildDir: string): Promise<void> {
    const modulePath = path.join(buildDir, `wrap.wasm`);
    const wasmSource = fs.readFileSync(modulePath);
    const wrapImports: Record<keyof WrapImports, () => void> = {
      __wrap_subinvoke: () => {},
      __wrap_subinvoke_result_len: () => {},
      __wrap_subinvoke_result: () => {},
      __wrap_subinvoke_error_len: () => {},
      __wrap_subinvoke_error: () => {},
      __wrap_subinvokeImplementation: () => {},
      __wrap_subinvokeImplementation_result_len: () => {},
      __wrap_subinvokeImplementation_result: () => {},
      __wrap_subinvokeImplementation_error_len: () => {},
      __wrap_subinvokeImplementation_error: () => {},
      __wrap_invoke_args: () => {},
      __wrap_invoke_result: () => {},
      __wrap_invoke_error: () => {},
      __wrap_getImplementations: () => {},
      __wrap_getImplementations_result_len: () => {},
      __wrap_getImplementations_result: () => {},
      __wrap_abort: () => {},
      __wrap_debug_log: () => {},
      __wrap_load_env: () => {},
    };

    try {
      const memory = AsyncWasmInstance.createMemory({ module: wasmSource });
      await AsyncWasmInstance.createInstance({
        module: wasmSource,
        imports: {
          env: {
            memory,
          },
          wrap: wrapImports,
        },
        requiredExports: WasmWrapper.requiredExports,
      });
    } catch (error) {
      throw Error(
        intlMsg.lib_compiler_invalid_module({
          modulePath,
          error,
        })
      );
    }
  }
}
