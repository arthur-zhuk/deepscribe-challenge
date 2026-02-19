import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

const PatientDataSchema = z.object({
  condition: z.string().describe("The primary medical condition or diagnosis. Provide a single concise term (e.g., 'Asthma', 'Type 2 Diabetes')."),
  age: z.number().nullable().describe("The patient's age in years, if mentioned. Null if not mentioned."),
  gender: z.enum(["MALE", "FEMALE"]).nullable().describe("The patient's biological gender, if mentioned. Null if not mentioned."),
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.parse({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'system',
          content: 'You are an expert medical assistant. Extract the patient\'s primary condition, age, and gender from the transcript to search for clinical trials. Be precise and concise.',
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      response_format: zodResponseFormat(PatientDataSchema, 'patient_data'),
    });

    const patientData = completion.choices[0].message.parsed;

    if (!patientData || !patientData.condition) {
      return NextResponse.json(
        { error: 'Failed to extract condition from transcript.' },
        { status: 400 }
      );
    }

    const url = new URL('https://clinicaltrials.gov/api/v2/studies');
    
    // Add primary condition to search
    url.searchParams.append('query.cond', patientData.condition);
    
    // Filter to only actively recruiting trials
    url.searchParams.append('filter.overallStatus', 'RECRUITING');
    
    // NOTE: We have removed demographic `query.term` filtering.
    // The ClinicalTrials v2 API is highly sensitive and often returns no results 
    // when terms like "32 Years" or "FEMALE" are combined with the condition,
    // because trial text isn't strictly standardized to those exact phrases.
    // Instead, we let the robust `query.cond` parameter pull the active matches.
    
    url.searchParams.append('pageSize', '10');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ClinicalTrials API Error:', response.status, errorText, 'URL:', url.toString());
      throw new Error(`ClinicalTrials API returned status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      patientData,
      trials: data.studies || [],
    });
  } catch (error) {
    console.error('Error processing transcript:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
