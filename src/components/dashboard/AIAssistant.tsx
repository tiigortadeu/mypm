import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';
import Button from '../ui/Button';

const AIAssistant: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI product assistant. How can I help you with your projects today?",
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);

    // Simulate AI response
    setTimeout(() => {
      let response = "I'm analyzing your request...";

      if (message.toLowerCase().includes('idea')) {
        response =
          'That sounds like an interesting idea! Let me help you break it down into key components to validate and develop further.';
      } else if (message.toLowerCase().includes('user stor')) {
        response =
          "I can help you create user stories. Think about what your users need to accomplish, and we'll structure it properly.";
      } else if (
        message.toLowerCase().includes('task') ||
        message.toLowerCase().includes('project')
      ) {
        response =
          'I can help you organize your project tasks. Would you like me to suggest a breakdown or prioritization approach?';
      }

      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: response },
      ]);
    }, 1000);

    setMessage('');
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>AI Assistant</CardTitle>
          <Sparkles className="h-5 w-5 text-secondary-500" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  chat.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{chat.content}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex w-full space-x-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask your AI assistant..."
            className="input flex-1"
          />
          <Button onClick={handleSendMessage} variant="primary">
            <Send size={18} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIAssistant;
