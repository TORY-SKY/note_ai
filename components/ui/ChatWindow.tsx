import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Send } from 'lucide-react';
import TypewriterEffect from "../TypewriterEffect"

// Define the shape of a single message
type Message = {
    id: number;
    text: string;
    sender: 'user' | 'ai';
};

export default function ChatWindow ({isOpen, setIsOpen}){
    
    // --- 1. STATE MANAGEMENT ---
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm eton_ai, how can I assist you?", sender: "ai" }
    ]);
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Ref for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- 2. SCROLL EFFECT ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll to bottom whenever messages update or loading state changes
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);


    if(!isOpen){
        return null
    }

    // --- 3. API INTEGRATION (USING FETCH) ---
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault(); 
        
        if (input.trim() === "" || isLoading) return;

        const userText = input.trim();
        
        // A. Immediately add the user's message to the UI
        const newUserMessage: Message = { 
            id: Date.now(), 
            text: userText, 
            sender: "user" 
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInput("");
        setIsLoading(true);

        // B. Call the Express.js Backend API using fetch
        try {
            const response = await fetch('http://localhost:8080/api/chat', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send history and prompt to maintain context
                body: JSON.stringify({ 
                    history: messages,
                    prompt: userText,
                }),
            });

            // Handle HTTP error status
            if (!response.ok) {
                // Fetch does NOT reject on 4xx/5xx, so we manually throw an error.
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // C. Parse the JSON response
            const {message, ai} = await response.json();


            
            // D. Add the AI's response from the backend to the UI
            const aiResponse: Message = { 
                id: Date.now() + 1, 
                text: ai || "Server response was incomplete.",
                sender: "ai" 
            };
            setMessages(prevMessages => [...prevMessages, aiResponse]);


        } catch (error) {
            console.error("Error communicating with backend:", error);
            const errorMessage: Message = { 
                id: Date.now() + 1, 
                text: "Error: Could not connect to eton_ai server or API call failed.", 
                sender: "ai" 
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);

        }
    };


    return (
        <>
            {/* Close Button: Adjusted position to be outside the main rounded chat window for better UX */}
            <button className="absolute -top-3 -right-3 p-2 rounded-full bg-red-500 z-50 hover:bg-red-600" onClick={() => setIsOpen(false)} >
                <X className="w-5 h-5 text-white" />
            </button>
            
            {/* Main Chat Container: Using flex-col and flex-grow to manage layout */}
            <div className="relative flex flex-col w-80 h-96 rounded-xl shadow-2xl bg-white z-40">

                {/* Navigation Bar (Sticky Header) */}
                <nav className="flex flex-row items-center justify-between p-3 rounded-t-xl z-20 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 text-white flex-shrink-0">
                    <div className="flex flex-row items-center gap-2">
                        <img src="./ai.avif" className="size-10 rounded-full border-2 border-white" alt="AI avatar" />
                        <div>
                            <p className="text-xs opacity-80">Welcome</p>
                            <h1 className="text-base font-bold">eton_ai</h1>
                        </div>
                    </div>
                    <ChevronDown className="w-5 h-5" />
                </nav>
                
                {/* 4. CHAT MESSAGE DISPLAY AREA (Scrollable Content) */}
                <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-gray-50 flex flex-col">
                    {messages.map((message) => (
                        <div 
                            key={message.id} 
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-2 rounded-xl whitespace-pre-wrap text-sm shadow-md ${
                                message.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-gray-200 text-gray-800 rounded-tl-sm'
                            }`}>
                            
                            {message.sender === "user" ? message.text : <TypewriterEffect text={message.text} />}
                                {/*{message.text}*/}
                            }
                            </div>
                        </div>
                    ))}
                    {/* Loading/Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 text-gray-800 p-2 rounded-xl rounded-tl-sm text-sm animate-pulse">
                                AI is typing...
                            </div>
                        </div>
                    )}
                    {/* Empty div for auto-scrolling */}
                    <div ref={messagesEndRef} /> 
                </div>

                {/* 5. INPUT FORM */}
                <form onSubmit={handleSend} className="p-3 border-t bg-white flex items-center flex-shrink-0 rounded-b-xl">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className={`text-white p-2 rounded-r-lg transition duration-150 ${
                            input.trim() === "" || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={input.trim() === "" || isLoading}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>

            </div>
        </>
    );
};