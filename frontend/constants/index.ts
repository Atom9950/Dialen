import { Platform } from "react-native";

export const API_URL = Platform.OS === 'android' ? 'http://192.168.31.240:3000' : 'http://localhost:3000';

export const CLOUDINARY_CLOUD_NAME = "dsmywhmmy";

export const CLOUDINARY_PRESET_NAME = "images"