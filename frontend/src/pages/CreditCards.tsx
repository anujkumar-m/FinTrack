import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard as CardIcon, CheckCircle, AlertCircle, Trash2, Edit } from 'lucide-react';
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
import type { CreditCard, Transaction } from '@/types/finance';

const CreditCards = () => {
  const queryClient = useQueryClient();

  const { data: creditCards = [] } = useQuery<CreditCard[]>({
    queryKey: ['credit-cards'],
    queryFn: async () => {
      const raw = await api.get<any[]>('/credit-cards');
      return raw.map((c) => ({ ...c, id: c.id ?? c._id })) as CreditCard[];
    },
  });

  const { data: creditCardExpenses = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions', 'credit-card-expenses'],
    queryFn: () =>
      api.get<Transaction[]>('/transactions?type=expense&paymentMode=credit_card'),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [limit, setLimit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const totalOutstanding = creditCards.filter((c) => !c.isPaid).reduce((acc, c) => acc + c.billAmount, 0);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setLastFourDigits('');
    setBillAmount('');
    setLimit('');
    setDueDate('');
    setIsPaid(false);
  };

  const openForCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openForEdit = (card: CreditCard & { _id?: string }) => {
    setEditingId(card.id ?? (card as any)._id ?? null);
    setName(card.name);
    setLastFourDigits(card.lastFourDigits);
    setBillAmount(String(card.billAmount));
    setLimit(card.limit ? String(card.limit) : '');
    setDueDate(card.dueDate.slice(0, 10));
    setIsPaid(card.isPaid);
    setIsDialogOpen(true);
  };

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
      queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] }),
    ]);
  };

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const bill = parseFloat(billAmount || '0');
      const lim = limit ? parseFloat(limit) : undefined;
      if (!name || lastFourDigits.length !== 4) {
        throw new Error('Please enter a card name and last 4 digits');
      }
      const body: any = {
        name,
        lastFourDigits,
        billAmount: Number.isNaN(bill) ? 0 : bill,
        dueDate,
        isPaid,
      };
      if (!Number.isNaN(lim || NaN)) {
        body.limit = lim;
      }
      if (editingId) {
        return api.put<CreditCard>(`/credit-cards/${editingId}`, body);
      }
      return api.post<CreditCard>('/credit-cards', body);
    },
    onSuccess: async () => {
      setIsDialogOpen(false);
      resetForm();
      await invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.del(`/credit-cards/${id}`),
    onSuccess: async () => {
      await invalidateAll();
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Layout title="Credit Cards" subtitle="Manage your credit card bills and expenses">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={openForCreate}
              >
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Card' : 'Add Credit Card'}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? 'Update credit card details.'
                    : 'Add a credit card to track its bills and limits.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Card Name / Bank</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HDFC Regalia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last 4 Digits</Label>
                  <Input
                    value={lastFourDigits}
                    maxLength={4}
                    onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credit Limit</Label>
                  <Input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="e.g. 200000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Bill Amount</Label>
                  <Input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="e.g. 15000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="paid"
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                  />
                  <Label htmlFor="paid">Bill Paid</Label>
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
                    ? 'Update Card'
                    : 'Save Card'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-card"
          >
            <p className="text-sm font-medium text-primary-foreground/80">Total Outstanding</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(totalOutstanding)}</p>
            <p className="mt-2 text-sm text-primary-foreground/80">Across all cards</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Active Cards</p>
            <p className="font-display text-3xl font-bold text-foreground">{creditCards.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Cards linked</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">This Month's Spending</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {formatCurrency(creditCardExpenses.reduce((acc, t) => acc + t.amount, 0))}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Via credit cards</p>
          </motion.div>
        </div>

        {/* Credit Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {creditCards.map((card, index) => {
            const daysUntil = getDaysUntil(card.dueDate);
            const isUrgent = daysUntil <= 7 && !card.isPaid;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  'relative overflow-hidden rounded-2xl p-6 shadow-card',
                  index === 0
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white'
                    : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                )}
              >
                    <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{card.name}</p>
                    <p className="mt-1 font-display text-2xl font-bold">•••• {card.lastFourDigits}</p>
                  </div>
                  <CardIcon className="h-8 w-8 text-white/30" />
                </div>

                  <div className="mt-6 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-white/80">Outstanding Balance</p>
                      <p className="font-display text-3xl font-bold">{formatCurrency(card.billAmount)}</p>
                    </div>
                    {card.isPaid ? (
                      <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Paid
                      </div>
                    ) : isUrgent ? (
                      <div className="flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Due Soon
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-lg bg-white/10 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Payment Due</span>
                      <span className="font-medium">
                        {formatDate(card.dueDate)} • {daysUntil > 0 ? `${daysUntil} days` : 'Overdue'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1 bg-white/20 text-white hover:bg-white/30"
                      onClick={() =>
                        openForEdit({ ...card, isPaid: true })
                      }
                    >
                      {card.isPaid ? 'View Details' : 'Mark as Paid'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openForEdit(card)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(card.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/5" />
              </motion.div>
            );
          })}
        </div>

        {/* Recent Credit Card Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            Recent Credit Card Transactions
          </h3>
          <div className="space-y-3">
            {creditCardExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CardIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category} • {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-expense">-{formatCurrency(expense.amount)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default CreditCards;
