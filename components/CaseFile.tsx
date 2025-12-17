
import React from 'react';
import { CaseScenario } from '../types';
import { TypewriterText } from './TypewriterText';

interface CaseFileProps {
  scenario: CaseScenario;
  detectivePhoto?: string | null;
}

export const CaseFile: React.FC<CaseFileProps> = ({ scenario, detectivePhoto }) => {
  return (
    <div className="bg-stone-100 text-stone-900 p-6 rounded shadow-lg max-w-2xl mx-auto border-l-4 border-amber-600 transform rotate-1 transition-transform hover:rotate-0 duration-500 relative overflow-visible">
      
      {/* Small detective photo pinned to the corner */}
      {detectivePhoto && (
        <div className="absolute -top-6 -right-6 z-10 animate-fade-in group">
          <div className="bg-stone-200 p-1 border border-stone-400 shadow-md rotate-3 transition-transform group-hover:rotate-0 group-hover:scale-110">
            <img 
              src={detectivePhoto} 
              alt="Assigned Detective" 
              className="w-16 h-16 grayscale object-cover border border-stone-300"
            />
            <div className="bg-amber-600/20 absolute inset-0 pointer-events-none"></div>
          </div>
          <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
             <svg className="w-4 h-4 text-stone-500 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
             </svg>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 border-b-2 border-stone-300 pb-2">
        <h2 className="text-2xl font-bold font-display tracking-widest uppercase text-stone-800">
          Case File: {scenario.id}
        </h2>
        <span className="bg-red-800 text-white text-xs px-2 py-1 uppercase font-bold tracking-wider rounded">
          Confidential
        </span>
      </div>
      
      <div className="mb-6 pr-12"> {/* pr-12 to avoid overlapping photo */}
        <h3 className="text-sm font-bold text-stone-500 uppercase mb-1">Subject</h3>
        <p className="text-xl text-amber-900 font-display font-bold">{scenario.title}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-stone-500 uppercase mb-1">Context</h3>
        <p className="text-stone-700 italic border-l-2 border-stone-300 pl-4">
          {scenario.context}
        </p>
      </div>

      <div className="bg-white p-6 shadow-inner border border-stone-200 relative">
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
        </div>
        <h3 className="text-sm font-bold text-stone-500 uppercase mb-2">Evidence (Transcript)</h3>
        <div className="font-mono text-lg leading-relaxed text-slate-800">
          <TypewriterText text={scenario.brokenText} speed={25} />
        </div>
      </div>
    </div>
  );
};
