interface VoteButtonProps {
  votes: number;
  isVoted: boolean;
  onVote: () => void;
  disabled?: boolean;
}

// 点赞按钮：已点赞实心不蓝天，未点赞浅色描边
export default function VoteButton({ votes, isVoted, onVote, disabled = false }: VoteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onVote();
      }}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
        isVoted
          ? 'bg-sky-500 text-white shadow-sm hover:bg-sky-600'
          : 'border border-sky-200 bg-white text-sky-500 hover:bg-sky-50'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
      {votes}
    </button>
  );
}
