"use client";

import { useState } from "react";
import { Loader2, User, Stethoscope, TestTube, ArrowRight, BrainCircuit, Search } from "lucide-react";
import { PatientData, ClinicalTrialStudy } from "@/lib/types";

const SAMPLE_TRANSCRIPTS = [
  `Dr. Smith: Good morning, Sarah. How have you been feeling since we last adjusted your asthma medication?
Sarah: Hi Dr. Smith. Honestly, it's been a bit of a struggle. I'm still using my rescue inhaler almost every day, especially after I exercise.
Dr. Smith: I see. That means your asthma isn't as controlled as we'd like. Remind me, you're 32 now, correct?
Sarah: Yes, that's right.
Dr. Smith: Okay. Given that the current inhaler isn't fully managing your symptoms, I think we should look into some alternative therapies. There are some promising new treatments, including some clinical trials for severe or uncontrolled asthma that might be a good fit for you. Let's explore those options.`,
  `Dr. Jones: Hello Mark. I have your recent A1C results here, and they are still elevated at 8.5%. 
Mark: Yeah, I was worried about that. I've been trying to watch my diet, but it's tough with my work schedule.
Dr. Jones: I understand. Since you are 55 and the Metformin isn't quite getting us to our goal for your Type 2 Diabetes, we might want to consider adding another medication. There are also some interesting clinical trials currently recruiting for new diabetes management protocols. Would you be open to hearing about them?
Mark: Sure, I'd be willing to try something new if it helps get my sugar under control.`,
  `Dr. Lee: Hi Emily. How are your joints feeling this month? Any improvement with the new biologic?
Emily: Not really, Dr. Lee. My hands are still very stiff in the mornings, and the swelling in my knees hasn't gone down much.
Dr. Lee: I'm sorry to hear that. For a 35-year-old with Rheumatoid Arthritis, we want to aim for much better mobility and pain control. Since you haven't responded well to the standard biologics, you might be a good candidate for a clinical trial testing a new class of targeted therapies.
Emily: That sounds promising. I just want to be able to play with my kids without pain.`,
  `Dr. Patel: Good afternoon, Robert. How have the tremors been lately?
Robert: They've been getting worse, especially in my right hand. And I've noticed I'm moving a lot slower than I used to.
Dr. Patel: Let's review your chart. You're 65, and we diagnosed you with Parkinson's disease about three years ago. The Levodopa seems to be wearing off faster between doses now. 
Robert: Exactly. By the time I'm due for the next pill, I can barely walk.
Dr. Patel: There are a few actively recruiting trials looking at extended-release formulations and completely new mechanisms to treat motor fluctuations in Parkinson's. Let's see if you qualify for any.`,
  `Dr. Garcia: Welcome back, Chloe. Did the recent MRI show any new lesions?
Chloe: Unfortunately, yes. The radiologist said there are two new active spots on my spine. My legs have been feeling really weak and tingly again.
Dr. Garcia: I see. Relapsing-remitting Multiple Sclerosis can be unpredictable. You're only 28, so we need to be aggressive about preventing further disease progression. 
Chloe: What are our options? The current infusions make me feel so sick.
Dr. Garcia: We can look at switching your disease-modifying therapy. I also know of a trial investigating a novel remyelination drug that aims to actually repair nerve damage. It might be worth exploring.`,
  `Dr. Adams: Hello, Lisa. I received the results from your latest mammogram and biopsy.
Lisa: Hi Dr. Adams. I've been so anxious. What did they find?
Dr. Adams: I know this is difficult to hear, but the biopsy confirmed early-stage Breast Cancer. The good news is that we caught it very early.
Lisa: Oh no. What does this mean for me? I'm only 45.
Dr. Adams: Given your age and the specific markers on the tumor, we have several effective treatment options. In fact, there is a very promising clinical trial right now looking at a targeted hormone therapy for women exactly in your demographic. We can discuss whether you'd like to enroll.
Lisa: Please, I want to know all my options to fight this.`
];

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [sampleIndex, setSampleIndex] = useState(0);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
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
                onClick={() => {
                  setTranscript(SAMPLE_TRANSCRIPTS[sampleIndex]);
                  setSampleIndex((prev) => (prev + 1) % SAMPLE_TRANSCRIPTS.length);
                }}
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
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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

            {!patientData && loading && (
              <div className="bg-white border border-gray-200 rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 shadow-sm">
                <div className="relative flex items-center justify-center w-32 h-32 mb-8">
                  {/* Outer pulse */}
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-60"></div>
                  {/* Inner pulse */}
                  <div className="absolute inset-2 bg-blue-50 rounded-full animate-pulse opacity-80 delay-150"></div>
                  
                  {/* Central icon container */}
                  <div className="relative z-10 bg-gradient-to-tr from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center">
                    <BrainCircuit className="w-10 h-10 animate-pulse" />
                  </div>
                  
                  {/* Orbiting scanning icon */}
                  <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-blue-600 p-1.5 rounded-full shadow-md border border-gray-100">
                      <Search className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Analyzing Transcript</h3>
                <p className="text-sm text-gray-500 max-w-[280px]">
                  Our AI is extracting medical conditions and demographics to query ClinicalTrials.gov...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
