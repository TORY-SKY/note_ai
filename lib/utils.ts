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
  const res = await fetch(`${BASE_URL}/${updates.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });


  if(res.error){
    console.error(res.error)
  }
  return res.json();

};

export const deleteTask = async (id: string): Promise<void> => {
  await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};

