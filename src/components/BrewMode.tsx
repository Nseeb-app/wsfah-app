"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MaterialIcon from "./MaterialIcon";

interface Step {
  stepNumber: number;
  title: string;
  description: string;
}

interface BrewModeProps {
  steps: Step[];
  brewTimeSec: number;
  recipeName: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function BrewMode({ steps, brewTimeSec, recipeName, onClose, onComplete }: BrewModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(brewTimeSec);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const timerProgress = brewTimeSec > 0 ? ((brewTimeSec - timer) / brewTimeSec) * 100 : 0;

  useEffect(() => {
    if (running && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setRunning(false);
            // Vibrate on timer end
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, timer]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      // Vibrate on step change
      if (navigator.vibrate) navigator.vibrate(100);
    } else {
      setCompleted(true);
      setRunning(false);
    }
  }, [currentStep, totalSteps]);

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const resetTimer = () => {
    setRunning(false);
    setTimer(brewTimeSec);
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-[200] bg-background-dark flex flex-col items-center justify-center text-white p-8">
        <div className="text-center space-y-6">
          <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <MaterialIcon icon="check_circle" className="text-6xl text-primary" filled />
          </div>
          <h2 className="text-3xl font-extrabold">اكتمل التحضير!</h2>
          <p className="text-white/60 text-lg">{recipeName}</p>
          <div className="flex gap-4 mt-8">
            <button
              onClick={onComplete}
              className="flex-1 bg-primary text-background-dark font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity"
            >
              سجّل هذا التحضير
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-background-dark flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={onClose} className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center">
          <MaterialIcon icon="close" className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-xs text-white/50 uppercase tracking-wider font-bold">وضع التحضير</p>
          <p className="text-sm font-medium text-white/80">{recipeName}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Step Progress Bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= currentStep ? "bg-primary" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-white/40 mt-2 text-center">
          الخطوة {currentStep + 1} من {totalSteps}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
          <MaterialIcon icon="coffee_maker" className="text-3xl text-primary" />
        </div>
        <h3 className="text-sm text-primary font-bold uppercase tracking-wider mb-2">
          {step?.title || `Step ${currentStep + 1}`}
        </h3>
        <p className="text-2xl font-bold leading-relaxed max-w-md">
          {step?.description}
        </p>
      </div>

      {/* Timer Section */}
      <div className="px-6 pb-4">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="text-center mb-4">
            <p className="text-5xl font-mono font-extrabold tracking-wider">
              {formatTime(timer)}
            </p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-3">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetTimer}
              className="size-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"
            >
              <MaterialIcon icon="restart_alt" className="text-white/70" />
            </button>
            <button
              onClick={() => setRunning(!running)}
              className={`size-16 rounded-full flex items-center justify-center text-2xl ${
                running ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/80"
              } transition-colors`}
            >
              <MaterialIcon icon={running ? "pause" : "play_arrow"} className={running ? "text-white" : "text-background-dark"} />
            </button>
            <button
              onClick={() => setTimer((t) => Math.max(0, t - 10))}
              className="size-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"
            >
              <MaterialIcon icon="fast_forward" className="text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center gap-4 px-6 pb-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex-1 py-4 rounded-2xl border border-white/20 font-bold text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
        >
          السابق
        </button>
        <button
          onClick={nextStep}
          className="flex-1 py-4 rounded-2xl bg-primary text-background-dark font-bold hover:opacity-90 transition-opacity"
        >
          {currentStep === totalSteps - 1 ? "إنهاء" : "الخطوة التالية"}
        </button>
      </div>
    </div>
  );
}
