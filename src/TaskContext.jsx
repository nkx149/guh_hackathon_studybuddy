import { createContext, useContext, useState } from "react";
import { SEED_TASKS, START } from "./data";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => SEED_TASKS.map(task => ({ ...task })));
  const [now, setNow] = useState(START);

  const resetDemo = () => {
    setTasks(SEED_TASKS.map(task => ({ ...task })));
    setNow(START);
  };

  return (
    <TaskContext.Provider value={{ tasks, setTasks, now, setNow, resetDemo }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
}
