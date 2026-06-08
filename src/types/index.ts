export interface Wedding {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue?: string;
  city?: string;
  totalBudget: number;
  theme?: string;
  style?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  month: number;
  completed: boolean;
  priority: string;
  dueDate?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  title: string;
  estimatedCost: number;
  actualCost: number;
  paid: number;
  vendor?: string;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  side: string;
  status: string;
  plusOne: boolean;
  plusOneName?: string;
  dietary?: string;
  tableId?: string;
  table?: { name: string } | null;
}

export interface Vendor {
  id: string;
  category: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  price?: number;
  status: string;
  rating?: number;
  notes?: string;
}
