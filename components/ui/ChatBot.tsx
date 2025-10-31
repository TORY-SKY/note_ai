import {useState} from "react";
import ChatWindow from "./ChatWindow"
import {BotMessageSquare} from "lucide-react"
import Ai_icon from "./Ai_icon"

export default function ChatBot (){
    const [isOpen, setIsOpen] = useState(false);
    
    // The console.log is fine, but not needed in production code.

    return (
        <>
            {/* 1. Conditionally render the full ChatWindow, which handles its own closing */}
            {isOpen && (
                // The ChatWindow component should handle its own positioning (fixed, bottom, right)
                // or you can wrap it here with its container classes.
                <div className="fixed bottom-4 right-4 z-50 shadow-lg "> 
                    <ChatWindow isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
            )}
            

            {!isOpen && (
                <div 
                    className="fixed bottom-4 right-4 z-50 rounded-full items-center justify-center animate-bounce transition" 
                    onClick={()=>setIsOpen(true)} 
                >
                    {/* Assuming Ai_icon is your button/icon for opening */}
                    <Ai_icon className="size-14" /> 
                </div>
            )}
        </>
    );
};