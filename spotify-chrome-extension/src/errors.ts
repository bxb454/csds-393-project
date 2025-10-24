//wrapper function for making errors. Custom error handling.
//forgot to add this.

export function make(code: string, message: string): Error {
  const err = new Error(message);
  (err as any).code = code;
  return err;
}