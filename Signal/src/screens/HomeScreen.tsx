import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemedText } from '../components/ThemedText';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme/typography';
import { Mic, ShieldCheck, Clock } from 'lucide-react-native';

const MOCK_RECENTS = [
    { id: '1', title: 'Prepare Q3 Report', status: 'Processed', date: '2 mins ago' },
    { id: '2', title: 'Coffee with Sarah', status: 'Processed', date: '1 hour ago' },
    { id: '3', title: 'Buy groceries', status: 'Pending', date: '3 hours ago' },
];

export default function HomeScreen({ navigation }: any) {
    const { colors } = useTheme();

    const renderItem = ({ item }: any) => (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <ThemedText variant="body" style={styles.cardTitle}>{item.title}</ThemedText>
                <ThemedText variant="caption" color={item.status === 'Processed' ? colors.success : colors.warning}>
                    {item.status}
                </ThemedText>
            </View>
            <View style={styles.cardFooter}>
                <Clock size={12} color={colors.textSecondary} />
                <ThemedText variant="caption" color={colors.textSecondary} style={styles.date}>
                    {item.date}
                </ThemedText>
            </View>
        </Card>
    );

    return (
        <ScreenContainer>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText variant="headingLarge" style={{ fontWeight: '800' }}>Signal</ThemedText>
                <View style={styles.privacyBadge}>
                    <ShieldCheck size={16} color={colors.success} />
                    <ThemedText variant="caption" style={styles.privacyText}>Private</ThemedText>
                </View>
            </View>

            {/* Main Action */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.recordButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                    onPress={() => navigation.navigate('Recording')}
                    activeOpacity={0.8}
                >
                    <Mic size={48} color="#FFFFFF" />
                </TouchableOpacity>
                <ThemedText variant="body" style={styles.actionText}>
                    Tap to capture decision
                </ThemedText>
            </View>

            {/* Recent Captures */}
            <View style={styles.listContainer}>
                <ThemedText variant="headingMedium" style={styles.sectionTitle}>Recent</ThemedText>
                <FlatList
                    data={MOCK_RECENTS}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.m,
    },
    privacyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        opacity: 0.8,
    },
    privacyText: {
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 10,
    },
    actionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.xl,
    },
    recordButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: Spacing.m,
    },
    actionText: {
        opacity: 0.7,
    },
    listContainer: {
        flex: 1,
    },
    sectionTitle: {
        marginBottom: Spacing.m,
    },
    listContent: {
        paddingBottom: Spacing.l,
    },
    card: {
        marginBottom: Spacing.s,
        padding: Spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.s,
    },
    cardTitle: {
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    date: {
        marginLeft: 4,
    },
});
