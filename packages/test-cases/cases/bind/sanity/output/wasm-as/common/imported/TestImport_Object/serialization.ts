import {
  Read,
  ReadDecoder,
  Write,
  WriteSizer,
  WriteEncoder,
  Nullable,
  BigInt,
  BigNumber,
  JSON,
  Context
} from "@web3api/wasm-as";
import { TestImport_Object } from "./";
import * as Types from "../..";

export function serializeTestImport_Object(type: TestImport_Object): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: TestImport_Object");
  const sizer = new WriteSizer(sizerContext);
  writeTestImport_Object(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: TestImport_Object");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writeTestImport_Object(encoder, type);
  return buffer;
}

export function writeTestImport_Object(writer: Write, type: TestImport_Object): void {
  writer.writeMapLength(12);
  writer.context().push("object", "Types.TestImport_AnotherObject", "writing property");
  writer.writeString("object");
  Types.TestImport_AnotherObject.write(writer, type.object);
  writer.context().pop();
  writer.context().push("optObject", "Types.TestImport_AnotherObject | null", "writing property");
  writer.writeString("optObject");
  if (type.optObject) {
    Types.TestImport_AnotherObject.write(writer, type.optObject as Types.TestImport_AnotherObject);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
  writer.context().push("objectArray", "Array<Types.TestImport_AnotherObject>", "writing property");
  writer.writeString("objectArray");
  writer.writeArray(type.objectArray, (writer: Write, item: Types.TestImport_AnotherObject): void => {
    Types.TestImport_AnotherObject.write(writer, item);
  });
  writer.context().pop();
  writer.context().push("optObjectArray", "Array<Types.TestImport_AnotherObject | null> | null", "writing property");
  writer.writeString("optObjectArray");
  writer.writeNullableArray(type.optObjectArray, (writer: Write, item: Types.TestImport_AnotherObject | null): void => {
    if (item) {
      Types.TestImport_AnotherObject.write(writer, item as Types.TestImport_AnotherObject);
    } else {
      writer.writeNil();
    }
  });
  writer.context().pop();
  writer.context().push("en", "Types.TestImport_Enum", "writing property");
  writer.writeString("en");
  writer.writeInt32(type.en);
  writer.context().pop();
  writer.context().push("optEnum", "Nullable<Types.TestImport_Enum>", "writing property");
  writer.writeString("optEnum");
  writer.writeNullableInt32(type.optEnum);
  writer.context().pop();
  writer.context().push("enumArray", "Array<Types.TestImport_Enum>", "writing property");
  writer.writeString("enumArray");
  writer.writeArray(type.enumArray, (writer: Write, item: Types.TestImport_Enum): void => {
    writer.writeInt32(item);
  });
  writer.context().pop();
  writer.context().push("optEnumArray", "Array<Nullable<Types.TestImport_Enum>> | null", "writing property");
  writer.writeString("optEnumArray");
  writer.writeNullableArray(type.optEnumArray, (writer: Write, item: Nullable<Types.TestImport_Enum>): void => {
    writer.writeNullableInt32(item);
  });
  writer.context().pop();
  writer.context().push("union", "Types.TestImport_Union", "writing property");
  writer.writeString("union");
  Types.TestImport_Union.write(writer, type.union);
  writer.context().pop();
  writer.context().push("optUnion", "Types.TestImport_Union | null", "writing property");
  writer.writeString("optUnion");
  if (type.optUnion) {
    Types.TestImport_Union.write(writer, type.optUnion as Types.TestImport_Union);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
  writer.context().push("unionArray", "Array<Types.TestImport_Union>", "writing property");
  writer.writeString("unionArray");
  writer.writeArray(type.unionArray, (writer: Write, item: Types.TestImport_Union): void => {
    Types.TestImport_Union.write(writer, item);
  });
  writer.context().pop();
  writer.context().push("optUnionArray", "Array<Types.TestImport_Union | null> | null", "writing property");
  writer.writeString("optUnionArray");
  writer.writeNullableArray(type.optUnionArray, (writer: Write, item: Types.TestImport_Union | null): void => {
    if (item) {
      Types.TestImport_Union.write(writer, item as Types.TestImport_Union);
    } else {
      writer.writeNil();
    }
  });
  writer.context().pop();
}

export function deserializeTestImport_Object(buffer: ArrayBuffer): TestImport_Object {
  const context: Context = new Context("Deserializing imported object-type TestImport_Object");
  const reader = new ReadDecoder(buffer, context);
  return readTestImport_Object(reader);
}

export function readTestImport_Object(reader: Read): TestImport_Object {
  let numFields = reader.readMapLength();

  let _object: Types.TestImport_AnotherObject | null = null;
  let _objectSet: bool = false;
  let _optObject: Types.TestImport_AnotherObject | null = null;
  let _objectArray: Array<Types.TestImport_AnotherObject> = [];
  let _objectArraySet: bool = false;
  let _optObjectArray: Array<Types.TestImport_AnotherObject | null> | null = null;
  let _en: Types.TestImport_Enum = 0;
  let _enSet: bool = false;
  let _optEnum: Nullable<Types.TestImport_Enum> = new Nullable<Types.TestImport_Enum>();
  let _enumArray: Array<Types.TestImport_Enum> = [];
  let _enumArraySet: bool = false;
  let _optEnumArray: Array<Nullable<Types.TestImport_Enum>> | null = null;
  let _union: Types.TestImport_Union | null = null;
  let _unionSet: bool = false;
  let _optUnion: Types.TestImport_Union | null = null;
  let _unionArray: Array<Types.TestImport_Union> = [];
  let _unionArraySet: bool = false;
  let _optUnionArray: Array<Types.TestImport_Union | null> | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "object") {
      reader.context().push(field, "Types.TestImport_AnotherObject", "type found, reading property");
      const object = Types.TestImport_AnotherObject.read(reader);
      _object = object;
      _objectSet = true;
      reader.context().pop();
    }
    else if (field == "optObject") {
      reader.context().push(field, "Types.TestImport_AnotherObject | null", "type found, reading property");
      let object: Types.TestImport_AnotherObject | null = null;
      if (!reader.isNextNil()) {
        object = Types.TestImport_AnotherObject.read(reader);
      }
      _optObject = object;
      reader.context().pop();
    }
    else if (field == "objectArray") {
      reader.context().push(field, "Array<Types.TestImport_AnotherObject>", "type found, reading property");
      _objectArray = reader.readArray((reader: Read): Types.TestImport_AnotherObject => {
        const object = Types.TestImport_AnotherObject.read(reader);
        return object;
      });
      _objectArraySet = true;
      reader.context().pop();
    }
    else if (field == "optObjectArray") {
      reader.context().push(field, "Array<Types.TestImport_AnotherObject | null> | null", "type found, reading property");
      _optObjectArray = reader.readNullableArray((reader: Read): Types.TestImport_AnotherObject | null => {
        let object: Types.TestImport_AnotherObject | null = null;
        if (!reader.isNextNil()) {
          object = Types.TestImport_AnotherObject.read(reader);
        }
        return object;
      });
      reader.context().pop();
    }
    else if (field == "en") {
      reader.context().push(field, "Types.TestImport_Enum", "type found, reading property");
      let value: Types.TestImport_Enum;
      if (reader.isNextString()) {
        value = Types.getTestImport_EnumValue(reader.readString());
      } else {
        value = reader.readInt32();
        Types.sanitizeTestImport_EnumValue(value);
      }
      _en = value;
      _enSet = true;
      reader.context().pop();
    }
    else if (field == "optEnum") {
      reader.context().push(field, "Nullable<Types.TestImport_Enum>", "type found, reading property");
      let value: Nullable<Types.TestImport_Enum>;
      if (!reader.isNextNil()) {
        if (reader.isNextString()) {
          value = Nullable.fromValue(
            Types.getTestImport_EnumValue(reader.readString())
          );
        } else {
          value = Nullable.fromValue(
            reader.readInt32()
          );
          Types.sanitizeTestImport_EnumValue(value.value);
        }
      } else {
        value = Nullable.fromNull<Types.TestImport_Enum>();
      }
      _optEnum = value;
      reader.context().pop();
    }
    else if (field == "enumArray") {
      reader.context().push(field, "Array<Types.TestImport_Enum>", "type found, reading property");
      _enumArray = reader.readArray((reader: Read): Types.TestImport_Enum => {
        let value: Types.TestImport_Enum;
        if (reader.isNextString()) {
          value = Types.getTestImport_EnumValue(reader.readString());
        } else {
          value = reader.readInt32();
          Types.sanitizeTestImport_EnumValue(value);
        }
        return value;
      });
      _enumArraySet = true;
      reader.context().pop();
    }
    else if (field == "optEnumArray") {
      reader.context().push(field, "Array<Nullable<Types.TestImport_Enum>> | null", "type found, reading property");
      _optEnumArray = reader.readNullableArray((reader: Read): Nullable<Types.TestImport_Enum> => {
        let value: Nullable<Types.TestImport_Enum>;
        if (!reader.isNextNil()) {
          if (reader.isNextString()) {
            value = Nullable.fromValue(
              Types.getTestImport_EnumValue(reader.readString())
            );
          } else {
            value = Nullable.fromValue(
              reader.readInt32()
            );
            Types.sanitizeTestImport_EnumValue(value.value);
          }
        } else {
          value = Nullable.fromNull<Types.TestImport_Enum>();
        }
        return value;
      });
      reader.context().pop();
    }
    else if (field == "union") {
      reader.context().push(field, "Types.TestImport_Union", "type found, reading property");
      const union = Types.TestImport_Union.read(reader);
      _union = union;
      _unionSet = true;
      reader.context().pop();
    }
    else if (field == "optUnion") {
      reader.context().push(field, "Types.TestImport_Union | null", "type found, reading property");
      let union: Types.TestImport_Union | null = null;
      if (!reader.isNextNil()) {
        union = Types.TestImport_Union.read(reader);
      }
      _optUnion = union;
      reader.context().pop();
    }
    else if (field == "unionArray") {
      reader.context().push(field, "Array<Types.TestImport_Union>", "type found, reading property");
      _unionArray = reader.readArray((reader: Read): Types.TestImport_Union => {
        const union = Types.TestImport_Union.read(reader);
        return union;
      });
      _unionArraySet = true;
      reader.context().pop();
    }
    else if (field == "optUnionArray") {
      reader.context().push(field, "Array<Types.TestImport_Union | null> | null", "type found, reading property");
      _optUnionArray = reader.readNullableArray((reader: Read): Types.TestImport_Union | null => {
        let union: Types.TestImport_Union | null = null;
        if (!reader.isNextNil()) {
          union = Types.TestImport_Union.read(reader);
        }
        return union;
      });
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_object || !_objectSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'object: TestImport_AnotherObject'"));
  }
  if (!_objectArraySet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'objectArray: [TestImport_AnotherObject]'"));
  }
  if (!_enSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'en: TestImport_Enum'"));
  }
  if (!_enumArraySet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'enumArray: [TestImport_Enum]'"));
  }
  if (!_union || !_unionSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'union: TestImport_Union'"));
  }
  if (!_unionArraySet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'unionArray: [TestImport_Union]'"));
  }

  return {
    object: _object,
    optObject: _optObject,
    objectArray: _objectArray,
    optObjectArray: _optObjectArray,
    en: _en,
    optEnum: _optEnum,
    enumArray: _enumArray,
    optEnumArray: _optEnumArray,
    union: _union,
    optUnion: _optUnion,
    unionArray: _unionArray,
    optUnionArray: _optUnionArray
  };
}
