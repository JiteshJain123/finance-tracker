// src/components/MonthlyExpenseChart.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  month: string;
  expenses: number;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export function MonthlyExpenseChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions');
        const transactions: Transaction[] = await res.json();

        const monthlyData: { [key: string]: { month: string; expenses: number } } = {};
        transactions.forEach(t => {
          const date = new Date(t.date);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const key = `${month} ${year}`;

          if (!monthlyData[key]) {
            monthlyData[key] = { month: `${month} ${year}`, expenses: 0 };
          }
          monthlyData[key].expenses += t.amount;
        });

        const chartData = Object.values(monthlyData);
        setData(chartData);
      } catch (error) {
        console.error('Failed to fetch data for chart', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (data.length === 0) return <div>No expenses to display.</div>;

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="expenses" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}