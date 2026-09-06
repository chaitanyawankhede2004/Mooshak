import type { FileMetadata } from './TransferTypes';
import { FrameAssembler } from './FrameAssembler';
import { calculateSHA256 } from '../utils/SHA256';

export class VerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerificationError';
  }
}

export interface ReconstructedFileResult {
  blob: Blob;
  metadata: FileMetadata;
  sha256: string;
  isVerified: boolean;
}

export class FileReconstructor {
  /**
   * Reconstructs the file bytes from FrameAssembler and validates the SHA-256 checksum.
   */
  static async reconstructAndVerify(assembler: FrameAssembler): Promise<ReconstructedFileResult> {
    const metadata = assembler.getMetadata();
    if (!metadata) {
      throw new VerificationError('No metadata available for verification.');
    }

    const fileBytes = assembler.getReconstructedBytes();
    const computedSha256 = await calculateSHA256(fileBytes);

    // If metadata contains expected SHA256, verify it
    if (metadata.sha256) {
      if (computedSha256.toLowerCase() !== metadata.sha256.toLowerCase()) {
        throw new VerificationError(
          `File SHA-256 checksum mismatch!\nExpected: ${metadata.sha256}\nComputed: ${computedSha256}`
        );
      }
    }

    const blob = new Blob([fileBytes.buffer as ArrayBuffer], { type: metadata.fileType || 'application/octet-stream' });

    return {
      blob,
      metadata,
      sha256: computedSha256,
      isVerified: true,
    };
  }
}
