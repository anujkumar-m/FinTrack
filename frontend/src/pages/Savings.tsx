// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Plus, Target, TrendingUp, Calendar, Trash2, Edit } from 'lucide-react';
// import Layout from '@/components/layout/Layout';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { cn } from '@/lib/utils';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '@/lib/api';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import type { SavingsGoal } from '@/types/finance';

// const Savings = () => {
//   const queryClient = useQueryClient();

//   const { data: savingsGoals = [] } = useQuery<SavingsGoal[]>({
//     queryKey: ['savings-goals'],
//     queryFn: async () => {
//       const raw = await api.get<any[]>('/savings-goals');
//       return raw.map((g) => ({ ...g, id: g.id ?? g._id })) as SavingsGoal[];
//     },
//   });

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [name, setName] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');
//   const [currentAmount, setCurrentAmount] = useState('');
//   const [targetDate, setTargetDate] = useState('');
//   const [icon, setIcon] = useState('💰');

//   const totalSaved = savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
//   const totalTarget = savingsGoals.reduce((acc, goal) => acc + goal.targetAmount, 0);
//   const overallProgress = (totalSaved / totalTarget) * 100;

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const getTimeRemaining = (targetDate: string) => {
//     const now = new Date();
//     const target = new Date(targetDate);
//     const diff = target.getTime() - now.getTime();
//     const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
//     const months = Math.floor(days / 30);
    
//     if (months > 0) return `${months} months left`;
//     return `${days} days left`;
//   };

//   const getMonthlySaving = (goal: typeof savingsGoals[0]) => {
//     const now = new Date();
//     const target = new Date(goal.targetDate);
//     const diff = target.getTime() - now.getTime();
//     const months = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30)));
//     const remaining = goal.targetAmount - goal.currentAmount;
//     return remaining / months;
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setName('');
//     setTargetAmount('');
//     setCurrentAmount('');
//     setTargetDate('');
//     setIcon('💰');
//   };

//   const openForCreate = () => {
//     resetForm();
//     setIsDialogOpen(true);
//   };

//   const openForEdit = (goal: SavingsGoal & { _id?: string }) => {
//     setEditingId(goal.id ?? (goal as any)._id ?? null);
//     setName(goal.name);
//     setTargetAmount(String(goal.targetAmount));
//     setCurrentAmount(String(goal.currentAmount));
//     setTargetDate(goal.targetDate.slice(0, 10));
//     setIcon(goal.icon ?? '💰');
//     setIsDialogOpen(true);
//   };

//   const invalidateAll = async () => {
//     await Promise.all([
//       queryClient.invalidateQueries({ queryKey: ['savings-goals'] }),
//       queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
//       queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary',] }),
//       queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] }),
//     ]);
//   };

//   const upsertMutation = useMutation({
//     mutationFn: async () => {
//       const target = parseFloat(targetAmount);
//       const current = parseFloat(currentAmount || '0');
//       if (!name || Number.isNaN(target) || target <= 0) {
//         throw new Error('Please enter a valid goal name and target amount');
//       }

//       const body = {
//         name,
//         targetAmount: target,
//         currentAmount: Number.isNaN(current) ? 0 : current,
//         targetDate,
//         icon,
//       };

//       if (editingId) {
//         return api.put<SavingsGoal>(`/savings-goals/${editingId}`, body);
//       }
//       return api.post<SavingsGoal>('/savings-goals', body);
//     },
//     onSuccess: async () => {
//       setIsDialogOpen(false);
//       resetForm();
//       await invalidateAll();
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => api.del(`/savings-goals/${id}`),
//     onSuccess: async () => {
//       await invalidateAll();
//     },
//   });

//   return (
//     <Layout title="Savings Goals" subtitle="Track your progress toward financial goals">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="space-y-6"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div />
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button
//                 className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
//                 onClick={openForCreate}
//               >
//                 <Plus className="h-4 w-4" />
//                 New Goal
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>{editingId ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
//                 <DialogDescription>
//                   {editingId
//                     ? 'Update your savings goal details.'
//                     : 'Create a new savings goal to track your progress.'}
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4 py-2">
//                 <div className="space-y-2">
//                   <Label>Goal Name</Label>
//                   <Input
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="e.g. New Laptop"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Target Amount</Label>
//                   <Input
//                     type="number"
//                     value={targetAmount}
//                     onChange={(e) => setTargetAmount(e.target.value)}
//                     placeholder="e.g. 2000"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Saved Amount</Label>
//                   <Input
//                     type="number"
//                     value={currentAmount}
//                     onChange={(e) => setCurrentAmount(e.target.value)}
//                     placeholder="e.g. 500"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Target Date</Label>
//                   <Input
//                     type="date"
//                     value={targetDate}
//                     onChange={(e) => setTargetDate(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Icon</Label>
//                   <Input
//                     value={icon}
//                     onChange={(e) => setIcon(e.target.value || '💰')}
//                     maxLength={2}
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button
//                   onClick={() => upsertMutation.mutate()}
//                   disabled={upsertMutation.isPending}
//                 >
//                   {upsertMutation.isPending
//                     ? 'Saving...'
//                     : editingId
//                     ? 'Update Goal'
//                     : 'Save Goal'}
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid gap-6 md:grid-cols-3">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-6 text-white shadow-card"
//           >
//             <p className="text-sm font-medium text-white/80">Total Saved</p>
//             <p className="font-display text-3xl font-bold">{formatCurrency(totalSaved)}</p>
//             <p className="mt-2 text-sm text-white/80">Across all goals</p>
//           </motion.div>
          
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="rounded-2xl bg-card p-6 shadow-card"
//           >
//             <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
//             <p className="font-display text-3xl font-bold text-foreground">{formatCurrency(totalTarget)}</p>
//             <p className="mt-2 text-sm text-muted-foreground">Total across goals</p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="rounded-2xl bg-card p-6 shadow-card"
//           >
//             <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
//             <p className="font-display text-3xl font-bold text-foreground">{overallProgress.toFixed(0)}%</p>
//             <Progress value={overallProgress} className="mt-3 h-2" />
//           </motion.div>
//         </div>

//         {/* Goals Grid */}
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {savingsGoals.map((goal, index) => {
//             const progress = (goal.currentAmount / goal.targetAmount) * 100;
//             const remaining = goal.targetAmount - goal.currentAmount;
//             const monthlyNeeded = getMonthlySaving(goal);

//             return (
//               <motion.div
//                 key={goal.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 + index * 0.1 }}
//                 className="group rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
//               >
//                 <div className="mb-4 flex items-start justify-between">
//                   <div className="flex items-center gap-3">
//                     <span className="text-4xl">{goal.icon}</span>
//                     <div>
//                       <h3 className="font-display text-lg font-semibold text-foreground">
//                         {goal.name}
//                       </h3>
//                       <p className="text-sm text-muted-foreground">
//                         {getTimeRemaining(goal.targetDate)}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
//                     {progress.toFixed(0)}%
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <Progress value={progress} className="h-3" />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-muted-foreground">Current</p>
//                     <p className="font-semibold text-foreground">{formatCurrency(goal.currentAmount)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Target</p>
//                     <p className="font-semibold text-foreground">{formatCurrency(goal.targetAmount)}</p>
//                   </div>
//                 </div>

//                 <div className="mt-4 rounded-lg bg-muted/50 p-3">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <TrendingUp className="h-4 w-4 text-muted-foreground" />
//                       <span className="text-sm text-muted-foreground">Monthly needed</span>
//                     </div>
//                     <span className="font-semibold text-foreground">{formatCurrency(monthlyNeeded)}</span>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex items-center justify-between gap-3">
//                   <Button
//                     variant="outline"
//                     className="flex-1"
//                     onClick={() => openForEdit(goal)}
//                   >
//                     Add Savings
//                   </Button>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => openForEdit(goal)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => deleteMutation.mutate(goal.id)}
//                     >
//                       <Trash2 className="h-4 w-4 text-destructive" />
//                     </Button>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}

//           {/* Add New Goal Card */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="flex min-h-[280px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 transition-colors hover:border-accent hover:bg-muted/40"
//             onClick={openForCreate}
//           >
//             <div className="text-center">
//               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
//                 <Plus className="h-8 w-8 text-accent" />
//               </div>
//               <h3 className="font-display text-lg font-semibold text-foreground">Create New Goal</h3>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Set a new savings target
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     </Layout>
//   );
// };

// export default Savings;


// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Plus, Target, TrendingUp, Calendar, Trash2, Edit, DollarSign, CheckCircle, XCircle } from 'lucide-react';
// import Layout from '@/components/layout/Layout';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { cn } from '@/lib/utils';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '@/lib/api';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import type { SavingsGoal } from '@/types/finance';

// const Savings = () => {
//   const queryClient = useQueryClient();

//   const { data: savingsGoals = [] } = useQuery<SavingsGoal[]>({
//     queryKey: ['savings-goals'],
//     queryFn: async () => {
//       const raw = await api.get<any[]>('/savings-goals');
//       return raw.map((g) => ({ ...g, id: g._id })) as SavingsGoal[]; // Use _id
//     },
//   });

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [name, setName] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');
//   const [currentAmount, setCurrentAmount] = useState('');
//   const [targetDate, setTargetDate] = useState('');
//   const [icon, setIcon] = useState('💰');
  
//   const [isAddSavingOpen, setIsAddSavingOpen] = useState(false);
//   const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
//   const [addAmount, setAddAmount] = useState('');
//   const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

//   const totalSaved = savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
//   const totalTarget = savingsGoals.reduce((acc, goal) => acc + goal.targetAmount, 0);
//   const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount);
//   };

//   const getTimeRemaining = (targetDate: string | Date) => {
//     const now = new Date();
//     const target = new Date(targetDate);
//     const diff = target.getTime() - now.getTime();
//     const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
//     if (days <= 0) return 'Goal date passed';
//     if (days >= 30) {
//       const months = Math.floor(days / 30);
//       return `${months} month${months !== 1 ? 's' : ''} left`;
//     }
//     return `${days} day${days !== 1 ? 's' : ''} left`;
//   };

//   const getDaysLeft = (targetDate: string | Date) => {
//     const now = new Date();
//     const target = new Date(targetDate);
//     const diff = target.getTime() - now.getTime();
//     return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
//   };

//   const getMonthlySaving = (goal: SavingsGoal) => {
//     const daysLeft = getDaysLeft(goal.targetDate);
//     if (daysLeft <= 0) return 0;
    
//     const remainingAmount = goal.targetAmount - goal.currentAmount;
//     if (remainingAmount <= 0) return 0;
    
//     const monthsRemaining = daysLeft / 30.44; // Average days per month
//     if (monthsRemaining < 1) return remainingAmount;
    
//     return remainingAmount / monthsRemaining;
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setName('');
//     setTargetAmount('');
//     setCurrentAmount('');
//     setTargetDate('');
//     setIcon('💰');
//   };

//   const resetAddSavingForm = () => {
//     setSelectedGoalId(null);
//     setAddAmount('');
//   };

//   const openForCreate = () => {
//     resetForm();
//     setIsDialogOpen(true);
//   };

//   const openForEdit = (goal: SavingsGoal) => {
//     setEditingId(goal._id);
//     setName(goal.name);
//     setTargetAmount(String(goal.targetAmount));
//     setCurrentAmount(String(goal.currentAmount));
//     setTargetDate(new Date(goal.targetDate).toISOString().split('T')[0]);
//     setIcon(goal.icon || '💰');
//     setIsDialogOpen(true);
//   };

//   const openAddSavingDialog = (goalId: string) => {
//     setSelectedGoalId(goalId);
//     setAddAmount('');
//     setIsAddSavingOpen(true);
//   };

//   const invalidateAll = async () => {
//     await queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
//   };

//   const showFeedback = (type: 'success' | 'error', message: string) => {
//     setFeedback({ type, message });
//     setTimeout(() => setFeedback(null), 3000);
//   };

//   // FIXED: Use PATCH to /savings-goals/:id/add
//   const addSavingMutation = useMutation({
//     mutationFn: async () => {
//       if (!selectedGoalId || !addAmount) {
//         throw new Error('Please enter a valid amount');
//       }

//       const amount = parseFloat(addAmount);
//       if (Number.isNaN(amount) || amount <= 0) {
//         throw new Error('Please enter a valid positive amount');
//       }

//       // Use PATCH to /savings-goals/:id/add
//       return api.patch<SavingsGoal>(`/savings-goals/${selectedGoalId}/add`, { amount });
//     },
//     onSuccess: async (updatedGoal) => {
//       setIsAddSavingOpen(false);
//       resetAddSavingForm();
      
//       // Update cache with the returned goal
//       queryClient.setQueryData<SavingsGoal[]>(['savings-goals'], (old) => {
//         if (!old) return [updatedGoal];
//         return old.map(goal => 
//           goal._id === selectedGoalId ? updatedGoal : goal
//         );
//       });
      
//       showFeedback('success', `Successfully added ${formatCurrency(parseFloat(addAmount))} to your goal!`);
//     },
//     onError: (error: Error) => {
//       showFeedback('error', error.message || 'Failed to add savings. Please try again.');
//     },
//   });

//   const upsertMutation = useMutation({
//     mutationFn: async () => {
//       const target = parseFloat(targetAmount);
//       const current = parseFloat(currentAmount || '0');
//       if (!name || Number.isNaN(target) || target <= 0) {
//         throw new Error('Please enter a valid goal name and target amount');
//       }

//       const body = {
//         name,
//         targetAmount: target,
//         currentAmount: Number.isNaN(current) ? 0 : current,
//         targetDate,
//         icon,
//       };

//       if (editingId) {
//         return api.put<SavingsGoal>(`/savings-goals/${editingId}`, body);
//       }
//       return api.post<SavingsGoal>('/savings-goals', body);
//     },
//     onSuccess: async () => {
//       setIsDialogOpen(false);
//       resetForm();
//       await invalidateAll();
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => api.del(`/savings-goals/${id}`),
//     onSuccess: async () => {
//       await invalidateAll();
//     },
//   });

//   return (
//     <Layout title="Savings Goals" subtitle="Track your progress toward financial goals">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="space-y-6"
//       >
//         {/* Feedback Alert */}
//         {feedback && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className={`fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg px-6 py-4 shadow-lg ${
//               feedback.type === 'success' 
//                 ? 'bg-green-100 text-green-800 border border-green-200'
//                 : 'bg-red-100 text-red-800 border border-red-200'
//             }`}
//           >
//             {feedback.type === 'success' ? (
//               <CheckCircle className="h-5 w-5" />
//             ) : (
//               <XCircle className="h-5 w-5" />
//             )}
//             <span className="font-medium">{feedback.message}</span>
//           </motion.div>
//         )}

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div />
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button
//                 className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
//                 onClick={openForCreate}
//               >
//                 <Plus className="h-4 w-4" />
//                 New Goal
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>{editingId ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
//                 <DialogDescription>
//                   {editingId
//                     ? 'Update your savings goal details.'
//                     : 'Create a new savings goal to track your progress.'}
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4 py-2">
//                 <div className="space-y-2">
//                   <Label>Goal Name</Label>
//                   <Input
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="e.g. New Laptop"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Target Amount</Label>
//                   <Input
//                     type="number"
//                     value={targetAmount}
//                     onChange={(e) => setTargetAmount(e.target.value)}
//                     placeholder="e.g. 2000"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Saved Amount</Label>
//                   <Input
//                     type="number"
//                     value={currentAmount}
//                     onChange={(e) => setCurrentAmount(e.target.value)}
//                     placeholder="e.g. 500"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Target Date</Label>
//                   <Input
//                     type="date"
//                     value={targetDate}
//                     onChange={(e) => setTargetDate(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Icon</Label>
//                   <Input
//                     value={icon}
//                     onChange={(e) => setIcon(e.target.value || '💰')}
//                     maxLength={2}
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button
//                   onClick={() => upsertMutation.mutate()}
//                   disabled={upsertMutation.isPending}
//                 >
//                   {upsertMutation.isPending
//                     ? 'Saving...'
//                     : editingId
//                     ? 'Update Goal'
//                     : 'Save Goal'}
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid gap-6 md:grid-cols-3">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-6 text-white shadow-card"
//           >
//             <p className="text-sm font-medium text-white/80">Total Saved</p>
//             <p className="font-display text-3xl font-bold">{formatCurrency(totalSaved)}</p>
//             <p className="mt-2 text-sm text-white/80">Across all goals</p>
//           </motion.div>
          
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="rounded-2xl bg-card p-6 shadow-card"
//           >
//             <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
//             <p className="font-display text-3xl font-bold text-foreground">{formatCurrency(totalTarget)}</p>
//             <p className="mt-2 text-sm text-muted-foreground">Total across goals</p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="rounded-2xl bg-card p-6 shadow-card"
//           >
//             <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
//             <p className="font-display text-3xl font-bold text-foreground">{overallProgress.toFixed(1)}%</p>
//             <Progress value={overallProgress} className="mt-3 h-2" />
//           </motion.div>
//         </div>

//         {/* Add Saving Dialog */}
//         <Dialog open={isAddSavingOpen} onOpenChange={setIsAddSavingOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add Savings</DialogTitle>
//               <DialogDescription>
//                 Add money to your savings goal
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-2">
//               <div className="space-y-2">
//                 <Label>Amount to Add</Label>
//                 <div className="relative">
//                   <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     type="number"
//                     value={addAmount}
//                     onChange={(e) => setAddAmount(e.target.value)}
//                     placeholder="0.00"
//                     className="pl-9"
//                     min="0.01"
//                     step="0.01"
//                     disabled={addSavingMutation.isPending}
//                   />
//                 </div>
//                 {selectedGoalId && (
//                   <p className="text-sm text-muted-foreground">
//                     This will be added to "{savingsGoals.find(g => g._id === selectedGoalId)?.name}"
//                   </p>
//                 )}
//               </div>
//             </div>
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsAddSavingOpen(false)}
//                 disabled={addSavingMutation.isPending}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => addSavingMutation.mutate()}
//                 disabled={addSavingMutation.isPending || !addAmount || parseFloat(addAmount) <= 0}
//                 className="gap-2"
//               >
//                 {addSavingMutation.isPending ? (
//                   <>
//                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                     Adding...
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="h-4 w-4" />
//                     Add Savings
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Goals Grid */}
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {savingsGoals.map((goal, index) => {
//             const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
//             const monthlyNeeded = getMonthlySaving(goal);
//             const daysLeft = getDaysLeft(goal.targetDate);

//             return (
//               <motion.div
//                 key={goal._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 + index * 0.1 }}
//                 className="group rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
//               >
//                 <div className="mb-4 flex items-start justify-between">
//                   <div className="flex items-center gap-3">
//                     <span className="text-4xl">{goal.icon || '💰'}</span>
//                     <div>
//                       <h3 className="font-display text-lg font-semibold text-foreground">
//                         {goal.name}
//                       </h3>
//                       <p className="text-sm text-muted-foreground">
//                         {getTimeRemaining(goal.targetDate)}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
//                     {progress.toFixed(1)}%
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <Progress value={progress} className="h-3" />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-muted-foreground">Current</p>
//                     <p className="font-semibold text-foreground">{formatCurrency(goal.currentAmount)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Target</p>
//                     <p className="font-semibold text-foreground">{formatCurrency(goal.targetAmount)}</p>
//                   </div>
//                 </div>

//                 <div className="mt-4 rounded-lg bg-muted/50 p-3">
//                   <div className="mb-3">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <Calendar className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm text-muted-foreground">Days left</span>
//                       </div>
//                       <span className="font-semibold text-foreground">{daysLeft}</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <TrendingUp className="h-4 w-4 text-muted-foreground" />
//                       <span className="text-sm text-muted-foreground">Monthly needed</span>
//                     </div>
//                     <span className="font-semibold text-foreground">
//                       {formatCurrency(monthlyNeeded)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex items-center justify-between gap-3">
//                   <Button
//                     variant="outline"
//                     className="flex-1"
//                     onClick={() => openAddSavingDialog(goal._id)}
//                   >
//                     Add Savings
//                   </Button>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => openForEdit(goal)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => {
//                         if (window.confirm(`Are you sure you want to delete "${goal.name}"?`)) {
//                           deleteMutation.mutate(goal._id);
//                         }
//                       }}
//                     >
//                       <Trash2 className="h-4 w-4 text-destructive" />
//                     </Button>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}

//           {/* Add New Goal Card */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="flex min-h-[280px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 transition-colors hover:border-accent hover:bg-muted/40"
//             onClick={openForCreate}
//           >
//             <div className="text-center">
//               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
//                 <Plus className="h-8 w-8 text-accent" />
//               </div>
//               <h3 className="font-display text-lg font-semibold text-foreground">Create New Goal</h3>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Set a new savings target
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     </Layout>
//   );
// };

// export default Savings;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar, Trash2, Edit, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import type { SavingsGoal } from '@/types/finance';

const Savings = () => {
  const queryClient = useQueryClient();

  const { data: savingsGoals = [], isLoading, error } = useQuery<SavingsGoal[]>({
    queryKey: ['savings-goals'],
    queryFn: async () => {
      try {
        const raw = await api.get<any[]>('/savings-goals');
        console.log('Fetched savings goals:', raw);
        return raw.map((g) => ({ ...g, id: g._id })) as SavingsGoal[];
      } catch (error) {
        console.error('Error fetching savings goals:', error);
        throw error;
      }
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('💰');
  
  const [isAddSavingOpen, setIsAddSavingOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get default target date (tomorrow)
  const getDefaultTargetDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const totalSaved = savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTimeRemaining = (targetDate: string | Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 'Goal date passed';
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? 's' : ''} left`;
    }
    return `${days} day${days !== 1 ? 's' : ''} left`;
  };

  const getDaysLeft = (targetDate: string | Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getMonthlySaving = (goal: SavingsGoal) => {
    const daysLeft = getDaysLeft(goal.targetDate);
    if (daysLeft <= 0) return 0;
    
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    if (remainingAmount <= 0) return 0;
    
    const monthsRemaining = daysLeft / 30.44; // Average days per month
    if (monthsRemaining < 1) return remainingAmount;
    
    return remainingAmount / monthsRemaining;
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setIcon('💰');
  };

  const resetAddSavingForm = () => {
    setSelectedGoalId(null);
    setAddAmount('');
  };

  const openForCreate = () => {
    resetForm();
    // Set default date to tomorrow when creating new goal
    setTargetDate(getDefaultTargetDate());
    setIsDialogOpen(true);
  };

  const openForEdit = (goal: SavingsGoal) => {
    setEditingId(goal._id);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    
    // Format date for input field (YYYY-MM-DD)
    const date = new Date(goal.targetDate);
    const formattedDate = date.toISOString().split('T')[0];
    setTargetDate(formattedDate);
    
    setIcon(goal.icon || '💰');
    setIsDialogOpen(true);
  };

  const openAddSavingDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    setAddAmount('');
    setIsAddSavingOpen(true);
  };

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Mutation for adding savings
  const addSavingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGoalId || !addAmount) {
        throw new Error('Please enter a valid amount');
      }

      const amount = parseFloat(addAmount);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid positive amount');
      }

      return api.patch<SavingsGoal>(`/savings-goals/${selectedGoalId}/add`, { amount });
    },
    onSuccess: async (updatedGoal) => {
      console.log('Add savings successful:', updatedGoal);
      setIsAddSavingOpen(false);
      resetAddSavingForm();
      
      // Update cache immediately
      queryClient.setQueryData<SavingsGoal[]>(['savings-goals'], (old) => {
        if (!old) return [updatedGoal];
        return old.map(goal => 
          goal._id === selectedGoalId ? updatedGoal : goal
        );
      });
      
      showFeedback('success', `Successfully added ${formatCurrency(parseFloat(addAmount))} to your goal!`);
    },
    onError: (error: Error) => {
      console.error('Add savings error:', error);
      showFeedback('error', error.message || 'Failed to add savings. Please try again.');
    },
  });

  // Mutation for creating/updating goals
  const upsertMutation = useMutation({
    mutationFn: async () => {
      const target = parseFloat(targetAmount);
      const current = parseFloat(currentAmount || '0');
      
      // Validation
      if (!name || name.trim() === '') {
        throw new Error('Goal name is required');
      }
      
      if (Number.isNaN(target) || target <= 0) {
        throw new Error('Please enter a valid target amount greater than 0');
      }
      
      if (!targetDate) {
        throw new Error('Target date is required');
      }

      // Validate date is in the future
      const selectedDate = new Date(targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error('Target date must be in the future');
      }

      const body = {
        name: name.trim(),
        targetAmount: target,
        currentAmount: Number.isNaN(current) ? 0 : current,
        targetDate: targetDate,
        icon: icon || '💰',
      };

      console.log('Saving goal data:', body);

      if (editingId) {
        return api.put<SavingsGoal>(`/savings-goals/${editingId}`, body);
      }
      return api.post<SavingsGoal>('/savings-goals', body);
    },
    onSuccess: async (savedGoal) => {
      console.log('Save goal successful:', savedGoal);
      setIsDialogOpen(false);
      resetForm();
      await invalidateAll();
      showFeedback('success', editingId ? 'Goal updated successfully!' : 'Goal created successfully!');
    },
    onError: (error: Error) => {
      console.error('Save goal error:', error);
      showFeedback('error', error.message || 'Failed to save goal. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.del(`/savings-goals/${id}`),
    onSuccess: async () => {
      await invalidateAll();
      showFeedback('success', 'Goal deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      showFeedback('error', 'Failed to delete goal. Please try again.');
    },
  });

  return (
    <Layout title="Savings Goals" subtitle="Track your progress toward financial goals">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Feedback Alert */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg px-6 py-4 shadow-lg ${
              feedback.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {error && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700">Error loading goals: {error.message}</p>
              </div>
            )}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={openForCreate}
              >
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? 'Update your savings goal details.'
                    : 'Create a new savings goal to track your progress.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. New Laptop, Vacation Fund"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ($) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 2000"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Currently Saved ($)</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="e.g. 500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value || '💰')}
                    maxLength={2}
                    placeholder="💰"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={upsertMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => upsertMutation.mutate()}
                  disabled={upsertMutation.isPending || !name.trim() || !targetAmount || !targetDate}
                  className="gap-2"
                >
                  {upsertMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : editingId ? (
                    'Update Goal'
                  ) : (
                    'Create Goal'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-6 text-white shadow-card"
          >
            <p className="text-sm font-medium text-white/80">Total Saved</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(totalSaved)}</p>
            <p className="mt-2 text-sm text-white/80">Across all goals</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
            <p className="font-display text-3xl font-bold text-foreground">{formatCurrency(totalTarget)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Total across goals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
            <p className="font-display text-3xl font-bold text-foreground">{overallProgress.toFixed(1)}%</p>
            <Progress value={overallProgress} className="mt-3 h-2" />
          </motion.div>
        </div>

        {/* Add Saving Dialog */}
        <Dialog open={isAddSavingOpen} onOpenChange={setIsAddSavingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Savings</DialogTitle>
              <DialogDescription>
                Add money to your savings goal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="addAmount">Amount to Add ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="addAmount"
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                    min="0.01"
                    step="0.01"
                    disabled={addSavingMutation.isPending}
                    autoFocus
                  />
                </div>
                {selectedGoalId && (
                  <p className="text-sm text-muted-foreground">
                    Adding to: <span className="font-medium">"{savingsGoals.find(g => g._id === selectedGoalId)?.name}"</span>
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddSavingOpen(false)}
                disabled={addSavingMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => addSavingMutation.mutate()}
                disabled={addSavingMutation.isPending || !addAmount || parseFloat(addAmount) <= 0}
                className="gap-2"
              >
                {addSavingMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Savings
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
            <span className="ml-3 text-muted-foreground">Loading goals...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold text-foreground">Error Loading Goals</h3>
            <p className="mb-6 text-muted-foreground">{error.message}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['savings-goals'] })}>
              Retry
            </Button>
          </div>
        ) : savingsGoals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-12 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <Target className="h-10 w-10 text-accent" />
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold text-foreground">No Savings Goals Yet</h3>
            <p className="mb-6 text-muted-foreground">Start by creating your first savings goal</p>
            <Button onClick={openForCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Goal
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savingsGoals.map((goal, index) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const monthlyNeeded = getMonthlySaving(goal);
              const daysLeft = getDaysLeft(goal.targetDate);
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`group rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover ${
                    isCompleted ? 'border-2 border-green-200' : ''
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{goal.icon || '💰'}</span>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {goal.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getTimeRemaining(goal.targetDate)}
                          {isCompleted && ' ✓ Completed'}
                        </p>
                      </div>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isCompleted ? 'bg-green-100 text-green-800' : 'bg-accent/10 text-accent'
                    }`}>
                      {isCompleted ? 'Completed' : `${progress.toFixed(1)}%`}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Progress 
                      value={progress} 
                      className={`h-3 ${isCompleted ? '[&>div]:bg-green-500' : ''}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="font-semibold text-foreground">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="font-semibold text-foreground">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-muted/50 p-3">
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Days left</span>
                        </div>
                        <span className="font-semibold text-foreground">{daysLeft}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {isCompleted ? 'Goal achieved!' : 'Monthly needed'}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {isCompleted ? '🎉' : formatCurrency(monthlyNeeded)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Button
                      variant={isCompleted ? "outline" : "outline"}
                      className={`flex-1 ${isCompleted ? 'border-green-200 text-green-700 hover:bg-green-50' : ''}`}
                      onClick={() => openAddSavingDialog(goal._id)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? 'Goal Completed' : 'Add Savings'}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openForEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`)) {
                            deleteMutation.mutate(goal._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Add New Goal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex min-h-[280px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 transition-colors hover:border-accent hover:bg-muted/40"
              onClick={openForCreate}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <Plus className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">Create New Goal</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set a new savings target
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Savings;