import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  className?: string;
}

const statusConfig = {
  pending: { label: '待处理', class: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: '进行中', class: 'bg-blue-100 text-blue-800' },
  completed: { label: '已完成', class: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', class: 'bg-gray-100 text-gray-800' },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  );
}
