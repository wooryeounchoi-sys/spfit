import { useCallback, useState } from 'react';
import PopupContext from '../../hooks/popup-context';
import AlertDialog from './alert-dialog';

/**
 * PopupProvider 컴포넌트 - 어디서든 showPopup() 으로 공통 팝업창을 띄울 수 있게 함
 *
 * Props:
 * @param {node} children - 하위 컴포넌트 [Required]
 *
 * Example usage:
 * const showPopup = usePopup();
 * await showPopup({ message: '회원가입 완료' });
 */
function PopupProvider({ children }) {
  const [popup, setPopup] = useState(null);

  const showPopup = useCallback((options) => new Promise((resolve) => {
    setPopup({ ...options, resolve });
  }), []);

  const handleConfirm = () => {
    const current = popup;
    setPopup(null);
    current?.resolve();
  };

  return (
    <PopupContext.Provider value={ showPopup }>
      { children }
      <AlertDialog
        isOpen={ Boolean(popup) }
        message={ popup?.message || '' }
        confirmLabel={ popup?.confirmLabel }
        confirmColor={ popup?.confirmColor }
        onConfirm={ handleConfirm }
      />
    </PopupContext.Provider>
  );
}

export default PopupProvider;
