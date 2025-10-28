import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, useColorScheme, Linking, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Settings, { SettingsValues } from '../components/Settings';

const DEFAULT_VALUES: SettingsValues = {
  theme: 'system',
  units: 'metric',
  notifications: {
    dailySummary: false,
    severeAlerts: true,
  },
};

const SettingsPage: React.FC = () => {
  const systemScheme = useColorScheme();
  const [values, setValues] = useState<SettingsValues>(DEFAULT_VALUES);

  const handleChange = useCallback((patch: Partial<SettingsValues>) => {
    setValues((prev) => ({
      ...prev,
      ...patch,
      // Deep-merge notifications so other switches don't reset
      notifications: patch.notifications
        ? { ...prev.notifications, ...patch.notifications }
        : prev.notifications,
    }));
  }, []);

  const onOpenSystemSettings = useCallback(async () => {
    try {
      // openSettings resolves if successful (no boolean returned)
      await Linking.openSettings();
    } catch (e) {
      Alert.alert('Unable to open settings', 'Please open system settings manually.');
    }
  }, []);

  const onAboutPress = useCallback(() => {
    // Replace with your navigation if you have an About screen:
    // navigation.navigate('About');
    Alert.alert('About SunPath', 'Version info, licenses, and credits.');
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('settings');
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<SettingsValues>;
          setValues((prev) => ({
            ...prev,
            ...parsed,
            notifications: { ...prev.notifications, ...(parsed.notifications ?? {}) },
          }));
        }
      } catch { /* noop */ }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('settings', JSON.stringify(values));
      } catch { /* noop */ }
    })();
  }, [values]);

  // If you later persist settings, you can hydrate here and call setValues.
  // useEffect(() => { load from storage }, []);
  // useEffect(() => { save to storage when values change }, [values]);

  const contentContainerStyle = useMemo(() => ({ paddingBottom: 32 }), []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <Settings
          values={values}
          onChange={handleChange}
          onOpenSystemSettings={onOpenSystemSettings}
          onAboutPress={onAboutPress}
          contentContainerStyle={contentContainerStyle}
          colorScheme={systemScheme}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  root: {
    flex: 1,
  },
});

export default SettingsPage;