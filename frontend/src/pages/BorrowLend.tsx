import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowDownLeft, ArrowUpRight, User, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BorrowLend as BorrowLendType } from '@/types/finance';

const BorrowLend = () => {
  const queryClient = useQueryClient();

  const { data: borrowLendEntries = [], isLoading, isError } = useQuery<BorrowLendType[]>({
    queryKey: ['borrow-lend'],
    queryFn: async () => {
      const raw = await api.get<any[]>('/borrow-lend');
      return raw.map((e) => ({ ...e, id: e.id ?? e._id })) as BorrowLendType[];
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BorrowLendType | null>(null);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [entryType, setEntryType] = useState<'borrowed' | 'lent'>('borrowed');
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');

  const borrowed = borrowLendEntries.filter((e) => e.type === 'borrowed');
  const lent = borrowLendEntries.filter((e) => e.type === 'lent');

  const totalBorrowed = borrowed.reduce((acc, e) => acc + e.amount, 0);
  const totalLent = lent.reduce((acc, e) => acc + e.amount, 0);
  const pendingBorrowed = borrowed.filter((e) => e.status === 'pending').reduce((acc, e) => acc + e.amount, 0);
  const pendingLent = lent.filter((e) => e.status === 'pending').reduce((acc, e) => acc + e.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const resetForm = () => {
    setEditing(null);
    setPersonName('');
    setAmount('');
    setPurpose('');
    setDate('');
    setEntryType('borrowed');
    setStatus('pending');
  };

  const openForBorrow = () => {
    resetForm();
    setEntryType('borrowed');
    setIsDialogOpen(true);
  };

  const openForLent = () => {
    resetForm();
    setEntryType('lent');
    setIsDialogOpen(true);
  };

  const openForEdit = (entry: BorrowLendType & { _id?: string }) => {
    setEditing({ ...entry, id: entry.id ?? (entry as any)._id });
    setPersonName(entry.personName);
    setAmount(String(entry.amount));
    setPurpose(entry.purpose);
    setDate(entry.date.slice(0, 10));
    setEntryType(entry.type);
    setStatus(entry.status);
    setIsDialogOpen(true);
  };

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['borrow-lend'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
    ]);
  };

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount);
      if (!personName || Number.isNaN(amt) || amt <= 0) {
        throw new Error('Please provide a valid person and amount');
      }

      const body = {
        personName,
        amount: amt,
        purpose,
        date: date || new Date().toISOString(),
        type: entryType,
        status,
      };

      if (editing?.id) {
        return api.put<BorrowLendType>(`/borrow-lend/${editing.id}`, body);
      }
      return api.post<BorrowLendType>('/borrow-lend', body);
    },
    onSuccess: async () => {
      setIsDialogOpen(false);
      resetForm();
      await invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.del(`/borrow-lend/${id}`),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  return (
    <Layout title="Borrow & Lend" subtitle="Track money borrowed and lent to others">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" className="gap-2" onClick={openForBorrow}>
            <ArrowDownLeft className="h-4 w-4" />
            I Borrowed
          </Button>
          <Button
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={openForLent}
          >
            <ArrowUpRight className="h-4 w-4" />
            I Lent
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-card"
          >
            <p className="text-sm font-medium text-white/80">You Owe</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(pendingBorrowed)}</p>
            <p className="mt-2 text-sm text-white/80">
              {isLoading ? 'Loading...' : isError ? 'Error loading data' : 'To be paid back'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-card"
          >
            <p className="text-sm font-medium text-white/80">Owed to You</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(pendingLent)}</p>
            <p className="mt-2 text-sm text-white/80">To be received</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
            <p className={cn(
              'font-display text-3xl font-bold',
              pendingLent - pendingBorrowed >= 0 ? 'text-income' : 'text-expense'
            )}>
              {formatCurrency(Math.abs(pendingLent - pendingBorrowed))}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {pendingLent - pendingBorrowed >= 0 ? 'To receive' : 'To pay'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Pending Entries</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {borrowLendEntries.filter((e) => e.status === 'pending').length}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">To settle</p>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Money Borrowed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Money Borrowed</h3>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(totalBorrowed)} total
              </span>
            </div>

            {borrowed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <ArrowDownLeft className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No borrowed money to track</p>
              </div>
            ) : (
              <div className="space-y-3">
                {borrowed.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-expense/10 text-expense">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{entry.personName}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.purpose} • {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-expense">{formatCurrency(entry.amount)}</p>
                        <div className={cn(
                          'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          entry.status === 'paid'
                            ? 'bg-income/10 text-income'
                            : 'bg-warning/10 text-warning'
                        )}>
                          {entry.status === 'paid' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {entry.status === 'paid' ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openForEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Money Lent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Money Lent</h3>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(totalLent)} total
              </span>
            </div>

            {lent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No lent money to track</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lent.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-income/10 text-income">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{entry.personName}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.purpose} • {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-income">{formatCurrency(entry.amount)}</p>
                        <div className={cn(
                          'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          entry.status === 'paid'
                            ? 'bg-income/10 text-income'
                            : 'bg-warning/10 text-warning'
                        )}>
                          {entry.status === 'paid' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {entry.status === 'paid' ? 'Received' : 'Pending'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openForEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Entry' : entryType === 'borrowed' ? 'I Borrowed' : 'I Lent'}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Update this borrow/lend record.'
                  : entryType === 'borrowed'
                  ? 'Record money you borrowed.'
                  : 'Record money you lent.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Person</Label>
                <Input
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Person name"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Reason"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full rounded border bg-background px-2 py-1 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => upsertMutation.mutate()}
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending
                  ? 'Saving...'
                  : editing
                  ? 'Update Entry'
                  : 'Save Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default BorrowLend;
