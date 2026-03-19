/**
 * Message input with send button.
 */
import { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

type MessageInputProps = {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
  onTypingChange?: (typing: boolean) => void;
};

export function MessageInput({
  onSend,
  disabled = false,
  onTypingChange,
}: MessageInputProps) {
  const { t } = useTranslation('chat');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
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
          placeholderTextColor="#999"
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
            if (text.length > 0) onTypingChange?.(true);
          }}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || disabled || sending) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || disabled || sending}
        >
          <Text style={styles.sendText}>
            {sending ? t('status.sending') : t('input.send')}
          </Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 16,
    color: '#111',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2196f3',
    borderRadius: 20,
    justifyContent: 'center',
    minHeight: 40,
  },
  sendDisabled: {
    backgroundColor: '#b0bec5',
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
