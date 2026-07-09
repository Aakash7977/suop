// ═════════════════════════════════════════════════════════
// SUOP Warehouse Execution App — Main Entry
// Industrial barcode-first warehouse operations for Sudhamrit
// ═════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { getAuthToken, clearAuthTokens } from './src/api/client'

// Screens
import LoginScreen from './src/screens/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import { TasksScreen, TaskExecutionScreen } from './src/screens/TaskScreens'
import { InventoryLookupScreen, SyncMonitorScreen, SettingsScreen } from './src/screens/OtherScreens'

// ─── Navigation Types ───────────────────────────────────
type RootStackParamList = {
  Login: undefined
  MainTabs: undefined
  TaskExecution: { task: any }
}

type TabParamList = {
  Dashboard: undefined
  Tasks: undefined
  Lookup: undefined
  Sync: undefined
  Settings: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// ─── Bottom Tab Navigator ───────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ tabBarLabel: 'Tasks', tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} /> }} />
      <Tab.Screen name="Lookup" component={InventoryLookupScreen} options={{ tabBarLabel: 'Lookup', tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} /> }} />
      <Tab.Screen name="Sync" component={SyncMonitorScreen} options={{ tabBarLabel: 'Sync', tabBarIcon: ({ color }) => <TabIcon emoji="☁️" color={color} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings', tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} /> }} />
    </Tab.Navigator>
  )
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <>{emoji}</>
}

// ─── Root App ───────────────────────────────────────────
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const token = await getAuthToken()
    setIsAuthenticated(!!token)
    setChecking(false)
  }

  if (checking) {
    return null // Splash screen handled by app.json
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="TaskExecution" component={TaskExecutionScreen} options={{ presentation: 'card' }} />
            </>
          ) : (
            <Stack.Screen name="Login">
              {() => <LoginScreen onLogin={() => setIsAuthenticated(true)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
