// import { motion } from 'framer-motion';
// import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
// import { Transaction } from '@/types/finance';
// import { cn } from '@/lib/utils';

// interface TransactionListProps {
//   transactions: Transaction[];
//   title?: string;
//   showViewAll?: boolean;
// }

// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD',
//   }).format(amount);
// };

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
// };

// const TransactionList = ({ transactions, title = 'Recent Transactions', showViewAll = true }: TransactionListProps) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: 0.2 }}
//       className="rounded-2xl bg-card p-6 shadow-card"
//     >
//       <div className="mb-6 flex items-center justify-between">
//         <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
//         {showViewAll && (
//           <button className="text-sm font-medium text-accent hover:underline">View All</button>
//         )}
//       </div>

//       <div className="space-y-3">
//         {transactions.map((transaction, index) => (
//           <motion.div
//             key={transaction.id}
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.3, delay: index * 0.05 }}
//             className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
//           >
//             <div className="flex items-center gap-4">
//               <div
//                 className={cn(
//                   'flex h-10 w-10 items-center justify-center rounded-xl',
//                   transaction.type === 'income'
//                     ? 'bg-income/10 text-income'
//                     : 'bg-expense/10 text-expense'
//                 )}
//               >
//                 {transaction.type === 'income' ? (
//                   <ArrowDownLeft className="h-5 w-5" />
//                 ) : (
//                   <ArrowUpRight className="h-5 w-5" />
//                 )}
//               </div>
//               <div>
//                 <p className="font-medium text-foreground">{transaction.description}</p>
//                 <p className="text-sm text-muted-foreground">
//                   {transaction.category} • {formatDate(transaction.date)}
//                 </p>
//               </div>
//             </div>
//             <p
//               className={cn(
//                 'font-semibold',
//                 transaction.type === 'income' ? 'text-income' : 'text-expense'
//               )}
//             >
//               {transaction.type === 'income' ? '+' : '-'}
//               {formatCurrency(transaction.amount)}
//             </p>
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// export default TransactionList;

import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  showViewAll?: boolean;
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

const TransactionList = ({ transactions, title = 'Recent Transactions', showViewAll = true }: TransactionListProps) => {
  const navigate = useNavigate(); // Initialize navigation hook

  const handleViewAll = () => {
    // Navigate to the transactions page
    navigate('/expenses'); // Adjust the path as necessary
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        {showViewAll && (
          <button 
            onClick={handleViewAll} // Add onClick handler
            className="text-sm font-medium text-accent hover:underline cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  transaction.type === 'income'
                    ? 'bg-income/10 text-income'
                    : 'bg-expense/10 text-expense'
                )}
              >
                {transaction.type === 'income' ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <p
              className={cn(
                'font-semibold',
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionList;