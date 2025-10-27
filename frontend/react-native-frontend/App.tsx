import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth'
import { FIREBASE_AUTH } from './FirebaseConfig'

import Login from './src/screens/Login'
import MainPage from './src/screens/MainPage'

type RootStackParam = {
  Login: undefined;
  Inside: undefined;
};

type InsideStackParam = {
  MainPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParam>();
const InsideStack = createNativeStackNavigator<InsideStackParam>();

function InsideLayout() {
  return (
    <InsideStack.Navigator screenOptions={{ headerShown: false }}>
      <InsideStack.Screen name="MainPage" component={MainPage}/>
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
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        {user ? (
          <Stack.Screen name='Inside' component={InsideLayout} options={{ headerShown: false }}/>
        ) : (
          <Stack.Screen name='Login' component={Login} options={{ headerShown: false }}/>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


