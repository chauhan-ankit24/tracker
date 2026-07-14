import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, Switch, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { ScreenHeader } from "../components/ScreenHeader";

const TONE_ASSETS: Record<string, any> = {
  Govindam: require("../../assets/sounds/Govindam1.mp3"),
  "Hare Krishna": require("../../assets/sounds/Hare_Krishna-1.mp3"),
  "Jiv Jago": require("../../assets/sounds/Jiv_jago.mp3"),
  "Oh My Lord": require("../../assets/sounds/oh_my_Lord-1.mp3"),
  Prabhupada: require("../../assets/sounds/Prabhupada-1.mp3"),
};

const TONES = Object.keys(TONE_ASSETS);

// Helper to get color theme and volume based on tone index
const getToneConfig = (index: number) => {
  if (index < 2)
    return {
      bg: "bg-green-500",
      text: "text-green-600",
      lightBg: "bg-green-50",
      volume: 0.3,
      label: "Low",
    };
  if (index < 4)
    return {
      bg: "bg-yellow-500",
      text: "text-yellow-600",
      lightBg: "bg-yellow-50",
      volume: 0.6,
      label: "Medium",
    };
  return {
    bg: "bg-red-500",
    text: "text-red-600",
    lightBg: "bg-red-50",
    volume: 1.0,
    label: "High",
  };
};

export function UserSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [tone, setTone] = useState("Govindam");
  const [date, setDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [soundInstance, setSoundInstance] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundInstance) soundInstance.unloadAsync();
    };
  }, [soundInstance]);

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (event.type === "set" && selectedDate) setDate(selectedDate);
  };

  const formatTime = (dateToFormat: Date) => {
    return dateToFormat.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToneSelect = async (selectedTone: string, index: number) => {
    setTone(selectedTone);
    const config = getToneConfig(index);

    try {
      if (soundInstance) await soundInstance.unloadAsync();

      const { sound } = await Audio.Sound.createAsync(
        TONE_ASSETS[selectedTone],
        { shouldPlay: true, volume: config.volume },
      );
      setSoundInstance(sound);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader
        title="Settings"
        subtitle="Customize your reminder experience"
      />

      {/* Daily Reminder Toggle */}
      <View className="bg-white rounded-2xl p-4 mb-3 flex-row justify-between items-center">
        <Text className="text-base font-semibold text-gray-800">
          Daily Reminder
        </Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      {/* Time Picker */}
      <View className="bg-white rounded-2xl p-4 mb-3 flex-row justify-between items-center">
        <Text className="text-base font-semibold text-gray-800">
          Reminder Time
        </Text>
        {Platform.OS === "ios" ? (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onTimeChange}
          />
        ) : (
          <>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="bg-gray-100 rounded-xl px-4 py-2"
            >
              <Text className="text-gray-800 font-medium">
                {formatTime(date)}
              </Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                is24Hour={false}
                display="clock"
                onChange={onTimeChange}
              />
            )}
          </>
        )}
      </View>

      {/* Compact Tone & Volume Matrix Selection */}
      <View className="bg-white rounded-2xl p-4">
        <Text className="text-base font-semibold text-gray-800 mb-2">
          Reminder Tone & Intensity
        </Text>

        {TONES.map((item, index) => {
          const config = getToneConfig(index);
          const isSelected = tone === item;

          return (
            <Pressable
              key={item}
              onPress={() => handleToneSelect(item, index)}
              className={`my-1 p-3.5 rounded-xl flex-row justify-between items-center border ${
                isSelected
                  ? `${config.bg} border-transparent`
                  : "bg-gray-50 border-gray-100"
              } active:opacity-80`}
            >
              <View className="flex-row items-center space-x-2">
                <Text
                  className={`font-semibold text-sm px-2 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : `${config.lightBg} ${config.text}`
                  }`}
                >
                  {config.label}
                </Text>
                <Text
                  className={`font-medium ml-2 ${isSelected ? "text-white" : "text-gray-700"}`}
                >
                  {item}
                </Text>
              </View>

              {isSelected && (
                <Text className="text-white font-bold text-base">✓</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
