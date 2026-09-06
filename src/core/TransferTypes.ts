export type SenderState = 
  | 'IDLE'
  | 'SELECTING_FILE'
  | 'VALIDATING_FILE'
  | 'PREPARING'
  | 'READY'
  | 'TRANSMITTING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ERROR';

export type ReceiverState = 
  | 'IDLE'
  | 'REQUESTING_CAMERA'
  | 'SCANNING'
  | 'TRANSFER_DETECTED'
  | 'RECEIVING'
  | 'RECONSTRUCTING'
  | 'VERIFYING'
  | 'SUCCESS'
  | 'ERROR';

export interface FileMetadata {
  transferId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  sha256: string;
  totalFrames: number;
  chunkSize: number;
}

export interface FrameData {
  transferId: string;
  frameNumber: number; // 0 for Metadata Header, 1..N for payload frames
  totalFrames: number;
  payloadSize: number;
  crc32: number;
  payloadB64: string;
}

export interface TransferProgress {
  totalFrames: number;
  receivedFramesCount: number;
  percent: number;
  receivedBytes: number;
  totalBytes: number;
  missingFrameNumbers: number[];
  duplicateCount: number;
  corruptedCount: number;
}
