// Core invoice data types
export interface LineItem {
  id: string;
  type: 'item' | 'heading';
  description: string;
  quantity: number;
  unit: string;
  rate: number;
}

export interface InvoiceData {
  // Document metadata
  id?: string;
  docType: 'invoice' | 'proforma' | 'proposal' | 'receipt';
  
  // Business info
  business: {
    name: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    state: string;
    pin: string;
    gstin: string;
    pan: string;
    logoUrl: string | null;
  };
  
  // Client info
  client: {
    name: string;
    email: string;
    address: string;
    gstin: string;
    poNumber: string;
    state: string;
  };
  
  // Document details
  document: {
    number: string;
    date: string;
    dueDate: string;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  };
  
  // Line items
  items: LineItem[];
  
  // Tax & discount
  tax: {
    gstEnabled: boolean;
    gstType: 'intra' | 'inter';
    gstRate: 0 | 5 | 12 | 18 | 28;
    discountEnabled: boolean;
    discountType: 'percent' | 'fixed';
    discountValue: number;
  };
  
  // Payment info
  payment: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
  
  // Additional fields
  notes: string;
  terms: string;
  
  // Styling
  style: {
    template: string;
    brandColor: string;
    fontFamily: string;
    fontSize: 'sm' | 'md' | 'lg';
    spacing: 'compact' | 'normal' | 'airy';
  };
  
  profession: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Stored invoice (with user association)
export interface StoredInvoice {
  id: string;
  user_id: string;
  invoice_json: InvoiceData;
  created_at: string;
  updated_at: string;
}

// Company profile
export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  gstin: string;
  pan: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Saved template
export interface SavedTemplate {
  id: string;
  user_id: string;
  template_name: string;
  settings_json: Partial<InvoiceData>;
  created_at: string;
  updated_at: string;
}

// Shared invoice link
export interface SharedInvoice {
  id: string;
  user_id: string;
  invoice_id: string;
  token: string;
  expires_at: string | null;
  created_at: string;
}

// User with subscription info
export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

// Subscription tier
export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro';
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}
