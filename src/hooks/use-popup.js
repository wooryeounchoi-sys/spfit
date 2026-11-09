import { useContext } from 'react';
import PopupContext from './popup-context';

/**
 * 공통 팝업창 훅
 * showPopup({ message, confirmLabel, confirmColor }) -> 확인 버튼을 누르면 resolve 되는 Promise
 */
export default function usePopup() {
  return useContext(PopupContext);
}
