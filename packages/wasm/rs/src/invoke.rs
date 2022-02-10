use crate::malloc::alloc;

#[link(wasm_import_module = "w3")]
extern "C" {
    /// Get Invoke Arguments
    #[link_name = "__w3_invoke_args"]
    pub fn __w3_invoke_args(method_ptr: u32, args_ptr: u32);

    /// Set Invoke Result
    #[link_name = "__w3_invoke_result"]
    pub fn __w3_invoke_result(ptr: u32, len: u32);

    /// Set Invoke Error
    #[link_name = "__w3_invoke_error"]
    pub fn __w3_invoke_error(ptr: u32, len: u32);
}

/// Keep track of all invokable functions
pub type InvokeFunction = fn(args_buf: &[u8]) -> Vec<u8>;

pub struct InvokeArgs {
    pub method: String,
    pub args: Vec<u8>,
}

/// Helper for fetching invoke args
pub fn w3_invoke_args(method_size: u32, args_size: u32) -> InvokeArgs {
    let method_size_ptr = alloc(method_size as usize);
    let args_size_ptr = alloc(args_size as usize);

    unsafe { __w3_invoke_args(method_size_ptr as u32, args_size_ptr as u32) };

    let method = unsafe {
        String::from_raw_parts(method_size_ptr, method_size as usize, method_size as usize)
    };
    let args =
        unsafe { Vec::from_raw_parts(args_size_ptr, args_size as usize, args_size as usize) };

    InvokeArgs { method, args }
}

/// Helper for handling `_w3_invoke`
pub fn w3_invoke(args: InvokeArgs, opt_invoke_func: Option<InvokeFunction>) -> bool {
    match opt_invoke_func {
        Some(func) => {
            let result = func(args.args.as_slice());
            let res_len = result.len() as u32;
            unsafe { __w3_invoke_result(result.as_ptr() as u32, res_len) };
            true
        }
        None => {
            let message = format!("Could not find invoke function {}", &args.method);
            let msg_bytes = message.as_bytes();
            let msg_len = msg_bytes.len() as u32;
            unsafe { __w3_invoke_error(msg_bytes.as_ptr() as u32, msg_len) };
            false
        }
    }
}
