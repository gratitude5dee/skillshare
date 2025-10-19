import React, { useState, useEffect } from 'react';
import { Brain, Zap, Target, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface AnalysisProgressProps {
  recordingId: string;
}

export function AnalysisProgress({ recordingId }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { icon: Brain, label: 'Analyzing UI Elements', duration: 20 },
    { icon: Zap, label: 'Extracting Actions', duration: 30 },
    { icon: Target, label: 'Generating Instructions', duration: 25 },
    { icon: CheckCircle, label: 'Creating Workflow', duration: 25 }
  ];

  useEffect(() => {
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 1;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update current step
      let accumulatedDuration = 0;
      for (let i = 0; i < analysisSteps.length; i++) {
        accumulatedDuration += analysisSteps[i].duration;
        if (elapsed <= accumulatedDuration) {
          setCurrentStep(i);
          break;
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [recordingId]);

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">AI Analysis in Progress</h4>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} className="w-full" />

          <div className="space-y-2">
            {analysisSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep || progress >= 100;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 text-sm transition-opacity ${
                    isActive ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <StepIcon className="h-3 w-3" />
                    )}
                  </div>
                  
                  <span className={isActive ? 'font-medium' : ''}>
                    {step.label}
                  </span>
                  
                  {isActive && (
                    <div className="flex-1 flex justify-end">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-75" />
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground">
            Using Gemini to identify workflow patterns and create automation scripts.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}