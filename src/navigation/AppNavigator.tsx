import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { AppContext } from '../contexts/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Platform, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const theme = useTheme();
  const { alertActive } = useContext(AppContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'view-dashboard';
          if (route.name === 'Dashboard') iconName = 'view-dashboard';
          else if (route.name === 'Historique') iconName = 'chart-timeline-variant';
          else if (route.name === 'Paramètres') iconName = 'cog-outline';
          return (
            <MaterialCommunityIcons
              name={iconName}
              size={focused ? size + 2 : size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface + '80',
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline + '40',
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline + '40',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarBadge: alertActive ? '!' : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.error, fontSize: 10 },
        }}
      />
      <Tab.Screen name="Historique" component={HistoryScreen} />
      <Tab.Screen name="Paramètres" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
