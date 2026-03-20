/**
 * @myclup/ai — Server-side AI service boundary (Ollama, schema-validated outputs).
 * Do not import this package from mobile or public client bundles for runtime calls;
 * invoke from Next.js BFF / server routes only.
 */
export * from './boundary';
export * from './env';
export * from './logger';
export * from './ollama';
export * from './prompts/workout-cleanup-v1';
export * from './schemas/workout-cleanup';
