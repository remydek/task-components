import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, PencilIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Task Card Component with Vision Pro-style resize handles
const TaskCard2D = ({ task, onUpdate, onDelete, onComplete, isBlurred }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const colorMap = {
    red: 'border-red-500',
    teal: 'border-teal-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    pink: 'border-pink-500',
    lightblue: 'border-sky-500',
    purple: 'border-purple-500'
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return;
    
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
      className={`absolute task-card ${colorMap[task.color]} select-none cursor-move ${
        isBlurred ? 'opacity-30 blur-sm' : ''
      } ${task.priority === 'HIGH' ? 'border-2' : 'border'}`}
      style={{
        left: task.x,
        top: task.y,
        width: task.width,
        height: task.height,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => onComplete(task.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        onDelete(task.id);
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-full p-4 bg-black/20 backdrop-blur-lg rounded-2xl border-inherit overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === 'HIGH' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'
          }`}>
            {task.priority}
          </span>
          {task.date && (
            <div className="flex items-center text-green-400 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              {new Date(task.date).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <p className="text-white text-sm leading-relaxed break-words">
          {task.text}
        </p>
      </div>

      {/* Vision Pro-style resize handle */}
      {isHovered && (
        <motion.div
          className="resize-handle absolute -bottom-2 -right-2 w-6 h-6 cursor-nw-resize"
          onMouseDown={handleResizeStart}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center">
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
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

// Task Input Component
const TaskInput = ({ onCreateTask }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedColor, setSelectedColor] = useState('red');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = [
    { name: 'red', color: 'bg-red-500' },
    { name: 'teal', color: 'bg-teal-500' },
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'yellow', color: 'bg-yellow-500' },
    { name: 'pink', color: 'bg-pink-500' },
    { name: 'lightblue', color: 'bg-sky-500' },
    { name: 'purple', color: 'bg-purple-500' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onCreateTask({
      text: text.trim(),
      priority,
      color: selectedColor,
      date: selectedDate || null,
      x: Math.random() * (window.innerWidth - 400) + 50,
      y: Math.random() * (window.innerHeight - 300) + 100
    });

    setText('');
    setSelectedDate('');
    setShowDatePicker(false);
    setShowColorPicker(false);
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4 bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
        {/* Priority Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Priority:</span>
          <button
            type="button"
            onClick={() => setPriority(priority === 'LOW' ? 'HIGH' : 'LOW')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              priority === 'HIGH' 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}
          >
            {priority}
          </button>
        </div>

        {/* Main Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your task..."
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none px-3 py-2 rounded-xl border border-white/20 focus:border-purple-500/50"
        />

        {/* Date Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`p-2 rounded-xl border transition-colors ${
              selectedDate 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <CalendarIcon className="w-5 h-5 text-white" />
            {selectedDate && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>}
          </button>
          
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-full mb-2 right-0 bg-black/80 backdrop-blur-lg rounded-xl p-3 border border-white/20"
            >
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white border border-white/20 rounded-lg px-2 py-1"
              />
            </motion.div>
          )}
        </div>

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded-xl border border-white/20 hover:border-white/40 transition-colors"
          >
            <PencilIcon className="w-5 h-5 text-white" />
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${colors.find(c => c.name === selectedColor)?.color}`}></div>
          </button>
          
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-full mb-2 right-0 bg-black/80 backdrop-blur-lg rounded-xl p-3 border border-white/20"
            >
              <div className="grid grid-cols-4 gap-2">
                {colors.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full ${color.color} ${
                      selectedColor === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50' : ''
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowRightIcon className="w-5 h-5 text-white" />
        </button>
      </form>
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