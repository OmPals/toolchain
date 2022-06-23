import { runCommand } from "../system";

import fs from "fs";
import { InvokeResult } from "@polywrap/core-js";

const TMPDIR = process.env.TMPDIR || "/tmp";

export async function cueExists(): Promise<boolean> {
  try {
    const { stdout } = await runCommand("cue version");
    return stdout.startsWith("cue version ");
  } catch (e) {
    return false;
  }
}

export async function validateOutput(
  id: string,
  result: InvokeResult,
  validateScriptPath: string
): Promise<void> {
  const index = id.lastIndexOf(".");
  const jobId = id.substring(0, index);
  const stepId = id.substring(index + 1);

  const selector = `${jobId}.\\$${stepId}`;
  const jsonOutput = `${TMPDIR}/${id}.json`;

  await fs.promises.writeFile(jsonOutput, JSON.stringify(result, null, 2));

  try {
    await runCommand(
      `cue vet -d ${selector} ${validateScriptPath} ${jsonOutput}`
    );
  } catch (e) {
    console.error(e.message);
    console.log("-----------------------------------");
    process.exitCode = 1;
  }

  if (fs.existsSync(jsonOutput)) {
    await fs.promises.unlink(jsonOutput);
  }
}
