interface TagBadgeProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

// 天蓝系标签
export default function TagBadge({ tag, onClick, active = false }: TagBadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition';
  const style = active
    ? 'bg-sky-500 text-white'
    : 'bg-sky-50 text-sky-600 border border-sky-100';
  const interactive = onClick ? `${style} cursor-pointer hover:bg-sky-100 hover:text-sky-700` : style;

  return (
    <span className={`${base} ${interactive}`} onClick={onClick}>
      {tag}
    </span>
  );
}
