import {
  Input_method
} from "./w3";
import { BigNumber } from "@web3api/wasm-as";

export function method(input: Input_method): BigNumber {
  let result = input.arg1.mul(input.obj.prop1);

  if (input.arg2) {
    result = result.mul(input.arg2 as BigNumber);
  }
  if (input.obj.prop2) {
    result = result.mul(input.obj.prop2 as BigNumber);
  }

  return result;
}
