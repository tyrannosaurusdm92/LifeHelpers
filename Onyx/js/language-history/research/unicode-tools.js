export function codePoints(text) {
  return Array.from(text, ch => ({
    character: ch,
    codePoint: 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
    nameHint: /\p{M}/u.test(ch) ? 'combining-mark' : 'base-or-other'
  }));
}

export function normalizeText(text, form = 'NFC') {
  if (!['NFC', 'NFD', 'NFKC', 'NFKD'].includes(form)) throw new RangeError('Unsupported Unicode normalization form');
  return String(text).normalize(form);
}

export function inspectNormalization(text) {
  const source = String(text);
  return { source, nfc: source.normalize('NFC'), nfd: source.normalize('NFD'), sourceCodePoints: codePoints(source), nfcCodePoints: codePoints(source.normalize('NFC')), nfdCodePoints: codePoints(source.normalize('NFD')) };
}

export function graphemeCount(text, locale) {
  if (typeof Intl.Segmenter !== 'function') return null;
  return Array.from(new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(String(text))).length;
}
