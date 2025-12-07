import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/contexts/authContext'

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Define your index/starting route */}
      <Stack.Screen name="index" />
      
      {/* Configure the modal */}
      <Stack.Screen
        name="(main)/profileModal"
        options={{ presentation: "modal" }}
      />

            <Stack.Screen
        name="(main)/newConversationModal"
        options={{ presentation: "modal" }}
      />
    </Stack>
  )
}

const RootLayout = () => {
  return(
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  )
}

export default RootLayout

const styles = StyleSheet.create({})