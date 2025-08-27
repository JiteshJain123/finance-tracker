// src/components/BudgetComparisonChart.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface BudgetData {
  categoryMonthKey: string;
  category: string;
  monthYear: string;
  budget: number;
  actual: number;
}

interface Budget {
  amount: number;
  month: string;
  category: { name: string };
  categoryId: string;
}

interface Transaction {
  amount: number;
  date: string;
  categoryId: string;
}
interface MyComponentProps {
  data: string[];
}
interface CustomTooltipProps {
  active?: boolean;
   payload?: {
    name: string;
    value: number;
    payload: BudgetData;
  }[];
  label?: string;
}
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-white/90 p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-lg">{dataPoint.category}</p>
        <p className="text-sm text-gray-500">{dataPoint.monthYear}</p>
        <p className="mt-2 text-blue-500">
          Budget: ${dataPoint.budget.toFixed(2)}
        </p>
        <p className="text-green-500">
          Actual: ${dataPoint.actual.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};


export function BudgetComparisonChart() {
  const [data, setData] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, transactionsRes] = await Promise.all([
          fetch('/api/budgets'),
          fetch('/api/transactions'),
        ]);
        
        const budgets: Budget[] = await budgetsRes.json();
        const transactions: Transaction[] = await transactionsRes.json();

        if (!Array.isArray(budgets) || !Array.isArray(transactions)) {
          setData([]);
          return;
        }

        const combinedData: { [key: string]: BudgetData } = {};

        budgets.forEach(b => {
          const monthYear = new Date(b.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const key = `${b.categoryId}-${monthYear}`;
          combinedData[key] = {
            categoryMonthKey: key,
            category: b.category.name,
            monthYear: monthYear,
            budget: b.amount,
            actual: 0,
          };
        });

        transactions.forEach(t => {
          const monthYear = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const key = `${t.categoryId}-${monthYear}`;
          if (combinedData[key]) {
            combinedData[key].actual += t.amount;
          }
        });

        const chartData = Object.values(combinedData).sort((a, b) => {
          const dateA = new Date(a.monthYear.replace(' ', ' 1, '));
          const dateB = new Date(b.monthYear.replace(' ', ' 1, '));
          
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
          return a.category.localeCompare(b.category);
        });

        setData(chartData);
      } catch (error) {
        console.error('Failed to fetch data for budget comparison chart', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (data.length === 0) return <div>No budget data to display.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="budget" fill="#8884d8" />
        <Bar dataKey="actual" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}