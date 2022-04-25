import { defaultWeb3ApiManifest } from "../../lib";
import { clearStyle, w3Cli } from "./utils";

import { runCLI } from "@web3api/test-env-js";
import { GetPathToCliTestFiles } from "@web3api/test-cases";
import path from "path";
import fs from "fs";

const HELP = `
w3 codegen [options]

Options:
  -h, --help                              Show usage information
  -m, --manifest-file <path>              Path to the Web3API manifest file (default: ${defaultWeb3ApiManifest.join(
    " | "
  )})
  -c, --codegen-dir <path>                Output directory for the generated code (default: ./w3)
  -s, --script <path>                     Path to a custom generation script (JavaScript | TypeScript)
  -i, --ipfs [<node>]                     IPFS node to load external schemas (default: ipfs.io & localhost)
  -e, --ens [<address>]                   ENS address to lookup external schemas (default: 0x0000...2e1e)

`;

describe("e2e tests for codegen command", () => {
  const testCaseRoot = path.join(GetPathToCliTestFiles(), "api/codegen");
  const testCases =
    fs.readdirSync(testCaseRoot, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  const getTestCaseDir = (index: number) =>
    path.join(testCaseRoot, testCases[index]);

  test("Should show help text", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--help"],
      cwd: getTestCaseDir(0),
      cli: w3Cli,
    });

    expect(code).toEqual(0);
    expect(error).toBe("");
    expect(clearStyle(output)).toEqual(HELP);
  });

  test("Should throw error for invalid params - script", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--script"],
      cwd: getTestCaseDir(0),
      cli: w3Cli,
    });

    expect(code).toEqual(1);
    expect(error).toBe("");
    expect(clearStyle(output))
      .toEqual(`--script option missing <path> argument
${HELP}`);
  });

  test("Should throw error for invalid params - ens", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--ens"],
      cwd: getTestCaseDir(0),
      cli: w3Cli,
    });

    expect(code).toEqual(1);
    expect(error).toBe("");
    expect(clearStyle(output))
      .toEqual(`--ens option missing [<address>] argument
${HELP}`);
  });

  test("Should throw error for invalid generation file - wrong file", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--script", `web3api-invalid.gen.js`],
      cwd: getTestCaseDir(0),
      cli: w3Cli,
    });

    const genFile = path.normalize(`${getTestCaseDir(0)}/web3api-invalid.gen.js`);

    expect(code).toEqual(1);
    expect(error).toBe("");
    expect(clearStyle(output)).toContain(`Failed to generate types: Cannot find module '${genFile}'`);
  });

  describe("test-cases", () => {
    for (let i = 0; i < testCases.length; ++i) {
      const testCaseName = testCases[i];
      const testCaseDir = getTestCaseDir(i);

      test(testCaseName, async () => {

        let cmdArgs = [];
        let cmdFile = path.join(testCaseDir, "cmd.json");
        if (fs.existsSync(cmdFile)) {
          const cmdConfig = JSON.parse(fs.readFileSync(cmdFile, "utf-8"));
          if (cmdConfig.args) {
            cmdArgs.push(...cmdConfig.args);
          }
        }

        let { exitCode, stdout, stderr } = await runCLI(
          {
            args: ["codegen", ...cmdArgs],
            cwd: testCaseDir,
           cli: w3Cli,
          },
        );

        stdout = clearStyle(stdout);
        stderr = clearStyle(stderr);

        const expected = JSON.parse(
          fs.readFileSync(
            path.join(testCaseDir, "expected/output.json"), "utf-8"
          )
        );

        if (expected.stdout) {
          if (Array.isArray(expected.stdout)) {
            for (const line of expected.stdout) {
              expect(stdout).toContain(line);
            }
          } else {
            expect(stdout).toContain(expected.stdout);
          }
        }

        if (expected.stderr) {
          if (Array.isArray(expected.stderr)) {
            for (const line of expected.stderr) {
              expect(stderr).toContain(line);
            }
          } else {
            expect(stderr).toContain(expected.stderr);
          }
        }

        if (expected.exitCode) {
          expect(exitCode).toEqual(expected.exitCode);
        }
      });
    }
  });
});
