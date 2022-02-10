import {
  createMethodDefinition,
  createQueryDefinition,
  createScalarPropertyDefinition,
  createObjectDefinition,
  createTypeInfo,
  createEnvDefinition,
  AnyDefinition,
  TypeInfo,
} from "@web3api/schema-parse";

export const typeInfo: TypeInfo = {
  ...createTypeInfo(),
  envTypes: {
    query: createEnvDefinition({
      sanitized: {
        ...createObjectDefinition({
          type: "QueryEnv"
        }),
        properties: [
          {
            ...createScalarPropertyDefinition({ name: "prop", type: "String", required: true }),
            first: true,
            last: true,
          } as AnyDefinition,
        ],
      },
    }),
    mutation: createEnvDefinition({}),
  },
  queryTypes: [
    {
      ...createQueryDefinition({ type: "Query" }),
      methods: [
        {
          ...createMethodDefinition({
            type: "query",
            name: "method",
            return: createScalarPropertyDefinition({
              name: "method",
              type: "String",
              required: true
            })
          }),
          arguments: [
            createScalarPropertyDefinition({
              name: "str",
              required: true,
              type: "String"
            }),
          ]
        },
      ]
    }
  ],
}
