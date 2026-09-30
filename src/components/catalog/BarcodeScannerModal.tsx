import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { AppButton } from '../common/AppButton';
import { AppInput } from '../common/AppInput';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanResult: (barcode: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  visible,
  onClose,
  onScanResult,
  title = 'Scan Product Barcode / EAN',
}) => {
  const [manualCode, setManualCode] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [scanLineAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 200,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const mockQuickBarcodes = [
    { code: '8901262010014', label: 'Amul Milk 500ml' },
    { code: '8906014420087', label: 'Nandini Curd 500g' },
    { code: '8901030018129', label: 'Aashirvaad Atta 5kg' },
    { code: '8901058852330', label: 'Maggi Noodles 4pk' },
  ];

  const handleSimulateScan = (code: string) => {
    onScanResult(code);
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanResult(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={26} color={colors.textInverse} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{title}</Text>
          <TouchableOpacity 
            onPress={() => setFlashOn(!flashOn)} 
            style={[styles.flashBtn, flashOn && styles.flashBtnOn]} 
            activeOpacity={0.7}
          >
            <Ionicons name={flashOn ? 'flash' : 'flash-off'} size={22} color={colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Camera Viewport Simulation */}
        <View style={styles.cameraViewport}>
          <View style={styles.crosshairFrame}>
            {/* Corners */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Laser Line Animation */}
            <Animated.View
              style={[
                styles.laserLine,
                { transform: [{ translateY: scanLineAnim }] },
              ]}
            />
          </View>
          <Text style={styles.instructionText}>
            Align standard 13-digit EAN/UPC barcode within the frame
          </Text>
        </View>

        {/* Quick Testing Barcodes & Manual Input */}
        <View style={styles.bottomControls}>
          <Text style={styles.quickLabel}>Tap to simulate instant scan:</Text>
          <View style={styles.quickList}>
            {mockQuickBarcodes.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={styles.quickPill}
                onPress={() => handleSimulateScan(item.code)}
                activeOpacity={0.7}
              >
                <Ionicons name="barcode" size={14} color={colors.primary} />
                <Text style={styles.quickPillText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.manualSection}>
            <AppInput
              placeholder="Or type 13-digit barcode number..."
              value={manualCode}
              onChangeText={setManualCode}
              keyboardType="number-pad"
              containerStyle={styles.manualInput}
              rightAffix={
                <TouchableOpacity onPress={handleManualSubmit} style={styles.submitCodeBtn}>
                  <Text style={styles.submitCodeText}>Lookup</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeBtn: {
    padding: spacing.xs,
    minWidth: 40,
  },
  topTitle: {
    ...typography.bodyMediumBold,
    color: colors.textInverse,
  },
  flashBtn: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  flashBtnOn: {
    backgroundColor: colors.secondary,
  },
  cameraViewport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairFrame: {
    width: 280,
    height: 220,
    position: 'relative',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  laserLine: {
    height: 2,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    width: '100%',
  },
  instructionText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  bottomControls: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  quickLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  quickPillText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  manualSection: {
    marginTop: spacing.xs,
  },
  manualInput: {
    marginBottom: 0,
  },
  submitCodeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  submitCodeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
});
