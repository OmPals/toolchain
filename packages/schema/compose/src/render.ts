import { template as schemaTemplate } from "./templates/schema.mustache";
import { addHeader } from "./templates/header.mustache";

import Mustache from "mustache";
import {
  Abi,
  addFirstLast,
  toGraphQLType,
  transformAbi,
  moduleCapabilities,
  addAnnotations,
} from "@polywrap/schema-parse";

// Remove mustache's built-in HTML escaping
Mustache.escape = (value) => value;

export function renderSchema(abi: Abi, header: boolean): string {
  // Prepare the Abi for the renderer
  abi = transformAbi(abi, addFirstLast);
  abi = transformAbi(abi, toGraphQLType);
  abi = transformAbi(abi, moduleCapabilities());
  abi = transformAbi(abi, addAnnotations);

  let schema = Mustache.render(schemaTemplate, {
    abi,
  });

  if (header) {
    schema = addHeader(schema);
  }

  // Remove needless whitespace
  return schema.replace(/[\n]{2,}/gm, "\n\n");
}
