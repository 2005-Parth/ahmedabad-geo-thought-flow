
export interface WorkflowStep {
  id: string;
  operation: string;
  input: string;
  parameters: Record<string, any>;
  explanation: string;
  status: 'pending' | 'executing' | 'completed' | 'error';
  result?: any;
  editable?: boolean;
}

export interface GeoQuery {
  id: string;
  query: string;
  timestamp: Date;
  steps: WorkflowStep[];
  status: 'processing' | 'completed' | 'error';
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'flood-risk' | 'green-space' | 'heat-island' | 'urban-boundary';
  data: any;
  visible: boolean;
  color: string;
}
