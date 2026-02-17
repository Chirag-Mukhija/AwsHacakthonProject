import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemedText } from '../components/ThemedText';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/typography';
import { CheckCircle2, Clock } from 'lucide-react-native';

const MOCK_HISTORY = [
    { id: '1', title: 'Prepare Q3 Report', date: 'Today, 2 mins ago', items: 3 },
    { id: '2', title: 'Coffee with Sarah', date: 'Today, 10:00 AM', items: 1 },
    { id: '3', title: 'Grocery Run', date: 'Yesterday', items: 5 },
    { id: '4', title: 'Project Kickoff', date: 'Yesterday', items: 2 },
    { id: '5', title: 'Weekend Plans', date: 'Mon, Oct 12', items: 4 },
];

export default function HistoryScreen() {
    const { colors } = useTheme();

    const renderItem = ({ item }: any) => (
        <Card style={[styles.card, { borderBottomColor: colors.border }]} variant="flat">
            <View style={styles.cardHeader}>
                <ThemedText variant="headingMedium" style={styles.cardTitle}>{item.title}</ThemedText>
                <CheckCircle2 size={16} color={colors.success} />
            </View>
            <View style={styles.cardFooter}>
                <Clock size={14} color={colors.textSecondary} />
                <ThemedText variant="caption" color={colors.textSecondary} style={styles.date}>
                    {item.date} • {item.items} Action Items
                </ThemedText>
            </View>
        </Card>
    );

    return (
        <ScreenContainer>
            <ThemedText variant="headingLarge" style={styles.header}>
                History
            </ThemedText>
            <FlatList
                data={MOCK_HISTORY}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.l,
    },
    listContent: {
        paddingBottom: Spacing.l,
    },
    card: {
        marginBottom: Spacing.s,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderRadius: 0,
        paddingHorizontal: 0,
        shadowOpacity: 0,
        elevation: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    date: {
        fontWeight: '500',
    },
});
