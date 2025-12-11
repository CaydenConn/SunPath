import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView} from 'react-native';
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { API_BASE_URL } from '@env';

const Login : React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const auth = FIREBASE_AUTH;

    const signIn = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    const signUp = async (): Promise<void> => {
        setLoading(true);
        try {
            // Step 1: Create Firebase Auth user
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Firebase Auth user created:', response.user.uid);
            
            // Step 2: Get ID token
            const idToken = await response.user.getIdToken();
            console.log('Got ID token');
            
            // Step 3: Create user profile in Firestore via backend
            const createProfileResponse = await fetch(`${API_BASE_URL}/api/users/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });
            
            const profileData = await createProfileResponse.json();
            console.log('User profile created:', profileData);
            
            if (createProfileResponse.ok) {
                alert('Account created successfully!');
            } else {
                console.error('Profile creation failed:', profileData);
                alert('Account created but profile setup failed. Please contact support.');
            }
            
        } catch (error: any) {
            console.log(error);
            alert('Sign up failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput value={email} style={styles.input} placeholder="Email" autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput> 
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Password" autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput> 
                { loading ? ( 
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <Button title="Login" onPress={signIn} />
                        <Button title="Create Account" onPress={signUp} />
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff'
    }
});