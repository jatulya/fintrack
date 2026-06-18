import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { GlassCard } from '../../../common/components/GlassCard';
import { useApp } from '../../../data/api/AppContext';
import { AddCategoryModal } from './AddCategoryModal';

export const CategoriesView: React.FC = () => {
  const { categories, isLoading } = useApp();
  const [showAddCategory, setShowAddCategory] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => setShowAddCategory(true)}
          className="clay-btn flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <GlassCard className="p-12 text-center text-slate-400">Loading categories...</GlassCard>
      ) : categories.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-400">
          No categories yet. Create one to start tagging transactions.
        </GlassCard>
      ) : (
        <div className="grid-auto-fit">
          {categories.map((category) => (
            <GlassCard key={category.id}>
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex-center"
                  style={{
                    backgroundColor: (category.color ?? '#6366f1') + '20',
                    color: category.color ?? '#6366f1',
                  }}
                >
                  <Tag size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 m-0 capitalize">{category.label}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-0">{category.name}</p>
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
