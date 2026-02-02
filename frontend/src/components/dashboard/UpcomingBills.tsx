import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Bill, EMI } from '@/types/finance';
import { cn } from '@/lib/utils';

interface UpcomingBillsProps {
  bills: Bill[];
  emis: EMI[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  const dueDate = new Date(dateString);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const UpcomingBills = ({ bills, emis }: UpcomingBillsProps) => {
  const allItems = [
    ...bills.map((bill) => ({ ...bill, type: 'bill' as const })),
    ...emis.map((emi) => ({ ...emi, type: 'emi' as const, dueDate: new Date().toISOString().slice(0, 8) + '15' })),
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Bills & EMIs</h3>
        <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
          {allItems.filter((i) => !i.isPaid).length} pending
        </span>
      </div>

      <div className="space-y-3">
        {allItems.slice(0, 5).map((item, index) => {
          const daysUntil = getDaysUntil(item.dueDate);
          const isUrgent = daysUntil <= 5 && !item.isPaid;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                'flex items-center justify-between rounded-xl p-3 transition-colors',
                isUrgent ? 'bg-destructive/5' : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    item.isPaid
                      ? 'bg-income/10 text-income'
                      : isUrgent
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {item.isPaid ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isUrgent ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Calendar className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Due {formatDate(item.dueDate)}
                    {!item.isPaid && daysUntil > 0 && ` • ${daysUntil} days left`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatCurrency(item.amount)}</p>
                <p className={cn('text-xs', item.isPaid ? 'text-income' : 'text-muted-foreground')}>
                  {item.isPaid ? 'Paid' : item.type === 'emi' ? 'EMI' : 'Bill'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default UpcomingBills;
