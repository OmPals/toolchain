import { OutputDirectory, OutputEntry } from "../../";
import { readDirectory } from "../../utils/fs";
import * as Functions from "./functions";
import * as Transforms from "./transforms";

import {
  transformTypeInfo,
  extendType,
  addFirstLast,
  toPrefixedGraphQLType,
  hasImports,
  TypeInfo,
} from "@web3api/schema-parse";
import path from "path";
import Mustache from "mustache";

export function generateBinding(typeInfo: TypeInfo): OutputDirectory {
  const entries: OutputEntry[] = [];

  // Transform the TypeInfo to our liking
  const transforms = [
    extendType(Functions),
    addFirstLast,
    toPrefixedGraphQLType,
    hasImports,
    Transforms.propertyDeps(),
    Transforms.byRef(),
    Transforms.queryPointer(),
  ];

  for (const transform of transforms) {
    typeInfo = transformTypeInfo(typeInfo, transform);
  }

  const templatesDir = path.join(__dirname, "./templates");
  const directory = readDirectory(templatesDir);
  const subTemplates = loadSubTemplates(directory.entries);

  // Generate object type folders
  for (const objectType of typeInfo.objectTypes) {
    entries.push({
      type: "Directory",
      name: Functions.toLower()(objectType.type, (str) => str),
      data: generateFiles("./templates/object-type", objectType, subTemplates),
    });
  }

  // Generate imported folder
  if (
    typeInfo.importedModuleTypes.length > 0 ||
    typeInfo.importedObjectTypes.length > 0
  ) {
    const importEntries: OutputEntry[] = [];

    // Generate imported query type folders
    for (const importedQueryType of typeInfo.importedModuleTypes) {
      importEntries.push({
        type: "Directory",
        name: Functions.toLower()(importedQueryType.type, (str) => str),
        data: generateFiles(
          "./templates/imported/query-type",
          importedQueryType,
          subTemplates
        ),
      });
    }

    // Generate imported enum type folders
    for (const importedEnumType of typeInfo.importedEnumTypes) {
      importEntries.push({
        type: "Directory",
        name: Functions.toLower()(importedEnumType.type, (str) => str),
        data: generateFiles(
          "./templates/imported/enum-type",
          importedEnumType,
          subTemplates
        ),
      });
    }

    // Generate imported object type folders
    for (const importedObectType of typeInfo.importedObjectTypes) {
      importEntries.push({
        type: "Directory",
        name: Functions.toLower()(importedObectType.type, (str) => str),
        data: generateFiles(
          "./templates/imported/object-type",
          importedObectType,
          subTemplates
        ),
      });
    }

    entries.push({
      type: "Directory",
      name: "imported",
      data: [
        ...importEntries,
        ...generateFiles("./templates/imported", typeInfo, subTemplates),
      ],
    });
  }

  // Generate interface type folders
  for (const interfaceType of typeInfo.interfaceTypes) {
    entries.push({
      type: "Directory",
      name: Functions.toLower()(interfaceType.type, (str) => str),
      data: generateFiles(
        "./templates/interface-type",
        interfaceType,
        subTemplates
      ),
    });
  }

  // Generate query type folders
  for (const queryType of typeInfo.moduleTypes) {
    entries.push({
      type: "Directory",
      name: Functions.toLower()(queryType.type, (str) => str),
      data: generateFiles("./templates/query-type", queryType, subTemplates),
    });
  }

  // Generate enum type folders
  for (const enumType of typeInfo.enumTypes) {
    entries.push({
      type: "Directory",
      name: Functions.toLower()(enumType.type, (str) => str),
      data: generateFiles("./templates/enum-type", enumType, subTemplates),
    });
  }

  // Generate root entry file
  entries.push(...generateFiles("./templates", typeInfo, subTemplates));

  return {
    entries,
  };
}

function generateFiles(
  subpath: string,
  config: unknown,
  subTemplates: Record<string, string>,
  subDirectories = false
): OutputEntry[] {
  const output: OutputEntry[] = [];
  const absolutePath = path.join(__dirname, subpath);
  const directory = readDirectory(absolutePath);

  const processDirectory = (entries: OutputEntry[], output: OutputEntry[]) => {
    subTemplates = loadSubTemplates(entries, subTemplates);

    // Generate all files, recurse all directories
    for (const dirent of entries) {
      if (dirent.type === "File") {
        const name = path.parse(dirent.name).name;

        // file templates don't contain '_'
        if (name.indexOf("_") === -1) {
          const data = Mustache.render(dirent.data, config, subTemplates);

          // If the file isn't empty, add it to the output
          if (data) {
            output.push({
              type: "File",
              name: Functions.toLower()(name.replace("-", "."), (str) => str),
              data,
            });
          }
        }
      } else if (dirent.type === "Directory" && subDirectories) {
        const subOutput: OutputEntry[] = [];

        processDirectory(dirent.data as OutputEntry[], subOutput);

        output.push({
          type: "Directory",
          name: Functions.toLower()(dirent.name, (str) => str),
          data: subOutput,
        });
      }
    }
  };

  processDirectory(directory.entries, output);

  return output;
}

function loadSubTemplates(
  entries: OutputEntry[],
  existingSubTemplates?: Record<string, string>
): Record<string, string> {
  const subTemplates: Record<string, string> = existingSubTemplates
    ? existingSubTemplates
    : {};

  for (const file of entries) {
    if (file.type !== "File") {
      continue;
    }

    const name = path.parse(file.name).name;

    // sub-templates contain '_' in their file names
    if (name.indexOf("_") > -1) {
      subTemplates[name] = file.data as string;
    }
  }

  return subTemplates;
}
