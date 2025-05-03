// src/ai/flows/daily-motivator.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating daily motivational messages tailored to a user's fitness goals and progress.
 *
 * - getDailyMotivation - A function that generates a daily motivational message.
 * - DailyMotivationInput - The input type for the getDailyMotivation function.
 * - DailyMotivationOutput - The return type for the getDailyMotivation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DailyMotivationInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  goal: z.string().describe('The user\u0027s fitness goal.'),
  progress: z.string().describe('The user\u0027s current progress towards their goal.'),
});
export type DailyMotivationInput = z.infer<typeof DailyMotivationInputSchema>;

const DailyMotivationOutputSchema = z.object({
  message: z.string().describe('The daily motivational message.'),
});
export type DailyMotivationOutput = z.infer<typeof DailyMotivationOutputSchema>;

export async function getDailyMotivation(input: DailyMotivationInput): Promise<DailyMotivationOutput> {
  return dailyMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyMotivationPrompt',
  input: {
    schema: z.object({
      userId: z.string().describe('The ID of the user.'),
      goal: z.string().describe('The user\u0027s fitness goal.'),
      progress: z.string().describe('The user\u0027s current progress towards their goal.'),
    }),
  },
  output: {
    schema: z.object({
      message: z.string().describe('The daily motivational message.'),
    }),
  },
  prompt: `You are a motivational AI assistant that provides daily messages to encourage users to achieve their fitness goals.
  The user's goal is: {{{goal}}}
  The user's current progress is: {{{progress}}}
  Generate a motivational message to encourage the user to continue working towards their goal. Be concise and positive.
  `,
});

const dailyMotivationFlow = ai.defineFlow<
  typeof DailyMotivationInputSchema,
  typeof DailyMotivationOutputSchema
>(
  {
    name: 'dailyMotivationFlow',
    inputSchema: DailyMotivationInputSchema,
    outputSchema: DailyMotivationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
