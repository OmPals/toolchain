/* eslint-disable @typescript-eslint/naming-convention */
/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface BuildManifest {
  /**
   * Polywrap build manifest format version.
   */
  format: "0.1.0" | "0.1";
  docker?: {
    /**
     * Docker image name.
     */
    name?: string;
    /**
     * Docker image file name.
     */
    dockerfile?: string;
    /**
     * Configuration options for Docker Buildx, set to true for default value.
     */
    buildx?:
      | {
          /**
           * Path to cache directory, set to true for default value, set to false to disable caching.
           */
          cache?: string | boolean;
          /**
           * Remove the builder instance.
           */
          removeBuilder?: boolean;
        }
      | boolean;
    /**
     * Remove the image.
     */
    removeImage?: boolean;
  };
  /**
   * Custom build image configurations.
   */
  config?: {
    [k: string]: unknown;
  };
  /**
   * Locally linked packages into docker build image.
   */
  linked_packages?: {
    /**
     * Package name.
     */
    name: string;
    /**
     * Path to linked package directory.
     */
    path: string;
    /**
     * Ignore files matching this regex in linked package directory.
     */
    filter?: string;
  }[];
  __type: "BuildManifest";
}
