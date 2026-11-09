import { Fragment } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import { getCategoryPath, getChildren } from '../../utils/category-tree';

const ALL = 'all';

const selectSx = {
  fontSize: 20,
  fontWeight: 700,
  color: '#000000',
  '& .MuiSelect-select': { py: 0.5, pr: '32px !important' },
};

/**
 * CategoryDropdowns 컴포넌트 - 상위/하위/최하위 카테고리 경로를 개별 드롭다운으로 표시
 * (예: Men / 상의 / 반팔 티셔츠) 각 드롭다운에서 다른 카테고리로 이동 가능
 *
 * Props:
 * @param {Array} categories - 전체 카테고리 [Required]
 * @param {number} categoryId - 현재 카테고리 ID [Required]
 *
 * Example usage:
 * <CategoryDropdowns categories={categories} categoryId={3} />
 */
function CategoryDropdowns({ categories, categoryId }) {
  const navigate = useNavigate();
  const path = getCategoryPath(categories, categoryId);
  const current = path[path.length - 1];
  const hasChildren = current && getChildren(categories, current.id).length > 0;

  /** 경로 단계별 드롭다운: [부모 ID, 선택된 값] */
  const levels = path.map((category) => ({ parentId: category.parent_id, value: category.id }));
  if (hasChildren) {
    levels.push({ parentId: current.id, value: ALL });
  }

  const handleChange = (index, value) => {
    if (value === ALL) {
      const parent = path[index - 1];
      navigate(`/products/${parent.id}`);
      return;
    }
    navigate(`/products/${value}`);
  };

  return (
    <Box sx={ { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 } }>
      { levels.map((level, index) => {
        const siblings = getChildren(categories, level.parentId);
        return (
          <Fragment key={ `${level.parentId}-${index}` }>
            { index > 0 && <Box sx={ { fontSize: 20, fontWeight: 700, mx: 0.5 } }>/</Box> }
            <Select
              value={ level.value }
              onChange={ (event) => handleChange(index, event.target.value) }
              input={ <InputBase sx={ selectSx } /> }
              inputProps={ { 'aria-label': `${index + 1}단계 카테고리` } }
            >
              { index > 0 && <MenuItem value={ ALL } sx={ { fontSize: 15 } }>전체</MenuItem> }
              { siblings.map((category) => (
                <MenuItem key={ category.id } value={ category.id } sx={ { fontSize: 15 } }>{ category.name }</MenuItem>
              )) }
            </Select>
          </Fragment>
        );
      }) }
    </Box>
  );
}

export default CategoryDropdowns;
