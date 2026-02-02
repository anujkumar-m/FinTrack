import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'savings';
  delay?: number;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant = 'default',
  delay = 0,
}: StatCardProps) => {
  const variants = {
    default: 'bg-card',
    income: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
    expense: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white',
    savings: 'bg-gradient-to-br from-sky-500 to-sky-600 text-white',
  };

  const iconBg = {
    default: 'bg-muted',
    income: 'bg-white/20',
    expense: 'bg-white/20',
    savings: 'bg-white/20',
  };

  const isColored = variant !== 'default';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 shadow-card transition-shadow hover:shadow-card-hover',
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn('text-sm font-medium', isColored ? 'text-white/80' : 'text-muted-foreground')}>
            {title}
          </p>
          <p className={cn('font-display text-3xl font-bold', isColored ? 'text-white' : 'text-foreground')}>
            {value}
          </p>
          {change && (
            <p
              className={cn(
                'text-sm font-medium',
                isColored
                  ? 'text-white/80'
                  : changeType === 'positive'
                  ? 'text-income'
                  : changeType === 'negative'
                  ? 'text-expense'
                  : 'text-muted-foreground'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconBg[variant])}>
          <Icon className={cn('h-6 w-6', isColored ? 'text-white' : 'text-foreground')} />
        </div>
      </div>

      {/* Decorative circles */}
      {isColored && (
        <>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/5" />
        </>
      )}
    </motion.div>
  );
};

export default StatCard;
