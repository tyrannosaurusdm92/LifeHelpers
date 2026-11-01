(() => {
  'use strict';

  const TEXT_FRAMES = new Set(['TIT2', 'TPE1', 'TPE2', 'TALB', 'TDRC', 'TYER']);

  function cleanText(value) {
    return String(value || '')
      .replace(/\u0000/g, '')
      .replace(/^\uFEFF/, '')
      .trim();
  }

  function syncSafeToInt(bytes, offset) {
    return ((bytes[offset] & 0x7f) << 21)
      | ((bytes[offset + 1] & 0x7f) << 14)
      | ((bytes[offset + 2] & 0x7f) << 7)
      | (bytes[offset + 3] & 0x7f);
  }

  function bigEndian32(bytes, offset) {
    return (((bytes[offset] << 24) >>> 0)
      | (bytes[offset + 1] << 16)
      | (bytes[offset + 2] << 8)
      | bytes[offset + 3]) >>> 0;
  }

  function decodeUtf16BE(bytes) {
    const swapped = new Uint8Array(bytes.length - (bytes.length % 2));
    for (let i = 0; i < swapped.length; i += 2) {
      swapped[i] = bytes[i + 1];
      swapped[i + 1] = bytes[i];
    }
    return new TextDecoder('utf-16le').decode(swapped);
  }

  function decodeTextFrame(frameBytes) {
    if (!frameBytes || frameBytes.length < 2) return '';
    const encoding = frameBytes[0];
    let body = frameBytes.subarray(1);

    try {
      if (encoding === 0) return cleanText(new TextDecoder('latin1').decode(body));
      if (encoding === 3) return cleanText(new TextDecoder('utf-8').decode(body));

      if (encoding === 1) {
        if (body.length >= 2 && body[0] === 0xff && body[1] === 0xfe) {
          body = body.subarray(2);
          return cleanText(new TextDecoder('utf-16le').decode(body));
        }
        if (body.length >= 2 && body[0] === 0xfe && body[1] === 0xff) {
          body = body.subarray(2);
          return cleanText(decodeUtf16BE(body));
        }
        return cleanText(new TextDecoder('utf-16le').decode(body));
      }

      if (encoding === 2) return cleanText(decodeUtf16BE(body));
    } catch (error) {
      console.warn('Metadata text decode failed:', error);
    }

    return '';
  }

  function parseId3v2(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 10) return null;
    if (String.fromCharCode(bytes[0], bytes[1], bytes[2]) !== 'ID3') return null;

    const version = bytes[3];
    if (![2, 3, 4].includes(version)) return null;

    const flags = bytes[5];
    const tagSize = syncSafeToInt(bytes, 6);
    const tagEnd = Math.min(bytes.length, 10 + tagSize);
    let offset = 10;

    if ((flags & 0x40) && version >= 3 && offset + 4 <= tagEnd) {
      const extendedSize = version === 4
        ? syncSafeToInt(bytes, offset)
        : bigEndian32(bytes, offset);
      offset += Math.max(4, extendedSize + (version === 3 ? 4 : 0));
    }

    const found = {};

    while (offset < tagEnd) {
      let frameId = '';
      let frameSize = 0;
      let headerSize = 0;

      if (version === 2) {
        if (offset + 6 > tagEnd) break;
        frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
        if (!/[A-Z0-9]{3}/.test(frameId)) break;
        frameSize = (bytes[offset + 3] << 16) | (bytes[offset + 4] << 8) | bytes[offset + 5];
        headerSize = 6;
      } else {
        if (offset + 10 > tagEnd) break;
        frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
        if (!/[A-Z0-9]{4}/.test(frameId)) break;
        frameSize = version === 4 ? syncSafeToInt(bytes, offset + 4) : bigEndian32(bytes, offset + 4);
        headerSize = 10;
      }

      if (!frameSize || offset + headerSize + frameSize > tagEnd) break;

      const dataStart = offset + headerSize;
      const frameBytes = bytes.subarray(dataStart, dataStart + frameSize);

      const normalizedId = version === 2
        ? ({ TT2: 'TIT2', TP1: 'TPE1', TP2: 'TPE2', TAL: 'TALB', TYE: 'TYER' }[frameId] || frameId)
        : frameId;

      if (TEXT_FRAMES.has(normalizedId)) {
        const value = decodeTextFrame(frameBytes);
        if (value) found[normalizedId] = value;
      }

      offset += headerSize + frameSize;
    }

    return {
      title: found.TIT2 || '',
      artist: found.TPE1 || found.TPE2 || '',
      albumArtist: found.TPE2 || '',
      album: found.TALB || '',
      year: found.TDRC || found.TYER || ''
    };
  }

  function parseId3v1(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 128) return null;
    const offset = bytes.length - 128;
    if (String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2]) !== 'TAG') return null;

    const decode = (start, length) => cleanText(new TextDecoder('latin1').decode(bytes.subarray(start, start + length)));
    return {
      title: decode(offset + 3, 30),
      artist: decode(offset + 33, 30),
      album: decode(offset + 63, 30),
      year: decode(offset + 93, 4)
    };
  }

  function parseFilename(fileName) {
    const clean = String(fileName || '').replace(/\.[^.]+$/, '').trim();
    const separators = [' - ', ' – ', ' — '];
    for (const separator of separators) {
      if (clean.includes(separator)) {
        const [artist, ...rest] = clean.split(separator);
        return {
          artist: artist.trim() || 'Unknown Artist',
          title: rest.join(separator).trim() || clean
        };
      }
    }
    return { artist: 'Unknown Artist', title: clean || 'Untitled' };
  }

  async function readFileMetadata(file) {
    const fallback = parseFilename(file?.name);
    if (!file || typeof file.slice !== 'function') return fallback;

    try {
      const head = await file.slice(0, Math.min(file.size, 512 * 1024)).arrayBuffer();
      const v2 = parseId3v2(head);
      if (v2 && (v2.title || v2.artist)) {
        return {
          artist: v2.artist || fallback.artist,
          title: v2.title || fallback.title,
          album: v2.album || '',
          year: v2.year || ''
        };
      }
    } catch (error) {
      console.warn('ID3v2 metadata read failed:', error);
    }

    try {
      if (file.size >= 128) {
        const tail = await file.slice(Math.max(0, file.size - 128), file.size).arrayBuffer();
        const v1 = parseId3v1(tail);
        if (v1 && (v1.title || v1.artist)) {
          return {
            artist: v1.artist || fallback.artist,
            title: v1.title || fallback.title,
            album: v1.album || '',
            year: v1.year || ''
          };
        }
      }
    } catch (error) {
      console.warn('ID3v1 metadata read failed:', error);
    }

    return fallback;
  }

  window.RetroRecordMetadata = Object.freeze({
    parseFilename,
    parseId3v2,
    parseId3v1,
    readFileMetadata
  });
})();

