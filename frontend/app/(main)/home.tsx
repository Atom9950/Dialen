import { StyleSheet, Text, TouchableOpacity, View, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Typo from '@/components/Typo'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { getConversations, newConversation, newMessage, deleteConversation, conversationDeleted } from '@/socket/socketEvents'
import { verticalScale } from '@/utils/styling'
import * as Icons from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import Animated from 'react-native-reanimated'
import ConversationItem from '@/components/ConversationItem'
import Loading from '@/components/Loading'
import { ConversationProps, ResponseProps } from '@/types'

const Home = () => {
    const { user: currentUser, signOut } = useAuth();
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState<ConversationProps[]>([]);
    const [selectedTab, setSelectedTab] = useState(0)
    const [selectedConversation, setSelectedConversation] = useState<ConversationProps | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Extract first name from full name
    const firstName = currentUser?.name?.split(' ')[0] || '';

    useEffect(()=>{
       getConversations(processConversations)
       newConversation(newConversationHandler)
       newMessage(newMessageHandler)
       conversationDeleted(conversationDeletedHandler)
       deleteConversation(handleDeleteResponse)

       getConversations(null)

       return () => {
        getConversations(processConversations, true);
        newConversation(newConversationHandler, true);
        newMessage(newMessageHandler, true);
        conversationDeleted(conversationDeletedHandler, true);
        deleteConversation(handleDeleteResponse, true);
       }
    }, [])

    const newMessageHandler = (res: ResponseProps) => {
      if(res.success){
        let conversationId = res.data.conversationId;
        setConversations((prev) => {
          let updatedConversations = prev.map((item) => {
            if(item._id === conversationId) item.lastMessage = res.data;
            return item;
          })
          return updatedConversations;
        })
      }
    }

    const processConversations = (res: ResponseProps) => {
      if(res.success){
        setConversations(res.data);
      }
    }

    const newConversationHandler = (res: ResponseProps) => {
      if(res.success && res.data?.isNew) {
        setConversations((prev) => [...prev, res.data]);
      }
    }

    const conversationDeletedHandler = (res: ResponseProps) => {
      // When another user deletes a conversation, remove it from this user's list
      console.log("Conversation deleted by another user:", res);
      if(res.success && res.data?.conversationId){
        setConversations((prev) => 
          prev.filter((item) => item._id !== res.data.conversationId)
        );
      }
    }

    const handleLongPress = (conversation: ConversationProps) => {
      setSelectedConversation(conversation);
      setShowDeleteModal(true);
    }

    const handleDelete = () => {
      if (!selectedConversation) return;

      // Emit the delete request
      deleteConversation({ conversationId: selectedConversation._id });
      
      // Close modal and remove from UI immediately (optimistic update)
      setConversations((prev) => 
        prev.filter((item) => item._id !== selectedConversation._id)
      );
      setShowDeleteModal(false);
      setSelectedConversation(null);
    }

    const handleDeleteResponse = (res: ResponseProps) => {
      if (!res.success) {
        Alert.alert('Error', 'Failed to delete conversation');
        // Refresh conversations on error
        getConversations(null);
      }
    }

    const handleLogout = async () => {
        await signOut()
    }

    let directConversations = conversations
      .filter((item: ConversationProps) => item?.type === "direct")
      .sort((a: ConversationProps, b: ConversationProps) => {
        const aDate = a?.lastMessage?.createdAt || a?.createdAt || 0;
        const bDate = b?.lastMessage?.createdAt || b?.createdAt || 0;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

    let groupConversations = conversations
      .filter((item: ConversationProps) => item?.type === "group")
      .sort((a: ConversationProps, b: ConversationProps) => {
        const aDate = a?.lastMessage?.createdAt || a?.createdAt || 0;
        const bDate = b?.lastMessage?.createdAt || b?.createdAt || 0;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Typo color={colors.neutral200} size={19} textProps={{numberOfLines: 1}}>
              Welcome Back {""}
              <Typo size={19} color={colors.white} fontWeight={"800"}>{firstName}</Typo>{" "}
              👋
            </Typo>
          </View>
          <TouchableOpacity style={styles.settingIcon} onPress={() => router.push("/(main)/profileModal")}>
            <Icons.GearSix color={colors.white} weight={"fill"} size={verticalScale(22)}/>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Animated.ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: spacingY._20}}>
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setSelectedTab(0)} style={[styles.tabStyle, selectedTab === 0 && styles.activeTabStyle]}>
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab(1)} style={[styles.tabStyle, selectedTab === 1 && styles.activeTabStyle]}>
                  <Typo>Groups</Typo>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.conversationList}>
              {
                selectedTab === 0 && directConversations.map((item: ConversationProps, index) =>{
                  return(
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversations.length != index+1}
                      onLongPress={() => handleLongPress(item)}
                    />
                  )
                })
              }
              {
                selectedTab === 1 && groupConversations.map((item: ConversationProps, index) =>{
                  return(
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={groupConversations.length != index+1}
                      onLongPress={() => handleLongPress(item)}
                    />
                  )
                })
              }
            </View>

            {
              !loading && selectedTab == 0 && directConversations.length == 0 && (
              <Typo style={{textAlign:"center"}}> 
                No Direct Messages 
              </Typo>
              )
            }
            {
              !loading && selectedTab == 1 && groupConversations.length == 0 && (
                <Typo style={{textAlign:"center"}}> 
                  No Groups 
                </Typo>
              )
            }
            {
              loading && <Loading />
            }
          </Animated.ScrollView>
        </View>
      </View>

      <Button
        style={styles.floatingButton}
        onPress={() => router.push({
          pathname: "/(main)/newConversationModal",
          params: {isGroup: selectedTab}
        })}
      >
        <Icons.Plus
          color={colors.black}
          weight='bold'
          size={verticalScale(24)}
        />
      </Button>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icons.Warning size={verticalScale(48)} color={colors.rose} weight="fill" />
            
            <Typo size={20} fontWeight="700" style={styles.modalTitle}>
              Delete Conversation?
            </Typo>
            
            <Typo size={14} color={colors.neutral500} style={styles.modalMessage}>
              Are you sure you want to delete this conversation with{' '}
              <Typo fontWeight="600">{selectedConversation?.name}</Typo>? This action cannot be undone.
            </Typo>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedConversation(null);
                }}
              >
                <Typo fontWeight="600">Cancel</Typo>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Typo fontWeight="600" color={colors.white}>Delete</Typo>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container:{
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: "row",
    gap: spacingX._15,
    alignItems: "center",
    paddingHorizontal: spacingX._10,
  },
  tabs: {
    flexDirection: "row",
    gap: spacingX._10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radius._20,
    padding: spacingY._25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    marginTop: spacingY._15,
    marginBottom: spacingY._10,
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: spacingY._25,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacingX._15,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacingY._15,
    borderRadius: radius._15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.neutral100,
  },
  deleteButton: {
    backgroundColor: colors.rose,
  },
})