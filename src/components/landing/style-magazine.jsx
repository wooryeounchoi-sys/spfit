import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import useAutoSlide from '../../hooks/use-auto-slide';
import SectionTitle from '../ui/section-title';
import LookCard from './look-card';

const CARDS_PER_PAGE = 4;

const arrowSx = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 6,
  color: '#000000',
  bgcolor: 'rgba(255,255,255,0.85)',
  '&:hover': { bgcolor: '#FFFFFF' },
};

/**
 * StyleMagazine 컴포넌트 - 4열 카드 x 2파트 슬라이드 (3초 자동 전환, 양방향 화살표, 도트 바)
 *
 * Props:
 * @param {Array} magazines - Style Magazine 목록 [Required]
 *
 * Example usage:
 * <StyleMagazine magazines={contents.magazines} />
 */
function StyleMagazine({ magazines }) {
  const pageCount = Math.max(1, Math.ceil(magazines.length / CARDS_PER_PAGE));
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => setPage((prev) => (prev + 1) % pageCount), [pageCount]);
  const goPrev = () => setPage((prev) => (prev - 1 + pageCount) % pageCount);

  useAutoSlide(goNext, 3000, isPaused || pageCount < 2);

  const visible = magazines.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  return (
    <Box component="section" sx={ { px: { xs: 2, md: '50px' }, py: { xs: 6, md: 10 } } }>
      <SectionTitle subtitle="러너들의 착장을 확인하고 마음에 드는 아이템을 찾아보세요">Style Magazine</SectionTitle>
      <Box
        sx={ { position: 'relative' } }
        onMouseEnter={ () => setIsPaused(true) }
        onMouseLeave={ () => setIsPaused(false) }
      >
        <Box
          key={ page }
          sx={ {
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: `repeat(${CARDS_PER_PAGE}, minmax(0, 430px))` },
            justifyContent: 'space-between',
            gap: { xs: 2, lg: 3 },
            animation: 'style-magazine-fade 0.5s ease',
            '@keyframes style-magazine-fade': { from: { opacity: 0 }, to: { opacity: 1 } },
          } }
        >
          { visible.map((magazine) => (
            <LookCard key={ magazine.id } magazine={ magazine } />
          )) }
        </Box>
        { pageCount > 1 && (
          <>
            <IconButton aria-label="이전 파트" onClick={ goPrev } sx={ { ...arrowSx, left: { xs: -8, md: -46 } } }>
              <ChevronLeft sx={ { fontSize: 32 } } />
            </IconButton>
            <IconButton aria-label="다음 파트" onClick={ goNext } sx={ { ...arrowSx, right: { xs: -8, md: -46 } } }>
              <ChevronRight sx={ { fontSize: 32 } } />
            </IconButton>
          </>
        ) }
      </Box>
      { pageCount > 1 && (
        <Box sx={ { display: 'flex', justifyContent: 'center', gap: 1, mt: 4 } }>
          { Array.from({ length: pageCount }).map((_, index) => (
            <Box
              key={ index }
              component="button"
              type="button"
              aria-label={ `${index + 1}번째 파트` }
              onClick={ () => setPage(index) }
              sx={ {
                width: index === page ? 40 : 10,
                height: 10,
                border: 'none',
                borderRadius: 5,
                p: 0,
                cursor: 'pointer',
                bgcolor: index === page ? '#000000' : '#CFCFCF',
                transition: 'width 0.3s, background-color 0.3s',
              } }
            />
          )) }
        </Box>
      ) }
    </Box>
  );
}

export default StyleMagazine;
