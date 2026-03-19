import { useState, useCallback } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { appTheme } from '../../theme/appTheme';

type MessageInputProps = {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
  onTypingChange?: (typing: boolean) => void;
};

export function MessageInput({ onSend, disabled = false, onTypingChange }: MessageInputProps) {
  const { t } = useTranslation('chat');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) {
      return;
    }

    setText('');
    onTypingChange?.(false);
    setSending(true);
    try {
      await onSend(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, disabled, onSend, onTypingChange]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('input.placeholder')}
        placeholderTextColor={appTheme.colors.textSoft}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline
        maxLength={4000}
        editable={!disabled && !sending}
        onFocus={() => onTypingChange?.(true)}
        onBlur={() => onTypingChange?.(false)}
        onSelectionChange={() => {
          if (text.length > 0) {
            onTypingChange?.(true);
          }
        }}
      />
      <Pressable
        style={[styles.sendButton, (!text.trim() || disabled || sending) && styles.sendDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled || sending}
      >
        <AppIcon
          name={sending ? 'progress-clock' : 'send'}
          size={18}
          color={appTheme.colors.primaryText}
        />
        <AppText tone="inverse" style={styles.sendText}>
          {sending ? t('status.sending') : t('input.send')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: appTheme.radii.xl,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: appTheme.colors.surfaceMuted,
    borderRadius: 20,
    fontSize: 16,
    color: appTheme.colors.text,
    fontFamily: appTheme.fontFamily,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: appTheme.colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    minHeight: 40,
  },
  sendDisabled: {
    backgroundColor: '#9fb1bf',
  },
  sendText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
