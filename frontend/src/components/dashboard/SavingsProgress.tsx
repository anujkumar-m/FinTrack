import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { SavingsGoal } from '@/types/finance';
import { Progress } from '@/components/ui/progress';

interface SavingsProgressProps {
  goals: SavingsGoal[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SavingsProgress = ({ goals }: SavingsProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">Savings Goals</h3>
        <button className="text-sm font-medium text-accent hover:underline">Add Goal</button>
      </div>

      <div className="space-y-5">
        {goals.map((goal, index) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <p className="font-medium text-foreground">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(remaining)} left to reach goal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{progress.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SavingsProgress;
