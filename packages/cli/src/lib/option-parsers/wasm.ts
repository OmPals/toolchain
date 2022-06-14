import { intlMsg } from "../intl";
import { defaultWeb3ApiManifest } from "../manifest";
import { resolvePathIfExists } from "../system";

export function parseWasmManifestFileOption(
  manifestFile: string | undefined,
  _: unknown
): string {
  const manifestPaths = manifestFile
    ? [manifestFile as string]
    : defaultWeb3ApiManifest;

  manifestFile = resolvePathIfExists(manifestPaths);

  if (!manifestFile) {
    console.error(
      intlMsg.commands_build_error_manifestNotFound({
        paths: manifestPaths.join(", "),
      })
    );
    process.exit(1);
  }

  return manifestFile;
}

export function defaultWasmManifestFileOption(): string {
  return parseWasmManifestFileOption(undefined, undefined);
}
