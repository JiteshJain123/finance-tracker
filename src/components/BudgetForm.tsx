// src/components/BudgetForm.tsx
'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

const budgetSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required.'),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number"
  }),
  month: z.string().min(1, 'Month is required.'),
});

type FormData = z.infer<typeof budgetSchema>;

interface Budget {
  id?: string;
  categoryId: string;
  amount: number;
  month: string;
}

interface BudgetFormProps {
  onSave: () => void;
  budget?: Budget | null;
  onCancel?: () => void;
}

export function BudgetForm({ onSave, budget, onCancel }: BudgetFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [apiError, setApiError] = useState<string>("");

  // Fallback categories (same as your seed data)
  const fallbackCategories: Category[] = [
    { id: 'food-groceries', name: 'Food & Groceries' },
    { id: 'housing-rent', name: 'Housing & Rent' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'personal-care', name: 'Personal Care' },
    { id: 'education', name: 'Education' },
    { id: 'travel', name: 'Travel' },
    { id: 'debt-payments', name: 'Debt Payments' },
    { id: 'savings', name: 'Savings' },
    { id: 'investments', name: 'Investments' },
    { id: 'gifts-donations', name: 'Gifts & Donations' },
    { id: 'miscellaneous', name: 'Miscellaneous' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: "",
      month: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setApiError("");
        
        const res = await fetch('/api/categories');
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data: Category[] = await res.json();
        setCategories(data);
        
        // If no categories from API, use fallback categories
        if (data.length === 0) {
          console.warn('No categories found from API, using fallback categories');
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setApiError(error instanceof Error ? error.message : 'Unknown error');
        
        // Use fallback categories when API fails
        console.log('Using fallback categories due to API error');
        setCategories(fallbackCategories);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    if (budget) {
      const formattedMonth = new Date(budget.month).toISOString().slice(0, 7);
      reset({
        id: budget.id || "",
        amount: budget.amount.toString(),
        month: formattedMonth,
        categoryId: budget.categoryId,
      });
    } else {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      reset({
        amount: "",
        month: currentMonth,
        categoryId: "",
      });
    }
  }, [budget, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const isEditing = !!budget;
      const url = isEditing ? `/api/budgets/${budget?.id}` : '/api/budgets';
      const method = isEditing ? 'PUT' : 'POST';

      // Convert amount to number for API
      const submitData = {
        ...data,
        amount: Number(data.amount),
      };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to save budget');
      }

      onSave();
      reset();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoadingCategories || !!budget}
            >
              <SelectTrigger className="w-full" id="category">
                <SelectValue 
                  placeholder={
                    isLoadingCategories 
                      ? "Loading categories..." 
                      : categories.length === 0 
                      ? "No categories available"
                      : "Select a category"
                  } 
                />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white border shadow-lg">
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Budget Amount</Label>
        <Input 
          id="amount" 
          type="number" 
          step="0.01" 
          {...register('amount')} 
        />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="month">Month</Label>
        <Input 
          id="month" 
          type="month" 
          {...register('month')} 
          disabled={!!budget}
          className={!!budget ? "bg-gray-200 cursor-not-allowed" : ""}
        />
        {errors.month && <p className="text-red-500 text-sm">{errors.month.message}</p>}
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
          {isSubmitting ? 'Saving...' : (budget ? 'Update Budget' : 'Set Budget')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}