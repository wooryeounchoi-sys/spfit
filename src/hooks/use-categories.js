import { useEffect, useState } from 'react';
import { getCategories } from '../api/catalog-api';

/** 카테고리는 자주 바뀌지 않으므로 앱 실행 동안 한 번만 조회해 공유 */
let cache = null;
let pending = null;

function fetchCategories() {
  if (!pending) {
    pending = getCategories()
      .then((data) => {
        cache = data || [];
        return cache;
      })
      .catch((error) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}

/**
 * 카테고리 목록 조회 훅
 * @returns {{ categories: Array, isLoading: boolean, error: Error|null }}
 */
export default function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  const [isLoading, setIsLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) {
      return undefined;
    }
    let isActive = true;
    fetchCategories()
      .then((data) => {
        if (isActive) {
          setCategories(data);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  return { categories, isLoading, error };
}
