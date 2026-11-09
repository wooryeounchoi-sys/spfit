/**
 * DB 에 저장된 상대 경로(img_spfit/...)를 배포 경로(base)에 맞는 URL 로 변환
 *
 * @param {string} path - DB 이미지 경로
 * @returns {string} 실제 URL (경로가 없으면 빈 문자열)
 */
export function imageUrl(path) {
  if (!path) {
    return '';
  }
  return `${import.meta.env.BASE_URL}${path}`;
}
