import { useNavigate } from 'react-router-dom';
import FormColumn from '../components/common/form-column';
import PageContainer from '../components/common/page-container';
import DarkButton from '../components/ui/dark-button';
import PageTitle from '../components/ui/page-title';

/**
 * FindAccountPage 컴포넌트 - 아이디 찾기 / 비밀번호 재설정 선택 (2*1 버튼)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/find" element={<FindAccountPage />} />
 */
function FindAccountPage() {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <PageTitle>아이디 찾기 / 비밀번호 재설정</PageTitle>
      <FormColumn>
        <DarkButton onClick={ () => navigate('/find/id') }>아이디 찾기</DarkButton>
        <DarkButton onClick={ () => navigate('/find/password') }>비밀번호 재설정</DarkButton>
      </FormColumn>
    </PageContainer>
  );
}

export default FindAccountPage;
