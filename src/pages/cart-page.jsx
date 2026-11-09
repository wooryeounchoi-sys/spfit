import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { getCart, removeCartItem, updateCartItem } from '../api/shop-api';
import PageContainer from '../components/common/page-container';
import CartItemCard from '../components/mypage/cart-item-card';
import WhiteCard from '../components/mypage/white-card';
import LightButton from '../components/ui/light-button';
import PageTitle from '../components/ui/page-title';
import StatusMessage from '../components/ui/status-message';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';
import { formatPrice } from '../utils/format-price';

/**
 * CartPage 컴포넌트 - 장바구니 (체크한 품목 총액/수량 계산, 수량 변경, 삭제, 구매하기)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/cart" element={<CartPage />} />
 */
function CartPage() {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const handleError = useApiError();
  const { token } = useAuth();
  const [items, setItems] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);

  const load = useCallback(() => {
    getCart(token).then(setItems).catch(handleError);
  }, [token, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCheck = (cartItemId, isChecked) => {
    setCheckedIds((prev) => (isChecked ? [...prev, cartItemId] : prev.filter((id) => id !== cartItemId)));
  };

  const handleQuantity = async (cartItemId, quantity) => {
    try {
      await updateCartItem(token, cartItemId, quantity);
      setItems((prev) => prev.map((item) => (item.cart_item_id === cartItemId ? { ...item, quantity } : item)));
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeCartItem(token, cartItemId);
      setItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
      setCheckedIds((prev) => prev.filter((id) => id !== cartItemId));
    } catch (error) {
      handleError(error);
    }
  };

  if (!items) {
    return <StatusMessage isLoading />;
  }

  const checkedItems = items.filter((item) => checkedIds.includes(item.cart_item_id));
  const totalQuantity = checkedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = checkedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const handleBuy = async () => {
    if (!checkedItems.length) {
      await showPopup({ message: '구매할 상품을 선택해주세요.' });
      return;
    }
    navigate('/checkout', {
      state: { items: checkedItems, cartItemIds: checkedItems.map((item) => item.cart_item_id) },
    });
  };

  return (
    <PageContainer maxWidth={ 800 } bgcolor="#F5F5F5">
      <PageTitle>장바구니</PageTitle>
      { items.length === 0 ? (
        <StatusMessage message="장바구니에 담긴 상품이 없습니다." />
      ) : (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
          { items.map((item) => (
            <CartItemCard
              key={ item.cart_item_id }
              item={ item }
              isChecked={ checkedIds.includes(item.cart_item_id) }
              onCheck={ (isChecked) => toggleCheck(item.cart_item_id, isChecked) }
              onQuantityChange={ (quantity) => handleQuantity(item.cart_item_id, quantity) }
              onRemove={ () => handleRemove(item.cart_item_id) }
            />
          )) }
          <WhiteCard sx={ { mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 } }>
            <Box>{ `선택 상품 ${checkedItems.length}건 · 총 수량 ${totalQuantity}개` }</Box>
            <Box sx={ { fontSize: 20, fontWeight: 700 } }>{ `총 금액 ${formatPrice(totalAmount)}` }</Box>
          </WhiteCard>
          <Box sx={ { display: 'flex', gap: 1.25, mt: 1.5 } }>
            <LightButton onClick={ () => setCheckedIds([]) }>취소하기</LightButton>
            <LightButton onClick={ handleBuy }>구매하기</LightButton>
          </Box>
        </Box>
      ) }
    </PageContainer>
  );
}

export default CartPage;
