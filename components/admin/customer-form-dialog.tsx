'use client';

import { useState } from 'react';
import { Loader2, Mail, MapPin, Pencil, Phone, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminCustomer } from '@/lib/admin/mock-data/types';
import { createAdminCustomer, updateAdminCustomer } from '@/lib/api/admin/customers';
import { ApiClientError } from '@/lib/api/client';

import { RequiredStar } from '@/components/ui/required-star';

const SEGMENTS = [
  { value: 'PARTICULIER', label: 'Particulier' },
  { value: 'ENTREPRISE', label: 'Entreprise' },
  { value: 'VIP', label: 'VIP' },
] as const;
type SegmentValue = (typeof SEGMENTS)[number]['value'];

const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fiche à modifier ; absente = création d'une fiche sans compte de connexion. */
  customer?: AdminCustomer | null;
  /** Fiche créée ou enregistrée (`linkedAccount` : compte client existant lié à la création). */
  onSaved: (customer: AdminCustomer, info: { created: boolean; linkedAccount: boolean }) => void;
}

/**
 * Création d'une fiche client (client au téléphone, en boutique, entreprise) ou modification de son identité
 * et de ses coordonnées. À monter avec une `key` pour repartir des valeurs de la fiche à chaque ouverture.
 */
export function CustomerFormDialog({ open, onOpenChange, customer, onSaved }: CustomerFormDialogProps) {
  const editing = Boolean(customer);
  const hasAccount = Boolean(customer?.userId);
  // Email figé : identifiant de connexion d'un client inscrit, ou commandes déjà passées avec cette adresse
  const emailLocked = editing && (hasAccount || (customer?.totalOrders ?? 0) > 0);

  const [name, setName] = useState(customer?.name ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [address, setAddress] = useState(customer ? customer.crmAddress ?? '' : '');
  const [segment, setSegment] = useState<SegmentValue>('PARTICULIER');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Le nom doit contenir au moins 2 caractères.';
    if (!emailLocked && !EMAIL_PATTERN.test(email.trim())) next.email = 'Adresse email invalide.';
    if (phone.trim() && !PHONE_PATTERN.test(phone.trim())) next.phone = 'Numéro de téléphone invalide.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (!customer) {
        const { customer: created, linkedAccount } = await createAdminCustomer({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          segment,
          address: address.trim() || null,
          notes: notes.trim() || null,
        });
        onSaved(created, { created: true, linkedAccount });
      } else {
        // Seuls les champs modifiés sont envoyés
        const body: Parameters<typeof updateAdminCustomer>[1] = {};
        if (name.trim() !== customer.name) body.name = name.trim();
        if (!emailLocked && email.trim().toLowerCase() !== customer.email.toLowerCase()) body.email = email.trim();
        if (phone.trim() !== (customer.phone ?? '')) body.phone = phone.trim();
        if (address.trim() !== (customer.crmAddress ?? '')) body.address = address.trim() || null;
        if (Object.keys(body).length === 0) {
          onOpenChange(false);
          return;
        }
        const updated = await updateAdminCustomer(customer.id, body);
        onSaved(updated, { created: false, linkedAccount: false });
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiClientError && Array.isArray(err.details)) {
        const fieldErrors: Record<string, string> = {};
        for (const d of err.details as { path?: string; message?: string }[]) {
          if (d.path && d.message) fieldErrors[d.path] = d.message;
        }
        setErrors(fieldErrors);
      }
      toast.error(err instanceof ApiClientError ? err.message : 'La fiche client n’a pas pu être enregistrée.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'text-xs h-9 bg-white';
  const errorText = (key: string) =>
    errors[key] ? (
      <p className="text-[11px] text-rose-600" role="alert">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md bg-white border border-[#e7e4dd] rounded-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1e2a1f] flex items-center gap-2">
              {editing ? <Pencil className="h-5 w-5 text-[#c1647a]" /> : <UserPlus className="h-5 w-5 text-[#c1647a]" />}
              {editing ? 'Modifier les coordonnées' : 'Nouveau client'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {editing
                ? hasAccount
                  ? 'Ce client a un compte : le nom et le téléphone sont aussi mis à jour sur son compte.'
                  : 'Identité et coordonnées de la fiche client.'
                : 'Fiche d’un client au téléphone, en boutique ou d’une entreprise, sans compte de connexion. Si un compte client existe déjà avec cet email, la fiche lui est liée.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="customer-name" className="font-semibold text-gray-700 block">
                Nom complet ou raison sociale <RequiredStar /></label>
              <Input
                id="customer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Awa Ndiaye, Hôtel Les Filaos"
                className={fieldClass}
                aria-invalid={Boolean(errors.name)}
                maxLength={120}
                autoFocus
              />
              {errorText('name')}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customer-email" className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                Adresse email <RequiredStar /></label>
              <Input
                id="customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@exemple.sn"
                className={fieldClass}
                aria-invalid={Boolean(errors.email)}
                disabled={emailLocked}
                maxLength={200}
              />
              {emailLocked && (
                <p className="text-[11px] text-gray-500">
                  {hasAccount
                    ? 'Identifiant de connexion du client : non modifiable depuis la fiche.'
                    : 'Des commandes sont enregistrées avec cette adresse : elle ne peut plus être modifiée.'}
                </p>
              )}
              {errorText('email')}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="customer-phone" className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  Téléphone
                </label>
                <Input
                  id="customer-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className={`${fieldClass} font-mono`}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errorText('phone')}
              </div>
              {!editing && (
                <div className="space-y-1.5">
                  <label htmlFor="customer-segment" className="font-semibold text-gray-700 block">
                    Segment
                  </label>
                  <select
                    id="customer-segment"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value as SegmentValue)}
                    className="w-full h-9 rounded-md border border-[#e7e4dd] bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#c1647a]"
                  >
                    {SEGMENTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customer-address" className="font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                Adresse
              </label>
              <Input
                id="customer-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quartier, rue, ville"
                className={fieldClass}
                maxLength={500}
              />
              {editing && hasAccount && (
                <p className="text-[11px] text-gray-500">Adresse de la fiche ; le carnet d’adresses du client reste géré depuis son compte.</p>
              )}
              {errorText('address')}
            </div>

            {!editing && (
              <div className="space-y-1.5">
                <label htmlFor="customer-notes" className="font-semibold text-gray-700 block">
                  Notes internes (non visibles du client)
                </label>
                <textarea
                  id="customer-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Préférences, occasions à retenir…"
                  className="w-full rounded-md border border-[#e7e4dd] p-2 text-xs"
                  maxLength={5000}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="border-[#e7e4dd]">
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} className="bg-[#24582d] hover:bg-[#1d4724] text-white gap-1.5">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : editing ? <Save className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              {editing ? 'Enregistrer' : 'Créer la fiche'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
