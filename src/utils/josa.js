/**
 * 단어의 받침 유무에 맞춰 조사를 붙인다. (이름 -> 이름을, 아이디 -> 아이디를)
 *
 * @param {string} word - 단어
 * @param {string} pair - '을/를', '이/가' 형태의 조사 쌍
 * @returns {string} 조사가 붙은 단어
 */
export function withJosa(word, pair) {
  const [withBatchim, withoutBatchim] = pair.split('/');
  const lastChar = word.charCodeAt(word.length - 1);
  const isHangul = lastChar >= 0xac00 && lastChar <= 0xd7a3;
  const hasBatchim = isHangul && (lastChar - 0xac00) % 28 !== 0;
  return `${word}${hasBatchim ? withBatchim : withoutBatchim}`;
}
