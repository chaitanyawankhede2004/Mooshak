import type { FileMetadata } from './TransferTypes';
import { calculateSHA256 } from '../utils/SHA256';

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const DEFAULT_CHUNK_SIZE = 300; // 300 bytes payload per frame

export interface PreparedTransfer {
  metadata: FileMetadata;
  chunks: Uint8Array[];
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * Validates and chunks a file for optical transmission.
 */
export async function prepareFileForTransfer(
  file: File,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  onProgress?: (stage: 'READING' | 'HASHING' | 'CHUNKING', percent: number) => void
): Promise<PreparedTransfer> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileValidationError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum supported limit of 50 MB.`);
  }
  if (file.size === 0) {
    throw new FileValidationError('File is empty.');
  }

  onProgress?.('READING', 10);
  const arrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  onProgress?.('HASHING', 50);
  const sha256 = await calculateSHA256(arrayBuffer);

  onProgress?.('CHUNKING', 80);
  const totalFrames = Math.ceil(fileBytes.length / chunkSize);
  const chunks: Uint8Array[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileBytes.length);
    chunks.push(fileBytes.subarray(start, end));
  }

  const transferId = Math.random().toString(36).substring(2, 10).toUpperCase();

  const metadata: FileMetadata = {
    transferId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    sha256,
    totalFrames,
    chunkSize,
  };

  onProgress?.('CHUNKING', 100);

  return {
    metadata,
    chunks,
  };
}
