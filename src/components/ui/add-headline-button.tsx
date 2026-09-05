import React from 'react';

interface AddHeadlineButtonProps {
  onClick?: () => void;
  label?: string;
}

export const AddHeadlineButton: React.FC<AddHeadlineButtonProps> = ({
  onClick,
  label = 'Add Headline',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-[#F2F4FF] border border-dashed border-[#8C9FFF] text-[#5368FF] rounded-[16px] py-[16px] text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#E5E9FF] active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
    >
      {label} <span className="text-[18px] leading-none mb-[2px]">+</span>
    </button>
  );
};
