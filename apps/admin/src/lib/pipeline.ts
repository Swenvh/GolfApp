export type Stage = 'lead' | 'demo' | 'proefperiode' | 'gewonnen' | 'verloren';

export const stages: Stage[] = ['lead', 'demo', 'proefperiode', 'gewonnen', 'verloren'];

export const stageLabel: Record<Stage, string> = {
  lead: 'Lead', demo: 'Demo', proefperiode: 'Proefperiode', gewonnen: 'Gewonnen', verloren: 'Verloren',
};

/** Wat elke fase betekent, voor wie de pijplijn voor het eerst ziet. */
export const stageExplain: Record<Stage, string> = {
  lead: 'We weten van de club, maar hebben nog geen demo gegeven.',
  demo: 'De club heeft de app gezien; we wachten op een besluit of sturen een offerte.',
  proefperiode: 'De club probeert Greenside een maand gratis.',
  gewonnen: 'Getekend. Nu de club aanmaken en de leden overzetten.',
  verloren: 'Niet nu. Zet een datum om het later opnieuw te proberen.',
};
