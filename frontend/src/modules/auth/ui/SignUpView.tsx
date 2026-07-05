import { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react';
import { strings } from '../../../common/texts/strings';
import { paths } from '../../../common/routes/paths';
import { AppLink, ClayButton, FormAlert, InputField } from '../../../common/components';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './AuthLayout';

export const RegisterView = () => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(strings.registerPasswordMismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.registerError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title={strings.registerWelcome} subtitle={strings.registerSubtitle}>
      {error && <FormAlert message={error} />}

      <form onSubmit={handleRegister} className="flex flex-col gap-5" noValidate>
        <InputField
          id="fullName"
          label={strings.registerFullNameLabel}
          icon={User}
          type="text"
          autoComplete="name"
          placeholder={strings.registerFullNamePlaceholder}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={100}
        />

        <InputField
          id="register-email"
          label={strings.loginEmailLabel}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder={strings.loginEmailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
        />

        <InputField
          id="register-password"
          label={strings.loginPasswordLabel}
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={strings.registerPasswordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          maxLength={128}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <InputField
          id="confirm-password"
          label={strings.registerConfirmPasswordLabel}
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={strings.registerConfirmPasswordPlaceholder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          maxLength={128}
        />

        <p className="text-xs text-slate-400 -mt-2">{strings.registerPasswordHint}</p>

        <ClayButton type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? strings.registerSubmitting : strings.registerButton}
        </ClayButton>
      </form>

      <p className="mt-6 text-body-muted text-center">
        {strings.registerHasAccount}{' '}
        <AppLink to={paths.login}>{strings.registerSignIn}</AppLink>
      </p>
    </AuthLayout>
  );
};
