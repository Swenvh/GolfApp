import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert } from 'react-native';
import { formatEuro, invoiceStatusLabel, paymentMethodLabel, type Invoice, type InvoiceLine, type Payment } from '@golfapp/shared';
import { Body, Button, Card, Loading, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

export default function Factuur() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const [paying, setPaying] = useState(false);
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

  const payWithIdeal = async () => {
    setPaying(true);
    const { data: res, error } = await supabase.functions.invoke<{ checkoutUrl: string }>('create-payment', { body: { invoice_id: id } });
    setPaying(false);
    if (error || !res?.checkoutUrl) return Alert.alert('Betalen niet mogelijk', 'Probeer het later opnieuw.');
    await WebBrowser.openBrowserAsync(res.checkoutUrl);
    // De webhook boekt de betaling; ververs na terugkeer
    setTimeout(reload, 1500);
  };

  return (
    <Screen>
      <Card>
        <Body muted>Factuur {invoice.invoice_number}</Body>
        <Title style={{ fontSize: 28 }}>{formatEuro(invoice.total_cents)}</Title>
        <Body>{invoice.description}</Body>
        <Body muted>Datum {formatDate(invoice.issue_date)} · vervalt {formatDate(invoice.due_date)}</Body>
        <Body style={{ fontWeight: '700', color: invoice.status === 'paid' ? t.primary : t.warn }}>{invoiceStatusLabel[invoice.status]}</Body>
      </Card>

      {invoice.status === 'open' && (invoice.collect_by_direct_debit
        ? <Body muted>Dit bedrag wordt automatisch geïncasseerd.</Body>
        : <Button title={`Betaal ${formatEuro(open)} met iDEAL`} onPress={payWithIdeal} loading={paying} />)}

      <SectionHeader>Specificatie</SectionHeader>
      <Card>
        {lines.map((l) => (
          <Row key={l.id} style={{ justifyContent: 'space-between' }}>
            <Body style={{ flex: 1 }}>{Number(l.quantity) !== 1 ? `${Number(l.quantity)}× ` : ''}{l.description}</Body>
            <Body>{formatEuro(l.line_total_cents)}</Body>
          </Row>
        ))}
        {invoice.vat_cents > 0 && (
          <Row style={{ justifyContent: 'space-between' }}><Body muted>BTW</Body><Body muted>{formatEuro(invoice.vat_cents)}</Body></Row>
        )}
      </Card>

      {payments.length > 0 && <SectionHeader>Betalingen</SectionHeader>}
      {payments.map((p) => (
        <Card key={p.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body>{formatDate(p.paid_on)} · {paymentMethodLabel[p.method]}</Body>
            <Body>{formatEuro(p.amount_cents)}</Body>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
