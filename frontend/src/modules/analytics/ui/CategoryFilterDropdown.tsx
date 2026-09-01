import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { strings } from '../../../common/texts/strings';

interface CategoryFilterDropdownProps {
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const allSelected = options.length > 0 && options.every((name) => selected.has(name));
  const dropdownLabel = useMemo(() => {
    if (allSelected) return strings.allCategories;
    if (selected.size === 0) return strings.noCategoriesSelected;
    return `${selected.size} ${strings.categoriesSelected}`;
  }, [allSelected, selected.size]);

  const toggleAll = () => {
    onChange(allSelected ? new Set() : new Set(options));
  };

  const toggleCategory = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange(next);
  };

  return (
    <div className="analytics-category-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="analytics-category-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{dropdownLabel}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="analytics-category-menu" role="listbox" aria-multiselectable="true">
          <button
            type="button"
            className="analytics-category-option"
            onClick={toggleAll}
            role="option"
            aria-selected={allSelected}
          >
            <span className={`analytics-category-check ${allSelected ? 'is-checked' : ''}`}>
              {allSelected && <Check size={12} />}
            </span>
            {strings.allCategories}
          </button>
          {options.map((name) => {
            const isChecked = selected.has(name);
            return (
              <button
                key={name}
                type="button"
                className="analytics-category-option"
                onClick={() => toggleCategory(name)}
                role="option"
                aria-selected={isChecked}
              >
                <span className={`analytics-category-check ${isChecked ? 'is-checked' : ''}`}>
                  {isChecked && <Check size={12} />}
                </span>
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
