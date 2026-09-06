// Standard IEEE 802.3 CRC-32 implementation

const makeCRCTable = (): Uint32Array => {
  const cTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    cTable[n] = c;
  }
  return cTable;
};

const crcTable = makeCRCTable();

export const calculateCRC32 = (buffer: Uint8Array | string): number => {
  let crc = 0xFFFFFFFF;
  if (typeof buffer === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(buffer);
  }
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buffer[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};
