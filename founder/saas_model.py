# Greenside — vertical-SaaS-model met abonnement + onboarding + betaalmarge. Alle bedragen in euro's.
seg = {'9h':0.25, '18h':0.55, '27h':0.20}          # segmentverdeling (NGF-markt)
sub = {'9h':129, '18h':199, '27h':299}             # abonnement per maand
onb = {'9h':1500, '18h':2000, '27h':2500}           # FLINKE onboarding eenmalig (op platform krijgen)
flow= {'9h':180000, '18h':320000, '27h':500000}    # jaarlijks betaalverkeer door de app (schatting, bij volle adoptie)
pay_net = 0.006                                     # netto betaalmarge (1% geheven - ~0,4% PSP)

blend = lambda d: sum(seg[s]*d[s] for s in seg)
sub_b  = blend(sub)
onb_b  = blend(onb)
pay_b  = blend({s: flow[s]*pay_net/12 for s in seg})   # betaalmarge per club per maand (volle adoptie)

# Variabele kosten per club per maand
var = 12 + 18 + 0.5 + 5     # hosting 12, support 18, SEPA 0,5, overlap/pilot-reserve 5
print(f"Blended abonnement:        EUR {sub_b:6.0f} /mnd")
print(f"Blended onboarding (1x):   EUR {onb_b:6.0f}")
print(f"Blended betaalmarge (vol): EUR {pay_b:6.0f} /mnd")
print(f"Variabele kosten/club:     EUR {var:6.1f} /mnd")

contr_no  = sub_b - var
contr_pay = sub_b + pay_b - var
print(f"\nBijdrage per club/maand  — zonder betalingen: EUR {contr_no:6.0f}")
print(f"Bijdrage per club/maand  — met betalingen:    EUR {contr_pay:6.0f}")

# Vaste kosten
fix_nosal = 326           # zonder salaris (uit numbers.json)
fix_sal   = 398 + 5000    # met 2x2500 salaris + Expo Production i.p.v. Starter
print(f"\nVaste kosten/mnd — jaar 1 (geen salaris): EUR {fix_nosal}")
print(f"Vaste kosten/mnd — met salaris:           EUR {fix_sal}")

be = lambda fix, c: fix/c
print(f"\nBreak-even clubs (geen salaris):  zonder bet. {be(fix_nosal,contr_no):4.1f} | met bet. {be(fix_nosal,contr_pay):4.1f}")
print(f"Break-even clubs (met salaris):   zonder bet. {be(fix_sal,contr_no):4.1f} | met bet. {be(fix_sal,contr_pay):4.1f}")

# CLV: 8 jaar, 85% brutomarge
gm=0.85; life=8
clv_no  = onb_b*gm + 12*life*sub_b*gm
clv_pay = onb_b*gm + 12*life*(sub_b+pay_b)*gm
print(f"\nCLV (8 jr, 85% marge) — zonder betalingen: EUR {clv_no:7.0f}")
print(f"CLV (8 jr, 85% marge) — met betalingen:    EUR {clv_pay:7.0f}")
cac=1000
print(f"LTV:CAC (CAC EUR {cac})            — zonder: {clv_no/cac:4.1f}:1 | met: {clv_pay/cac:4.1f}:1")

# Jaar 1 maand-voor-maand. Zwolle betaalt vanaf mnd 1. Conservatieve aanloop: +1 club/mnd.
# Betaalmarge bouwt op (adoptie): club bereikt 50% van volle betaalmarge gemiddeld in jaar 1.
newclub = [1,1,1,1,1,1,0,1,1,0,1,1]   # nieuwe clubs per maand (conservatief, ~9 eind jaar 1)
startup = 2500+7500+300+23+100        # 10.423
cash = -startup
active=0; rev_sub=rev_onb=rev_pay=cost_tot=0
print("\nmnd | clubs | abonnement | onboarding | betaalmarge | vaste+var | resultaat | cash")
for m in range(12):
    active += newclub[m]
    s = active*sub_b
    o = newclub[m]*onb_b
    p = active*pay_b*0.5          # halve adoptie in jaar 1
    c = fix_nosal + active*var
    res = s+o+p-c
    cash += res
    rev_sub+=s; rev_onb+=o; rev_pay+=p; cost_tot+=c
    print(f"{m+1:3d} | {active:5d} | {s:9.0f} | {o:9.0f} | {p:10.0f} | {c:8.0f} | {res:8.0f} | {cash:8.0f}")
print(f"\nJaar 1 omzet: abonnement EUR {rev_sub:.0f} + onboarding EUR {rev_onb:.0f} + betaalmarge EUR {rev_pay:.0f} = EUR {rev_sub+rev_onb+rev_pay:.0f}")
print(f"Jaar 1 resultaat (geen salaris): EUR {rev_sub+rev_onb+rev_pay-cost_tot:.0f}")
print(f"Benodigd geld (diepste cashpunt, incl. startkosten EUR {startup}): EUR {-min_cash if (min_cash:=min([-startup])) else 0:.0f}")

# cash-dieptepunt opnieuw, netjes
cash=-startup; trough=cash; active=0
for m in range(12):
    active+=newclub[m]
    res = active*sub_b + newclub[m]*onb_b + active*pay_b*0.5 - (fix_nosal+active*var)
    cash+=res; trough=min(trough,cash)
print(f"Diepste cashpunt: EUR {trough:.0f}  -> benodigd geld ~ EUR {-trough:.0f}")
print(f"Cash eind jaar 1: EUR {cash:.0f}")

# Clubs voor vol salaris
print(f"\nClubs voor vol salaris (EUR {fix_sal}/mnd): zonder bet. {be(fix_sal,contr_no):.0f} | met bet. {be(fix_sal,contr_pay):.0f}")

# Gevoeligheid
print("\n--- Gevoeligheid (break-even clubs met salaris, met betalingen) ---")
for label, cp in [("basis", contr_pay),
                  ("abonnement -20%", sub_b*0.8+pay_b-var),
                  ("betaalmarge halveren", sub_b+pay_b*0.5-var),
                  ("geen betaalmarge", contr_no),
                  ("abonnement +25%", sub_b*1.25+pay_b-var)]:
    print(f"{label:22s}: bijdrage EUR {cp:4.0f}/club -> {be(fix_sal,cp):4.1f} clubs")
