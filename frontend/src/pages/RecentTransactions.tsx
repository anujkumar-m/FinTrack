import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TransactionList from '@/components/dashboard/TransactionList';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Calendar, Download } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';

const RecentTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [timeRange, setTimeRange] = useState<'month' | 'week' | 'year'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [filter, timeRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      
      // Calculate date range based on timeRange
      const today = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', today.toISOString().split('T')[0]);

      const response = await fetch(`http://localhost:5000/api/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Mode'],
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.category,
        t.type,
        t.amount,
        t.paymentMode || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recent Transactions</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your financial activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="rounded-xl bg-card p-4 shadow">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-income">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-expense">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow">
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p className={cn(
            "text-2xl font-bold",
            totalIncome - totalExpenses >= 0 ? "text-income" : "text-expense"
          )}>
            ${(totalIncome - totalExpenses).toFixed(2)}
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex bg-muted rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                    timeRange === range
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                filter === 'all'
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('expense')}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                filter === 'expense'
                  ? "bg-background text-expense shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilter('income')}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                filter === 'income'
                  ? "bg-background text-income shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Income
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transaction List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-2 text-muted-foreground">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length > 0 ? (
        <TransactionList 
          transactions={filteredTransactions}
          title={`Transactions (${filteredTransactions.length})`}
          showViewAll={false}
        />
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No transactions found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? 'Try a different search term' : 'Start by adding your first transaction'}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsPage;