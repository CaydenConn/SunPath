import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth'
import { FIREBASE_AUTH } from './FirebaseConfig'
import 'react-native-get-random-values';

import Login from './src/screens/Login'
import MainPage from './src/screens/MainPage'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './styles/ThemeContext';
import SettingsPage from './src/screens/SettingsPage';
import NavigationPage from './src/screens/NavigationPage';

type RootStackParam = {
  Login: undefined;
  Inside: undefined;
};

type InsideStackParam = {
  MainPage: undefined;
  SettingsPage: undefined;
  NavigationPage: {
    details: any;
    destination: {
        latitude: number,
        longitude: number,
    };
    simplifiedRoute: { 
        latitude: number;
        longitude: number
    }[] | null;
  };
};

const Stack = createNativeStackNavigator<RootStackParam>();
const InsideStack = createNativeStackNavigator<InsideStackParam>();

function InsideLayout() {
  return (
    <InsideStack.Navigator screenOptions={{ headerShown: false }}>
      <InsideStack.Screen name="MainPage" component={MainPage}/>
      <InsideStack.Screen name="SettingsPage" component={SettingsPage}/>
      <InsideStack.Screen name="NavigationPage" component={NavigationPage}/>
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user);
    });
  }, []);
  return (
    <ThemeProvider>
      <GestureHandlerRootView>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <Stack.Screen name='Inside' component={InsideLayout} options={{ headerShown: false }}/>
            ) : (
              <Stack.Screen name='Login' component={Login} options={{ headerShown: false }}/>
              // <Stack.Screen name='NavigationPage' component={NavigationPage} options={{ headerShown: false }}/>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}


