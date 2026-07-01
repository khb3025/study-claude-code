"use client";

// useDebounceValue<T>(value, delay, options?) → [debouncedValue, setValue]
// useDebounceCallback(fn, delay, options?) → debouncedFn
// 용도: 검색 인풋, API 호출 빈도 제한
export { useDebounceValue, useDebounceCallback } from "usehooks-ts";
