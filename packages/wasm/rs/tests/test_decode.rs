use polywrap_wasm_rs::{BigInt, Context, Read, ReadDecoder, JSON};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, PartialEq, Serialize)]
struct JsonTest {
    language: String,
    runtime: String,
}

#[test]
fn test_read_bigint() {
    let mut reader = ReadDecoder::new(
        &[171, 49, 48, 49, 48, 48, 50, 48, 48, 51, 48, 48],
        Context::new(),
    );
    let bigint = BigInt::from(10_100_200_300i64);
    assert_eq!(bigint, reader.read_bigint().unwrap());
}

#[test]
fn test_read_json() {
    let mut reader = ReadDecoder::new(
        &[
            217, 70, 10, 32, 32, 32, 32, 123, 10, 32, 32, 32, 32, 32, 32, 32, 32, 34, 108, 97, 110,
            103, 117, 97, 103, 101, 34, 58, 32, 34, 82, 117, 115, 116, 34, 44, 10, 32, 32, 32, 32,
            32, 32, 32, 32, 34, 114, 117, 110, 116, 105, 109, 101, 34, 58, 32, 34, 80, 111, 108,
            121, 119, 114, 97, 112, 34, 10, 32, 32, 32, 32, 125,
        ],
        Context::new(),
    );
    let decoded_json = reader.read_json().unwrap();
    let j = "
    {
        \"language\": \"Rust\",
        \"runtime\": \"Polywrap\"
    }";
    let json_a: JsonTest = JSON::from_str(j).unwrap();
    let json_b: JsonTest = JSON::from_str(&decoded_json.to_string()).unwrap();
    assert_eq!(json_a, json_b)
}

#[test]
fn test_read_string_length() {
    let mut reader = ReadDecoder::new(&[0xa1], Context::new());
    assert_eq!(1, reader.read_string_length().unwrap());
}

#[test]
fn test_read_string() {
    let mut reader = ReadDecoder::new(&[165, 72, 101, 108, 108, 111], Context::new());
    assert_eq!("Hello".to_string(), reader.read_string().unwrap());
}

#[test]
fn test_read_bytes_length() {
    let mut reader = ReadDecoder::new(&[0xc4, 0x00], Context::new());
    assert_eq!(0, reader.read_bytes_length().unwrap());
}

#[test]
fn test_read_bytes() {
    let mut reader = ReadDecoder::new(&[0xc4, 0x00], Context::new());
    let v: Vec<u8> = vec![];
    assert_eq!(v, reader.read_bytes().unwrap());
}

#[test]
fn test_read_array_length() {
    let mut reader = ReadDecoder::new(&[0x91], Context::new());
    assert_eq!(0x01, reader.read_array_length().unwrap());
}

#[test]
fn test_read_array() {
    let mut reader = ReadDecoder::new(&[0x91, 0xcc, 0x01], Context::new());
    assert_eq!(
        vec![0x01],
        reader.read_array(|reader| { reader.read_u8() }).unwrap()
    );
}

#[test]
fn test_read_map_length() {
    let mut reader = ReadDecoder::new(&[0x81], Context::new());
    assert_eq!(0x01, reader.read_map_length().unwrap());
}

#[test]
fn test_read_map() {
    let mut reader = ReadDecoder::new(
        &[
            0x81, 0xa8, 0x50, 0x6f, 0x6c, 0x79, 0x77, 0x72, 0x61, 0x70, 0x92, 0xd2, 0x00, 0x00,
            0x00, 0x01, 0xd2, 0x00, 0x00, 0x00, 0x02,
        ],
        Context::new(),
    );
    let res = reader
        .read_map(
            |key_fn| key_fn.read_string(),
            |val_fn| val_fn.read_array(|reader| reader.read_i32()),
        )
        .unwrap();
    assert_eq!(res[&"Polywrap".to_string()], vec![0x01, 0x02]);
}

#[test]
fn test_read_map2() {
    let mut reader = ReadDecoder::new(
        &[
            223, 0, 0, 0, 1, 163, 102, 111, 111, 221, 0, 0, 0, 3, 1, 2, 206, 0, 8, 82, 65,
        ],
        Context::new(),
    );
    let res = reader
        .read_map(
            |key_fn| key_fn.read_string(),
            |val_fn| val_fn.read_array(|reader| reader.read_i32()),
        )
        .unwrap();
    assert_eq!(res[&"foo".to_string()], vec![1, 2, 545345]);
}

#[test]
fn test_read_nil() {
    let mut reader = ReadDecoder::new(&[0xc0], Context::new());
    assert_eq!(reader.read_nil().unwrap(), ());
}

#[test]
fn test_read_bool_true() {
    let mut reader = ReadDecoder::new(&[195], Context::new());
    assert!(reader.read_bool().unwrap());
}

#[test]
fn test_read_bool_false() {
    let mut reader = ReadDecoder::new(&[194], Context::new());
    assert!(!reader.read_bool().unwrap());
}

#[test]
fn test_read_f32() {
    let mut reader = ReadDecoder::new(&[0xca, 0xff, 0x7f, 0xff, 0xff], Context::new());
    assert_eq!(f32::MIN, reader.read_f32().unwrap());
}

#[test]
fn test_read_f64() {
    let mut reader = ReadDecoder::new(&[203, 63, 240, 0, 0, 0, 0, 0, 0], Context::new());
    assert_eq!(1.0, reader.read_f64().unwrap());
}

#[test]
fn test_read_i8() {
    let mut reader = ReadDecoder::new(&[208, 128], Context::new());
    assert_eq!(i8::MIN, reader.read_i8().unwrap());
}

#[test]
fn test_read_i16() {
    let mut reader = ReadDecoder::new(&[209, 128, 0], Context::new());
    assert_eq!(i16::MIN, reader.read_i16().unwrap());
}

#[test]
fn test_read_i32() {
    let mut reader = ReadDecoder::new(&[210, 128, 0, 0, 0], Context::new());
    assert_eq!(i32::MIN, reader.read_i32().unwrap());
}

#[test]
fn test_read_i64() {
    let mut reader = ReadDecoder::new(&[207, 128, 0, 0, 0, 0, 0, 0, 0], Context::new());
    assert_eq!(i64::MIN, reader.read_i64().unwrap());
}

#[test]
fn test_read_u8() {
    let mut reader = ReadDecoder::new(&[204, 255], Context::new());
    assert_eq!(u8::MAX, reader.read_u8().unwrap());
}

#[test]
fn test_read_u16() {
    let mut reader = ReadDecoder::new(&[205, 255, 255], Context::new());
    assert_eq!(u16::MAX, reader.read_u16().unwrap());
}

#[test]
fn test_read_u32() {
    let mut reader = ReadDecoder::new(&[206, 255, 255, 255, 255], Context::new());
    assert_eq!(u32::MAX, reader.read_u32().unwrap());
}

#[test]
fn test_read_u64() {
    let mut reader = ReadDecoder::new(
        &[207, 255, 255, 255, 255, 255, 255, 255, 255],
        Context::new(),
    );
    assert_eq!(u64::MAX, reader.read_u64().unwrap());
}
