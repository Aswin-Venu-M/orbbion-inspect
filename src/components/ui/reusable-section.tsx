import React from 'react';
import { SectionHeader } from './section-header';

interface ReusableSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ReusableSection: React.FC<ReusableSectionProps> = ({ title, children, className }) => {
  const hasChildren = React.Children.toArray(children).some(child => !!child);

  return (
    <section>
      <SectionHeader title={title} />
      {hasChildren ? (
        <div className={`bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 ${className || ''}`}>
          {children}
        </div>
      ) : (
        <div className="bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 h-24 flex items-center justify-center text-slate-400 text-sm font-medium">
          No items to display
        </div>
      )}
    </section>
  );
};
