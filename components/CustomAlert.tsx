import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: "#8EC5FC",
  secondary: "#E0C3FC",
  accent: "#9B89B3",
  text: "#4A4A6A",
  lightText: "#6B6B8D",
  background: "#F4F1F8",
  card: "#FFFFFF",
  shadow: "#8E8EC5",
  border: "#CDC3FC",
  success: "#4CAF50",
  info: "#2196F3",
  warning: "#FF9800",
  error: "#F44336",
};

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  type = 'info', // 'success', 'info', 'warning', 'error'
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
  onCancel,
  onConfirm,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  // Determine icon and color based on alert type
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: COLORS.success,
          bgColor: `${COLORS.success}20`, // 20% opacity
        };
      case 'warning':
        return {
          icon: 'warning',
          color: COLORS.warning,
          bgColor: `${COLORS.warning}20`,
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: COLORS.error,
          bgColor: `${COLORS.error}20`,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          color: COLORS.info,
          bgColor: `${COLORS.info}20`,
        };
    }
  };
  
  const alertStyle = getAlertStyles();
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Animated.View 
          style={[
            styles.modalView,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              borderColor: alertStyle.color,
            }
          ]}
        >
          <View style={[styles.headerContainer, { backgroundColor: alertStyle.bgColor }]}>
            <Ionicons name={alertStyle.icon} size={30} color={alertStyle.color} />
            <Text style={[styles.title, { color: alertStyle.color }]}>{title}</Text>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel || onClose}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: alertStyle.color },
                showCancel && { marginLeft: 10 }
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: width * 0.85,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 10,
  },
  contentContainer: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    paddingTop: 5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmText: {
    color: COLORS.card,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default CustomAlert;