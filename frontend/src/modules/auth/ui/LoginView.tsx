import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import { AppLink, ClayButton, FormAlert, InputField } from '../../../common/components';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './AuthLayout';

export const LoginView = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.loginError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title={strings.loginWelcome} subtitle={strings.loginSubtitle}>
      {error && <FormAlert message={error} />}

      <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
        <InputField
          id="email"
          label={strings.loginEmailLabel}
          icon={User}
          type="email"
          autoComplete="email"
          placeholder={strings.loginEmailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
        />

        <InputField
          id="password"
          label={strings.loginPasswordLabel}
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={strings.loginPasswordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          maxLength={128}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-slate-500 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-indigo-500 text-indigo-500 focus:ring-indigo-500 accent-indigo-500"
            />
            {strings.loginRememberMe}
          </label>
          <span className="text-indigo-500 font-medium">{strings.loginForgotPassword}</span>
        </div>

        <ClayButton type="submit" disabled={isSubmitting} className="w-full mt-1">
          {isSubmitting ? strings.loginSubmitting : strings.loginButton}
        </ClayButton>
      </form>

      <p className="mt-6 text-sm text-slate-500 text-center">
        {strings.loginNoAccount}{' '}
        <AppLink to="/register">{strings.loginSignUp}</AppLink>
      </p>
    </AuthLayout>
  );
};
