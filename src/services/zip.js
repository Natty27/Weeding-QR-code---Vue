/**
 * Minimal ZIP writer, store mode (no compression).
 *
 * Deliberately dependency-free: the invitation cards are PNG/JPEG, which are
 * already compressed, so deflating them again would buy nothing - and adding a
 * package would mean an npm install on the server before the next deploy.
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i++) {
    let c = i;

    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[i] = c >>> 0;
  }

  return table;
})();

const crc32 = (bytes) => {
  let crc = 0xffffffff;

  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

/** MS-DOS date and time, which is what the ZIP header stores */
const dosStamp = (date) => ({
  time:
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() / 2) & 0x1f),
  date:
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f),
});

/**
 * @param {{name: string, data: Uint8Array}[]} files
 * @returns {Blob} a ZIP archive
 */
export const createZip = (files) => {
  const encoder = new TextEncoder();
  const stamp = dosStamp(new Date());
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);

    const local = new DataView(new ArrayBuffer(30));

    local.setUint32(0, 0x04034b50, true); // local file header
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0, true); // flags
    local.setUint16(8, 0, true); // method: store
    local.setUint16(10, stamp.time, true);
    local.setUint16(12, stamp.date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, file.data.length, true); // compressed size
    local.setUint32(22, file.data.length, true); // uncompressed size
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true); // extra length

    chunks.push(new Uint8Array(local.buffer), name, file.data);

    const entry = new DataView(new ArrayBuffer(46));

    entry.setUint32(0, 0x02014b50, true); // central directory header
    entry.setUint16(4, 20, true); // version made by
    entry.setUint16(6, 20, true); // version needed
    entry.setUint16(8, 0, true);
    entry.setUint16(10, 0, true);
    entry.setUint16(12, stamp.time, true);
    entry.setUint16(14, stamp.date, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, file.data.length, true);
    entry.setUint32(24, file.data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint16(30, 0, true); // extra
    entry.setUint16(32, 0, true); // comment
    entry.setUint16(34, 0, true); // disk number
    entry.setUint16(36, 0, true); // internal attrs
    entry.setUint32(38, 0, true); // external attrs
    entry.setUint32(42, offset, true); // offset of local header

    central.push(new Uint8Array(entry.buffer), name);
    offset += 30 + name.length + file.data.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));

  end.setUint32(0, 0x06054b50, true); // end of central directory
  end.setUint16(4, 0, true);
  end.setUint16(6, 0, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  end.setUint16(20, 0, true); // comment length

  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], {
    type: "application/zip",
  });
};
