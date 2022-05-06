import { Web3ApiClient } from "@web3api/client-js";
import { samplePlugin } from "../";

describe("e2e", () => {

  let client: Web3ApiClient;
  const uri = "ens/sampleplugin.eth";

  beforeAll(() => {
    // Add the samplePlugin to the Web3ApiClient
    client = new Web3ApiClient({
      plugins: [
        {
          uri: uri,
          plugin: samplePlugin({
            query: {
              defaultValue: "foo bar"
            },
            mutation: { }
          })
        }
      ]
    });
  });

  it("sampleQuery", async () => {
    const result = await client.invoke({
      uri,
      module: "query",
      method: "sampleQuery",
      input: {
        data: "fuz baz "
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toBe("fuz baz foo bar");
  });

  it("sampleMutation", async () => {
    const result = await client.query<{
      sampleMutation: boolean
    }>({
      uri,
      query: `mutation {
        sampleMutation(
          data: $data
        )
      }`,
      variables: {
        data: new Uint8Array([1, 2, 3, 4, 5])
      }
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data?.sampleMutation).toBe(true);
  });
});
