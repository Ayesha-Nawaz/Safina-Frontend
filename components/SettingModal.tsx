import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const SettingsModal = ({ isVisible, onClose, onNotifications, onDeleteAccount }) => {
  if (!isVisible) return null;

  const settingsOptions = [
    {
      id: 1,
      title: "Notification Settings",
      subtitle: "Manage your app notifications",
      icon: "bell",
      color: "#4CAF50",
      backgroundColor: "#E8F5E8",
      onPress: onNotifications,
    },
    {
      id: 2,
      title: "Delete Account",
      subtitle: "Permanently delete your account",
      icon: "trash",
      color: "#F44336", 
      backgroundColor: "#FFEBEE",
      onPress: onDeleteAccount,
    },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIconContainer}>
              <FontAwesome name="cog" size={24} color="#68007e" />
            </View>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalSubtitle}>Manage your preferences</Text>
          </View>

          {/* Settings Options */}
          <View style={styles.settingsContainer}>
            {settingsOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.settingOption, { backgroundColor: option.backgroundColor }]}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.settingIconContainer, { backgroundColor: option.color }]}>
                  <FontAwesome name={option.icon} size={20} color="#fff" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#B0BEC5" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(156, 144, 144, 0.42)",
    paddingHorizontal: 10,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 0,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 25,
    padding: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#68007e",
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#68007e",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#68007e",
    textAlign: "center",
  },
  settingsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#68007e",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#7F8C8D",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#68007e",
    marginHorizontal: 20,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    margin: 24,
    backgroundColor: "#68007e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#ffffff",
    marginLeft: 8,
  },
});

export default SettingsModal;