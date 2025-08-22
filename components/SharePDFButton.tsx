import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share } from 'lucide-react-native';
import { generateAndSharePDF } from '@/utils/pdfGenerator';

interface SharePDFButtonProps {
  data: any;
  type: 'coldroom' | 'freezer' | 'blastfreezer';
}

export function SharePDFButton({ data, type }: SharePDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      await generateAndSharePDF({
        type,
        ...data
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.shareButton}
      onPress={handleShare}
      disabled={loading}
    >
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.buttonGradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Share color="#FFFFFF" size={20} strokeWidth={2} />
            <Text style={styles.buttonText}>Share PDF Report</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});