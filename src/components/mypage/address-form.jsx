import { useState } from 'react';
import Box from '@mui/material/Box';
import FormInput from '../ui/form-input';
import LightButton from '../ui/light-button';

/**
 * AddressForm 컴포넌트 - 배송지 입력 (도로명 주소 800*50 / 상세주소 800*150 / 저장하기)
 *
 * Props:
 * @param {function} onSave - 저장하기 클릭 시 실행 (roadAddress, detailAddress) [Required]
 * @param {function} onCancel - 취소 시 실행 [Optional]
 *
 * Example usage:
 * <AddressForm onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
 */
function AddressForm({ onSave, onCancel }) {
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  return (
    <Box sx={ { width: '100%', maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 } }>
      <FormInput
        width={ 800 }
        value={ roadAddress }
        onChange={ (e) => setRoadAddress(e.target.value) }
        placeholder="도로명 주소"
        sx={ { bgcolor: '#FFFFFF' } }
      />
      <FormInput
        width={ 800 }
        height={ 150 }
        isMultiline
        value={ detailAddress }
        onChange={ (e) => setDetailAddress(e.target.value) }
        placeholder="상세주소"
        sx={ { bgcolor: '#FFFFFF' } }
      />
      <Box sx={ { display: 'flex', gap: 1.5, justifyContent: 'flex-end' } }>
        { onCancel && <LightButton width={ 200 } fontSize={ 15 } onClick={ onCancel }>취소</LightButton> }
        <LightButton width={ 200 } fontSize={ 15 } isActive onClick={ () => onSave(roadAddress, detailAddress) }>저장하기</LightButton>
      </Box>
    </Box>
  );
}

export default AddressForm;
