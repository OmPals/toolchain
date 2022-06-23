import { defaultPolywrapManifest } from "../../lib";
import { clearStyle, polywrapCli } from "./utils";

import { runCLI } from "@polywrap/test-env-js";
import { GetPathToCliTestFiles } from "@polywrap/test-cases";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";

const HELP = `Usage: polywrap codegen|g [options]

Auto-generate Wrapper Types

Options:
  -m, --manifest-file <path>  Path to the Polywrap manifest file (default:
                              ${defaultPolywrapManifest.join(" | ")})
  -c, --codegen-dir <path>     Output directory for the generated code
                              (default: ./wrap)
  -s, --script <path>         Path to a custom generation script (JavaScript |
                              TypeScript)
  -i, --ipfs [<node>]         IPFS node to load external schemas (default:
                              ipfs.io & localhost)
  -e, --ens [<address>]       ENS address to lookup external schemas (default:
                              0x0000...2e1e)
  -h, --help                  display help for command
`;

describe("e2e tests for codegen command", () => {
  const testCaseRoot = path.join(GetPathToCliTestFiles(), "wasm/codegen");
  const testCases = fs
    .readdirSync(testCaseRoot, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  const getTestCaseDir = (index: number) =>
    path.join(testCaseRoot, testCases[index]);

  test("Should show help text", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--help"],
      cwd: getTestCaseDir(0),
      cli: polywrapCli,
    });

    expect(code).toEqual(0);
    expect(error).toBe("");
    expect(clearStyle(output)).toEqual(HELP);
  });

  test("Should throw error for invalid params - ens", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--ens"],
      cwd: getTestCaseDir(0),
      cli: polywrapCli,
    });

    expect(code).toEqual(1);
    expect(error).toBe(
      "error: option '-e, --ens [<address>]' argument missing\n"
    );
    expect(clearStyle(output)).toEqual(``);
  });

  test("Should throw error for invalid generation file - wrong file", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--script", `polywrap-invalid.gen.js`],
      cwd: getTestCaseDir(0),
      cli: polywrapCli,
    });

    const genFile = path.normalize(
      `${getTestCaseDir(0)}/polywrap-invalid.gen.js`
    );

    expect(code).toEqual(1);
    expect(error).toBe("");
    expect(clearStyle(output)).toContain(
      `Failed to generate types: Cannot find module '${genFile}'`
    );
  });

  test("Should throw error for invalid generation file - no run() method", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen", "--script", `polywrap-norun.gen.js`],
      cwd: getTestCaseDir(0),
      cli: polywrapCli,
    });

    expect(code).toEqual(1);
    expect(error).toBe("");
    expect(clearStyle(output)).toContain(
      `Failed to generate types: The generation file provided doesn't have the 'generateBinding' method.`
    );
  });

  test("Should successfully generate types", async () => {
    rimraf.sync(`${getTestCaseDir(0)}/types`);

    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["codegen"],
      cwd: getTestCaseDir(0),
      cli: polywrapCli,
    });

    expect(code).toEqual(0);
    expect(error).toBe("");
    expect(clearStyle(output)).toContain(
      `🔥 Types were generated successfully 🔥`
    );

    rimraf.sync(`${getTestCaseDir(0)}/types`);
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

        let { exitCode, stdout, stderr } = await runCLI({
          args: ["codegen", ...cmdArgs],
          cwd: testCaseDir,
          cli: polywrapCli,
        });

        stdout = clearStyle(stdout);
        stderr = clearStyle(stderr);

        const expected = JSON.parse(
          fs.readFileSync(
            path.join(testCaseDir, "expected/output.json"),
            "utf-8"
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
