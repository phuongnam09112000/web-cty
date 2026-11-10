import { AppError } from "./errors.js";

const MAX_ID = 18446744073709551615n;

export function parseId(value: string): bigint {
  if (/^[1-9][0-9]*$/.test(value)) {
    const id = BigInt(value);
    if (id <= MAX_ID) return id;
  }
  throw new AppError(404, "NOT_FOUND", "Không tìm thấy");
}
