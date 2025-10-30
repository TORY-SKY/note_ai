import {useState} from "react";
import { ChevronDown, X  } from 'lucide-react';

export default function ChatWindow ({isOpen, setIsOpen}){
if(!isOpen){
	return null
}

	return (
<>
{/*<div className="absolute bg-cover bg-black w-full h-full"></div>*/}
<button className="absolute right-0 bg-red-500 z-50 " onClick={() => setIsOpen(false)} >
		<X  className="flex flex-row top-0 text-white"  />
			
		</button>
	<div className="relative rounded-xl rounded-xl items-center justify-center p-1 shadow-xl bg-opacity-30 backdrop-blur-lg z-40 w-80 h-96">
	{/*<div className="absolute top-0 flex ">*/}
		
	{/*</div>*/}

		<nav className="flex flex-row items-center justify-between p-3 rounded-xl z-20 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700">
			{/*user display image*/}
			<div className="flex flex-row items-center justify-between">
				<img src="./ai.avif" className="size-14" />
				<div>
					<p>Welcome</p>
					<h1>eton_ai</h1>
				</div>
			</div>
			<div>
				    <ChevronDown />
			</div>
		</nav>

		<div>
			{/*chatbot*/}

		</div>

	</div>
</>

		);
};