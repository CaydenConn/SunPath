import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Settings, { SettingsValues } from '../components/Settings';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import SafeScreen from '../components/SafeScreen';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'accountSettings';

const DEFAULT_VALUES: SettingsValues = {
  theme: 'system',
  mapType: 'standard',
  routePreference: 'fastest',
  voiceGuidance: true,
  avoidTolls: false,
  avoidHighways: false,
  notifications: { dailySummary: false, severeAlerts: true },
  drivingConditions: { day: true, night: true, rain: true, snow: false },
};


// --- Firestore: Load Settings ---
async function loadUserSettings(uid: string): Promise<SettingsValues> {
  const ref = doc(FIREBASE_DB, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First time → write defaults
    await setDoc(ref, { settings: DEFAULT_VALUES });
    return DEFAULT_VALUES;
  }

  const data = snap.data()?.settings || {};

  // Merge Firestore data with defaults
  return {
    ...DEFAULT_VALUES,
    ...data,
    notifications: {
      ...DEFAULT_VALUES.notifications,
      ...(data.notifications || {})
    },
    drivingConditions: {
      ...DEFAULT_VALUES.drivingConditions,
      ...(data.drivingConditions || {})
    }
  };
}

// --- Firestore: Save Settings ---
async function saveUserSettings(uid: string, values: SettingsValues) {
  const ref = doc(FIREBASE_DB, "users", uid);
  await setDoc(ref, { settings: values }, { merge: true });
}

const SettingsPage: React.FC = () => {
  const systemScheme = useColorScheme();
  const [values, setValues] = useState<SettingsValues>(DEFAULT_VALUES);

  const mergeValues = useCallback(
    (patch: Partial<SettingsValues>) => setValues((prev) => ({ ...prev, ...patch })),
    []
  );

  const mergeNested = useCallback(
    <K extends 'notifications' | 'drivingConditions'>(
      ns: K, 
      patch: Partial<SettingsValues[K]>
    ) => {
      setValues((prev) => ({ 
        ...prev, 
        [ns]: { ...prev[ns], ...patch } 
      }));
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
    const uid = FIREBASE_AUTH.currentUser?.uid;
    if (!uid) return;

    try {
      const loaded = await loadUserSettings(uid);
      setValues(loaded);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    } catch (err) {
      console.log("Failed to load Firestore settings:", err);
    }
    })();
  }, []);

  useEffect(() => {
    (async () => {
    const uid = FIREBASE_AUTH.currentUser?.uid;
    if (!uid) return;

    try {
      // Save both locally and in Firestore
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      await saveUserSettings(uid, values);
    } catch (err) {
      console.log("Failed to save settings:", err);
    }
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
    <SafeScreen style={styles.safe}>
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
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  root: { flex: 1 },
});

export default SettingsPage;