use serde::{Serialize, Deserialize};
use web3api_wasm_rs::{
    BigInt,
    BigNumber,
    Map,
    Read,
    Write,
    JSON,
    subinvoke,
};
pub mod serialization;
pub use serialization::{
    deserialize_imported_method_result,
    serialize_imported_method_args,
    InputImportedMethod,
    deserialize_another_method_result,
    serialize_another_method_args,
    InputAnotherMethod
};

use crate::TestImportObject;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TestImportMutation {}

impl TestImportMutation {
    pub const URI: &'static str = "testimport.uri.eth";

    pub fn new() -> TestImportMutation {
        TestImportMutation {}
    }

    pub fn imported_method(input: &InputImportedMethod) -> Result<Option<TestImportObject>, String> {
        let uri = TestImportMutation::URI;
        let args = serialize_imported_method_args(input).map_err(|e| e.to_string())?;
        let result = subinvoke::w3_subinvoke(
            uri,
            "mutation",
            "importedMethod",
            args,
        )?;
        deserialize_imported_method_result(result.as_slice()).map_err(|e| e.to_string())
    }

    pub fn another_method(input: &InputAnotherMethod) -> Result<i32, String> {
        let uri = TestImportMutation::URI;
        let args = serialize_another_method_args(input).map_err(|e| e.to_string())?;
        let result = subinvoke::w3_subinvoke(
            uri,
            "mutation",
            "anotherMethod",
            args,
        )?;
        deserialize_another_method_result(result.as_slice()).map_err(|e| e.to_string())
    }
}
