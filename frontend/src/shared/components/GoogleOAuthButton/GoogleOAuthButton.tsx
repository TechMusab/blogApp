import './GoogleOAuthButton.scss';

import { memo } from 'react';
import { GoogleLogin } from '@react-oauth/google';

type GoogleOAuthButtonProps = {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
};

export const GoogleOAuthButton = memo(function GoogleOAuthButton({
  onSuccess,
  onError,
  text = 'signin_with',
}: GoogleOAuthButtonProps) {
  return (
    <div className="google-oauth-button">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            onSuccess(credentialResponse.credential);
          }
        }}
        onError={() => {
          onError?.();
        }}
        text={text}
        shape="circle"
        theme="outline"
        size="medium"
        width="100%"
      />
    </div>
  );
});
