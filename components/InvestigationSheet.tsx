import React, { useState, useEffect } from 'react';

interface InvestigationSheetProps {
  onSubmit: (correction: string, explanation: string) => void;
  isAnalyzing: boolean;
  caseId: string; // Used to reset fields when a new case is loaded
}

export const InvestigationSheet: React.FC<InvestigationSheetProps> = ({ onSubmit, isAnalyzing, caseId }) => {
  const [correction, setCorrection] = useState('');
  const [explanation, setExplanation] = useState('');

  // Reset fields only when the case ID changes
  useEffect(() => {
    setCorrection('');
    setExplanation('');
  }, [caseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(correction, explanation);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mt-6 shadow-2xl max-w-2xl mx-auto">
      <h3 className="text-amber-500 font-display text-xl mb-4 flex items-center">
        <span className="mr-2">✎</span> Detective's Log
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">
            Rewrite the Evidence (Corrected)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Transcribe the evidence above, but fix all grammatical errors as you write.
          </p>
          <textarea
            className="w-full bg-slate-900 text-stone-100 border border-slate-600 rounded p-4 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            rows={3}
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="Type the full, corrected French text here..."
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">
            Deduction (Explanation)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Explain your reasoning. Why were the original sentences incorrect?
          </p>
          <textarea
            className="w-full bg-slate-900 text-stone-100 border border-slate-600 rounded p-4 font-sans focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain the grammar rules you applied..."
          />
        </div>

        <button
          type="submit"
          disabled={isAnalyzing || !explanation.trim() || !correction.trim()}
          className={`w-full py-4 px-6 rounded font-bold uppercase tracking-widest transition-all
            ${isAnalyzing 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-amber-600 hover:bg-amber-500 text-slate-900 shadow-[0_4px_0_rgb(146,64,14)] hover:shadow-[0_2px_0_rgb(146,64,14)] hover:translate-y-[2px]'
            }`}
        >
          {isAnalyzing ? 'Analyzing Findings...' : 'File Official Report'}
        </button>
      </form>
    </div>
  );
};