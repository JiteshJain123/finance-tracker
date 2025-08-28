"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id?: string;
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
}

const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number"
  }),
  description: z.string().min(1, "Description is required."),
  date: z.string().min(1, "Date is required."),
  categoryId: z.string().min(1, "Category is required."),
});

type FormData = z.infer<typeof transactionSchema>;

interface AddTransactionFormProps {
  onSave: () => void;
  transaction?: Transaction | null;
  onCancel?: () => void;
}

export function AddTransactionForm({
  onSave,
  transaction,
  onCancel,
}: AddTransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      description: "",
      date: "",
      categoryId: "",
    },
  });

  // Debug: Watch the categoryId value
  const watchedCategoryId = watch("categoryId");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setApiError("");
        
        console.log('Fetching categories from /api/categories'); // Debug log
        
        const res = await fetch('/api/categories');
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data: Category[] = await res.json();
        console.log('Categories fetched:', data); // Debug log
        
        setCategories(data);
        
        // If no categories, add some fallback ones for testing
        if (data.length === 0) {
          console.warn('No categories found, using fallback');
          setCategories([
            { id: 'fallback-1', name: 'General' },
            { id: 'fallback-2', name: 'Food' },
            { id: 'fallback-3', name: 'Transport' }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setApiError(error instanceof Error ? error.message : 'Unknown error');
        
        // Set fallback categories for testing
        setCategories([
          { id: 'fallback-1', name: 'General' },
          { id: 'fallback-2', name: 'Food' },
          { id: 'fallback-3', name: 'Transport' }
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log('Categories state:', categories); // Debug log
    console.log('Loading state:', isLoadingCategories); // Debug log
    console.log('Current categoryId:', watchedCategoryId); // Debug log
  }, [categories, isLoadingCategories, watchedCategoryId]);

  useEffect(() => {
    if (transaction) {
      const formattedDate = new Date(transaction.date)
        .toISOString()
        .split("T")[0];
      reset({
        id: transaction.id || "",
        amount: String(transaction.amount || ""),
        description: transaction.description || "",
        date: formattedDate,
        categoryId: transaction.categoryId || "",
      });
    } else {
      reset({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
      });
    }
  }, [transaction, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      console.log('Submitting form data:', data); // Debug log
      
      const isEditing = !!transaction;
      const url = isEditing
        ? `/api/transactions/${transaction?.id}`
        : "/api/transactions";
      const method = isEditing ? "PUT" : "POST";

      const submitData = {
        ...data,
        amount: Number(data.amount),
      };

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditing ? "update" : "save"} transaction`
        );
      }

      console.log("Transaction saved successfully!", submitData);
      onSave();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input 
            id="amount" 
            type="number" 
            step="0.01" 
            {...register('amount')} 
          />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register('description')} />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            type="date" 
            {...register('date')}
            readOnly={!!transaction}
            className={!!transaction ? "bg-gray-200 cursor-not-allowed" : ""}
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  console.log('Category selected:', value); // Debug log
                  field.onChange(value);
                }}
                value={field.value}
                disabled={isLoadingCategories}
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
        
        <div className="flex space-x-2">
          <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
            {isSubmitting ? 'Saving...' : (transaction ? 'Update Transaction' : 'Save Transaction')}
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