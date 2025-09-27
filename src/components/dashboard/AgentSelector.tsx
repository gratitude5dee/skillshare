import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import { ManusAPIService } from '@/services/ManusAPIService';
import { useToast } from '@/hooks/use-toast';

interface AgentSelectorProps {
  agentId: string | null;
  onBack: () => void;
}

interface AgentField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

interface AgentConfig {
  title: string;
  description: string;
  fields: AgentField[];
}

const agentConfigs: Record<string, AgentConfig> = {
  'viral-content': {
    title: '5 Viral Content Ideas',
    description: 'Generate trending content ideas tailored to your brand and audience',
    fields: [
      { name: 'name', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'genre', label: 'Genre/Industry', type: 'text', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', required: true },
      { name: 'platforms', label: 'Platforms (comma-separated)', type: 'text', placeholder: 'TikTok, Instagram, YouTube' }
    ]
  },
  'corporate-partnerships': {
    title: 'Corporate Partnership Finder',
    description: 'Identify brand partnership opportunities based on audience analysis',
    fields: [
      { name: 'name', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'monthlyListeners', label: 'Monthly Listeners/Followers', type: 'number', required: true },
      { name: 'genre', label: 'Genre/Industry', type: 'text', required: true },
      { name: 'demographics', label: 'Demographics (JSON format)', type: 'textarea', placeholder: '{"age": "18-34", "location": "US"}' },
      { name: 'values', label: 'Brand Values (comma-separated)', type: 'text' }
    ]
  },
  'trend-analysis': {
    title: 'Add Your Spin to Trends',
    description: 'Analyze current trends and create authentic participation strategies',
    fields: [
      { name: 'name', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'style', label: 'Style/Aesthetic', type: 'text', required: true },
      { name: 'brandVoice', label: 'Brand Voice', type: 'text', required: true },
      { name: 'contentHistory', label: 'Previous Content Examples', type: 'textarea' }
    ]
  },
  'brand-audit': {
    title: 'Brand Audit',
    description: 'Comprehensive multi-platform brand analysis and recommendations',
    fields: [
      { name: 'artistName', label: 'Artist/Brand Name', type: 'text', required: true }
    ]
  }
  // Add more agent configurations as needed
};

export const AgentSelector: React.FC<AgentSelectorProps> = ({ agentId, onBack }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const agentConfig = agentId ? agentConfigs[agentId as keyof typeof agentConfigs] : null;

  if (!agentConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Agent Not Found</h3>
            <p className="text-muted-foreground mb-4">The selected agent configuration is not available.</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const requiredFields = agentConfig.fields.filter(field => field.required);
      for (const field of requiredFields) {
        if (!formData[field.name]) {
          toast({
            title: "Validation Error",
            description: `${field.label} is required`,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Create task with agent-specific prompt
      const prompt = generateAgentPrompt(agentId!, formData);
      const task = await ManusAPIService.createTask(prompt, {
        mode: 'speed',
        connectors: getAgentConnectors(agentId!)
      });

      toast({
        title: "Task Created",
        description: `Your ${agentConfig.title} task has been created with ID: ${task.id}`,
      });

      // Reset form
      setFormData({});
      onBack();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{agentConfig.title}</h2>
            <p className="text-sm text-muted-foreground">{agentConfig.description}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Configure Agent Parameters</CardTitle>
            <CardDescription>
              Fill in the required information to customize this agent for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {agentConfig.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Task...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Agent
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function generateAgentPrompt(agentId: string, data: Record<string, any>): string {
  // This would contain the actual prompts from your agent templates
  const prompts = {
    'viral-content': `
      Analyze current viral trends across TikTok, Instagram Reels, YouTube Shorts, and Twitter/X.
      
      Artist Information:
      - Name: ${data.name}
      - Genre: ${data.genre}
      - Target Audience: ${data.targetAudience}
      - Current Platforms: ${data.platforms || 'All major platforms'}
      
      Task Requirements:
      1. Identify top 5 trending formats/challenges in the last 7 days
      2. Create 5 unique content ideas that authentically incorporate these trends
      3. For each idea, provide:
         - Content concept (30-second pitch)
         - Platform-specific strategy (which platform first, adaptation for others)
         - Viral potential score (1-10) with reasoning
         - Production requirements (minimal, moderate, high)
         - Optimal posting time based on trend lifecycle
         - Hook strategy for first 3 seconds
         - Expected engagement metrics
      
      Format output as actionable content briefs ready for production.
    `,
    'corporate-partnerships': `
      Analyze artist audience and identify corporate brand partnership opportunities.
      
      Artist Data:
      - Name: ${data.name}
      - Monthly Listeners: ${data.monthlyListeners}
      - Demographics: ${data.demographics}
      - Genre: ${data.genre}
      - Values/Themes: ${data.values || 'Not specified'}
      
      Analysis Requirements:
      1. Identify top 10 brands with audience overlap
      2. For each brand:
         - Compatibility score (1-100)
         - Estimated partnership value ($)
         - Previous artist partnerships analysis
         - Campaign concept (3 options)
         - Contact approach strategy
         - Risk assessment
      3. Rank by revenue potential
      4. Create pitch deck outline for top 3 brands
      5. Generate email templates for initial outreach
      
      Include data sources and market research backing recommendations.
    `,
    'brand-audit': `
      Conduct comprehensive multi-platform artist brand audit.
      
      Artist: ${data.artistName}
      
      Audit Components:
      1. Visual Identity Analysis
      2. Messaging Audit
      3. Platform Performance
      4. Competitive Analysis
      5. Fan Perception
      6. Recommendations
      
      Format as executive summary with visual dashboard.
    `
  };

  return prompts[agentId as keyof typeof prompts] || `Please help with: ${agentId}`;
}

function getAgentConnectors(agentId: string): string[] {
  const connectors = {
    'viral-content': ['Firecrawl'],
    'corporate-partnerships': ['Polygon', 'Firecrawl'],
    'brand-audit': ['Firecrawl', 'HuggingFace']
  };

  return connectors[agentId as keyof typeof connectors] || [];
}