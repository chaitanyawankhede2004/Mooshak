import { describe, it, expect } from 'vitest';
import { prepareFileForTransfer, MAX_FILE_SIZE_BYTES } from './Chunker';
import { FrameEncoder } from './FrameEncoder';
import { FrameAssembler } from './FrameAssembler';
import { FileReconstructor } from './FileReconstructor';

describe('Mooshak Core Transfer Protocol', () => {
  it('should validate and reject files > 50 MB', async () => {
    const oversizedBlob = new Blob([new Uint8Array(MAX_FILE_SIZE_BYTES + 1024)]);
    const fakeFile = new File([oversizedBlob], 'huge_video.mp4', { type: 'video/mp4' });

    await expect(prepareFileForTransfer(fakeFile)).rejects.toThrow('exceeds maximum supported limit of 50 MB');
  });

  it('should chunk, encode, transmit out-of-order, assemble and verify a test file', async () => {
    // 1. Create a synthetic test file (e.g. 5 KB text/binary file)
    const testData = new Uint8Array(5000);
    for (let i = 0; i < testData.length; i++) {
      testData[i] = (i * 31 + 7) % 256;
    }
    const testFile = new File([testData], 'sample_doc.pdf', { type: 'application/pdf' });

    // 2. Prepare file
    const prepared = await prepareFileForTransfer(testFile, 256);
    expect(prepared.chunks.length).toBe(Math.ceil(5000 / 256));
    expect(prepared.metadata.totalFrames).toBe(prepared.chunks.length);

    // 3. Encode Header Frame 0
    const headerQrStr = FrameEncoder.encodeHeaderFrame(prepared.metadata);
    expect(headerQrStr).toContain('MSK1|0|');

    // 4. Encode Data Frames 1..N
    const qrFrames: string[] = [];
    prepared.chunks.forEach((chunk, index) => {
      const qrStr = FrameEncoder.encodeDataFrame(
        prepared.metadata.transferId,
        index + 1,
        prepared.metadata.totalFrames,
        chunk
      );
      qrFrames.push(qrStr);
    });

    // 5. Setup Receiver Assembler
    const assembler = new FrameAssembler();

    // Decode Header Frame
    const headerRes = assembler.addFrame(headerQrStr);
    expect(headerRes.accepted).toBe(true);

    // Shuffle data frames to test out-of-order & duplicate handling!
    const shuffledFrames = [...qrFrames].sort(() => Math.random() - 0.5);
    
    // Add shuffled frames
    shuffledFrames.forEach((frameStr) => {
      assembler.addFrame(frameStr);
    });

    // Add a duplicate frame to test duplicate resilience
    const dupRes = assembler.addFrame(shuffledFrames[0]);
    expect(dupRes.duplicate).toBe(true);

    // Verify progress
    expect(assembler.isComplete()).toBe(true);
    const progress = assembler.getProgress();
    expect(progress.percent).toBe(100);
    expect(progress.missingFrameNumbers.length).toBe(0);

    // 6. Reconstruct file and verify SHA-256
    const result = await FileReconstructor.reconstructAndVerify(assembler);
    expect(result.isVerified).toBe(true);

    const reconstructedBytes = new Uint8Array(await result.blob.arrayBuffer());
    expect(reconstructedBytes.length).toBe(testData.length);
    expect(reconstructedBytes).toEqual(testData);
  });

  it('should detect corrupted frames via CRC32 checksum', () => {
    const payload = new Uint8Array([10, 20, 30, 40]);
    const qrStr = FrameEncoder.encodeDataFrame('TRX123', 1, 10, payload);

    // Corrupt one character in the payload
    const corruptedQrStr = qrStr.slice(0, -3) + 'XYZ';

    const assembler = new FrameAssembler();
    const res = assembler.addFrame(corruptedQrStr);
    expect(res.accepted).toBe(false);
    expect(res.error).toBeDefined();
  });
});
