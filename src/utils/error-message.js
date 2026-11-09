/** 서버 오류 코드 -> 사용자 안내 문구 */
const MESSAGES = {
  DB_NOT_CONFIGURED: '데이터베이스가 아직 연결되지 않았습니다.',
  AUTH_REQUIRED: '로그인이 필요합니다. 다시 로그인 해주세요.',
  OUT_OF_STOCK: '재고가 부족합니다.',
  OPTION_NOT_AVAILABLE: '선택하신 옵션은 현재 구매할 수 없습니다.',
  INVALID_QUANTITY: '수량을 다시 확인해주세요. (1~99개)',
  ADDRESS_REQUIRED: '배송지를 등록해주세요.',
  INVALID_PAYMENT_METHOD: '결제 방법을 선택해주세요.',
  EMPTY_ORDER: '구매할 상품이 없습니다.',
  REVIEW_NOT_PURCHASED: '구매하지 않은 제품입니다.',
  ALREADY_REVIEWED: '이미 리뷰를 작성한 상품입니다.',
  INVALID_RATING: '별점을 선택해주세요.',
  EMPTY_CONTENT: '리뷰 내용을 입력해주세요.',
  FORBIDDEN: '본인이 작성한 리뷰만 수정/삭제할 수 있습니다.',
  NOT_FOUND: '정보를 찾을 수 없습니다.',
  PRODUCT_NOT_FOUND: '상품을 찾을 수 없습니다.',
  MISSING_ROAD_ADDRESS: '도로명 주소를 입력해주세요.',
  INVALID_LOGIN_ID: '아이디는 영문, 숫자, _ 조합 4~20자로 입력해주세요.',
  WEAK_PASSWORD: '비밀번호는 4자 이상 입력해주세요.',
  INVALID_EMAIL: '이메일 형식을 확인해주세요.',
  DUPLICATE_LOGIN_ID: '중복된 아이디 입니다. 다시 입력해주세요.',
};

/**
 * 오류 객체(또는 코드)를 안내 문구로 변환
 *
 * @param {Error|string} error - 오류
 * @returns {string} 안내 문구
 */
export function errorMessage(error) {
  const code = typeof error === 'string' ? error : error?.message;
  const matched = Object.keys(MESSAGES).find((key) => code && code.includes(key));
  return matched ? MESSAGES[matched] : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
}
