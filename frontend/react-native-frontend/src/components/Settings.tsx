import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Switch, Image, ViewStyle
} from 'react-native';

export type ThemeOption = 'system' | 'light' | 'dark';
export type UnitsOption = 'metric' | 'imperial';
export type MapTypeOption = 'standard' | 'satellite' | 'terrain';
export type RoutePreference = 'fastest' | 'shortest' | 'scenic';

type InsideStackParam = {
    MainPage: undefined;
    SettingsPage: undefined;
  };
type NavigationProp = NativeStackNavigationProp<InsideStackParam>;
export interface SettingsValues {
  theme: ThemeOption;
  units: UnitsOption;
  mapType: MapTypeOption;
  routePreference: RoutePreference;
  voiceGuidance: boolean;
  avoidTolls: boolean;
  avoidHighways: boolean;
  notifications: {
    dailySummary: boolean;
    severeAlerts: boolean;
  };
}

export interface ProfileInfo {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface SettingsProps {
  values: SettingsValues;
  profile?: ProfileInfo;
  onChange: (patch: Partial<SettingsValues>) => void;
  onChangeNested?: (ns: 'notifications', patch: Partial<SettingsValues['notifications']>) => void;
  onEditProfile?: () => void;
  onChangePhoto?: () => void;
  onResetPassword?: () => void;
  onSignOut?: () => void;
  onAbout?: () => void;
  onOpenSystemSettings?: () => void;
  contentContainerStyle?: ViewStyle;
}

const SECTION_SPACING = 16;



const Settings: React.FC<SettingsProps> = ({
  values,
  profile,
  onChange,
  onChangeNested,
  onEditProfile,
  onChangePhoto,
  onResetPassword,
  onSignOut,
  onAbout,
  onOpenSystemSettings,
  contentContainerStyle,
}) => {
  const set = useCallback(
    (k: keyof SettingsValues, v: any) => onChange({ [k]: v } as Partial<SettingsValues>),
    [onChange]
  );
  const setNotif = useCallback(
    (k: keyof SettingsValues['notifications'], v: boolean) =>
      onChangeNested?.('notifications', { [k]: v }),
    [onChangeNested]
  );
    const navigation = useNavigation<NavigationProp>();
    const backToMainPage = (): void => {
        navigation.navigate('MainPage');
    };
  return (
    <ScrollView contentContainerStyle={[styles.container, contentContainerStyle]}>
      <Section 
      title="Profile"
      rightElement={
        <Pressable onPress={() => backToMainPage()}>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>Back</Text>
        </Pressable>
      }>
        <View style={styles.profileRow}>
          {profile?.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{initials(profile?.displayName || profile?.email)}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.displayName || 'User'}</Text>
            {!!profile?.email && <Text style={styles.email}>{profile.email}</Text>}
          </View>
        </View>
        <RowButtons>
          <MiniButton label="Edit profile" onPress={onEditProfile} />
          <MiniButton label="Change photo" onPress={onChangePhoto} />
          <MiniButton label="Reset password" onPress={onResetPassword} />
        </RowButtons>
      </Section>

      <Section title="Appearance">
        <Row title="Theme" noRightPadding>
          <Segmented
            options={[{ k: 'system', l: 'System' }, { k: 'light', l: 'Light' }, { k: 'dark', l: 'Dark' }]}
            value={values.theme}
            onChange={(v) => set('theme', v)}
          />
        </Row>
      </Section>

      <Section title="Units">
        <Row title="Measurement Units" noRightPadding>
          <Segmented
            options={[{ k: 'metric', l: 'Metric' }, { k: 'imperial', l: 'Imperial' }]}
            value={values.units}
            onChange={(v) => set('units', v)}
          />
        </Row>
      </Section>

      <Section title="Navigation">
        <Row title="Map type" noRightPadding>
          <Segmented
            options={[
              { k: 'standard', l: 'Standard' },
              { k: 'satellite', l: 'Satellite' },
              { k: 'terrain', l: 'Terrain' },
            ]}
            value={values.mapType}
            onChange={(v) => set('mapType', v)}
          />
        </Row>
        <Row title="Route preference" noRightPadding>
          <Segmented
            options={[
              { k: 'fastest', l: 'Fastest' },
              { k: 'shortest', l: 'Shortest' },
              { k: 'scenic', l: 'Scenic' },
            ]}
            value={values.routePreference}
            onChange={(v) => set('routePreference', v)}
          />
        </Row>
        <SwitchRow title="Voice guidance" value={values.voiceGuidance} onValueChange={(v) => set('voiceGuidance', v)} />
        <SwitchRow title="Avoid tolls" value={values.avoidTolls} onValueChange={(v) => set('avoidTolls', v)} />
        <SwitchRow title="Avoid highways" value={values.avoidHighways} onValueChange={(v) => set('avoidHighways', v)} />
      </Section>

      <Section title="Notifications">
        <SwitchRow
          title="Daily summary"
          value={values.notifications.dailySummary}
          onValueChange={(v) => setNotif('dailySummary', v)}
        />
        <SwitchRow
          title="Severe alerts"
          value={values.notifications.severeAlerts}
          onValueChange={(v) => setNotif('severeAlerts', v)}
        />
      </Section>

      <Section title="About / System">
        <ActionRow label="About SunPath" onPress={onAbout} />
        <ActionRow label="Open system settings" onPress={onOpenSystemSettings} />
      </Section>

      <Section title="Account actions">
        <ActionRow label="Sign out" danger onPress={onSignOut} />
      </Section>

      <View style={{ height: SECTION_SPACING }} />
    </ScrollView>
  );
};

const Section: React.FC<{
    title: string;
    children: React.ReactNode;
    rightElement?: React.ReactNode;
    }> = ({ title, rightElement, children }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {rightElement && <View>{rightElement}</View>}
            </View>
            <View style={styles.card}>{children}</View>
        </View>
    );

const Row: React.FC<{ title: string; children?: React.ReactNode; noRightPadding?: boolean }> = ({
  title,
  children,
  noRightPadding,
}) => (
  <View style={[styles.row, noRightPadding && { paddingRight: 0 }]}>
    <Text style={styles.rowTitle}>{title}</Text>
    <View style={styles.rowContent}>{children}</View>
  </View>
);

const SwitchRow: React.FC<{ title: string; value: boolean; onValueChange: (v: boolean) => void }> = ({
  title,
  value,
  onValueChange,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowTitle}>{title}</Text>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const ActionRow: React.FC<{ label: string; onPress?: () => void; danger?: boolean }> = ({ label, onPress, danger }) => (
  <Pressable style={styles.actionRow} onPress={onPress}>
    <Text style={[styles.actionLabel, danger && { color: '#dc2626' }]}>{label}</Text>
  </Pressable>
);

const RowButtons: React.FC<{ children: React.ReactNode }> = ({ children }) => <View style={styles.buttonRow}>{children}</View>;

const MiniButton: React.FC<{ label: string; onPress?: () => void }> = ({ label, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.miniBtn, pressed && styles.miniBtnPressed]}>
    <Text style={styles.miniBtnLabel}>{label}</Text>
  </Pressable>
);

type SegOpt = { k: string; l: string };
const Segmented: React.FC<{ options: SegOpt[]; value: string; onChange: (k: string) => void }> = ({
  options,
  value,
  onChange,
}) => (
  <View style={styles.segmented}>
    {options.map((o, i) => {
      const sel = value === o.k;
      return (
        <Pressable
          key={o.k}
          onPress={() => onChange(o.k)}
          style={({ pressed }) => [
            styles.segment,
            sel && styles.segmentSelected,
            i === 0 && styles.segmentFirst,
            i === options.length - 1 && styles.segmentLast,
            pressed && !sel && styles.segmentPressed,
          ]}
        >
          <Text style={[styles.segmentLabel, sel && styles.segmentLabelSelected]}>{o.l}</Text>
        </Pressable>
      );
    })}
  </View>
);

function initials(text?: string | null) {
  if (!text) return 'U';
  const p = text.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  rowTitle: { fontSize: 15, fontWeight: '500', color: '#111827', flex: 1 },
  rowContent: { flex: 1, alignItems: 'flex-end' },

  profileRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e5e7eb' },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 18, fontWeight: '700', color: '#374151' },
  name: { fontSize: 18, fontWeight: '600', color: '#111827' },
  email: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, paddingTop: 0 },
  miniBtn: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  miniBtnPressed: { backgroundColor: '#e5e7eb' },
  miniBtnLabel: { fontSize: 12, fontWeight: '600', color: '#111827' },

  segmented: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden' },
  segment: { paddingVertical: 8, paddingHorizontal: 12 },
  segmentFirst: { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  segmentLast: { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  segmentSelected: { backgroundColor: '#111827' },
  segmentPressed: { backgroundColor: '#e5e7eb' },
  segmentLabel: { fontSize: 12, fontWeight: '600', color: '#111827' },
  segmentLabelSelected: { color: '#fff' },

  actionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  actionLabel: { fontSize: 15, fontWeight: '500', color: '#2563eb' },
});

export default Settings;