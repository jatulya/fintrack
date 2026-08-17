import { Pencil, Wallet, TrendingUp, Landmark, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { Account } from '../../data/models/accounts/types/accountTypes';
import { strings } from '../texts/strings';
import { EditAccountModal } from '../../modules/accounts/ui/EditAccountModal';
import { ActionMenu } from './ActionMenu';

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
  const [showEditModal, setShowEditModal] = useState(false);

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

        <ActionMenu
          ariaLabel={`Options for ${account.name}`}
          items={[
            {
              id: 'edit',
              label: strings.editAccount,
              icon: Pencil,
              onClick: () => setShowEditModal(true),
            },
          ]}
        />
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

      {showEditModal && (
        <EditAccountModal account={account} onClose={() => setShowEditModal(false)} />
      )}
    </article>
  );
};
