/**
 * EXAMPLE: Updated Login.tsx with User Profile Integration
 * 
 * This shows how to integrate the UserService into your existing login flow.
 * Copy the relevant parts into your actual Login.tsx
 */

import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView} from 'react-native';
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { ensureUserProfile } from '../services/UserService'; // NEW IMPORT

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
            
            // NEW: Ensure user profile exists in Firestore
            try {
                const profile = await ensureUserProfile(email);
                console.log('User profile loaded:', profile);
            } catch (error) {
                console.error('Failed to load user profile:', error);
                // Don't block login if profile fails
            }
            
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
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            
            // NEW: Create user profile in Firestore
            try {
                const profile = await ensureUserProfile(email);
                console.log('User profile created:', profile);
                alert('Account created successfully!');
            } catch (error) {
                console.error('Failed to create user profile:', error);
                alert('Account created, but profile setup failed. Please try logging in.');
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


/**
 * EXAMPLE: How to use UserService in other components
 */

// Example 1: Add a favorite address when user saves a location
import { addFavoriteAddress } from '../services/UserService';

async function saveLocationAsFavorite() {
    try {
        const favorites = await addFavoriteAddress({
            address: "123 Main St, Tallahassee, FL",
            latitude: 30.4383,
            longitude: -84.2807,
            label: "Home"
        });
        console.log('Updated favorites:', favorites);
        alert('Location saved to favorites!');
    } catch (error) {
        alert('Failed to save favorite');
    }
}

// Example 2: Track navigation when user starts a route
import { trackNavigation } from '../services/UserService';

async function startNavigation(destination: any) {
    // Start the actual navigation...
    
    // Track in recent addresses (don't await, runs in background)
    trackNavigation(
        destination.address,
        destination.latitude,
        destination.longitude,
        destination.name
    );
}

// Example 3: Load and display user's favorites
import { getFavoriteAddresses, Address } from '../services/UserService';

function FavoritesScreen() {
    const [favorites, setFavorites] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadFavorites();
    }, []);
    
    async function loadFavorites() {
        try {
            const favs = await getFavoriteAddresses();
            setFavorites(favs);
        } catch (error) {
            console.error('Failed to load favorites:', error);
        } finally {
            setLoading(false);
        }
    }
    
    // Render favorites list...
}

// Example 4: Load and display recent addresses
import { getRecentAddresses } from '../services/UserService';

function RecentAddressesScreen() {
    const [recent, setRecent] = useState<Address[]>([]);
    
    useEffect(() => {
        loadRecent();
    }, []);
    
    async function loadRecent() {
        try {
            const recentAddrs = await getRecentAddresses();
            setRecent(recentAddrs);
        } catch (error) {
            console.error('Failed to load recent addresses:', error);
        }
    }
    
    // Render recent addresses list...
}

