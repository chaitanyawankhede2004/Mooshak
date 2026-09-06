import type { FileMetadata, FrameData } from './TransferTypes';
import { calculateCRC32 } from '../utils/CRC32';
import { base64ToBytes } from '../utils/Base64';

export class InvalidFrameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFrameError';
  }
}

export interface DecodedResult {
  type: 'HEADER' | 'DATA';
  header?: FileMetadata;
  frame?: {
    frameData: FrameData;
    payloadBytes: Uint8Array;
  };
}

export class FrameDecoder {
  /**
   * Decodes a scanned QR code string into either Header metadata or a Data Frame
   */
  static decode(qrText: string): DecodedResult {
    if (!qrText || !qrText.startsWith('MSK1|')) {
      throw new InvalidFrameError('Not a valid Mooshak frame format.');
    }

    const parts = qrText.split('|');
    if (parts.length < 6) {
      throw new InvalidFrameError('Incomplete frame data structure.');
    }

    const [, frameNumStr, transferId, totalFramesStr] = parts;
    const frameNumber = parseInt(frameNumStr, 10);
    const totalFrames = parseInt(totalFramesStr, 10);

    if (isNaN(frameNumber) || isNaN(totalFrames)) {
      throw new InvalidFrameError('Invalid numeric values in frame header.');
    }

    if (frameNumber === 0) {
      // Header Frame format: MSK1|0|<transferId>|<totalFrames>|<fileSize>|<sha256>|<b64FileType>|<crc>|<b64FileName>
      if (parts.length < 9) {
        throw new InvalidFrameError('Invalid header frame structure.');
      }
      const fileSize = parseInt(parts[4], 10);
      const sha256 = parts[5];
      const b64FileType = parts[6];
      const crcStr = parts[7];
      const b64FileName = parts[8];

      const expectedCrc = parseInt(crcStr, 10);
      const rawHeader = `0|${transferId}|${totalFrames}|${fileSize}|${sha256}|${b64FileType}|${b64FileName}`;
      const actualCrc = calculateCRC32(rawHeader);

      if (expectedCrc !== actualCrc) {
        throw new InvalidFrameError('Header frame CRC checksum mismatch.');
      }

      let fileName = 'transferred_file';
      let fileType = 'application/octet-stream';
      try {
        fileName = new TextDecoder().decode(base64ToBytes(b64FileName));
        fileType = new TextDecoder().decode(base64ToBytes(b64FileType));
      } catch (e) {
        // Fallback if decoding filename fails
      }

      const header: FileMetadata = {
        transferId,
        fileName,
        fileSize,
        fileType,
        sha256,
        totalFrames,
        chunkSize: 0,
      };

      return {
        type: 'HEADER',
        header,
      };
    } else {
      // Data Frame format: MSK1|<frameNumber>|<transferId>|<totalFrames>|<crc>|<b64Payload>
      if (parts.length < 6) {
        throw new InvalidFrameError('Invalid data frame structure.');
      }

      const crcStr = parts[4];
      const b64Payload = parts[5];
      const expectedCrc = parseInt(crcStr, 10);

      let payloadBytes: Uint8Array;
      try {
        payloadBytes = base64ToBytes(b64Payload);
      } catch (e) {
        throw new InvalidFrameError('Failed to decode base64 payload.');
      }

      const actualCrc = calculateCRC32(payloadBytes);
      if (expectedCrc !== actualCrc) {
        throw new InvalidFrameError(`CRC checksum mismatch for frame ${frameNumber}.`);
      }

      const frameData: FrameData = {
        transferId,
        frameNumber,
        totalFrames,
        payloadSize: payloadBytes.length,
        crc32: expectedCrc,
        payloadB64: b64Payload,
      };

      return {
        type: 'DATA',
        frame: {
          frameData,
          payloadBytes,
        },
      };
    }
  }
}
