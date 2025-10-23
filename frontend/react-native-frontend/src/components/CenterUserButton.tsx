import React from 'react';
import { StyleSheet, TouchableOpacity, Text, GestureResponderEvent } from 'react-native';

type CenterButtonProps = {
  onPress: (event: GestureResponderEvent) => void;
};

export default function CenterButton({ onPress }: CenterButtonProps) {
    return (
        <TouchableOpacity 
            activeOpacity={0.75}
            style={styles.centerUserButton} 
            onPress={onPress}
        >
            <Text style={styles.centerUserButtonText}>📍</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    centerUserButton: {
        position: 'absolute',
        bottom: 180,
        right: 20,
        backgroundColor: '#4CAF50',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    centerUserButtonText: {
        fontSize: 24,
    },
});