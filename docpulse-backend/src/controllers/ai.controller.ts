import { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { asyncHandler } from '../middleware/errorHandler';

const summaryRequestSchema = z.object({
  reasonForVisit: z.string().optional().default(''),
  symptomsDescription: z.string().optional().default(''),
  durationOfSymptoms: z.string().optional().default(''),
  medicalHistory: z.string().optional().default(''),
  currentMedications: z.string().optional().default(''),
  patientAge: z.number().optional(),
  patientGender: z.string().optional(),
});

/**
 * Produces a short, doctor-facing summary of a patient's intake form so the
 * doctor can triage requests faster. Uses the Anthropic API when
 * ANTHROPIC_API_KEY is configured; otherwise falls back to a plain,
 * non-AI templated summary so this endpoint never hard-fails.
 *
 * This is a *summary aid only* - it is never shown to patients as medical
 * advice and never substitutes the doctor's own judgment.
 */
export const getClinicalAiSummary = asyncHandler(async (req: Request, res: Response) => {
  const parsed = summaryRequestSchema.parse(req.body);

  if (!env.anthropicApiKey) {
    return res.json({
      success: true,
      summary: buildFallbackSummary(parsed),
      source: 'local',
    });
  }

  try {
    const prompt = `You are assisting a doctor by summarizing a patient's intake form before their appointment. Write a concise, clinical, 3-4 sentence summary a busy doctor can scan in seconds. Do not diagnose or recommend treatment - only summarize what the patient reported.

Reason for visit: ${parsed.reasonForVisit || 'Not provided'}
Symptoms: ${parsed.symptomsDescription || 'Not provided'}
Duration of symptoms: ${parsed.durationOfSymptoms || 'Not provided'}
Patient age/gender: ${parsed.patientAge ?? 'Unknown'} / ${parsed.patientGender ?? 'Unknown'}
Relevant medical history: ${parsed.medicalHistory || 'None reported'}
Current medications: ${parsed.currentMedications || 'None reported'}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.json({ success: true, summary: buildFallbackSummary(parsed), source: 'local' });
    }

    const data: any = await response.json();
    const textBlock = (data.content || []).find((block: any) => block.type === 'text');
    const summary = textBlock?.text?.trim() || buildFallbackSummary(parsed);

    return res.json({ success: true, summary, source: 'anthropic' });
  } catch (err) {
    console.error('AI summary request failed:', err);
    return res.json({ success: true, summary: buildFallbackSummary(parsed), source: 'local' });
  }
});

function buildFallbackSummary(parsed: z.infer<typeof summaryRequestSchema>): string {
  const parts: string[] = [];
  if (parsed.reasonForVisit) parts.push(`Reason for visit: ${parsed.reasonForVisit}.`);
  if (parsed.symptomsDescription) parts.push(`Reported symptoms: ${parsed.symptomsDescription}.`);
  if (parsed.durationOfSymptoms) parts.push(`Duration: ${parsed.durationOfSymptoms}.`);
  if (parsed.medicalHistory) parts.push(`Relevant history: ${parsed.medicalHistory}.`);
  if (parsed.currentMedications) parts.push(`Current medications: ${parsed.currentMedications}.`);
  if (parts.length === 0) return 'No intake details were provided by the patient.';
  return parts.join(' ');
}
