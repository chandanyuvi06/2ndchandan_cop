import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateEnhancedFreezerLoad } from '@/utils/enhancedFreezerCalculations';
import { Header } from '@/components/Header';
import { SharePDFButton } from '@/components/SharePDFButton';

export default function FreezerResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<any>({});

  useEffect(() => {
    loadAllDataAndCalculate();
  }, []);

  const loadAllDataAndCalculate = async () => {
    try {
      const [roomData, conditionsData, productData] = await Promise.all([
        AsyncStorage.getItem('roomData'),
        AsyncStorage.getItem('conditionsData'),
        AsyncStorage.getItem('productData'),
      ]);

      const room = roomData ? JSON.parse(roomData) : {};
      const conditions = conditionsData ? JSON.parse(conditionsData) : {};
      const product = productData ? JSON.parse(productData) : {};

      const calculationResults = calculateEnhancedFreezerLoad(room, conditions, product);

      setResults(calculationResults);
      setAllData({
        roomData: room,
        conditionsData: conditions,
        productData: product,
        calculationResults
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculating Results..." step={4} totalSteps={4} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Processing calculations...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Results" step={4} totalSteps={4} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to calculate results. Please check your inputs.</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Freezer Results" step={4} totalSteps={4} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Cooling Load</Text>
          
          <View style={styles.resultCard}>
            <View style={styles.mainResult}>
              <Text style={styles.resultLabel}>Total Cooling Load</Text>
              <Text style={styles.resultValue}>{results.loadSummary.finalLoad.toFixed(2)} kW</Text>
              <Text style={styles.resultSubValue}>{results.totalTR.toFixed(2)} TR</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Transmission Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.total.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Product Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.total.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Air Change Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.load.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Internal Loads</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.internal.total.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety Factor (10%)</Text>
              <Text style={styles.breakdownValue}>{results.loadSummary.safetyFactor.toFixed(2)} kW</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thermal Analysis</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sensible Heat Ratio (SHR):</Text>
              <Text style={styles.summaryValue}>{results.loadSummary.SHR.toFixed(3)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Sensible Load:</Text>
              <Text style={styles.summaryValue}>{results.loadSummary.totalSensible.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Latent Load:</Text>
              <Text style={styles.summaryValue}>{results.loadSummary.totalLatent.toFixed(2)} kW</Text>
            </View>
          </View>
        </View>

        <SharePDFButton data={allData} type="freezer" />
      </ScrollView>
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#3B82F6',
  },
  mainResult: {
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  resultSubValue: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});