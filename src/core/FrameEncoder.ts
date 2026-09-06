import type { FileMetadata } from './TransferTypes';
import { calculateCRC32 } from '../utils/CRC32';
import { bytesToBase64 } from '../utils/Base64';

export class FrameEncoder {
  /**
   * Encodes Header Metadata into Frame 0 QR string
   */
  static encodeHeaderFrame(metadata: FileMetadata): string {
    const b64FileName = bytesToBase64(new TextEncoder().encode(metadata.fileName));
    const b64FileType = bytesToBase64(new TextEncoder().encode(metadata.fileType || 'application/octet-stream'));
    
    // Checksum content for header
    const rawHeader = `0|${metadata.transferId}|${metadata.totalFrames}|${metadata.fileSize}|${metadata.sha256}|${b64FileType}|${b64FileName}`;
    const crc = calculateCRC32(rawHeader);

    return `MSK1|0|${metadata.transferId}|${metadata.totalFrames}|${metadata.fileSize}|${metadata.sha256}|${b64FileType}|${crc}|${b64FileName}`;
  }

  /**
   * Encodes a data chunk into a Data Frame QR string (1..totalFrames)
   */
  static encodeDataFrame(
    transferId: string,
    frameNumber: number,
    totalFrames: number,
    chunk: Uint8Array
  ): string {
    const crc = calculateCRC32(chunk);
    const b64Payload = bytesToBase64(chunk);
    return `MSK1|${frameNumber}|${transferId}|${totalFrames}|${crc}|${b64Payload}`;
  }
}
