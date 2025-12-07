import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { MessageProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "./Avatar";
import Typo from "./Typo";
import moment from "moment";
import { Image } from "expo-image";
import ImagePreview from "./ImagePreview";

const MessageItem = ({
  item,
  isDirect,
  isHighlighted
}: { 
  item: MessageProps; 
  isDirect: boolean;
  isHighlighted?: boolean;
}) => {

    const {user: currentUser} = useAuth();
    const isMe = currentUser?.id === item.sender.id;

    const [showImagePreview, setShowImagePreview] = useState(false);

    const formattedDate = moment(item.createdAt).isSame(moment(), "day")
        ? moment(item.createdAt).format("h:mm A")
        : moment(item.createdAt).format("MMM D, h:mm A");

    const handleImagePress = () => {
        if (item.attachment) {
            setShowImagePreview(true);
        }
    };

  return (
    <>
      <View
          style={[
              styles.messageContainer,
              isMe ? styles.myMessage : styles.theirMessage,
              isHighlighted && styles.highlightedContainer
          ]}
      >
        {
          !isMe && !isDirect && (
              <Avatar
                  size={30}
                  uri={item.sender.avatar}
                  style={styles.messageAvatar}
              />
          )}

          <View 
              style={[
                  styles.messageBubble,
                  isMe? styles.myBubble : styles.theirBubble,
                  isHighlighted && styles.highlightedBubble
              ]}>
                  {
                      !isMe && !isDirect && (
                          <Typo color={colors.neutral900} fontWeight={"600"} size={13}>
                              {item.sender.name}
                          </Typo>
                      )
                  } 
                  {
                      item.attachment && (
                          <TouchableOpacity 
                              onPress={handleImagePress}
                              activeOpacity={0.8}
                          >
                              <Image
                                  source={item.attachment}
                                  style={styles.attachment}
                                  contentFit="cover"
                                  transition={100}
                              />
                          </TouchableOpacity>
                      )
                  }  

                  {
                      item.content && <Typo size={15}>{item.content}</Typo>
                  }  

                  <Typo
                      style={{alignSelf: "flex-end"}}
                      size={11}
                      color={colors.neutral600}
                      fontWeight={500}
                  >
                      {formattedDate}
                  </Typo>
          </View>
      </View>

      {/* Image Preview Modal */}
      <ImagePreview
          visible={showImagePreview}
          imageUri={item.attachment || null}
          onClose={() => setShowImagePreview(false)}
      />
    </>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        gap: spacingX._7,
        maxWidth: "80%",
    },

    myMessage: {
        alignSelf: "flex-end",
    },

    theirMessage: {
        alignSelf: "flex-start",
    },

    messageAvatar: {
        alignSelf: "flex-end",
    },
    
    attachment: {
        height: verticalScale(180),
        width: verticalScale(180),
        borderRadius: radius._10,
    },

    messageBubble: {
        padding: spacingX._10,
        borderRadius: radius._15,
        gap: spacingY._5,
    },

    myBubble: {
        backgroundColor: colors.myBubble,
    },

    theirBubble: {
        backgroundColor: colors.otherBubble,
    },

    highlightedContainer: {
        backgroundColor: colors.primary + '15',
        borderRadius: radius._15,
        padding: spacingX._5,
        marginHorizontal: -spacingX._5,
    },

    highlightedBubble: {
        borderWidth: 2,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});