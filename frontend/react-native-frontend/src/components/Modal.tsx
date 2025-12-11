import { Modal as RNModal, ModalProps as RNModalProps, View, StyleSheet, KeyboardAvoidingView} from 'react-native'
import { useTheme } from '../../styles/ThemeContext';

type ModalProps = RNModalProps & {
    isVisible: boolean;
    withInput?: boolean;
}

export const Modal = ({isVisible, withInput, children, ...props}: ModalProps) => {
    const { theme, colorScheme } = useTheme();
    const styles = createStyles(theme);
    const content = withInput 
        ? (
            <KeyboardAvoidingView style={styles.contentView}>
                {children}
            </KeyboardAvoidingView>
        ) : (
            <View style={styles.contentView}>{children}</View>
        );
    return (
        <RNModal
        visible={isVisible}
        transparent
        animationType='none'
        statusBarTranslucent
        {...props}
        >
            {content}
        </RNModal>
    )
}
const createStyles = (theme : any) => 
    StyleSheet.create({
    contentView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 35,
    }
});