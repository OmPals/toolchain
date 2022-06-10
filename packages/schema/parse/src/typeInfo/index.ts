import {
  ObjectDefinition,
  ModuleDefinition,
  ImportedModuleDefinition,
  ImportedObjectDefinition,
  GenericDefinition,
  EnumDefinition,
  ImportedEnumDefinition,
  InterfaceDefinition,
  CapabilityType,
  CapabilityDefinition,
  EnvDefinition,
  createEnvDefinition,
  createModuleDefinition,
} from "./definitions";

export * from "./definitions";
export * from "./scalar";
export * from "./module";
export * from "./env";
export * from "./map";

export interface TypeInfo {
  objectTypes: ObjectDefinition[];
  moduleType: ModuleDefinition;
  enumTypes: EnumDefinition[];
  interfaceTypes: InterfaceDefinition[];
  importedObjectTypes: ImportedObjectDefinition[];
  importedModuleTypes: ImportedModuleDefinition[];
  importedEnumTypes: ImportedEnumDefinition[];
  envType: EnvDefinition;
}

export function createTypeInfo(): TypeInfo {
  return {
    objectTypes: [],
    enumTypes: [],
    moduleType: createModuleDefinition(),
    interfaceTypes: [],
    importedObjectTypes: [],
    importedModuleTypes: [],
    importedEnumTypes: [],
    envType: createEnvDefinition({}),
  };
}

type ImportedDefinition = ImportedObjectDefinition | ImportedModuleDefinition;

export function combineTypeInfo(typeInfos: TypeInfo[]): TypeInfo {
  const combined: TypeInfo = {
    objectTypes: [],
    moduleType: createModuleDefinition(),
    enumTypes: [],
    interfaceTypes: [],
    importedObjectTypes: [],
    importedModuleTypes: [],
    importedEnumTypes: [],
    envType: createEnvDefinition({}),
  };

  const compareImportedType = (
    a: ImportedDefinition,
    b: ImportedDefinition
  ) => {
    return a.uri === b.uri && a.nativeType === b.nativeType;
  };

  for (const typeInfo of typeInfos) {
    for (const enumType of typeInfo.enumTypes) {
      tryInsert(combined.enumTypes, enumType);
    }

    for (const objectType of typeInfo.objectTypes) {
      tryInsert(combined.objectTypes, objectType);
    }

    combined.moduleType = typeInfo.moduleType;

    for (const interfaceType of typeInfo.interfaceTypes) {
      tryInsert(
        combined.interfaceTypes,
        interfaceType,
        compareImportedType,
        (
          a: InterfaceDefinition,
          b: InterfaceDefinition
        ): InterfaceDefinition => {
          const combinedCapabilities: CapabilityDefinition = {
            ...a.capabilities,
            ...b.capabilities,
          };
          const combinedCapabilityTypes = Object.keys(
            combinedCapabilities
          ) as CapabilityType[];
          for (const capability of combinedCapabilityTypes) {
            if (b.capabilities[capability] && a.capabilities[capability]) {
              combinedCapabilities[capability] = {
                enabled: true,
              };
            } else if (a.capabilities[capability]) {
              combinedCapabilities[capability] = a.capabilities[capability];
            } else if (b.capabilities[capability]) {
              combinedCapabilities[capability] = b.capabilities[capability];
            }
          }
          return { ...a, capabilities: combinedCapabilities };
        }
      );
    }

    for (const importedObjectType of typeInfo.importedObjectTypes) {
      tryInsert(
        combined.importedObjectTypes,
        importedObjectType,
        compareImportedType
      );
    }

    for (const importedModuleType of typeInfo.importedModuleTypes) {
      tryInsert(
        combined.importedModuleTypes,
        importedModuleType,
        compareImportedType,
        (a: ImportedModuleDefinition, b: ImportedModuleDefinition) => {
          return { ...a, isInterface: a.isInterface || b.isInterface };
        }
      );
    }

    for (const importedEnumType of typeInfo.importedEnumTypes) {
      tryInsert(combined.importedEnumTypes, importedEnumType);
    }

    if (typeInfo.envType.client) {
      combined.envType.client = typeInfo.envType.client;
    }

    if (typeInfo.envType.sanitized) {
      combined.envType.sanitized = typeInfo.envType.sanitized;
    }
  }

  return combined;
}

const tryInsert = (
  dest: GenericDefinition[],
  value: GenericDefinition,
  compare: (a: GenericDefinition, b: GenericDefinition) => boolean = (a, b) =>
    a.type === b.type,
  join?: (
    dest: GenericDefinition,
    source: GenericDefinition
  ) => GenericDefinition
) => {
  const index = dest.findIndex((item: GenericDefinition) =>
    compare(item, value)
  );

  if (index > -1) {
    if (join) {
      dest[index] = join(dest[index], value);
      return;
    }

    const destType = JSON.stringify(dest[index]);
    const valueType = JSON.stringify(value);
    if (destType !== valueType) {
      throw Error(
        `combineTypeInfo found two types by the same type that are not equivalent.\n` +
          `Type: "${value.type}"\nObject A: ${destType}\nObject B: ${valueType}`
      );
    }
  } else {
    dest.push(value);
  }
};
