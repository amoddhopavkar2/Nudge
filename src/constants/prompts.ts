/**
 * Mindful prompts displayed during the breathing pause
 * These encourage self-reflection and conscious decision-making
 */

export const MINDFUL_PROMPTS: readonly string[] = [
  'Is this a conscious choice?',
  'What are you avoiding right now?',
  'Take a deep breath.',
  'Will this bring you closer to your goals?',
  'How will you feel after spending time here?',
  'What could you be doing instead?',
  'Is this the best use of your time?',
  'Are you running toward something or away from something?',
  'What would your future self say?',
  'Is this scroll going to add value to your day?',
  'Pause. Breathe. Choose intentionally.',
  'What brought you here right now?',
  'Is this a habit or a decision?',
  'How much time do you want to spend here?',
  'Are you seeking connection or distraction?',
  'What do you really need right now?',
  'Is there something more meaningful calling you?',
  'This moment is a choice. Choose wisely.',
  'Breathe in possibility. Breathe out distraction.',
  'You are in control of your attention.',
] as const;

/**
 * Returns a random mindful prompt
 * @returns A randomly selected prompt string
 */
export function getRandomPrompt(): string {
  const index = Math.floor(Math.random() * MINDFUL_PROMPTS.length);
  return MINDFUL_PROMPTS[index];
}
