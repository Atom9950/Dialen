import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { colors } from '@/constants/theme'

import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'

const SplashScreen = () => {

    // const router = useRouter()
    // useEffect(() => {
    //   setTimeout(()=>{
    //     (router.replace ('/(auth)/welcome'))
    //   },1500)
    // }, [])

  return (
    <View style={styles.container}>
        <StatusBar barStyle={'light-content'} backgroundColor={colors.neutral900}/>
        <Animated.Image
        source={require('../assets/images/splashImage.png')}
        entering={FadeInDown.duration(700).springify()}
        style={styles.logo}
        resizeMode={"contain"}
        />
      
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral900
    },
    logo: {
        height: "23%",
        aspectRatio: 1,
    },
});
