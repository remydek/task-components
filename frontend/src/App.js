import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, PencilIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Task Card Component with Apple Vision Pro design
const TaskCard2D = ({ task, onUpdate, onDelete, onComplete, isBlurred }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const colorGradients = {
    red: 'from-red-500 to-black',
    teal: 'from-teal-500 to-black',
    blue: 'from-blue-500 to-black',
    green: 'from-green-500 to-black',
    yellow: 'from-yellow-500 to-black',
    pink: 'from-pink-500 to-black',
    lightblue: 'from-sky-500 to-black',
    purple: 'from-purple-500 to-black'
  };

  const priorityColors = {
    red: 'text-red-400',
    teal: 'text-teal-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    pink: 'text-pink-400',
    lightblue: 'text-sky-400',
    purple: 'text-purple-400'
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle') || e.target.closest('.action-button')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - task.x,
      y: e.clientY - task.y
    });
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: task.width,
      height: task.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isResizing) {
        const newX = Math.max(0, e.clientX - dragStart.x);
        const newY = Math.max(0, e.clientY - dragStart.y);
        onUpdate(task.id, { x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(350, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        onUpdate(task.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, task.id, onUpdate]);

  return (
    <motion.div
      className={`absolute select-none cursor-move task-card-container ${
        isBlurred ? 'opacity-30 blur-sm' : ''
      }`}
      style={{
        left: task.x,
        top: task.y,
        width: task.width,
        height: task.height,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient border container */}
      <div className={`h-full p-[2px] rounded-3xl bg-gradient-to-br ${colorGradients[task.color]}`}>
        {/* Inner card content */}
        <div className="h-full bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 pb-2">
            <div className="flex items-center text-gray-300 text-sm">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Today
            </div>
            {task.priority === 'HIGH' && (
              <div className={`flex items-center text-xs font-medium ${priorityColors[task.color]}`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                High
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 px-4 py-2">
            <p className="text-white text-lg leading-relaxed break-words font-light">
              {task.text}
            </p>
            {task.date && (
              <div className="mt-3 text-gray-400 text-xs">
                Due: {new Date(task.date).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Bottom action bar */}
          <div className="flex justify-between items-center p-4 pt-2">
            <button
              className="action-button p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              className="action-button p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Vision Pro-style resize handle */}
      {isHovered && (
        <motion.div
          className="resize-handle absolute -bottom-3 -right-3 w-8 h-8 cursor-nw-resize"
          onMouseDown={handleResizeStart}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full h-full bg-white/15 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white/60 rounded-full"></div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Particle Explosion Component
const ParticleExplosion = ({ x, y, onComplete }) => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i * 18) * (Math.PI / 180),
    velocity: Math.random() * 3 + 2,
    life: 1
  }));

  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-purple-400 rounded-full"
          initial={{ 
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1
          }}
          animate={{ 
            opacity: 0,
            x: Math.cos(particle.angle) * particle.velocity * 50,
            y: Math.sin(particle.angle) * particle.velocity * 50,
            scale: 0
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};



// Main App Component
function App() {
  const [tasks, setTasks] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [explosions, setExplosions] = useState([]);

  // Load tasks from API
  const loadTasks = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Keyboard event for focus mode toggle
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusMode]);

  const createTask = async (taskData) => {
    try {
      const response = await axios.post(`${API}/tasks`, taskData);
      setTasks([response.data, ...tasks]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, updates);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const completeTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Add explosion
    setExplosions([...explosions, { 
      id: Date.now(), 
      x: task.x + task.width / 2, 
      y: task.y + task.height / 2 
    }]);

    try {
      await axios.post(`${API}/tasks/${taskId}/complete`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const removeExplosion = (explosionId) => {
    setExplosions(explosions.filter(exp => exp.id !== explosionId));
  };

  // Get top 3 tasks for focus mode
  const importantTasks = tasks
    .sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority === 'LOW') return -1;
      if (a.priority === 'LOW' && b.priority === 'HIGH') return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .slice(0, 3)
    .map(t => t.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden">
      {/* Mode indicator */}
      <div className="fixed top-4 right-4 z-40">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          focusMode 
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
        }`}>
          {focusMode ? 'FOCUS MODE' : 'CHAOS MODE'}
        </div>
        <p className="text-gray-400 text-xs mt-1 text-center">Press SPACE</p>
      </div>

      {/* Tasks */}
      <AnimatePresence>
        {tasks.map(task => (
          <TaskCard2D
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onComplete={completeTask}
            isBlurred={focusMode && !importantTasks.includes(task.id)}
          />
        ))}
      </AnimatePresence>

      {/* Particle explosions */}
      <AnimatePresence>
        {explosions.map(explosion => (
          <ParticleExplosion
            key={explosion.id}
            x={explosion.x}
            y={explosion.y}
            onComplete={() => removeExplosion(explosion.id)}
          />
        ))}
      </AnimatePresence>

      {/* Task input */}
      <TaskInput onCreateTask={createTask} />

      {/* Instructions */}
      {tasks.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/60">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CHAOS
            </h1>
            <p className="text-xl mb-8">The Anti-Task Manager</p>
            <div className="space-y-2 text-sm">
              <p>Create your first task below</p>
              <p>Double-click to complete • Right-click to delete</p>
              <p>Drag to move • Hover to resize</p>
              <p>Press SPACE for Focus Mode</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;