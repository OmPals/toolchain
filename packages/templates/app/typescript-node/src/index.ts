import { HelloWorld_Module, Ethereum_Module } from "./w3";

import { Web3ApiClient } from "@web3api/client-js";

const client = new Web3ApiClient();

async function main() {
  console.log("Invoking: logMessage");

  await HelloWorld_Module.logMessage({
    message: "Hello there"
  }, client);

  await HelloWorld_Module.logMessage({
    message: "Hello again"
  }, client);

  await HelloWorld_Module.logMessage({
    message: "One last time..."
  }, client);

  const result = await Ethereum_Module.encodeParams({
    types: ["address", "uint256"],
    values: ["0xB1B7586656116D546033e3bAFF69BFcD6592225E", "500"]
  }, client);

  console.log(`Ethereum_Module.encodeParams:\n${result.data}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
