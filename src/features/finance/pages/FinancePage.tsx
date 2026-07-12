'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { BookOpen, CreditCard, Receipt, Landmark, PiggyBank, Percent } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'gl', label: 'General Ledger', icon: BookOpen, description: 'Chart of accounts, journals & postings.' },
  { value: 'ap', label: 'Accounts Payable', icon: CreditCard, description: 'Vendor invoices, payments & aging.' },
  { value: 'ar', label: 'Accounts Receivable', icon: Receipt, description: 'Customer invoices, collections & aging.' },
  { value: 'treasury', label: 'Treasury', icon: Landmark, description: 'Banking, cash & treasury management.' },
  { value: 'budget', label: 'Budget', icon: PiggyBank, description: 'Budget planning & variance analysis.' },
  { value: 'tax', label: 'Tax', icon: Percent, description: 'GST/VAT, e-invoicing & filings.' },
];

export function FinancePage() {
  return (
    <FeaturePage
      module="finance"
      title="Finance"
      description="General ledger, AP/AR, treasury, budget & tax compliance."
      subModules={SUB_MODULES}
    />
  );
}
