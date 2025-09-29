import { View, Text, Button } from 'react-native';
import React from 'react';
import { FIREBASE_AUTH } from '../FirebaseConfig';


const LoggedIn = ({ navigation }) => {
    return (
        <View>
            <Button title="Log out" onPress={()=> FIREBASE_AUTH.signOut()} />
        </View>
    )
}

export default LoggedIn