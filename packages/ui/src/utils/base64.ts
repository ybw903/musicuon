export function arrayBufferToBase64(buffer: Uint8Array<ArrayBufferLike>) {
  let binary = ''
  const u8 = new Uint8Array(buffer)

  for (const byte of u8) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}
