import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import BackButton from '@/components/BackButton'
import  Animated  from 'react-native-reanimated'
import Input from '@/components/Input'
import * as Icons from 'phosphor-react-native'
import { verticalScale } from '@/utils/styling'
import { useRef } from 'react'
import { useRouter } from 'expo-router'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'

const Login = () => {
    const emailRef= useRef("");
    const passwordRef= useRef("")

    const [isLoading, setIsLoading]= useState(false)
    const [showPassword, setShowPassword] = useState(false) // Add this state
    const router = useRouter();
    const {signIn} = useAuth()

    const handleSubmit = async() =>{
        if( !emailRef.current || !passwordRef.current ){
            Alert.alert('Login','Please fill in all the fields');
            return;
        }

        // Handle the sign up logic here...
        try {
                    setIsLoading(true);
                    await signIn(emailRef.current, passwordRef.current);
                  } catch (error: any) {
                    Alert.alert('Login Error', error.message);
                  } finally {
                    setIsLoading(false);
                  }
    }
    
  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenWrapper showPattern={true} bgOpacity={0.5}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton iconSize={24} />
            <Typo size={15} color={colors.white}>
              Forgotten Password?
            </Typo>
          </View>
          <View style={styles.content}>
            <Animated.ScrollView 
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
            >
              <View style={{gap: spacingY._10, marginBottom: spacingY._15, paddingHorizontal: spacingX._10}}>
                <Typo size={28} fontWeight="600">Welcome Back</Typo>
                <Typo size={15} color={colors.neutral600}>Login to your existing account</Typo>
              </View>
              
              <Input
                placeholder="Enter your email"
                onChangeText={(value: string) => emailRef.current=value}
                icon={
                  <Icons.At
                    size={verticalScale(26)}
                    color={colors.neutral600}
                  />
                }
              />
              <Input
                placeholder="Enter your password"
                secureTextEntry={!showPassword} // Toggle based on state
                onChangeText={(value: string) => passwordRef.current=value}
                icon={
                  <Icons.Lock
                    size={verticalScale(26)}
                    color={colors.neutral600}
                  />
                }
                rightIcon={ // Add right icon prop
                  showPassword ? (
                    <Icons.Eye
                      size={verticalScale(24)}
                      color={colors.neutral600}
                    />
                  ) : (
                    <Icons.EyeSlash
                      size={verticalScale(24)}
                      color={colors.neutral600}
                    />
                  )
                }
                onRightIconPress={() => setShowPassword(!showPassword)} // Toggle function
              />
              <View style={{marginTop: spacingY._25, gap: spacingX._10}}>
                <Button loading={isLoading} onPress={handleSubmit}>
                    <Typo fontWeight={"bold"} color={colors.black} size={17}>Login</Typo>
                </Button>

                <View style={styles.footer}>
                  <Text>Don't have an account?</Text>
                  <Pressable onPress={()=>router.push("/(auth)/register")}>
                    <Typo color={colors.primary} fontWeight={"bold"} size={12}>Sign Up</Typo>
                  </Pressable>
                </View>


              </View>
            </Animated.ScrollView>
          </View>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._10,
    paddingTop: spacingY._20,
  },
  form: {
    gap: spacingY._15,
    marginTop: spacingY._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});