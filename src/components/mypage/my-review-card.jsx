import { useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Rating from '@mui/material/Rating';
import { Link as RouterLink } from 'react-router-dom';
import LightButton from '../ui/light-button';
import ProductImage from '../ui/product-image';

/**
 * MyReviewCard 컴포넌트 - 내가 쓴 리뷰 카드 (800px)
 * 리뷰 사진(190*190, 없으면 빈 화면) / 제품명·색상·사이즈·작성자명 / 리뷰 내용 박스(300*150) + 수정하기·삭제하기(290*90)
 *
 * Props:
 * @param {object} review - { product_name, color, size, writer_name, rating, content, image_path, product_id, category_id } [Required]
 * @param {function} onSave - 저장하기 클릭 시 실행 (content) [Required]
 * @param {function} onDelete - 삭제하기 클릭 시 실행 [Required]
 *
 * Example usage:
 * <MyReviewCard review={review} onSave={save} onDelete={remove} />
 */
function MyReviewCard({ review, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(review.content);

  const handleSave = async () => {
    const isSaved = await onSave(content);
    if (isSaved) {
      setIsEditing(false);
    }
  };

  return (
    <Box sx={ { width: '100%', maxWidth: 800, mx: 'auto', bgcolor: '#FFFFFF', p: '5px', pb: 2.5 } }>
      <Box sx={ { display: 'flex', gap: 2.5, alignItems: 'center' } }>
        <Box sx={ { width: 190, height: 190, flexShrink: 0 } }>
          { review.image_path && (
            <ProductImage path={ review.image_path } alt="리뷰 사진" sx={ { width: 190, height: 190 } } />
          ) }
        </Box>
        <Box sx={ { fontSize: 15, lineHeight: 1.8 } }>
          <Box
            component={ RouterLink }
            to={ `/products/${review.category_id}/${review.product_id}` }
            sx={ { fontWeight: 700, color: '#000000', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }
          >
            { review.product_name }
          </Box>
          <Box>{ `색상: ${review.color} / 사이즈: ${review.size}` }</Box>
          <Box>{ `작성자: ${review.writer_name}` }</Box>
          <Rating value={ review.rating } readOnly size="small" sx={ { color: '#000000' } } />
        </Box>
      </Box>
      <Box sx={ { display: 'flex', gap: 2, mt: 2, px: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'flex-start' } }>
        { isEditing && (
          <LightButton width={ 110 } height={ 150 } fontSize={ 15 } isActive onClick={ handleSave }>저장하기</LightButton>
        ) }
        <InputBase
          value={ content }
          onChange={ (event) => setContent(event.target.value) }
          readOnly={ !isEditing }
          multiline
          inputProps={ { maxLength: 2000, 'aria-label': '리뷰 내용' } }
          sx={ {
            flex: 1,
            maxWidth: isEditing ? 300 : 'none',
            minWidth: 0,
            height: 150,
            p: 1.5,
            fontSize: 15,
            alignItems: 'flex-start',
            overflow: 'auto',
            bgcolor: isEditing ? '#FFFFFF' : '#F5F5F5',
            border: isEditing ? '1px solid #000000' : '1px solid transparent',
          } }
        />
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1, width: { xs: '100%', sm: 290 }, flexShrink: 0 } }>
          <LightButton
            width={ 290 }
            height={ 71 }
            fontSize={ 15 }
            onClick={ () => {
              if (isEditing) {
                setContent(review.content);
              }
              setIsEditing((prev) => !prev);
            } }
          >
            { isEditing ? '수정 취소' : '수정하기' }
          </LightButton>
          <LightButton width={ 290 } height={ 71 } fontSize={ 15 } onClick={ onDelete }>삭제하기</LightButton>
        </Box>
      </Box>
    </Box>
  );
}

export default MyReviewCard;
