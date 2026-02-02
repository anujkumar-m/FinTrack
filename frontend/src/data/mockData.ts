import { Transaction, Category, Bill, EMI, SavingsGoal, BorrowLend, CreditCard, MonthlyStats } from '@/types/finance';

export const categories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: '🍔', color: 'hsl(30, 100%, 50%)', type: 'expense' },
  { id: '2', name: 'Transportation', icon: '🚗', color: 'hsl(200, 100%, 50%)', type: 'expense' },
  { id: '3', name: 'Shopping', icon: '🛍️', color: 'hsl(340, 100%, 50%)', type: 'expense' },
  { id: '4', name: 'Bills & Utilities', icon: '💡', color: 'hsl(45, 100%, 50%)', type: 'expense' },
  { id: '5', name: 'Entertainment', icon: '🎬', color: 'hsl(280, 100%, 50%)', type: 'expense' },
  { id: '6', name: 'Health', icon: '🏥', color: 'hsl(0, 100%, 50%)', type: 'expense' },
  { id: '7', name: 'Salary', icon: '💰', color: 'hsl(160, 84%, 39%)', type: 'income' },
  { id: '8', name: 'Freelance', icon: '💻', color: 'hsl(199, 89%, 48%)', type: 'income' },
  { id: '9', name: 'Investments', icon: '📈', color: 'hsl(270, 100%, 60%)', type: 'income' },
  { id: '10', name: 'Rent', icon: '🏠', color: 'hsl(15, 100%, 50%)', type: 'expense' },
];

export const transactions: Transaction[] = [
  { id: '1', type: 'expense', amount: 45.50, description: 'Grocery shopping', category: 'Food & Dining', date: '2025-01-10', paymentMode: 'upi' },
  { id: '2', type: 'expense', amount: 120.00, description: 'Uber rides', category: 'Transportation', date: '2025-01-09', paymentMode: 'credit_card' },
  { id: '3', type: 'income', amount: 5000.00, description: 'Monthly salary', category: 'Salary', date: '2025-01-01', paymentMode: 'bank' },
  { id: '4', type: 'expense', amount: 299.99, description: 'New headphones', category: 'Shopping', date: '2025-01-08', paymentMode: 'credit_card' },
  { id: '5', type: 'expense', amount: 85.00, description: 'Electric bill', category: 'Bills & Utilities', date: '2025-01-05', paymentMode: 'bank' },
  { id: '6', type: 'income', amount: 750.00, description: 'Freelance project', category: 'Freelance', date: '2025-01-07', paymentMode: 'bank' },
  { id: '7', type: 'expense', amount: 32.00, description: 'Netflix & Spotify', category: 'Entertainment', date: '2025-01-04', paymentMode: 'credit_card' },
  { id: '8', type: 'expense', amount: 1200.00, description: 'Monthly rent', category: 'Rent', date: '2025-01-03', paymentMode: 'bank' },
  { id: '9', type: 'expense', amount: 65.00, description: 'Dinner with friends', category: 'Food & Dining', date: '2025-01-11', paymentMode: 'cash' },
  { id: '10', type: 'income', amount: 200.00, description: 'Dividend payment', category: 'Investments', date: '2025-01-10', paymentMode: 'bank' },
];

export const bills: Bill[] = [
  { id: '1', name: 'Electricity Bill', amount: 85.00, category: 'Bills & Utilities', dueDate: '2025-01-15', isPaid: false, isRecurring: true },
  { id: '2', name: 'Internet', amount: 59.99, category: 'Bills & Utilities', dueDate: '2025-01-18', isPaid: false, isRecurring: true },
  { id: '3', name: 'Insurance Premium', amount: 150.00, category: 'Bills & Utilities', dueDate: '2025-01-20', isPaid: true, isRecurring: true },
  { id: '4', name: 'Phone Bill', amount: 45.00, category: 'Bills & Utilities', dueDate: '2025-01-22', isPaid: false, isRecurring: true },
];

export const emis: EMI[] = [
  { id: '1', name: 'Car Loan', amount: 450.00, startDate: '2024-01-01', endDate: '2027-01-01', isPaid: false },
  { id: '2', name: 'Personal Loan', amount: 200.00, startDate: '2024-06-01', endDate: '2025-06-01', isPaid: false },
];

export const savingsGoals: SavingsGoal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6500, targetDate: '2025-12-31', icon: '🛡️' },
  { id: '2', name: 'Vacation', targetAmount: 3000, currentAmount: 1200, targetDate: '2025-06-30', icon: '✈️' },
  { id: '3', name: 'New Laptop', targetAmount: 2000, currentAmount: 800, targetDate: '2025-04-30', icon: '💻' },
];

export const borrowLendEntries: BorrowLend[] = [
  { id: '1', type: 'lent', personName: 'John Doe', amount: 500, purpose: 'Emergency loan', date: '2025-01-05', status: 'pending' },
  { id: '2', type: 'borrowed', personName: 'Jane Smith', amount: 200, purpose: 'Dinner split', date: '2025-01-08', status: 'pending' },
];

export const creditCards: CreditCard[] = [
  { id: '1', name: 'Chase Sapphire', lastFourDigits: '4521', billAmount: 1250.00, dueDate: '2025-01-25', isPaid: false },
  { id: '2', name: 'Amex Gold', lastFourDigits: '8734', billAmount: 680.00, dueDate: '2025-01-28', isPaid: false },
];

export const monthlyStats: MonthlyStats[] = [
  { month: 'Aug 2024', totalIncome: 5500, totalExpenses: 3200, balance: 2300, savings: 800 },
  { month: 'Sep 2024', totalIncome: 5750, totalExpenses: 3500, balance: 2250, savings: 900 },
  { month: 'Oct 2024', totalIncome: 6000, totalExpenses: 3800, balance: 2200, savings: 850 },
  { month: 'Nov 2024', totalIncome: 5800, totalExpenses: 4100, balance: 1700, savings: 700 },
  { month: 'Dec 2024', totalIncome: 7200, totalExpenses: 5500, balance: 1700, savings: 600 },
  { month: 'Jan 2025', totalIncome: 5950, totalExpenses: 1847, balance: 4103, savings: 1000 },
];

export const categoryExpenses = [
  { name: 'Food & Dining', value: 110.50, color: 'hsl(30, 100%, 50%)' },
  { name: 'Transportation', value: 120.00, color: 'hsl(200, 100%, 50%)' },
  { name: 'Shopping', value: 299.99, color: 'hsl(340, 100%, 50%)' },
  { name: 'Bills & Utilities', value: 85.00, color: 'hsl(45, 100%, 50%)' },
  { name: 'Entertainment', value: 32.00, color: 'hsl(280, 100%, 50%)' },
  { name: 'Rent', value: 1200.00, color: 'hsl(15, 100%, 50%)' },
];
