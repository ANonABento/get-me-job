export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

const FILE_SIGNATURES: Record<string, number[]> = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
  "application/msword": [0xd0, 0xcf, 0x11, 0xe0],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [0x50, 0x4b, 0x03, 0x04],
};

export function validateFileMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType];

  if (mimeType === "text/plain") {
    try {
      const text = buffer.toString("utf8");
      return !text.includes("\x00");
    } catch {
      return false;
    }
  }

  if (!signature) {
    return true;
  }

  if (buffer.length < signature.length) {
    return false;
  }

  return signature.every((byte, index) => buffer[index] === byte);
}
