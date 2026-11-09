import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { addAddress, deleteAddress, getAddresses, setDefaultAddress } from '../api/shop-api';
import PageContainer from '../components/common/page-container';
import AddressForm from '../components/mypage/address-form';
import WhiteCard from '../components/mypage/white-card';
import LightButton from '../components/ui/light-button';
import PageTitle from '../components/ui/page-title';
import StatusMessage from '../components/ui/status-message';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';

const smallButtonSx = { fontSize: 13, color: '#666666', minWidth: 0, px: 1 };

/**
 * AddressPage 컴포넌트 - 배송지 관리 (조회 / 추가 / 기본 배송지 설정 / 삭제)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/account/address" element={<AddressPage />} />
 */
function AddressPage() {
  const { token } = useAuth();
  const showPopup = usePopup();
  const handleError = useApiError();
  const [addresses, setAddresses] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = useCallback(() => {
    getAddresses(token).then(setAddresses).catch(handleError);
  }, [token, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (roadAddress, detailAddress) => {
    if (!roadAddress.trim()) {
      await showPopup({ message: '도로명 주소를 입력해주세요.' });
      return;
    }
    try {
      await addAddress(token, roadAddress, detailAddress);
      setIsFormOpen(false);
      await showPopup({ message: '배송지가 저장되었습니다.' });
      load();
    } catch (error) {
      handleError(error);
    }
  };

  const runAndReload = (action) => async () => {
    try {
      await action();
      load();
    } catch (error) {
      handleError(error);
    }
  };

  if (!addresses) {
    return <StatusMessage isLoading />;
  }

  return (
    <PageContainer maxWidth={ 800 } bgcolor="#F5F5F5">
      <PageTitle>배송지 관리</PageTitle>
      { addresses.length === 0 ? (
        <WhiteCard width={ 600 } minHeight={ 100 } sx={ { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 } }>
          저장하신 배송지가 없습니다.
        </WhiteCard>
      ) : (
        <WhiteCard minHeight={ 300 } sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
          { addresses.map((address) => (
            <Box key={ address.id } sx={ { pb: 2, borderBottom: '1px solid #EEEEEE', '&:last-of-type': { borderBottom: 'none', pb: 0 } } }>
              <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 } }>
                { address.address_name }
                { address.is_default && (
                  <Box component="span" sx={ { fontSize: 11, color: '#FFFFFF', bgcolor: '#363A36', px: 1, py: 0.25 } }>기본 배송지</Box>
                ) }
              </Box>
              <Box sx={ { mt: 0.75, lineHeight: 1.6 } }>{ address.road_address }</Box>
              <Box sx={ { color: '#666666', lineHeight: 1.6, whiteSpace: 'pre-line' } }>{ address.detail_address }</Box>
              <Box sx={ { display: 'flex', justifyContent: 'flex-end', gap: 0.5 } }>
                { !address.is_default && (
                  <Button sx={ smallButtonSx } onClick={ runAndReload(() => setDefaultAddress(token, address.id)) }>기본 배송지로 설정</Button>
                ) }
                <Button sx={ smallButtonSx } onClick={ runAndReload(() => deleteAddress(token, address.id)) }>삭제</Button>
              </Box>
            </Box>
          )) }
        </WhiteCard>
      ) }
      <Box sx={ { mt: 3 } }>
        { isFormOpen ? (
          <AddressForm onSave={ handleSave } onCancel={ () => setIsFormOpen(false) } />
        ) : (
          <Box sx={ { display: 'flex', justifyContent: 'center' } }>
            <LightButton width={ 300 } onClick={ () => setIsFormOpen(true) }>
              { addresses.length === 0 ? '입력하기' : '배송지 추가하기' }
            </LightButton>
          </Box>
        ) }
      </Box>
    </PageContainer>
  );
}

export default AddressPage;
