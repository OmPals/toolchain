import {
  VALID_WRAP_MANIFEST_NAMES,
  VALID_MODULE_EXTENSIONS,
  SCHEMA_FILE_NAME,
} from ".";
import {
  WrapperConstraints,
  PackageReader,
  ValidationResult,
  ValidationFailReason,
} from "./types";

import { parseSchema } from "@web3api/schema-parse";
import {
  deserializeWeb3ApiManifest,
  deserializeBuildManifest,
  deserializeMetaManifest,
  Web3ApiManifest,
} from "@web3api/core-js";
import path from "path";

export class WrapperValidator {
  constructor(private constraints: WrapperConstraints) {}

  async validate(reader: PackageReader): Promise<ValidationResult> {
    let result = await this.validateManifests(reader);
    if (!result.valid) {
      return result;
    }

    if (!(await reader.exists(SCHEMA_FILE_NAME))) {
      return this.fail(ValidationFailReason.SchemaNotFound);
    }
    try {
      parseSchema(await reader.readFileAsString(SCHEMA_FILE_NAME));
    } catch (err) {
      return this.fail(ValidationFailReason.InvalidSchema, err);
    }

    result = await this.validateStructure(reader);
    if (!result.valid) {
      return result;
    }

    return this.success();
  }

  private async validateStructure(
    reader: PackageReader
  ): Promise<ValidationResult> {
    const { result: pathResult } = await this.validatePath(reader, "./", 0, 0);

    if (!pathResult.valid) {
      return pathResult;
    }

    return this.success();
  }

  private async validatePath(
    reader: PackageReader,
    basePath: string,
    currentSize: number,
    currentFileCnt: number
  ): Promise<{
    result: ValidationResult;
    currentSize: number;
    currentFileCnt: number;
  }> {
    const items = await reader.readDir(basePath);
    for (const itemPath of items) {
      const stats = await reader.getStats(path.join(basePath, itemPath));

      currentSize += stats.size;
      if (currentSize > this.constraints.maxSize) {
        return {
          result: this.fail(ValidationFailReason.WrapperTooLarge),
          currentSize,
          currentFileCnt,
        };
      }

      currentFileCnt++;
      if (currentFileCnt > this.constraints.maxNumberOfFiles) {
        return {
          result: this.fail(ValidationFailReason.TooManyFiles),
          currentSize,
          currentFileCnt,
        };
      }

      if (stats.isFile) {
        if (stats.size > this.constraints.maxFileSize) {
          return {
            result: this.fail(ValidationFailReason.FileTooLarge),
            currentSize,
            currentFileCnt,
          };
        }
      } else {
        const {
          result,
          currentSize: newSize,
          currentFileCnt: newFileCnt,
        } = await this.validatePath(
          reader,
          path.join(basePath, itemPath),
          currentSize,
          currentFileCnt
        );
        currentSize = newSize;
        currentFileCnt = newFileCnt;

        if (!result.valid) {
          return {
            result,
            currentSize,
            currentFileCnt,
          };
        }
      }
    }

    return {
      result: this.success(),
      currentSize,
      currentFileCnt,
    };
  }

  private async validateManifests(
    reader: PackageReader
  ): Promise<ValidationResult> {
    let manifest: Web3ApiManifest | undefined;
    // Go through manifest names, if more than one wrap manifest exists, fail
    // If no wrap manifest exists or is invalid, also fail
    for (const manifestName of VALID_WRAP_MANIFEST_NAMES) {
      if (!(await reader.exists(manifestName))) {
        continue;
      }

      if (manifest) {
        return this.fail(ValidationFailReason.MultipleWrapManifests);
      }
      const manifestFile = await reader.readFileAsString(manifestName);
      try {
        manifest = deserializeWeb3ApiManifest(manifestFile);
      } catch (err) {
        return this.fail(ValidationFailReason.InvalidWrapManifest, err);
      }
    }

    if (!manifest) {
      return this.fail(ValidationFailReason.WrapManifestNotFound);
    }

    const queryModule = manifest.modules.query;
    const mutationModule = manifest.modules.mutation;

    if (queryModule) {
      const moduleResult = await this.validateModule(reader, queryModule);
      if (!moduleResult.valid) {
        return moduleResult;
      }
    }

    if (mutationModule) {
      const moduleResult = await this.validateModule(reader, mutationModule);
      if (!moduleResult.valid) {
        return moduleResult;
      }
    }

    let manifestValidationResult = await this.validateBuildManifest(
      reader,
      manifest
    );
    if (!manifestValidationResult.valid) {
      return manifestValidationResult;
    }

    manifestValidationResult = await this.validateMetaManifest(
      reader,
      manifest
    );
    if (!manifestValidationResult.valid) {
      return manifestValidationResult;
    }

    return this.success();
  }

  // Checking schema, extension and size
  private async validateModule(
    reader: PackageReader,
    moduleType: {
      schema: string;
      module?: string;
    }
  ): Promise<ValidationResult> {
    if (moduleType && moduleType.module) {
      if (!VALID_MODULE_EXTENSIONS.includes(path.extname(moduleType.module))) {
        return this.fail(ValidationFailReason.InvalidModuleExtension);
      }

      const moduleSize = (await reader.getStats(moduleType.module)).size;

      if (moduleSize > this.constraints.maxModuleSize) {
        return this.fail(ValidationFailReason.ModuleTooLarge);
      }
    }

    return this.success();
  }

  private async validateBuildManifest(
    reader: PackageReader,
    web3ApiManifest: Web3ApiManifest
  ): Promise<ValidationResult> {
    const manifestPath = web3ApiManifest.build;

    if (manifestPath) {
      // Manifests get built as a `.json` file so we need to change the extension
      const fileName = path.parse(manifestPath).name;
      const fullManifestName = `${fileName}.json`;

      const buildManifestFile = await reader.readFileAsString(fullManifestName);
      try {
        deserializeBuildManifest(buildManifestFile);
      } catch (err) {
        return this.fail(ValidationFailReason.InvalidBuildManifest, err);
      }
    }

    return this.success();
  }

  private async validateMetaManifest(
    reader: PackageReader,
    web3ApiManifest: Web3ApiManifest
  ): Promise<ValidationResult> {
    const manifestPath = web3ApiManifest.meta;

    if (manifestPath) {
      // Manifests get built as a `.json` file so we need to change the extension
      const fileName = path.parse(manifestPath).name;
      const fullManifestName = `${fileName}.json`;

      const metaManifestFile = await reader.readFileAsString(fullManifestName);

      try {
        deserializeMetaManifest(metaManifestFile);
      } catch (err) {
        return this.fail(ValidationFailReason.InvalidMetaManifest, err);
      }
    }

    return this.success();
  }

  private success(): ValidationResult {
    return {
      valid: true,
    };
  }

  private fail(
    reason: ValidationFailReason,
    error: Error | undefined = undefined
  ): ValidationResult {
    return {
      valid: false,
      failReason: reason,
      failError: error,
    };
  }
}
