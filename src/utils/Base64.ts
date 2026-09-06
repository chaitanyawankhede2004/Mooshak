export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(binary);
  }
  return Buffer.from(binary, 'binary').toString('base64');
};

export const base64ToBytes = (b64: string): Uint8Array => {
  let binary: string;
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    binary = window.atob(b64);
  } else {
    binary = Buffer.from(b64, 'base64').toString('binary');
  }
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};
