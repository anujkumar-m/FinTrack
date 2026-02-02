import { motion } from 'framer-motion';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { CreditCard } from '@/types/finance';
import { cn } from '@/lib/utils';

interface CreditCardWidgetProps {
  cards: CreditCard[];
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

const CreditCardWidget = ({ cards }: CreditCardWidgetProps) => {
  const totalDue = cards.filter((c) => !c.isPaid).reduce((acc, c) => acc + c.billAmount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Credit Cards</h3>
        <CreditCardIcon className="h-5 w-5 opacity-80" />
      </div>

      <div className="mb-6">
        <p className="text-sm opacity-80">Total Outstanding</p>
        <p className="font-display text-3xl font-bold">{formatCurrency(totalDue)}</p>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"
          >
            <div>
              <p className="font-medium">{card.name}</p>
              <p className="text-sm opacity-80">•••• {card.lastFourDigits}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(card.billAmount)}</p>
              <p className={cn('text-xs', card.isPaid ? 'text-income' : 'opacity-80')}>
                {card.isPaid ? 'Paid' : `Due ${formatDate(card.dueDate)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CreditCardWidget;
