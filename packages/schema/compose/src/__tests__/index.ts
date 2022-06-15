import { ComposerOutput, ComposerOptions, ComposerFilter } from "..";

import path from "path";
import { readdirSync, Dirent } from "fs";

import { TypeInfo } from "@web3api/schema-parse";
import {
  GetPathToComposeTestFiles,
  readFileIfExists,
  readNamedExportIfExists,
} from "@web3api/test-cases"

const root = GetPathToComposeTestFiles();

export interface TestCase {
  name: string;
  input: ComposerOptions;
  output?: ComposerOutput;
  error?: string;
}

type TestCases = {
  promise: Promise<TestCase | undefined>;
  name: string;
}[];

export function fetchTestCases(): TestCases {
  const testCases: TestCases = [];

  readdirSync(root, { withFileTypes: true }).forEach(
    (dirent: Dirent) => {
      buildTestCases(
        path.join(root, dirent.name),
        dirent.name,
        testCases
      );
    }
  );

  return testCases;
}

function buildTestCases(
  directory: string,
  name: string,
  testCases: TestCases
): void {
  const items = readdirSync(directory, { withFileTypes: true });

  if (
    items.some(x => x.name.startsWith("input")) &&
    items.some(x => x.name.startsWith("output"))
  ) {
    testCases.push({
      promise: importCase(directory, name),
      name: name
    });
  } else {
    for (const item of items) {
      buildTestCases(
        path.join(directory, item.name),
        name + " " + item.name,
        testCases
      );
    }
  }
}

async function importCase(
  directory: string,
  name: string,
): Promise<TestCase | undefined> {
  // Fetch the input schemas
  const moduleInput = readFileIfExists("input/module.graphql", directory);

  // Fetch the output schemas
  const moduleSchema = readFileIfExists("output/module.graphql", directory);
  const ModuleTypeInfo = await readNamedExportIfExists<TypeInfo>("typeInfo", "output/module.ts", directory);

  // Fetch the error if exists
  const outputJson = readFileIfExists("output/output.json", directory)

  const resolveExternal = (uri: string): Promise<string> => {
    return Promise.resolve(readFileIfExists(`imports-ext/${uri}/schema.graphql`, directory) || "");
  };

  const resolveLocal = (path: string): Promise<string> => {
    return Promise.resolve(readFileIfExists(path, directory, true) || "");
  };

  const input: ComposerOptions = {
    schemas: [],
    resolvers: {
      external: resolveExternal,
      local: resolveLocal,
    },
    output: ComposerFilter.All
  };

  if (moduleInput) {
    input.schemas.push({
      schema: moduleInput,
      absolutePath: path.join(
        directory,
        "input/module.graphql"
      ),
    });
  }

  let output: ComposerOutput = { };

  if (outputJson) {
    const parsedOutput = JSON.parse(outputJson);

    if (parsedOutput.error) {
      return {
        name,
        input,
        error: parsedOutput.error,
      }
    }
  }

  if (moduleSchema && ModuleTypeInfo) {
    output = {
      schema: moduleSchema,
      typeInfo: ModuleTypeInfo
    };
  }

  return {
    name,
    input,
    output,
  };
}
