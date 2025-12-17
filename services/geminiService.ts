
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CaseScenario } from "../types";
import { SYSTEM_INSTRUCTION_GENERATOR, SYSTEM_INSTRUCTION_EVALUATOR } from "../constants";

/**
 * Transforms a base64 image into a noir detective style portrait.
 */
export const noirifyImage = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash-image";
  
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const prompt = `
    Transform this person into a 1940s noir detective. 
    Add a fedora and trench coat. 
    Use harsh chiaroscuro lighting. 
    High-contrast B&W, grainy texture.
    Keep face recognizable.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) throw new Error("No candidates");

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    throw new Error("No image data");
  } catch (error) {
    console.error("Noirification failed:", error);
    throw error;
  }
};

/**
 * Generates a new random mystery case with specific grammatical errors.
 */
export const generateMysteryCase = async (difficulty: string, topic: string, tenses: string[] = []): Promise<CaseScenario> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const tenseInstruction = tenses.length > 0
    ? `MANDATORY: Focus errors on ${tenses.join(', ')}.`
    : `MANDATORY: Focus errors on Passé Composé or Imparfait.`;

  const prompt = `
    Generate a JSON mystery case based on this theme: "${topic}". 
    Difficulty: ${difficulty}
    Grammar focus: ${tenseInstruction}

    Constraints:
    - brokenText: EXACTLY 2 sentences in French. Use simple but narrative language. Include exactly 1 or 2 mistakes in the requested tenses.
    - context: EXACTLY 1 sentence in English explaining the situation.
    - errors: Detailed array of the specific mistakes.

    Format:
    {
      "title": "A short noir title",
      "context": "Context for the player",
      "brokenText": "French text with the mistakes",
      "errors": [{ "original": "the wrong part", "type": "Tense Name", "hint": "Useful clue" }]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_GENERATOR,
        responseMimeType: "application/json",
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            context: { type: Type.STRING },
            brokenText: { type: Type.STRING },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  type: { type: Type.STRING },
                  hint: { type: Type.STRING }
                },
                required: ["original", "type", "hint"]
              }
            }
          },
          required: ["title", "context", "brokenText", "errors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    const data = JSON.parse(text);

    return {
      id: `case-${Math.floor(Math.random() * 900) + 100}`,
      difficulty: difficulty as CaseScenario['difficulty'],
      title: data.title,
      context: data.context,
      brokenText: data.brokenText,
      errors: data.errors
    };
  } catch (error) {
    console.error("Generation failed:", error);
    return {
      id: "error-999",
      difficulty: 'Novice',
      title: "The Silent Witness",
      context: "A witness is silent.",
      brokenText: "Le suspect est parti. Il a oublié son clés.",
      errors: [{ original: "son clés", type: "Gender", hint: "Feminine noun." }]
    };
  }
};

/**
 * Evaluates the student's correction.
 */
export const evaluateSubmission = async (
  originalContext: string,
  brokenSegment: string,
  studentCorrection: string,
  studentExplanation: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze French grammar fix. 
    Context: "${originalContext}"
    Broken: "${brokenSegment}"
    Student Fix: "${studentCorrection}"
    Student Explanation: "${studentExplanation}"
    
    Rules:
    - isCorrect: true ONLY if all grammar is fixed.
    - feedback: Max 10 words, noir detective style.
    - grammarLesson: Max 15 words, crisp rule.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EVALUATOR,
        responseMimeType: "application/json",
        maxOutputTokens: 400,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            detectedErrorType: { type: Type.STRING },
            grammarLesson: { type: Type.STRING },
            clueFound: { type: Type.BOOLEAN }
          },
          required: ["isCorrect", "score", "feedback", "clueFound"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty evaluation");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Evaluation failed:", error);
    return {
      isCorrect: false,
      score: 0,
      feedback: "Static on the line. Try again.",
      clueFound: false
    };
  }
};
