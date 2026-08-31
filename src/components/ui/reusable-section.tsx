import React from 'react';
import { SectionHeader } from './section-header';

interface ReusableSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ReusableSection: React.FC<ReusableSectionProps> = ({ title, children, className }) => (
  <section>
    <SectionHeader title={title} />
    <div className={`bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 ${className || ''}`}>
      {children}
    </div>
  </section>
);
