
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../config/api";
import * as SecureStore from "expo-secure-store";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";



export default function Chat() {
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const [planType, setPlanType] = useState(null);

  const [conversationHistory, setConversationHistory] = useState([]);

  const [inputMessage, setInputMessage] = useState("");

  const [lastMessage, setLastMessage] = useState(null);

  const flatListRef = useRef(null);

  // Load initial greeting when chat opens
  useEffect(() => {
    loadGreeting();
  }, []);

  // Scroll to latest message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    }
  }, [messages, isLoading, error]);

  // Get initial greeting from backend
  const loadGreeting = async () => {
    try {
      setError(false);

      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${BASE_URL}/api/ai/greeting`,
        {
          method: "GET",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Could not load greeting");
      }

      setMessages([
        {
          id: "greeting",
          text: data.message,
          sender: "bot",
        },
      ]);
    } catch (err) {
      console.error("Greeting error:", err);
      setError(true);
    }
  };

  // Send message to backend
  
const sendMessage = async (message, selectedPlan = planType) => {
  if (!message.trim() || isLoading || !selectedPlan) {
    return;
  }

  setLastMessage({
    message,
    planType: selectedPlan,
  });

  setError(false);
  setIsLoading(true);

  const userMessage = {
    id: `${Date.now()}-user`,
    text: message,
    sender: "user",
  };

  setMessages((prev) => [...prev, userMessage]);

  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("Authentication required");
    }



    // Convert history to OpenAI/Groq format
    const history = conversationHistory.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const response = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({
  planType: selectedPlan,
  message,
  history: conversationHistory,
}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "AI request failed");
    }

    const botMessage = {
      id: `${Date.now()}-bot`,
      text: data.response,
      sender: "bot",
    };

    setMessages((prev) => [...prev, botMessage]);

    // Save history in Groq-compatible format
    setConversationHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: message.trim(),
      },
      {
        role: "assistant",
        content: data.response,
      },
    ]);

  } catch (err) {
    console.error("Chat error:", err);
    setError(true);

  } finally {
    setIsLoading(false);
  }
};


  // Select workout or meal plan
  const selectPlan = (selectedPlan) => {
    if (isLoading) return;

    setPlanType(selectedPlan);

    // Start a fresh conversation
    setConversationHistory([]);
    setError(false);

    const message =
      selectedPlan === "workout"
        ? "Build Workout Plan"
        : "Build Meal Plan";

    sendMessage(message, selectedPlan);
  };

  // Send follow-up message
  const handleSend = () => {
    const message = inputMessage.trim();

    if (!message || !planType || isLoading) {
      return;
    }

    setInputMessage("");

    sendMessage(message);
  };

  // Retry failed request without duplicating user message
  
const retryMessage = async () => {
  if (!lastMessage || isLoading) return;

  const { message, planType: selectedPlan } = lastMessage;

  setError(false);
  setIsLoading(true);

  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({
        planType: selectedPlan,
        message,
        history: conversationHistory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "AI request failed");
    }

    const botMessage = {
      id: `${Date.now()}-bot`,
      text: data.response,
      sender: "bot",
    };

    setMessages((prev) => [...prev, botMessage]);

    setConversationHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
      {
        role: "assistant",
        content: data.response,
      },
    ]);

    setLastMessage(null);

  } catch (err) {
    console.error("Retry error:", err);
    setError(true);

  } finally {
    setIsLoading(false);
  }
};


  // Start a new conversation
  const startNewChat = () => {
    if (isLoading) return;

    setPlanType(null);
    setConversationHistory([]);
    setInputMessage("");
    setLastMessage(null);
    setError(false);

    loadGreeting();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.botIcon}>
          <Ionicons name="fitness" size={27} color="#4CAF50" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>WORKOUT ASSISTANT</Text>

          <View style={styles.statusContainer}>
            <View style={styles.onlineDot} />
            <Text style={styles.status}>Online</Text>
          </View>
        </View>

        {planType && (
          <TouchableOpacity
            onPress={startNewChat}
            disabled={isLoading}
            style={styles.newChatButton}
          >
            <Ionicons name="add-circle-outline" size={25} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "bot"
                ? styles.botMessage
                : styles.userMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === "bot"
                  ? styles.botMessageText
                  : styles.userMessageText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {error
              ? "Unable to connect to the assistant."
              : "Loading your assistant..."}
          </Text>
        }
        ListFooterComponent={
          <>
            {/* Loading */}
            {isLoading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#4CAF50" />

                <Text style={styles.loadingText}>
                  Assistant is thinking...
                </Text>
              </View>
            )}

            {/* Error */}
            {error && !isLoading && (
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={24}
                    color="#E53935"
                  />
                </View>

                <View style={styles.errorContent}>
                  <Text style={styles.errorTitle}>
                    AI assistant is offline
                  </Text>

                  <Text style={styles.errorText}>
                    We couldn't connect to the assistant.
                    Please try again.
                  </Text>

                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={retryMessage}
                  >
                    <Ionicons name="refresh" size={16} color="#fff" />

                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        }
      />

      {/* Initial Options */}
      {!planType && (
        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              isLoading && styles.disabledButton,
            ]}
            disabled={isLoading}
            onPress={() => selectPlan("workout")}
          >
            <Ionicons name="barbell-outline" size={20} color="#222" />

            <Text style={styles.optionText}>
              Build Workout Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              isLoading && styles.disabledButton,
            ]}
            disabled={isLoading}
            onPress={() => selectPlan("meal")}
          >
            <Ionicons name="restaurant-outline" size={20} color="#222" />

            <Text style={styles.optionText}>
              Build Meal Plan
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Follow-up message input */}
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
              (!inputMessage.trim() || isLoading) &&
                styles.disabledButton,
            ]}
            disabled={!inputMessage.trim() || isLoading}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 43,
  },

  botIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },

  status: {
    fontSize: 13,
    color: "#4CAF50",
  },

  newChatButton: {
    padding: 5,
  },

  // Messages
  messages: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "flex-end",
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginBottom: 20,
  },

  messageBubble: {
    maxWidth: "85%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 10,
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#222",
  },

  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F1F1",
  },

  messageText: {
    fontSize: 16,
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
    marginLeft: 8,
    color: "#777",
    fontSize: 14,
  },

  // Error
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD6D6",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  errorIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C62828",
    marginBottom: 4,
  },

  errorText: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
    marginBottom: 10,
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

  // Options
  options: {
    padding: 20,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginBottom: 100,
  },

  optionButton: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  optionText: {
    fontSize: 16,
    fontWeight: "600",
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
});
