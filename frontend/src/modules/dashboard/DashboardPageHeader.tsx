import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { getPageTitle } from './pageTitles';

function getDisplayName(fullName: string | null | undefined, email: string): string {
  if (fullName?.trim()) {
    return fullName.trim().split(/\s+/)[0];
  }
  return email.split('@')[0];
}

export const DashboardPageHeader = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const pageTitle = getPageTitle(pathname);
  const displayName = user ? getDisplayName(user.fullName, user.email) : '';

  return (
    <header className="dashboard-page-header">
      <div>
        <p className="dashboard-greeting m-0">Hi, {displayName}</p>
        <h1 className="dashboard-page-title m-0">{pageTitle}</h1>
      </div>

      <div className="dashboard-header-actions">
        <button type="button" className="clay-surface-icon" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="dashboard-avatar" aria-hidden="true">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
