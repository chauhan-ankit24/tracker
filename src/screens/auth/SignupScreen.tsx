import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "../../components/BrandMark";
import { Button } from "../../components/Button";
import { GoogleButton } from "../../components/GoogleButton";
import { OrDivider } from "../../components/OrDivider";
import { TextField } from "../../components/TextField";
import { isExpoGo } from "../../config/app";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/types";
import { authErrorMessage, signUp } from "../../services/auth";
import { signInWithGoogle } from "../../services/google";
import { colors } from "../../theme/colors";
import { Role } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [mentorCode, setMentorCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (role === "user" && !mentorCode.trim()) {
      setError("Please enter your mentor code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await signUp({
        name,
        email,
        password,
        role,
        mentorCode: mentorCode.trim() || undefined,
      });
      setUser(user);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // New Google users are routed to onboarding by AuthContext.
    } catch (err) {
      if ((err as { code?: string })?.code !== "app/google-cancelled") {
        setError(authErrorMessage(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="items-center mb-6"
          >
            <BrandMark compact />
            <Text className="text-xl font-bold text-ink-900 mt-4">
              Create your account
            </Text>
            <Text className="text-sm text-ink-400 mt-1">
              Begin tracking your daily sadhana
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(120)}>
            <TextField
              label="Full name"
              icon="person-outline"
              placeholder="Your name"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            <TextField
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Password"
              icon="lock-closed-outline"
              placeholder="At least 6 characters"
              secure
              value={password}
              onChangeText={setPassword}
            />

            <Text className="text-sm font-medium text-ink-700 mb-2 ml-1">
              I am a
            </Text>
            <View className="flex-row bg-cloud-200 rounded-2xl p-1 mb-4">
              <RolePill
                label="Devotee"
                icon="leaf-outline"
                active={role === "user"}
                onPress={() => setRole("user")}
              />
              <RolePill
                label="Mentor"
                icon="school-outline"
                active={role === "admin"}
                onPress={() => setRole("admin")}
              />
            </View>

            <Animated.View entering={FadeIn}>
              <TextField
                label={
                  role === "user" ? "Mentor code" : "Mentor code (Optional)"
                }
                icon="key-outline"
                placeholder={
                  role === "user"
                    ? "6-character code from your mentor"
                    : "Optional: code from your senior mentor"
                }
                autoCapitalize="characters"
                maxLength={6}
                value={mentorCode}
                onChangeText={(text) => setMentorCode(text.toUpperCase())}
              />
            </Animated.View>

            {role === "admin" && (
              <Animated.View entering={FadeIn} className="mb-4">
                <View className="flex-row items-start bg-saffron-50 rounded-2xl p-4">
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={colors.saffron[600]}
                  />
                  <Text className="text-xs text-ink-500 ml-2 flex-1 leading-5">
                    Mentor accounts need approval before activation. If you
                    already have a senior mentor, you may enter their mentor
                    code above. Otherwise, leave it blank. After approval,
                    you'll receive your own mentor code to share with your
                    devotees.
                  </Text>
                </View>
              </Animated.View>
            )}

            {error ? (
              <Animated.Text
                entering={FadeIn}
                className="text-sm text-red-500 mb-3 ml-1"
              >
                {error}
              </Animated.Text>
            ) : null}

            <Button
              label="Create Account"
              onPress={onSubmit}
              loading={loading}
              className="mt-1"
            />

            {!isExpoGo ? (
              <>
                <OrDivider />
                <GoogleButton onPress={onGoogle} loading={googleLoading} />
              </>
            ) : null}

            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-ink-400">
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => navigation.goBack()}>
                <Text className="text-sm font-semibold text-saffron-600">
                  Sign in
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RolePill({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <View
        className={`flex-row items-center justify-center py-2.5 rounded-xl ${active ? "bg-white" : ""}`}
        style={
          active
            ? {
                shadowColor: "#1F2430",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 1,
              }
            : undefined
        }
      >
        <Ionicons
          name={icon}
          size={16}
          color={active ? colors.saffron[600] : colors.ink[400]}
        />
        <Text
          className={`text-sm font-semibold ml-2 ${active ? "text-saffron-700" : "text-ink-500"}`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
