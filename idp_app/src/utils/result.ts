/**
 * Result type for handling operations that can succeed or fail
 * This provides a type-safe way to handle errors without throwing exceptions
 */

export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Create a successful result
 */
export const Ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * Create a failed result
 */
export const Err = <E = Error>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * Type guard to check if a result is successful
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => {
  return result.ok === true;
};

/**
 * Type guard to check if a result is an error
 */
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => {
  return result.ok === false;
};

/**
 * Map a successful result to a new value
 */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => {
  if (isOk(result)) {
    return Ok(fn(result.value));
  }
  return result;
};

/**
 * Map an error result to a new error
 */
export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (isErr(result)) {
    return Err(fn(result.error));
  }
  return result;
};

/**
 * Chain multiple result-returning operations
 */
export const chainResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> => {
  if (isOk(result)) {
    return fn(result.value);
  }
  return result;
};

/**
 * Convert a promise to a Result type
 */
export const fromPromise = async <T, E = Error>(
  promise: Promise<T>,
  mapError?: (error: unknown) => E
): Promise<Result<T, E>> => {
  try {
    const value = await promise;
    return Ok(value);
  } catch (error) {
    if (mapError) {
      return Err(mapError(error));
    }
    return Err(error as E);
  }
};

/**
 * Unwrap a result or throw if it's an error
 * Use sparingly - prefer handling both cases explicitly
 */
export const unwrapOrThrow = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.value;
  }
  throw result.error;
};

/**
 * Unwrap a result or return a default value
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (isOk(result)) {
    return result.value;
  }
  return defaultValue;
};

/**
 * Collect an array of results into a single result
 * Returns Ok with all values if all are Ok, or the first Err encountered
 */
export const collectResults = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = [];
  
  for (const result of results) {
    if (isErr(result)) {
      return result;
    }
    values.push(result.value);
  }
  
  return Ok(values);
};