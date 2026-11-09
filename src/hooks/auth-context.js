import { createContext } from 'react';

/** 로그인 상태 컨텍스트 ({ token, member, isLoggedIn, signIn, signOut }) */
const AuthContext = createContext(null);

export default AuthContext;
