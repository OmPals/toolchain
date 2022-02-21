use serde::{Serialize, Deserialize};
pub mod serialization;
use polywrap_wasm_rs::{
    BigInt,
    DecodeError,
    EncodeError,
    Read,
    Write,
    JSON,
};
pub use serialization::{
    deserialize_custom_type,
    read_custom_type,
    serialize_custom_type,
    write_custom_type
};

use crate::AnotherType;
use crate::CustomEnum;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CustomType {
    pub str: String,
    pub opt_str: Option<String>,
    pub u: u32,
    pub opt_u: Option<u32>,
    pub u8: u8,
    pub u16: u16,
    pub u32: u32,
    pub i: i32,
    pub i8: i8,
    pub i16: i16,
    pub i32: i32,
    pub bigint: BigInt,
    pub opt_bigint: Option<BigInt>,
    pub json: JSON::Value,
    pub opt_json: Option<JSON::Value>,
    pub bytes: Vec<u8>,
    pub opt_bytes: Option<Vec<u8>>,
    pub boolean: bool,
    pub opt_boolean: Option<bool>,
    pub u_array: Vec<u32>,
    pub u_opt_array: Option<Vec<u32>>,
    pub opt_u_opt_array: Option<Vec<Option<u32>>>,
    pub opt_str_opt_array: Option<Vec<Option<String>>>,
    pub u_array_array: Vec<Vec<u32>>,
    pub u_opt_array_opt_array: Vec<Option<Vec<Option<u32>>>>,
    pub u_array_opt_array_array: Vec<Option<Vec<Vec<u32>>>>,
    pub crazy_array: Option<Vec<Option<Vec<Vec<Option<Vec<u32>>>>>>>,
    pub object: AnotherType,
    pub opt_object: Option<AnotherType>,
    pub object_array: Vec<AnotherType>,
    pub opt_object_array: Option<Vec<Option<AnotherType>>>,
    pub en: CustomEnum,
    pub opt_enum: Option<CustomEnum>,
    pub enum_array: Vec<CustomEnum>,
    pub opt_enum_array: Option<Vec<Option<CustomEnum>>>,
}

impl CustomType {
    pub fn new() -> CustomType {
        CustomType {
            str: String::new(),
            opt_str: None,
            u: 0,
            opt_u: None,
            u8: 0,
            u16: 0,
            u32: 0,
            i: 0,
            i8: 0,
            i16: 0,
            i32: 0,
            bigint: BigInt::default(),
            opt_bigint: None,
            json: JSON::Value::Null,
            opt_json: None,
            bytes: vec![],
            opt_bytes: None,
            boolean: false,
            opt_boolean: None,
            u_array: vec![],
            u_opt_array: None,
            opt_u_opt_array: None,
            opt_str_opt_array: None,
            u_array_array: vec![],
            u_opt_array_opt_array: vec![],
            u_array_opt_array_array: vec![],
            crazy_array: None,
            object: AnotherType::new(),
            opt_object: None,
            object_array: vec![],
            opt_object_array: None,
            en: CustomEnum::_MAX_,
            opt_enum: None,
            enum_array: vec![],
            opt_enum_array: None,
        }
    }

    pub fn to_buffer(input: &CustomType) -> Result<Vec<u8>, EncodeError> {
        serialize_custom_type(input).map_err(|e| EncodeError::TypeWriteError(e.to_string()))
    }

    pub fn from_buffer(input: &[u8]) -> Result<CustomType, DecodeError> {
        deserialize_custom_type(input).map_err(|e| DecodeError::TypeReadError(e.to_string()))
    }

    pub fn write<W: Write>(input: &CustomType, writer: &mut W) -> Result<(), EncodeError> {
        write_custom_type(input, writer).map_err(|e| EncodeError::TypeWriteError(e.to_string()))
    }

    pub fn read<R: Read>(reader: &mut R) -> Result<CustomType, DecodeError> {
        read_custom_type(reader).map_err(|e| DecodeError::TypeReadError(e.to_string()))
    }
}
