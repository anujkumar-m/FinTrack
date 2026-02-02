import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, CheckCircle, Clock, AlertTriangle, Trash2, Edit } from 'lucide-react';
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
import type { Bill, EMI } from '@/types/finance';

const Bills = () => {
  const queryClient = useQueryClient();

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      const raw = await api.get<any[]>('/bills');
      return raw.map((b) => ({ ...b, id: b.id ?? b._id })) as Bill[];
    },
  });

  const { data: emis = [] } = useQuery<EMI[]>({
    queryKey: ['emis'],
    queryFn: async () => {
      const raw = await api.get<any[]>('/emis');
      return raw.map((e) => ({ ...e, id: e.id ?? e._id })) as EMI[];
    },
  });

  const totalBillsAmount = bills.reduce((acc, bill) => acc + bill.amount, 0);
  const totalEmisAmount = emis.reduce((acc, emi) => acc + emi.amount, 0);
  const pendingBills = bills.filter((b) => !b.isPaid);
  const pendingEmis = emis; // active EMIs

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

  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [isEmiDialogOpen, setIsEmiDialogOpen] = useState(false);

  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billIsPaid, setBillIsPaid] = useState(false);
  const [billIsRecurring, setBillIsRecurring] = useState(false);

  const [editingEmi, setEditingEmi] = useState<EMI | null>(null);
  const [emiName, setEmiName] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [emiStartDate, setEmiStartDate] = useState('');
  const [emiEndDate, setEmiEndDate] = useState('');
  const [emiDayOfMonth, setEmiDayOfMonth] = useState('1');
  const [emiActive, setEmiActive] = useState(true);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['bills'] }),
      queryClient.invalidateQueries({ queryKey: ['emis'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
    ]);
  };

  const openNewBill = () => {
    setEditingBill(null);
    setBillName('');
    setBillAmount('');
    setBillCategory('');
    setBillDueDate('');
    setBillIsPaid(false);
    setBillIsRecurring(true);
    setIsBillDialogOpen(true);
  };

  const openEditBill = (bill: Bill & { _id?: string }) => {
    setEditingBill({ ...bill, id: bill.id ?? (bill as any)._id });
    setBillName(bill.name);
    setBillAmount(String(bill.amount));
    setBillCategory((bill as any).category ?? '');
    setBillDueDate(bill.dueDate.slice(0, 10));
    setBillIsPaid(bill.isPaid);
    setBillIsRecurring(bill.isRecurring);
    setIsBillDialogOpen(true);
  };

  const upsertBill = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(billAmount);
      if (!billName || !billCategory || Number.isNaN(amt) || amt <= 0 || !billDueDate) {
        throw new Error('Please fill all bill fields.');
      }
      const monthKey = billDueDate.slice(0, 7);
      const body = {
        name: billName,
        amount: amt,
        category: billCategory,
        dueDate: billDueDate,
        month: monthKey,
        isPaid: billIsPaid,
        isRecurring: billIsRecurring,
      };
      if (editingBill?.id) {
        return api.put<Bill>(`/bills/${editingBill.id}`, body);
      }
      return api.post<Bill>('/bills', body);
    },
    onSuccess: async () => {
      setIsBillDialogOpen(false);
      await invalidateAll();
    },
  });

  const deleteBill = useMutation({
    mutationFn: async (id: string) => api.del(`/bills/${id}`),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const markBillPaid = useMutation({
    mutationFn: async (bill: Bill & { id?: string }) =>
      api.put<Bill>(`/bills/${bill.id ?? (bill as any)._id}`, {
        ...bill,
        isPaid: true,
      }),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const openNewEmi = () => {
    setEditingEmi(null);
    setEmiName('');
    setEmiAmount('');
    setEmiStartDate('');
    setEmiEndDate('');
    setEmiDayOfMonth('1');
    setEmiActive(true);
    setIsEmiDialogOpen(true);
  };

  const openEditEmi = (emi: EMI & { _id?: string }) => {
    setEditingEmi({ ...emi, id: emi.id ?? (emi as any)._id });
    setEmiName(emi.name);
    setEmiAmount(String(emi.amount));
    setEmiStartDate(emi.startDate.slice(0, 10));
    setEmiEndDate(emi.endDate.slice(0, 10));
    setEmiDayOfMonth(String(emi.dayOfMonth ?? 1));
    setEmiActive(emi.isActive);
    setIsEmiDialogOpen(true);
  };

  const upsertEmi = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(emiAmount);
      if (!emiName || Number.isNaN(amt) || amt <= 0 || !emiStartDate || !emiEndDate) {
        throw new Error('Please fill all EMI fields.');
      }
      const body = {
        name: emiName,
        amount: amt,
        startDate: emiStartDate,
        endDate: emiEndDate,
        dayOfMonth: Number(emiDayOfMonth) || 1,
        isActive: emiActive,
      };
      if (editingEmi?.id) {
        return api.put<EMI>(`/emis/${editingEmi.id}`, body);
      }
      return api.post<EMI>('/emis', body);
    },
    onSuccess: async () => {
      setIsEmiDialogOpen(false);
      await invalidateAll();
    },
  });

  const deleteEmi = useMutation({
    mutationFn: async (id: string) => api.del(`/emis/${id}`),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  return (
    <Layout title="Bills & EMI" subtitle="Manage recurring payments and loans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-end gap-3">
          <Dialog open={isEmiDialogOpen} onOpenChange={setIsEmiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={openNewEmi}>
                <Plus className="h-4 w-4" />
                Add EMI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEmi ? 'Edit EMI' : 'Add EMI'}</DialogTitle>
                <DialogDescription>
                  {editingEmi ? 'Update EMI details.' : 'Create a new EMI schedule.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={emiName}
                    onChange={(e) => setEmiName(e.target.value)}
                    placeholder="e.g. Car Loan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Amount</Label>
                  <Input
                    type="number"
                    value={emiAmount}
                    onChange={(e) => setEmiAmount(e.target.value)}
                    placeholder="e.g. 4500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={emiStartDate}
                    onChange={(e) => setEmiStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={emiEndDate}
                    onChange={(e) => setEmiEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Debit Day of Month</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={emiDayOfMonth}
                    onChange={(e) => setEmiDayOfMonth(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => upsertEmi.mutate()}
                  disabled={upsertEmi.isPending}
                >
                  {upsertEmi.isPending ? 'Saving...' : editingEmi ? 'Update EMI' : 'Save EMI'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={openNewBill}
              >
                <Plus className="h-4 w-4" />
                Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBill ? 'Edit Bill' : 'Add Bill'}</DialogTitle>
                <DialogDescription>
                  {editingBill ? 'Update bill details.' : 'Create a new bill for this month.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={billName}
                    onChange={(e) => setBillName(e.target.value)}
                    placeholder="e.g. Electricity"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="e.g. 1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={billCategory}
                    onChange={(e) => setBillCategory(e.target.value)}
                    placeholder="e.g. Bills & Utilities"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      id="billPaid"
                      type="checkbox"
                      checked={billIsPaid}
                      onChange={(e) => setBillIsPaid(e.target.checked)}
                    />
                    <Label htmlFor="billPaid">Mark as paid</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="billRecurring"
                      type="checkbox"
                      checked={billIsRecurring}
                      onChange={(e) => setBillIsRecurring(e.target.checked)}
                    />
                    <Label htmlFor="billRecurring">Recurring monthly</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => upsertBill.mutate()}
                  disabled={upsertBill.isPending}
                >
                  {upsertBill.isPending ? 'Saving...' : editingBill ? 'Update Bill' : 'Save Bill'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-6 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-card"
          >
            <p className="text-sm font-medium text-white/80">Monthly Bills</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(totalBillsAmount)}</p>
            <p className="mt-2 text-sm text-white/80">{pendingBills.length} pending</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white shadow-card"
          >
            <p className="text-sm font-medium text-white/80">Monthly EMIs</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(totalEmisAmount)}</p>
            <p className="mt-2 text-sm text-white/80">{pendingEmis.length} active</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Total Due</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {formatCurrency(totalBillsAmount + totalEmisAmount)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">This month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Paid Bills</p>
            <p className="font-display text-3xl font-bold text-income">
              {bills.filter((b) => b.isPaid).length}/{bills.length}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">This month</p>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Bills</h3>
              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                {pendingBills.length} pending
              </span>
            </div>

            <div className="space-y-3">
              {bills.map((bill, index) => {
                const daysUntil = getDaysUntil(bill.dueDate);
                const isUrgent = daysUntil <= 5 && !bill.isPaid;

                return (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={cn(
                      'flex items-center justify-between rounded-xl p-4 transition-colors',
                      bill.isPaid
                        ? 'bg-income/5'
                        : isUrgent
                        ? 'bg-destructive/5'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl',
                          bill.isPaid
                            ? 'bg-income/10 text-income'
                            : isUrgent
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {bill.isPaid ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isUrgent ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <Calendar className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{bill.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {formatDate(bill.dueDate)}
                          {!bill.isPaid && daysUntil > 0 && ` • ${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(bill.amount)}</p>
                        <Button
                          variant={bill.isPaid ? 'ghost' : 'outline'}
                          size="sm"
                          className="mt-1 h-7"
                          disabled={bill.isPaid}
                          onClick={() => !bill.isPaid && markBillPaid.mutate(bill)}
                        >
                          {bill.isPaid ? 'Paid' : 'Mark Paid'}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditBill(bill)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBill.mutate(bill.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* EMI Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Active EMIs</h3>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {emis.length} active
              </span>
            </div>

            <div className="space-y-4">
              {emis.map((emi, index) => {
                const startDate = new Date(emi.startDate);
                const endDate = new Date(emi.endDate);
                const now = new Date();
                const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
                const elapsedMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
                const progress = Math.min(100, (elapsedMonths / totalMonths) * 100);
                const remainingMonths = totalMonths - elapsedMonths;

                return (
                  <motion.div
                    key={emi.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{emi.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {remainingMonths} months remaining
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(emi.amount)}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                          className="h-2 rounded-full bg-accent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(emi.startDate)}</span>
                      <span>{progress.toFixed(0)}% complete</span>
                      <span>{formatDate(emi.endDate)}</span>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditEmi(emi)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEmi.mutate(emi.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Bills;
