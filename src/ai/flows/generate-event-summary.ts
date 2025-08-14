'use server';

/**
 * @fileOverview An AI agent for generating event summaries with key statistics and insights.
 *
 * - generateEventSummary - A function that generates a summary of the event, including key statistics and insights.
 * - GenerateEventSummaryInput - The input type for the generateEventSummary function.
 * - GenerateEventSummaryOutput - The return type for the generateEventSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventSummaryInputSchema = z.object({
  eventData: z.string().describe('The detailed event data, including attendance logs and scanner performance metrics.'),
});
export type GenerateEventSummaryInput = z.infer<typeof GenerateEventSummaryInputSchema>;

const GenerateEventSummaryOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the event, including key statistics, insights, and notable patterns in the attendance data.'),
});
export type GenerateEventSummaryOutput = z.infer<typeof GenerateEventSummaryOutputSchema>;

export async function generateEventSummary(input: GenerateEventSummaryInput): Promise<GenerateEventSummaryOutput> {
  return generateEventSummaryFlow(input);
}

const generateEventSummaryPrompt = ai.definePrompt({
  name: 'generateEventSummaryPrompt',
  input: {schema: GenerateEventSummaryInputSchema},
  output: {schema: GenerateEventSummaryOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing event data and providing key insights.

  Analyze the following event data:
  {{eventData}}

  Your summary should include:
  - Total number of attendees
  - Peak attendance times
  - Per-scanner performance
  - Any notable patterns or correlations found in the attendance data.

  Provide a comprehensive summary highlighting the key statistics and insights from the event. Focus on any unusual or outstanding scanner performance and time-dependent trends.
  Ensure all numerical values are correctly mentioned and appropriately formatted. The response should be clear, concise, and useful for event administrators.
  `, // Modified prompt instructions
});

const generateEventSummaryFlow = ai.defineFlow(
  {
    name: 'generateEventSummaryFlow',
    inputSchema: GenerateEventSummaryInputSchema,
    outputSchema: GenerateEventSummaryOutputSchema,
  },
  async input => {
    const {output} = await generateEventSummaryPrompt(input);
    return output!;
  }
);
