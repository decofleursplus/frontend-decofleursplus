'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

/** Identifiants d'un compte créé par l'équipe (mot de passe temporaire, à changer à la première connexion). */
export interface AccountCredentials {
  email: string;
  temporaryPassword: string;
  /** false : l'email n'est pas parti, l'équipe transmet elle-même les identifiants */
  emailSent?: boolean;
}

/**
 * Identifiants affichés une seule fois après la création d'un compte ou un nouveau mot de passe temporaire
 * (collaborateur, livreur, client), avec le résultat de l'envoi par email.
 */
export function AccountCredentialsDialog({
  credentials,
  accountName,
  loginPath,
  title,
  onClose,
}: {
  credentials: AccountCredentials | null;
  accountName: string;
  /** Page de connexion du compte : `/admin/connexion` (équipe) ou `/connexion` (client) */
  loginPath: string;
  title?: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(credentials)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1e2a1f] flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#c1647a]" />
            {title ?? `Accès de ${accountName}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Mot de passe temporaire : {accountName} devra le changer à sa première connexion. Il ne sera plus affiché
            ensuite.
          </DialogDescription>
        </DialogHeader>
        {credentials && (
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
            <div>
              <span className="text-gray-500">Identifiant : </span>
              <strong className="font-mono break-all">{credentials.email}</strong>
            </div>
            <div>
              <span className="text-gray-500">Mot de passe temporaire : </span>
              <strong className="font-mono select-all">{credentials.temporaryPassword}</strong>
            </div>
            <div>
              <span className="text-gray-500">Connexion : </span>
              <span className="font-mono">{loginPath}</span>
            </div>
            <p className={credentials.emailSent ? 'text-emerald-700' : 'text-amber-700'}>
              {credentials.emailSent
                ? 'Ses identifiants lui ont été envoyés par email.'
                : 'L’email n’a pas pu être envoyé : transmettez-lui ces identifiants (WhatsApp, SMS…).'}
            </p>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="text-xs gap-1.5"
            onClick={() =>
              credentials &&
              void navigator.clipboard
                ?.writeText(`Identifiant : ${credentials.email}\nMot de passe temporaire : ${credentials.temporaryPassword}`)
                .then(() => toast.success('Identifiants copiés'))
                .catch(() => toast.error('Copie impossible : sélectionnez le texte manuellement.'))
            }
          >
            <Copy className="h-3.5 w-3.5" /> Copier
          </Button>
          <Button onClick={onClose} className="bg-[#173f22] hover:bg-[#12311a] text-white text-xs">
            J’ai noté
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
