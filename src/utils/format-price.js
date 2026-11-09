/**
 * 숫자를 원화 표기로 변환 (141550 -> "141,550원")
 *
 * @param {number} value - 금액
 * @returns {string} 표기 문자열
 */
export function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}
