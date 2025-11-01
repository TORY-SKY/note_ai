"use client"

import { useState, useEffect, useRef } from "react"
import { format, isToday, isTomorrow, parseISO } from "date-fns"
import { CheckCircle, Circle, Clock, Edit, Flag, Mic, Plus, Trash2 } from "lucide-react"

// Import UI components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import ChatBot from "@/components/ui/ChatBot"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AddNewItem } from "../components/AddNewItem"
import {createTask, update_db_Task} from "../lib/utils"


// Task type definition
type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: string;
  title: string;
  due_ate: string;
  priority: Priority;
  completed: boolean;
  created_at: number;
}


// African proverbs for daily insights
const africanProverbs = [
  "The best time to plant a tree was 20 years ago. The second best time is now. - African Proverb",
  "If you want to go fast, go alone. If you want to go far, go together. - African Proverb",
  "Knowledge is like a garden; if it is not cultivated, it cannot be harvested. - African Proverb",
  "When the music changes, so does the dance. - African Proverb",
  "A single bracelet does not jingle. - Congolese Proverb",
  "The lion does not turn around when a small dog barks. - African Proverb",
  "A bird that flies off the earth and lands on an anthill is still on the ground. - Igbo Proverb",
  "However long the night, the dawn will break. - African Proverb",
  "By trying often, the monkey learns to jump from the tree. - Buganda Proverb",
  "When spider webs unite, they can tie up a lion. - Ethiopian Proverb",
]

// Mock data storage service
// const API_URL = "https://eton-ai.onrender.com"
const API_URL = "https://eton-ai.onrender.com"


















export default function App() {
  // State management
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [due_date, setDueDate] = useState("")
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium")
  const [isLoading, setIsLoading] = useState(true)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [dailyProverb, setDailyProverb] = useState("")
  const [isProverbLoading, setIsProverbLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [filter, setFilter] = useState("all");
  const [incomingData, setIncomingData] = useState<Task[]>([]);

  const { toast } = useToast()
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [demoData, setDemoData] = useState<Task[]>([]);

  


  //Simulate fetching a daily African proverb
  const simulateFetchDailyProverb = () => {
    setIsProverbLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * africanProverbs.length);
      setDailyProverb(africanProverbs[randomIndex]);
      setIsProverbLoading(false);
    }, 1500)
  }

  // the AddNewItem function makes Get request to /tasks directory in the nodejs backend
const FetchedTasks = async ()=>{
  try{
const res = await fetch(`${API_URL}/api/tasks`);
const demoData = await res.json();
console.log(demoData);
setDemoData(demoData);
  setIsLoading(false);
    
if(!res.ok){
  const errorBody = await res.json().catch(() => ({ message: 'Failed to parse error body' })); // Handle potential parsing errors
      throw new Error(`HTTP error! status: ${res.status}, body: ${JSON.stringify(errorBody)}`);
}

} catch(error){
  console.error(`Failed to fetch task: ${error.message}. budy`);
  return null;

}
  




  return demoData;

}

// this useEffect fetches for Tasks data from the postgrl sql database everytime the page refreshes
useEffect(()=>{
FetchedTasks()
}, [incomingData])

 const fetchDataAPI = async (tasksData: Task[])=>{
      if (tasksData.length === 0) return; // 👈 Avoid sending empty array


  try{
        const response = await fetch(`${API_URL}/api/tasks/`, {
          method: 'POST',
          headers: {
                    'Content-Type': 'application/json',
          },
          body: JSON.stringify(tasksData), //send only one data object at once

        });  



        if(!response.ok){
          throw new Error(`HTTP error! status: ${response.status}`);
        } else{
          console.log(`${response.status}`)
        }

        const result = await response.json();
        FetchedTasks();

  }catch(err){
    console.error("Failed to send tasks", err);

  }
 };





  const addTask = async () => {
    if (!newTask.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      // Create new task
      const task: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newTask,
        due_date: due_date || format(new Date(), "yyyy-MM-dd"),
        priority,
        completed: false,
        created_at: Date.now(),
      }
      const db_task = {
        title: newTask,
        priority,
        completed: false,
        due_date
      }

      // Add task to state
      const updatedTasks = [...tasks, task];
      const extractTask = updatedTasks.map((task)=> task);



      setIncomingData(extractTask);
      // Reset form
      setNewTask("")
      setDueDate("")
      setPriority(task.priority);
      fetchDataAPI(db_task);
      toast({
        title: "Success",
        description: "Task added successfully",

      })

      // Simulate AI processing for task augmentation
      simulateAiTaskAugmentation(task);


    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    }
  }










  // Simulate AI task augmentation
  const simulateAiTaskAugmentation = async (task: Task) => {
    setIsAiLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Generate mock AI suggestions
      const aiSuggestions = {
        subTasks: generateMockSubtasks(task.title),
        resources: generateMockResources(task.title),
        refinedPriority: task.priority === "Medium" ? "High" : task.priority,
      }

      // Update task with AI suggestions
      updateTaskWithAiSuggestions(task.id, aiSuggestions)
      setIsAiLoading(false);
    }, 2000)
  }

  // Generate mock subtasks based on task title
  const generateMockSubtasks = (title: string): string[] => {
    const lowercaseTitle = title.toLowerCase()

    if (lowercaseTitle.includes("meeting")) {
      return ["Prepare agenda", "Send calendar invites", "Review previous notes"]
    } else if (lowercaseTitle.includes("report")) {
      return ["Gather data", "Create draft", "Review with team"]
    } else if (lowercaseTitle.includes("buy") || lowercaseTitle.includes("purchase")) {
      return ["Compare prices", "Check local availability", "Arrange delivery"]
    } else {
      return ["Research background information", "Create timeline for completion", "Follow up after completion"]
    }
  }

  // Generate mock resources based on task title
  const generateMockResources = (title: string): string[] => {
    const lowercaseTitle = title.toLowerCase()

    if (lowercaseTitle.includes("meeting")) {
      return ["Meeting room", "Projector", "Note-taking app"]
    } else if (lowercaseTitle.includes("report")) {
      return ["Spreadsheet software", "Data sources", "Report template"]
    } else if (lowercaseTitle.includes("buy") || lowercaseTitle.includes("purchase")) {
      return ["Local market contact", "Price comparison website", "Mobile payment app"]
    } else {
      return ["Notebook", "Calendar reminder", "Collaboration tools"]
    }
  }

  // Update task with AI suggestions
  const updateTaskWithAiSuggestions = async (taskId: string, aiSuggestions: any) => {
    try {
      // Update local state
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, aiSuggestions } : task)))


      toast({
        title: "AI Suggestions Ready",
        description: "Task has been enhanced with AI suggestions",
      })
    } catch (error) {
      console.error("Error updating task with AI suggestions:", error)
    }
  }

  // Toggle task completion status
  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      // Update local state
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !currentStatus } : task)))

      toast({
        title: !currentStatus ? "Task Completed" : "Task Reopened",
        description: !currentStatus ? "Great job on completing your task!" : "Task has been reopened",
      })
    } catch (error) {
      console.error("Error toggling task completion:", error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }
 
  // Open edit dialog for a task
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
    console.log(task);

//     const updateTask = async (
//   id: string,
//   updates: Partial<Task>
// ): Promise<Task> => {
//   const res = await fetch(`${BASE_URL}/${id}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(updates),
//   });
//   return res.json();
// };


  }


  // Update task
  const updateTask = async () => {
    if (!editingTask) return

    try {
      // Update local state
     if(editingTask.title === ""){
      alert("title cannot be empty");
      return
     }
      setEditingTask(tasks.map((task) => (task.id === editingTask.id ? editingTask : task)));
  update_db_Task(editingTask.id, editingTask);
    await  FetchedTasks();

      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (task: Task) => {
    setTaskToDelete(task)
    setIsDeleteDialogOpen(true)
  }

// useEffect(()=>{
// if(editingTask){
//   update_db_Task(editingTask.id, editingTask);
//   console.log("from editing task, it says:");
//   console.log(editingTask);

// }

//   // console.log(`editingTask ${editingTask.id ? editingTask.id : "editingTask is null"}`);
// }, [editingTask])
  // Delete task
  const deleteTask = async () => {


    if (!taskToDelete) return

    try {
      // Update local state
      const item_to_delete = demoData.filter((task) => 

        task.id !== taskToDelete.id


      )



      setIsDeleteDialogOpen(false);

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
      // this part of the code handles the id of the task to be deleted
      async function deleteTaskFromDB (taskId){

    const endPoint =`${API_URL}/api/tasks/${taskId}`;
    console.log(endPoint);
    const response = await fetch(endPoint, {
      method: 'DELETE',
    });
    console.log(response.status);

}
deleteTaskFromDB(taskToDelete.id);
      setDemoData(item_to_delete);


    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }

  }


//   useEffect(()=>{
// async ()=>{
//   // const dataa = await fetch()
//   await FetchedTasks();
// // console.log(demoData);



// }
//   }, [editingTask]);

  // Open task detail dialog with AI strategic advice
  const openDetailDialog = (task: Task) => {
    // setSelectedTask(demoData)
    setIsDetailDialogOpen(true)

    // Simulate generating AI strategic advice if not already present
    if (!task.aiAdvice) {
      simulateGenerateAiAdvice(task)
    }
  }

  // Simulate generating AI strategic advice
  // const simulateGenerateAiAdvice = async (task: Task) => {
  //   setIsAiLoading(true)

  //   // Simulate API call delay
  //   setTimeout(() => {
  //     const aiAdvice = generateMockAiAdvice(task)

  //     // Update task with AI advice
  //     updateTaskWithAiAdvice(task.id, aiAdvice)
  //     setIsAiLoading(false)
  //   }, 2000)
  // }

  // Generate mock AI advice based on task
  const generateMockAiAdvice = (task: Task): string => {
    const lowercaseTitle = task.title.toLowerCase()

    if (lowercaseTitle.includes("meeting")) {
      return "Consider holding this meeting during cooler morning hours to maximize productivity, especially if power supply might be inconsistent. Prepare offline materials as backup in case of connectivity issues. Involve community elders or respected figures if the meeting involves significant decisions to ensure buy-in from all stakeholders."
    } else if (lowercaseTitle.includes("report")) {
      return "When preparing this report, consider including local context and cultural nuances that might affect interpretation of data. Ensure you have backup copies stored in multiple locations due to potential infrastructure challenges. Consider translating key findings into local languages for broader accessibility."
    } else if (lowercaseTitle.includes("buy") || lowercaseTitle.includes("purchase")) {
      return "Before making this purchase, consider checking with local community networks who might offer better prices or quality. Support local businesses where possible to strengthen community economic resilience. Consider the sustainability and long-term maintenance requirements in the local context."
    } else {
      return "Break this task into smaller steps that can be completed even with limited resources or connectivity. Consider involving community members who might benefit from skill development. Plan for potential delays due to infrastructure challenges and build buffer time into your schedule."
    }
  }

  // Update task with AI advice
  const updateTaskWithAiAdvice = async (taskId: string, aiAdvice: string) => {
    try {
      // Update local state
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, aiAdvice } : task)))

      // Also update selectedTask if it's the current one
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, aiAdvice })
      }
    } catch (error) {
      console.error("Error updating task with AI advice:", error)
    }
  }

  // Open voice input dialog
  const openVoiceDialog = () => {
    setIsVoiceDialogOpen(true)
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      if (isToday(date)) return "Today"
      if (isTomorrow(date)) return "Tomorrow"
      return format(date, "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/80 hover:bg-rose-600/80"
      case "Medium":
        return "bg-sky-500/80 hover:bg-sky-600/80"
      case "Low":
        return "bg-emerald-500/80 hover:bg-emerald-600/80"
      default:
        return "bg-slate-500/80 hover:bg-slate-600/80"
    }
  }

  // Filter tasks based on selected filter
  const filteredTasks = ()=>
   incomingData.filter((task) => {

    
    if (filter === "all") return true
    if (filter === "completed") return task.completed
    if (filter === "active") return !task.completed
    if (filter === "high") return task.priority === "High"
    if (filter === "today") {
      try {
        const date = parseISO(task.due_date);

        return isToday(date)
      } catch {
        return false
      }
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
          <ChatBot />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Eton</h1>


          
          <p className="text-slate-300">Your African-centered productivity companion</p>
        </header>

        {/* Daily African Proverb */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-white">Daily African Insight</h2>
          </div>
          {isProverbLoading ? (
            <div className="h-6 bg-white/5 rounded animate-pulse"></div>
          ) : (
            <p className="text-slate-200 italic">{dailyProverb}</p>
          )}
        </div>

        {/* Task Creation Form */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-white">Add New Task</h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  ref={taskInputRef}
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="pr-10 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/20"
                />
                <button
                  onClick={openVoiceDialog}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400"
                  aria-label="Voice input"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate" className="text-slate-300 mb-1.5 block">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={due_date}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl text-white focus:border-sky-400 focus:ring-sky-400/20"
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div>
                <Label htmlFor="priority" className="text-slate-300 mb-1.5 block">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-white focus:border-sky-400 focus:ring-sky-400/20">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 text-white">
                    <SelectItem value="High" className="focus:bg-sky-500/20 focus:text-white">
                      High
                    </SelectItem>
                    <SelectItem value="Medium" className="focus:bg-sky-500/20 focus:text-white">
                      Medium
                    </SelectItem>
                    <SelectItem value="Low" className="focus:bg-sky-500/20 focus:text-white">
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={()=>{
                addTask();

              }}

              className="mt-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl"
              disabled={isLoading}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
        

        {/* Task Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={`rounded-xl ${
              filter === "all" ? "bg-sky-500 hover:bg-sky-600" : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter("active")}
            variant={filter === "active" ? "default" : "outline"}
            className={`rounded-xl ${
              filter === "active" ? "bg-sky-500 hover:bg-sky-600" : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            Active
          </Button>
          <Button
            onClick={() => setFilter("completed")}
            variant={filter === "completed" ? "default" : "outline"}
            className={`rounded-xl ${
              filter === "completed" ? "bg-sky-500 hover:bg-sky-600" : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            Completed
          </Button>
          <Button
            onClick={() => setFilter("high")}
            variant={filter === "high" ? "default" : "outline"}
            className={`rounded-xl ${
              filter === "high" ? "bg-sky-500 hover:bg-sky-600" : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            High Priority
          </Button>
          <Button
            onClick={() => setFilter("today")}
            variant={filter === "today" ? "default" : "outline"}
            className={`rounded-xl ${
              filter === "today" ? "bg-sky-500 hover:bg-sky-600" : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            Today
          </Button>
        </div>


        {/* Task List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/10 rounded-3xl p-4 shadow animate-pulse">
                <div className="h-6 bg-white/5 rounded w-3/4 mb-3"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-white/5 rounded w-20"></div>
                  <div className="h-5 bg-white/5 rounded w-24"></div>
                </div>
              </div>
            ))
          ) : demoData.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 text-center shadow-lg border border-white/20">
              <p className="text-slate-300">No tasks found. Add a new task to get started!</p>
            </div>
          ) : (
            demoData.map((task) => (
              <div
                key={task.id}
                className={`backdrop-blur-xl bg-white/10 rounded-3xl p-5 shadow-lg border ${
                  task.completed ? "border-emerald-500/30" : "border-white/20"
                } transition-all duration-200 hover:shadow-xl hover:bg-white/15`}
              >
                {/*stop her*/}
                <div className="flex items-start gap-3">
                  {/* Task completion toggle */}
                  <button
                    onClick={() => toggleTaskCompletion(task.id, task.completed)}
                    className="mt-1 text-slate-400 hover:text-sky-400"
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>

                  {/* Task content */}
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-medium ${task.completed ? "text-slate-400 line-through" : "text-white"}`}
                    >
                      {task.title}
                    </h3>

                    {/* Task metadata */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={`rounded-lg ${getPriorityColor(task.priority)}`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>

                      <Badge variant="outline" className="rounded-lg border-white/20 text-slate-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDateForDisplay(task.due_date)}
                      </Badge>
                    </div>

                    {/* AI Suggestions (if available) */}
                    {task.aiSuggestions && (
                      <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-sky-400" />
                          <h4 className="text-sm font-semibold text-white">AI Suggestions</h4>
                        </div>

                        {/* Subtasks */}
                        {task.aiSuggestions.subTasks && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-slate-300 mb-1">Suggested Steps:</p>
                            <ul className="text-sm text-slate-300 pl-5 list-disc">
                              {task.aiSuggestions.subTasks.map((subtask, index) => (
                                <li key={index}>{subtask}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Resources */}
                        {task.aiSuggestions.resources && (
                          <div>
                            <p className="text-xs font-medium text-slate-300 mb-1">Helpful Resources:</p>
                            <div className="flex flex-wrap gap-1">
                              {task.aiSuggestions.resources.map((resource, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs bg-white/5 border-white/10 rounded-lg text-slate-300"
                                >
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Task actions */}
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailDialog(task)}
                        className="rounded-lg border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        Expand Task
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(task)}
                        className="rounded-lg text-slate-400 hover:text-sky-400 hover:bg-white/5"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(task)}
                        className="rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* AI Loading Indicator */}
          {isAiLoading && (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-4 shadow-lg border border-white/20 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-sky-500 border-r-2 border-sky-500"></div>
              <p className="text-slate-300">AI Generating Suggestions...</p>
            </div>
          )}
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="backdrop-blur-xl bg-slate-800/90 rounded-3xl border-white/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-slate-300">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl text-white focus:border-sky-400 focus:ring-sky-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="text-slate-300">
                    Due Date
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingTask.due_date}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl text-white focus:border-sky-400 focus:ring-sky-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority" className="text-slate-300">
                    Priority
                  </Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value: any) => setEditingTask({ ...editingTask, priority: value })}
                  >
                    <SelectTrigger
                      id="edit-priority"
                      className="bg-white/5 border-white/10 rounded-xl text-white focus:border-sky-400 focus:ring-sky-400/20"
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                      <SelectItem value="High" className="focus:bg-sky-500/20 focus:text-white">
                        High
                      </SelectItem>
                      <SelectItem value="Medium" className="focus:bg-sky-500/20 focus:text-white">
                        Medium
                      </SelectItem>
                      <SelectItem value="Low" className="focus:bg-sky-500/20 focus:text-white">
                        Low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl border-white/20 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button onClick={updateTask} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog with AI Strategic Advice */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="backdrop-blur-xl bg-slate-800/90 rounded-3xl border-white/20 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedTask?.title}</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-2">
                {/* Task Details */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={`rounded-lg ${getPriorityColor(selectedTask.priority)}`}>
                    <Flag className="h-3 w-3 mr-1" />
                    {selectedTask.priority} Priority
                  </Badge>
                  <Badge variant="outline" className="rounded-lg border-white/20 text-slate-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Due: {formatDateForDisplay(selectedTask.due_date)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`rounded-lg ${
                      selectedTask.completed
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                        : "bg-sky-500/20 border-sky-500/30 text-sky-300"
                    }`}
                  >
                    {selectedTask.completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>

                {/* AI Strategic Advice */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-sky-400" />
                    <h3 className="font-semibold text-white">Strategic Advice</h3>
                  </div>

                  {isAiLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-sky-500 border-r-2 border-sky-500"></div>
                      <p className="text-slate-300">Generating detailed insights...</p>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-sm">
                      {selectedTask.aiAdvice || "AI is analyzing this task to provide strategic advice..."}
                    </p>
                  )}
                </div>

                {/* AI Suggestions */}
                {selectedTask.aiSuggestions && (
                  <>
                    {/* Subtasks */}
                    <div>
                      <h3 className="font-semibold text-white mb-2">Suggested Steps</h3>
                      <ul className="space-y-2">
                        {selectedTask.aiSuggestions.subTasks.map((subtask, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10"
                          >
                            <div className="h-5 w-5 rounded-full border-2 border-sky-500 flex-shrink-0"></div>
                            <span className="text-slate-300">{subtask}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div>
                      <h3 className="font-semibold text-white mb-2">Helpful Resources</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.aiSuggestions.resources.map((resource, index) => (
                          <Badge
                            key={index}
                            className="text-sm bg-white/5 border-white/10 rounded-lg py-1.5 text-slate-300"
                          >
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setIsDetailDialogOpen(false)}
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Voice Input Dialog */}
        <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
          <DialogContent className="backdrop-blur-xl bg-slate-800/90 rounded-3xl border-white/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Voice Input</DialogTitle>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center justify-center gap-4">
              <div className="h-24 w-24 rounded-full bg-sky-500/20 flex items-center justify-center">
                <Mic className="h-12 w-12 text-sky-400" />
              </div>
              <p className="text-center text-slate-300">
                We are rolling out this feature soon
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsVoiceDialogOpen(false)}
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="backdrop-blur-xl bg-slate-800/90 rounded-3xl border-white/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Task</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-300">Are you sure you want to delete this task? This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="rounded-xl border-white/20 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button onClick={deleteTask} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      
    </div>
  )
}

