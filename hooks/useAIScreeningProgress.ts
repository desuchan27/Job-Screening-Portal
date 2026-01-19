import { useState, useCallback } from "react";

export interface ProgressUpdate {
  message: string;
  data?: any;
  timestamp: string;
}

export function useAIScreeningProgress() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [progress, setProgress] = useState<ProgressUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const startAnalysis = useCallback(async (applicationId: string) => {
    setIsAnalyzing(true);
    setCurrentStep("Initializing...");
    setProgress([]);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/ai-screening?stream=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start AI screening");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const update: ProgressUpdate = JSON.parse(line.slice(6));
              
              setProgress((prev) => [...prev, update]);
              setCurrentStep(update.message);

              // Check if this is the final result
              if (update.data?.analysis) {
                setResult(update.data.analysis);
              }

              // Check for errors
              if (update.message.startsWith("Error:")) {
                setError(update.message);
              }
            } catch (e) {
              console.error("Failed to parse SSE message:", e);
            }
          }
        }
      }

      setIsAnalyzing(false);
    } catch (err) {
      console.error("AI screening error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setCurrentStep("");
    setProgress([]);
    setError(null);
    setResult(null);
  }, []);

  return {
    isAnalyzing,
    currentStep,
    progress,
    error,
    result,
    startAnalysis,
    reset,
  };
}
