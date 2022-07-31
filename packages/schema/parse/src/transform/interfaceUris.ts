import { AbiTransforms } from ".";
import { Abi, ModuleDefinition, ObjectDefinition } from "../abi";

export function interfaceUris(): AbiTransforms {
  const uniqueInterfaceUris: Record<string, boolean> = {};
  const uniqueModuleInterfaceTypes: Record<string, boolean> = {};
  const uniqueObjectInterfaceTypes: Record<string, boolean> = {};

  return {
    enter: {
      ModuleDefinition: (def: ModuleDefinition) => {
        for (const interfaceDef of def.interfaces) {
          uniqueModuleInterfaceTypes[interfaceDef.type] = true;
        }
        return def;
      },
      ObjectDefinition: (def: ObjectDefinition) => {
        for (const interfaceDef of def.interfaces) {
          uniqueObjectInterfaceTypes[interfaceDef.type] = true;
        }
        return def;
      },
    },
    leave: {
      Abi: (abi: Abi) => {
        for (const interfaceType of Object.keys(uniqueModuleInterfaceTypes)) {
          const importedInterface = abi.importedModuleTypes.find(
            (importedModule) => importedModule.type === interfaceType
          );

          if (importedInterface) {
            uniqueInterfaceUris[importedInterface.uri] = true;
          }
        }

        for (const interfaceType of Object.keys(uniqueObjectInterfaceTypes)) {
          const importedInterface = abi.importedObjectTypes.find(
            (importedObject) => importedObject.type === interfaceType
          );

          if (importedInterface) {
            uniqueInterfaceUris[importedInterface.uri] = true;
          }
        }

        return {
          ...abi,
          interfaceUris: Object.keys(uniqueInterfaceUris),
        };
      },
    },
  };
}
