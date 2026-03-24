interface UserAvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export function UserAvatar({ initials, color, size = 'md', className = '', title }: UserAvatarProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: color }}
      title={title}
    >
      {initials}
    </div>
  );
}

interface StackedUserAvatarsProps {
  avatars: { initials: string; color: string; title?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StackedUserAvatars({ avatars, max = 3, size = 'sm', className = '' }: StackedUserAvatarsProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;
  
  return (
    <div className={`flex items-center ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className="-ml-2 first:ml-0"
          style={{ zIndex: visibleAvatars.length - index }}
        >
          <UserAvatar
            initials={avatar.initials}
            color={avatar.color}
            size={size}
            title={avatar.title}
            className="ring-2 ring-white"
          />
        </div>
      ))}
      {remaining > 0 && (
        <div className="-ml-2">
          <div
            className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium ring-2 ring-white ${sizeClasses[size]}`}
          >
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
}
