/**
 * Pure TypeScript Zero-Dependency ZIP Archive Generator (PKZip format)
 * Supports standard ZIP format with CRC32 verification.
 */

// Precomputed CRC-32 Lookup Table
const crcTable: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

/**
 * Computes CRC-32 checksum of a byte array.
 */
function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Converts a Date into MS-DOS format time & date (2 bytes each).
 */
function getDosDateTime(date: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, date.getFullYear());
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;

  return { dosTime, dosDate };
}

export interface ZipFileInput {
  name: string;
  data: Uint8Array | Blob;
  lastModified?: Date;
}

/**
 * Builds a valid ZIP archive Blob from an array of files completely in the browser.
 */
export async function createZipBlob(files: ZipFileInput[]): Promise<Blob> {
  const textEncoder = new TextEncoder();
  const localChunks: Uint8Array[] = [];
  const centralDirectoryChunks: Uint8Array[] = [];

  let currentOffset = 0;
  const now = new Date();
  const { dosTime, dosDate } = getDosDateTime(now);

  for (const file of files) {
    const fileBytes =
      file.data instanceof Blob
        ? new Uint8Array(await file.data.arrayBuffer())
        : file.data;

    const fileNameBytes = textEncoder.encode(file.name);
    const crc = computeCrc32(fileBytes);
    const uncompressedSize = fileBytes.length;
    const compressedSize = uncompressedSize; // Method 0 (Store)

    // 1. Local File Header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + fileNameBytes.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true); // Local header signature 'PK\x03\x04'
    localView.setUint16(4, 20, true); // Version needed to extract (2.0)
    localView.setUint16(6, 0x0800, true); // General purpose bit flag (UTF-8 filename)
    localView.setUint16(8, 0, true); // Compression method (0 = Store)
    localView.setUint16(10, dosTime, true); // Last mod time
    localView.setUint16(12, dosDate, true); // Last mod date
    localView.setUint32(14, crc, true); // CRC-32
    localView.setUint32(18, compressedSize, true); // Compressed size
    localView.setUint32(22, uncompressedSize, true); // Uncompressed size
    localView.setUint16(26, fileNameBytes.length, true); // File name length
    localView.setUint16(28, 0, true); // Extra field length
    localHeader.set(fileNameBytes, 30);

    localChunks.push(localHeader);
    localChunks.push(fileBytes);

    // 2. Central Directory Header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + fileNameBytes.length);
    const centralView = new DataView(centralHeader.buffer);

    centralView.setUint32(0, 0x02014b50, true); // Central header signature 'PK\x01\x02'
    centralView.setUint16(4, 0x0314, true); // Version made by (UNIX, 2.0)
    centralView.setUint16(6, 20, true); // Version needed to extract
    centralView.setUint16(8, 0x0800, true); // General purpose bit flag (UTF-8)
    centralView.setUint16(10, 0, true); // Compression method (Store)
    centralView.setUint16(12, dosTime, true); // Last mod time
    centralView.setUint16(14, dosDate, true); // Last mod date
    centralView.setUint32(16, crc, true); // CRC-32
    centralView.setUint32(20, compressedSize, true); // Compressed size
    centralView.setUint32(24, uncompressedSize, true); // Uncompressed size
    centralView.setUint16(28, fileNameBytes.length, true); // File name length
    centralView.setUint16(30, 0, true); // Extra field length
    centralView.setUint16(32, 0, true); // File comment length
    centralView.setUint16(34, 0, true); // Disk number start
    centralView.setUint16(36, 0, true); // Internal file attributes
    centralView.setUint32(38, 0x81a40000, true); // External file attributes (regular file -rw-r--r--)
    centralView.setUint32(42, currentOffset, true); // Relative offset of local header
    centralHeader.set(fileNameBytes, 46);

    centralDirectoryChunks.push(centralHeader);

    // Advance offset
    currentOffset += localHeader.length + fileBytes.length;
  }

  // 3. End of Central Directory Record (22 bytes)
  const centralDirSize = centralDirectoryChunks.reduce((acc, c) => acc + c.length, 0);
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature 'PK\x05\x06'
  eocdView.setUint16(4, 0, true); // Number of this disk
  eocdView.setUint16(6, 0, true); // Disk where central directory starts
  eocdView.setUint16(8, files.length, true); // Number of records on this disk
  eocdView.setUint16(10, files.length, true); // Total number of records
  eocdView.setUint32(12, centralDirSize, true); // Size of central directory
  eocdView.setUint32(16, currentOffset, true); // Offset of start of central directory
  eocdView.setUint16(20, 0, true); // Comment length

  return new Blob([...localChunks, ...centralDirectoryChunks, eocd] as BlobPart[], {
    type: 'application/zip',
  });
}
