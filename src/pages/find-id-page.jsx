import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { findLoginId } from '../api/member-api';
import FormColumn from '../components/common/form-column';
import PageContainer from '../components/common/page-container';
import ResultCard from '../components/common/result-card';
import DarkButton from '../components/ui/dark-button';
import FormInput from '../components/ui/form-input';
import PageTitle from '../components/ui/page-title';
import usePopup from '../hooks/use-popup';
import { errorMessage } from '../utils/error-message';
import { withJosa } from '../utils/josa';

/**
 * FindIdPage 컴포넌트 - 아이디 찾기 (이름 + 이메일)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/find/id" element={<FindIdPage />} />
 */
function FindIdPage() {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundIds, setFoundIds] = useState(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const handleFind = async () => {
    const fields = [
      { label: '이름', value: name, ref: nameRef },
      { label: '이메일', value: email, ref: emailRef },
    ];
    const missing = fields.find((field) => !field.value.trim());
    if (missing) {
      await showPopup({ message: `${withJosa(missing.label, '을/를')} 입력하세요.` });
      missing.ref.current?.focus();
      return;
    }
    try {
      const result = await findLoginId(name, email);
      if (!result.ok) {
        await showPopup({ message: '일치하는 회원 정보가 없습니다.' });
        return;
      }
      setFoundIds(result.login_ids);
    } catch (error) {
      await showPopup({ message: errorMessage(error) });
    }
  };

  return (
    <PageContainer>
      <PageTitle>아이디 찾기</PageTitle>
      { foundIds ? (
        <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 } }>
          <ResultCard title="아이디 찾기 성공!">
            { foundIds.map((id) => <Box key={ id } sx={ { fontSize: 18, fontWeight: 700 } }>{ id }</Box>) }
          </ResultCard>
          <Box sx={ { width: '100%', maxWidth: 390, display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 } }>
            <DarkButton onClick={ () => navigate('/find/password') }>비밀번호 재설정</DarkButton>
            <DarkButton onClick={ () => navigate('/login') }>로그인 하기</DarkButton>
          </Box>
        </Box>
      ) : (
        <FormColumn onSubmit={ handleFind }>
          <FormInput ref={ nameRef } value={ name } onChange={ (e) => setName(e.target.value) } placeholder="이름" />
          <FormInput ref={ emailRef } value={ email } onChange={ (e) => setEmail(e.target.value) } placeholder="이메일" type="email" />
          <DarkButton type="submit" sx={ { mt: 2 } }>아이디 찾기</DarkButton>
        </FormColumn>
      ) }
    </PageContainer>
  );
}

export default FindIdPage;
