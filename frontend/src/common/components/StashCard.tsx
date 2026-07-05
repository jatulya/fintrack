import { MoreVertical, Wallet, TrendingUp, Landmark, type LucideIcon } from 'lucide-react';
import type { Account } from '../../data/models/accounts/types/accountTypes';

const STASH_STYLES: { icon: LucideIcon; accent: string }[] = [
  { icon: Landmark, accent: 'var(--accent)' },
  { icon: TrendingUp, accent: '#9b6b9e' },
  { icon: Wallet, accent: '#7eb8b0' },
];

function buildSparklinePath(seed: string, width: number, height: number): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const points = Array.from({ length: 8 }, (_, i) => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    const x = (i / 7) * width;
    const y = height - ((hash % 100) / 100) * (height - 4) - 2;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}

interface StashCardProps {
  account: Account;
  index: number;
}

export const StashCard = ({ account, index }: StashCardProps) => {
  const style = STASH_STYLES[index % STASH_STYLES.length];
  const Icon = style.icon;
  const sparklinePath = buildSparklinePath(account.id, 72, 28);

  return (
    <article className="stash-card">
      <div className="stash-card-body">
        <div className="stash-card-icon" style={{ color: style.accent }}>
          <Icon size={18} />
        </div>

        <div className="stash-card-details">
          <p className="stash-card-name">{account.name.toUpperCase()}</p>
          <p className="stash-card-balance">₹{account.amount.toLocaleString()}</p>
        </div>

        <button type="button" className="clay-surface-icon stash-card-menu" aria-label={`Options for ${account.name}`}>
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="stash-card-footer">
        <span className="stash-card-subtitle">{account.notes || 'Stash'}</span>
        <svg
          className="stash-card-sparkline"
          viewBox="0 0 72 28"
          width="72"
          height="28"
          aria-hidden="true"
        >
          <path
            d={sparklinePath}
            fill="none"
            stroke={style.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </article>
  );
};
