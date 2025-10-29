// utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {Input} from "../components/ui/input"


// 🔹 Tailwind class merging utility (keep as-is)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 🔹 Backend Task API Types and Functions
export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
}

const BASE_URL = 'http://localhost:8080/api/tasks';

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch(BASE_URL);
  console.log(res);
  return res.json();
};

export const createTask = async (
  task: Omit<Task, 'id' | 'completed'>
): Promise<Task> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return res.json();
};

export const update_db_Task = async (
  id: string,
  updates: Partial<Task>
): Promise<Task> => {
  // 1. Use the 'id' parameter to construct the URL
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  // 2. Correctly check for success status
  if (!res.ok) {
    let errorMessage = `HTTP error! Status: ${res.status}`;
    
    // --- START OF ROBUST ERROR FIX ---
    // Read the body safely as text first (consumes the stream)
    const rawErrorBody = await res.text(); 
    
    // Attempt to parse the text as JSON only if content exists and looks like JSON
    if (rawErrorBody && (rawErrorBody.trim().startsWith('{') || rawErrorBody.trim().startsWith('['))) {
        try {
            const errorBody = JSON.parse(rawErrorBody);
            // Prioritize a message field, or use the whole object
            errorMessage += ` - ${errorBody.message || JSON.stringify(errorBody)}`;
        } catch (e) {
            // If JSON parsing fails despite the brackets, use the raw text
            errorMessage += ` - Raw body: ${rawErrorBody.substring(0, 150)}...`;
            console.error("Failed to parse error body as JSON, falling back to raw text.", e);
        }
    } else if (rawErrorBody) {
        // If it's plain text/HTML, use it directly
        errorMessage += ` - ${rawErrorBody.substring(0, 150)}...`;
    }
    // --- END OF ROBUST ERROR FIX ---

    // Throw the final error
    throw new Error(errorMessage);
  }

  // 3. Return the parsed JSON response for successful requests
  // This is safe because we only reach this line on a successful (res.ok) response
  return res.json();
};


// delete function

export const deleteTask = async (id: string): Promise<void> => {
  await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};

