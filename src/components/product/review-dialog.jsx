import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Rating from '@mui/material/Rating';
import ArrowBack from '@mui/icons-material/ArrowBack';
import LightButton from '../ui/light-button';
import ProductImage from '../ui/product-image';

/**
 * ReviewDialog 컴포넌트 - 리뷰 작성 / 보기 팝업창 (800*800px)
 * - mode 'write' : 작성 (취소 / 작성하기)
 * - mode 'view'  : 보기. 본인 리뷰면 수정/삭제 가능, 타인 리뷰면 뒤로가기 아이콘만 표시
 *
 * Props:
 * @param {boolean} isOpen - 표시 여부 [Required]
 * @param {string} mode - 'write' | 'view' [Required]
 * @param {object} info - { image_path, writer_name, product_name, color, size } [Required]
 * @param {number} initialRating - 초기 별점 [Optional, 기본값: 5]
 * @param {string} initialContent - 초기 내용 [Optional, 기본값: '']
 * @param {boolean} isMine - 본인 리뷰 여부 [Optional, 기본값: false]
 * @param {function} onClose - 닫기 시 실행 [Required]
 * @param {function} onSubmit - 작성/수정 저장 시 실행 (rating, content) [Optional]
 * @param {function} onDelete - 삭제 시 실행 [Optional]
 *
 * Example usage:
 * <ReviewDialog isOpen mode="write" info={info} onClose={close} onSubmit={save} />
 */
function ReviewDialog({
  isOpen,
  mode,
  info,
  initialRating = 5,
  initialContent = '',
  isMine = false,
  onClose,
  onSubmit,
  onDelete,
}) {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(mode === 'write');

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setContent(initialContent);
      setIsEditing(mode === 'write');
    }
  }, [isOpen, initialRating, initialContent, mode]);

  const isReadOnly = !isEditing;

  return (
    <Dialog
      open={ isOpen }
      onClose={ onClose }
      maxWidth={ false }
      slotProps={ { paper: { sx: { width: 800, maxWidth: 'calc(100% - 32px)', minHeight: { md: 800 }, m: 2, p: '5px' } } } }
    >
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, p: 2 } }>
        { mode === 'view' && !isMine && (
          <IconButton aria-label="뒤로가기" onClick={ onClose } sx={ { alignSelf: 'flex-start', ml: -1 } }>
            <ArrowBack />
          </IconButton>
        ) }
        <Box sx={ { display: 'flex', gap: 2.5, alignItems: 'center' } }>
          <ProductImage path={ info.image_path } alt={ info.product_name } sx={ { width: 120, height: 120 } } isEmptyText={ false } />
          <Box sx={ { fontSize: 15, lineHeight: 1.8 } }>
            <Box>{ `작성자: ${info.writer_name}` }</Box>
            <Box sx={ { fontWeight: 700 } }>{ info.product_name }</Box>
            <Box>{ `색상: ${info.color} / 사이즈: ${info.size}` }</Box>
            <Rating
              value={ rating }
              readOnly={ isReadOnly }
              onChange={ (_, value) => setRating(value || 1) }
              aria-label="별점"
              sx={ { color: '#000000', mt: 0.5 } }
            />
          </Box>
        </Box>
        <InputBase
          value={ content }
          onChange={ (event) => setContent(event.target.value) }
          readOnly={ isReadOnly }
          multiline
          minRows={ 18 }
          placeholder="리뷰 내용을 작성해주세요."
          inputProps={ { maxLength: 2000, 'aria-label': '리뷰 내용' } }
          sx={ {
            width: '100%',
            maxWidth: 790,
            height: { xs: 360, md: 600 },
            alignItems: 'flex-start',
            overflow: 'auto',
            p: 2,
            fontSize: 15,
            color: '#000000',
            bgcolor: '#FFFFFF',
            border: '1px solid #DDDDDD',
          } }
        />
        { mode === 'write' && (
          <Box sx={ { display: 'flex', gap: 2, justifyContent: 'space-between' } }>
            <LightButton width={ 387 } onClick={ onClose }>취소</LightButton>
            <LightButton width={ 387 } onClick={ () => onSubmit(rating, content) }>작성하기</LightButton>
          </Box>
        ) }
        { mode === 'view' && isMine && !isEditing && (
          <Box sx={ { display: 'flex', gap: 2, justifyContent: 'space-between' } }>
            <LightButton width={ 250 } onClick={ onClose }>닫기</LightButton>
            <LightButton width={ 250 } onClick={ () => setIsEditing(true) }>수정</LightButton>
            <LightButton width={ 250 } onClick={ onDelete }>삭제</LightButton>
          </Box>
        ) }
        { mode === 'view' && isMine && isEditing && (
          <Box sx={ { display: 'flex', gap: 2, justifyContent: 'space-between' } }>
            <LightButton width={ 387 } onClick={ () => setIsEditing(false) }>취소</LightButton>
            <LightButton width={ 387 } onClick={ () => onSubmit(rating, content) }>저장하기</LightButton>
          </Box>
        ) }
      </Box>
    </Dialog>
  );
}

export default ReviewDialog;
