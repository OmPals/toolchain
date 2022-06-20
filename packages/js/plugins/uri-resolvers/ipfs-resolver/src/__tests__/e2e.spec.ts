import { PolywrapClient } from "@polywrap/client-js";
import { GetPathToTestWrappers } from "@polywrap/test-cases";
import {
  initTestEnvironment,
  providers,
  stopTestEnvironment,
  buildAndDeployWrapper,
} from "@polywrap/test-env-js";

import { ipfsResolverPlugin } from "..";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";

import { IpfsClient } from "../../../../ipfs/src/utils/IpfsClient";

const createIpfsClient = require("@dorgjelli-test/ipfs-http-client-lite");

jest.setTimeout(30000);

describe("IPFS Plugin", () => {
  let client: PolywrapClient;
  let ipfs: IpfsClient;

  let wrapperIpfsCid: string;

  beforeAll(async () => {
    await initTestEnvironment();

    ipfs = createIpfsClient(providers.ipfs);

    let { ipfsCid } = await buildAndDeployWrapper({
      wrapperAbsPath: `${GetPathToTestWrappers()}/wasm-as/simple-storage`,
      ipfsProvider: providers.ipfs,
      ethereumProvider: providers.ethereum,
      ensName: "simple-storage.eth",
    });

    wrapperIpfsCid = ipfsCid;
    console.log("wrapperIpfsCid", wrapperIpfsCid);
    client = new PolywrapClient({
      plugins: [
        {
          uri: "wrap://ens/ipfs.polywrap.eth",
          plugin: ipfsPlugin({
            provider: providers.ipfs,
          }),
        },
        {
          uri: "wrap://ens/ipfs-uri-resolver.polywrap.eth",
          plugin: ipfsResolverPlugin({
            provider: providers.ipfs,
          }),
        },
      ],
    });
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("Should successfully resolve a deployed wrapper", async () => {
    const wrapperUri = `ipfs/${wrapperIpfsCid}`;

    const resolution = await client.resolveUri(wrapperUri);

    expect(resolution.wrapper).toBeTruthy();

    const expectedSchema = (
      await ipfs.cat(`${wrapperIpfsCid}/schema.graphql`)
    ).toString("utf-8");

    expect(await resolution.wrapper?.getSchema(client)).toEqual(expectedSchema);
  });
});
