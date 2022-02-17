use serde::{Deserialize, Serialize};
use std::convert::TryFrom;
use std::{collections::HashMap, str::FromStr};
use web3::{Web3, ethabi};
use web3::api::{Accounts};
use web3::contract::Contract;
use web3::transports::{Either, Http, ws::WebSocket, eip_1193::{Eip1193, Provider} };
use web3::types::{Address, H160};

pub type EitherTransport = Either<Eip1193, Http>;

pub enum EthereumProvider {
    HttpUrl(String),
    Eip1193(Provider)
}

pub enum EthereumSigner {
    AccountIndex(usize),
    AddressString(String),
    Address(Address)
}

// #[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct ConnectionConfig {
    pub provider: EthereumProvider,
    pub signer: Option<EthereumSigner>,
}

// #[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Config {
    pub signer: Address,
}

// #[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct ConnectionConfigs {
    pub networks: HashMap<String, ConnectionConfig>,
}

// #[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Connections {
    pub networks: HashMap<String, Connection>,
}

// #[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Connection {
    client: Web3<EitherTransport>,
    config: Config,
    accounts: Vec<Address>
}

impl Connection {
    pub async fn new(config: ConnectionConfig) -> Self {
        let transport = match config.provider {
            EthereumProvider::HttpUrl(url) => match Http::new(&url) {
                Ok(http) => web3::transports::Either::Right(http),
                Err(_) => panic!("Error creating HTTP transport with: {}", &url)
            },
            EthereumProvider::Eip1193(ethereum) =>
                web3::transports::Either::Left(
                Eip1193::new(ethereum)
            )
        };

        let client = Web3::new(transport);

        let accounts = match client.eth().accounts().await {
            Ok(a) => a,
            Err(error) => panic!("Could not retrieve accounts: {:?}", error)
        };

        let signer = match config.signer {
            Some(ethereum_signer) => {
                match ethereum_signer {
                    EthereumSigner::AddressString(address_str) => {
                        let parsed_address = Address::from_str(&address_str);

                        if parsed_address.is_err() {
                            panic!("Invalid signer address: {}", &address_str)
                        }

                        parsed_address.unwrap()
                    }
                    EthereumSigner::AccountIndex(index) => accounts[index],
                    EthereumSigner::Address(address) => address
                }
            },
            _ => accounts[0]
        };


        Self {
            // client,
            client,
            config: Config {
                signer
            },
            accounts
        }
    }

    pub async fn from_configs(configs: ConnectionConfigs) -> Connections {
        let mut connections = Connections {
            networks: HashMap::new()
        };

        for network in configs.networks.keys() {
            let connection = Self::new(configs.networks[network].clone());
            let network_str = network.to_ascii_lowercase();

            connections
                .networks
                .insert(network_str.clone(), connection);
        }

        connections
    }

    // pub fn get_contract(&self, address: &str, abi: &str) -> Contract<EitherTransport> {
    //     let parsed_address = match Address::from_str(address) {
    //         Ok(a) => a,
    //         Err(_) => { panic!("Invalid contract address: {}", address)}
    //     };
    //
    //     //TODO: Convert ABI here
    //
    //     Contract::new(self.client.eth(), parsed_address, abi)
    // }
}