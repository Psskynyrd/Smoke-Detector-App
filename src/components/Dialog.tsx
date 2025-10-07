import { colors, radius } from "@/constants/theme";
import { DialogPropsType } from "@/types/app.types";
import { verticalScale } from "@/utils/styling";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Dialog = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: DialogPropsType) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.backdrop}>
      <View style={styles.dialog}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={onConfirm} style={styles.confirm}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default Dialog;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._20,
    padding: verticalScale(30),
    width: verticalScale(300),
    borderWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  confirm: {
    backgroundColor: "#333",
    paddingVertical: verticalScale(10),
    paddingHorizontal: verticalScale(20),
    borderRadius: radius._30,
  },
  cancel: {
    marginLeft: 10,
    paddingVertical: verticalScale(10),
    paddingHorizontal: verticalScale(20),
    borderRadius: radius._30,
    backgroundColor: colors.neutral200,
  },
  confirmText: {
    color: colors.neutral100,
    fontWeight: "500",
  },
  cancelText: {
    color: colors.neutral800,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
