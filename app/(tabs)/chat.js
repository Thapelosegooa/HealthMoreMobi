import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BASE_URL } from "../../config/api";

export default function Chat() {
  // Current conversation
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState("");

  // Chat settings
  const [planType, setPlanType] = useState(null);
  const [inputMessage, setInputMessage] = useState("");

  // Loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [error, setError] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);

  // Conversation history
  const [conversationHistory, setConversationHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const flatListRef = useRef(null);

  // API HELPER


  const apiRequest = async (endpoint, options = {}) => {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${BASE_URL}/api/ai${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Something went wrong");
    }

    return data;
  };


  // MESSAGE HELPERS


  const formatMessages = (backendMessages = []) => {
    return backendMessages.map((item, index) => ({
      id: item._id || `${item.createdAt || "message"}-${index}`,
      text: item.content,
      sender: item.role === "user" ? "user" : "bot",
      createdAt: item.createdAt,
    }));
  };


  // INITIAL GREETING
 

  useEffect(() => {
    loadGreeting();
  }, []);

  const loadGreeting = async () => {
    try {
      setError(null);

      const data = await apiRequest("/greeting");

      setMessages([
        {
          id: "greeting",
          text: data.message,
          sender: "bot",
        },
      ]);
    } catch (err) {
      console.error("Greeting error:", err);
      setError(err.message);
    }
  };


  // SCROLL TO LATEST MESSAGE
  

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, error]);


  // GET CONVERSATION HISTORY
 

  const fetchConversationHistory = async () => {
    try {
      setIsLoadingHistory(true);

      const data = await apiRequest("/history");

      setConversationHistory(data.chats || []);
    } catch (err) {
      console.error("History error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openHistory = () => {
    setHistoryVisible(true);
    fetchConversationHistory();
  };


  // OPEN EXISTING CONVERSATION


  const openConversation = async (selectedChatId) => {
    if (isLoading || isLoadingChat) return;

    try {
      setIsLoadingChat(true);
      setError(null);
      setHistoryVisible(false);

      const data = await apiRequest(`/history/${selectedChatId}`);

      const chat = data.chat;

      setChatId(chat._id);
      setChatTitle(chat.title);
      setPlanType(chat.planType);

      setMessages(formatMessages(chat.messages));

      setPendingMessage(null);
      setInputMessage("");
    } catch (err) {
      console.error("Open conversation error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // SEND MESSAGE / CREATE CONVERSATION

  const sendMessage = async (
    message,
    selectedPlan = planType,
    existingChatId = chatId,
    isRetry = false,
  ) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading || !selectedPlan) {
      return;
    }

    setError(null);
    setIsLoading(true);

    // Add optimistic user message only once
    if (!isRetry) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-user`,
          text: trimmedMessage,
          sender: "user",
        },
      ]);
    }

    try {
  
      // The backend retrieves conversation history
      // using chatId

      const data = await apiRequest("/chat", {
        method: "POST",
        body: JSON.stringify({
          planType: selectedPlan,
          message: trimmedMessage,
          chatId: existingChatId,
        }),
      });

      // Save returned conversation ID
      setChatId(data.chatId);
      setChatTitle(data.title);

      // Backend returns the complete conversation
      setMessages(formatMessages(data.messages));

      setPendingMessage(null);
      setError(null);

      // Refresh sidebar/history data
      fetchConversationHistory();
    } catch (err) {
      console.error("Chat error:", err);

      setError(err.message);

      // Keep failed message for retry
      setPendingMessage({
        message: trimmedMessage,
        planType: selectedPlan,
        chatId: existingChatId,
      });
    } finally {
      setIsLoading(false);
    }
  };


  // SELECT WORKOUT OR MEAL PLAN


  const selectPlan = (selectedPlan) => {
    if (isLoading) return;

    setPlanType(selectedPlan);
    setChatId(null);
    setChatTitle("");
    setMessages([]);
    setInputMessage("");
    setPendingMessage(null);
    setError(null);

    const initialMessage =
      selectedPlan === "workout" ? "Build Workout Plan" : "Build Meal Plan";

    sendMessage(initialMessage, selectedPlan, null);
  };


  // SEND FOLLOW-UP MESSAGE


  const handleSend = () => {
    const message = inputMessage.trim();

    if (!message || !planType || isLoading) {
      return;
    }

    setInputMessage("");

    sendMessage(message);
  };


  // RETRY FAILED MESSAGE


  const retryMessage = () => {
    if (!pendingMessage || isLoading) return;

    const {
      message,
      planType: selectedPlan,
      chatId: failedChatId,
    } = pendingMessage;

    sendMessage(message, selectedPlan, failedChatId, true);
  };


  // START NEW CONVERSATION


  const startNewChat = () => {
    if (isLoading || isLoadingChat) return;

    setChatId(null);
    setChatTitle("");
    setPlanType(null);
    setInputMessage("");
    setPendingMessage(null);
    setError(null);

    setMessages([]);

    loadGreeting();
  };

 
  // DELETE INDIVIDUAL CONVERSATION


  const deleteConversation = (selectedChatId) => {
    Alert.alert(
      "Delete conversation",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(`/history/${selectedChatId}`, {
                method: "DELETE",
              });

              setConversationHistory((prev) =>
                prev.filter((chat) => chat._id !== selectedChatId),
              );

              // If deleting the currently open chat
              if (chatId === selectedChatId) {
                startNewChat();
              }
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  };


  // DELETE ALL CONVERSATIONS

  const deleteAllConversations = () => {
    if (conversationHistory.length === 0) return;

    Alert.alert(
      "Delete all conversations",
      "Are you sure you want to delete all your chat history? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest("/history", {
                method: "DELETE",
              });

              setConversationHistory([]);

              startNewChat();

              setHistoryVisible(false);
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  };


  // FORMAT HISTORY DATE

  const formatDate = (date) => {
    if (!date) return "";

    const value = new Date(date);

    return value.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

 
  // RENDER MESSAGE
 

  const renderMessage = ({ item }) => {
    const isBot = item.sender === "bot";

    return (
      <View
        style={[
          styles.messageBubble,
          isBot ? styles.botMessage : styles.userMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isBot ? styles.botMessageText : styles.userMessageText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };


  // MAIN UI

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.botIcon}>
          <Ionicons name="fitness" size={26} color="#4CAF50" />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>FITNESS ASSISTANT</Text>

          <View style={styles.statusContainer}>
            <View style={styles.onlineDot} />
            <Text style={styles.status}>AI Assistant</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={openHistory}
          disabled={isLoading || isLoadingChat}
        >
          <Ionicons name="time-outline" size={23} color="#333" />
        </TouchableOpacity>

        {planType && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={startNewChat}
            disabled={isLoading || isLoadingChat}
          >
            <Ionicons name="add-circle-outline" size={25} color="#4CAF50" />
          </TouchableOpacity>
        )}

        {chatId && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => deleteConversation(chatId)}
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={21} color="#E53935" />
          </TouchableOpacity>
        )}
      </View>

      {/* CURRENT CONVERSATION TITLE */}

      {chatTitle !== "" && (
        <View style={styles.conversationTitleContainer}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {chatTitle}
          </Text>
        </View>
      )}

      {/* MESSAGES */}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoadingChat ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
              <Text style={styles.emptyText}>
                {error || "Loading your assistant..."}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <>
            {/* THINKING INDICATOR */}

            {isLoading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#4CAF50" />

                <Text style={styles.loadingText}>Assistant is thinking...</Text>
              </View>
            )}

            {/* ERROR MESSAGE */}

            {error && !isLoading && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={25}
                  color="#E53935"
                />

                <View style={styles.errorContent}>
                  <Text style={styles.errorTitle}>Unable to send message</Text>

                  <Text style={styles.errorText}>{error}</Text>

                  {pendingMessage && (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={retryMessage}
                    >
                      <Ionicons name="refresh" size={16} color="#fff" />

                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </>
        }
      />

      {/* INITIAL OPTIONS */}

      {!planType && (
        <View style={styles.options}>
          <Text style={styles.optionsTitle}>
            What would you like help with?
          </Text>

          <TouchableOpacity
            style={[styles.optionButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
            onPress={() => selectPlan("workout")}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="barbell-outline" size={23} color="#4CAF50" />
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Build Workout Plan</Text>

              <Text style={styles.optionDescription}>
                Get a workout plan based on your fitness goals.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
            onPress={() => selectPlan("meal")}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="restaurant-outline" size={23} color="#4CAF50" />
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Build Meal Plan</Text>

              <Text style={styles.optionDescription}>
                Get meal recommendations for your goals.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      {/* MESSAGE INPUT */}

      {planType && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask something..."
            placeholderTextColor="#999"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={3000}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || isLoading) && styles.disabledButton,
            ]}
            disabled={!inputMessage.trim() || isLoading}
            onPress={handleSend}
          >
            <Ionicons name="send" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* CONVERSATION HISTORY MODAL */}

      <Modal
        visible={historyVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* MODAL HEADER */}

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Your Conversations</Text>

              <Text style={styles.modalSubtitle}>
                Access your previous AI conversations
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHistoryVisible(false)}
            >
              <Ionicons name="close" size={23} color="#333" />
            </TouchableOpacity>
          </View>

          {/* HISTORY LIST */}

          {isLoadingHistory ? (
            <View style={styles.historyLoading}>
              <ActivityIndicator size="large" color="#4CAF50" />

              <Text style={styles.historyEmptyText}>
                Loading conversations...
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversationHistory}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.historyList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.historyEmpty}>
                  <Ionicons name="chatbubbles-outline" size={45} color="#bbb" />

                  <Text style={styles.historyEmptyTitle}>
                    No conversations yet
                  </Text>

                  <Text style={styles.historyEmptyText}>
                    Your previous conversations will appear here.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.historyItem,
                    chatId === item._id && styles.selectedHistoryItem,
                  ]}
                  onPress={() => openConversation(item._id)}
                >
                  <View style={styles.historyIcon}>
                    <Ionicons
                      name={
                        item.planType === "workout"
                          ? "barbell-outline"
                          : "restaurant-outline"
                      }
                      size={21}
                      color="#4CAF50"
                    />
                  </View>

                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <Text style={styles.historyDetails}>
                      {item.planType === "workout"
                        ? "Workout plan"
                        : "Meal plan"}
                      {"  •  "}
                      {formatDate(item.updatedAt)}
                    </Text>

                    <Text style={styles.historyMessageCount}>
                      {item.messages?.length || 0} messages
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteHistoryButton}
                    onPress={() => deleteConversation(item._id)}
                  >
                    <Ionicons name="trash-outline" size={19} color="#E53935" />
                  </TouchableOpacity>

                  <Ionicons name="chevron-forward" size={18} color="#aaa" />
                </Pressable>
              )}
            />
          )}

          {/* DELETE ALL HISTORY */}

          {conversationHistory.length > 0 && (
            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={deleteAllConversations}
            >
              <Ionicons name="trash-outline" size={18} color="#E53935" />

              <Text style={styles.deleteAllText}>Delete all conversations</Text>
            </TouchableOpacity>
          )}

          {/* NEW CHAT */}

          <TouchableOpacity
            style={styles.newChatModalButton}
            onPress={() => {
              setHistoryVisible(false);
              startNewChat();
            }}
          >
            <Ionicons name="add" size={21} color="#fff" />

            <Text style={styles.newChatModalText}>Start New Conversation</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 43,
  },

  botIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },

  status: {
    fontSize: 12,
    color: "#4CAF50",
  },

  headerButton: {
    width: 37,
    height: 37,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
  },

  conversationTitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  conversationTitle: {
    fontSize: 12,
    color: "#777",
    fontWeight: "600",
  },

  // Messages

  messages: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 15,
    justifyContent: "flex-end",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
  },

  messageBubble: {
    maxWidth: "87%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 18,
    marginBottom: 11,
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#222",
    borderBottomRightRadius: 5,
  },

  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F1F1",
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 23,
  },

  userMessageText: {
    color: "#fff",
  },

  botMessageText: {
    color: "#222",
  },

  // Loading

  loadingBubble: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 10,
  },

  loadingText: {
    marginLeft: 9,
    color: "#777",
    fontSize: 13,
  },

  // Errors

  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    gap: 10,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C62828",
    marginBottom: 4,
  },

  errorText: {
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
    marginBottom: 9,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },

  retryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // Initial options

  options: {
    padding: 18,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginBottom: 100,
  },

  optionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 5,
  },

  optionButton: {
    flexDirection: "row",
    backgroundColor: "#F8F9F8",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEDEA",
  },

  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  optionContent: {
    flex: 1,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  optionDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    lineHeight: 17,
  },

  disabledButton: {
    opacity: 0.5,
  },

  // Message input

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    gap: 10,
    marginBottom: 100,
  },

  textInput: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 110,
    color: "#222",
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },

  // History modal

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 20 : 15,
    paddingHorizontal: 18,
    paddingBottom: 25,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222",
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  historyList: {
    paddingTop: 12,
    paddingBottom: 15,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  selectedHistoryItem: {
    backgroundColor: "#F1F8F1",
    borderRadius: 12,
  },

  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  historyContent: {
    flex: 1,
    marginRight: 8,
  },

  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },

  historyDetails: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
  },

  historyMessageCount: {
    fontSize: 11,
    color: "#4CAF50",
    marginTop: 4,
  },

  deleteHistoryButton: {
    padding: 9,
    marginRight: 3,
  },

  historyLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  historyEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingTop: 100,
  },

  historyEmptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 15,
  },

  historyEmptyText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  deleteAllButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  deleteAllText: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "600",
  },

  newChatModalButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 13,
    gap: 8,
    marginTop: 10,
  },

  newChatModalText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
