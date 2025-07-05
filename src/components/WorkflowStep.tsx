
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Check, X, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { WorkflowStep as WorkflowStepType } from '@/types/workflow';

interface WorkflowStepProps {
  step: WorkflowStepType;
  onEdit: (stepId: string, updates: Partial<WorkflowStepType>) => void;
  onExecute: (stepId: string) => void;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ step, onEdit, onExecute }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedParams, setEditedParams] = useState(step.parameters);

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'executing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'executing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSaveEdit = () => {
    onEdit(step.id, { parameters: editedParams });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedParams(step.parameters);
    setIsEditing(false);
  };

  return (
    <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h4 className="font-medium text-sm">{step.operation}</h4>
          <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
            {step.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {step.editable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 p-0"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
          
          {step.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExecute(step.id)}
              className="h-6 w-6 p-0"
            >
              <Play className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
        <strong>Input:</strong> {step.input}
      </div>

      {/* Parameters section */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-700">Parameters:</h5>
        {isEditing ? (
          <div className="space-y-2">
            {Object.entries(editedParams).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs text-gray-600 w-20 truncate">{key}:</label>
                <Input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => setEditedParams({
                    ...editedParams,
                    [key]: typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                  })}
                  className="h-6 text-xs flex-1"
                />
              </div>
            ))}
            <div className="flex gap-1 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-6 px-2">
                <X className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSaveEdit} className="h-6 px-2">
                <Check className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(step.parameters).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
        <strong>💡 Explanation:</strong> {step.explanation}
      </div>

      {/* Result (if available) */}
      {step.result && (
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
          <strong>Result:</strong> {JSON.stringify(step.result, null, 2)}
        </div>
      )}
    </Card>
  );
};

export default WorkflowStep;
