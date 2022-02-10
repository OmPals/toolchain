use crate::{
    mutation_method,
    InputMutationMethod,
    deserialize_mutation_method_args,
    serialize_mutation_method_result,
    object_method,
    InputObjectMethod,
    deserialize_object_method_args,
    serialize_object_method_result
};

pub fn mutation_method_wrapped(input: &[u8]) -> Vec<u8> {
    match deserialize_mutation_method_args(input) {
        Ok(args) => {
            let result = mutation_method(InputMutationMethod {
                str: args.str,
                opt_str: args.opt_str,
                en: args.en,
                opt_enum: args.opt_enum,
                enum_array: args.enum_array,
                opt_enum_array: args.opt_enum_array,
            });
            serialize_mutation_method_result(&result).unwrap()
        }
        Err(e) => {
            panic!("{}", e.to_string())
        }
    }
}

pub fn object_method_wrapped(input: &[u8]) -> Vec<u8> {
    match deserialize_object_method_args(input) {
        Ok(args) => {
            let result = object_method(InputObjectMethod {
                object: args.object,
                opt_object: args.opt_object,
                object_array: args.object_array,
                opt_object_array: args.opt_object_array,
            });
            serialize_object_method_result(&result).unwrap()
        }
        Err(e) => {
            panic!("{}", e.to_string())
        }
    }
}
