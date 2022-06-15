pub mod w3;
use web3api_wasm_rs::JSON;
use w3::imported::ethereum_module;
pub use w3::*;

pub fn get_data(input: InputGetData) -> i32 {
    match EthereumModule::call_contract_view(&ethereum_module::InputCallContractView {
        address: input.address,
        method: "function get() view returns (uint256)".to_string(),
        args: None,
        connection: input.connection,
    }) {
        Ok(v) => v.parse::<i32>().unwrap(),
        Err(e) => panic!("{}", e),
    }
}

pub fn try_get_data(input: InputTryGetData) -> String {
    let res = EthereumModule::call_contract_view(&ethereum_module::InputCallContractView {
        address: input.address,
        method: "function badFunctionCall() view returns (uint256)".to_string(),
        args: None,
        connection: input.connection,
    });

    res.unwrap_err()
}

pub fn throw_get_data(input: InputThrowGetData) -> String {
    EthereumModule::call_contract_view(&ethereum_module::InputCallContractView {
        address: input.address,
        method: "function badFunctionCall() view returns (uint256)".to_string(),
        args: None,
        connection: input.connection,
    }).unwrap()
}

pub fn set_data(input: InputSetData) -> String {
    match EthereumModule::call_contract_method(&ethereum_module::InputCallContractMethod {
        address: input.address,
        method: "function set(uint256 value)".to_string(),
        args: Some(vec![input.value.to_string()]),
        connection: input.connection,
        tx_overrides: None,
    }) {
        Ok(res) => res.hash,
        Err(e) => panic!("{}", e),
    }
}

pub fn deploy_contract(input: InputDeployContract) -> String {
    let abi = JSON::json!([{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"}],"name":"DataSet","type":"event"},{"inputs":[],"name":"get","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"}]).to_string();
    let bytecode = "0x608060405234801561001057600080fd5b5061012a806100206000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b606860eb565b6040518082815260200191505060405180910390f35b806000819055507f3d38713ec8fb49acced894a52df2f06a371a15960550da9ba0f017cb7d07a8ec33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a150565b6000805490509056fea2646970667358221220f312fe8d32f77c74cc4eb4a1f5c805d8bb124755ca4e8a1db2cce10cbb133dc564736f6c63430006060033".to_string();
    EthereumModule::deploy_contract(&ethereum_module::InputDeployContract {
        abi,
        bytecode,
        args: None,
        connection: input.connection,
    })
    .unwrap()
}
