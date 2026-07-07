import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { AvatarPicker } from '../components/AvatarPicker';
import { useAuth } from '../context/AuthContext';
import {
  deleteOwnAccount,
  authErrorMessage,
  fetchUserProfile,
  updateUserAvatar,
} from '../services/auth';
import { SUPPORT_WHATSAPP, SUPPORT_MESSAGE } from '../config/support';
import { isOwner } from '../config/app';
import { colors } from '../theme/colors';

export function ProfileScreen() {
  const { user, setUser, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const [mentorName, setMentorName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (user?.role === 'user' && user.adminId) {
        const mentor = await fetchUserProfile(user.adminId);
        if (active) setMentorName(mentor?.name ?? 'Unknown mentor');
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const onSelectAvatar = async (avatarId: string) => {
    if (!user) return;
    setSavingAvatar(true);
    // Optimistically reflect the choice, then persist it.
    setUser({ ...user, avatar: avatarId });
    try {
      await updateUserAvatar(user.id, avatarId);
      setPickerOpen(false);
    } catch (err) {
      setUser(user); // revert on failure
      Alert.alert('Could not update avatar', authErrorMessage(err));
    } finally {
      setSavingAvatar(false);
    }
  };

  const openWhatsApp = async () => {
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open WhatsApp', 'Please make sure WhatsApp is installed on your device.');
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const runDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteOwnAccount(user);
      // Account gone → the auth listener will route back to the login screen.
    } catch (err) {
      Alert.alert('Could not delete account', authErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    const isMentor = user?.role === 'admin';
    Alert.alert(
      'Delete account',
      isMentor
        ? 'This permanently deletes your mentor account and your own entries. It is only allowed when no devotees are assigned to you. This cannot be undone.'
        : 'This permanently deletes your account and all of your entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: runDelete },
      ],
    );
  };

  if (!user) return null;

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Profile" subtitle="Your account" />

      <Animated.View entering={FadeInDown.duration(450)} className="items-center mb-6 mt-2">
        <Pressable onPress={() => setPickerOpen((o) => !o)}>
          <Avatar name={user.name} avatarId={user.avatar} size={96} shadow />
          <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white items-center justify-center border border-cloud-200">
            <Ionicons name="pencil" size={14} color={colors.saffron[600]} />
          </View>
        </Pressable>
        <Text className="text-xl font-bold text-ink-900 mt-4">{user.name}</Text>
        <View className="flex-row items-center bg-saffron-50 px-3 py-1 rounded-full mt-2">
          <Ionicons
            name={user.role === 'admin' ? 'school-outline' : 'leaf-outline'}
            size={13}
            color={colors.saffron[600]}
          />
          <Text className="text-xs font-semibold text-saffron-700 ml-1.5">
            {user.role === 'admin' ? 'Mentor' : 'Devotee'}
          </Text>
        </View>
      </Animated.View>

      <AvatarPicker
        visible={pickerOpen}
        currentId={user.avatar}
        saving={savingAvatar}
        onSelect={onSelectAvatar}
        onClose={() => setPickerOpen(false)}
      />

      <Card delay={100}>
        <InfoRow icon="person-outline" label="Name" value={user.name} />
        <Divider />
        <InfoRow icon="mail-outline" label="Email" value={user.email} />
        <Divider />
        {user.role === 'admin' ? (
          <MentorCodeRow code={user.mentorCode ?? '—'} />
        ) : (
          <InfoRow icon="school-outline" label="Mentor" value={mentorName ?? '—'} />
        )}
      </Card>

      {isOwner(user.id) ? (
        <Pressable
          onPress={() => navigation.navigate('Approvals')}
          className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-cloud-200 mt-4"
          style={{
            shadowColor: '#1F2430',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mr-3">
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.saffron[600]} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-ink-900">Mentor approvals</Text>
            <Text className="text-xs text-ink-400 mt-0.5">Review and approve new mentors</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.ink[400]} />
        </Pressable>
      ) : null}

      <Pressable
        onPress={openWhatsApp}
        className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-cloud-200 mt-4"
        style={{
          shadowColor: '#1F2430',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 1,
        }}
      >
        <View className="w-9 h-9 rounded-full bg-green-50 items-center justify-center mr-3">
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-ink-900">Help &amp; Support</Text>
          <Text className="text-xs text-ink-400 mt-0.5">Questions or suggestions? Message us</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.ink[400]} />
      </Pressable>

      <View className="mt-6">
        <Button label="Log Out" variant="secondary" icon="log-out-outline" onPress={confirmSignOut} />
      </View>

      <Pressable
        onPress={confirmDelete}
        disabled={deleting}
        className="flex-row items-center justify-center mt-8 py-2"
      >
        <Ionicons name="trash-outline" size={16} color="#DC2626" />
        <Text className="text-sm font-medium text-red-600 ml-2">
          {deleting ? 'Deleting…' : 'Delete my account'}
        </Text>
      </Pressable>

      <Text className="text-xs text-ink-400 text-center mt-8">
        Bhakti Tracker v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </ScreenContainer>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center py-3">
      <View className="w-9 h-9 rounded-full bg-cloud-200 items-center justify-center mr-3">
        <Ionicons name={icon} size={17} color={colors.ink[500]} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-ink-400">{label}</Text>
        <Text className="text-sm font-semibold text-ink-900 mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

/** Admins can copy their id to hand out as a mentor code. */
function MentorCodeRow({ code }: { code: string }) {
  const copy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied', 'Your mentor code has been copied to the clipboard.');
  };
  return (
    <Pressable onPress={copy} className="flex-row items-center py-3">
      <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mr-3">
        <Ionicons name="key-outline" size={17} color={colors.saffron[600]} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-ink-400">Mentor code (tap to copy)</Text>
        <Text className="text-sm font-semibold text-ink-900 mt-0.5" numberOfLines={1}>
          {code}
        </Text>
      </View>
      <Ionicons name="copy-outline" size={18} color={colors.ink[400]} />
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-cloud-200" />;
}
