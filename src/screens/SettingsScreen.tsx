import React from 'react';
import { View, StyleSheet, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Globe, Info, ChevronRight } from 'lucide-react-native';

export const SettingsScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Typography variant="h2">Settings</Typography>
      </View>

      <View style={styles.content}>
        <Typography variant="h3" style={styles.sectionTitle}>App Preferences</Typography>
        
        <Card elevated style={styles.card}>
          {/* Dark Mode Toggle */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                {isDark ? (
                  <Moon color={colors.text} size={20} />
                ) : (
                  <Sun color={colors.text} size={20} />
                )}
              </View>
              <Typography variant="bodyLarge" style={styles.rowText}>Dark Mode</Typography>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryAction }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Language Placeholder */}
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                <Globe color={colors.text} size={20} />
              </View>
              <Typography variant="bodyLarge" style={styles.rowText}>Language</Typography>
            </View>
            <View style={styles.rowRight}>
              <Typography variant="body" color={colors.textSecondary}>English</Typography>
              <ChevronRight color={colors.textSecondary} size={20} style={styles.chevron} />
            </View>
          </TouchableOpacity>
        </Card>

        <Typography variant="h3" style={[styles.sectionTitle, { marginTop: 32 }]}>About</Typography>
        
        <Card elevated style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                <Info color={colors.text} size={20} />
              </View>
              <Typography variant="bodyLarge" style={styles.rowText}>About Signal</Typography>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </Card>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
