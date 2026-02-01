"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    isProcessing: boolean;
}

export default function VoiceInput({ onTranscript, isProcessing }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'hi-IN';

            recognition.onstart = () => setIsListening(true);

            recognition.onresult = (event: any) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => (prev + " " + finalTranscript).trim());
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript("");
            recognitionRef.current?.start();
        }
    };

    const handleSend = () => {
        if (transcript.trim()) {
            onTranscript(transcript);
        }
    };

    return (
        <div className="relative group overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-800 p-8 max-w-md mx-auto w-full transition-all">
            {/* Background Decorative Element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>

            <div className="flex flex-col items-center relative z-10">
                <div className="flex items-center gap-2 mb-8 bg-violet-50 dark:bg-violet-900/30 px-3 py-1 rounded-full">
                    <Sparkles className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Smart Voice Entry</span>
                </div>

                {/* Microphone Button Container */}
                <div className="relative mb-8">
                    {/* Animated Pulse Rings */}
                    {isListening && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring scale-125"></div>
                            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring scale-150 [animation-delay:0.5s]"></div>
                        </>
                    )}

                    <button
                        onClick={toggleListening}
                        disabled={isProcessing}
                        className={cn(
                            "relative h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl z-20",
                            isListening
                                ? "bg-red-500 hover:bg-red-600 ring-8 ring-red-500/10"
                                : "bg-primary hover:bg-primary/90 shadow-primary/40"
                        )}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        ) : isListening ? (
                            <Square className="h-8 w-8 text-white animate-in zoom-in duration-300" />
                        ) : (
                            <Mic className="h-10 w-10 text-white animate-in zoom-in duration-300" />
                        )}
                    </button>

                    {/* Status Indicator */}
                    <div className={cn(
                        "absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all duration-300",
                        isListening ? "bg-red-500 text-white opacity-100 translate-y-0" : "bg-white text-slate-400 opacity-0 translate-y-2"
                    )}>
                        LISTENING
                    </div>
                </div>

                <div className="text-center mb-8 space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Record Sale</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
                        Just say item names and quantities
                    </p>
                </div>

                <div className="w-full space-y-4">
                    <div className="relative group/input">
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Voice transcript will appear here..."
                            className="w-full min-h-[100px] p-4 text-sm rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            disabled={isProcessing}
                        />
                        {transcript && (
                            <button
                                onClick={() => setTranscript("")}
                                className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!transcript.trim() || isProcessing}
                        className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-xl"
                    >
                        <Send className="h-4 w-4" />
                        Save Entry
                    </button>
                </div>
            </div>
        </div>
    );
}

