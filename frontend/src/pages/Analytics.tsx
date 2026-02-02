import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Layout from '@/components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MonthlyStats } from '@/types/finance';

interface AnalyticsOverview {
  monthlyStats: MonthlyStats[];
  categoryExpenses: { name: string; value: number; color: string }[];
}

const Analytics = () => {
  const { data, isLoading, isError } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get<AnalyticsOverview>('/analytics/overview?months=6'),
  });

  if (isLoading) {
    return (
      <Layout title="Analytics" subtitle="Deep dive into your financial data">
        <div className="p-6 text-sm text-muted-foreground">Loading analytics from server...</div>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout title="Analytics" subtitle="Deep dive into your financial data">
        <div className="p-6 text-sm text-destructive">
          Could not load analytics data. Make sure the backend is running.
        </div>
      </Layout>
    );
  }

  const monthlyStats = data.monthlyStats ?? [];
  const categoryExpenses = data.categoryExpenses ?? [];
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-popover px-4 py-3 shadow-lg">
          <p className="mb-2 font-medium text-popover-foreground">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: ${item.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const balanceData = monthlyStats.map((stat) => ({
    month: stat.month,
    balance: stat.balance,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasStats = monthlyStats.length > 0;
  const currentMonth = hasStats ? monthlyStats[monthlyStats.length - 1] : null;
  const previousMonth = monthlyStats.length > 1 ? monthlyStats[monthlyStats.length - 2] : null;
  const savingsRate =
    currentMonth && currentMonth.totalIncome > 0
      ? ((currentMonth.totalIncome - currentMonth.totalExpenses) / currentMonth.totalIncome) * 100
      : 0;

  return (
    <Layout title="Analytics" subtitle="Deep dive into your financial data">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              label: 'Avg Monthly Income',
              value: hasStats
                ? formatCurrency(
                    monthlyStats.reduce((a, b) => a + b.totalIncome, 0) / monthlyStats.length
                  )
                : formatCurrency(0),
              color: 'text-income',
            },
            {
              label: 'Avg Monthly Expenses',
              value: hasStats
                ? formatCurrency(
                    monthlyStats.reduce((a, b) => a + b.totalExpenses, 0) / monthlyStats.length
                  )
                : formatCurrency(0),
              color: 'text-expense',
            },
            { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, color: 'text-savings' },
            {
              label: 'Highest Expense',
              value: hasStats
                ? formatCurrency(Math.max(...monthlyStats.map((s) => s.totalExpenses)))
                : formatCurrency(0),
              color: 'text-warning',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              <p className={`font-display text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Income vs Expenses Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
            Income vs Expenses Comparison
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => value.split(' ')[0]}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalIncome" name="Income" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalExpenses" name="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Balance Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
              Balance Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke="hsl(199, 89%, 48%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(199, 89%, 48%)', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Spending Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
              Spending Distribution
            </h3>
            <div className="flex h-64 items-center gap-6">
              <div className="h-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryExpenses.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Savings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="mb-6 font-display text-lg font-semibold text-foreground">
            Monthly Savings
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => value.split(' ')[0]}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="savings" name="Savings" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Analytics;
