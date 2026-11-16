'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FilePlus2, Loader2, Package, Plus, Search, Send, Trash2, UserRound } from 'lucide-react';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { useAdminCan } from '@/components/admin/admin-sidebar-context';
import { ApiClientError } from '@/lib/api/client';
import { createAdminQuote } from '@/lib/api/admin/quotes';
import { getAdminCustomers } from '@/lib/api/admin/customers';
import { getAdminProducts } from '@/lib/api/admin/products';
import type { AdminCustomer, AdminProduct, LandscapeQuote } from '@/lib/admin/mock-data/types';

interface Line {
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
}

const PROJECT_SUGGESTIONS = [
  'Mariage & Cérémonie',
  'Événement d’entreprise',
  'Décoration florale',
  'Abonnement floral',
  'Paysagisme',
  'Location de matériel',
];
const inputClass = 'w-full h-9 rounded-md border border-[#e7e4dd] bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#c1647a]';
const fcfa = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;
const errorText = (err: unknown, fallback: string) =>
  err instanceof ApiClientError ? err.details?.[0]?.message || err.message : err instanceof Error ? err.message : fallback;

let lineSeq = 0;
const newLine = (patch: Partial<Line> = {}): Line => ({ key: ++lineSeq, description: '', quantity: '1', unitPrice: '', ...patch });

/** Panneau « Nouveau devis » : le formulaire repart de zéro à chaque ouverture. */
export function CreateQuoteDialog(props: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (quote: LandscapeQuote, emailSent: boolean) => void;
}) {
  if (!props.isOpen) return null;
  return <CreateQuoteForm {...props} />;
}

function CreateQuoteForm({ onClose, onCreated }: { onClose: () => void; onCreated: (quote: LandscapeQuote, emailSent: boolean) => void }) {
  const can = useAdminCan();
  const canSearchClients = can('clients', 'read');
  const canSearchProducts = can('produits', 'read');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [lines, setLines] = useState<Line[]>(() => [newLine()]);
  const [saving, setSaving] = useState<'draft' | 'send' | null>(null);

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const setLine = (key: number, patch: Partial<Line>) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const pickCustomer = (c: AdminCustomer) => {
    setName(c.name);
    setEmail(c.email ?? '');
    setPhone(c.phone ?? '');
  };
  const addProduct = (p: AdminProduct) =>
    setLines((prev) => [
      ...prev.filter((l) => l.description.trim() || l.unitPrice),
      newLine({ description: p.name, unitPrice: String(Math.round(p.price ?? 0)) }),
    ]);

  const submit = async (send: boolean) => {
    if (name.trim().length < 2) return void toast.error('Indiquez le nom du client.');
    if (!email.trim() && !phone.trim()) return void toast.error('Indiquez l’email ou le téléphone du client.');
    if (send && !email.trim()) return void toast.error('Une adresse email est requise pour envoyer le devis.');
    if (eventType.trim().length < 2) return void toast.error('Indiquez l’objet du devis.');
    const items = lines
      .filter((l) => l.description.trim())
      .map((l) => ({ description: l.description.trim(), quantity: Math.max(1, Math.round(Number(l.quantity) || 1)), unitPrice: Math.max(0, Number(l.unitPrice) || 0) }));
    if (items.some((it) => it.description.length < 2)) return void toast.error('Chaque ligne doit avoir une désignation (2 caractères minimum).');
    if (send && items.reduce((s, it) => s + it.quantity * it.unitPrice, 0) <= 0) return void toast.error('Ajoutez au moins une ligne chiffrée.');
    setSaving(send ? 'send' : 'draft');
    try {
      const { quote, emailSent } = await createAdminQuote({
        customerName: name.trim(),
        customerEmail: email.trim() || undefined,
        customerPhone: phone.trim() || undefined,
        company: company.trim() || undefined,
        eventType: eventType.trim(),
        eventDate: eventDate || undefined,
        eventLocation: eventLocation.trim() || undefined,
        details: details.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
        items,
        send,
        message: message.trim() || undefined,
      });
      toast.success(send ? `Devis ${quote.quoteNumber} envoyé à ${email.trim()}` : `Devis ${quote.quoteNumber} enregistré en brouillon`);
      onCreated(quote, emailSent);
    } catch (err) {
      toast.error(errorText(err, 'Création du devis impossible.'));
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminDrawer
      isOpen
      onClose={onClose}
      size="xl"
      icon={<FilePlus2 size={20} />}
      title="Nouveau devis"
      subtitle="Pour un client existant ou non : produits du catalogue ou lignes libres, envoyé par email avec un lien pour l’accepter en ligne."
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <strong className="text-sm text-[#173f22]">Total : {fcfa(total)}</strong>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={Boolean(saving)}
              onClick={() => void submit(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
            >
              {saving === 'draft' && <Loader2 size={14} className="mr-1 inline animate-spin" />}
              Enregistrer en brouillon
            </button>
            <button
              type="button"
              disabled={Boolean(saving)}
              onClick={() => void submit(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8436e] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#b5355e] disabled:opacity-60"
            >
              {saving === 'send' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Créer et envoyer par email
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        <section className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#1e2a1f]">
            <UserRound size={15} /> Client
          </h3>
          {canSearchClients && <SearchPicker<AdminCustomer> placeholder="Retrouver un client existant (nom, email, téléphone)…" search={(q) => getAdminCustomers({ search: q, limit: 6 }).then((r) => r.customers)} render={(c) => [c.name, c.email]} onPick={pickCustomer} />}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="font-semibold text-gray-700">Nom du client *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex : Aminata Fall" />
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-gray-700">Société (facultatif)</span>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-gray-700">Email (pour l’envoi)</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="client@exemple.com" />
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-gray-700">Téléphone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+221 77 000 00 00" />
            </label>
          </div>
          <p className="text-[11px] text-gray-500">Le client n’a pas besoin de compte : il reçoit un lien personnel pour consulter, imprimer et accepter son devis.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#1e2a1f]">Projet</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 sm:col-span-1">
              <span className="font-semibold text-gray-700">Objet du devis *</span>
              <input list="quote-project-types" value={eventType} onChange={(e) => setEventType(e.target.value)} className={inputClass} placeholder="Ex : Mariage & Cérémonie" />
              <datalist id="quote-project-types">
                {PROJECT_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-gray-700">Date (facultatif)</span>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-gray-700">Lieu (facultatif)</span>
              <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className={inputClass} placeholder="Ex : Saly" />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Description du projet (visible par le client)</span>
            <textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} className={`${inputClass} h-auto py-2`} />
          </label>
        </section>

        <section className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#1e2a1f]">
            <Package size={15} /> Lignes du devis
          </h3>
          {canSearchProducts && (
            <SearchPicker<AdminProduct>
              placeholder="Ajouter un produit du catalogue (nom ou référence)…"
              search={(q) => getAdminProducts({ search: q, limit: 8 }).then((r) => r.items)}
              render={(p) => [p.name, fcfa(p.price ?? 0)]}
              onPick={addProduct}
            />
          )}
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={line.key} className="grid grid-cols-[1fr_70px_110px_auto] items-center gap-2">
                <input
                  value={line.description}
                  onChange={(e) => setLine(line.key, { description: e.target.value })}
                  placeholder="Désignation (produit, prestation…)"
                  aria-label={`Désignation, ligne ${index + 1}`}
                  className={inputClass}
                />
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => setLine(line.key, { quantity: e.target.value })}
                  aria-label={`Quantité, ligne ${index + 1}`}
                  className={inputClass}
                />
                <input
                  type="number"
                  min={0}
                  value={line.unitPrice}
                  onChange={(e) => setLine(line.key, { unitPrice: e.target.value })}
                  placeholder="Prix unitaire"
                  aria-label={`Prix unitaire, ligne ${index + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== line.key) : [newLine()]))}
                  className="rounded-md border border-red-200 p-2 text-red-600"
                  aria-label={`Retirer la ligne ${index + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setLines((prev) => [...prev, newLine()])} className="inline-flex items-center gap-1 font-semibold text-[#193e23]">
            <Plus size={14} /> Ajouter une ligne libre
          </button>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Message dans l’email (facultatif)</span>
            <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} h-auto py-2`} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Note interne (équipe seulement)</span>
            <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className={`${inputClass} h-auto py-2`} />
          </label>
        </section>
      </div>
    </AdminDrawer>
  );
}

/** Recherche avec suggestions (clients, produits) : 2 caractères minimum, résultats après 300 ms. */
function SearchPicker<T extends { id: string }>({
  placeholder,
  search,
  render,
  onPick,
}: {
  placeholder: string;
  search: (query: string) => Promise<T[]>;
  render: (item: T) => [string, string | undefined];
  onPick: (item: T) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ query: string; items: T[] } | null>(null);
  const term = query.trim();
  const searching = term.length >= 2 && results?.query !== term;

  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      search(term)
        .then((items) => !cancelled && setResults({ query: term, items }))
        .catch(() => !cancelled && setResults({ query: term, items: [] }));
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `search` est recréée à chaque rendu par le parent : seul le terme déclenche la recherche
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const shown = term.length >= 2 && results?.query === term ? results.items : [];
  return (
    <div className="relative">
      <label className="flex items-center gap-2 rounded-md border border-[#e7e4dd] bg-[#faf8f4] px-2">
        <Search size={14} className="text-gray-400" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-9 w-full bg-transparent text-xs outline-none" />
        {searching && <Loader2 size={14} className="animate-spin text-gray-400" />}
      </label>
      {shown.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full divide-y divide-[#f0ede6] rounded-md border border-[#e7e4dd] bg-white shadow-lg">
          {shown.map((item) => {
            const [main, side] = render(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(item);
                    setQuery('');
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#faf8f4]"
                >
                  <span className="font-medium text-gray-800">{main}</span>
                  {side && <span className="text-gray-500">{side}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {term.length >= 2 && results?.query === term && results.items.length === 0 && (
        <p className="mt-1 text-[11px] text-gray-500">Aucun résultat : saisissez les informations à la main.</p>
      )}
    </div>
  );
}
