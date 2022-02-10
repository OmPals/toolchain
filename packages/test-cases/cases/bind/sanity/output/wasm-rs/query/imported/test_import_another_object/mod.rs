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
    deserialize_test_import_another_object,
    read_test_import_another_object,
    serialize_test_import_another_object,
    write_test_import_another_object
};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TestImportAnotherObject {
    pub prop: String,
}

impl TestImportAnotherObject {
    pub const URI: &'static str = "testimport.uri.eth";

    pub fn new() -> TestImportAnotherObject {
        TestImportAnotherObject {
            prop: String::new(),
        }
    }

    pub fn to_buffer(input: &TestImportAnotherObject) -> Result<Vec<u8>, EncodeError> {
        serialize_test_import_another_object(input)
    }

    pub fn from_buffer(input: &[u8]) -> Result<TestImportAnotherObject, DecodeError> {
        deserialize_test_import_another_object(input)
    }

    pub fn write<W: Write>(input: &TestImportAnotherObject, writer: &mut W) -> Result<(), EncodeError> {
        write_test_import_another_object(input, writer)
    }

    pub fn read<R: Read>(reader: &mut R) -> Result<TestImportAnotherObject, DecodeError> {
        read_test_import_another_object(reader)
    }
}
