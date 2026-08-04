import './GoogleOAuthButton.scss';

import { memo, useRef } from 'react';
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
  const buttonText = text === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google';
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // Trigger the hidden Google button click
    const googleButton = googleButtonRef.current?.querySelector('div[role="button"]');
    if (googleButton) {
      (googleButton as HTMLElement).click();
    }
  };

  return (
    <>
      <div className="google-oauth-button" onClick={handleClick}>
        <span className="google-oauth-button__text">{buttonText}</span>
      </div>
      <div ref={googleButtonRef} className="google-oauth-button__hidden">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              onSuccess(credentialResponse.credential);
            }
          }}
          onError={() => {
            onError?.();
          }}
          type="icon"
          shape="circle"
          theme="outline"
          size="medium"
        />
      </div>
    </>
  );
});
