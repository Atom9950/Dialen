import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import Avatar from './Avatar'
import Typo from './Typo'
import moment from 'moment'
import { ConversationListItemProps } from '@/types'
import { useAuth } from '@/contexts/authContext'

interface ExtendedConversationListItemProps extends ConversationListItemProps {
  onLongPress?: () => void;
}

const ConversationItem = ({item, showDivider, router, onLongPress}: ExtendedConversationListItemProps) => {

    const {user: currentUser} = useAuth();

    const lastMessage: any = item.lastMessage
    const isDirect = item.type == "direct";
    let avatar = item.avatar;
    const otherParticipants = isDirect?
    item.participants.find(p => p._id !=currentUser?.id)
    : null;
    if (isDirect && otherParticipants) avatar = otherParticipants.avatar;

    const getLastMessageContent = () => {
      if(!lastMessage) return " No messages yet";

      return lastMessage?.attachment? "📎 Sent an Attachment" : lastMessage?.content;
    }

    const getLastMessageDate = () => {
      if(!lastMessage?.createdAt) return null;
      const messageDate = moment(lastMessage.createdAt);
      const today = moment();

      if (messageDate.isSame(today, 'day')) {
          return messageDate.format('h:mm A'); // e.g., 3:45 PM
      }
      if (messageDate.isSame(today, 'year')) {
          return messageDate.format('MMM DD');
      }
      return messageDate.format('DD/MM/YYYY');
    }

     const openConversation = () => {
      router.push({
        pathname: '/(main)/conversation',
        params:{
          id: item._id,
          name: item.name,
          avatar: item.avatar,
          type: item.type,
          participants: JSON.stringify(item.participants),
        }
      });
    }
  return (
    <View>
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={openConversation}
        onLongPress={onLongPress}
        delayLongPress={500}
      >
        <View>
          <Avatar uri={avatar} size={47} isGroup={item.type == "group"}/>
        </View>

        <View style={{flex:1}}>
            <View style={styles.row}>
                <Typo size={17} fontWeight={'600'}>
                    {isDirect? otherParticipants?.name: item?.name}
                </Typo>
                {item.lastMessage && <Typo size={15}>{getLastMessageDate()}</Typo>}
            </View>

            <Typo size={15} color={colors.neutral600} textProps={{numberOfLines:1}}>{getLastMessageContent()}</Typo>
        </View>
      </TouchableOpacity>
      {
        showDivider && <View style={styles.divider}/>
      }
    </View>
  )
}

export default ConversationItem

const styles = StyleSheet.create({
    conversationItem: {
    gap: spacingX._10,
    marginVertical: spacingY._12,
    flexDirection: "row",
    alignItems: "center",
},

row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
},

divider: {
    height: 1,
    width: "95%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.07)",
},

})