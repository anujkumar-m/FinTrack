import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Download, ArrowDownLeft, Briefcase, Laptop, TrendingUp, Trash2, Edit } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
import type { Transaction } from '@/types/finance';

const Income = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [source, setSource] = useState('Salary');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'upi' | 'credit_card'>('bank');

  const queryClient = useQueryClient();

  const { data: incomeTransactions = [], isLoading, isError } = useQuery<Transaction[]>({
    queryKey: ['transactions', 'income'],
    queryFn: async () => {
      const raw = await api.get<any[]>('/transactions?type=income');
      return raw.map((tx) => ({
        ...tx,
        id: tx.id ?? tx._id, // normalize Mongo _id to id
      })) as Transaction[];
    },
  });
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);

  const filteredIncome = incomeTransactions.filter(
    (income) =>
      income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggregate income by "source" (description) for the progress cards
  const sourceTotals = incomeTransactions.reduce<Record<string, number>>((acc, tx) => {
    const key = tx.description || 'Other';
    acc[key] = (acc[key] || 0) + tx.amount;
    return acc;
  }, {});

  const sourceEntries = Object.entries(sourceTotals).sort((a, b) => b[1] - a[1]);
  const topSources = sourceEntries.slice(0, 3);
  const totalForSources = topSources.reduce((sum, [, value]) => sum + value, 0) || 1;

  const incomeSources = topSources.map(([name, amt], idx) => {
    const base = [
      { icon: Briefcase, color: 'bg-income' },
      { icon: Laptop, color: 'bg-savings' },
      { icon: TrendingUp, color: 'bg-purple-500' },
    ][idx] ?? { icon: TrendingUp, color: 'bg-purple-500' };

    return {
      name,
      icon: base.icon,
      amount: amt,
      percentage: (amt / totalForSources) * 100,
      color: base.color,
    };
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

  const resetForm = () => {
    setEditingId(null);
    setSource('Salary');
    setAmount('');
    setCategory('General');
    setNotes('');
    setPaymentMode('bank');
  };

  const openForCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openForEdit = (tx: Transaction & { _id?: string }) => {
    setEditingId(tx.id ?? tx._id ?? null);
    setSource(tx.description);
    setAmount(String(tx.amount));
    setCategory(tx.category);
    setNotes((tx as any).notes ?? '');
    setPaymentMode(tx.paymentMode ?? 'bank');
    setIsDialogOpen(true);
  };

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
      queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] }),
    ]);
  };

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount);
      if (!source || Number.isNaN(amt) || amt <= 0) {
        throw new Error('Please enter a valid source and amount');
      }

      const body = {
        type: 'income',
        amount: amt,
        description: source,
        category,
        date: new Date().toISOString(),
        paymentMode,
        notes,
      };

      if (editingId) {
        return api.put<Transaction>(`/transactions/${editingId}`, body);
      }
      return api.post<Transaction>('/transactions', body);
    },
    onSuccess: async () => {
      setIsDialogOpen(false);
      resetForm();
      await invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.del(`/transactions/${id}`),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  return (
    <Layout title="Income" subtitle="Track your earnings and income sources">
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
              placeholder="Search income..."
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={openForCreate}
                >
                  <Plus className="h-4 w-4" />
                  Add Income
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Income' : 'Add Income'}</DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? 'Update this income entry.'
                      : 'Create a new income entry. It will be saved to your account.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. Company, Freelance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Salary, Bonus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Mode</Label>
                    <Select
                      value={paymentMode}
                      onValueChange={(v) =>
                        setPaymentMode(v as 'cash' | 'bank' | 'upi' | 'credit_card')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => upsertMutation.mutate()}
                    disabled={upsertMutation.isPending}
                  >
                    {upsertMutation.isPending
                      ? 'Saving...'
                      : editingId
                      ? 'Update Income'
                      : 'Save Income'}
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
            className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-card"
          >
            <p className="text-sm font-medium text-white/80">Total Income</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(totalIncome)}</p>
            <p className="mt-2 text-sm text-white/80">This month</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Income Sources</p>
            <p className="font-display text-3xl font-bold text-foreground">{incomeSources.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Active sources</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Transactions</p>
            <p className="font-display text-3xl font-bold text-foreground">{incomeTransactions.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">This month</p>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Income List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card"
          >
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              All Income
            </h3>
            <div className="space-y-3">
              {filteredIncome.map((income, index) => (
                <motion.div
                  key={income.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-income/10 text-income">
                      <ArrowDownLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{income.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {income.category} • {formatDate(income.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-income">+{formatCurrency(income.amount)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {income.paymentMode}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openForEdit(income)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(income.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Income Sources Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Income Sources
            </h3>
            <div className="space-y-4">
              {incomeSources.map((source, index) => {
                const Icon = source.icon;
                return (
                  <div key={source.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', source.color, 'text-white')}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{source.name}</p>
                          <p className="text-sm text-muted-foreground">{source.percentage}%</p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">{formatCurrency(source.amount)}</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${source.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className={cn('h-2 rounded-full', source.color)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Income;
