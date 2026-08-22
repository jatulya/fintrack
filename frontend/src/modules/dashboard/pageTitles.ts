import { paths } from '../../common/routes/paths';
import { strings } from '../../common/texts/strings';
import { sidebarNavItems } from './sidebarNavItems';

export function getPageTitle(pathname: string): string {
  if (pathname === paths.savings || pathname.startsWith(`${paths.savings}/`)) {
    return strings.piggyBankCheckup;
  }

  const match = sidebarNavItems.find((item) => {
    if (item.highlightWhenActive === false) {
      return false;
    }
    if (item.to === paths.dashboard) {
      return pathname === paths.dashboard;
    }
    return pathname.startsWith(item.to);
  });

  return match?.label ?? strings.navCozyCorner;
}
