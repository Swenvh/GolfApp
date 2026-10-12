# Prijzen: Greenside

Bedragen in euro, excl. 21% btw. **Op 12 oktober 2026 herzien** naar het SaaS-model: één algemene app
(geen eigen app per club in de store, vanwege Apple-richtlijn 4.2.6/4.3), een **flinke onboarding fee** om
de club op het platform te krijgen, een **maandabonnement** voor gebruik, onderhoud, updates, support en
SLA, en een **marge op het betaalverkeer**. De onderbouwing staat in `founder/nl/app-strategie.md`
(distributie), `founder/nl/prijs-realiteit.md` (marktbenchmarks en CLV) en `founder/nl/cijfers-saas.md`
(doorgerekend; `founder/numbers-saas.json`). De eerdere per-lid-prijs is vervangen; de prijscurves van het
panel staan onderaan als toets.

## 1. Het product en waarom dit model

Eén app in de App Store en Google Play (neutrale naam). Een golfer kiest/volgt zijn club; zodra hij erin
zit is alles volledig in de huisstijl van die club. Dat is veilig in de store (één inzending, één review)
én goedkoop voor ons per club. Daardoor kunnen we een laag totaalbedrag vragen zonder een abonnement dat
na jaren tot tienduizenden oploopt — en toch gezonde klantwaarde houden via de betaalmarge.

## 2. De prijs

| | klein (9 holes, ~550 leden) | midden (18 holes, ~950) | groot (27+ holes, ~1.350) |
| --- | ---: | ---: | ---: |
| **Onboarding (eenmalig)** — op het platform krijgen | € 1.500 | € 2.000 | € 2.500 |
| **Abonnement per maand** — gebruik, onderhoud, updates, support, SLA | € 129 | € 199 | € 299 |
| **Betaalverkeer** — op greenfees, bar, lesgeld, incasso | ~1% (netto ~0,6% na PSP) | idem | idem |

Blended over de markt (9h 25% / 18h 55% / 27+ 20%): onboarding **~€ 1.975**, abonnement **~€ 202/mnd**,
betaalmarge **~€ 160/mnd** bij volle adoptie.

- **Onboarding = flink en vooraf.** De club betaalt dit om op het platform te komen (inrichting in
  clubstijl, ledenimport, livegang, training, eerste support). Het dicht onze cash en bindt de club.
- **Abonnement = om erop te blijven.** Vast per maand, jaarlijks of maandelijks gefactureerd, past in de
  begroting die de ALV vaststelt.
- **Betaalmarge = de meegroeiende motor.** Een cent op de euro die toch al door de club stroomt; de club
  voelt het niet als vaste last, en het groeit mee met de activiteit.

## 3. Pionier en Oprichter (openingsaanbod)

Geef de eerste clubs korting op de **onboarding** of de eerste maanden, niet op de structuur:

- **Pionier (3 plaatsen, tekenen vóór de Zwolle-resultaten, vóór 1 juni 2027):** onboarding gratis, eerste
  3 maanden abonnement gratis, abonnementsprijs 3 jaar vast.
- **Oprichter (club 4–10, pilot vóór 1 juli 2027):** onboarding −50%, eerste maand gratis, prijs 2 jaar vast.
- Beide: de gratis pilot van drie maanden met schriftelijke succescriteria en alle garanties hieronder.

## 4. De garanties (ze kosten geld; zie de marge)

- **Geen dubbele rekening:** het abonnement start pas als de club het oude systeem opzegt (uiterlijk 6
  maanden na de pilot); de eerste factuur valt in het volgende begrotingsjaar.
- **Geen dubbel werk:** tijdens de pilot zetten wij elke week de ledenlijst over (CSV-export volstaat).
- **Vangnet E-Golf4U:** mislukt de pilot, dan zetten wij de gegevens kosteloos over naar Nexxchange of
  IntoGolf.
- **Continuïteit:** maandelijkse export naar opslag van de club, broncode in escrow + IT-partner (vóór de
  derde club), 12 maanden opzegtermijn.
- **Stoppen na de pilot = niets betalen.**

## 5. Tegenover de concurrent

Golfclubsoftware is op offertebasis; openbare prijzen elders: Lightspeed Golf € 89/149/289 p/mnd
([softwareadvice](https://www.softwareadvice.com/club-management/lightspeed-golf-profile/)), Club Caddie
~€ 299 ([joinit](https://joinit.com/blog/best-country-club-management-software)), foreUP vanaf ~€ 120 +
modules. NL: Nexxchange **€ 200/mnd + € 50 per gebruiker**
([Capterra](https://www.capterra.com/p/201943/Nexxchange-GolfSuite/)); een volledig clubsysteem ~€ 350–450.
**€ 199/mnd zit daar ruim onder** — een eerlijke, makkelijke overstap: *"voor minder dan u nu betaalt — en
de app zit erbij"*, in elk gesprek getoond met de eigen factuur van de club. Over 5 jaar is dat ~€ 13.000
abonnement + betaalmarge, tegenover de ~€ 20.000–30.000 die de club nu aan zijn systeem kwijt is.

## 6. De marge en break-even (uit `cijfers-saas.md`)

| per club per maand | bedrag |
| --- | ---: |
| Blended abonnement | € 202 |
| Betaalmarge (volle adoptie) | € 160 |
| Variabele kosten | − € 35,50 |
| **Bijdrage — zonder betalingen** | **€ 166** |
| **Bijdrage — met betalingen** | **€ 326** |

- **Break-even voor vol salaris** (€ 5.398/mnd, 2 × € 2.500): **17 clubs** met betaalmarge, 33 zonder.
- **Jaar 1 (oprichters onbetaald):** omzet € 39.191, resultaat **+€ 32.829**, benodigd geld **€ 10.423**
  (alleen startkosten; onboarding dekt de verliezen, cash positief vanaf maand 5).
- **CLV per club:** ~€ 18.100 zonder / **~€ 31.200 met** betaalmarge; LTV:CAC 18–31:1 (gezond is 3–5:1 —
  er is dus ruimte om hoger te prijzen).

## 7. De prijsladder

De basis is onboarding + abonnement + betaalmarge. Daarbovenop, later en alleen als ze gebouwd en gevraagd
zijn: **uitbreidingen per maand** — incasso/SEPA, wedstrijdmodule, horeca op rekening (unTill),
ballenautomaat (Xafax), sponsors/advertenties, pushcampagnes, premium SLA, en de eigen app in de store
(onder het Apple-account van de club) als premium. Elk laat de club een ander systeem opzeggen, dus prijs
ze per uitbreiding, niet in de basis. Verkoop ze niet voordat ze bestaan.

## 8. Wat te testen met echte kopers

1. **Accepteert een bestuur een flinke onboarding fee?** Bied € 2.000 + € 199/mnd aan en tel handtekeningen.
2. **Werkt het "minder dan u nu betaalt"-verhaal** met de eigen factuur van de club? Noteer wat overtuigt.
3. **Betaalmarge:** mogen wij de betalingen verzorgen, en tegen welk percentage vinden clubs dat redelijk?
4. **Onboarding € 2.000 vs € 2.500**, en abonnement € 199 vs € 249 voor midden-clubs.

## Bijlage: prijscurves (Van Westendorp) per baangrootte

De prijscurves zijn gemeten op het oude per-maand-abonnement. Ze blijven een nuttige bovengrens: het panel
vond tot ~€ 550–650/mnd (18 holes) "wordt duur". Het nieuwe abonnement (€ 199) plus betaalmarge zit daar
ruim onder, dus de prijs is eerder voorzichtig dan agressief.

| | 9 holes (n=10) | 18 holes (n=22) | 27+ holes (n=8) |
| --- | ---: | ---: | ---: |
| Mediaan "koopje" | € 120 | € 300 | € 350 |
| Mediaan "wordt duur" | € 220 | € 550 | € 650 |
| Mediaan "te duur" | € 300 | € 800 | € 900 |
| Nieuw abonnement | € 129 (koopje) | € 199 (ruim onder "duur") | € 299 (onder "duur") |

_Gesimuleerde kopers zijn geen bewijs. Bedragen en betaalstromen zijn schattingen om te toetsen met echte
offertes en een echt bestuur. Geen financieel advies._
