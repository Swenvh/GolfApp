import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatEuro, invoiceStatusLabel, paymentMethodLabel, type Invoice, type InvoiceLine, type Payment } from '@golfapp/shared';
import { Perforation } from '@/components/brand';
import { Button, ErrorText, Eyebrow, Loading, Pill, Row, Screen, T } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, shadow, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

export default function Factuur() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = useMember();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string>();
  const { data, loading, reload } = useQuery(async () => {
    const [inv, lines, payments] = await Promise.all([
      supabase.from('invoices').select('*').eq('id', id).single(),
      supabase.from('invoice_lines').select('*').eq('invoice_id', id).order('position'),
      supabase.from('payments').select('*').eq('invoice_id', id).order('paid_on'),
    ]);
    return { invoice: unwrap(inv) as Invoice, lines: unwrap(lines) as InvoiceLine[], payments: unwrap(payments) as Payment[] };
  }, [id]);

  if (loading || !data) return <Loading />;
  const { invoice, lines, payments } = data;
  const open = invoice.total_cents - invoice.paid_cents;
  const canPay = invoice.status === 'open' && !invoice.collect_by_direct_debit;

  const payWithIdeal = async () => {
    setPaying(true);
    setError(undefined);
    const { data: res, error } = await supabase.functions.invoke<{ checkoutUrl: string }>('create-payment', { body: { invoice_id: id } });
    setPaying(false);
    if (error || !res?.checkoutUrl) return setError('Online betalen lukt nu niet. Probeer het later opnieuw of maak het bedrag over.');
    await WebBrowser.openBrowserAsync(res.checkoutUrl);
    setTimeout(reload, 1500);
  };

  return (
    <Screen footer={canPay ? <Button title={`Betaal ${formatEuro(open)} met iDEAL`} icon="lock-closed" onPress={payWithIdeal} loading={paying} /> : undefined}>
      <View style={[styles.receipt, shadow]}>
        <View style={{ padding: space.xl, gap: space.sm, alignItems: 'center' }}>
          <Eyebrow color={colors.slate}>{member.club.name}</Eyebrow>
          <Text style={styles.amount}>{formatEuro(invoice.total_cents)}</Text>
          <T color={colors.slate} style={{ textAlign: 'center' }}>{invoice.description}</T>
          <Pill
            label={invoice.status === 'open' && invoice.collect_by_direct_debit ? 'Wordt geïncasseerd' : invoiceStatusLabel[invoice.status]}
            tone={invoice.status === 'paid' ? 'pine' : invoice.status === 'open' ? 'brass' : 'neutral'}
            icon={invoice.status === 'paid' ? 'checkmark' : undefined}
            style={{ alignSelf: 'center' }}
          />
        </View>
        <Perforation />
        <View style={{ padding: space.xl, gap: space.md }}>
          <Meta label="Factuurnummer" value={invoice.invoice_number ?? '—'} />
          <Meta label="Factuurdatum" value={formatDate(invoice.issue_date, { day: 'numeric', month: 'long', year: 'numeric' })} />
          <Meta label="Vervaldatum" value={formatDate(invoice.due_date, { day: 'numeric', month: 'long', year: 'numeric' })} />
          <View style={styles.rule} />
          {lines.map((l) => (
            <Row key={l.id} style={{ alignItems: 'flex-start' }}>
              <T style={{ flex: 1 }}>{Number(l.quantity) !== 1 ? `${Number(l.quantity).toLocaleString('nl-NL')} × ` : ''}{l.description}</T>
              <T variant="bodyStrong">{formatEuro(l.line_total_cents)}</T>
            </Row>
          ))}
          {invoice.vat_cents > 0 && <Meta label="BTW" value={formatEuro(invoice.vat_cents)} />}
          <View style={styles.rule} />
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="subheading">Totaal</T>
            <Text style={styles.total}>{formatEuro(invoice.total_cents)}</Text>
          </Row>
          {payments.map((p) => (
            <Row key={p.id} style={{ justifyContent: 'space-between' }}>
              <Row gap={6}>
                <Ionicons name="checkmark-circle" size={16} color={colors.pine600} />
                <T variant="small" color={colors.slate}>{paymentMethodLabel[p.method]} · {formatDate(p.paid_on, { day: 'numeric', month: 'short' })}</T>
              </Row>
              <T variant="small" color={colors.pine700}>− {formatEuro(p.amount_cents)}</T>
            </Row>
          ))}
          {invoice.status === 'open' && invoice.paid_cents > 0 && (
            <Row style={{ justifyContent: 'space-between' }}>
              <T variant="bodyStrong">Nog te betalen</T>
              <T variant="bodyStrong" color={colors.flag}>{formatEuro(open)}</T>
            </Row>
          )}
        </View>
      </View>
      <ErrorText message={error} />
      {invoice.status === 'open' && invoice.collect_by_direct_debit && (
        <T variant="small" color={colors.slate} style={{ textAlign: 'center' }}>Dit bedrag wordt automatisch afgeschreven via je SEPA-machtiging.</T>
      )}
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <T variant="small" color={colors.slate}>{label}</T>
      <T variant="small" style={{ fontFamily: fonts.bodySemibold }}>{value}</T>
    </Row>
  );
}

const styles = StyleSheet.create({
  receipt: { backgroundColor: colors.paper, borderRadius: radius.lg, marginTop: space.md },
  amount: { fontFamily: fonts.display, fontSize: 48, color: colors.ink, letterSpacing: -1.2 },
  total: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
});
