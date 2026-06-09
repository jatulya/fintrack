import type { ReactNode } from 'react';
import { strings } from '../../../common/texts/strings';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 animate-fade-in">
      <div className="flex w-full max-w-[960px] min-h-[580px] bg-white rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/15 max-md:flex-col max-md:min-h-0">
        <div className="relative flex-[0_0_42%] flex flex-col justify-end overflow-hidden bg-[url('/assets/login-bg.png')] bg-cover bg-center max-md:flex-none max-md:min-h-[200px]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/85 via-purple-500/75 to-indigo-600/60" />
          <div className="relative z-10 p-8 text-white">
            <h2 className="text-[28px] font-bold mb-2">{strings.appTitle}</h2>
            <p className="text-sm opacity-95">{strings.appSubtitle}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-10 py-12 max-md:px-6 max-md:py-8">
          <h1 className="text-[26px] font-bold text-slate-800 mb-2">{title}</h1>
          <p className="text-body-muted mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex-center bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
      <p className="text-base text-slate-500 font-medium">Loading...</p>
    </div>
  );
}
