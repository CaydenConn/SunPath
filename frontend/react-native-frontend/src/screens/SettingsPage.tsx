import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, SafeAreaView, StyleSheet, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Settings, { SettingsValues } from '../components/Settings';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

const STORAGE_KEY = 'accountSettings';

const DEFAULT_VALUES: SettingsValues = {
  theme: 'system',
  units: 'metric',
  mapType: 'standard',
  routePreference: 'fastest',
  voiceGuidance: true,
  avoidTolls: false,
  avoidHighways: false,
  notifications: { dailySummary: false, severeAlerts: true },
};

const SettingsPage: React.FC = () => {
  const systemScheme = useColorScheme();
  const [values, setValues] = useState<SettingsValues>(DEFAULT_VALUES);

  const mergeValues = useCallback(
    (patch: Partial<SettingsValues>) => setValues((prev) => ({ ...prev, ...patch })),
    []
  );

  const mergeNested = useCallback(
    (_ns: 'notifications', patch: Partial<SettingsValues['notifications']>) => {
      setValues((prev) => ({ ...prev, notifications: { ...prev.notifications, ...patch } }));
    },
    []
  );

  const onOpenSystemSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert('Unable to open settings', 'Please open system settings manually.');
    }
  }, []);

  const onAbout = useCallback(() => {
    Alert.alert('About SunPath', 'Version info, licenses, and credits.');
  }, []);

  const onEditProfile = useCallback(() => {
    Alert.alert('Edit profile', 'Navigate to a profile editing screen.');
  }, []);

  const onChangePhoto = useCallback(() => {
    Alert.alert('Change photo', 'Open image picker and upload to storage.');
  }, []);

  const onResetPassword = useCallback(async () => {
    const email = FIREBASE_AUTH.currentUser?.email;
    if (!email) {
      Alert.alert('No email', 'Cannot send password reset email.');
      return;
    }
    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      Alert.alert('Email sent', 'Check your inbox to reset your password.');
    } catch {
      Alert.alert('Error', 'Failed to send reset email.');
    }
  }, []);

  const onSignOut = useCallback(async () => {
    try {
      await FIREBASE_AUTH.signOut();
    } catch {
      Alert.alert('Sign out failed', 'Please try again.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<SettingsValues>;
          setValues((prev) => ({
            ...prev,
            ...parsed,
            notifications: { ...prev.notifications, ...(parsed.notifications ?? {}) },
          }));
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch {}
    })();
  }, [values]);

  const user = FIREBASE_AUTH.currentUser;
  const profile = {
    displayName: user?.displayName,
    email: user?.email,
    photoURL: user?.photoURL,
  };

  const contentContainerStyle = useMemo(() => ({ paddingBottom: 40 }), []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <Settings
          values={values}
          profile={profile}
          onChange={mergeValues}
          onChangeNested={mergeNested}
          onEditProfile={onEditProfile}
          onChangePhoto={onChangePhoto}
          onResetPassword={onResetPassword}
          onSignOut={onSignOut}
          onAbout={onAbout}
          onOpenSystemSettings={onOpenSystemSettings}
          contentContainerStyle={contentContainerStyle}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  root: { flex: 1 },
});

export default SettingsPage;