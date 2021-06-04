/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Project } from "./Project";

import { Web3ApiManifest, Uri, Web3ApiClient, UriRedirect } from "@web3api/client-js";
import {
  composeSchema,
  ComposerOutput,
  ComposerFilter,
} from "@web3api/schema-compose";
import { ensPlugin } from "@web3api/ens-plugin-js";
import { ethereumPlugin } from "@web3api/ethereum-plugin-js";
import { ipfsPlugin } from "@web3api/ipfs-plugin-js";
import fs from "fs";
import path from "path";
import * as gluegun from "gluegun";
import { SchemaFile } from "@web3api/schema-compose";

export interface SchemaConfig {
  project: Project;

  // TODO: add this to the project configuration
  //       and make it configurable
  ensAddress?: string;
  ethProvider?: string;
  ipfsProvider?: string;
}

export class SchemaComposer {
  private _client: Web3ApiClient;
  private _composerOutput: ComposerOutput | undefined;

  constructor(private _config: SchemaConfig) {
    const { ensAddress, ethProvider, ipfsProvider } = this._config;
    const redirects: UriRedirect[] = [];

    if (ensAddress) {
      redirects.push({
        from: "w3://ens/ens.web3api.eth",
        to: ensPlugin({
          addresses: {
            testnet: ensAddress,
          },
        }),
      });
    }

    if (ethProvider) {
      redirects.push({
        from: "w3://ens/ethereum.web3api.eth",
        to: ethereumPlugin({
          networks: {
            testnet: {
              provider: ethProvider,
            },
          },
        }),
      });
    }

    if (ipfsProvider) {
      redirects.push({
        from: "w3://ens/ipfs.web3api.eth",
        to: ipfsPlugin({
          provider: ipfsProvider,
          fallbackProviders: ["https://ipfs.io"],
        }),
      });
    }

    this._client = new Web3ApiClient({ redirects });
  }

  public async getComposedSchemas(
    output: ComposerFilter = ComposerFilter.All
  ): Promise<ComposerOutput> {
    if (this._composerOutput) {
      return Promise.resolve(this._composerOutput);
    }

    const { project } = this._config;

    const manifest = await project.getWeb3ApiManifest();
    const querySchemaPath = manifest.modules.query?.schema;
    const mutationSchemaPath = manifest.modules.mutation?.schema;
    const getSchema = (schemaPath?: string): SchemaFile | undefined =>
      schemaPath
        ? {
            schema: this._fetchLocalSchema(schemaPath),
            absolutePath: schemaPath,
          }
        : undefined;

    this._composerOutput = await composeSchema({
      schemas: {
        query: getSchema(querySchemaPath),
        mutation: getSchema(mutationSchemaPath),
      },
      resolvers: {
        external: (uri: string) => this._fetchExternalSchema(uri, manifest),
        local: (path: string) => Promise.resolve(this._fetchLocalSchema(path)),
      },
      output,
    });

    return this._composerOutput;
  }

  public reset(): void {
    this._composerOutput = undefined;
  }

  private async _fetchExternalSchema(
    uri: string,
    manifest: Web3ApiManifest
  ): Promise<string> {
    // Check to see if we have any import redirects that match
    if (manifest.import_redirects) {
      for (const redirect of manifest.import_redirects) {
        const redirectUri = new Uri(redirect.uri);
        const uriParsed = new Uri(uri);

        if (Uri.equals(redirectUri, uriParsed)) {
          return this._fetchLocalSchema(redirect.schema);
        }
      }
    }

    try {
      const api = await this._client.loadWeb3Api(new Uri(uri));
      return await api.getSchema(this._client);
    } catch (e) {
      gluegun.print.error(e);
      throw e;
    }
  }

  private _fetchLocalSchema(schemaPath: string) {
    return fs.readFileSync(
      path.isAbsolute(schemaPath)
        ? schemaPath
        : path.join(this._config.project.getWeb3ApiManifestDir(), schemaPath),
      "utf-8"
    );
  }
}
