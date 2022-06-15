/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Project, AnyManifest, getSimpleClient } from "./";

import { Uri, Web3ApiClient } from "@web3api/client-js";
import {
  composeSchema,
  ComposerOutput,
  ComposerFilter,
  ComposerOptions,
  SchemaFile,
} from "@web3api/schema-compose";
import fs from "fs";
import path from "path";
import * as gluegun from "gluegun";

export interface SchemaComposerConfig {
  project: Project<AnyManifest>;

  // TODO: add this to the project configuration
  //       and make it configurable
  ensAddress?: string;
  ethProvider?: string;
  ipfsProvider?: string;
  client?: Web3ApiClient;
}

export class SchemaComposer {
  private _client: Web3ApiClient;
  private _composerOutput: ComposerOutput | undefined;

  constructor(private _config: SchemaComposerConfig) {
    this._client = this._config.client ?? getSimpleClient(this._config);
  }

  public async getComposedSchemas(
    output: ComposerFilter = ComposerFilter.All
  ): Promise<ComposerOutput> {
    if (this._composerOutput) {
      return Promise.resolve(this._composerOutput);
    }

    const { project } = this._config;

    const schemaNamedPath = await project.getSchemaNamedPath();
    const import_redirects = await project.getImportRedirects();

    const getSchemaFile = (schemaPath?: string): SchemaFile | undefined =>
      schemaPath
        ? {
            schema: this._fetchLocalSchema(schemaPath),
            absolutePath: schemaPath,
          }
        : undefined;

    const options: ComposerOptions = {
      schemas: [],
      resolvers: {
        external: (uri: string) =>
          this._fetchExternalSchema(uri, import_redirects),
        local: (path: string) => Promise.resolve(this._fetchLocalSchema(path)),
      },
      output,
    };

    const schemaFile = getSchemaFile(schemaNamedPath);
    if (!schemaFile) {
      throw Error(`Schema cannot be loaded at path: ${schemaNamedPath}`);
    }

    options.schemas.push(schemaFile);

    this._composerOutput = await composeSchema(options);

    return this._composerOutput;
  }

  public reset(): void {
    this._composerOutput = undefined;
  }

  private async _fetchExternalSchema(
    uri: string,
    import_redirects?: {
      uri: string;
      schema: string;
    }[]
  ): Promise<string> {
    // Check to see if we have any import redirects that match
    if (import_redirects) {
      for (const redirect of import_redirects) {
        const redirectUri = new Uri(redirect.uri);
        const uriParsed = new Uri(uri);

        if (Uri.equals(redirectUri, uriParsed)) {
          return this._fetchLocalSchema(redirect.schema);
        }
      }
    }

    try {
      return await this._client.getSchema(new Uri(uri));
    } catch (e) {
      gluegun.print.error(e);
      throw e;
    }
  }

  private _fetchLocalSchema(schemaPath: string) {
    return fs.readFileSync(
      path.isAbsolute(schemaPath)
        ? schemaPath
        : path.join(this._config.project.getManifestDir(), schemaPath),
      "utf-8"
    );
  }
}
