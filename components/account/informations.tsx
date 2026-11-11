'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { PASSWORD_MIN_LENGTH } from '@/lib/api/auth';
import { changeCustomerPassword, getCustomerProfile, updateCustomerProfile } from '@/lib/api/customer';
import { ErrorState, LoadingState, Notice, SectionHeader, errorText, useResource } from './shared';

export function InformationsSection() {
  const { updateUser } = useAuth();
  const { data: profile, error, loading, reload } = useResource(getCustomerProfile);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- formulaire initialisé avec le profil du serveur
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(profile.phone);
  }, [profile]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    if (firstName.trim().length < 2) return setProfileMsg({ kind: 'error', text: 'Le prénom doit contenir au moins 2 caractères.' });
    setSaving(true);
    try {
      const updated = await updateCustomerProfile({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      updateUser({ name: `${updated.firstName} ${updated.lastName}`.trim(), phone: updated.phone });
      setProfileMsg({ kind: 'success', text: 'Vos informations ont été enregistrées.' });
    } catch (err) {
      setProfileMsg({ kind: 'error', text: errorText(err, 'Enregistrement impossible.') });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < PASSWORD_MIN_LENGTH)
      return setPasswordMsg({ kind: 'error', text: `Le nouveau mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` });
    if (newPassword !== confirmPassword) return setPasswordMsg({ kind: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
    setChanging(true);
    try {
      await changeCustomerPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ kind: 'success', text: 'Votre mot de passe a été modifié.' });
    } catch (err) {
      setPasswordMsg({ kind: 'error', text: errorText(err, 'Modification impossible.') });
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="account-panel">
      <SectionHeader title="Mes informations" description="Mettez à jour vos coordonnées et votre mot de passe." />
      {loading ? (
        <LoadingState label="Chargement de votre profil…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <form className="account-form" onSubmit={saveProfile} noValidate>
            <h2>Coordonnées personnelles</h2>
            {profileMsg && <Notice kind={profileMsg.kind}>{profileMsg.text}</Notice>}
            <div className="checkout-fields">
              <label>
                Prénom
                <input autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </label>
              <label>
                Nom
                <input autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>
              <label>
                Adresse e-mail (identifiant du compte)
                <input type="email" value={profile?.email ?? ''} disabled style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
              </label>
              <label>
                Téléphone mobile
                <input inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
            </div>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </form>

          <hr style={{ margin: '30px 0', borderColor: '#e5e7eb' }} />

          <form className="account-form" onSubmit={changePassword} noValidate>
            <h2>Modifier mon mot de passe</h2>
            {passwordMsg && <Notice kind={passwordMsg.kind}>{passwordMsg.text}</Notice>}
            <div className="checkout-fields">
              <label>
                Mot de passe actuel
                <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </label>
              <label>
                Nouveau mot de passe
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder={`${PASSWORD_MIN_LENGTH} caractères minimum`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>
              <label style={{ gridColumn: 'span 2' }}>
                Confirmer le nouveau mot de passe
                <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </label>
            </div>
            <button className="button button-primary" type="submit" disabled={changing}>
              {changing ? 'Modification…' : 'Changer mon mot de passe'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
