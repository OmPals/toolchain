use super::error::EncodeError;
use crate::{BigInt, Context, JSON};
use core::hash::Hash;
use std::collections::BTreeMap;

pub trait Write {
    fn write_nil(&mut self) -> Result<(), EncodeError>;
    fn write_bool(&mut self, value: &bool) -> Result<(), EncodeError>;
    fn write_i8(&mut self, value: &i8) -> Result<(), EncodeError>;
    fn write_i16(&mut self, value: &i16) -> Result<(), EncodeError>;
    fn write_i32(&mut self, value: &i32) -> Result<(), EncodeError>;
    fn write_u8(&mut self, value: &u8) -> Result<(), EncodeError>;
    fn write_u16(&mut self, value: &u16) -> Result<(), EncodeError>;
    fn write_u32(&mut self, value: &u32) -> Result<(), EncodeError>;
    fn write_f32(&mut self, value: &f32) -> Result<(), EncodeError>;
    fn write_f64(&mut self, value: &f64) -> Result<(), EncodeError>;
    fn write_string_length(&mut self, length: &u32) -> Result<(), EncodeError>;
    fn write_string(&mut self, value: &str) -> Result<(), EncodeError>;
    fn write_bytes_length(&mut self, length: &u32) -> Result<(), EncodeError>;
    fn write_bytes(&mut self, buf: &[u8]) -> Result<(), EncodeError>;
    fn write_bigint(&mut self, value: &BigInt) -> Result<(), EncodeError>;
    fn write_json(&mut self, value: &JSON::Value) -> Result<(), EncodeError>;
    fn write_array_length(&mut self, length: &u32) -> Result<(), EncodeError>;
    fn write_array<T: Clone>(
        &mut self,
        array: &[T],
        arr_writer: impl FnMut(&mut Self, &T) -> Result<(), EncodeError>,
    ) -> Result<(), EncodeError>;
    fn write_map_length(&mut self, length: &u32) -> Result<(), EncodeError>;
    fn write_map<K, V: Clone>(
        &mut self,
        map: &BTreeMap<K, V>,
        key_writer: impl FnMut(&mut Self, &K) -> Result<(), EncodeError>,
        val_writer: impl FnMut(&mut Self, &V) -> Result<(), EncodeError>,
    ) -> Result<(), EncodeError>
    where
        K: Clone + Eq + Hash + Ord;
    fn write_nullable_bool(&mut self, value: &Option<bool>) -> Result<(), EncodeError>;
    fn write_nullable_i8(&mut self, value: &Option<i8>) -> Result<(), EncodeError>;
    fn write_nullable_i16(&mut self, value: &Option<i16>) -> Result<(), EncodeError>;
    fn write_nullable_i32(&mut self, value: &Option<i32>) -> Result<(), EncodeError>;
    fn write_nullable_u8(&mut self, value: &Option<u8>) -> Result<(), EncodeError>;
    fn write_nullable_u16(&mut self, value: &Option<u16>) -> Result<(), EncodeError>;
    fn write_nullable_u32(&mut self, value: &Option<u32>) -> Result<(), EncodeError>;
    fn write_nullable_f32(&mut self, value: &Option<f32>) -> Result<(), EncodeError>;
    fn write_nullable_f64(&mut self, value: &Option<f64>) -> Result<(), EncodeError>;
    fn write_nullable_string(&mut self, value: &Option<String>) -> Result<(), EncodeError>;
    fn write_nullable_bytes(&mut self, value: &Option<Vec<u8>>) -> Result<(), EncodeError>;
    fn write_nullable_bigint(&mut self, value: &Option<BigInt>) -> Result<(), EncodeError>;
    fn write_nullable_json(&mut self, value: &Option<JSON::Value>) -> Result<(), EncodeError>;
    fn write_nullable_array<T: Clone>(
        &mut self,
        opt_array: &Option<Vec<T>>,
        arr_writer: impl FnMut(&mut Self, &T) -> Result<(), EncodeError>,
    ) -> Result<(), EncodeError>;
    fn write_nullable_map<K, V: Clone>(
        &mut self,
        opt_map: &Option<BTreeMap<K, V>>,
        key_writer: impl FnMut(&mut Self, &K) -> Result<(), EncodeError>,
        val_writer: impl FnMut(&mut Self, &V) -> Result<(), EncodeError>,
    ) -> Result<(), EncodeError>
    where
        K: Clone + Eq + Hash + Ord;
    fn context(&mut self) -> &mut Context;
}
