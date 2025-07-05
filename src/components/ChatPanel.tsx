
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, MapPin, Waves, Trees, Thermometer, Play } from 'lucide-react';
import { GeoQuery, WorkflowStep } from '@/types/workflow';
import WorkflowStepComponent from './WorkflowStep';

interface ChatPanelProps {
  queries: GeoQuery[];
  onSubmitQuery: (query: string) => void;
  onEditStep: (queryId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  onExecuteStep: (queryId: string, stepId: string) => void;
  onExecuteWorkflow: (queryId: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  queries,
  onSubmitQuery,
  onEditStep,
  onExecuteStep,
  onExecuteWorkflow
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new queries are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [queries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onSubmitQuery(inputQuery.trim());
      setInputQuery('');
    }
  };

  const sampleQueries = [
    {
      icon: <Waves className="w-4 h-4" />,
      text: "Find flood-risk zones near Sabarmati River",
      color: "text-blue-600"
    },
    {
      icon: <Trees className="w-4 h-4" />,
      text: "Locate parks within 2km of Kankaria Lake",
      color: "text-green-600"
    },
    {
      icon: <Thermometer className="w-4 h-4" />,
      text: "Identify urban heat islands in Ahmedabad",
      color: "text-red-600"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Ahmedabad GeoAI</h2>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            Chain-of-Thought
          </Badge>
        </div>
        <p className="text-xs text-gray-600">
          Intelligent geospatial analysis with explainable workflows
        </p>
      </div>

      {/* Query suggestions (shown when no queries) */}
      {queries.length === 0 && (
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Try these Ahmedabad-specific queries:
          </h3>
          <div className="space-y-2">
            {sampleQueries.map((sample, index) => (
              <Card 
                key={index}
                className="p-3 cursor-pointer hover:bg-blue-50 transition-colors border-dashed"
                onClick={() => setInputQuery(sample.text)}
              >
                <div className={`flex items-center gap-2 text-sm ${sample.color}`}>
                  {sample.icon}
                  <span>{sample.text}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Chat history */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {queries.map((query) => (
            <div key={query.id} className="space-y-3">
              {/* User query */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[85%] shadow-sm">
                  <p className="text-sm">{query.query}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {query.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* AI Response - Chain of Thought */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">GeoAI Assistant</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        query.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        query.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {query.status}
                    </Badge>
                  </div>
                </div>

                {/* Workflow steps */}
                <div className="ml-10 space-y-2">
                  {query.steps.map((step) => (
                    <WorkflowStepComponent
                      key={step.id}
                      step={step}
                      onEdit={(stepId, updates) => onEditStep(query.id, stepId, updates)}
                      onExecute={(stepId) => onExecuteStep(query.id, stepId)}
                    />
                  ))}
                </div>

                {/* Execute workflow button */}
                {query.steps.length > 0 && query.status === 'processing' && (
                  <div className="ml-10">
                    <Button
                      onClick={() => onExecuteWorkflow(query.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Complete Workflow
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input form */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about Ahmedabad's geospatial data..."
            className="flex-1"
          />
          <Button type="submit" disabled={!inputQuery.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Powered by DeepSeek-R1 & Google Earth Engine
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
