import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { BallIndicator } from 'react-native-indicators';

const ActivityIndicatorModal = ({ visible, title }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <BallIndicator color="#3498db" size={50} />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default ActivityIndicatorModal;
