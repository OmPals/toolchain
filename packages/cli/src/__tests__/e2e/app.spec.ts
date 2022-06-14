import { clearStyle, w3Cli } from "./utils";

import { runCLI } from "@web3api/test-env-js";
import { GetPathToCliTestFiles } from "@web3api/test-cases";
import path from "path";
import fs from "fs";


const HELP = `Usage: w3 app|a [options] [command]

Build/generate types for your app

Options:
  -h, --help         display help for command

Commands:
  codegen [options]  Generate code for the app
  help [command]     display help for command
`

const CODEGEN_SUCCESS = `- Manifest loaded from ./web3api.app.yaml
✔ Manifest loaded from ./web3api.app.yaml
- Generate types
✔ Generate types
🔥 Code was generated successfully 🔥
`;

describe("e2e tests for app command", () => {
  const testCaseRoot = path.join(GetPathToCliTestFiles(), "app/codegen");
  const testCases =
    fs.readdirSync(testCaseRoot, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  const getTestCaseDir = (index: number) =>
    path.join(testCaseRoot, testCases[index]);

  test("Should show help text", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI(
      {
        args: ["app", "--help"],
        cwd: getTestCaseDir(0),
        cli: w3Cli,
      },
    );

    expect(code).toEqual(0);
    expect(error).toBe("");
    expect(clearStyle(output)).toEqual(HELP);
  });

  test("Should throw error for invalid params - no command", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI(
      {
        args: ["app", "--output-dir"],
        cwd: getTestCaseDir(0),
        cli: w3Cli,
      },
    );

    expect(code).toEqual(1);
    expect(error).toBe("error: unknown option '--output-dir'\n");
    expect(output).toEqual(``);
  });

  test("Should throw error for invalid params - codegen-dir", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI(
      {
        args: ["app", "codegen", "--codegen-dir"],
        cwd: getTestCaseDir(0),
        cli: w3Cli,
      },
    );

    expect(code).toEqual(1);
    expect(error).toBe(`error: option '-c, --codegen-dir <path>' argument missing\n`);
    expect(output).toEqual(``);
  });

  test("Should throw error for invalid params - ens", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI(
      {
        args: ["app", "codegen", "--ens"],
        cwd: getTestCaseDir(0),
        cli: w3Cli,
      },
    );

    expect(code).toEqual(1);
    expect(error).toBe("error: option '-e, --ens [<address>]' argument missing\n");
    expect(output)
      .toEqual(``);
  });

  describe("test-cases", () => {
    for (let i = 0; i < testCases.length; ++i) {
      const testCaseName = testCases[i];
      const testCaseDir = getTestCaseDir(i);

      test(testCaseName, async () => {
        const { exitCode: code, stdout: output, stderr: error } = await runCLI(
          {
            args: ["app", "codegen"],
            cwd: testCaseDir,
            cli: w3Cli,
          },
        );

        expect(error).toBe("");
        expect(code).toEqual(0);
        expect(clearStyle(output)).toEqual(CODEGEN_SUCCESS);
      });
    }
  });
});
