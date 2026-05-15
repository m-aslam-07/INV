import { create } from 'zustand';
import { PROFESSIONS } from '../utils/professions';
import { getDefaultTemplateKey } from '../components/invoice/templateRegistry';

export interface LineItem {
  id: string;
  type: 'item' | 'heading';
  description: string;
  quantity: number;
  unit: string;
  rate: number;
}

export interface InvoiceState {
  docType: 'invoice' | 'proforma' | 'proposal' | 'receipt';
  business: {
    name: string; email: string; phone: string;
    address1: string; city: string; state: string; pin: string;
    gstin: string; pan: string; logoUrl: string | null;
  };
  client: {
    name: string; email: string; address: string;
    gstin: string; poNumber: string; state: string;
  };
  document: {
    number: string; date: string; dueDate: string;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  };
  items: LineItem[];
  tax: {
    gstEnabled: boolean; gstType: 'intra' | 'inter';
    gstRate: 0 | 5 | 12 | 18 | 28;
    discountEnabled: boolean; discountType: 'percent' | 'fixed';
    discountValue: number;
  };
  payment: {
    bankName: string; accountHolder: string;
    accountNumber: string; ifsc: string; upiId: string;
  };
  notes: string;
  terms: string;
  style: {
    template: string;
    brandColor: string; fontFamily: string;
    fontSize: 'sm' | 'md' | 'lg';
    spacing: 'compact' | 'normal' | 'airy';
  };
  profession: string;
}

interface InvoiceActions {
  setDocType: (type: InvoiceState['docType']) => void;
  updateBusiness: (data: Partial<InvoiceState['business']>) => void;
  updateClient: (data: Partial<InvoiceState['client']>) => void;
  updateDocument: (data: Partial<InvoiceState['document']>) => void;
  setItems: (items: LineItem[]) => void;
  addItem: () => void;
  addHeading: () => void;
  updateItem: (id: string, data: Partial<LineItem>) => void;
  removeItem: (id: string) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  updateTax: (data: Partial<InvoiceState['tax']>) => void;
  updatePayment: (data: Partial<InvoiceState['payment']>) => void;
  setNotes: (notes: string) => void;
  setTerms: (terms: string) => void;
  updateStyle: (data: Partial<InvoiceState['style']>) => void;
  setProfession: (profession: string) => void;
  clearForm: () => void;
  loadState: (state: Partial<InvoiceState>) => void;
  getFullState: () => InvoiceState;
}

function today(addDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  return d.toISOString().split('T')[0];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getNextInvoiceNumber(): string {
  const last = localStorage.getItem('sk_last_inv');
  const num = last ? parseInt(last) + 1 : 1;
  localStorage.setItem('sk_last_inv', num.toString());
  return `INV-${num.toString().padStart(4, '0')}`;
}

function createDefaultState(): InvoiceState {
  return {
    docType: 'invoice',
    business: {
      name: '', email: '', phone: '',
      address1: '', city: '', state: '', pin: '',
      gstin: '', pan: '', logoUrl: null,
    },
    client: {
      name: '', email: '', address: '',
      gstin: '', poNumber: '', state: '',
    },
    document: {
      number: getNextInvoiceNumber(),
      date: today(),
      dueDate: today(15),
      currency: 'INR',
    },
    items: [],
    tax: {
      gstEnabled: false, gstType: 'intra', gstRate: 18,
      discountEnabled: false, discountType: 'percent', discountValue: 0,
    },
    payment: {
      bankName: '', accountHolder: '',
      accountNumber: '', ifsc: '', upiId: '',
    },
    notes: 'Thank you for your business!',
    terms: 'Payment due within 15 days of invoice date. Late payments attract 1.5% monthly interest.',
    style: {
      template: getDefaultTemplateKey(), brandColor: '#2563EB',
      fontFamily: 'Inter', fontSize: 'md', spacing: 'normal',
    },
    profession: 'developer',
  };
}

function loadSavedState(): InvoiceState {
  try {
    const saved = localStorage.getItem('sk_draft');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...createDefaultState(), ...parsed };
    }
  } catch {}
  return createDefaultState();
}

function saveState(state: InvoiceState) {
  try {
    localStorage.setItem('sk_draft', JSON.stringify(state));
  } catch {}
}

export const useInvoiceStore = create<InvoiceState & InvoiceActions>((set, get) => ({
  ...loadSavedState(),

  setDocType: (docType) => set((s) => {
    const newState = { ...s, docType };
    saveState(newState as InvoiceState);
    return { docType };
  }),

  updateBusiness: (data) => set((s) => {
    const business = { ...s.business, ...data };
    const newState = { ...s, business };
    saveState(newState as InvoiceState);
    return { business };
  }),

  updateClient: (data) => set((s) => {
    const client = { ...s.client, ...data };
    const newState = { ...s, client };
    saveState(newState as InvoiceState);
    return { client };
  }),

  updateDocument: (data) => set((s) => {
    const document = { ...s.document, ...data };
    const newState = { ...s, document };
    saveState(newState as InvoiceState);
    return { document };
  }),

  setItems: (items) => set((s) => {
    const newState = { ...s, items };
    saveState(newState as InvoiceState);
    return { items };
  }),

  addItem: () => set((s) => {
    const items = [...s.items, {
      id: generateId(),
      type: 'item' as const,
      description: '',
      quantity: 1,
      unit: 'unit',
      rate: 0,
    }];
    const newState = { ...s, items };
    saveState(newState as InvoiceState);
    return { items };
  }),

  addHeading: () => set((s) => {
    const items = [...s.items, {
      id: generateId(),
      type: 'heading' as const,
      description: '',
      quantity: 0,
      unit: '',
      rate: 0,
    }];
    const newState = { ...s, items };
    saveState(newState as InvoiceState);
    return { items };
  }),

  updateItem: (id, data) => set((s) => {
    const items = s.items.map(i => i.id === id ? { ...i, ...data } : i);
    const newState = { ...s, items };
    saveState(newState as InvoiceState);
    return { items };
  }),

  removeItem: (id) => set((s) => {
    const items = s.items.filter(i => i.id !== id);
    const newState = { ...s, items };
    saveState(newState as InvoiceState);
    return { items };
  }),

  reorderItems: (fromIndex, toIndex) => set((s) => {
    const items = [...s.items];
    const [removed] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, removed);
    const newState = { ...s, items };
    saveState(newState as InvoiceState);
    return { items };
  }),

  updateTax: (data) => set((s) => {
    const tax = { ...s.tax, ...data };
    const newState = { ...s, tax };
    saveState(newState as InvoiceState);
    return { tax };
  }),

  updatePayment: (data) => set((s) => {
    const payment = { ...s.payment, ...data };
    const newState = { ...s, payment };
    saveState(newState as InvoiceState);
    return { payment };
  }),

  setNotes: (notes) => set((s) => {
    const newState = { ...s, notes };
    saveState(newState as InvoiceState);
    return { notes };
  }),

  setTerms: (terms) => set((s) => {
    const newState = { ...s, terms };
    saveState(newState as InvoiceState);
    return { terms };
  }),

  updateStyle: (data) => set((s) => {
    const style = { ...s.style, ...data };
    const newState = { ...s, style };
    saveState(newState as InvoiceState);
    return { style };
  }),

  setProfession: (profession) => set((s) => {
    const profData = PROFESSIONS.find(p => p.key === profession);
    
    // Only load sample items if the user hasn't added any items yet
    const items = s.items.length === 0 && profData
      ? profData.items.map(item => ({
          id: generateId(),
          type: 'item' as const,
          ...item,
        }))
      : s.items;

    const template = getDefaultTemplateKey();
    const newState = { ...s, profession, items, style: { ...s.style, template } };
    saveState(newState as InvoiceState);
    return { profession, items, style: newState.style };
  }),

  clearForm: () => set(() => {
    const defaultState = createDefaultState();
    saveState(defaultState);
    return defaultState;
  }),

  loadState: (state) => set((s) => {
    const newState = { ...s, ...state };
    saveState(newState as InvoiceState);
    return state;
  }),

  getFullState: () => {
    const s = get();
    return {
      docType: s.docType,
      business: s.business,
      client: s.client,
      document: s.document,
      items: s.items,
      tax: s.tax,
      payment: s.payment,
      notes: s.notes,
      terms: s.terms,
      style: s.style,
      profession: s.profession,
    };
  },
}));
