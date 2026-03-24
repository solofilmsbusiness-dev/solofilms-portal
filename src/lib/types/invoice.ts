export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  notes: string | null;
  status: InvoiceStatus;
  due_date: string | null;
  total_amount: number;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithItems extends Invoice {
  invoice_line_items: InvoiceLineItem[];
  profiles?: { full_name: string | null; company_name: string | null; email?: string };
  projects?: { title: string } | null;
}
