export type AccountStatus = 'active' | 'blocked' | 'expired';
export type MenuStatus = 'online' | 'offline';
export type PlanType = 'mensal' | 'trimestral' | 'anual' | 'avulso';
export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';
export type ExpenseCategory = 'Manutenção' | 'Melhoria' | 'Infraestrutura' | 'Outros';

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: AccountStatus;
  menu_visibility: MenuStatus;
  access_expires_at: string;
  created_at: string;
  last_activity_at?: string;
}

export interface Income {
  id: string;
  company_id: string;
  company_name?: string;
  amount: number;
  payment_date: string;
  plan: PlanType;
  payment_method: string;
  status: PaymentStatus;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  spent_at: string;
  category: ExpenseCategory;
  payment_method: string;
  status: PaymentStatus;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
}
