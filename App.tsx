
import React, { useState, useCallback } from 'react';
import { INITIAL_CASES } from './constants';
import { CaseScenario, AnalysisResult, PlayerStats } from './types';
import { generateMysteryCase, evaluateSubmission } from './services/geminiService';
import { CaseFile } from './components/CaseFile';
import { InvestigationSheet } from './components/InvestigationSheet';
import { FeedbackPanel } from './components/FeedbackPanel';
import { DetectiveBadge } from './components/DetectiveBadge';

// Simple SVG Icons
const MagnifyingGlass = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BadgeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AVAILABLE_TENSES = [
  "Présent",
  "Futur Proche",
  "Passé Composé",
  "Imparfait",
  "Plus-que-parfait",
  "Futur Simple",
  "Conditionnel",
  "Subjonctif",
  "Impératif",
  "Passé Simple"
];

const RANDOM_TOPICS = [
  "a stolen painting", 
  "a missing cat", 
  "a broken window", 
  "a strange letter", 
  "an unpaid debt", 
  "a secret meeting",
  "a mysterious shadow",
  "a forgotten key",
  "a poisoned drink"
];

export default function App() {
  const [currentCase, setCurrentCase] = useState<CaseScenario | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTenses, setSelectedTenses] = useState<string[]>(["Passé Composé", "Imparfait"]);
  const [customTopic, setCustomTopic] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectivePhoto, setDetectivePhoto] = useState<string | null>(null);
  const [stats, setStats] = useState<PlayerStats>({
    casesSolved: 0,
    score: 0,
    weaknesses: {},
    strengths: {}
  });

  const toggleTense = (tense: string) => {
    setSelectedTenses(prev => 
      prev.includes(tense)
        ? prev.filter(t => t !== tense)
        : [...prev, tense]
    );
  };

  const startCase = useCallback(async (scenario?: CaseScenario) => {
    setAnalysis(null);
    setErrorMsg(null);
    if (scenario) {
      setCurrentCase(scenario);
      return;
    }

    if (selectedTenses.length === 0) {
      setErrorMsg("Select at least one tense to focus your investigation.");
      return;
    }

    setIsGenerating(true);
    try {
      const topic = customTopic.trim() || RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
      const newCase = await generateMysteryCase('Intermediate', topic, selectedTenses);
      setCurrentCase(newCase);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to intercept the wire. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTenses, customTopic]);

  const handleSubmission = async (correction: string, explanation: string) => {
    if (!currentCase) return;
    setErrorMsg(null);

    if (correction.trim().length < 5) {
      setErrorMsg("Report too brief. We need more detail to close this file.");
      return;
    }
    if (explanation.trim().split(/\s+/).length < 3) {
      setErrorMsg("Deduction incomplete. Explain your reasoning for the record.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await evaluateSubmission(
        currentCase.context,
        currentCase.brokenText,
        correction,
        explanation
      );
      setAnalysis(result);

      if (result.score >= 80) {
        setStats(prev => ({
          ...prev,
          casesSolved: prev.casesSolved + 1,
          score: prev.score + result.score
        }));
      }
      
      if (result.detectedErrorType) {
        setStats(prev => {
           const type = result.detectedErrorType!;
           const isStrength = result.score > 70;
           const target = isStrength ? prev.strengths : prev.weaknesses;
           return {
             ...prev,
             [isStrength ? 'strengths' : 'weaknesses']: {
               ...target,
               [type]: (target[type] || 0) + 1
             }
           };
        });
      }

    } catch (e) {
      console.error(e);
      setErrorMsg("The radio line went dead. Try re-filing your report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canGenerate = selectedTenses.length > 0 && !isGenerating;

  return (
    <div className="min-h-screen bg-[#1a1a1a] pb-12">
      <header className="bg-[#111] border-b border-stone-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-amber-600 text-stone-900 p-2 rounded-full">
               <MagnifyingGlass />
             </div>
             <div>
               <h1 className="text-xl font-display font-bold text-stone-100 tracking-wider">
                 The Grammar Detective
               </h1>
               <p className="text-xs text-stone-500 font-mono">Bureau des Enquêtes Grammaticales</p>
             </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm font-mono text-stone-400">
             <div className="flex flex-col items-end">
               <span className="text-xs uppercase text-stone-600">Cases Solved</span>
               <span className="text-amber-500 font-bold text-lg">{stats.casesSolved}</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-xs uppercase text-stone-600">Reputation</span>
               <span className="text-amber-500 font-bold text-lg">{stats.score} XP</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-8">
        {errorMsg && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-900/20 border border-red-900/50 p-4 rounded text-red-400 text-sm font-mono flex items-center animate-pulse">
            <span className="mr-3 font-bold">⚠️ DISCREPANCY:</span> {errorMsg}
          </div>
        )}

        {!currentCase && (
           <div className="animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
                <div className="lg:col-span-2 text-center lg:text-left">
                  <h2 className="text-4xl font-display font-bold text-stone-200 mb-6">
                    Ready for your assignment?
                  </h2>
                  <p className="text-stone-400 mb-8 max-w-lg font-mono">
                    Review the case files below or tune your radio to intercept a new crime report. 
                    Every solved case builds your reputation in the bureau.
                  </p>
                </div>
                <div className="flex justify-center">
                  <DetectiveBadge 
                    photo={detectivePhoto} 
                    onPhotoGenerated={setDetectivePhoto} 
                  />
                </div>
             </div>

             <div className="max-w-2xl mx-auto mb-12 bg-stone-900/50 border border-stone-800 p-6 rounded-lg backdrop-blur-sm shadow-xl space-y-8">
               <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                 <div className="md:w-1/3">
                   <h3 className="text-amber-600 font-display font-bold text-lg mb-2 flex items-center">
                     <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 animate-pulse"></span>
                     Grammar Focus
                   </h3>
                   <p className="text-stone-500 text-[10px] font-mono leading-relaxed uppercase">
                     Target specific linguistic anomalies.
                   </p>
                 </div>
                 <div className="md:w-2/3 flex flex-wrap gap-2 justify-end">
                   {AVAILABLE_TENSES.map(tense => (
                     <button 
                       key={tense}
                       onClick={() => toggleTense(tense)}
                       className={`px-2 py-1.5 rounded text-[9px] font-mono border transition-all uppercase tracking-wider
                         ${selectedTenses.includes(tense)
                           ? 'bg-amber-900/40 border-amber-600 text-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
                           : 'bg-stone-800 border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-400'
                         }`}
                     >
                       {tense}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-t border-stone-800 pt-6">
                 <div className="md:w-1/3">
                   <h3 className="text-amber-600 font-display font-bold text-lg mb-2 flex items-center">
                     <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                     Case Theme
                   </h3>
                   <p className="text-stone-500 text-[10px] font-mono leading-relaxed uppercase">
                     Enter a custom scene or leave blank for random dispatch.
                   </p>
                 </div>
                 <div className="md:w-2/3">
                    <input 
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g. A heist in the Louvre, a missing tuxedo..."
                      className="w-full bg-stone-900 border-b-2 border-stone-700 text-stone-200 p-2 font-mono text-sm focus:outline-none focus:border-amber-600 transition-colors placeholder:text-stone-700"
                    />
                 </div>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {INITIAL_CASES.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => startCase(c)}
                    className="group bg-stone-800 border border-stone-700 hover:border-amber-600 p-6 rounded text-left transition-all hover:shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{c.difficulty}</span>
                      <span className="text-stone-600 group-hover:text-amber-500">
                        <BadgeIcon />
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-200 mb-2 font-display">{c.title}</h3>
                    <p className="text-sm text-stone-500 line-clamp-2">{c.context}</p>
                  </button>
                ))}
                
                <button
                  onClick={() => startCase()}
                  disabled={!canGenerate}
                  className={`border p-6 rounded text-center flex flex-col items-center justify-center transition-all group relative overflow-hidden
                    ${canGenerate 
                      ? 'bg-amber-900/20 border-amber-900/50 hover:bg-amber-900/30 cursor-pointer' 
                      : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                >
                  {isGenerating ? (
                    <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mb-2"/>
                  ) : (
                    <span className={`text-4xl mb-2 transition-colors ${canGenerate ? 'text-amber-700 group-hover:text-amber-500' : 'text-stone-700'}`}>+</span>
                  )}
                  <span className={`font-bold uppercase tracking-widest ${canGenerate ? 'text-amber-600' : 'text-stone-600'}`}>
                    {isGenerating ? 'Receiving Wire...' : 'Generate Custom Case'}
                  </span>
                </button>
             </div>
           </div>
        )}

        {currentCase && (
          <div className="space-y-8 animate-slide-up">
            <button 
              onClick={() => {
                setCurrentCase(null);
                setAnalysis(null);
                setErrorMsg(null);
              }}
              className="text-stone-500 hover:text-amber-500 text-sm font-mono flex items-center transition-colors"
            >
              ← Back to Case Files
            </button>
            
            <CaseFile scenario={currentCase} detectivePhoto={detectivePhoto} />

            {!analysis && (
              <InvestigationSheet 
                onSubmit={handleSubmission} 
                isAnalyzing={isAnalyzing} 
                caseId={currentCase.id}
              />
            )}

            {analysis && (
              <FeedbackPanel 
                result={analysis} 
                onNextCase={() => {
                   setCurrentCase(null);
                   setAnalysis(null);
                   setErrorMsg(null);
                }} 
              />
            )}
          </div>
        )}
      </main>
      
      <footer className="fixed bottom-4 right-4 z-40">
         {Object.keys(stats.weaknesses).length > 0 && (
           <div className="bg-stone-900 border border-stone-700 p-4 rounded shadow-2xl max-w-xs">
             <h4 className="text-amber-600 text-xs font-bold uppercase mb-2">Suspect Patterns</h4>
             <ul className="space-y-1">
               {Object.entries(stats.weaknesses).map(([key, val]) => (
                 <li key={key} className="text-xs text-stone-400 flex justify-between">
                   <span>{key}</span>
                   <span className="text-red-500">{val}x</span>
                 </li>
               ))}
             </ul>
           </div>
         )}
      </footer>
    </div>
  );
}
