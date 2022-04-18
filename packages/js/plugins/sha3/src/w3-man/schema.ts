/// NOTE: This is an auto-generated file.
///       All modifications will be overwritten.

export const schema: string = `### Web3API Header START ###
scalar UInt
scalar UInt8
scalar UInt16
scalar UInt32
scalar Int
scalar Int8
scalar Int16
scalar Int32
scalar Bytes
scalar BigInt
scalar JSON

directive @imported(
  uri: String!
  namespace: String!
  nativeType: String!
) on OBJECT | ENUM

directive @imports(
  types: [String!]!
) on OBJECT

directive @capability(
  type: String!
  uri: String!
  namespace: String!
) repeatable on OBJECT

directive @enabled_interface on OBJECT
### Web3API Header END ###

type Query {
  sha3_512(
    message: String!
  ): String!

  sha3_384(
    message: String!
  ): String!

  sha3_256(
    message: String!
  ): String!

  sha3_224(
    message: String!
  ): String!

  keccak_512(
    message: String!
  ): String!

  keccak_384(
    message: String!
  ): String!

  keccak_256(
    message: String!
  ): String!

  keccak_224(
    message: String!
  ): String!

  hex_keccak_256(
    message: String!
  ): String!

  buffer_keccak_256(
    message: Bytes!
  ): String!

  shake_128(
    message: String!
    outputBits: Int!
  ): String!

  shake_256(
    message: String!
    outputBits: Int!
  ): String!
}

### Imported Queries START ###

### Imported Queries END ###

### Imported Objects START ###

### Imported Objects END ###
`;
