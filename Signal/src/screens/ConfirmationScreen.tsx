import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemedText } from '../components/ThemedText';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { ToggleItem } from '../components/ToggleItem';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme/typography';
import { Calendar, CheckSquare, Clock, Brain } from 'lucide-react-native';

export default function ConfirmationScreen({ navigation, route }: any) {
    const { colors } = useTheme();

    // Get data passed from ProcessingScreen
    const { data } = route.params || {};

    // Mock extracted data fallback
    const initialTasks = data?.tasks?.map((t: any, i: number) => ({ id: `t-${i}`, title: t.title, active: true })) || [];
    const initialEvents = data?.calendarEvents?.map((e: any, i: number) => ({ id: `e-${i}`, title: e.title, time: e.time || 'All Day', date: e.date, active: true })) || [];
    const initialDecisions = data?.decisions?.map((d: string, i: number) => ({ id: `d-${i}`, title: d, active: true })) || [];

    const [tasks, setTasks] = useState(initialTasks);
    const [events, setEvents] = useState(initialEvents);
    const [decisions, setDecisions] = useState(initialDecisions);

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedText variant="headingLarge" style={styles.title}>
                    Review
                </ThemedText>

                {/* Tasks Section */}
                {tasks.length > 0 && (
                    <>
                        <SectionHeader title="Tasks" />
                        {tasks.map((task: any, index: number) => (
                            <Card key={task.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <CheckSquare size={20} color={colors.primary} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        value={task.title}
                                        onChangeText={(text) => {
                                            setTasks((prev: any[]) => prev.map((t, i) => i === index ? { ...t, title: text } : t));
                                        }}
                                    />
                                </View>
                                <ToggleItem
                                    label="Create Task"
                                    value={task.active}
                                    onValueChange={(val) => {
                                        setTasks((prev: any[]) => prev.map((t, i) => i === index ? { ...t, active: val } : t));
                                    }}
                                />
                            </Card>
                        ))}
                    </>
                )}

                {/* Events Section */}
                {events.length > 0 && (
                    <>
                        <SectionHeader title="Calendar Events" />
                        {events.map((event: any, index: number) => (
                            <Card key={event.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Calendar size={20} color={colors.accent} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        value={event.title}
                                        onChangeText={(text) => {
                                            setEvents((prev: any[]) => prev.map((e, i) => i === index ? { ...e, title: text } : e));
                                        }}
                                    />
                                </View>
                                <View style={styles.timeRow}>
                                    <Clock size={16} color={colors.textSecondary} />
                                    <ThemedText variant="body" color={colors.textSecondary} style={{ marginLeft: 6 }}>
                                        {event.date} {event.time !== 'All Day' ? `at ${event.time}` : ''}
                                    </ThemedText>
                                </View>
                                <ToggleItem
                                    label="Add to Calendar"
                                    value={event.active}
                                    onValueChange={(val) => {
                                        setEvents((prev: any[]) => prev.map((e, i) => i === index ? { ...e, active: val } : e));
                                    }}
                                />
                            </Card>
                        ))}
                    </>
                )}

                {/* Decisions Section - New! */}
                {decisions.length > 0 && (
                    <>
                        <SectionHeader title="Decisions" />
                        {decisions.map((decision: any, index: number) => (
                            <Card key={decision.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Brain size={20} color={colors.warning} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        value={decision.title}
                                        multiline
                                        onChangeText={(text) => {
                                            setDecisions((prev: any[]) => prev.map((d, i) => i === index ? { ...d, title: text } : d));
                                        }}
                                    />
                                </View>
                                <ToggleItem
                                    label="Save Decision"
                                    value={decision.active}
                                    onValueChange={(val) => {
                                        setDecisions((prev: any[]) => prev.map((d, i) => i === index ? { ...d, active: val } : d));
                                    }}
                                />
                            </Card>
                        ))}
                    </>
                )}

                <View style={styles.actions}>
                    <PrimaryButton
                        label="Confirm & Execute"
                        onPress={() => {
                            // Here we would send the confirmed items to backend/storage
                            // For MVP, just pop to top
                            navigation.popToTop();
                        }}
                        style={styles.primaryButton}
                    />
                    <SecondaryButton
                        label="Discard"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.m,
    },
    card: {
        padding: Spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.s,
        gap: Spacing.s,
    },
    input: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        paddingVertical: 0,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.s,
        marginTop: 4,
    },
    actions: {
        marginTop: Spacing.xl,
        gap: Spacing.m,
    },
    primaryButton: {
        marginBottom: Spacing.s,
    },
});
