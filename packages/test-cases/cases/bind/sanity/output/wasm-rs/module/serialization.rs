use serde::{Serialize, Deserialize};
use std::convert::TryFrom;
use polywrap_wasm_rs::{
    BigInt,
    BigNumber,
    Map,
    Context,
    DecodeError,
    EncodeError,
    Read,
    ReadDecoder,
    Write,
    WriteEncoder,
    JSON,
};

use crate::{
    CustomEnum,
    get_custom_enum_value,
    sanitize_custom_enum_value
};
use crate::AnotherType;
use crate::Else;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ArgsModuleMethod {
    pub str: String,
    pub opt_str: Option<String>,
    pub en: CustomEnum,
    pub opt_enum: Option<CustomEnum>,
    pub enum_array: Vec<CustomEnum>,
    pub opt_enum_array: Option<Vec<Option<CustomEnum>>>,
    pub map: Map<String, i32>,
    pub map_of_arr: Map<String, Vec<i32>>,
    pub map_of_map: Map<String, Map<String, i32>>,
    pub map_of_obj: Map<String, AnotherType>,
    pub map_of_arr_of_obj: Map<String, Vec<AnotherType>>,
}

pub fn deserialize_module_method_args(args: &[u8]) -> Result<ArgsModuleMethod, DecodeError> {
    let mut context = Context::new();
    context.description = "Deserializing module-type: module_method".to_string();

    let mut reader = ReadDecoder::new(args, context);
    let mut num_of_fields = reader.read_map_length()?;

    let mut _str: String = String::new();
    let mut _str_set = false;
    let mut _opt_str: Option<String> = None;
    let mut _en: CustomEnum = CustomEnum::_MAX_;
    let mut _en_set = false;
    let mut _opt_enum: Option<CustomEnum> = None;
    let mut _enum_array: Vec<CustomEnum> = vec![];
    let mut _enum_array_set = false;
    let mut _opt_enum_array: Option<Vec<Option<CustomEnum>>> = None;
    let mut _map: Map<String, i32> = Map::<String, i32>::new();
    let mut _map_set = false;
    let mut _map_of_arr: Map<String, Vec<i32>> = Map::<String, Vec<i32>>::new();
    let mut _map_of_arr_set = false;
    let mut _map_of_map: Map<String, Map<String, i32>> = Map::<String, Map<String, i32>>::new();
    let mut _map_of_map_set = false;
    let mut _map_of_obj: Map<String, AnotherType> = Map::<String, AnotherType>::new();
    let mut _map_of_obj_set = false;
    let mut _map_of_arr_of_obj: Map<String, Vec<AnotherType>> = Map::<String, Vec<AnotherType>>::new();
    let mut _map_of_arr_of_obj_set = false;

    while num_of_fields > 0 {
        num_of_fields -= 1;
        let field = reader.read_string()?;

        match field.as_str() {
            "str" => {
                reader.context().push(&field, "String", "type found, reading argument");
                _str = reader.read_string()?;
                _str_set = true;
                reader.context().pop();
            }
            "optStr" => {
                reader.context().push(&field, "Option<String>", "type found, reading argument");
                _opt_str = reader.read_optional_string()?;
                reader.context().pop();
            }
            "en" => {
                reader.context().push(&field, "CustomEnum", "type found, reading argument");
                let mut value: CustomEnum = CustomEnum::_MAX_;
                if reader.is_next_string()? {
                    value = get_custom_enum_value(&reader.read_string()?)?;
                } else {
                    value = CustomEnum::try_from(reader.read_i32()?)?;
                    sanitize_custom_enum_value(value as i32)?;
                }
                _en = value;
                _en_set = true;
                reader.context().pop();
            }
            "optEnum" => {
                reader.context().push(&field, "Option<CustomEnum>", "type found, reading argument");
                let mut value: Option<CustomEnum> = None;
                if !reader.is_next_nil()? {
                    if reader.is_next_string()? {
                        value = Some(get_custom_enum_value(&reader.read_string()?)?);
                    } else {
                        value = Some(CustomEnum::try_from(reader.read_i32()?)?);
                        sanitize_custom_enum_value(value.unwrap() as i32)?;
                    }
                } else {
                    value = None;
                }
                _opt_enum = value;
                reader.context().pop();
            }
            "enumArray" => {
                reader.context().push(&field, "Vec<CustomEnum>", "type found, reading argument");
                _enum_array = reader.read_array(|reader| {
                    let mut value: CustomEnum = CustomEnum::_MAX_;
                    if reader.is_next_string()? {
                        value = get_custom_enum_value(&reader.read_string()?)?;
                    } else {
                        value = CustomEnum::try_from(reader.read_i32()?)?;
                        sanitize_custom_enum_value(value as i32)?;
                    }
                    Ok(value)
                })?;
                _enum_array_set = true;
                reader.context().pop();
            }
            "optEnumArray" => {
                reader.context().push(&field, "Option<Vec<Option<CustomEnum>>>", "type found, reading argument");
                _opt_enum_array = reader.read_optional_array(|reader| {
                    let mut value: Option<CustomEnum> = None;
                    if !reader.is_next_nil()? {
                        if reader.is_next_string()? {
                            value = Some(get_custom_enum_value(&reader.read_string()?)?);
                        } else {
                            value = Some(CustomEnum::try_from(reader.read_i32()?)?);
                            sanitize_custom_enum_value(value.unwrap() as i32)?;
                        }
                    } else {
                        value = None;
                    }
                    Ok(value)
                })?;
                reader.context().pop();
            }
            "map" => {
                reader.context().push(&field, "Map<String, i32>", "type found, reading argument");
                _map = reader.read_ext_generic_map(|reader| {
                    reader.read_string()
                }, |reader| {
                    reader.read_i32()
                })?;
                _map_set = true;
                reader.context().pop();
            }
            "mapOfArr" => {
                reader.context().push(&field, "Map<String, Vec<i32>>", "type found, reading argument");
                _map_of_arr = reader.read_ext_generic_map(|reader| {
                    reader.read_string()
                }, |reader| {
                    reader.read_array(|reader| {
                        reader.read_i32()
                    })
                })?;
                _map_of_arr_set = true;
                reader.context().pop();
            }
            "mapOfMap" => {
                reader.context().push(&field, "Map<String, Map<String, i32>>", "type found, reading argument");
                _map_of_map = reader.read_ext_generic_map(|reader| {
                    reader.read_string()
                }, |reader| {
                    reader.read_ext_generic_map(|reader| {
                        reader.read_string()
                    }, |reader| {
                        reader.read_i32()
                    })
                })?;
                _map_of_map_set = true;
                reader.context().pop();
            }
            "mapOfObj" => {
                reader.context().push(&field, "Map<String, AnotherType>", "type found, reading argument");
                _map_of_obj = reader.read_ext_generic_map(|reader| {
                    reader.read_string()
                }, |reader| {
                    let object = AnotherType::read(reader)?;
                    Ok(object)
                })?;
                _map_of_obj_set = true;
                reader.context().pop();
            }
            "mapOfArrOfObj" => {
                reader.context().push(&field, "Map<String, Vec<AnotherType>>", "type found, reading argument");
                _map_of_arr_of_obj = reader.read_ext_generic_map(|reader| {
                    reader.read_string()
                }, |reader| {
                    reader.read_array(|reader| {
                        let object = AnotherType::read(reader)?;
                        Ok(object)
                    })
                })?;
                _map_of_arr_of_obj_set = true;
                reader.context().pop();
            }
            err => return Err(DecodeError::UnknownFieldName(err.to_string())),
        }
    }
    if !_str_set {
        return Err(DecodeError::MissingField("str: String.".to_string()));
    }
    if !_en_set {
        return Err(DecodeError::MissingField("en: CustomEnum.".to_string()));
    }
    if !_enum_array_set {
        return Err(DecodeError::MissingField("enumArray: [CustomEnum].".to_string()));
    }
    if !_map_set {
        return Err(DecodeError::MissingField("map: Map<String, Int>.".to_string()));
    }
    if !_map_of_arr_set {
        return Err(DecodeError::MissingField("mapOfArr: Map<String, [Int]>.".to_string()));
    }
    if !_map_of_map_set {
        return Err(DecodeError::MissingField("mapOfMap: Map<String, Map<String, Int>>.".to_string()));
    }
    if !_map_of_obj_set {
        return Err(DecodeError::MissingField("mapOfObj: Map<String, AnotherType>.".to_string()));
    }
    if !_map_of_arr_of_obj_set {
        return Err(DecodeError::MissingField("mapOfArrOfObj: Map<String, [AnotherType]>.".to_string()));
    }

    Ok(ArgsModuleMethod {
        str: _str,
        opt_str: _opt_str,
        en: _en,
        opt_enum: _opt_enum,
        enum_array: _enum_array,
        opt_enum_array: _opt_enum_array,
        map: _map,
        map_of_arr: _map_of_arr,
        map_of_map: _map_of_map,
        map_of_obj: _map_of_obj,
        map_of_arr_of_obj: _map_of_arr_of_obj,
    })
}

pub fn serialize_module_method_result(result: &i32) -> Result<Vec<u8>, EncodeError> {
    let mut encoder_context = Context::new();
    encoder_context.description = "Serializing (encoding) module-type: module_method".to_string();
    let mut encoder = WriteEncoder::new(&[], encoder_context);
    write_module_method_result(result, &mut encoder)?;
    Ok(encoder.get_buffer())
}

pub fn write_module_method_result<W: Write>(result: &i32, writer: &mut W) -> Result<(), EncodeError> {
    writer.context().push("moduleMethod", "i32", "writing result");
    writer.write_i32(result)?;
    writer.context().pop();
    Ok(())
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ArgsObjectMethod {
    pub object: AnotherType,
    pub opt_object: Option<AnotherType>,
    pub object_array: Vec<AnotherType>,
    pub opt_object_array: Option<Vec<Option<AnotherType>>>,
}

pub fn deserialize_object_method_args(args: &[u8]) -> Result<ArgsObjectMethod, DecodeError> {
    let mut context = Context::new();
    context.description = "Deserializing module-type: object_method".to_string();

    let mut reader = ReadDecoder::new(args, context);
    let mut num_of_fields = reader.read_map_length()?;

    let mut _object: AnotherType = AnotherType::new();
    let mut _object_set = false;
    let mut _opt_object: Option<AnotherType> = None;
    let mut _object_array: Vec<AnotherType> = vec![];
    let mut _object_array_set = false;
    let mut _opt_object_array: Option<Vec<Option<AnotherType>>> = None;

    while num_of_fields > 0 {
        num_of_fields -= 1;
        let field = reader.read_string()?;

        match field.as_str() {
            "object" => {
                reader.context().push(&field, "AnotherType", "type found, reading argument");
                let object = AnotherType::read(&mut reader)?;
                _object = object;
                _object_set = true;
                reader.context().pop();
            }
            "optObject" => {
                reader.context().push(&field, "Option<AnotherType>", "type found, reading argument");
                let mut object: Option<AnotherType> = None;
                if !reader.is_next_nil()? {
                    object = Some(AnotherType::read(&mut reader)?);
                } else {
                    object = None;
                }
                _opt_object = object;
                reader.context().pop();
            }
            "objectArray" => {
                reader.context().push(&field, "Vec<AnotherType>", "type found, reading argument");
                _object_array = reader.read_array(|reader| {
                    let object = AnotherType::read(reader)?;
                    Ok(object)
                })?;
                _object_array_set = true;
                reader.context().pop();
            }
            "optObjectArray" => {
                reader.context().push(&field, "Option<Vec<Option<AnotherType>>>", "type found, reading argument");
                _opt_object_array = reader.read_optional_array(|reader| {
                    let mut object: Option<AnotherType> = None;
                    if !reader.is_next_nil()? {
                        object = Some(AnotherType::read(reader)?);
                    } else {
                        object = None;
                    }
                    Ok(object)
                })?;
                reader.context().pop();
            }
            err => return Err(DecodeError::UnknownFieldName(err.to_string())),
        }
    }
    if !_object_set {
        return Err(DecodeError::MissingField("object: AnotherType.".to_string()));
    }
    if !_object_array_set {
        return Err(DecodeError::MissingField("objectArray: [AnotherType].".to_string()));
    }

    Ok(ArgsObjectMethod {
        object: _object,
        opt_object: _opt_object,
        object_array: _object_array,
        opt_object_array: _opt_object_array,
    })
}

pub fn serialize_object_method_result(result: &Option<AnotherType>) -> Result<Vec<u8>, EncodeError> {
    let mut encoder_context = Context::new();
    encoder_context.description = "Serializing (encoding) module-type: object_method".to_string();
    let mut encoder = WriteEncoder::new(&[], encoder_context);
    write_object_method_result(result, &mut encoder)?;
    Ok(encoder.get_buffer())
}

pub fn write_object_method_result<W: Write>(result: &Option<AnotherType>, writer: &mut W) -> Result<(), EncodeError> {
    writer.context().push("objectMethod", "Option<AnotherType>", "writing result");
    if result.is_some() {
        AnotherType::write(result.as_ref().unwrap(), writer)?;
    } else {
        writer.write_nil()?;
    }
    writer.context().pop();
    Ok(())
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ArgsOptionalEnvMethod {
    pub object: AnotherType,
    pub opt_object: Option<AnotherType>,
    pub object_array: Vec<AnotherType>,
    pub opt_object_array: Option<Vec<Option<AnotherType>>>,
}

pub fn deserialize_optional_env_method_args(args: &[u8]) -> Result<ArgsOptionalEnvMethod, DecodeError> {
    let mut context = Context::new();
    context.description = "Deserializing module-type: optional_env_method".to_string();

    let mut reader = ReadDecoder::new(args, context);
    let mut num_of_fields = reader.read_map_length()?;

    let mut _object: AnotherType = AnotherType::new();
    let mut _object_set = false;
    let mut _opt_object: Option<AnotherType> = None;
    let mut _object_array: Vec<AnotherType> = vec![];
    let mut _object_array_set = false;
    let mut _opt_object_array: Option<Vec<Option<AnotherType>>> = None;

    while num_of_fields > 0 {
        num_of_fields -= 1;
        let field = reader.read_string()?;

        match field.as_str() {
            "object" => {
                reader.context().push(&field, "AnotherType", "type found, reading argument");
                let object = AnotherType::read(&mut reader)?;
                _object = object;
                _object_set = true;
                reader.context().pop();
            }
            "optObject" => {
                reader.context().push(&field, "Option<AnotherType>", "type found, reading argument");
                let mut object: Option<AnotherType> = None;
                if !reader.is_next_nil()? {
                    object = Some(AnotherType::read(&mut reader)?);
                } else {
                    object = None;
                }
                _opt_object = object;
                reader.context().pop();
            }
            "objectArray" => {
                reader.context().push(&field, "Vec<AnotherType>", "type found, reading argument");
                _object_array = reader.read_array(|reader| {
                    let object = AnotherType::read(reader)?;
                    Ok(object)
                })?;
                _object_array_set = true;
                reader.context().pop();
            }
            "optObjectArray" => {
                reader.context().push(&field, "Option<Vec<Option<AnotherType>>>", "type found, reading argument");
                _opt_object_array = reader.read_optional_array(|reader| {
                    let mut object: Option<AnotherType> = None;
                    if !reader.is_next_nil()? {
                        object = Some(AnotherType::read(reader)?);
                    } else {
                        object = None;
                    }
                    Ok(object)
                })?;
                reader.context().pop();
            }
            err => return Err(DecodeError::UnknownFieldName(err.to_string())),
        }
    }
    if !_object_set {
        return Err(DecodeError::MissingField("object: AnotherType.".to_string()));
    }
    if !_object_array_set {
        return Err(DecodeError::MissingField("objectArray: [AnotherType].".to_string()));
    }

    Ok(ArgsOptionalEnvMethod {
        object: _object,
        opt_object: _opt_object,
        object_array: _object_array,
        opt_object_array: _opt_object_array,
    })
}

pub fn serialize_optional_env_method_result(result: &Option<AnotherType>) -> Result<Vec<u8>, EncodeError> {
    let mut encoder_context = Context::new();
    encoder_context.description = "Serializing (encoding) module-type: optional_env_method".to_string();
    let mut encoder = WriteEncoder::new(&[], encoder_context);
    write_optional_env_method_result(result, &mut encoder)?;
    Ok(encoder.get_buffer())
}

pub fn write_optional_env_method_result<W: Write>(result: &Option<AnotherType>, writer: &mut W) -> Result<(), EncodeError> {
    writer.context().push("optionalEnvMethod", "Option<AnotherType>", "writing result");
    if result.is_some() {
        AnotherType::write(result.as_ref().unwrap(), writer)?;
    } else {
        writer.write_nil()?;
    }
    writer.context().pop();
    Ok(())
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ArgsIf {
    pub _if: Else,
}

pub fn deserialize_if_args(args: &[u8]) -> Result<ArgsIf, DecodeError> {
    let mut context = Context::new();
    context.description = "Deserializing module-type: if".to_string();

    let mut reader = ReadDecoder::new(args, context);
    let mut num_of_fields = reader.read_map_length()?;

    let mut _if: Else = Else::new();
    let mut _if_set = false;

    while num_of_fields > 0 {
        num_of_fields -= 1;
        let field = reader.read_string()?;

        match field.as_str() {
            "if" => {
                reader.context().push(&field, "Else", "type found, reading argument");
                let object = Else::read(&mut reader)?;
                _if = object;
                _if_set = true;
                reader.context().pop();
            }
            err => return Err(DecodeError::UnknownFieldName(err.to_string())),
        }
    }
    if !_if_set {
        return Err(DecodeError::MissingField("if: else.".to_string()));
    }

    Ok(ArgsIf {
        _if: _if,
    })
}

pub fn serialize_if_result(result: &Else) -> Result<Vec<u8>, EncodeError> {
    let mut encoder_context = Context::new();
    encoder_context.description = "Serializing (encoding) module-type: if".to_string();
    let mut encoder = WriteEncoder::new(&[], encoder_context);
    write_if_result(result, &mut encoder)?;
    Ok(encoder.get_buffer())
}

pub fn write_if_result<W: Write>(result: &Else, writer: &mut W) -> Result<(), EncodeError> {
    writer.context().push("if", "Else", "writing result");
    Else::write(&result, writer)?;
    writer.context().pop();
    Ok(())
}
