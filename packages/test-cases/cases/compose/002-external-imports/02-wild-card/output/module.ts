import {
  createMethodDefinition,
  createModuleDefinition,
  createObjectPropertyDefinition,
  createImportedObjectDefinition,
  createScalarPropertyDefinition,
  createTypeInfo,
  TypeInfo,
} from "@web3api/schema-parse";

export const typeInfo: TypeInfo = {
  ...createTypeInfo(),
  objectTypes: [
  ],
  moduleType:
    {
      ...createModuleDefinition({}),
      imports: [
        { type: "Namespace_ExternalType" },
        { type: "Namespace_ExternalType2" },
      ],
      interfaces: [],
      methods: [
        {
          ...createMethodDefinition({
            name: "method",
            return: createObjectPropertyDefinition({
              name: "method",
              type: "Namespace_ExternalType",
            }),
          }),
          arguments: [
          ],
        },
      ],
    },
  enumTypes: [],
  importedObjectTypes: [
    {
      ...createImportedObjectDefinition({
        uri: "external.eth",
        namespace: "Namespace",
        nativeType: "ExternalType",
        type: "Namespace_ExternalType"
      }),
      properties: [
        createScalarPropertyDefinition({
          name: "str",
          type: "String"
        })
      ],
    },
    {
      ...createImportedObjectDefinition({
        uri: "external.eth",
        namespace: "Namespace",
        nativeType: "ExternalType2",
        type: "Namespace_ExternalType2"
      }),
      properties: [
        createScalarPropertyDefinition({
          name: "foo",
          type: "UInt32"
        })
      ],
    },
  ],
};
