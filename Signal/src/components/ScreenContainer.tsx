import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/typography';

interface ScreenContainerProps extends ViewProps {
    children: React.ReactNode;
    withPadding?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
    children,
    style,
    withPadding = true,
    ...props
}) => {
    const { colors } = useTheme();

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.background },
                withPadding && { paddingHorizontal: Spacing.m },
                style,
            ]}
            {...props}
        >
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
