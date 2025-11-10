import { customAlphabet } from 'nanoid'

// you can control the alphabet and length
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);

export function generateId(prefix: string, length = 10) {
  return `${prefix}_${nanoid(length)}`;
}
