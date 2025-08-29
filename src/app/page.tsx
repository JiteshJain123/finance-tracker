// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyExpenseChart } from '@/components/MonthlyExpenseChart';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TotalMonthlyExpenses } from '@/components/TotalMonthlyExpenses';
import { RecentTransactions } from '@/components/RecentTransactions';
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { BudgetForm } from '@/components/BudgetForm';
import { BudgetComparisonChart } from '@/components/BudgetComparisonChart';
import { SpendingInsights } from '@/components/SpendingInsights';
import { BudgetList } from '@/components/BudgetList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Example fetcher - replace with your API call / db query
async function getAllTransactions(): Promise<Transaction[]> {
  const res = await fetch('/api/transactions'); // <- adjust to your API
  return res.json();
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
  category?: { name: string } | null;
}

interface Budget {
  id: string;
  amount: number;
  month: string;
  categoryId: string;
  category: { name: string } | null;
}

export default function Home() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;

  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // 🔄 Load available months dynamically from transactions
  useEffect(() => {
    async function fetchMonths() {
      try {
        const transactions = await getAllTransactions();
        const months = Array.from(
          new Set(transactions.map((t) => t.date.slice(0, 7)))
        ).sort((a, b) => (a < b ? 1 : -1)); // newest first
        setAvailableMonths(months);

        // Ensure currentMonth is always valid
        if (!months.includes(currentMonth)) {
          setSelectedMonth(months[0] || currentMonth);
        }
      } catch (err) {
        console.error('Error loading months:', err);
        setAvailableMonths([currentMonth]);
      }
    }

    fetchMonths();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    setEditingTransaction(null);
    setEditingBudget(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditingBudget(null);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditingBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setEditingTransaction(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6 lg:p-10">
      <div className="container mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-lg animate-fade-in">
            FinSight Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Track your finances, visualize spending, and plan smarter
          </p>
        </header>

        {/* Main Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-10 relative z-10">
            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-visible">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-indigo-700 flex items-center gap-2">
                  {editingTransaction ? '✏️ Edit Transaction' : '➕ Add New Transaction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddTransactionForm
                  transaction={editingTransaction}
                  onSave={handleRefresh}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-indigo-700">
                  📊 Monthly Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyExpenseChart key={refreshKey} />
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-indigo-700">
                  🥧 Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart key={refreshKey} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-10 relative z-20">
            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-indigo-700 mb-3">
                  📅 Summary for
                </CardTitle>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-60">
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {new Date(`${month}-01`).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-6">
                <TotalMonthlyExpenses key={refreshKey} selectedMonth={selectedMonth} />
                <RecentTransactions key={refreshKey} selectedMonth={selectedMonth} />
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-visible">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-indigo-700">
                  {editingBudget ? '✏️ Edit Budget' : '💰 Set Budget'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetForm
                  onSave={handleRefresh}
                  budget={editingBudget}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>
          </aside>
        </section>

        {/* Secondary Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-indigo-700">
                📈 Budget vs. Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetComparisonChart key={refreshKey} />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-indigo-700">
                🔍 Spending Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingInsights key={refreshKey} selectedMonth={selectedMonth} />
            </CardContent>
          </Card>
        </section>

        {/* Transactions + Budgets */}
        <Card className="mb-10 backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-indigo-700">
              📑 All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList
              onEdit={handleEditTransaction}
              onTransactionDeleted={handleRefresh}
              key={refreshKey}
            />
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-indigo-700">
              📌 All Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetList
              onEdit={handleEditBudget}
              onBudgetDeleted={handleRefresh}
              key={refreshKey}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
