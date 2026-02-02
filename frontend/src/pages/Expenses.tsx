import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Download, ArrowUpRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import SpendingChart from '@/components/dashboard/SpendingChart';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction } from '@/types/finance';
import type { MonthlyStats } from '@/types/finance';

interface AnalyticsOverview {
  monthlyStats: MonthlyStats[];
  categoryExpenses: { name: string; value: number; color: string }[];
}

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newPaymentMode, setNewPaymentMode] = useState<'cash' | 'bank' | 'upi' | 'credit_card'>('cash');

  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading, isError } = useQuery<Transaction[]>({
    queryKey: ['transactions', 'expense'],
    queryFn: () => api.get<Transaction[]>('/transactions?type=expense'),
  });

  const { data: analytics } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview', 'expenses'],
    queryFn: () => api.get<AnalyticsOverview>('/analytics/overview?months=6'),
  });

  const categoryExpenses = analytics?.categoryExpenses ?? [];

  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addExpenseMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(newAmount);
      if (!newDescription || Number.isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid description and amount');
      }

      await api.post<Transaction>('/transactions', {
        type: 'expense',
        amount,
        description: newDescription,
        category: newCategory,
        date: new Date().toISOString(),
        paymentMode: newPaymentMode,
      });
    },
    onSuccess: async () => {
      setIsAddOpen(false);
      setNewDescription('');
      setNewAmount('');
      await queryClient.invalidateQueries({ queryKey: ['transactions', 'expense'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary',] });
      await queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout title="Expenses" subtitle="Track and manage your spending">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                  <DialogDescription>
                    Create a new expense entry. It will be saved to your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="e.g. Grocery shopping"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Mode</Label>
                    <Select
                      value={newPaymentMode}
                      onValueChange={(v) =>
                        setNewPaymentMode(v as 'cash' | 'bank' | 'upi' | 'credit_card')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => addExpenseMutation.mutate()}
                    disabled={addExpenseMutation.isPending}
                  >
                    {addExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-white shadow-card"
          >
            <p className="text-sm font-medium text-white/80">Total Expenses</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="mt-2 text-sm text-white/80">This month</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Transactions</p>
            <p className="font-display text-3xl font-bold text-foreground">{expenses.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLoading
                ? 'Loading expenses...'
                : isError
                ? 'Could not load from server, showing 0'
                : 'This month'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Average per Transaction</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {formatCurrency(totalExpenses / expenses.length)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">This month</p>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Expenses List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card"
          >
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              All Expenses
            </h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading expenses from server...</p>
            ) : isError ? (
              <p className="text-sm text-destructive">
                Failed to load expenses from backend. Check that your API is running.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-expense/10 text-expense">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-expense">-{formatCurrency(expense.amount)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {expense.paymentMode?.replace('_', ' ')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Category Breakdown */}
          <SpendingChart data={categoryExpenses} />
        </div>
      </motion.div>
    </Layout>
  );
};

export default Expenses;
