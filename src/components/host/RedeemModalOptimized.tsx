import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, IndianRupee, CheckCircle } from 'lucide-react-native';
import { Theme } from '../../styles/Theme';
import { redeemService } from '../../services/redeemService';

interface RedeemModalProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: (message: string) => void;
}

const MIN_REDEEM_AMOUNT = 100;
const MAX_REDEEM_AMOUNT = 50000;

// Memoize entire modal to prevent parent re-renders
const RedeemModalContent = React.memo<{
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: (message: string) => void;
}>(({ visible, onClose, availableBalance, onSuccess }) => {
  const [redeemAmount, setRedeemAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Ref to prevent re-renders during typing
  const isTypingRef = useRef(false);

  // Reset form when modal opens/closes - use ref to prevent re-renders
  const prevVisibleRef = useRef(visible);
  React.useEffect(() => {
    if (prevVisibleRef.current !== visible) {
      prevVisibleRef.current = visible;
      if (!visible) {
        setRedeemAmount('');
        setError('');
        setIsSuccess(false);
        setIsLoading(false);
      }
    }
  }, [visible]);

  // Stable validation function - no dependencies on props that change
  const validateAmount = useCallback((amount: string, balance: number): string | null => {
    const numAmount = parseFloat(amount);
    
    if (!amount || amount.trim() === '') {
      return 'Please enter an amount';
    }
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Amount must be greater than 0';
    }
    
    if (numAmount < MIN_REDEEM_AMOUNT) {
      return `Minimum redemption amount is ₹${MIN_REDEEM_AMOUNT}`;
    }
    
    if (numAmount > MAX_REDEEM_AMOUNT) {
      return `Maximum redemption amount is ₹${MAX_REDEEM_AMOUNT}`;
    }
    
    if (numAmount > balance) {
      return 'Amount cannot exceed available balance';
    }
    
    return null;
  }, []); // Empty dependency array - function is stable

  // Optimized input handler - prevents re-renders during typing
  const handleAmountChange = useCallback((text: string) => {
    isTypingRef.current = true;
    
    // Only allow numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setRedeemAmount(cleanedText);
    
    // Clear error only after typing stops (debounce-like behavior)
    if (error) {
      setError('');
    }
    
    // Reset typing flag after a short delay
    setTimeout(() => {
      isTypingRef.current = false;
    }, 100);
  }, [error]);

  // Memoized validation to prevent unnecessary calculations
  const validationError = useMemo(() => {
    if (isTypingRef.current) return null; // Skip validation during typing
    return validateAmount(redeemAmount, availableBalance);
  }, [redeemAmount, availableBalance, validateAmount]);

  // Memoized submit handler
  const handleSubmit = useCallback(async () => {
    const validationError = validateAmount(redeemAmount, availableBalance);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const amount = parseFloat(redeemAmount);
      const response = await redeemService.requestRedemption(amount);
      
      if (response.success) {
        setIsSuccess(true);
        onSuccess?.(response.message);
        
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process redemption request');
    } finally {
      setIsLoading(false);
    }
  }, [redeemAmount, availableBalance, validateAmount, onClose, onSuccess]);

  // Memoized button state
  const isValid = useMemo(() => {
    return !validationError && redeemAmount.trim() !== '';
  }, [validationError, redeemAmount]);

  // Memoized styles to prevent recreation
  const inputStyle = useMemo(() => [
    styles.input,
    { color: Theme.colors.foreground }
  ], []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Redeem Earnings</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                disabled={isLoading || isSuccess}
              >
                <X size={24} color={Theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {!isSuccess ? (
              <>
                {/* Available Balance */}
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <View style={styles.balanceRow}>
                    <IndianRupee size={20} color={Theme.colors.primary} />
                    <Text style={styles.balanceAmount}>
                      {availableBalance.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>

                {/* Amount Input */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Redeem Amount</Text>
                  <View style={[
                    styles.inputContainer,
                    error && styles.inputError
                  ]}>
                    <IndianRupee size={20} color={Theme.colors.mutedForeground} />
                    <TextInput
                      style={inputStyle}
                      value={redeemAmount}
                      onChangeText={handleAmountChange}
                      placeholder="Enter amount to redeem"
                      placeholderTextColor={Theme.colors.mutedForeground}
                      keyboardType="numeric"
                      editable={!isLoading}
                      maxLength={10}
                      selectTextOnFocus={false}
                      autoCorrect={false}
                      autoCapitalize="none"
                      spellCheck={false}
                      // Prevent keyboard from pushing content up
                      keyboardAppearance="dark"
                    />
                  </View>
                  
                  {/* Validation Info */}
                  <View style={styles.validationInfo}>
                    <Text style={styles.infoText}>
                      Min: ₹{MIN_REDEEM_AMOUNT} | Max: ₹{MAX_REDEEM_AMOUNT.toLocaleString()}
                    </Text>
                  </View>

                  {/* Error Message */}
                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.submitButton,
                      (!isValid || isLoading) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={Theme.colors.primaryForeground}
                      />
                    ) : (
                      <Text style={[
                        styles.submitButtonText,
                        (!isValid || isLoading) && styles.submitButtonTextDisabled
                      ]}>
                        Request Redemption
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Success State */
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <CheckCircle size={48} color="#22c55e" />
                </View>
                <Text style={styles.successTitle}>Redemption Request Sent!</Text>
                <Text style={styles.successMessage}>
                  Your redemption request has been submitted successfully and will be processed within 24-48 hours.
                </Text>
                <Text style={styles.successAmount}>
                  ₹{parseFloat(redeemAmount).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

// Main component with stable props
export const RedeemModalOptimized: React.FC<RedeemModalProps> = React.memo((props) => {
  return <RedeemModalContent {...props} />;
});

RedeemModalOptimized.displayName = 'RedeemModalOptimized';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.colors.foreground,
  },
  closeButton: {
    padding: 4,
  },
  balanceCard: {
    backgroundColor: '#110C24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  balanceLabel: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.foreground,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#110C24',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  validationInfo: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#110C24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.foreground,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primaryForeground,
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.colors.foreground,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  successAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
});
