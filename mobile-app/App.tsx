// ═════════════════════════════════════════════════════════
// SUOP Execution Apps — Main Entry (Sprint 40)
// Two separate apps sharing one codebase:
//   1. Warehouse Execution App (Sprint 31) — Receivers / Pickers / Forklifts
//   2. Production Execution App (Sprint 40) — Mixing/Cooking/Packing Operators
// Both share: auth, offline sync, barcode engine, audit infra
// ═════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { getAuthToken, clearAuthTokens } from './src/api/client'

// Warehouse Screens (Sprint 31)
import LoginScreen from './src/screens/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import { TasksScreen, TaskExecutionScreen } from './src/screens/TaskScreens'
import { InventoryLookupScreen, SyncMonitorScreen, SettingsScreen } from './src/screens/OtherScreens'

// Production Screens (Sprint 40)
import {
  ProductionDashboardScreen,
  ProductionWorkOrdersScreen,
  ProductionWorkOrderDetailScreen,
  MaterialIssueScreen,
  BatchCreationScreen,
  QualityCheckScreen,
  WIPMovementScreen,
  ProductionLookupScreen,
  ProductionSyncScreen,
} from './src/screens/ProductionScreens'

// ─── App Mode ────────────────────────────────────────────
type AppMode = 'warehouse' | 'production'

// ─── Navigation Types ────────────────────────────────────
type RootStackParamList = {
  AppSelector: undefined
  Login: undefined
  WarehouseTabs: undefined
  ProductionTabs: undefined
  TaskExecution: { task: any }
  ProductionWorkOrderDetail: { woNumber: string }
  MaterialIssue: { woNumber?: string }
  BatchCreation: undefined
  QualityCheck: { woNumber?: string; checkType?: string; stage?: string }
  WIPMovement: undefined
}

type WarehouseTabParamList = {
  Dashboard: undefined
  Tasks: undefined
  Lookup: undefined
  Sync: undefined
  Settings: undefined
}

type ProductionTabParamList = {
  Dashboard: undefined
  WorkOrders: undefined
  Lookup: undefined
  Sync: undefined
  Settings: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const WarehouseTab = createBottomTabNavigator<WarehouseTabParamList>()
const ProductionTab = createBottomTabNavigator<ProductionTabParamList>()

// ─── App Selector (choose Warehouse or Production) ──────
function AppSelectorScreen({ onSelect }: { onSelect: (mode: AppMode) => void }) {
  return (
    <View style={selectorStyles.container}>
      <View style={selectorStyles.header}>
        <Text style={selectorStyles.title}>SUOP</Text>
        <Text style={selectorStyles.subtitle}>Sudhastar Unified Operating Platform</Text>
        <Text style={selectorStyles.badge}>Sprint 40 · Two Execution Apps</Text>
      </View>
      <Text style={selectorStyles.sectionTitle}>Select Application</Text>
      <TouchableOpacity
        style={[selectorStyles.appCard, { borderLeftColor: '#f59e0b' }]}
        onPress={() => onSelect('warehouse')}
      >
        <Text style={selectorStyles.appIcon}>📦</Text>
        <View style={selectorStyles.appInfo}>
          <Text style={selectorStyles.appName}>Warehouse Execution App</Text>
          <Text style={selectorStyles.appDesc}>For Receivers, Pickers, Forklift Operators, Dispatch Team</Text>
          <Text style={selectorStyles.appMeta}>Sprint 31 · Receiving, Putaway, Picking, Transfers, Cycle Counts, Loading, Dispatch</Text>
        </View>
        <Text style={selectorStyles.arrow}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[selectorStyles.appCard, { borderLeftColor: '#10b981' }]}
        onPress={() => onSelect('production')}
      >
        <Text style={selectorStyles.appIcon}>🏭</Text>
        <View style={selectorStyles.appInfo}>
          <Text style={selectorStyles.appName}>Production Execution App</Text>
          <Text style={selectorStyles.appDesc}>For Mixing, Cooking, Frying, Packing Operators & Supervisors</Text>
          <Text style={selectorStyles.appMeta}>Sprint 40 · Material Issue, Work Orders, Batch Creation, WIP, Quality, Label Printing</Text>
        </View>
        <Text style={selectorStyles.arrow}>→</Text>
      </TouchableOpacity>
      <Text style={selectorStyles.footer}>Both apps share authentication, offline sync, barcode engine, and audit infrastructure.</Text>
    </View>
  )
}

const selectorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#f59e0b' },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  badge: { fontSize: 10, color: '#f59e0b', marginTop: 8, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: 4, overflow: 'hidden' },
  sectionTitle: { fontSize: 14, color: '#94a3b8', marginBottom: 12, fontWeight: '600' },
  appCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4 },
  appIcon: { fontSize: 32, marginRight: 14 },
  appInfo: { flex: 1 },
  appName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  appDesc: { fontSize: 11, color: '#cbd5e1', marginTop: 4 },
  appMeta: { fontSize: 10, color: '#64748b', marginTop: 4 },
  arrow: { fontSize: 24, color: '#475569' },
  footer: { fontSize: 10, color: '#475569', textAlign: 'center', marginTop: 24 },
})

// ─── Warehouse Tabs (Sprint 31) ─────────────────────────
function WarehouseTabs() {
  return (
    <WarehouseTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <WarehouseTab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }} />
      <WarehouseTab.Screen name="Tasks" component={TasksScreen} options={{ tabBarLabel: 'Tasks', tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} /> }} />
      <WarehouseTab.Screen name="Lookup" component={InventoryLookupScreen} options={{ tabBarLabel: 'Lookup', tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} /> }} />
      <WarehouseTab.Screen name="Sync" component={SyncMonitorScreen} options={{ tabBarLabel: 'Sync', tabBarIcon: ({ color }) => <TabIcon emoji="☁️" color={color} /> }} />
      <WarehouseTab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings', tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} /> }} />
    </WarehouseTab.Navigator>
  )
}

// ─── Production Tabs (Sprint 40) ─────────────────────────
function ProductionTabs() {
  return (
    <ProductionTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <ProductionTab.Screen name="Dashboard" component={ProductionDashboardScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <TabIcon emoji="🏭" color={color} /> }} />
      <ProductionTab.Screen name="WorkOrders" component={ProductionWorkOrdersScreen} options={{ tabBarLabel: 'Work Orders', tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} /> }} />
      <ProductionTab.Screen name="Lookup" component={ProductionLookupScreen} options={{ tabBarLabel: 'Lookup', tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} /> }} />
      <ProductionTab.Screen name="Sync" component={ProductionSyncScreen} options={{ tabBarLabel: 'Sync', tabBarIcon: ({ color }) => <TabIcon emoji="☁️" color={color} /> }} />
      <ProductionTab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings', tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} /> }} />
    </ProductionTab.Navigator>
  )
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <>{emoji}</>
}

// ─── Root App ────────────────────────────────────────────
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [appMode, setAppMode] = useState<AppMode | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const token = await getAuthToken()
    setIsAuthenticated(!!token)
    setChecking(false)
  }

  if (checking) {
    return null
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!appMode ? (
            <Stack.Screen name="AppSelector">
              {() => <AppSelectorScreen onSelect={(mode) => setAppMode(mode)} />}
            </Stack.Screen>
          ) : !isAuthenticated ? (
            <Stack.Screen name="Login">
              {() => <LoginScreen onLogin={() => setIsAuthenticated(true)} />}
            </Stack.Screen>
          ) : appMode === 'warehouse' ? (
            <>
              <Stack.Screen name="WarehouseTabs" component={WarehouseTabs} />
              <Stack.Screen name="TaskExecution" component={TaskExecutionScreen} options={{ presentation: 'card' }} />
            </>
          ) : (
            <>
              <Stack.Screen name="ProductionTabs" component={ProductionTabs} />
              <Stack.Screen name="ProductionWorkOrderDetail" component={ProductionWorkOrderDetailScreen} options={{ presentation: 'card' }} />
              <Stack.Screen name="MaterialIssue" component={MaterialIssueScreen} options={{ presentation: 'card' }} />
              <Stack.Screen name="BatchCreation" component={BatchCreationScreen} options={{ presentation: 'card' }} />
              <Stack.Screen name="QualityCheck" component={QualityCheckScreen} options={{ presentation: 'card' }} />
              <Stack.Screen name="WIPMovement" component={WIPMovementScreen} options={{ presentation: 'card' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
