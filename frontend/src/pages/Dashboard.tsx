import { motion } from 'framer-motion';
import { Wallet, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import TransactionList from '@/components/dashboard/TransactionList';
import SpendingChart from '@/components/dashboard/SpendingChart';
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart';
import UpcomingBills from '@/components/dashboard/UpcomingBills';
import SavingsProgress from '@/components/dashboard/SavingsProgress';
import CreditCardWidget from '@/components/dashboard/CreditCardWidget';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction, Bill, EMI, SavingsGoal, CreditCard } from '@/types/finance';
import type { MonthlyStats } from '@/types/finance';

interface DashboardSummaryResponse {
  totals: {
    income: number;
    expenses: number;
    balance: number;
    savings: number;
  };
  borrowLend: {
    pendingBorrowed: number;
    pendingLent: number;
  };
  bills: {
    upcoming: any[];
  };
  emis: {
    active: any[];
    monthlyTotal: number;
  };
  creditCards: {
    dues: number;
    cards: CreditCard[];
  };
  savingsGoals: SavingsGoal[];
}

interface AnalyticsOverview {
  monthlyStats: MonthlyStats[];
  categoryExpenses: { name: string; value: number; color: string }[];
}

const Dashboard = () => {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: summary } = useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard', 'summary', monthKey],
    queryFn: () => api.get<DashboardSummaryResponse>(`/dashboard/summary?month=${monthKey}`),
  });

  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } =
    useQuery<AnalyticsOverview>({
      queryKey: ['analytics', 'overview', 'dashboard'],
      queryFn: () => api.get<AnalyticsOverview>('/analytics/overview?months=6'),
    });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions', 'all'],
    queryFn: () => api.get<Transaction[]>('/transactions'),
  });

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ['bills', 'current'],
    queryFn: () => api.get<Bill[]>('/bills'),
  });

  const { data: emis = [] } = useQuery<EMI[]>({
    queryKey: ['emis', 'current'],
    queryFn: () => api.get<EMI[]>('/emis'),
  });

  const monthlyStats = analytics?.monthlyStats ?? [];
  const categoryExpenses = analytics?.categoryExpenses ?? [];
  const hasStats = monthlyStats.length > 0;
  const currentMonth = hasStats ? monthlyStats[monthlyStats.length - 1] : null;
  const previousMonth = monthlyStats.length > 1 ? monthlyStats[monthlyStats.length - 2] : null;

  const incomeChange =
    currentMonth && previousMonth && previousMonth.totalIncome > 0
      ? ((currentMonth.totalIncome - previousMonth.totalIncome) / previousMonth.totalIncome) * 100
      : 0;
  const expenseChange =
    currentMonth && previousMonth && previousMonth.totalExpenses > 0
      ? ((currentMonth.totalExpenses - previousMonth.totalExpenses) / previousMonth.totalExpenses) * 100
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout title="Dashboard" subtitle="Welcome back! Here's your financial overview.">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={formatCurrency(summary?.totals.balance ?? 0)}
            change={
              hasStats && previousMonth && currentMonth
                ? `+${formatCurrency(currentMonth.balance - previousMonth.balance)} from last month`
                : 'No previous data'
            }
            changeType="positive"
            icon={Wallet}
            variant="default"
            delay={0}
          />
          <StatCard
            title="Monthly Income"
            value={formatCurrency(summary?.totals.income ?? 0)}
            change={`${incomeChange > 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs last month`}
            changeType={incomeChange >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
            variant="income"
            delay={0.1}
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(summary?.totals.expenses ?? 0)}
            change={`${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}% vs last month`}
            changeType={expenseChange <= 0 ? 'positive' : 'negative'}
            icon={TrendingDown}
            variant="expense"
            delay={0.2}
          />
          <StatCard
            title="Total Savings"
            value={formatCurrency(summary?.totals.savings ?? 0)}
            icon={PiggyBank}
            variant="savings"
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Charts */}
          <div className="space-y-6 lg:col-span-2">
            <MonthlyTrendChart data={monthlyStats} />
            
            <div className="grid gap-6 md:grid-cols-2">
              <SpendingChart data={categoryExpenses} />
              <TransactionList transactions={transactions.slice(0, 6)} />
            </div>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            <CreditCardWidget cards={summary?.creditCards.cards ?? []} />
            <UpcomingBills bills={bills} emis={emis} />
            <SavingsProgress goals={summary?.savingsGoals ?? []} />
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
