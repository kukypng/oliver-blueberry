// Tipos unificados para o sistema de orçamentos
// Este arquivo centraliza todos os tipos para evitar duplicação e inconsistências

export interface Budget {
  id: string;
  client_name?: string;
  client_phone?: string;
  device_model?: string;
  device_type?: string;
  issue?: string;
  total_price?: number;
  cash_price?: number;
  installment_price?: number;
  part_quality?: string;
  part_type?: string;
  workflow_status?: string;
  status?: string;
  is_paid?: boolean;
  is_delivered?: boolean;
  expires_at?: string;
  approved_at?: string;
  payment_confirmed_at?: string;
  delivery_confirmed_at?: string;
  created_at: string;
  updated_at?: string;
  installments?: number;
  warranty_months?: number;
  includes_delivery?: boolean;
  includes_screen_protector?: boolean;
  valid_until?: string;
  brand?: string;
  owner_id?: string;
  client_id?: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  delivery_date?: string;
  notes?: string;
}

export interface BudgetStats {
  totalBudgets: number;
  deletedBudgets: number;
  pendingBudgets: number;
  approvedBudgets: number;
  completedBudgets: number;
  totalValue: number;
}

export interface SearchFilters {
  status: string;
  priceRange: { min: number; max: number } | null;
  client: string;
  dateRange: { start: string; end: string } | null;
  deviceType: string;
  partType: string;
  paymentStatus: string;
  deliveryStatus: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilters & { searchTerm: string };
  createdAt: string;
  isFavorite: boolean;
}

export interface BudgetActionCallbacks {
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => Promise<boolean> | boolean;
  onBudgetUpdate: (budgetId: string, updates: Partial<Budget>) => void;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  is_active: boolean;
  expiration_date: string;
  advanced_features_enabled: boolean;
  budget_limit: number;
  budget_warning_enabled: boolean;
  budget_warning_days: number;
  created_at: string;
  updated_at: string;
  username?: string;
}

export interface ShopProfile {
  id: string;
  user_id: string;
  shop_name: string;
  address: string;
  contact_phone: string;
  cnpj?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para componentes específicos
export interface BudgetCardProps {
  budget: Budget;
  profile: UserProfile;
  isUpdating?: boolean;
  index?: number;
}

export interface BudgetListProps {
  budgets: Budget[];
  profile: UserProfile;
  updating?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => Promise<void>;
  onRetryError?: () => void;
}

export interface BudgetSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  resultCount: number;
  isSearching?: boolean;
}

export interface BudgetFiltersProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isAdvancedEnabled?: boolean;
}