import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const sendMessage = (message) => {
    setLastMessage(message);
    setError(false);
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: message,
        sender: "user",
      },
    ]);

    // First response from the assistant
    setTimeout(() => {
      let response = "";

      if (message === "Build Workout Plan") {
        response =
          "Absolutely! I'll help you build a personalized workout plan.";
      } else if (message === "Build Meal Plan") {
        response = "Great! I'll help you create a personalized meal plan.";
      }

      // Add assistant's initial response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: "bot",
        },
      ]);

      // Keep loading while we simulate the actual AI request
      setIsLoading(true);

      // Simulate AI request failing
      setTimeout(() => {
        setIsLoading(false);
        setError(true);
      }, 2000);
    }, 1000);
  };

  const retryMessage = () => {
    if (!lastMessage) return;

    sendMessage(lastMessage);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.botIcon}>
          <Ionicons name="fitness" size={27} color="#4CAF50" />
        </View>

        <View>
          <Text style={styles.title}>WORKOUT ASSISTANT</Text>

          <View style={styles.statusContainer}>
            <View style={styles.onlineDot} />
            <Text style={styles.status}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "bot" ? styles.botMessage : styles.userMessage,
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
          <Text style={styles.emptyText}>What would you like to build?</Text>
        }
        ListFooterComponent={
          <>
            {/* Loading */}
            {isLoading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#4CAF50" />

                <Text style={styles.loadingText}>Assistant is thinking...</Text>
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
                  <Text style={styles.errorTitle}>AI assistant is offline</Text>

                  <Text style={styles.errorText}>
                    We couldn't connect to the assistant. Please try again.
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

      {/* Options */}
      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            (isLoading || error) && styles.disabledButton,
          ]}
          disabled={isLoading || error}
          onPress={() => sendMessage("Build Workout Plan")}
        >
          <Ionicons name="barbell-outline" size={20} color="#222" />

          <Text style={styles.optionText}>Build Workout Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            (isLoading || error) && styles.disabledButton,
          ]}
          disabled={isLoading || error}
          onPress={() => sendMessage("Build Meal Plan")}
        >
          <Ionicons name="restaurant-outline" size={20} color="#222" />

          <Text style={styles.optionText}>Build Meal Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    maxWidth: "80%",
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
    marginBottom: 100,
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
});
