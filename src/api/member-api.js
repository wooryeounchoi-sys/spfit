import { callRpc } from './rpc';

/** 회원 / 계정 관련 API */
export const checkLoginId = (loginId) => callRpc('check_login_id', { p_login_id: loginId });

export const signUp = ({ loginId, password, name, email, phone, birthDate }) => callRpc('sign_up', {
  p_login_id: loginId,
  p_password: password,
  p_name: name,
  p_email: email,
  p_phone: phone,
  p_birth_date: birthDate || null,
});

export const login = (loginId, password) => callRpc('login', { p_login_id: loginId, p_password: password });

export const logout = (token) => callRpc('logout', { p_token: token });

export const getMe = (token) => callRpc('get_me', { p_token: token });

export const findLoginId = (name, email) => callRpc('find_login_id', { p_name: name, p_email: email });

export const requestPasswordReset = (name, loginId, email) => callRpc('request_password_reset', {
  p_name: name,
  p_login_id: loginId,
  p_email: email,
});

export const resetPassword = (resetToken, newPassword) => callRpc('reset_password', {
  p_reset_token: resetToken,
  p_new_password: newPassword,
});

export const changePassword = (token, currentPassword, newPassword) => callRpc('change_password', {
  p_token: token,
  p_current_password: currentPassword,
  p_new_password: newPassword,
});

export const withdrawMember = (token, loginId, password) => callRpc('withdraw_member', {
  p_token: token,
  p_login_id: loginId,
  p_password: password,
});
