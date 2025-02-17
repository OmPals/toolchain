pub mod wrap;
pub use wrap::*;

pub fn module_implementations(args: ArgsModuleImplementations) -> Vec<String> {
  Interface::get_implementations()
}

pub fn module_method(args: ArgsModuleMethod) -> ImplementationType {
    args.arg
}

pub fn abstract_module_method(args: ArgsAbstractModuleMethod) -> String {
  args.arg.str
}
