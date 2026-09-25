/**
 * SEPA-incassobestand (pain.008.001.08, CORE) — te uploaden bij de bank
 * (ABN AMRO, ING, Rabobank, ...). Eén PmtInf per sequence type (FRST/RCUR).
 */
import { normalizeIban } from './iban';

export interface SepaCreditor {
  name: string;
  iban: string;
  bic?: string | null;
  creditorId: string; // Incassant-ID, bv. NL00ZZZ401234560000
}

export interface SepaTransaction {
  endToEndId: string;
  amountCents: number;
  mandateId: string;
  mandateSignedOn: string; // YYYY-MM-DD
  sequenceType: 'FRST' | 'RCUR';
  debtorName: string;
  debtorIban: string;
  debtorBic?: string | null;
  description: string;
}

export interface SepaBatch {
  messageId: string;
  createdAt?: Date;
  collectionDate: string; // YYYY-MM-DD
  creditor: SepaCreditor;
  transactions: SepaTransaction[];
}

export function buildSepaDirectDebitXml(batch: SepaBatch): string {
  if (batch.transactions.length === 0) throw new Error('Incassobatch bevat geen transacties');
  const txs = batch.transactions;
  const created = (batch.createdAt ?? new Date()).toISOString().slice(0, 19);
  const groups = (['FRST', 'RCUR'] as const)
    .map((seq) => ({ seq, items: txs.filter((t) => t.sequenceType === seq) }))
    .filter((g) => g.items.length > 0);

  const pmtInf = groups.map(({ seq, items }) => `
    <PmtInf>
      <PmtInfId>${text(`${batch.messageId}-${seq}`, 35)}</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <BtchBookg>true</BtchBookg>
      <NbOfTxs>${items.length}</NbOfTxs>
      <CtrlSum>${amount(sum(items))}</CtrlSum>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
        <LclInstrm><Cd>CORE</Cd></LclInstrm>
        <SeqTp>${seq}</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>${batch.collectionDate}</ReqdColltnDt>
      <Cdtr><Nm>${text(batch.creditor.name, 70)}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>${normalizeIban(batch.creditor.iban)}</IBAN></Id></CdtrAcct>
      <CdtrAgt><FinInstnId>${agent(batch.creditor.bic)}</FinInstnId></CdtrAgt>
      <ChrgBr>SLEV</ChrgBr>
      <CdtrSchmeId><Id><PrvtId><Othr><Id>${text(batch.creditor.creditorId, 35)}</Id><SchmeNm><Prtry>SEPA</Prtry></SchmeNm></Othr></PrvtId></Id></CdtrSchmeId>${items.map((t) => `
      <DrctDbtTxInf>
        <PmtId><EndToEndId>${text(t.endToEndId, 35)}</EndToEndId></PmtId>
        <InstdAmt Ccy="EUR">${amount(t.amountCents)}</InstdAmt>
        <DrctDbtTx><MndtRltdInf><MndtId>${text(t.mandateId, 35)}</MndtId><DtOfSgntr>${t.mandateSignedOn}</DtOfSgntr></MndtRltdInf></DrctDbtTx>
        <DbtrAgt><FinInstnId>${agent(t.debtorBic)}</FinInstnId></DbtrAgt>
        <Dbtr><Nm>${text(t.debtorName, 70)}</Nm></Dbtr>
        <DbtrAcct><Id><IBAN>${normalizeIban(t.debtorIban)}</IBAN></Id></DbtrAcct>
        <RmtInf><Ustrd>${text(t.description, 140)}</Ustrd></RmtInf>
      </DrctDbtTxInf>`).join('')}
    </PmtInf>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.08">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${text(batch.messageId, 35)}</MsgId>
      <CreDtTm>${created}</CreDtTm>
      <NbOfTxs>${txs.length}</NbOfTxs>
      <CtrlSum>${amount(sum(txs))}</CtrlSum>
      <InitgPty><Nm>${text(batch.creditor.name, 70)}</Nm></InitgPty>
    </GrpHdr>${pmtInf}
  </CstmrDrctDbtInitn>
</Document>
`;
}

function sum(txs: SepaTransaction[]): number {
  return txs.reduce((s, t) => s + t.amountCents, 0);
}

function amount(cents: number): string {
  if (!Number.isInteger(cents) || cents <= 0) throw new Error(`Ongeldig incassobedrag: ${cents}`);
  return (cents / 100).toFixed(2);
}

function agent(bic?: string | null): string {
  return bic ? `<BICFI>${text(bic, 11)}</BICFI>` : '<Othr><Id>NOTPROVIDED</Id></Othr>';
}

/** Beperk tot de SEPA-tekenset (Latin basic) en escape voor XML. */
export function sepaText(input: string, maxLength: number): string {
  const ascii = input
    .replace(/[øØæÆœŒßłŁđĐ]/g, (c) => TRANSLITERATE[c] ?? c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9/\-?:().,'+ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
  return ascii.replace(/'/g, '&apos;');
}

const TRANSLITERATE: Record<string, string> = {
  ø: 'o', Ø: 'O', æ: 'ae', Æ: 'AE', œ: 'oe', Œ: 'OE', ß: 'ss', ł: 'l', Ł: 'L', đ: 'd', Đ: 'D',
};

const text = sepaText;
