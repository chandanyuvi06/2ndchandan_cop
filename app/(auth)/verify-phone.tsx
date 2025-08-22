import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Phone, Shield } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { InputCard } from '@/components/InputCard';

export default function VerifyPhoneScreen() {
  const { phone, userId } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    sendOTP();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phone as string);
      setConfirmation(confirmation);
      setCountdown(60);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await confirmation.confirm(otp);
      
      // Update user's phone verification status
      await firestore().collection('users').doc(userId as string).update({
        phoneVerified: true,
        phoneVerifiedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Phone number verified successfully!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      await sendOTP();
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#EBF8FF', '#DBEAFE']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Shield color="#3B82F6" size={48} strokeWidth={2} />
          <Text style={styles.title}>Verify Phone Number</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {phone}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Phone color="#64748B" size={20} strokeWidth={2} />
            <InputCard
              label="Enter OTP"
              unit=""
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
            />
          </View>

          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={verifyOTP}
            disabled={loading}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify Phone</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.resendButton, countdown > 0 && styles.disabledButton]}
            onPress={resendOTP}
            disabled={countdown > 0 || resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator color="#3B82F6" size="small" />
            ) : (
              <Text style={[styles.resendText, countdown > 0 && styles.disabledText]}>
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Back to Sign Up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  verifyButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  resendText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#94A3B8',
  },
  backButton: {
    alignItems: 'center',
  },
  backText: {
    color: '#64748B',
    fontSize: 14,
  },
});