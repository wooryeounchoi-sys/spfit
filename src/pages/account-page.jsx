import Box from '@mui/material/Box';
import PageContainer from '../components/common/page-container';
import MenuCard from '../components/mypage/menu-card';
import WhiteCard from '../components/mypage/white-card';
import PageTitle from '../components/ui/page-title';
import useAuth from '../hooks/use-auth';

/**
 * AccountPage 컴포넌트 - 계정 관리 (이름/아이디 + 비밀번호 변경 / 배송지 관리 / 회원 탈퇴)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/account" element={<AccountPage />} />
 */
function AccountPage() {
  const { member } = useAuth();
  return (
    <PageContainer maxWidth={ 600 } bgcolor="#F5F5F5">
      <PageTitle>계정 관리</PageTitle>
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
        <WhiteCard width={ 600 } minHeight={ 100 } sx={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5 } }>
          <Box>{ `이름: ${member?.name ?? ''}` }</Box>
          <Box>{ `아이디: ${member?.login_id ?? ''}` }</Box>
        </WhiteCard>
        <MenuCard label="비밀번호 변경" to="/mypage/account/password" width={ 600 } height={ 70 } />
        <MenuCard label="배송지 관리" to="/mypage/account/address" width={ 600 } height={ 70 } />
        <MenuCard label="회원 탈퇴" to="/mypage/account/withdraw" width={ 600 } height={ 70 } />
      </Box>
    </PageContainer>
  );
}

export default AccountPage;
