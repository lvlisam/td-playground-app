import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';
import { devSupabaseRedirectUrl, supabase } from '../supabase';

type AuthMode = 'sign-in' | 'sign-up';

type AuthFlowModalProps = {
  visible: boolean;
  onClose: () => void;
};

function getAuthErrorMessage(error: unknown, mode: AuthMode) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };

  if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (mode === 'sign-in') {
    if (code === 'email_not_confirmed') return 'Confirm your email address using the link in your inbox, then sign in.';
    if (code === 'invalid_credentials') return 'Invalid email or password.';
    return 'Unable to sign in right now. Please try again.';
  }
  if (code === 'weak_password') return 'Please choose a stronger password.';
  if (code === 'email_address_invalid') return 'Please enter a valid email address.';
  if (code === 'email_address_not_authorized') return 'Confirmation email cannot be sent to that address. Try another email.';
  return 'Unable to create an account right now. Please check your details and try again.';
}

export default function AuthFlowModal({ visible, onClose }: AuthFlowModalProps) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = mode === 'sign-up';

  useEffect(() => {
    if (!visible) return;
    setMode('sign-in');
    setName('');
    setEmail('');
    setPassword('');
    setFeedback('');
  }, [visible]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setFeedback('');
  }

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (isSignUp && !name.trim()) {
      setFeedback('Enter your name to continue.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFeedback('Enter a valid email address.');
      return;
    }
    if (!password) {
      setFeedback('Enter your password to continue.');
      return;
    }
    if (isSignUp && password.length < 8) {
      setFeedback('Use at least 8 characters for your password.');
      return;
    }

    setIsSubmitting(true);
    setFeedback('');
    try {
      if (isSignUp) {
        const emailRedirectTo = devSupabaseRedirectUrl ??
          (Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined);
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            ...(emailRedirectTo ? { emailRedirectTo } : {}),
            data: { full_name: name.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          onClose();
          return;
        }
        setFeedback('Check your inbox for a confirmation link to finish creating your account.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
      onClose();
    } catch (error: unknown) {
      setFeedback(getAuthErrorMessage(error, mode));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    visible ? (
      <KeyboardAvoidingView
        accessibilityViewIsModal
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.header}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>TD</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close sign-in and sign-up"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={21} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text accessibilityRole="header" style={styles.title}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'A simple way to get started.' : 'Sign in to continue to your account.'}
            </Text>

            <View style={styles.modeSwitch} accessibilityRole="tablist">
              <TouchableOpacity
                accessibilityRole="tab"
                accessibilityState={{ selected: !isSignUp }}
                onPress={() => changeMode('sign-in')}
                style={[styles.modeButton, !isSignUp && styles.modeButtonSelected]}
              >
                <Text style={[styles.modeText, !isSignUp && styles.modeTextSelected]}>Sign in</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="tab"
                accessibilityState={{ selected: isSignUp }}
                onPress={() => changeMode('sign-up')}
                style={[styles.modeButton, isSignUp && styles.modeButtonSelected]}
              >
                <Text style={[styles.modeText, isSignUp && styles.modeTextSelected]}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {isSignUp ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  accessibilityLabel="Full name"
                  autoCapitalize="words"
                  autoComplete="name"
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="next"
                  style={styles.input}
                  value={name}
                />
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                style={styles.input}
                textContentType="emailAddress"
                value={email}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                onChangeText={setPassword}
                placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'}
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                secureTextEntry
                style={styles.input}
                textContentType={isSignUp ? 'newPassword' : 'password'}
                value={password}
              />
            </View>

            <Text style={styles.authNotice}>
              Your app sign-in is separate from TD banking access.
            </Text>

            <TouchableOpacity
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={submit}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.text} />
            </TouchableOpacity>

            {feedback ? (
              <Text accessibilityLiveRegion="polite" style={styles.feedback}>
                {feedback}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    ) : null
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 100, elevation: 100, flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md, backgroundColor: 'rgba(20, 30, 24, 0.48)' },
  card: { width: '100%', maxWidth: 440, maxHeight: '92%', overflow: 'hidden', borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  content: { padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandMark: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.green },
  brandMarkText: { color: colors.text, fontFamily: font.headline.bold, fontSize: font.size.md },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surfaceMid },
  title: { color: colors.text, fontFamily: font.headline.bold, fontSize: font.size.xl, lineHeight: 30 },
  subtitle: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 20 },
  modeSwitch: { flexDirection: 'row', padding: 4, borderRadius: radius.md, backgroundColor: colors.surfaceMid },
  modeButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  modeButtonSelected: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  modeText: { color: colors.textSecondary, fontSize: font.size.sm, fontFamily: font.body.medium },
  modeTextSelected: { color: colors.text, fontFamily: font.body.bold },
  fieldGroup: { gap: spacing.xs },
  label: { color: colors.text, fontFamily: font.body.medium, fontSize: font.size.sm },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontFamily: font.body.regular, fontSize: font.size.base },
  authNotice: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenDim, color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 18 },
  submitButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.green },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: colors.text, fontSize: font.size.base, fontFamily: font.body.bold },
  feedback: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 20 },
});
