import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { ButtonProps } from '@/types'
import { colors, radius } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Loading from './Loading'

const Button = ({
    style,
    onPress,
    children,
    loading=false,

}: ButtonProps) => {
    if(loading) {
        return (
        <View style={[styles.button, style, {backgroundColor:"transparent"}]}>
            <Loading/>
        </View>
        )
    }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {children}
    </TouchableOpacity>
  )
}

export default Button

const styles = StyleSheet.create({
    button: {
        padding: 10,
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        borderCurve: "continuous",
        height: verticalScale(50),
        // width: "100%",
        justifyContent: "center",
        alignItems: "center",
        // alignSelf: "center",
    },
})
