/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/index-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/index-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */

import {
  BuildManifest as BuildManifest_0_1_0,
} from "./0.1.0";

export {
  BuildManifest_0_1_0,
};

export enum BuildManifestFormats {
  // NOTE: Patch fix for backwards compatability
  "v0.1" = "0.1",
  "v0.1.0" = "0.1.0",
}

export type AnyBuildManifest =
  | BuildManifest_0_1_0



export type BuildManifest = BuildManifest_0_1_0;

export const latestBuildManifestFormat = BuildManifestFormats["v0.1.0"]

export { migrateBuildManifest } from "./migrate";

export { deserializeBuildManifest } from "./deserialize";

export { validateBuildManifest } from "./validate";
