interface AvatarProps {
  username: string;
  avatar?: string | null;
  size?: number;
}

// 头像：有图显示图，无图显示用户名首字符（天蓝底）
export default function Avatar({ username, avatar, size = 32 }: AvatarProps) {
  const style = { width: size, height: size };
  return (
    <div
      style={style}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-300 to-sky-400 text-sm font-bold text-white"
    >
      {avatar ? (
        <img src={avatar} alt={username} className="h-full w-full object-cover" />
      ) : (
        <span>{username.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
}
