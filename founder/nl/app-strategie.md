# Greenside · App-strategie, prijsmodellen en SLA's

_Casus, 10 oktober 2026. Hoe presenteren we de app het slimst gegeven dat App Store-goedkeuring
het grootste risico is — en welk prijsmodel en welke SLA's horen daarbij._

## Kern

Apple weigert bijna-identieke "white-label" apps. "Elke club een eigen app, door ons ingediend" botst
op twee regels en is op schaal onhoudbaar. Slimste route: **één Greenside-app die bij het inloggen de
huisstijl van de club laadt** (de code kan dit al), met een **eigen app in de store als betaalde premium**
voor wie dat wil. Prijs: een basismodel plus een **high-ticket koopvariant** (eenmalig bedrag + kleine
hosting) die de krappe cashflow vroeg oplost.

## 1. De App Store-grens

Controleer de actuele tekst op
[developer.apple.com/.../guidelines](https://developer.apple.com/app-store/review/guidelines) — handhaving wisselt.

- **4.2.6:** template-/generator-apps worden geweigerd **tenzij de contenteigenaar ze zelf indient** —
  dus elke club onder haar **eigen** Apple-account, niet wij
  ([appinstitute](https://appinstitute.com/apple-app-store-guidelines/), [apptooltester](https://apptooltester.com/app-store-rejecting-app-maker-apps-guideline-4-2-6/)).
- **4.3(a) spam:** zelfs dan worden apps die alleen in logo/naam verschillen geweigerd
  ([Apple-forum](https://developer.apple.com/forums/thread/712614)). Wél toegestaan: één "picker"-app die alle clubs host.
- **Google Play:** soepeler, zelden de bottleneck.

Gevolg: het aantal store-inzendingen is de grootste kostenpost en het grootste tijdrisico. 15 eigen apps = 15 reviews per update.

## 2. Distributiemodellen

| Model | Inzendingen | Goedkeuringsrisico | Update-last | "Eigen app" | Oordeel |
|---|---|---|---|---|---|
| A — eigen app per club, **door ons** | 1 p/club | **Hoog** (4.2.6) | Zeer hoog | Max | ✗ |
| A′ — eigen app per club, **door de club** | 1 p/club | Midden (4.3) | Hoog | Max | △ premium |
| B — **één app**, club bij inloggen | 1 totaal | **Laag** | Laag | Beperkt | ✓ basis |
| C — PWA/webapp | 0 | Geen | Direct | Zwak | △ vangnet |
| **D — hybride (B + A′)** | 1 + enkele | Laag | Laag | Schaalbaar | ✓✓ |

**Aanbevolen: D.** Lanceer met één Greenside-app in volle clubhuisstijl (B), PWA als vangnet (C), en de
eigen app in de store (A′, onder het account van de club) als betaalde premium. Nieuwe kernbelofte:
*"uw club in uw huisstijl, in één veilige app — en een eigen store-app wanneer u dat wilt."*

## 3. Prijsmodellen

Klant = vereniging met jaarbegroting en ALV; voorkeur voor vaste, voorspelbare bedragen. Bedragen excl. btw.

| Model | Kort | Past? |
|---|---|---|
| **1. Per lid/maand, vast jaarbedrag** (huidig) | prijs × NGF-leden, gestaffeld | ✓✓ voorspelbaar, schaalt |
| 2. Vaste prijs per club | één bedrag ongeacht grootte | △ oneerlijk aan de randen |
| 3. Staffel S/M/L | prijsbanden per ledenschijf | ✓ simpel + eerlijk |
| **4. High-ticket: eenmalig + hosting** | ~€2.500 eenmalig + kleine maandfee (als een website) | ✓✓ cash nú |
| 5. "Vervang uw systeem" | prijs ≈ huidig clubsysteem, app erbovenop | ✓✓ sterkste verhaal |
| 6. Eigen-app-premium | meerprijs voor model A′ | ✓ past bij hybride |
| 7. Jaarlijks vooruit, −10% | prepay = korting | ✓ cashflow |
| Freemium / transactie / commissie / per actief lid / modules | — | ✗/△ variabel, clubs willen dat niet |

### Het high-ticket-model uitgewerkt (nieuw)

Verkoop de app zoals een bureau een website verkoopt: **een eenmalig bedrag vooraf, plus een kleine
maandfee voor hosting en support.**

- **Eenmalig: € 2.500** — bouw/inrichting in clubstijl, import, livegang, training.
- **Maandelijks: € 49** — hosting, onderhoud, support, store-updates (staffel € 25 klein / € 49 / € 75 groot).

| | Jaar 1 | 3 jaar totaal |
|---|---:|---:|
| **High-ticket** (€2.500 + €49/mnd) | € 3.088 | € 4.264 |
| Per lid/maand (18-holes, oprichter €466/mnd) | € 5.592 | € 16.776 |

**Afweging.** High-ticket geeft **meteen cash** (5 clubs × €2.500 = €12.500 — dekt bijna de hele
benodigde €11.181 uit de CFO), en is een makkelijke "ja" voor een club die in projecten/capex denkt: de
ALV keurt het één keer goed. Nadeel: veel lagere terugkerende omzet en lagere lifetime value. De maandfee
móét hosting + support + store-resubmissions dekken, anders verdampt de marge.

**Slimste combinatie:** bied **beide** aan. Per lid/maand als hoofdmodel (terugkerend, hoge LTV), én de
high-ticket koopvariant als alternatief voor wie liever koopt dan abonneert — vooral vroeg ingezet om het
cashgat te dichten. Houd de staffelprijzen voor de abonnementsvariant:

| laag | per lid | min / max p/mnd | vast |
| --- | ---: | --- | --- |
| Pionier | € 0,39 | € 169 / € 539 | 3 jaar |
| Oprichter | € 0,49 | € 189 / € 679 | 2 jaar |
| Normaal | € 0,65 | € 249 / € 899 | — |

Plus: eigen app in de store +€49–99/mnd; 10% korting bij jaarlijks vooruit.

## 4. SLA's

Bind de niveaus aan de prijslagen; de zaterdagochtend (boekingspiek) mag niet haperen.

| Afspraak | Basis | Premium |
| --- | --- | --- |
| Beschikbaarheid (zakelijke meting) | 99,5% | 99,9% |
| Reactie P1 (boeken/inloggen plat) | < 1 u, 7 dgn | < 30 min |
| Reactie P2 / P3 | < 4 werkuren / < 1 werkdag | < 2 werkuren / < 4 werkuren |
| Zaterdaghulplijn 7–12 u | ✓ | ✓ prioriteit |
| Store-update doorlooptijd | ≤ 5 werkdagen | idem, wij regelen review |
| Datalek-melding (AVG) | < 72 u | < 24 u |
| Back-up herstel (RPO / RTO) | 24 u / 8 u | 1 u / 2 u |
| Export + opzeg (12 mnd, gratis export) | ✓ | ✓ |
| Escrow + IT-partner (continuïteit) | vanaf 3e club | ✓ |

- **Controleerbaar:** een statuspagina met de werkelijke beschikbaarheid.
- **Milde boete:** mis je de beschikbaarheid, dan die maand (deels) terug (bijv. 99,0–99,5% = 10%, < 99,0% = 25%), lager dan de maandprijs — vertrouwen, geen verzekering.
- **Onderhoud:** releases ma–do ná 17:00, nooit in een lanceerweek; gepland onderhoud telt niet mee mits aangekondigd. 99,9% = ~43 min/mnd: alleen in premium beloven en eerlijk meten.

## 5. Samengevat

- **Distributie:** hybride (D) — één app in clubstijl (basis), PWA (vangnet), eigen store-app (premium).
- **Prijs:** per lid/maand gestaffeld als hoofdmodel, **én** een high-ticket koopvariant (€2.500 eenmalig
  + €49/mnd) voor cash en voor capex-denkers; eigen app +€49–99/mnd; −10% bij jaarlijks vooruit.
- **SLA:** twee niveaus, zaterdagpiek en AVG-meldplicht hard, statuspagina + milde boete.

_Grenzen: Apple-regels wisselen — verifieer vóór livegang en laat een jurist naar SLA/boete kijken. De
premium-meerprijs en de high-ticket-fees zijn voorstellen om tegen echte offertes en een echt bestuur te
toetsen. Geen juridisch of fiscaal advies._
