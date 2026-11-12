'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  type CustomerAddress,
} from '@/lib/api/customer';
import { ErrorState, LoadingState, Notice, SectionHeader, errorText, useResource } from './shared';

type Draft = { name: string; street: string; city: string; phone: string; isDefault: boolean };
const EMPTY: Draft = { name: '', street: '', city: '', phone: '', isDefault: false };

export function AdressesSection() {
  const { data: addresses, setData, error, loading, reload } = useResource(getCustomerAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function startEdit(addr: CustomerAddress) {
    setEditingId(addr.id);
    setDraft({ name: addr.name, street: addr.street, city: addr.city, phone: addr.phone, isDefault: addr.isDefault });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!draft.name.trim() || draft.street.trim().length < 3 || !draft.city.trim() || !draft.phone.trim()) {
      return setMessage({ kind: 'error', text: 'Renseignez le nom, l’adresse, la ville et le téléphone.' });
    }
    setBusy(true);
    try {
      const payload = { name: draft.name.trim(), street: draft.street.trim(), city: draft.city.trim(), phone: draft.phone.trim() };
      if (editingId) {
        await updateCustomerAddress(editingId, payload);
        if (draft.isDefault) await setDefaultCustomerAddress(editingId);
      } else {
        await createCustomerAddress({ ...payload, isDefault: draft.isDefault });
      }
      await reload();
      setMessage({ kind: 'success', text: editingId ? 'Adresse modifiée.' : 'Adresse ajoutée.' });
      cancelEdit();
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Enregistrement impossible.') });
    } finally {
      setBusy(false);
    }
  }

  async function makeDefault(id: string) {
    setMessage(null);
    try {
      await setDefaultCustomerAddress(id);
      setData((list) => (list ?? []).map((a) => ({ ...a, isDefault: a.id === id })));
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Action impossible.') });
    }
  }

  async function remove(addr: CustomerAddress) {
    if (!window.confirm(`Supprimer l’adresse « ${addr.name} » ?`)) return;
    setMessage(null);
    try {
      await deleteCustomerAddress(addr.id);
      await reload();
      if (editingId === addr.id) cancelEdit();
    } catch (err) {
      setMessage({ kind: 'error', text: errorText(err, 'Suppression impossible.') });
    }
  }

  return (
    <section className="account-panel">
      <SectionHeader title="Mes adresses" description="Les adresses proposées lors de vos commandes." />
      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      {loading ? (
        <LoadingState label="Chargement de vos adresses…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (addresses ?? []).length === 0 ? (
        <p className="py-4 text-sm text-neutral-600">Aucune adresse enregistrée. Ajoutez-en une ci-dessous.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          {(addresses ?? []).map((addr) => (
            <div key={addr.id} className="address-preview" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <b>
                  {addr.name}
                  {addr.isDefault && <span>Par défaut</span>}
                </b>
                {addr.street}
                <br />
                {addr.city}
                <br />
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>Tél : {addr.phone}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                {!addr.isDefault && (
                  <button type="button" onClick={() => makeDefault(addr.id)} className="button button-outline button-small">
                    Par défaut
                  </button>
                )}
                <button type="button" onClick={() => startEdit(addr)} className="button button-outline button-small" aria-label={`Modifier ${addr.name}`}>
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(addr)}
                  className="button button-outline button-small"
                  style={{ color: '#dc2626' }}
                  aria-label={`Supprimer ${addr.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="account-form" onSubmit={submit} noValidate style={{ marginTop: 20 }}>
        <h2>{editingId ? 'Modifier l’adresse' : 'Ajouter une adresse'}</h2>
        <label>
          Nom de l’adresse
          <input placeholder="Maison, Bureau, Villa…" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label>
          Adresse complète
          <input autoComplete="street-address" placeholder="Rue, quartier, repères…" value={draft.street} onChange={(e) => set({ street: e.target.value })} />
        </label>
        <div className="checkout-fields">
          <label>
            Ville
            <input placeholder="Saly, Mbour, Dakar…" value={draft.city} onChange={(e) => set({ city: e.target.value })} />
          </label>
          <label>
            Téléphone de livraison
            <input inputMode="tel" placeholder="+221 77 123 45 67" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
          </label>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={draft.isDefault} onChange={(e) => set({ isDefault: e.target.checked })} style={{ height: 'auto' }} />
          <span style={{ fontWeight: 500 }}>Adresse par défaut</span>
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Ajouter cette adresse'}
          </button>
          {editingId && (
            <button type="button" className="button button-outline" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
