export function formatCandidateName(name) {
  return String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (_match, space, letter) => `${space}${letter.toUpperCase()}`);
}
