import React from 'react';
import { AnalysisResult } from '../types';

interface FeedbackPanelProps {
  result: AnalysisResult;
  onNextCase: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ result, onNextCase }) => {
  const isSuccess = result.score >= 80;

  return (
    <div className={`mt-8 p-6 rounded-lg border-2 max-w-2xl mx-auto animate-fade-in
      ${isSuccess ? 'bg-green-900/20 border-green-600/50' : 'bg-red-900/20 border-red-600/50'}`}>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-2xl font-display font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
          {isSuccess ? 'CASE CRACKED!' : 'EVIDENCE REJECTED'}
        </h3>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 uppercase">Detective Score</span>
          <span className={`text-3xl font-mono font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {result.score}/100
          </span>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <p className="text-lg text-slate-200 leading-relaxed font-serif italic">
          "{result.feedback}"
        </p>
      </div>

      {result.grammarLesson && (
        <div className="bg-slate-900/50 p-4 rounded border-l-4 border-amber-500 mb-6">
          <h4 className="text-amber-500 text-xs font-bold uppercase mb-1">Detective's Notebook</h4>
          <p className="text-slate-300 text-sm">{result.grammarLesson}</p>
        </div>
      )}

      {result.detectedErrorType && (
        <div className="flex items-center space-x-2 text-xs text-slate-500 uppercase tracking-widest mb-6">
          <span>Focus Area:</span>
          <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
            {result.detectedErrorType}
          </span>
        </div>
      )}

      <button
        onClick={onNextCase}
        className="w-full bg-slate-200 hover:bg-white text-slate-900 font-bold py-3 px-6 rounded transition-colors uppercase tracking-widest"
      >
        {isSuccess ? 'Take Next Case' : 'Try Another Case'}
      </button>
    </div>
  );
};
