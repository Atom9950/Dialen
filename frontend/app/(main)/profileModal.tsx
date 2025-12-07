import { Platform, StyleSheet, Text, View, Animated, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ScreenWrapper from '@/components/ScreenWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import Avatar from '@/components/Avatar'
import * as Icons from 'phosphor-react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { useAuth } from '@/contexts/authContext'
import { UserDataProps } from '@/types'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'
import { updateProfile } from '@/socket/socketEvents'
import * as ImagePicker from 'expo-image-picker'
import { uploadFileToCloudinary } from '@/services/imageService'
import ImagePreview from '@/components/ImagePreview'

const ProfileModal = () => {

    const {user, signOut, updateToken} = useAuth()
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<string>('')
    const [showImagePreview, setShowImagePreview] = useState(false)
    const router = useRouter()

    const [userData, setUserData] = useState<UserDataProps>({
        name: "",
        email: "",
        avatar: null
    })

    useEffect(() => {
        updateProfile(processUpdateProfile);

        return () => {
            updateProfile(processUpdateProfile, true);
        }
    }, [])

    const processUpdateProfile = (res : any) => {
        console.log("got response: ", res);
        setLoading(false);
        setUploadProgress('');

        if(res.success){
            Alert.alert(
                "Success", 
                "Profile updated successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            updateToken(res.data.token);
                            router.back();
                        }
                    }
                ]
            );
        }else{
            Alert.alert("Error", res.message || "Failed to update profile");
        }
    }
    

    useEffect(() => {
        setUserData({
            name: user?.name || "",
            email: user?.email || "",
            avatar: user?.avatar
        })
    }, [user]);

    const onPickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
        });

        console.log(result);

        if (!result.canceled) {
            setUserData({...userData, avatar:result.assets[0]});
        }
    }

    const onDeleteAvatar = () => {
        Alert.alert(
            "Delete Avatar",
            "Are you sure you want to remove your profile picture?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        setUserData({...userData, avatar: null});
                    }
                }
            ]
        );
    }

    const handleAvatarPress = () => {
        if (userData.avatar) {
            setShowImagePreview(true);
        }
    }

    const handleLogout = async() => {
       router.back();
       await signOut();
    }

    const showLogoutAlert = () => {
        Alert.alert("Are you sure?", "You want to Logout?",[
            {text: "Cancel",
                onPress: () => console.log("cancel logout"),
                style: "cancel"
            },
            {text: "Logout",
                onPress: () => handleLogout(),
                style: "destructive"
            }
        ])
    }

    const onSubmit = async () => {
        let {name, avatar} = userData;
        if(!name.trim()){
            Alert.alert("Error", "Please enter your Name");
            return;
        } 
        
        let data = {
            name,
            avatar
        };

        if(avatar && avatar?.uri){
            setLoading(true);
            setUploadProgress('Uploading image...');
            
            const res = await uploadFileToCloudinary(avatar, "profile");
            
            if(res.success){
                data.avatar = res.data;
                setUploadProgress('Image uploaded! Updating profile...');
            }else{
                Alert.alert("Upload Failed", res.msg || "Failed to upload image");
                setLoading(false);
                setUploadProgress('');
                return;
            }
        } else {
            setLoading(true);
            setUploadProgress('Updating profile...');
        }

        updateProfile(data);
    };

    const getImageUri = () => {
        if (userData.avatar) {
            if (typeof userData.avatar === 'string') {
                return userData.avatar;
            }
            if (userData.avatar.uri) {
                return userData.avatar.uri;
            }
        }
        return null;
    };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={"Update Profile"}
          leftIcon={
            Platform.OS == "android" && <BackButton color={colors.black}/>
          }
          style={{marginVertical: spacingY._15}}
        />

        {/* form */}
        <Animated.ScrollView 
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleAvatarPress} disabled={loading} activeOpacity={0.8}>
              <Avatar uri={userData.avatar} size={140}/>
            </TouchableOpacity>
            
            {/* Edit Icon - Left Side */}
            <TouchableOpacity 
              style={[styles.actionIcon, styles.editIcon]} 
              onPress={onPickImage} 
              disabled={loading}
            >
                <Icons.PencilSimple size={verticalScale(28)} color={colors.neutral800} />
            </TouchableOpacity>

            {/* Delete Icon - Right Side */}
            {userData.avatar && (
              <TouchableOpacity 
                style={[styles.actionIcon, styles.deleteIcon]} 
                onPress={onDeleteAvatar} 
                disabled={loading}
              >
                  <Icons.Trash size={verticalScale(28)} color={colors.rose} />
              </TouchableOpacity>
            )}
          </View>

          {uploadProgress ? (
            <View style={styles.progressContainer}>
              <Typo style={styles.progressText} size={14} color={colors.primary}>
                {uploadProgress}
              </Typo>
            </View>
          ) : null}

          <View style={{gap: spacingY._20}}>
            <View style={styles.inputContainer}>
                <Typo style={{paddingLeft: spacingX._10}}>Email</Typo>

                <Input
                value= {userData.email}
                containerStyle={{
                    borderColor: colors.neutral350,
                    paddingLeft: spacingX._20,
                    backgroundColor: colors.neutral300
                }}
                onChangeText={value => setUserData({...userData, email: value})}
                editable={false}
                />
            </View>
            <View style={styles.inputContainer}>
                <Typo style={{paddingLeft: spacingX._10}}>Name</Typo>

                <Input
                value= {userData.name}
                containerStyle={{
                    borderColor: colors.neutral350,
                    paddingLeft: spacingX._20,
                }}
                onChangeText={value => setUserData({...userData, name: value})}
                editable={!loading}
                />
            </View>
          </View>
        </Animated.ScrollView>
      </View>

      <View style={styles.footer}>
        {
            !loading && (
                <Button
                style={{
                    backgroundColor: colors.rose,
                    height: verticalScale(56),
                    width: verticalScale(56)
                }}
                onPress={showLogoutAlert}
                >
                    <Icons.SignOut size={verticalScale(30)} color={colors.white} weight="bold"/>
                </Button>
            )}
        

        <Button style={{flex:1}} onPress={onSubmit} loading={loading} disabled={loading}>
            <Typo color={colors.black} fontWeight={'700'}>
                {loading ? 'Updating...' : 'Update'}
            </Typo>
        </Button>
      </View>

      {/* Image Preview */}
      <ImagePreview 
        visible={showImagePreview}
        imageUri={getImageUri()}
        onClose={() => setShowImagePreview(false)}
      />
    </ScreenWrapper>
  )
}

export default ProfileModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral200,
    marginBottom: spacingY._10,
    borderTopWidth: 1,
  },

  form: {
    paddingTop: spacingY._15,
    flexGrow: 0,
  },

  avatarContainer: {
    alignSelf: "center",
  },
  
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  
  actionIcon: {
    position: "absolute",
    bottom: spacingY._5,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },

  editIcon: {
    left: spacingY._7,
  },

  deleteIcon: {
    right: spacingY._7,
  },

  inputContainer: {
    gap: spacingY._7,
  },

  progressContainer: {
    alignItems: 'center',
    paddingVertical: spacingY._10,
  },

  progressText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
})