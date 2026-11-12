/** Liens d'appel et WhatsApp construits à partir des numéros saisis dans les paramètres de la boutique. */

const digits = (phone: string) => phone.replace(/[^0-9]/g, '');

export function telHref(phone: string): string {
  const d = digits(phone);
  return d ? `tel:+${d.startsWith('221') || phone.trim().startsWith('+') ? d : `221${d}`}` : '';
}

export function whatsappHref(phone: string, text?: string): string {
  let d = digits(phone);
  if (d && !phone.trim().startsWith('+') && !d.startsWith('221')) d = `221${d}`;
  if (!d) return '';
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
