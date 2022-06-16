import {
  QueryEnv
} from "./QueryEnv";

export let env: QueryEnv | null = null;

export function requireEnv(): QueryEnv {
  if (env == null) throw new Error("Undefined query env");
  return env as QueryEnv;
}
