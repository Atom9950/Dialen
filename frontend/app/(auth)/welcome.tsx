import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Animated, { FadeIn } from 'react-native-reanimated'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'


const welcome = () => {
    const router = useRouter()
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
        <View style={styles.container}>
            <View style={{alignItems: "center"}}>
                <Typo size={43} fontWeight={"900"} color={colors.white}>Dialen</Typo>
            </View>

            <Animated.Image
                entering={FadeIn.duration(700).springify()}
                source={require('@/assets/images/welcome.png')}
                style={styles.welcomeImage}
                resizeMode="contain"
            />
            <View>
                <Typo style={{alignSelf:"center"}}size={33} fontWeight={"800"} color={colors.white}>Real Chats. Real You.</Typo>
                <Typo style={{alignSelf:"center"}}size={29} fontWeight={"800"} color={colors.white}>Discover your self</Typo>
                <Typo style={{alignSelf:"center"}}size={25} fontWeight={"800"} color={colors.white}>with Dialen!</Typo>
            </View>
            <View style={{gap: spacingX._10}}>
                    <Button onPress={() => router.push('/(auth)/register')} style={{backgroundColor:colors.white}}>
                        <Typo size={17} fontWeight={"bold"}>Get Started</Typo>
                    </Button>
                </View>
            </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._10,
        marginVertical: spacingX._40,
    },
    background:{
        flex: 1,
        backgroundColor: colors.neutral900
    },
    welcomeImage:{
       height: verticalScale(300),
       aspectRatio: 1,
       alignSelf:'center',
    }
})
