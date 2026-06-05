import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { strings } from '../../../common/texts/strings';

const AUTH_KEY = 'fintrack_authenticated';

export const isAuthenticated = () =>
  localStorage.getItem(AUTH_KEY) === 'true' || sessionStorage.getItem(AUTH_KEY) === 'true';

export const LoginView = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (rememberMe) {
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      sessionStorage.setItem(AUTH_KEY, 'true');
    }
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        {/* Left decorative panel */}
        <div className="login-panel-left">
          <div className="login-panel-left__overlay" />
          <div className="login-panel-left__content">
            <h2 className="login-brand">{strings.appTitle}</h2>
            <p className="login-tagline">{strings.appSubtitle}</p>
          </div>
          <div className="login-sphere login-sphere--1" />
          <div className="login-sphere login-sphere--2" />
          <div className="login-sphere login-sphere--3" />
        </div>

        {/* Right form panel */}
        <div className="login-panel-right">
          <h1 className="login-heading">{strings.loginWelcome}</h1>
          <p className="login-subheading">{strings.loginSubtitle}</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label htmlFor="email">{strings.loginEmailLabel}</label>
              <div className="login-input-wrapper">
                <User size={18} className="login-input-icon" />
                <input
                  id="email"
                  type="text"
                  placeholder={strings.loginEmailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">{strings.loginPasswordLabel}</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={strings.loginPasswordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="login-checkbox__box" />
                {strings.loginRememberMe}
              </label>
              <a href="#" className="login-forgot">{strings.loginForgotPassword}</a>
            </div>

            <button type="submit" className="login-btn">
              {strings.loginButton}
            </button>
          </form>

          <div className="login-social">
            <span>{strings.loginWith}</span>
            <div className="login-social-icons">
              <button type="button" className="login-social-btn" aria-label="Sign in with Google">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button type="button" className="login-social-btn" aria-label="Sign in with Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>

          <p className="login-signup">
            {strings.loginNoAccount}{' '}
            <a href="#" className="login-signup-link">{strings.loginSignUp}</a>
          </p>
        </div>
      </div>
    </div>
  );
};
