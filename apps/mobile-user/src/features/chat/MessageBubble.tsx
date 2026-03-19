/**
 * Message bubble with read receipt indicator.
 */
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Message } from '@myclup/contracts/chat';

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
  showReadReceipt?: boolean;
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function MessageBubble({ message, isOwn, showReadReceipt = false }: MessageBubbleProps) {
  const { t } = useTranslation('chat');
  const time = formatTime(message.createdAt);

  return (
    <View style={[styles.wrapper, isOwn ? styles.own : styles.other]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.content, isOwn ? styles.contentOwn : styles.contentOther]}>
          {message.content}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>{time}</Text>
          {isOwn && showReadReceipt && <Text style={styles.receipt}>{t('status.read')}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  own: {
    alignItems: 'flex-end',
  },
  other: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: {
    backgroundColor: '#2196f3',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 15,
  },
  contentOwn: {
    color: '#fff',
  },
  contentOther: {
    color: '#111',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  timeOther: {
    color: '#888',
  },
  receipt: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
});
