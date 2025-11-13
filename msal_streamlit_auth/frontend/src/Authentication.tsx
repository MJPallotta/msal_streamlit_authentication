import React, { useCallback, useEffect, useState } from 'react';
import {
  withStreamlitConnection,
  Streamlit,
  ComponentProps,
} from 'streamlit-component-lib';
import { useMsalInstance } from './auth/msal-auth';

const Authentication = ({ args }: ComponentProps) => {
  const msalInstance = useMsalInstance(args['auth'], args['cache']);
  const loginRequest = args['login_request'] ?? undefined;
  const logoutRequest = args['logout_request'] ?? undefined;
  const loginButtonText = args['login_button_text'] ?? '';
  const logoutButtonText = args['logout_button_text'] ?? '';
  const buttonClass = args['class_name'] ?? '';
  const buttonId = args['html_id'] ?? '';

  const [loginToken, setLoginToken] = useState(null);
  const isAuthenticated = useCallback(() => {
    return msalInstance.getAllAccounts().length > 0;
  }, []);

  useEffect(() => {
    msalInstance.initialize().then(() => {
      if (msalInstance.getAllAccounts().length > 0) {
        msalInstance
          .acquireTokenSilent({
            ...loginRequest,
            account: msalInstance.getAllAccounts()[0],
          })
          .then(function (response) {
            // @ts-ignore
            setLoginToken(response);
          });
      } else {
        setLoginToken(null);
      }
    });
  }, []);

  useEffect(() => {
    Streamlit.setComponentValue(loginToken);
    Streamlit.setFrameHeight();
    Streamlit.setComponentReady();
  }, [loginToken]);

  const loginPopup = useCallback(() => {
    msalInstance
      .loginPopup(loginRequest)
      .then((response) => {
        // @ts-ignore
        setLoginToken(response);
      })
      .catch(console.error);
  }, []);

  const logoutPopup = useCallback(() => {
    // @ts-ignore
    msalInstance
      .logoutPopup(logoutRequest)
      .then((response) => {
        setLoginToken(null);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="card">
      <button
        onClick={isAuthenticated() ? logoutPopup : loginPopup}
        className={buttonClass}
        id={buttonId}
      >
        {isAuthenticated() ? logoutButtonText : loginButtonText}
      </button>
    </div>
  );
};

export default withStreamlitConnection(Authentication);
