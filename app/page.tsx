"use client";

import { useState } from "react";
import { Loader2, User, Stethoscope, TestTube, ArrowRight } from "lucide-react";
import { PatientData, ClinicalTrialStudy } from "@/lib/types";

const SAMPLE_TRANSCRIPT = `Dr. Smith: Good morning, Sarah. How have you been feeling since we last adjusted your asthma medication?
Sarah: Hi Dr. Smith. Honestly, it's been a bit of a struggle. I'm still using my rescue inhaler almost every day, especially after I exercise.
Dr. Smith: I see. That means your asthma isn't as controlled as we'd like. Remind me, you're 32 now, correct?
Sarah: Yes, that's right.
Dr. Smith: Okay. Given that the current inhaler isn't fully managing your symptoms, I think we should look into some alternative therapies. There are some promising new treatments, including some clinical trials for severe or uncontrolled asthma that might be a good fit for you. Let's explore those options.`;

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [trials, setTrials] = useState<ClinicalTrialStudy[]>([]);

  const handleSearch = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    setError(null);
    setPatientData(null);
    setTrials([]);

    try {
      const response = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch trials");
      }

      setPatientData(data.patientData);
      setTrials(data.trials);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">DeepScribe Clinical Trials Matcher</h1>
          <p className="text-gray-600 mt-2">Extract patient data from transcripts and find relevant clinical trials.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Patient Transcript
              </h2>
              <button
                onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Load Sample
              </button>
            </div>
            
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the patient-doctor conversation here..."
              className="flex-1 w-full min-h-[300px] p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
            />
            
            <button
              onClick={handleSearch}
              disabled={loading || !transcript.trim()}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Transcript...
                </>
              ) : (
                <>
                  Find Matches
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {patientData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-green-600" />
                  Extracted Patient Profile
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Condition</div>
                    <div className="font-semibold text-gray-900">{patientData.condition}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Age</div>
                    <div className="font-semibold text-gray-900">{patientData.age ? `${patientData.age} years` : 'Not specified'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Gender</div>
                    <div className="font-semibold text-gray-900 capitalize">{patientData.gender?.toLowerCase() || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            )}

            {patientData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <TestTube className="w-5 h-5 text-purple-600" />
                  Clinical Trial Matches
                  <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {trials.length} found
                  </span>
                </h2>
                
                <div className="space-y-4">
                  {trials.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No actively recruiting trials found for this profile.
                    </div>
                  ) : (
                    trials.map((study) => {
                      const idModule = study.protocolSection.identificationModule;
                      const condModule = study.protocolSection.conditionsModule;
                      
                      return (
                        <div key={idModule.nctId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <a 
                              href={`https://clinicaltrials.gov/study/${idModule.nctId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                            >
                              {idModule.nctId}
                            </a>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                              RECRUITING
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                            {idModule.briefTitle}
                          </h3>
                          
                          {condModule?.conditions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {condModule.conditions.slice(0, 3).map((cond, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {cond}
                                </span>
                              ))}
                              {condModule.conditions.length > 3 && (
                                <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded">
                                  +{condModule.conditions.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            
            {!patientData && !loading && (
              <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <TestTube className="w-12 h-12 mb-4 text-gray-300" />
                <p>Enter a transcript and find matches to see extracted patient profiles and clinical trials.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
