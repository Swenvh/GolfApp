# Greenside · Cijfers bij het SaaS-model (flinke onboarding + abonnement + betaalmarge)

_Doorgerekend, 12 oktober 2026. Model: een **flinke onboarding fee** om de club op het platform te
krijgen, een **maandabonnement** voor gebruik, onderhoud, updates, support en SLA om erop te blijven, en
een **marge op het betaalverkeer** dat toch al door de app loopt. Bedragen in euro's, excl. btw._

## Het prijsmodel

| | klein (9 holes) | midden (18 holes) | groot (27+ holes) |
| --- | ---: | ---: | ---: |
| **Onboarding (eenmalig)** — op het platform krijgen | € 1.500 | € 2.000 | € 2.500 |
| **Abonnement per maand** — gebruik, onderhoud, updates, support, SLA | € 129 | € 199 | € 299 |
| **Betaalverkeer** — op greenfees, bar, lesgeld, incasso | ~1% (netto ~0,6% na PSP) | idem | idem |

Blended over de marktverdeling (9h 25% / 18h 55% / 27+ 20%): **onboarding ~€ 1.975**, **abonnement
~€ 202/mnd**, **betaalmarge ~€ 160/mnd** bij volle adoptie.

## Kosten per club

| per club per maand | bedrag |
| --- | ---: |
| Hosting | € 12 |
| Support | € 18 |
| SEPA-incasso | € 0,50 |
| Pilot-/overlapreserve | € 5 |
| **Variabel totaal** | **€ 35,50** |

**Bijdrage per club per maand:** € 166 zonder betaalmarge, **€ 326 met betaalmarge**.

Vaste kosten: **€ 326/mnd** in jaar 1 (oprichters onbetaald), **€ 5.398/mnd** met twee salarissen van
€ 2.500 (uit `numbers.json`).

## Break-even

| | zonder betaalmarge | met betaalmarge |
| --- | ---: | ---: |
| Geen salaris (jaar 1) | 2 clubs | 1 club |
| Met vol salaris | 33 clubs | **17 clubs** |

De betaalmarge halveert het aantal clubs dat je nodig hebt voor vol salaris: van 33 naar 17. Dat is ~6,5%
van de 263 clubs in de markt.

## Jaar 1, maand voor maand (oprichters onbetaald, conservatieve aanloop ~1 club/mnd → 10 eind jaar 1)

| mnd | clubs | abonnement | onboarding | betaalmarge* | kosten | resultaat | cash** |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 202 | 1.975 | 80 | 362 | 1.895 | −8.528 |
| 2 | 2 | 403 | 1.975 | 160 | 397 | 2.142 | −6.386 |
| 3 | 3 | 604 | 1.975 | 241 | 432 | 2.388 | −3.998 |
| 4 | 4 | 806 | 1.975 | 321 | 468 | 2.634 | −1.364 |
| 5 | 5 | 1.008 | 1.975 | 401 | 504 | 2.880 | **+1.516** |
| 6 | 6 | 1.209 | 1.975 | 482 | 539 | 3.126 | 4.642 |
| 7 | 6 | 1.209 | 0 | 482 | 539 | 1.152 | 5.794 |
| 8 | 7 | 1.410 | 1.975 | 562 | 574 | 3.373 | 9.166 |
| 9 | 8 | 1.612 | 1.975 | 642 | 610 | 3.619 | 12.786 |
| 10 | 8 | 1.612 | 0 | 642 | 610 | 1.644 | 14.430 |
| 11 | 9 | 1.814 | 1.975 | 722 | 646 | 3.865 | 18.295 |
| 12 | 10 | 2.015 | 1.975 | 802 | 681 | 4.112 | **22.406** |

\* betaalmarge op halve adoptie in jaar 1. \** cash start op −€ 10.423 (startkosten).

- **Omzet jaar 1:** abonnement € 13.904 + onboarding € 19.750 + betaalmarge € 5.537 = **€ 39.191**.
- **Resultaat jaar 1 (geen salaris):** **+€ 32.829**.
- **Benodigd geld:** **€ 10.423** — alléén de startkosten (jurist € 2.500, pentest € 7.500, rest). De
  onboarding fees dekken alle operationele verliezen; de cash gaat al in maand 5 positief.

Dit is een scherpe verbetering t.o.v. het oude per-lid-model (jaar 1 −€ 159, benodigd geld € 11.181,
15 clubs voor salaris): de onboarding fee lost de cash op, de betaalmarge lost de lange-termijnwinst op.

## Klantwaarde (CLV)

Bij 85% brutomarge en een geschatte levensduur van 8 jaar (golfclubs zijn zeer plakkerig):

| | zonder betaalmarge | met betaalmarge |
| --- | ---: | ---: |
| CLV per club | ~€ 18.100 | ~€ 31.200 |
| LTV : CAC (CAC € 1.000) | 18 : 1 | 31 : 1 |

Een gezonde SaaS-ratio is 3:1 à 5:1. 18–31:1 betekent: **er is nog ruimte om hoger te prijzen** en toch
onder de concurrent te blijven. De bedragen hierboven zijn dus eerder voorzichtig dan agressief.

## Gevoeligheid (break-even clubs met vol salaris, met betaalmarge)

| scenario | bijdrage/club | clubs nodig |
| --- | ---: | ---: |
| Basis | € 326 | 16,5 |
| Abonnement −20% | € 286 | 18,9 |
| Betaalmarge halveren | € 246 | 21,9 |
| **Geen betaalmarge** (ondergrens) | € 166 | 32,5 |
| Abonnement +25% | € 377 | 14,3 |

Zelfs in het slechtste geval (geen enkele betaalmarge) is het bedrijf levensvatbaar bij ~33 clubs, en
jaar 1 draait sowieso op de onboarding fees.

## Aanbeveling

- **Prijs:** flinke onboarding (€ 1.500–2.500) + abonnement (€ 129–299/mnd) + ~1% betaalverkeer.
- **Waarom het werkt:** onboarding dicht de cash (jaar 1 positief, geld nodig = alleen startkosten);
  abonnement + betaalmarge geven hoge, meegroeiende CLV; break-even voor salaris daalt naar ~17 clubs.
- **Positionering:** nog steeds onder de concurrent (Lightspeed € 289–325, Club Caddie € 299,
  Nexxchange € 200 + € 50/gebruiker), dus een eerlijke, makkelijke overstap — "voor minder dan u nu
  betaalt, en de app zit erbij".
- **Pilot/pionier:** geef de eerste clubs korting op de onboarding of maand 1–3, niet op de structuur.

_Grenzen: betaalverkeer en adoptie zijn schattingen (jaar 1 op halve adoptie); levensduur 8 jaar en marge
85% zijn aannames; churn niet apart gemodelleerd; CAC € 1.000 geschat. Toets met echte offertes, een echt
bestuur en de werkelijke betaalstromen. Geen financieel advies._
