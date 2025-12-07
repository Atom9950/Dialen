// components/ImagePreview.tsx
import React from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import * as Icons from 'phosphor-react-native';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import Typo from './Typo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImagePreviewProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ visible, imageUri, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.previewContainer}>
        <TouchableOpacity 
          style={styles.previewBackground} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <View style={styles.previewHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Icons.X size={verticalScale(30)} color={colors.white} weight="bold"/>
            </TouchableOpacity>
          </View>

          <View style={styles.previewImageContainer}>
            {imageUri ? (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <Typo color={colors.white}>No image available</Typo>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImagePreview;

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },

  previewBackground: {
    flex: 1,
  },

  previewHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  closeButton: {
    padding: spacingY._10,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },

  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
  },

  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});