import type { FileMetadata, TransferProgress } from './TransferTypes';
import { FrameDecoder } from './FrameDecoder';
import type { DecodedResult } from './FrameDecoder';

export class FrameAssembler {
  private metadata: FileMetadata | null = null;
  private receivedFrames: Map<number, Uint8Array> = new Map();
  private duplicateCount = 0;
  private corruptedCount = 0;

  public reset() {
    this.metadata = null;
    this.receivedFrames.clear();
    this.duplicateCount = 0;
    this.corruptedCount = 0;
  }

  /**
   * Process a scanned QR code text string.
   * Returns progress status and whether a new valid frame was accepted.
   */
  public addFrame(qrText: string): { accepted: boolean; duplicate: boolean; isHeader: boolean; error?: string } {
    let result: DecodedResult;
    try {
      result = FrameDecoder.decode(qrText);
    } catch (e: any) {
      this.corruptedCount++;
      return { accepted: false, duplicate: false, isHeader: false, error: e.message || 'Corrupted frame' };
    }

    if (result.type === 'HEADER') {
      if (this.metadata && this.metadata.transferId === result.header!.transferId) {
        // Duplicate header
        this.duplicateCount++;
        return { accepted: false, duplicate: true, isHeader: true };
      }
      // If transfer ID changed, reset assembler for new file
      if (this.metadata && this.metadata.transferId !== result.header!.transferId) {
        this.reset();
      }
      this.metadata = result.header!;
      return { accepted: true, duplicate: false, isHeader: true };
    }

    if (result.type === 'DATA' && result.frame) {
      const { frameData, payloadBytes } = result.frame;

      // If we don't have header yet, create implicit metadata from frame header info
      if (!this.metadata) {
        this.metadata = {
          transferId: frameData.transferId,
          fileName: 'incoming_file',
          fileSize: 0,
          fileType: 'application/octet-stream',
          sha256: '',
          totalFrames: frameData.totalFrames,
          chunkSize: payloadBytes.length,
        };
      } else if (this.metadata.transferId !== frameData.transferId) {
        // Different transfer in progress
        this.reset();
        this.metadata = {
          transferId: frameData.transferId,
          fileName: 'incoming_file',
          fileSize: 0,
          fileType: 'application/octet-stream',
          sha256: '',
          totalFrames: frameData.totalFrames,
          chunkSize: payloadBytes.length,
        };
      }

      if (this.receivedFrames.has(frameData.frameNumber)) {
        this.duplicateCount++;
        return { accepted: false, duplicate: true, isHeader: false };
      }

      this.receivedFrames.set(frameData.frameNumber, payloadBytes);
      return { accepted: true, duplicate: false, isHeader: false };
    }

    return { accepted: false, duplicate: false, isHeader: false };
  }

  public getMetadata(): FileMetadata | null {
    return this.metadata;
  }

  public isComplete(): boolean {
    if (!this.metadata || this.metadata.totalFrames === 0) return false;
    return this.receivedFrames.size === this.metadata.totalFrames;
  }

  public getProgress(): TransferProgress {
    const totalFrames = this.metadata?.totalFrames || 0;
    const receivedFramesCount = this.receivedFrames.size;
    const percent = totalFrames > 0 ? Math.floor((receivedFramesCount / totalFrames) * 100) : 0;

    let receivedBytes = 0;
    for (const chunk of this.receivedFrames.values()) {
      receivedBytes += chunk.length;
    }

    const missingFrameNumbers: number[] = [];
    if (totalFrames > 0) {
      for (let i = 1; i <= totalFrames; i++) {
        if (!this.receivedFrames.has(i)) {
          missingFrameNumbers.push(i);
        }
      }
    }

    return {
      totalFrames,
      receivedFramesCount,
      percent,
      receivedBytes,
      totalBytes: this.metadata?.fileSize || receivedBytes,
      missingFrameNumbers,
      duplicateCount: this.duplicateCount,
      corruptedCount: this.corruptedCount,
    };
  }

  /**
   * Reassembles all ordered payload chunks into a single Uint8Array
   */
  public getReconstructedBytes(): Uint8Array {
    if (!this.isComplete()) {
      throw new Error('Cannot reconstruct file: Not all frames have been received.');
    }

    const totalFrames = this.metadata!.totalFrames;
    let totalLength = 0;
    const chunks: Uint8Array[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const chunk = this.receivedFrames.get(i);
      if (!chunk) {
        throw new Error(`Missing frame ${i} during reconstruction.`);
      }
      chunks.push(chunk);
      totalLength += chunk.length;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }
}
