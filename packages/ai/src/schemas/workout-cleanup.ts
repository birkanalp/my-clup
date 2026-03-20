import { z } from 'zod';

export const WorkoutCleanupExerciseSchema = z.object({
  name: z.string().min(1),
  detail: z.string().optional(),
});

export const WorkoutCleanupOutputSchema = z.object({
  locale: z.string().min(2),
  exercises: z.array(WorkoutCleanupExerciseSchema).min(1),
});

export type WorkoutCleanupOutput = z.infer<typeof WorkoutCleanupOutputSchema>;
