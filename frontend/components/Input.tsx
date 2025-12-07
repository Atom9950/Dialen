import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { InputProps } from '@/types'
import { colors, radius, spacingX } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'

const Input = (props: InputProps) => {
    const [isFocused, setIsFocused] = useState(false)
  return (
    <View style={[
        styles.container,
        props.containerStyle && props.containerStyle,
        isFocused && styles.primaryBorder
    ]}>
      {props.icon && props.icon}

      <TextInput
        style={[styles.input, props.inputStyle]}
        placeholderTextColor={colors.neutral400}
        ref={props.inputRef && props.inputRef}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {props.rightIcon && (
        <TouchableOpacity 
          onPress={props.onRightIconPress}
          style={styles.rightIconContainer}
          activeOpacity={0.7}
        >
          {props.rightIcon}
        </TouchableOpacity>
      )}
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: verticalScale(56),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.neutral200,
        borderRadius: radius.full,
        borderCurve: 'continuous',
        paddingHorizontal: spacingX._15,
        backgroundColor: colors.neutral100,
        gap: spacingX._10,
    },
    primaryBorder: {
        borderColor: colors.primary,
    },
    input: {
        flex: 1,
        fontSize: verticalScale(14),
        fontFamily: 'Poppins-Regular',
        color: colors.text,
    },
    rightIconContainer: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    }
})