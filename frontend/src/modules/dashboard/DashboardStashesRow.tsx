import { Link } from 'react-router-dom';
import { paths } from '../../common/routes/paths';
import { strings } from '../../common/texts/strings';
import { useApp } from '../../data/api/AppContext';
import { StashCard } from '../../common/components/StashCard';

export const DashboardStashesRow = () => {
  const { accounts } = useApp();
  const topStashes = accounts.slice(0, 3);

  if (topStashes.length === 0) {
    return null;
  }

  return (
    <section className="dashboard-stashes-row">
      <div className="dashboard-stashes-row-header">
        <h2 className="dashboard-stashes-row-title">{strings.navStashes}</h2>
        <Link to={paths.accounts} className="dashboard-stashes-row-link">
          View All
        </Link>
      </div>

      <div className="flex-grid dashboard-stashes-row-grid">
        {topStashes.map((account, index) => (
          <StashCard key={account.id} account={account} index={index} />
        ))}
      </div>
    </section>
  );
};
