use super::error::DecodeError;
use crate::{BigInt, Context, JSON};
use core::hash::Hash;
use std::collections::BTreeMap;

pub trait Read: Clone + Sized + std::io::Read {
    fn read_nil(&mut self) -> Result<(), DecodeError>;
    fn read_bool(&mut self) -> Result<bool, DecodeError>;
    fn read_i8(&mut self) -> Result<i8, DecodeError>;
    fn read_i16(&mut self) -> Result<i16, DecodeError>;
    fn read_i32(&mut self) -> Result<i32, DecodeError>;
    fn read_i64(&mut self) -> Result<i64, DecodeError>;
    fn read_u8(&mut self) -> Result<u8, DecodeError>;
    fn read_u16(&mut self) -> Result<u16, DecodeError>;
    fn read_u32(&mut self) -> Result<u32, DecodeError>;
    fn read_u64(&mut self) -> Result<u64, DecodeError>;
    fn read_f32(&mut self) -> Result<f32, DecodeError>;
    fn read_f64(&mut self) -> Result<f64, DecodeError>;
    fn read_string_length(&mut self) -> Result<u32, DecodeError>;
    fn read_string(&mut self) -> Result<String, DecodeError>;
    fn read_bytes_length(&mut self) -> Result<u32, DecodeError>;
    fn read_bytes(&mut self) -> Result<Vec<u8>, DecodeError>;
    fn read_bigint(&mut self) -> Result<BigInt, DecodeError>;
    fn read_json(&mut self) -> Result<JSON::Value, DecodeError>;
    fn read_array_length(&mut self) -> Result<u32, DecodeError>;
    fn read_array<T>(
        &mut self,
        reader: impl FnMut(&mut Self) -> Result<T, DecodeError>,
    ) -> Result<Vec<T>, DecodeError>;
    fn read_map_length(&mut self) -> Result<u32, DecodeError>;
    fn read_map<K, V>(
        &mut self,
        key_fn: impl FnMut(&mut Self) -> Result<K, DecodeError>,
        val_fn: impl FnMut(&mut Self) -> Result<V, DecodeError>,
    ) -> Result<BTreeMap<K, V>, DecodeError>
    where
        K: Eq + Hash + Ord;
    fn read_nullable_bool(&mut self) -> Result<Option<bool>, DecodeError>;
    fn read_nullable_i8(&mut self) -> Result<Option<i8>, DecodeError>;
    fn read_nullable_i16(&mut self) -> Result<Option<i16>, DecodeError>;
    fn read_nullable_i32(&mut self) -> Result<Option<i32>, DecodeError>;
    fn read_nullable_i64(&mut self) -> Result<Option<i64>, DecodeError>;
    fn read_nullable_u8(&mut self) -> Result<Option<u8>, DecodeError>;
    fn read_nullable_u16(&mut self) -> Result<Option<u16>, DecodeError>;
    fn read_nullable_u32(&mut self) -> Result<Option<u32>, DecodeError>;
    fn read_nullable_u64(&mut self) -> Result<Option<u64>, DecodeError>;
    fn read_nullable_f32(&mut self) -> Result<Option<f32>, DecodeError>;
    fn read_nullable_f64(&mut self) -> Result<Option<f64>, DecodeError>;
    fn read_nullable_string(&mut self) -> Result<Option<String>, DecodeError>;
    fn read_nullable_bytes(&mut self) -> Result<Option<Vec<u8>>, DecodeError>;
    fn read_nullable_bigint(&mut self) -> Result<Option<BigInt>, DecodeError>;
    fn read_nullable_json(&mut self) -> Result<Option<JSON::Value>, DecodeError>;
    fn read_nullable_array<T>(
        &mut self,
        reader: impl FnMut(&mut Self) -> Result<T, DecodeError>,
    ) -> Result<Option<Vec<T>>, DecodeError>;
    fn read_nullable_map<K, V>(
        &mut self,
        key_fn: impl FnMut(&mut Self) -> Result<K, DecodeError>,
        val_fn: impl FnMut(&mut Self) -> Result<V, DecodeError>,
    ) -> Result<Option<BTreeMap<K, V>>, DecodeError>
    where
        K: Eq + Hash + Ord;
    fn is_next_nil(&mut self) -> Result<bool, DecodeError>;
    fn is_next_string(&mut self) -> Result<bool, DecodeError>;
    fn context(&mut self) -> &mut Context;
}
