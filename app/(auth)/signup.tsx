import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { InputCard } from '@/components/InputCard';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(formData.email, formData.password);
      
      // Update user profile with name
      await userCredential.user.updateProfile({
        displayName: formData.name,
      });

      // Store additional user data in Firestore
      await firestore().collection('users').doc(userCredential.user.uid).set({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        phoneVerified: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Navigate to phone verification
      router.push({
        pathname: '/(auth)/verify-phone',
        params: { phone: formData.phone, userId: userCredential.user.uid }
      });
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#EBF8FF', '#DBEAFE']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Enzo CoolCalc today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User color="#64748B" size={20} strokeWidth={2} />
            <InputCard
              label="Full Name"
              unit=""
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail color="#64748B" size={20} strokeWidth={2} />
            <InputCard
              label="Email"
              unit=""
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone color="#64748B" size={20} strokeWidth={2} />
            <InputCard
              label="Phone Number"
              unit=""
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#64748B" size={20} strokeWidth={2} />
            <View style={styles.passwordContainer}>
              <InputCard
                label="Password"
                unit=""
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Create a password"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff color="#64748B" size={20} strokeWidth={2} />
                ) : (
                  <Eye color="#64748B" size={20} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#64748B" size={20} strokeWidth={2} />
            <View style={styles.passwordContainer}>
              <InputCard
                label="Confirm Password"
                unit=""
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#64748B" size={20} strokeWidth={2} />
                ) : (
                  <Eye color="#64748B" size={20} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={loading}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
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
  passwordContainer: {
    flex: 1,
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 32,
    padding: 8,
  },
  signUpButton: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  signInLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});