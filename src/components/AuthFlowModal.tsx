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
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import { devSupabaseRedirectUrl, supabase } from '../supabase';
import AuthWelcomeScreen from './AuthWelcomeScreen';

type AuthScreen = 'welcome' | 'sign-in' | 'sign-up' | 'reset-password' | 'new-password' | 'confirmation';
type AuthAction = Exclude<AuthScreen, 'welcome' | 'confirmation'>;
type AuthFlowModalProps = {
  visible: boolean;
  onClose: () => void;
  initialScreen?: AuthScreen;
};
type AuthInputProps = TextInputProps & { label: string; value: string; onChangeText: (value: string) => void };

function AuthInput({ label, value, onChangeText, ...inputProps }: AuthInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        value={value}
        {...inputProps}
      />
    </View>
  );
}

function getAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return devSupabaseRedirectUrl ?? `${window.location.origin}/auth/callback`;
  }
  return 'tdfuture://auth/callback';
}

function getAuthErrorMessage(error: unknown, action: AuthAction) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };

  if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (action === 'sign-in') {
    if (code === 'email_not_confirmed') return 'Confirm your email address using the link in your inbox, then sign in.';
    if (code === 'invalid_credentials') return 'Invalid email or password.';
    return 'Unable to sign in right now. Please try again.';
  }
  if (action === 'sign-up') {
    if (code === 'weak_password') return 'Please choose a stronger password.';
    if (code === 'email_address_invalid') return 'Please enter a valid email address.';
    if (code === 'email_address_not_authorized') return 'Confirmation email cannot be sent to that address. Try another email.';
    return 'Unable to create an account right now. Please check your details and try again.';
  }
  if (action === 'new-password' && code === 'weak_password') return 'Please choose a stronger password.';
  if (action === 'new-password') return 'Unable to update your password right now. Please try again.';
  return 'Unable to send a reset link right now. Please try again.';
}

export default function AuthFlowModal({ visible, onClose, initialScreen = 'welcome' }: AuthFlowModalProps) {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationDestination, setConfirmationDestination] = useState<'sign-in' | 'close'>('sign-in');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setScreen(initialScreen);
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFeedback('');
    setConfirmationTitle('');
    setConfirmationMessage('');
  }, [visible, initialScreen]);

  function navigate(nextScreen: AuthScreen) {
    setScreen(nextScreen);
    setFeedback('');
  }

  function showConfirmation(title: string, message: string, destination: 'sign-in' | 'close') {
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setConfirmationDestination(destination);
    setPassword('');
    setConfirmPassword('');
    setFeedback('');
    setScreen('confirmation');
  }

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    const action = screen as AuthAction;
    if ((screen === 'sign-up' || screen === 'new-password') && password.length < 8) {
      setFeedback('Use at least 8 characters for your password.');
      return;
    }
    if (screen === 'sign-up' && !fullName.trim()) {
      setFeedback('Enter your full name to continue.');
      return;
    }
    if (screen !== 'new-password' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFeedback('Enter a valid email address.');
      return;
    }
    if ((screen === 'sign-up' || screen === 'new-password') && password !== confirmPassword) {
      setFeedback('The passwords do not match.');
      return;
    }
    if (screen === 'sign-in' && !password) {
      setFeedback('Enter your password to continue.');
      return;
    }

    setIsSubmitting(true);
    setFeedback('');
    try {
      if (screen === 'sign-up') {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(),
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          onClose();
          return;
        }
        showConfirmation('Check your inbox', `We sent a confirmation link to ${normalizedEmail}. Open it to finish creating your app account.`, 'sign-in');
        return;
      }

      if (screen === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        onClose();
        return;
      }

      if (screen === 'reset-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: getAuthRedirectUrl(),
        });
        if (error) throw error;
        showConfirmation('Check your email', 'If an account exists for that address, a password reset link will be sent shortly.', 'sign-in');
        return;
      }

      if (screen === 'new-password') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        showConfirmation('Password updated', 'Your password has been updated. You can continue using the app.', 'close');
      }
    } catch (error: unknown) {
      setFeedback(getAuthErrorMessage(error, action));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!visible) return null;

  const showPassword = screen === 'sign-in' || screen === 'sign-up' || screen === 'new-password';
  const isSignUp = screen === 'sign-up';
  const title = screen === 'sign-in'
    ? 'Sign in'
    : isSignUp
      ? 'Create your account'
      : screen === 'reset-password'
        ? 'Reset your password'
        : 'Choose a new password';
  const submitLabel = screen === 'sign-in'
    ? 'Sign in'
    : isSignUp
      ? 'Create account'
      : screen === 'reset-password'
        ? 'Send reset link'
        : 'Update password';

  return (
    <KeyboardAvoidingView
      accessibilityViewIsModal
      style={styles.backdrop}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {screen === 'welcome' ? (
          <AuthWelcomeScreen
            onClose={onClose}
            onSignIn={() => navigate('sign-in')}
            onSignUp={() => navigate('sign-up')}
          />
        ) : (
          <ScrollView
            key={screen}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            <View style={styles.header}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Back to welcome"
                onPress={() => navigate('welcome')}
                style={styles.headerButton}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>TD</Text></View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close login and sign-up"
                onPress={onClose}
                style={styles.headerButton}
              >
                <Ionicons name="close" size={21} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {screen === 'confirmation' ? (
              <View style={styles.confirmation}>
                <View style={styles.confirmationIcon}>
                  <Ionicons name="mail-open-outline" size={28} color={colors.greenDeep} />
                </View>
                <Text accessibilityRole="header" style={styles.title}>{confirmationTitle}</Text>
                <Text style={styles.subtitle}>{confirmationMessage}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={confirmationDestination === 'close' ? onClose : () => navigate('sign-in')}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>
                    {confirmationDestination === 'close' ? 'Continue to app' : 'Back to sign in'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.formHeading}>
                  <Text accessibilityRole="header" style={styles.title}>{title}</Text>
                  <Text style={styles.subtitle}>
                    {screen === 'sign-in'
                      ? 'Enter your app account details to continue.'
                      : screen === 'sign-up'
                        ? 'Create an app account with your email and a password.'
                        : screen === 'reset-password'
                          ? 'Enter the email address for your app account.'
                          : 'Choose a new password for your app account.'}
                  </Text>
                </View>

                {isSignUp ? (
                  <AuthInput
                    autoCapitalize="words"
                    autoComplete="name"
                    label="Full name"
                    onChangeText={setFullName}
                    placeholder="Your name"
                    returnKeyType="next"
                    textContentType="name"
                    value={fullName}
                  />
                ) : null}

                {screen !== 'new-password' ? (
                  <AuthInput
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    label="Email address"
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    returnKeyType="next"
                    textContentType="emailAddress"
                    value={email}
                  />
                ) : null}

                {showPassword ? (
                  <AuthInput
                    autoCapitalize="none"
                    autoComplete={isSignUp || screen === 'new-password' ? 'new-password' : 'current-password'}
                    label={screen === 'new-password' ? 'New password' : 'Password'}
                    onChangeText={setPassword}
                    placeholder={screen === 'sign-in' ? 'Your password' : 'At least 8 characters'}
                    returnKeyType="next"
                    secureTextEntry
                    textContentType={screen === 'new-password' ? 'newPassword' : isSignUp ? 'newPassword' : 'password'}
                    value={password}
                  />
                ) : null}

                {isSignUp || screen === 'new-password' ? (
                  <AuthInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    label="Confirm password"
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    returnKeyType="done"
                    secureTextEntry
                    textContentType="newPassword"
                    value={confirmPassword}
                  />
                ) : null}

                <View style={styles.authNotice}>
                  <Ionicons name="lock-closed-outline" size={16} color={colors.greenDeep} />
                  <Text style={styles.authNoticeText}>This app account is separate from your TD banking sign-in.</Text>
                </View>

                {screen === 'sign-in' ? (
                  <TouchableOpacity accessibilityRole="button" onPress={() => navigate('reset-password')} style={styles.textAction}>
                    <Text style={styles.textActionText}>Forgot password?</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={submit}
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                >
                  <Text style={styles.submitButtonText}>{isSubmitting ? 'Please wait…' : submitLabel}</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.text} />
                </TouchableOpacity>

                {screen === 'sign-in' ? (
                  <TouchableOpacity accessibilityRole="button" onPress={() => navigate('sign-up')} style={styles.switchAction}>
                    <Text style={styles.switchText}>New to the app? <Text style={styles.textActionText}>Create an account</Text></Text>
                  </TouchableOpacity>
                ) : screen === 'sign-up' ? (
                  <TouchableOpacity accessibilityRole="button" onPress={() => navigate('sign-in')} style={styles.switchAction}>
                    <Text style={styles.switchText}>Already have an account? <Text style={styles.textActionText}>Sign in</Text></Text>
                  </TouchableOpacity>
                ) : screen === 'reset-password' ? (
                  <TouchableOpacity accessibilityRole="button" onPress={() => navigate('sign-in')} style={styles.switchAction}>
                    <Text style={styles.switchText}>Remembered your password? <Text style={styles.textActionText}>Sign in</Text></Text>
                  </TouchableOpacity>
                ) : null}

                {feedback ? <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text> : null}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 100, elevation: 100, backgroundColor: colors.bg },
  screen: { flex: 1, width: '100%', backgroundColor: colors.bg },
  formContent: { flexGrow: 1, padding: spacing.xl, gap: spacing.lg },
  header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surface },
  brandMark: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.green },
  brandMarkText: { color: colors.text, fontFamily: font.headline.bold, fontSize: font.size.md },
  formHeading: { gap: spacing.sm, marginTop: spacing.md },
  title: { color: colors.text, fontFamily: font.headline.bold, fontSize: font.size.xl, lineHeight: 30 },
  subtitle: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 21 },
  fieldGroup: { gap: spacing.xs },
  label: { color: colors.text, fontFamily: font.body.medium, fontSize: font.size.sm },
  input: { minHeight: 50, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontFamily: font.body.regular, fontSize: font.size.base },
  authNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenDim },
  authNoticeText: { flex: 1, color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 18 },
  textAction: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  textActionText: { color: colors.greenDeep, fontSize: font.size.sm, fontFamily: font.body.bold },
  submitButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.green },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: colors.text, fontSize: font.size.base, fontFamily: font.body.bold },
  switchAction: { alignItems: 'center', paddingVertical: spacing.sm },
  switchText: { color: colors.textSecondary, fontSize: font.size.sm },
  feedback: { color: colors.red, fontSize: font.size.sm, lineHeight: 20 },
  confirmation: { flex: 1, justifyContent: 'center', gap: spacing.md },
  confirmationIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.greenDim },
});
