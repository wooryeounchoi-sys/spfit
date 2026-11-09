/**
 * 평면 카테고리 목록(parent_id 기반)을 다루는 순수 함수 모음
 */

/** 특정 부모의 자식 카테고리 (sort_order 순) */
export function getChildren(categories, parentId) {
  return categories
    .filter((category) => category.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** 최상위 → 해당 카테고리까지의 경로 */
export function getCategoryPath(categories, categoryId) {
  const path = [];
  let current = categories.find((category) => category.id === categoryId);
  while (current) {
    path.unshift(current);
    const parentId = current.parent_id;
    current = parentId ? categories.find((category) => category.id === parentId) : null;
  }
  return path;
}

/** 경로 문자열 (Men/상의/반팔 티셔츠) */
export function getCategoryLabel(categories, categoryId) {
  return getCategoryPath(categories, categoryId).map((category) => category.name).join('/');
}
