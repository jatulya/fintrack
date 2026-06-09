import type { ReactNode } from 'react';
import { strings } from '../../../common/texts/strings';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <div className="auth-panel-left">
          <div className="auth-panel-left__overlay" />
          <div className="auth-panel-left__brand">
            <h2>{strings.appTitle}</h2>
            <p>{strings.appSubtitle}</p>
          </div>
        </div>

        <div className="auth-panel">
          <h1 className="auth-panel__title">{title}</h1>
          <p className="auth-panel__subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="auth-page">
      <p className="text-base text-slate-500 font-medium">Loading...</p>
    </div>
  );
}
