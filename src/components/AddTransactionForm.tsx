"use client";

import { useForm, SubmitHandler } from "react-hook-form";
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
// Define the Zod schema for validation.
const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive."),
  description: z.string().min(1, "Description is required."),
  date: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format."),
    categoryId: z.string().optional(),
});

// Infer the TypeScript type for the final, validated form data.
type TransactionFormValues = z.infer<typeof transactionSchema>;

// Define a separate type for the raw string inputs from the form.

// Define the props interface for the component.
interface AddTransactionFormProps {
  onSave: () => void;
  transaction?: TransactionFormValues | null;
  onCancel?: () => void;
}

export function AddTransactionForm({
  onSave,
  transaction,
  onCancel,
}: AddTransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<
    z.input<typeof transactionSchema>, // input type
    unknown,
    z.output<typeof transactionSchema> // output type
  >({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "", // as a string (input)
      description: "",
      date: "",
      id: undefined,
    },
  });

   useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (transaction) {
      const formattedDate = new Date(transaction.date)
        .toISOString()
        .split("T")[0];
      reset({
        ...transaction,
        amount: transaction.amount.toString(),
        date: formattedDate,
      });
       if (transaction.categoryId) {
        setValue('categoryId', transaction.categoryId);
      }
    } else {
      reset({
        amount: "",
        description: "",
        date: "",
        categoryId: '',
      });
    }
  }, [transaction, reset, setValue]);

  const onSubmit: SubmitHandler<TransactionFormValues> = async (data) => {
    try {
      const isEditing = !!transaction;
      const url = isEditing
        ? `/api/transactions/${transaction?.id}`
        : "/api/transactions";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditing ? "update" : "save"} transaction`
        );
      }

      console.log("Transaction saved successfully!", data);
      onSave();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register('amount')} />
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
        <Select
          onValueChange={(value) => setValue('categoryId', value)}
          defaultValue={transaction?.categoryId}
        >
          <SelectTrigger className="w-full" id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={isSubmitting}>
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
