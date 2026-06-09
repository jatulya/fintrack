import type { ReactNode } from 'react';
import { strings } from '../../../common/texts/strings';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
      <div className="flex w-full max-w-[960px] min-h-[580px] bg-white rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/5 animate-fade-in max-md:flex-col max-md:min-h-0">
        <div className="relative flex-[0_0_42%] flex flex-col justify-end overflow-hidden bg-[url('/assets/login-bg.png')] bg-cover bg-center max-md:flex-none max-md:min-h-[200px]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/85 via-purple-500/75 to-indigo-600/60" />
          <div className="relative z-10 p-8 text-white">
            <h2 className="text-[28px] font-bold tracking-tight mb-2">{strings.appTitle}</h2>
            <p className="text-sm opacity-90">{strings.appSubtitle}</p>
          </div>
          <div className="absolute w-12 h-12 top-[12%] -right-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-60 z-[1]" />
          <div className="absolute w-8 h-8 bottom-[30%] -left-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-60 z-[1]" />
          <div className="absolute w-16 h-16 -bottom-5 right-[20%] rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-40 z-[1]" />
        </div>

        <div className="flex-1 px-10 py-12 flex flex-col justify-center max-md:px-6 max-md:py-8">
          <h1 className="text-[26px] max-md:text-[22px] font-bold text-slate-800 leading-snug mb-2">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
      <p className="text-base text-slate-500 font-medium">Loading...</p>
    </div>
  );
}
