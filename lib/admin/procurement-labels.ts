import type { SupplierInvoiceStatus, SupplierOrderStatus } from '@/lib/admin/mock-data/types';

export const ORDER_STATUS_LABELS: Record<SupplierOrderStatus, string> = {
  brouillon: 'Brouillon',
  a_valider: 'À valider',
  validee: 'Validée',
  envoyee: 'Envoyée',
  en_cours: 'Réception partielle',
  receptionnee: 'Réceptionnée',
  annulee: 'Annulée',
};

export const ORDER_STATUS_STYLES: Record<SupplierOrderStatus, string> = {
  brouillon: 'bg-gray-100 text-gray-700 border-gray-200',
  a_valider: 'bg-amber-50 text-amber-800 border-amber-200',
  validee: 'bg-sky-50 text-sky-800 border-sky-200',
  envoyee: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  en_cours: 'bg-orange-50 text-orange-800 border-orange-200',
  receptionnee: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  annulee: 'bg-red-50 text-red-700 border-red-200',
};

export const INVOICE_STATUS_LABELS: Record<SupplierInvoiceStatus, string> = {
  a_verifier: 'À vérifier',
  a_payer: 'À payer',
  payee: 'Payée',
  en_retard: 'En retard',
  contestee: 'Contestée',
  annulee: 'Annulée',
};

export const INVOICE_STATUS_STYLES: Record<SupplierInvoiceStatus, string> = {
  a_verifier: 'bg-gray-100 text-gray-700 border-gray-200',
  a_payer: 'bg-amber-50 text-amber-800 border-amber-200',
  payee: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  en_retard: 'bg-red-50 text-red-700 border-red-200',
  contestee: 'bg-purple-50 text-purple-800 border-purple-200',
  annulee: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const formatFcfa = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;
export const formatDay = (iso: string | null | undefined) =>
  iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
