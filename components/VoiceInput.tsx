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
        <div className="bg-white rounded-[2.5rem] shadow-sm border-none p-10 max-w-md mx-auto w-full transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-all duration-500" />

            <div className="flex flex-col items-center relative z-10">
                {/* Microphone Ring */}
                <div className="relative mb-10">
                    {isListening && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-150" />
                    )}

                    <button
                        onClick={toggleListening}
                        disabled={isProcessing}
                        className={cn(
                            "relative h-28 w-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl z-20",
                            isListening
                                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                : "bg-primary hover:bg-primary/95 shadow-primary/30"
                        )}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        ) : isListening ? (
                            <Square className="h-10 w-10 text-white animate-in zoom-in duration-300" />
                        ) : (
                            <Mic className="h-12 w-12 text-white animate-in zoom-in duration-300" />
                        )}
                    </button>

                    {isListening && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-bounce">
                            Live Listening
                        </div>
                    )}
                </div>

                <div className="text-center mb-10 space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Record Business</h3>
                    <p className="text-sm font-medium text-gray-400">
                        "2 packet Maggi 24 rupaye cash mein"
                    </p>
                </div>

                <div className="w-full space-y-5">
                    <div className="relative group/input">
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Transcript will appear here as you speak..."
                            className="w-full min-h-[120px] p-6 text-sm font-bold rounded-3xl border-none bg-gray-50 text-gray-900 placeholder:text-gray-300 resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all leading-relaxed"
                            disabled={isProcessing}
                        />
                        {transcript && (
                            <button
                                onClick={() => setTranscript("")}
                                className="absolute top-4 right-4 text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!transcript.trim() || isProcessing}
                        className="w-full h-16 bg-gray-900 text-white rounded-[2rem] font-black text-sm tracking-widest uppercase hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl shadow-gray-900/10"
                    >
                        <Send className="h-5 w-5" />
                        Process Entry
                    </button>
                </div>
            </div>
        </div>
    );
}

