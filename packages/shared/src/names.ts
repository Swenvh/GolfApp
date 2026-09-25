export interface PersonName {
  first_name: string;
  infix?: string | null;
  last_name: string;
}

/** "Jan de Vries" */
export function fullName(p: PersonName): string {
  return [p.first_name, p.infix, p.last_name].filter(Boolean).join(' ');
}

/** "Vries, Jan de" — voor sorteerbare lijsten */
export function sortName(p: PersonName): string {
  return `${p.last_name}, ${[p.first_name, p.infix].filter(Boolean).join(' ')}`;
}

export function initials(p: PersonName): string {
  return (p.first_name[0] ?? '') + (p.last_name[0] ?? '');
}
