import { CSSProperties } from 'react';

const Cloud = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 200 100" fill="#ffffff" className={className} style={style}>
    <ellipse cx="55" cy="68" rx="42" ry="26" />
    <ellipse cx="102" cy="52" rx="38" ry="30" />
    <ellipse cx="148" cy="70" rx="34" ry="22" />
  </svg>
);

// 太阳
const Sun = () => (
  <svg viewBox="0 0 100 100" className="absolute right-[6%] top-24 w-20 animate-floaty opacity-90 sm:w-24">
    <g stroke="#FDE68A" strokeWidth="5" strokeLinecap="round">
      <line x1="50" y1="6" x2="50" y2="18" />
      <line x1="50" y1="82" x2="50" y2="94" />
      <line x1="6" y1="50" x2="18" y2="50" />
      <line x1="82" y1="50" x2="94" y2="50" />
      <line x1="19" y1="19" x2="27" y2="27" />
      <line x1="73" y1="73" x2="81" y2="81" />
      <line x1="81" y1="19" x2="73" y2="27" />
      <line x1="27" y1="73" x2="19" y2="81" />
    </g>
    <circle cx="50" cy="50" r="20" fill="#FDE68A" />
    <circle cx="44" cy="46" r="3" fill="#FBBF24" opacity="0.6" />
  </svg>
);

// 全局蓝天白云装饰：漂移的云 + 小太阳，不遮挡交互
export default function CloudDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <Sun />
      <Cloud className="absolute top-20 w-44 animate-drift opacity-80" style={{ animationDuration: '70s' }} />
      <Cloud className="absolute top-[32%] w-64 animate-drift opacity-60" style={{ animationDuration: '100s', animationDelay: '-35s' }} />
      <Cloud className="absolute top-[55%] w-40 animate-drift opacity-70" style={{ animationDuration: '85s', animationDelay: '-60s' }} />
      <Cloud className="absolute top-[78%] w-56 animate-drift opacity-50" style={{ animationDuration: '120s', animationDelay: '-15s' }} />
      <Cloud className="absolute top-[10%] w-32 animate-drift opacity-60" style={{ animationDuration: '95s', animationDelay: '-80s' }} />
    </div>
  );
}
