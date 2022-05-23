import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeCustomUnion,
  deserializeCustomUnion,
  writeCustomUnion,
  readCustomUnion
} from "./serialization";
import * as Types from "..";

export abstract class CustomUnion {

  static toBuffer(type: CustomUnion): ArrayBuffer {
    return serializeCustomUnion(type);
  }

  static fromBuffer(buffer: ArrayBuffer): CustomUnion {
    return deserializeCustomUnion(buffer);
  }

  static write(writer: Write, type: CustomUnion): void {
    writeCustomUnion(writer, type);
  }

  static read(reader: Read): CustomUnion {
    return readCustomUnion(reader);
  }

  get isAnotherObject(): boolean {
    return this instanceof UnionMember_AnotherObject;
  }

  get AnotherObject(): Types.AnotherObject {
    if (this instanceof UnionMember_AnotherObject) {
      return (this as UnionMember_AnotherObject).instance;
    }

    throw new Error("Union 'CustomUnion' is not of type 'AnotherObject'");
  }

  get isYetAnotherObject(): boolean {
    return this instanceof UnionMember_YetAnotherObject;
  }

  get YetAnotherObject(): Types.YetAnotherObject {
    if (this instanceof UnionMember_YetAnotherObject) {
      return (this as UnionMember_YetAnotherObject).instance;
    }

    throw new Error("Union 'CustomUnion' is not of type 'YetAnotherObject'");
  }

  static create<T>(value: T): CustomUnion {
    if (value instanceof Types.AnotherObject) {
      return new UnionMember_AnotherObject(value);
    }
    if (value instanceof Types.YetAnotherObject) {
      return new UnionMember_YetAnotherObject(value);
    }

    throw new Error("Value does not correspond to any CustomUnion member type");
  }
}

class UnionMember_AnotherObject extends CustomUnion {
  constructor(private _instance: Types.AnotherObject) {
    super();
  }

  get instance(): Types.AnotherObject {
    return this._instance;
  }
}

class UnionMember_YetAnotherObject extends CustomUnion {
  constructor(private _instance: Types.YetAnotherObject) {
    super();
  }

  get instance(): Types.YetAnotherObject {
    return this._instance;
  }
}

