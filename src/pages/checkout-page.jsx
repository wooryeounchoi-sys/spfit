import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { createOrder, getAddresses } from '../api/shop-api';
import PageContainer from '../components/common/page-container';
import CartItemCard from '../components/mypage/cart-item-card';
import WhiteCard from '../components/mypage/white-card';
import LightButton from '../components/ui/light-button';
import PageTitle from '../components/ui/page-title';
import StatusMessage from '../components/ui/status-message';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';
import { PAYMENT_METHOD_LABEL } from '../utils/delivery-status';
import { formatPrice } from '../utils/format-price';

const boxTitleSx = { fontSize: 15, fontWeight: 700, mb: 1.5 };

/**
 * CheckoutPage 컴포넌트 - 구매하기 (이름/배송지, 구매 품목, 결제 방법, 결제하기)
 * 실제 결제(PG)는 하지 않으며, 가격/재고는 서버에서 다시 검증한다.
 *
 * Props: 없음 (장바구니/상세페이지에서 navigate state 로 items 전달)
 *
 * Example usage:
 * navigate('/checkout', { state: { items, cartItemIds } })
 */
function CheckoutPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const showPopup = usePopup();
  const handleError = useApiError();
  const { token, member } = useAuth();
  const [addresses, setAddresses] = useState(null);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = state?.items || [];
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  useEffect(() => {
    getAddresses(token)
      .then((data) => {
        setAddresses(data);
        const defaultAddress = data.find((address) => address.is_default) || data[0];
        setAddressId(defaultAddress ? defaultAddress.id : '');
      })
      .catch(handleError);
  }, [token, handleError]);

  const togglePayment = (method) => setPaymentMethod((prev) => (prev === method ? null : method));

  const handlePay = async () => {
    if (!addressId) {
      await showPopup({ message: '배송지를 등록해주세요.' });
      return;
    }
    if (!paymentMethod) {
      await showPopup({ message: '결제 방법을 선택해주세요.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createOrder(token, {
        items,
        addressId,
        paymentMethod,
        cartItemIds: state?.cartItemIds,
      });
      await showPopup({ message: `${result.recipient_name} 님 구매해주셔서 감사합니다.` });
      navigate('/');
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length) {
    return <StatusMessage message="구매할 상품이 없습니다." />;
  }
  if (!addresses) {
    return <StatusMessage isLoading />;
  }

  return (
    <PageContainer maxWidth={ 800 } bgcolor="#F5F5F5">
      <PageTitle>구매하기</PageTitle>
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
        <WhiteCard minHeight={ 150 }>
          <Box sx={ boxTitleSx }>{ `주문자: ${member?.name ?? ''}` }</Box>
          { addresses.length === 0 ? (
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' } }>
              <span>저장하신 배송지가 없습니다.</span>
              <Box component={ RouterLink } to="/mypage/account/address" sx={ { color: '#000000', fontWeight: 700 } }>배송지 등록하기</Box>
            </Box>
          ) : (
            <Select
              value={ addressId }
              onChange={ (event) => setAddressId(event.target.value) }
              input={ <InputBase sx={ { width: '100%', bgcolor: '#F5F5F5', px: 2, py: 1, fontSize: 15 } } /> }
              inputProps={ { 'aria-label': '배송지 선택' } }
            >
              { addresses.map((address) => (
                <MenuItem key={ address.id } value={ address.id } sx={ { fontSize: 15, whiteSpace: 'normal' } }>
                  { `[${address.address_name}] ${address.road_address} ${address.detail_address}` }
                </MenuItem>
              )) }
            </Select>
          ) }
        </WhiteCard>

        <WhiteCard sx={ { height: 400, display: 'flex', flexDirection: 'column' } }>
          <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 } }>
            <Box sx={ { fontWeight: 700 } }>{ `구매 품목 (총 수량 ${totalQuantity}개)` }</Box>
            <Box sx={ { fontWeight: 700, fontSize: 18 } }>{ `총 금액 ${formatPrice(totalAmount)}` }</Box>
          </Box>
          <Box sx={ { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#F5F5F5', p: 1 } }>
            { items.map((item) => (
              <CartItemCard key={ item.option_id } item={ item } isEditable={ false } />
            )) }
          </Box>
        </WhiteCard>

        <WhiteCard minHeight={ 200 }>
          <Box sx={ boxTitleSx }>결제 방법 선택</Box>
          <Box sx={ { display: 'flex', gap: '5px' } }>
            { Object.entries(PAYMENT_METHOD_LABEL).map(([method, label]) => (
              <LightButton
                key={ method }
                width={ 200 }
                fontSize={ 15 }
                isActive={ paymentMethod === method }
                onClick={ () => togglePayment(method) }
              >
                { label }
              </LightButton>
            )) }
          </Box>
          <Box sx={ { mt: 2, fontSize: 13, color: '#666666' } }>
            가상 쇼핑몰로 실제 결제는 진행되지 않습니다. 선택한 버튼을 다시 누르면 선택이 취소됩니다.
          </Box>
        </WhiteCard>

        <Box sx={ { display: 'flex', justifyContent: 'center', mt: 1 } }>
          <LightButton width={ 405 } onClick={ isSubmitting ? undefined : handlePay }>결제하기</LightButton>
        </Box>
      </Box>
    </PageContainer>
  );
}

export default CheckoutPage;
