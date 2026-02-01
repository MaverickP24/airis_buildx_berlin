"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Send } from "lucide-react";
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

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = "";
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Handling accumulation logic carefully
                if (finalTranscript) {
                    setTranscript(prev => (prev + " " + finalTranscript).trim());
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

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
        <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-xl shadow-sm border border-border w-full max-w-md mx-auto">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">New Sale Entry / नई बिक्री</h3>
                <p className="text-sm text-muted-foreground">
                    Tap mic and speak (e.g., "5 Maggi aur 2 Coke 100 rupay mein diye")
                </p>
            </div>

            <div className="relative">
                <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                        isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-primary hover:bg-primary/90",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isProcessing ? (
                        <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
                    ) : isListening ? (
                        <Square className="h-8 w-8 text-white fill-current" />
                    ) : (
                        <Mic className="h-10 w-10 text-white" />
                    )}
                </button>
                {isListening && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                )}
            </div>

            <div className="w-full space-y-2">
                <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Type or speak..."
                    className="w-full min-h-[80px] p-3 text-base rounded-md border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white dark:border-slate-700"
                    disabled={isProcessing}
                />

                <button
                    onClick={handleSend}
                    disabled={!transcript.trim() || isProcessing}
                    className="w-full py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Send className="h-4 w-4" />
                    Process Entry
                </button>
            </div>
        </div>
    );
}
