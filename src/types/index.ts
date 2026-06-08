export interface Wedding {
  id: string;
  userId: string;
  brideName: string;
  groomName: string;
  weddingDate: Date;
  venue?: string | null;
  city?: string | null;
  totalBudget: number;
  guestCount: number;
  theme?: string | null;
  style?: string | null;
}

export interface ChecklistItem {
  id: string;
  weddingId: string;
  title: string;
  description?: string | null;
  category: string;
  month: number;
  completed: boolean;
  dueDate?: Date | null;
  priority: string;
}

export interface BudgetItem {
  id: string;
  weddingId: string;
  category: string;
  title: string;
  estimatedCost: number;
  actualCost: number;
  paid: number;
  vendor?: string | null;
  notes?: string | null;
  installments?: BudgetInstallment[];
}

export interface BudgetInstallment {
  id: string;
  budgetItemId: string;
  amount: number;
  dueDate: Date;
  paid: boolean;
  paidDate?: Date | null;
  notes?: string | null;
}

export interface Guest {
  id: string;
  weddingId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  side: string;
  status: string;
  plusOne: boolean;
  plusOneName?: string | null;
  dietary?: string | null;
  tableId?: string | null;
  notes?: string | null;
  inviteSent: boolean;
}

export interface Table {
  id: string;
  weddingId: string;
  name: string;
  capacity: number;
  shape: string;
  notes?: string | null;
  guests?: Guest[];
}

export interface Vendor {
  id: string;
  weddingId: string;
  category: string;
  name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  price?: number | null;
  status: string;
  rating?: number | null;
  notes?: string | null;
}

export interface TimelineItem {
  id: string;
  weddingId: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  responsible?: string | null;
  category: string;
  order: number;
}

export interface Gift {
  id: string;
  weddingId: string;
  name: string;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  imageUrl?: string | null;
  storeUrl?: string | null;
  storeName?: string | null;
  reserved: boolean;
  reservedBy?: string | null;
  received: boolean;
  priority: string;
  quantity: number;
}

export interface Inspiration {
  id: string;
  weddingId: string;
  title: string;
  imageUrl: string;
  category: string;
  notes?: string | null;
  tags: string[];
  favorite: boolean;
  sourceUrl?: string | null;
}

export interface TrousseauItem {
  id: string;
  weddingId: string;
  name: string;
  category: string;
  quantity: number;
  acquired: boolean;
  brand?: string | null;
  price?: number | null;
  notes?: string | null;
  priority: string;
}
