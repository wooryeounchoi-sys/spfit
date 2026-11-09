import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Search from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

/**
 * HeaderSearch 컴포넌트 - 헤더 검색 아이콘 + 검색창 (아이콘 클릭 시 펼침)
 *
 * Props: 없음
 *
 * Example usage:
 * <HeaderSearch />
 */
function HeaderSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) {
      setIsOpen((prev) => !prev);
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Box component="form" onSubmit={ handleSubmit } sx={ { display: 'flex', alignItems: 'center' } }>
      <InputBase
        value={ keyword }
        onChange={ (event) => setKeyword(event.target.value) }
        placeholder="상품 검색"
        inputProps={ { 'aria-label': '상품 검색' } }
        sx={ {
          width: isOpen ? { xs: 140, md: 220 } : 0,
          px: isOpen ? 1.5 : 0,
          height: 40,
          fontSize: 15,
          bgcolor: '#F0F0F0',
          transition: 'width 0.25s, padding 0.25s',
          overflow: 'hidden',
        } }
      />
      <IconButton type="submit" aria-label="검색" sx={ { color: '#000000' } }>
        <Search sx={ { fontSize: 30 } } />
      </IconButton>
    </Box>
  );
}

export default HeaderSearch;
