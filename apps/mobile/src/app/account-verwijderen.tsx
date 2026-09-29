import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, ErrorText, Group, ListRow, Screen, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useMember, useSession } from '@/lib/session';
import { colors, space } from '@/lib/theme';

/**
 * Account verwijderen (verplicht voor de App Store en Google Play, en het AVG-recht op
 * verwijdering). Alleen de inlog verdwijnt: het lidmaatschap is van de club.
 */
export default function AccountVerwijderen() {
  const member = useMember();
  const { session, deleteAccount } = useSession();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const remove = async () => {
    setBusy(true);
    setError(undefined);
    const { error } = await deleteAccount();
    setBusy(false);
    if (error) { haptic.warn(); return setError(error); }
    haptic.success();
    router.replace('/login');
  };

  return (
    <Screen
      footer={confirming ? (
        <View style={{ gap: space.sm }}>
          <T variant="small" color={colors.flag} style={{ textAlign: 'center' }}>Weet je het zeker? Dit kun je niet ongedaan maken.</T>
          <Button title="Ja, verwijder mijn account" variant="danger" icon="trash-outline" onPress={remove} loading={busy} />
          <Button title="Annuleren" variant="ghost" onPress={() => setConfirming(false)} />
        </View>
      ) : (
        <Button title="Account verwijderen" variant="danger" onPress={() => setConfirming(true)} />
      )}
    >
      <T style={{ marginTop: space.sm }}>
        Je account voor de app ({session?.user.email}) wordt direct en definitief verwijderd.
      </T>

      <T variant="heading" style={{ marginTop: space.md }}>Wat wordt verwijderd</T>
      <Group>
        <ListRow icon="key-outline" title="Je inlog" subtitle="Je kunt niet meer inloggen met dit account" />
        <ListRow icon="phone-portrait-outline" title="Je gegevens in de app" subtitle="Op alle toestellen word je uitgelogd" last />
      </Group>

      <T variant="heading" style={{ marginTop: space.md }}>Wat blijft</T>
      <Group>
        <ListRow icon="ribbon-outline" title={`Je lidmaatschap bij ${member.club.name}`}
          subtitle="Opzeggen doe je bij de ledenadministratie van de club" />
        <ListRow icon="receipt-outline" title="Facturen en betalingen" subtitle="De wet verplicht de club deze 7 jaar te bewaren" last />
      </Group>

      <ErrorText message={error} />
      <T variant="small" color={colors.mist}>
        Log je later opnieuw in met hetzelfde e-mailadres, dan koppelt de app je weer aan je lidmaatschap.
      </T>
      {/* Ruimte voor de hogere knoppenbalk tijdens het bevestigen */}
      {confirming && <View style={{ height: 96 }} />}
    </Screen>
  );
}
