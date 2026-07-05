import type { ReactNode } from 'react';
import { strings } from '../../../common/texts/strings';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-auth animate-fade-in">
      <div
        className="flex w-full max-w-[960px] min-h-[580px] bg-white rounded-3xl overflow-hidden shadow-xl max-md:flex-col max-md:min-h-0"
        style={{ boxShadow: '0 25px 50px -12px rgba(228, 103, 172, 0.2)' }}
      >
        <div className="relative flex-[0_0_42%] flex flex-col justify-end overflow-hidden bg-[url('/assets/login-bg.png')] bg-cover bg-center max-md:flex-none max-md:min-h-[200px]">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(228, 103, 172, 0.85) 0%, rgba(247, 214, 224, 0.75) 50%, rgba(239, 247, 246, 0.6) 100%)',
            }}
          />
          <div className="relative z-10 p-8 text-white">
            <h2 className="text-[28px] font-bold mb-2">{strings.appTitle}</h2>
            <p className="text-sm opacity-95">{strings.appSubtitle}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-10 py-12 max-md:px-6 max-md:py-8">
          <h1 className="text-[26px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <p className="text-body-muted mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex-center bg-gradient-auth">
      <p className="text-base font-medium text-body-muted">Loading...</p>
    </div>
  );
}
