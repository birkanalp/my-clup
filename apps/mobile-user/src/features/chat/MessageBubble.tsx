import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Message } from '@myclup/contracts/chat';
import { AppText } from '../../components/AppText';
import { appTheme } from '../../theme/appTheme';

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
  showReadReceipt?: boolean;
};

function formatTime(iso: string, locale: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function MessageBubble({ message, isOwn, showReadReceipt = false }: MessageBubbleProps) {
  const { t, i18n } = useTranslation('chat');

  return (
    <View style={[styles.wrapper, isOwn ? styles.own : styles.other]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <AppText style={[styles.content, isOwn ? styles.contentOwn : styles.contentOther]}>
          {message.content}
        </AppText>
        <View style={styles.footer}>
          <AppText
            variant="caption"
            style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}
          >
            {formatTime(message.createdAt, i18n.resolvedLanguage ?? 'en')}
          </AppText>
          {isOwn && showReadReceipt ? (
            <AppText variant="caption" style={styles.receipt}>
              {t('status.read')}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
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
    maxWidth: '82%',
    borderRadius: appTheme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bubbleOwn: {
    backgroundColor: appTheme.colors.secondary,
    borderColor: appTheme.colors.secondary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: appTheme.colors.border,
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 15,
  },
  contentOwn: {
    color: appTheme.colors.primaryText,
  },
  contentOther: {
    color: appTheme.colors.text,
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
    color: 'rgba(255,255,255,0.82)',
  },
  timeOther: {
    color: appTheme.colors.textSoft,
  },
  receipt: {
    color: 'rgba(255,255,255,0.82)',
  },
});
