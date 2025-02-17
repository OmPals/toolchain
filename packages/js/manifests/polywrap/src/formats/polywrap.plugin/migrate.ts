/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/migrate-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/migrate-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */
import {
  AnyPluginManifest,
  PluginManifest,
  PluginManifestFormats,
  latestPluginManifestFormat
} from ".";

import {
  migrate as migrate_0_1_0_to_0_2_0
} from "./migrators/0.1.0_to_0.2.0";

type Migrator = {
  [key in PluginManifestFormats]?: (m: AnyPluginManifest) => PluginManifest;
};

export const migrators: Migrator = {
  "0.1.0": migrate_0_1_0_to_0_2_0,
};

export function migratePluginManifest(
  manifest: AnyPluginManifest,
  to: PluginManifestFormats
): PluginManifest {
  let from = manifest.format as PluginManifestFormats;

  // HACK: Patch fix for backwards compatability
  if(from === "0.1" && ("0.1.0" in migrators)) {
    from = "0.1.0" as PluginManifestFormats;
  }

  if (from === latestPluginManifestFormat) {
    return manifest as PluginManifest;
  }

  if (!(Object.values(PluginManifestFormats).some(x => x === from))) {
    throw new Error(`Unrecognized PluginManifestFormat "${manifest.format}"`);
  }

  const migrator = migrators[from];
  if (!migrator) {
    throw new Error(
      `Migrator from PluginManifestFormat "${from}" to "${to}" is not available`
    );
  }

  return migrator(manifest);
}
