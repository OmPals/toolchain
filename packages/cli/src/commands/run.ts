import { Command, Program } from "./types";
import {
  intlMsg,
  parseClientConfigOption,
  parseValidateScriptOption,
  parseWorkflowOutputFilePathOption,
  validateOutput,
} from "../lib";

import { Workflow, JobResult, JobStatus } from "@polywrap/core-js";
import { PolywrapClient, PolywrapClientConfig } from "@polywrap/client-js";
import path from "path";
import yaml from "js-yaml";
import fs from "fs";

type WorkflowCommandOptions = {
  clientConfig: Partial<PolywrapClientConfig>;
  jobs?: string[];
  validateScript?: string;
  outputFile?: string;
  quiet?: boolean;
};

export const run: Command = {
  setup: (program: Program) => {
    program
      .command("run")
      .alias("r")
      .description(intlMsg.commands_run_description())
      .argument(
        `<${intlMsg.commands_run_options_workflow()}>`,
        intlMsg.commands_run_options_workflowScript()
      )
      .option(
        `-c, --client-config <${intlMsg.commands_common_options_configPath()}>`,
        `${intlMsg.commands_common_options_config()}`
      )
      .option(
        `-v, --validate-script <${intlMsg.commands_run_options_validate()}>`,
        `${intlMsg.commands_run_options_validateScript()}`
      )
      .option(
        `-o, --output-file <${intlMsg.commands_run_options_outputFilePath()}>`,
        `${intlMsg.commands_run_options_outputFile()}`
      )
      .option(
        `-j, --jobs <${intlMsg.commands_run_options_jobIds()}...>`,
        intlMsg.commands_run_options_jobs()
      )
      .option(`-q, --quiet`, `${intlMsg.commands_run_options_quiet()}`)
      .action(async (workflow: string, options) => {
        await _run(workflow, {
          ...options,
          clientConfig: await parseClientConfigOption(
            options.clientConfig,
            undefined
          ),
          outputFile: options.outputFile
            ? parseWorkflowOutputFilePathOption(options.outputFile, undefined)
            : undefined,
          validateScript: options.validateScript
            ? parseValidateScriptOption(options.validateScript, undefined)
            : undefined,
        });
      });
  },
};

const _run = async (workflowPath: string, options: WorkflowCommandOptions) => {
  const { clientConfig, outputFile, validateScript, quiet, jobs } = options;
  const client = new PolywrapClient(clientConfig);

  function getParser(path: string) {
    return path.endsWith(".yaml") || path.endsWith(".yml")
      ? yaml.load
      : JSON.parse;
  }

  const workflow: Workflow = getParser(workflowPath)(
    fs.readFileSync(workflowPath).toString()
  );
  const workflowOutput: (JobResult & { id: string })[] = [];

  await client.run({
    workflow,
    config: clientConfig,
    ids: jobs,
    onExecution: async (id: string, jobResult: JobResult) => {
      const { data, error, status } = jobResult;

      if (!quiet) {
        console.log("-----------------------------------");
        console.log(`ID: ${id}`);
        console.log(`Status: ${status}`);
      }

      if (!quiet && data !== undefined) {
        console.log(`Data: ${JSON.stringify(data, null, 2)}`);
      }

      if (!quiet && error !== undefined) {
        console.log(`Error: ${error.message}`);
        process.exitCode = 1;
      }

      if (status !== JobStatus.SKIPPED && validateScript) {
        await validateOutput(id, { data, error }, validateScript, quiet);
      }

      if (!quiet) {
        console.log("-----------------------------------");
      }

      workflowOutput.push({ id, status, data, error });
    },
  });

  if (outputFile) {
    const outputFileExt = path.extname(outputFile).substring(1);
    if (!outputFileExt) throw new Error("Require output file extension");
    switch (outputFileExt) {
      case "yaml":
      case "yml":
        fs.writeFileSync(outputFile, yaml.dump(workflowOutput));
        break;
      case "json":
        fs.writeFileSync(outputFile, JSON.stringify(workflowOutput, null, 2));
        break;
      default:
        throw new Error(
          intlMsg.commands_run_error_unsupportedOutputFileExt({ outputFileExt })
        );
    }
  }
};
