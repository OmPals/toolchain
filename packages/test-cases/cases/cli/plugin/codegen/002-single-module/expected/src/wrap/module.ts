/// NOTE: This is an auto-generated file.
///       All modifications will be overwritten.

import * as Types from "./types";

import {
  Client,
  PluginModule,
  MaybeAsync
} from "@polywrap/core-js";

export interface Input_method extends Record<string, unknown> {
  str: Types.String;
  optStr?: Types.String | null;
}

export abstract class Module<
  TConfig
> extends PluginModule<
  TConfig,
  Types.Env
> {

  abstract method(
    input: Input_method,
    client: Client
  ): MaybeAsync<Types.Object>;
}
