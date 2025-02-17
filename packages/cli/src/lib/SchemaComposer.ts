/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Project, AnyProjectManifest, intlMsg } from "./";

import { Uri, PolywrapClient } from "@polywrap/client-js";
import {
  composeSchema,
  ComposerOptions,
  SchemaFile,
} from "@polywrap/schema-compose";
import fs from "fs";
import path from "path";
import * as gluegun from "gluegun";
import YAML from "js-yaml";
import {
  deserializeWrapManifest,
  validateWrapManifest,
} from "@polywrap/wrap-manifest-types-js";
import { PolywrapManifest } from "@polywrap/polywrap-manifest-types-js";
import { WrapAbi } from "@polywrap/schema-parse";

export interface SchemaComposerConfig {
  project: Project<AnyProjectManifest>;
  client: PolywrapClient;
}

export class SchemaComposer {
  private _client: PolywrapClient;
  private _abi: WrapAbi | undefined;

  constructor(private _config: SchemaComposerConfig) {
    this._client = this._config.client;
  }

  public async getComposedAbis(): Promise<WrapAbi> {
    if (this._abi) {
      return Promise.resolve(this._abi);
    }

    const { project } = this._config;

    const schemaNamedPath = await project.getSchemaNamedPath();
    const import_abis = await project.getImportAbis();

    const getSchemaFile = (schemaPath?: string): SchemaFile | undefined =>
      schemaPath
        ? {
            schema: fs.readFileSync(schemaPath, "utf-8"),
            absolutePath: schemaPath,
          }
        : undefined;

    const schemaFile = getSchemaFile(schemaNamedPath);
    if (!schemaFile) {
      throw Error(`Schema cannot be loaded at path: ${schemaNamedPath}`);
    }

    const options: ComposerOptions = {
      schema: schemaFile,
      resolvers: {
        external: (uri: string) => this._fetchExternalAbi(uri, import_abis),
        local: (path: string) => Promise.resolve(this._fetchLocalSchema(path)),
      },
    };

    this._abi = await composeSchema(options);
    return this._abi;
  }

  public reset(): void {
    this._abi = undefined;
  }

  private _fetchLocalSchema(schemaPath: string) {
    return fs.readFileSync(
      path.isAbsolute(schemaPath)
        ? schemaPath
        : path.join(this._config.project.getManifestDir(), schemaPath),
      "utf-8"
    );
  }

  private async _fetchExternalAbi(
    uri: string,
    import_abis?: PolywrapManifest["source"]["import_abis"]
  ): Promise<WrapAbi> {
    // Check to see if we have any import redirects that match
    if (import_abis) {
      for (const import_abi of import_abis) {
        const redirectUri = new Uri(import_abi.uri);
        const uriParsed = new Uri(uri);

        if (!Uri.equals(redirectUri, uriParsed)) {
          continue;
        }

        const abiPath = path.join(
          this._config.project.getManifestDir(),
          import_abi.abi
        );

        if (!fs.existsSync(abiPath)) {
          throw Error(
            intlMsg.lib_schemaComposer_abi_not_found({
              path: abiPath,
            })
          );
        }

        if (abiPath.endsWith(".info")) {
          return await this._loadWrapAbi(abiPath);
        } else if (abiPath.endsWith(".graphql")) {
          return await this._loadGraphqlAbi(abiPath, import_abis);
        } else if (abiPath.endsWith(".json")) {
          return await this._loadJsonAbi(abiPath);
        } else if (abiPath.endsWith(".yaml")) {
          return await this._loadYamlAbi(abiPath);
        } else {
          throw Error(
            intlMsg.lib_schemaComposer_unknown_abi({
              path: abiPath,
              types: ["*.info", "*.graphql", "*.json", "*.yaml"].toString(),
            })
          );
        }
      }
    }

    try {
      const manifest = await this._client.getManifest(new Uri(uri));
      return manifest.abi;
    } catch (e) {
      gluegun.print.error(e);
      throw e;
    }
  }

  private async _loadGraphqlAbi(
    path: string,
    import_abis: PolywrapManifest["source"]["import_abis"]
  ): Promise<WrapAbi> {
    const schema = fs.readFileSync(path, "utf-8");

    return await composeSchema({
      schema: {
        schema: schema,
        absolutePath: path,
      },
      resolvers: {
        external: (uri: string) => this._fetchExternalAbi(uri, import_abis),
        local: (path: string) => Promise.resolve(this._fetchLocalSchema(path)),
      },
    });
  }

  private async _loadWrapAbi(path: string): Promise<WrapAbi> {
    const manifest = fs.readFileSync(path);
    return (await deserializeWrapManifest(manifest)).abi;
  }

  private async _loadJsonAbi(path: string): Promise<WrapAbi> {
    // Load the JSON ABI
    const json = fs.readFileSync(path, "utf-8");
    const result = JSON.parse(json);

    // Validate the ABI's structure
    await validateWrapManifest({
      version: "0.1",
      type: "interface",
      name: "temp",
      abi: result,
    });

    // Return ABI
    return result as WrapAbi;
  }

  private async _loadYamlAbi(path: string): Promise<WrapAbi> {
    // Load the YAML ABI
    const yaml = fs.readFileSync(path, "utf-8");
    const result = YAML.safeLoad(yaml);

    if (!result) {
      throw Error(
        intlMsg.lib_schemaComposer_invalid_yaml({
          path: path,
        })
      );
    }

    // Validate the ABI's structure
    await validateWrapManifest({
      version: "0.1",
      type: "interface",
      name: "temp",
      abi: result as WrapAbi,
    });

    // Return ABI
    return result as WrapAbi;
  }
}
