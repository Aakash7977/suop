// ═════════════════════════════════════════════════════════
// Login Screen — PIN / Employee / Biometric
// ═════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Vibration
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import * as Haptics from 'expo-haptics'
import { AuthAPI, setAuthTokens, saveOperatorData, getOperatorData } from '../api/client'

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [method, setMethod] = useState<'pin' | 'employee' | 'biometric'>('pin')
  const [pin, setPin] = useState<string[]>(['', '', '', ''])
  const [operatorCode, setOperatorCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasBiometric, setHasBiometric] = useState(false)

  useEffect(() => {
    checkBiometric()
    checkOfflineLogin()
  }, [])

  async function checkBiometric() {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    setHasBiometric(compatible && enrolled)
  }

  async function checkOfflineLogin() {
    // If operator data exists, allow offline login
    const data = await getOperatorData()
    if (data) {
      // Show "Continue as {name}" option
    }
  }

  function handlePinPress(digit: string) {
    const nextEmpty = pin.findIndex(p => !p)
    if (nextEmpty === -1) return
    const newPin = [...pin]
    newPin[nextEmpty] = digit
    setPin(newPin)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (nextEmpty === 3) {
      setTimeout(() => doLogin('PIN_LOGIN', `OP-${newPin.join('')}`), 200)
    }
  }

  function handlePinDelete() {
    const lastFilled = pin.map((p, i) => p ? i : -1).filter(i => i >= 0).pop()
    if (lastFilled === undefined) return
    const newPin = [...pin]
    newPin[lastFilled] = ''
    setPin(newPin)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  async function doLogin(loginMethod: string, code: string) {
    setLoading(true)
    try {
      const session = await AuthAPI.login(code, password || '0000', loginMethod)
      await setAuthTokens(session.jwtToken, session.refreshToken)
      await saveOperatorData(session)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onLogin()
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Login Failed', error.message || 'Check your credentials and try again')
      setPin(['', '', '', ''])
    } finally {
      setLoading(false)
    }
  }

  async function doBiometric() {
    setLoading(true)
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login to SUOP Warehouse',
        fallbackLabel: 'Use PIN instead',
      })
      if (result.success) {
        await doLogin('BIOMETRIC_LOGIN', 'OP-0000')
      }
    } catch (error: any) {
      Alert.alert('Biometric Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>SUOP Warehouse</Text>
          <Text style={styles.subtitle}>Operator Execution App</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0.0 · Sprint 31</Text>
          </View>
        </View>

        {/* Login Methods */}
        <View style={styles.methodsRow}>
          {([
            { key: 'pin' as const, label: 'PIN' },
            { key: 'employee' as const, label: 'Employee' },
            ...(hasBiometric ? [{ key: 'biometric' as const, label: 'Biometric' }] : []),
          ]).map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.methodButton, method === m.key && styles.methodButtonActive]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={[styles.methodText, method === m.key && styles.methodTextActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PIN Login */}
        {method === 'pin' && (
          <View style={styles.pinContainer}>
            <View style={styles.pinDots}>
              {pin.map((p, i) => (
                <View key={i} style={[styles.pinDot, p && styles.pinDotFilled]} />
              ))}
            </View>
            <View style={styles.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                <TouchableOpacity key={d} style={styles.key} onPress={() => handlePinPress(d)}>
                  <Text style={styles.keyText}>{d}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.key} onPress={handlePinDelete}>
                <Text style={styles.keyText}>⌫</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handlePinPress('0')}>
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.key, styles.keyConfirm]} onPress={() => doLogin('PIN_LOGIN', `OP-${pin.join('')}`)}>
                <Text style={styles.keyText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Employee Login */}
        {method === 'employee' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Operator Code</Text>
              <TextInput
                style={styles.input}
                value={operatorCode}
                onChangeText={setOperatorCode}
                placeholder="OP-001"
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
              />
            </View>
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={() => doLogin('EMPLOYEE_LOGIN', operatorCode || 'OP-001')}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Biometric */}
        {method === 'biometric' && (
          <View style={styles.biometricContainer}>
            <TouchableOpacity style={styles.biometricButton} onPress={doBiometric} disabled={loading}>
              <Text style={styles.biometricIcon}>👆</Text>
            </TouchableOpacity>
            <Text style={styles.biometricText}>
              {loading ? 'Verifying...' : 'Tap to scan fingerprint'}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Offline login available · Industrial scanner ready</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#f59e0b',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { fontSize: 40, fontWeight: '900', color: '#0f172a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  versionBadge: {
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 12,
  },
  versionText: { color: '#fcd34d', fontSize: 12, fontWeight: '500' },
  methodsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  methodButton: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#1e293b', alignItems: 'center',
  },
  methodButtonActive: { backgroundColor: '#f59e0b' },
  methodText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  methodTextActive: { color: '#0f172a' },
  pinContainer: { alignItems: 'center' },
  pinDots: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  pinDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#334155' },
  pinDotFilled: { backgroundColor: '#f59e0b' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  key: {
    width: 72, height: 72, borderRadius: 16, backgroundColor: '#1e293b',
    justifyContent: 'center', alignItems: 'center',
  },
  keyText: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  keyConfirm: { backgroundColor: '#f59e0b' },
  form: { gap: 12 },
  inputGroup: { backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  input: { color: '#ffffff', fontSize: 18, fontFamily: 'monospace' },
  loginButton: {
    height: 56, borderRadius: 12, backgroundColor: '#f59e0b',
    justifyContent: 'center', alignItems: 'center',
  },
  loginButtonDisabled: { opacity: 0.5 },
  loginButtonText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  biometricContainer: { alignItems: 'center', paddingVertical: 32 },
  biometricButton: {
    width: 112, height: 112, borderRadius: 56, backgroundColor: '#1e293b',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  biometricIcon: { fontSize: 56 },
  biometricText: { color: '#94a3b8', fontSize: 14 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { color: '#475569', fontSize: 12 },
})
