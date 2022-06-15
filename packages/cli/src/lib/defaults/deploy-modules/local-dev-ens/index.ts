/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Deployer } from "../../../deploy/deployer";

import { Uri } from "@web3api/core-js";
import { ensAddresses } from "@web3api/test-env-js";
import path from "path";
import { Web3ApiClient } from "@web3api/client-js";
import { ethereumPlugin } from "@web3api/ethereum-plugin-js";

const contentHash = require("content-hash");

class LocalDevENSPublisher implements Deployer {
  async execute(
    uri: Uri,
    config: {
      domainName: string;
      domainOwnerAddressOrIndex?: string | number;
      ports: {
        ethereum: number;
      };
    }
  ): Promise<Uri> {
    if (uri.authority !== "ipfs") {
      throw new Error(
        `ENS Deployer: resolved URI from ${uri} does not represent an IPFS contentHash`
      );
    }

    const cid = uri.path;
    const ethereumPluginUri = "w3://ens/ethereum.web3api.eth";

    const client = new Web3ApiClient({
      plugins: [
        {
          uri: ethereumPluginUri,
          plugin: ethereumPlugin({
            networks: {
              testnet: {
                provider: `http://localhost:${config.ports.ethereum}`,
              },
            },
            defaultNetwork: "testnet",
          }),
        },
      ],
    });

    const { data: signer } = await client.invoke<string>({
      method: "getSignerAddress",
      uri: ethereumPluginUri,
      input: {
        connection: {
          networkNameOrChainId: "testnet",
        },
      },
    });

    if (!signer) {
      throw new Error("Could not get signer");
    }

    const ensWrapperUri = `fs/${path.join(
      path.dirname(require.resolve("@web3api/test-env-js")),
      "wrappers",
      "ens"
    )}`;

    const { data: registerData, error } = await client.invoke<{ hash: string }>(
      {
        method: "registerDomainAndSubdomainsRecursively",
        uri: ensWrapperUri,
        input: {
          domain: config.domainName,
          owner: signer,
          resolverAddress: ensAddresses.resolverAddress,
          ttl: "0",
          registrarAddress: ensAddresses.registrarAddress,
          registryAddress: ensAddresses.ensAddress,
          connection: {
            networkNameOrChainId: "testnet",
          },
        },
      }
    );

    if (!registerData) {
      throw new Error(
        `Could not register domain '${config.domainName}'` +
          (error ? `\nError: ${error.message}` : "")
      );
    }

    await client.invoke({
      method: "awaitTransaction",
      uri: ethereumPluginUri,
      input: {
        txHash: registerData.hash,
        confirmations: 1,
        timeout: 15000,
        connection: {
          networkNameOrChainId: "testnet",
        },
      },
    });

    const hash = "0x" + contentHash.fromIpfs(cid);

    const { data: setContenthashData } = await client.invoke<{ hash: string }>({
      method: "setContentHash",
      uri: ensWrapperUri,
      input: {
        domain: config.domainName,
        cid: hash,
        resolverAddress: ensAddresses.resolverAddress,
        connection: {
          networkNameOrChainId: "testnet",
        },
      },
    });

    if (!setContenthashData) {
      throw new Error(`Could not set contentHash for '${config.domainName}'`);
    }

    await client.invoke({
      method: "awaitTransaction",
      uri: ethereumPluginUri,
      input: {
        txHash: setContenthashData.hash,
        confirmations: 1,
        timeout: 15000,
        connection: {
          networkNameOrChainId: "testnet",
        },
      },
    });

    return new Uri(`ens/${config.domainName}`);
  }
}

export default new LocalDevENSPublisher();
