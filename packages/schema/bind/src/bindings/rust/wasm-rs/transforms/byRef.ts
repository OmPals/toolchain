import { TypeInfoTransforms, AnyDefinition } from "@web3api/schema-parse";

export function byRef(): TypeInfoTransforms {
  return {
    enter: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      AnyDefinition: (def: AnyDefinition) => {
        const byRefScalars = ["String", "BigInt", "BigNumber", "Map", "Bytes"];

        if (def.scalar) {
          if (byRefScalars.indexOf(def.scalar.type) > -1 || !def.required) {
            return {
              ...def,
              byRef: true,
            };
          }
        }

        return def;
      },
    },
  };
}
