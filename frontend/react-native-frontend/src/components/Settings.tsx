import React, { useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  StyleSheet,
  ScrollView,
  ViewStyle,
  ColorSchemeName,
} from 'react-native';

export type ThemeOption = 'system' | 'light' | 'dark';
export type UnitsOption = 'metric' | 'imperial';

export interface SettingsValues {
  theme: ThemeOption;
  units: UnitsOption;
  notifications: {
    dailySummary: boolean;
    severeAlerts: boolean;
  };
}

export interface SettingsProps {
  values: SettingsValues;
  onChange: (patch: Partial<SettingsValues>) => void;
  onOpenSystemSettings?: () => void;
  onAboutPress?: () => void;
  contentContainerStyle?: ViewStyle;
  colorScheme?: ColorSchemeName; // optional hint for styling
}

const SECTION_SPACING = 16;

const Settings: React.FC<SettingsProps> = ({
  values,
  onChange,
  onOpenSystemSettings,
  onAboutPress,
  contentContainerStyle,
}) => {
  const setTheme = useCallback(
    (theme: ThemeOption) => onChange({ theme }),
    [onChange]
  );

  const setUnits = useCallback(
    (units: UnitsOption) => onChange({ units }),
    [onChange]
  );

  const setNotification = useCallback(
    (key: keyof SettingsValues['notifications'], val: boolean) => {
      onChange({
        notifications: {
          ...values.notifications,
          [key]: val,
        },
      });
    },
    [onChange, values.notifications]
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.container, contentContainerStyle]}
      bounces
    >
      <Section title="Appearance">
        <Row title="Theme" subtitle="System, Light, or Dark" noRightPadding>
          <Segmented
            options={[
              { key: 'system', label: 'System' },
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
            ]}
            value={values.theme}
            onChange={(v) => setTheme(v as ThemeOption)}
          />
        </Row>
      </Section>

      <Section title="Units">
        <Row title="Measurement Units" subtitle="Metric (°C, m/s) or Imperial (°F, mph)" noRightPadding>
          <Segmented
            options={[
              { key: 'metric', label: 'Metric' },
              { key: 'imperial', label: 'Imperial' },
            ]}
            value={values.units}
            onChange={(v) => setUnits(v as UnitsOption)}
          />
        </Row>
      </Section>

      <Section title="Notifications">
        <Row
          title="Daily summary"
          subtitle="Receive a daily overview"
          right={
            <Switch
              value={values.notifications.dailySummary}
              onValueChange={(v) => setNotification('dailySummary', v)}
            />
          }
        />

        <Row
          title="Severe weather alerts"
          subtitle="Get alerted about severe conditions"
          right={
            <Switch
              value={values.notifications.severeAlerts}
              onValueChange={(v) => setNotification('severeAlerts', v)}
            />
          }
        />
      </Section>

      <Section title="About">
        <Pressable style={styles.linkRow} onPress={onAboutPress}>
          <Text style={styles.linkTitle}>About SunPath</Text>
          <Text style={styles.linkSubtitle}>Version, licenses, and credits</Text>
        </Pressable>

        <Pressable style={styles.linkRow} onPress={onOpenSystemSettings}>
          <Text style={styles.linkTitle}>Open system settings</Text>
          <Text style={styles.linkSubtitle}>Manage app permissions</Text>
        </Pressable>
      </Section>

      <View style={{ height: SECTION_SPACING }} />
    </ScrollView>
  );
};

/**
 - Small building blocks kept in this file for simplicity.
 - You can extract them later if you want finer reuse/testing.
*/

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
};

const Row: React.FC<{
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  noRightPadding?: boolean;
}> = ({ title, subtitle, right, children, noRightPadding }) => {
  return (
    <View style={[styles.row, noRightPadding && { paddingRight: 0 }]}>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {children ? <View style={styles.rowRight}>{children}</View> : null}
      {right ? <View style={styles.rowRight}>{right}</View> : null}
    </View>
  );
};

type SegmentedOption = { key: string; label: string };

const Segmented: React.FC<{
  options: SegmentedOption[];
  value: string;
  onChange: (key: string) => void;
}> = ({ options, value, onChange }) => {
  return (
    <View style={styles.segmented}>
      {options.map((opt, idx) => {
        const selected = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
              idx === 0 && styles.segmentFirst,
              idx === options.length - 1 && styles.segmentLast,
              pressed && !selected && styles.segmentPressed,
            ]}
          >
            <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: SECTION_SPACING,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  linkTitle: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  linkSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  segmentFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentSelected: {
    backgroundColor: '#111827',
  },
  segmentPressed: {
    backgroundColor: '#e5e7eb',
  },
  segmentLabel: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  segmentLabelSelected: {
    color: '#ffffff',
  },
});

export default Settings;