import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_PRESET_NAME } from "@/constants";
import { ResponseProps } from "@/types";
import axios from "axios";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export const uploadFileToCloudinary = async(
    file: {uri: string; type?: string; fileName?: string; mimeType?: string} | string,
    folderName: string
): Promise<ResponseProps> => {

    try {
        if(!file) return {success: true, data: null};

        // Already uploaded file url
        if(typeof file == 'string') return {success: true, data: file};

        if(file && file.uri){
            console.log('Starting upload with file:', {
                uri: file.uri,
                type: file.type || file.mimeType,
                fileName: file.fileName
            });
            
            // Ready to upload
            const formData = new FormData();
            
            formData.append("file", {
                uri: file.uri,
                type: file.mimeType || file.type || "image/jpeg",  // Use mimeType from picker
                name: file.fileName || file.uri.split('/').pop() || "photo.jpg"
            } as any);

            formData.append('upload_preset', CLOUDINARY_PRESET_NAME);
            formData.append('folder', folderName);

            console.log('Uploading to:', CLOUDINARY_API_URL);
            console.log('Upload preset:', CLOUDINARY_PRESET_NAME);

            const response = await axios.post(CLOUDINARY_API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000, // Increased to 60 seconds for large files
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    console.log(`Upload Progress: ${percentCompleted}%`);
                }
            });
            
            console.log('Upload successful:', response.data.secure_url);
            
            return {
                success: true,
                data: response?.data?.secure_url
            };
        }
        
        return {success: true, data: null}
        
    } catch (error: any) {
        console.log("Upload error details:", {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            request: error.request ? 'Request made but no response' : 'No request',
        });
        
        // Better error handling
        let errorMsg = "Error uploading file";
        if (error.response) {
            // Server responded with error
            console.log('Server error response:', error.response.data);
            errorMsg = error.response.data?.error?.message || errorMsg;
        } else if (error.request) {
            // Network error
            console.log('Network error - no response received');
            errorMsg = "Network error. Please check your connection.";
        } else {
            console.log('Error setting up request:', error.message);
        }
        
        return {
            success: false,
            msg: error.msg || errorMsg
        }
    }
}

export const getAvatarPath = (file: any, isGroup: boolean) => {
    if(file && typeof file === 'string') return file;
    
    if(file && typeof file === 'object') return file.uri;

    if(isGroup) return require('../assets/images/defaultGroupAvatar.png');

    return require('../assets/images/defaultAvatar.png');
}