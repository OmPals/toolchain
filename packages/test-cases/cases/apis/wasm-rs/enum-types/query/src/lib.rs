pub mod w3;
pub use w3::*;

pub fn method1(input: InputMethod1) -> SanityEnum {
    input.en
}

pub fn method2(input: InputMethod2) -> Vec<SanityEnum> {
    input.enum_array
}
