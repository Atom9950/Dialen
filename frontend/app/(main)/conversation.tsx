import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useLocalSearchParams } from 'expo-router'
import { useAuth } from '@/contexts/authContext'
import { scale, verticalScale } from '@/utils/styling'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import Avatar from '@/components/Avatar'
import * as Icons from 'phosphor-react-native'
import MessageItem from '@/components/MessageItem'
import Animated from 'react-native-reanimated'
import Input from '@/components/Input'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import Loading from '@/components/Loading'
import { uploadFileToCloudinary } from '@/services/imageService'
import { getMessages, newMessage } from '@/socket/socketEvents'
import { MessageProps, ResponseProps } from '@/types'


const Conversation = () => {
    
    const {user: currentUser} = useAuth();

    const {
        id: conversationId,
        name,
        participants: stringifiedParticipants,
        avatar,
        type
    } = useLocalSearchParams();

    const [message, setMessage] = useState("")
    const [selectedFile, setSelectedFile] = useState<{uri: string} | null>(null);
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<MessageProps[]>([]);
    
    // Search states
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const flatListRef = useRef<any>(null);

    const participants = JSON.parse(stringifiedParticipants as string);

    let conversationAvatar = avatar;
    let isDirect = type == "direct";
    const otherParticipants = isDirect?
    participants.find((p: any) => p._id !=currentUser?.id)
    : null;

    if (isDirect && otherParticipants) 
        conversationAvatar = otherParticipants.avatar;

    let conversationName = isDirect? otherParticipants.name : name;

    useEffect(() => {
        newMessage(newMessageHandler);
        getMessages(messagesHandler);
        getMessages({conversationId});

        return () => {
            newMessage(newMessageHandler, true);
            getMessages(messagesHandler, true);
        }
    }, [])

    const newMessageHandler = (res: ResponseProps) => {
        setLoading(false);
            if(res.success) {
                if(res.data.conversationId == conversationId){
                    setMessages((prev) => [res.data as MessageProps, ...prev])
                }
            } else {
                Alert.alert("Error", res.msg);
             }
    }

    const messagesHandler = (res: ResponseProps) => {
        if(res.success) 
            console.log("Fetched messages:", JSON.stringify(res.data, null, 2));
            setMessages(res.data);
    };



    // Search function
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        
        if (!query.trim()) {
            setSearchResults([]);
            setCurrentSearchIndex(0);
            return;
        }

        // Search through messages
        const results = messages.filter(msg => 
            msg.content.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(results);
        setCurrentSearchIndex(0);
        
        // Scroll to first result if found
        if (results.length > 0) {
            scrollToMessage(results[0].id);
        }
    };

    // Navigate through search results
    const goToNextResult = () => {
        if (searchResults.length === 0) return;
        
        const nextIndex = (currentSearchIndex + 1) % searchResults.length;
        setCurrentSearchIndex(nextIndex);
        scrollToMessage(searchResults[nextIndex].id);
    };

    const goToPreviousResult = () => {
        if (searchResults.length === 0) return;
        
        const prevIndex = currentSearchIndex === 0 
            ? searchResults.length - 1 
            : currentSearchIndex - 1;
        setCurrentSearchIndex(prevIndex);
        scrollToMessage(searchResults[prevIndex].id);
    };

    // Scroll to specific message
    const scrollToMessage = (messageId: string) => {
        const reversedMessages = [...messages].reverse();
        const index = reversedMessages.findIndex(msg => msg.id === messageId);
        
        if (index !== -1 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: index,
                    animated: true,
                    viewPosition: 0.5
                });
            }, 100);
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setCurrentSearchIndex(0);
        setShowSearch(false);
    };

    const onPickFile = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.3,
        });

        console.log(result);

        if (!result.canceled) {
            setSelectedFile(result.assets[0]);
        }
    }

    const onSend = async () => {
        if(!message.trim() && !selectedFile) return;
        if(!currentUser) return;

        setLoading(true);
        try {
            let attachment = null;
            if(selectedFile){
                const uploadResult = await uploadFileToCloudinary(
                    selectedFile,
                    "message_attachments"
                );
                if (uploadResult.success){
                    attachment = uploadResult.data;
                }else{
                    setLoading(false);
                    Alert.alert("Error", uploadResult.msg || "Failed to upload attachment");
                    return;
                }
            }
            newMessage({
                conversationId,
                sender:{
                    id: currentUser?.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar
                },
                content: message.trim(),
                attachment
            });

            // Clear inputs after successful send
            setMessage("");
            setSelectedFile(null);

        } catch (error) {
            console.log("Error sending message: ", error);
            Alert.alert("Error", "Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Create reversed messages array for FlatList
    // const reversedMessages = [...dummyMessages].reverse();

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView 
        behavior={Platform.OS == "ios"? "padding" : "height"}
        style={styles.container}
      >
        {/* header */}
        {showSearch ? (
            <View style={styles.searchHeader}>
                <TouchableOpacity onPress={handleClearSearch} style={styles.backButton}>
                    <Icons.XIcon color={colors.white} size={28} weight="bold" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <TextInput
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder="Search messages..."
                        placeholderTextColor="#888888"
                        style={styles.searchInput}
                        autoFocus={true}
                    />
                </View>
                <View style={styles.searchNavigation}>
                    {searchResults.length > 0 ? (
                        <>
                            <Typo color={colors.white} size={14} fontWeight={600}>
                                {currentSearchIndex + 1}/{searchResults.length}
                            </Typo>
                            <TouchableOpacity onPress={goToPreviousResult} style={styles.searchNavButton}>
                                <Icons.CaretUpIcon color={colors.white} size={20} weight="bold" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goToNextResult} style={styles.searchNavButton}>
                                <Icons.CaretDownIcon color={colors.white} size={20} weight="bold" />
                            </TouchableOpacity>
                        </>
                    ) : searchQuery.trim() ? (
                        <Typo color={colors.white} size={14}>No results</Typo>
                    ) : null}
                </View>
            </View>
        ) : (
            <Header
                style={styles.header}
                leftIcon={
                    <View style={styles.headerLeft}>
                        <BackButton/>
                        <Avatar
                            size={40}
                            uri={conversationAvatar as string}
                            isGroup={type=="group"}
                        />
                        <Typo color={colors.white} size={20} fontWeight={500}>{conversationName}</Typo>
                    </View>
                }
                rightIcon={
                    <TouchableOpacity 
                        style={{marginBottom: verticalScale(7)}}
                        onPress={() => setShowSearch(true)}
                    >
                        <Icons.MagnifyingGlassIcon
                            color={colors.white}
                            weight="bold"
                            size={24}
                        />
                    </TouchableOpacity>
                }
            />
        )}

        {/* messages */}
        <View style={styles.content}>
            <Animated.FlatList
                ref={flatListRef}
                data={messages}
                inverted={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesContent}
                renderItem={({item}) => (
                    <MessageItem 
                        item={item} 
                        isDirect={isDirect}
                        isHighlighted={searchResults.some(r => r.id === item.id)}
                    />     
                )}
                keyExtractor={(item) => item.id}
                onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({
                            index: info.index,
                            animated: true,
                            viewPosition: 0.5
                        });
                    }, 100);
                }}
            />

            <View style={styles.footer}>
                <Input
                    value={message}
                    onChangeText={setMessage}
                    containerStyle={{
                        paddingLeft: spacingX._10,
                        paddingRight: scale(65),
                        borderRightWidth: 0
                    }}
                    placeholder='Type a message'
                    icon={
                        <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                            <Icons.PlusIcon
                                color={colors.black}
                                weight='bold'
                                size={verticalScale(22)}
                            />
                            {
                                selectedFile && selectedFile.uri &&(
                                    <Image
                                        source={selectedFile.uri}
                                        style={styles.selectedFile}
                                    />    
                                )
                            }
                        </TouchableOpacity>
                    }
                />

                <View style={styles.inputRightIcon}>
                    <TouchableOpacity style={styles.inputIcon} onPress={onSend}>
                        {
                            loading ? (
                                <Loading size={"small"} color={colors.black}/>
                            ):(
                                <Icons.PaperPlaneTiltIcon
                                    color={colors.black}
                                    weight='fill'
                                    size={verticalScale(22)}
                                />
                            )
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

export default Conversation

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacingX._15,
        paddingTop: spacingY._10,
        paddingBottom: spacingY._15,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacingX._15,
        paddingTop: spacingY._10,
        paddingBottom: spacingY._15,
        gap: spacingX._10,
    },
    backButton: {
        padding: 5,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingLeft: 20,
        paddingRight: 15,
        height: 50,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000000',
        backgroundColor: 'transparent',
        height: 50,
        padding: 0,
    },
    closeSearchBtn: {
        padding: 5,
        marginLeft: 5,
    },
    searchNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
    },
    searchNavButton: {
        padding: 4,
        backgroundColor: colors.white + '20',
        borderRadius: radius._10,
    },
    inputRightIcon: {
        position: "absolute",
        right: scale(10),
        top: verticalScale(15),
        paddingLeft: spacingX._12,
        borderLeftWidth: 1.5,
        borderLeftColor: colors.neutral300,
    },
    selectedFile: {
        position: "absolute",
        height: verticalScale(38),
        width: verticalScale(38),
        borderRadius: radius.full,
        alignSelf: "center",
    },
    content: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: radius._50,
        borderTopRightRadius: radius._50,
        borderCurve: "continuous",
        overflow: "hidden",
        paddingHorizontal: spacingX._15,
    },
    inputIcon: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        padding: 8,
    },
    footer: {
        paddingTop: spacingY._7,
        paddingBottom: verticalScale(22),
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingTop: spacingY._50,
        paddingBottom: 300,
        gap: spacingY._25,
    },
    plusIcon: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        padding: 8,
    },
})