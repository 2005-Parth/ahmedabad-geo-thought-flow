
import React, { useState, useCallback } from 'react';
import MapView from '@/components/MapView';
import ChatPanel from '@/components/ChatPanel';
import { GeoQuery, WorkflowStep, MapLayer } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [queries, setQueries] = useState<GeoQuery[]>([]);
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);
  const { toast } = useToast();

  // Generate sample workflow steps based on query
  const generateWorkflowSteps = (query: string): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];
    
    if (query.toLowerCase().includes('flood')) {
      steps.push(
        {
          id: 'step-1',
          operation: 'Data Collection',
          input: 'Ahmedabad elevation data from SRTM',
          parameters: { resolution: '30m', bounds: 'ahmedabad_boundary' },
          explanation: 'Collect digital elevation model to understand terrain and water flow patterns',
          status: 'pending',
          editable: true
        },
        {
          id: 'step-2',
          operation: 'Hydrological Analysis',
          input: 'DEM + precipitation data',
          parameters: { rainfall_threshold: '100mm', buffer_distance: '500m' },
          explanation: 'Analyze water accumulation areas and drainage patterns during heavy rainfall',
          status: 'pending',
          editable: true
        },
        {
          id: 'step-3',
          operation: 'Risk Zone Classification',
          input: 'Flow accumulation + historical flood data',
          parameters: { risk_levels: 3, confidence_threshold: 0.8 },
          explanation: 'Classify areas into high, medium, and low flood risk zones based on multiple factors',
          status: 'pending',
          editable: true
        }
      );
    } else if (query.toLowerCase().includes('park') || query.toLowerCase().includes('green')) {
      steps.push(
        {
          id: 'step-1',
          operation: 'Green Space Detection',
          input: 'Sentinel-2 satellite imagery',
          parameters: { ndvi_threshold: 0.4, min_area: '1000m2' },
          explanation: 'Use NDVI to identify vegetated areas and filter by minimum size',
          status: 'pending',
          editable: true
        },
        {
          id: 'step-2',
          operation: 'Proximity Analysis',
          input: 'Green spaces + reference point',
          parameters: { search_radius: '2000m', transport_mode: 'walking' },
          explanation: 'Calculate accessibility to green spaces within walking distance',
          status: 'pending',
          editable: true
        }
      );
    } else if (query.toLowerCase().includes('heat')) {
      steps.push(
        {
          id: 'step-1',
          operation: 'Land Surface Temperature',
          input: 'Landsat thermal bands',
          parameters: { date_range: '2023-04-01_2023-06-30', cloud_cover: 20 },
          explanation: 'Calculate land surface temperature from thermal infrared imagery',
          status: 'pending',
          editable: true
        },
        {
          id: 'step-2',
          operation: 'Urban Heat Island Detection',
          input: 'LST + land cover classification',
          parameters: { temperature_threshold: '35°C', urban_buffer: '1km' },
          explanation: 'Identify areas with significantly higher temperatures than surroundings',
          status: 'pending',
          editable: true
        }
      );
    }

    return steps;
  };

  const handleSubmitQuery = useCallback((query: string) => {
    const newQuery: GeoQuery = {
      id: `query-${Date.now()}`,
      query,
      timestamp: new Date(),
      steps: generateWorkflowSteps(query),
      status: 'processing'
    };

    setQueries(prev => [...prev, newQuery]);
    
    toast({
      title: "Query Submitted",
      description: "Processing your geospatial analysis request...",
    });

    console.log('New query submitted:', newQuery);
  }, [toast]);

  const handleEditStep = useCallback((queryId: string, stepId: string, updates: Partial<WorkflowStep>) => {
    setQueries(prev => prev.map(query => {
      if (query.id === queryId) {
        return {
          ...query,
          steps: query.steps.map(step => 
            step.id === stepId ? { ...step, ...updates } : step
          )
        };
      }
      return query;
    }));

    toast({
      title: "Step Updated",
      description: "Workflow step parameters have been modified.",
    });

    console.log('Step edited:', queryId, stepId, updates);
  }, [toast]);

  const handleExecuteStep = useCallback((queryId: string, stepId: string) => {
    setQueries(prev => prev.map(query => {
      if (query.id === queryId) {
        return {
          ...query,
          steps: query.steps.map(step => 
            step.id === stepId ? { ...step, status: 'executing' } : step
          )
        };
      }
      return query;
    }));

    // Simulate step execution
    setTimeout(() => {
      setQueries(prev => prev.map(query => {
        if (query.id === queryId) {
          return {
            ...query,
            steps: query.steps.map(step => 
              step.id === stepId ? { 
                ...step, 
                status: 'completed',
                result: { message: 'Step completed successfully', data: 'sample_output.geojson' }
              } : step
            )
          };
        }
        return query;
      }));

      toast({
        title: "Step Completed",
        description: "Workflow step executed successfully.",
      });
    }, 2000);

    console.log('Executing step:', queryId, stepId);
  }, [toast]);

  const handleExecuteWorkflow = useCallback((queryId: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query) return;

    // Execute all pending steps
    query.steps.forEach(step => {
      if (step.status === 'pending') {
        handleExecuteStep(queryId, step.id);
      }
    });

    // Mark query as completed after a delay
    setTimeout(() => {
      setQueries(prev => prev.map(q => 
        q.id === queryId ? { ...q, status: 'completed' } : q
      ));

      // Add sample result to map
      const sampleLayer: MapLayer = {
        id: `layer-${Date.now()}`,
        name: `Result: ${query.query}`,
        type: query.query.toLowerCase().includes('flood') ? 'flood-risk' : 
              query.query.toLowerCase().includes('green') ? 'green-space' : 'heat-island',
        data: { features: [] }, // In real app, this would contain actual GeoJSON
        visible: true,
        color: query.query.toLowerCase().includes('flood') ? '#dc2626' : 
               query.query.toLowerCase().includes('green') ? '#16a34a' : '#f59e0b'
      };

      setMapLayers(prev => [...prev, sampleLayer]);

      toast({
        title: "Workflow Completed",
        description: "Results have been added to the map.",
      });
    }, 5000);

    console.log('Executing complete workflow:', queryId);
  }, [queries, handleExecuteStep, toast]);

  const handleLayerClick = useCallback((layer: MapLayer, coordinates: [number, number]) => {
    toast({
      title: "Layer Clicked",
      description: `${layer.name} at coordinates: ${coordinates.join(', ')}`,
    });
    console.log('Layer clicked:', layer, coordinates);
  }, [toast]);

  return (
    <div className="h-screen w-full flex bg-gray-100">
      {/* Left Panel - Map (70% width on desktop) */}
      <div className="flex-1 lg:w-[70%] p-2">
        <div className="h-full rounded-lg overflow-hidden shadow-lg">
          <MapView 
            layers={mapLayers}
            onLayerClick={handleLayerClick}
          />
        </div>
      </div>

      {/* Right Panel - Chat (30% width on desktop) */}
      <div className="w-full lg:w-[30%] lg:max-w-md p-2">
        <div className="h-full rounded-lg overflow-hidden shadow-lg bg-white">
          <ChatPanel
            queries={queries}
            onSubmitQuery={handleSubmitQuery}
            onEditStep={handleEditStep}
            onExecuteStep={handleExecuteStep}
            onExecuteWorkflow={handleExecuteWorkflow}
          />
        </div>
      </div>

      {/* Mobile responsive: Stack vertically on small screens */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .h-screen.w-full.flex {
            flex-direction: column;
          }
          .flex-1.lg\\:w-\\[70\\%\\] {
            height: 50vh;
            width: 100%;
          }
          .w-full.lg\\:w-\\[30\\%\\] {
            height: 50vh;
            width: 100%;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
