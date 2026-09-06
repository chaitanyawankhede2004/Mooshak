/**
 * Computes SHA-256 hash of an ArrayBuffer or Uint8Array using native Web Crypto API.
 * Returns lowercase hex string.
 */
export const calculateSHA256 = async (data: ArrayBuffer | Uint8Array): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexHash;
};
