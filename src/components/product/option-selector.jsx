import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const selectSx = {
  width: '100%',
  height: 50,
  bgcolor: '#F0F0F0',
  px: 2,
  fontSize: 15,
  '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', height: '100%' },
};

const labelSx = { fontSize: 15, fontWeight: 700, mb: 1 };

/**
 * OptionSelector 컴포넌트 - 색상 / 사이즈 개별 드롭다운 (DB 에 등록된 옵션만 표시)
 *
 * Props:
 * @param {Array} options - 상품 옵션 [{ id, color, size, stock }] [Required]
 * @param {string} color - 선택된 색상 [Required]
 * @param {string} size - 선택된 사이즈 [Required]
 * @param {function} onColorChange - 색상 변경 시 실행 [Required]
 * @param {function} onSizeChange - 사이즈 변경 시 실행 [Required]
 *
 * Example usage:
 * <OptionSelector options={options} color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
 */
function OptionSelector({ options, color, size, onColorChange, onSizeChange }) {
  const colors = [...new Set(options.map((option) => option.color))];
  const sizeOptions = options.filter((option) => option.color === color);

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2.5 } }>
      <Box>
        <Box sx={ labelSx }>색상</Box>
        <Select
          value={ color }
          onChange={ (event) => {
            onColorChange(event.target.value);
            onSizeChange('');
          } }
          displayEmpty
          input={ <InputBase sx={ selectSx } /> }
          inputProps={ { 'aria-label': '색상 선택' } }
        >
          <MenuItem value="" disabled>색상을 선택하세요</MenuItem>
          { colors.map((item) => (
            <MenuItem key={ item } value={ item }>{ item }</MenuItem>
          )) }
        </Select>
      </Box>
      <Box>
        <Box sx={ labelSx }>사이즈</Box>
        <Select
          value={ size }
          onChange={ (event) => onSizeChange(event.target.value) }
          displayEmpty
          disabled={ !color }
          input={ <InputBase sx={ selectSx } /> }
          inputProps={ { 'aria-label': '사이즈 선택' } }
        >
          <MenuItem value="" disabled>{ color ? '사이즈를 선택하세요' : '색상을 먼저 선택하세요' }</MenuItem>
          { sizeOptions.map((option) => (
            <MenuItem key={ option.id } value={ option.size } disabled={ option.stock <= 0 }>
              { option.stock <= 0 ? `${option.size} (품절)` : option.size }
            </MenuItem>
          )) }
        </Select>
      </Box>
    </Box>
  );
}

export default OptionSelector;
