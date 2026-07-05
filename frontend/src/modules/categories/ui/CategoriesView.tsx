import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { colors } from '../../../common/themes/colors';
import { useApp } from '../../../data/api/AppContext';
import { AddCategoryModal } from './AddCategoryModal';

export const CategoriesView: React.FC = () => {
  const { categories, isLoading } = useApp();
  const [showAddCategory, setShowAddCategory] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-end items-center mb-8">
        <button onClick={() => setShowAddCategory(true)} className="clay-btn flex items-center gap-2">
          <Plus size={20} /> Add Theme
        </button>
      </div>

      {isLoading ? (
        <GlassCard className="p-12 text-center text-body-muted">Loading themes...</GlassCard>
      ) : categories.length === 0 ? (
        <GlassCard className="p-12 text-center text-body-muted">
          No themes yet. Create one to start tagging your money diary.
        </GlassCard>
      ) : (
        <div className="flex-grid">
          {categories.map((category) => (
            <GlassCard key={category.id}>
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex-center"
                  style={{
                    backgroundColor: (category.color ?? colors.accent) + '33',
                    color: category.color ?? colors.accent,
                  }}
                >
                  <Tag size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold m-0 capitalize">{category.label}</h3>
                  <p className="text-sm text-body-muted mt-1 mb-0">{category.name}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showAddCategory && <AddCategoryModal onClose={() => setShowAddCategory(false)} />}
    </div>
  );
};
