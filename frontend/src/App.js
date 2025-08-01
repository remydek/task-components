import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, PencilIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Task Card Component - Enhanced with all improvements
const TaskCard2D = ({ task, onUpdate, onDelete, onComplete, isBlurred }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dragParticles, setDragParticles] = useState([]);

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

  // Create drag particles
  const createDragParticle = (x, y) => {
    const particle = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      life: 1
    };
    setDragParticles(prev => [...prev, particle]);
    
    // Remove particle after animation
    setTimeout(() => {
      setDragParticles(prev => prev.filter(p => p.id !== particle.id));
    }, 500);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isResizing) {
        const newX = Math.max(0, e.clientX - dragStart.x);
        const newY = Math.max(0, e.clientY - dragStart.y);
        
        // Create subtle drag particles
        if (Math.random() < 0.3) { // 30% chance
          createDragParticle(e.clientX, e.clientY);
        }
        
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

  // SVG Icons
  const WarningIcon = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L1 22h22L12 2zm0 3.5L20.5 20h-17L12 5.5z"/>
      <circle cx="12" cy="16" r="1"/>
      <path d="M12 10v4"/>
    </svg>
  );

  const TurtleIcon = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 18c-4 0-8-2-8-6V8c0-2.2 1.8-4 4-4s4 1.8 4 4c0-2.2 1.8-4 4-4s4 1.8 4 4v4c0 4-4 6-8 6z"/>
      <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2z"/>
      <path d="M14 8c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2z"/>
      <path d="M6 10h2v2H6zm10 0h2v2h-2z"/>
    </svg>
  );

  const BombIcon = () => (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
      <path d="M18 6l2-2M16 4l2-2M20 8l2-2"/>
      <circle cx="12" cy="10" r="2"/>
    </svg>
  );

  const DeleteIcon = () => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <div
      className={`absolute select-none cursor-move task-card-container ${
        isBlurred ? 'opacity-30 blur-sm' : ''
      }`}
      style={{
        left: task.x,
        top: task.y,
        width: task.width,
        height: task.height,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.1s ease'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced gradient border with hover effect */}
      <div 
        className={`h-full p-[2px] rounded-3xl transition-all duration-300`}
        style={{
          background: isHovered 
            ? `linear-gradient(225deg, ${task.color === 'red' ? '#ef4444' : task.color === 'teal' ? '#14b8a6' : task.color === 'blue' ? '#3b82f6' : task.color === 'green' ? '#22c55e' : task.color === 'yellow' ? '#eab308' : task.color === 'pink' ? '#ec4899' : task.color === 'lightblue' ? '#0ea5e9' : '#a855f7'}, black 70%)`
            : `linear-gradient(135deg, ${task.color === 'red' ? '#ef4444' : task.color === 'teal' ? '#14b8a6' : task.color === 'blue' ? '#3b82f6' : task.color === 'green' ? '#22c55e' : task.color === 'yellow' ? '#eab308' : task.color === 'pink' ? '#ec4899' : task.color === 'lightblue' ? '#0ea5e9' : '#a855f7'}, black 50%)`
        }}
      >
        {/* Inner card content */}
        <div className="h-full bg-black/80 rounded-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 pb-2">
            <div className="flex items-center text-gray-300 text-sm">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Today
            </div>
            {task.priority === 'HIGH' && (
              <div className={`flex items-center text-xs font-medium ${priorityColors[task.color]}`}>
                <WarningIcon />
                <span className="ml-1">High</span>
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
              className="action-button p-2 hover:bg-white/10 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <DeleteIcon />
            </button>
            <button
              className="action-button p-2 hover:bg-white/10 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
            >
              <BombIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced resize handle with rounded corners */}
      {isHovered && (
        <div
          className="resize-handle absolute -bottom-3 -right-3 w-8 h-8 cursor-nw-resize opacity-100 rounded-full"
          onMouseDown={handleResizeStart}
        >
          <div className="w-full h-full bg-white/15 rounded-full border border-white/20 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white/60 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Drag particles */}
      {dragParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/40 rounded-full pointer-events-none"
          style={{
            left: particle.x - task.x,
            top: particle.y - task.y,
            animation: 'fadeOutParticle 0.5s ease-out forwards'
          }}
        />
      ))}
    </div>
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

// Task Input Component - Enhanced with new icons
const TaskInput = ({ onCreateTask }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
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

  // Enhanced icon components
  const TurtleIcon = () => (
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 18c-4 0-8-2-8-6V8c0-2.2 1.8-4 4-4s4 1.8 4 4c0-2.2 1.8-4 4-4s4 1.8 4 4v4c0 4-4 6-8 6z"/>
      <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2z"/>
      <path d="M14 8c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2z"/>
      <path d="M6 10h2v2H6zm10 0h2v2h-2z"/>
    </svg>
  );

  const WarningIcon = () => (
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L1 22h22L12 2zm0 3.5L20.5 20h-17L12 5.5z"/>
      <circle cx="12" cy="16" r="1"/>
      <path d="M12 10v4"/>
    </svg>
  );

  const DropperIcon = () => (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.7 3.3c-.4-.4-1-.4-1.4 0L12 7.6 8.7 4.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4L10.6 9l-7.3 7.3c-.4.4-.4 1 0 1.4.2.2.4.3.7.3s.5-.1.7-.3L12 10.4l7.3 7.3c.2.2.4.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4L13.4 9l3.3-3.3c.4-.4.4-1 0-1.4z"/>
      <circle cx="18" cy="6" r="2"/>
    </svg>
  );

  const PriorityIcon = () => {
    if (priority === 'HIGH') {
      return (
        <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
          <WarningIcon />
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
          <TurtleIcon />
        </div>
      );
    }
  };

  const ColorPickerIcon = () => (
    <div className="relative">
      <DropperIcon />
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${colors.find(c => c.name === selectedColor)?.color} border border-black`}></div>
    </div>
  );

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <form onSubmit={handleSubmit} className="flex items-center bg-black/80 rounded-3xl p-4 border border-white/10 shadow-2xl">
        {/* Plus Icon */}
        <div className="flex-shrink-0 mr-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        {/* Main Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's important today?"
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-xl font-light mr-8"
        />

        {/* Controls */}
        <div className="flex items-center space-x-6">
          {/* Priority Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-300 text-sm font-medium">Priority</span>
            <button
              type="button"
              onClick={() => setPriority(priority === 'LOW' ? 'HIGH' : 'LOW')}
            >
              <PriorityIcon />
            </button>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="p-2 rounded-xl"
            >
              <CalendarIcon className="w-6 h-6 text-white" />
            </button>
            
            {showDatePicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-xl p-3 border border-white/20">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white border border-white/20 rounded-lg px-2 py-1"
                />
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-xl"
            >
              <ColorPickerIcon />
            </button>
            
            {showColorPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-xl p-4 border border-white/20">
                <div className="grid grid-cols-2 gap-3">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full ${color.color} transition-transform hover:scale-110 ${
                        selectedColor === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

// Main App Component - Optimized for Speed
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
      // Optimistic update - instant UI response
      const tempTask = {
        ...taskData,
        id: Date.now().toString(),
        width: 350,
        height: 200,
        completed: false,
        created_at: new Date().toISOString()
      };
      setTasks([tempTask, ...tasks]);

      // Then update backend
      const response = await axios.post(`${API}/tasks`, taskData);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === tempTask.id ? response.data : task
        )
      );
    } catch (error) {
      console.error('Error creating task:', error);
      // Revert optimistic update on error
      setTasks(tasks);
    }
  };

  const updateTask = async (taskId, updates) => {
    // Instant UI update
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));

    // Background API update
    try {
      await axios.put(`${API}/tasks/${taskId}`, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      // Could add error handling/retry logic here
    }
  };

  const deleteTask = async (taskId) => {
    // Instant removal
    setTasks(tasks.filter(task => task.id !== taskId));

    try {
      await axios.delete(`${API}/tasks/${taskId}`);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const completeTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Instant explosion and removal
    setExplosions([...explosions, { 
      id: Date.now(), 
      x: task.x + task.width / 2, 
      y: task.y + task.height / 2 
    }]);
    setTasks(tasks.filter(t => t.id !== taskId));

    try {
      await axios.post(`${API}/tasks/${taskId}/complete`);
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

      {/* Particle explosions */}
      {explosions.map(explosion => (
        <ParticleExplosion
          key={explosion.id}
          x={explosion.x}
          y={explosion.y}
          onComplete={() => removeExplosion(explosion.id)}
        />
      ))}

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