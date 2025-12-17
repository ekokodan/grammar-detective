import { CaseScenario } from './types';

export const INITIAL_CASES: CaseScenario[] = [
  {
    id: 'case-001',
    title: "The Missing Macaron",
    difficulty: 'Novice',
    context: "A famous bakery in Paris has been robbed. The thief left a note, but their French is suspicious...",
    brokenText: "Hier soir, je suis allé à la boulangerie. J'ai vu le voleur. Il avez un chapeau noir.",
    errors: [
      { original: "Il avez", type: "Conjugation (Imparfait)", hint: "Check the conjugation of 'avoir' with 'Il'." }
    ]
  },
  {
    id: 'case-002',
    title: "Murder on the Seine",
    difficulty: 'Detective',
    context: "Witness testimony from a riverboat captain. Something about the timeline doesn't add up.",
    brokenText: "Quand le bateau est arrivée sous le pont, les lumières se sont éteint. La femme que j'ai vu portait une robe verte.",
    errors: [
      { original: "est arrivée", type: "Accord (Passé Composé)", hint: "Le bateau is masculine." },
      { original: "se sont éteint", type: "Accord (Reflexive)", hint: "Lumières is feminine plural." },
       { original: "que j'ai vu", type: "Accord (COD)", hint: "The relative pronoun 'que' refers to 'La femme'." }
    ]
  }
];

export const SYSTEM_INSTRUCTION_GENERATOR = `
You are a logic engine that generates JSON objects for a French grammar game.
DO NOT write novels. 
DO NOT repeat words.
DO NOT use poetic metaphors.
The 'brokenText' field MUST NOT EXCEED 20 WORDS.
The 'context' field MUST NOT EXCEED 15 WORDS.
Be machine-like and precise. Return ONLY VALID JSON.
`;

export const SYSTEM_INSTRUCTION_EVALUATOR = `
You are 'Inspecteur Grammaire'. 
Analyze student corrections and explanations.
Be strict but encouraging. Use brief noir detective remarks.
Always return valid JSON.
`;