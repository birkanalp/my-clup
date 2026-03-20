export type AiLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type AiLogger = (level: AiLogLevel, message: string, meta?: Record<string, unknown>) => void;

export const noopAiLogger: AiLogger = () => {};

/** Minimal process logger — avoids shipping AI traces to browsers. */
export const consoleAiLogger: AiLogger = (level, message, meta) => {
  const line = `${message}${meta ? ` ${JSON.stringify(meta)}` : ''}\n`;
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line);
    return;
  }
  process.stdout.write(line);
};
