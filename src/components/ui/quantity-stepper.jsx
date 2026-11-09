import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';

/**
 * QuantityStepper 컴포넌트 - 수량 조절 (- 숫자 +)
 *
 * Props:
 * @param {number} value - 현재 수량 [Required]
 * @param {function} onChange - 수량 변경 시 실행 (새 수량 전달) [Required]
 * @param {number} max - 최대 수량 [Optional, 기본값: 99]
 *
 * Example usage:
 * <QuantityStepper value={qty} onChange={setQty} max={stock} />
 */
function QuantityStepper({ value, onChange, max = 99 }) {
  const limit = Math.max(1, Math.min(max, 99));
  return (
    <Box
      sx={ { display: 'inline-flex', alignItems: 'center', bgcolor: '#F0F0F0' } }
      onClick={ (event) => event.stopPropagation() }
    >
      <IconButton size="small" aria-label="수량 감소" disabled={ value <= 1 } onClick={ () => onChange(value - 1) }>
        <Remove fontSize="small" />
      </IconButton>
      <Box sx={ { minWidth: 32, textAlign: 'center', fontSize: 15 } }>{ value }</Box>
      <IconButton size="small" aria-label="수량 증가" disabled={ value >= limit } onClick={ () => onChange(value + 1) }>
        <Add fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default QuantityStepper;
