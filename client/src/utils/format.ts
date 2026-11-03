// 相对时间格式化：x分钟前 / x小时前 / x天前，超过 7 天显示日期
export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return date.toLocaleDateString('zh-CN');
};

// Markdown 纯文本摘要（用于列表卡片）
export const excerpt = (md: string, len = 120): string => {
  const text = md
    .replace(/```[\s\S]*?```/g, ' [代码] ')
    .replace(/[#>*`\-[\]()!|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > len ? `${text.slice(0, len)}…` : text;
};
