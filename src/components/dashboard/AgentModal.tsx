import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, X } from 'lucide-react';
import { ManusAPIService } from '@/services/ManusAPIService';
import { useToast } from '@/hooks/use-toast';

interface AgentModalProps {
  agentId: string | null;
  isOpen: boolean;
  onClose: () => void;
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
  category: string;
  fields: AgentField[];
}

const agentConfigs: Record<string, AgentConfig> = {
  'viral-content': {
    title: '5 Viral Content Ideas',
    description: 'Generate trending content ideas tailored to your brand and audience across all major social platforms',
    category: 'CREATE',
    fields: [
      { name: 'name', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'genre', label: 'Genre/Industry', type: 'text', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', required: true, placeholder: 'e.g., 18-34 year olds interested in lifestyle content' },
      { name: 'platforms', label: 'Platforms', type: 'text', placeholder: 'TikTok, Instagram, YouTube' }
    ]
  },
  'corporate-partnerships': {
    title: 'Corporate Partnership Finder',
    description: 'Identify brand partnership opportunities based on audience analysis and market research',
    category: 'CREATE',
    fields: [
      { name: 'name', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'monthlyListeners', label: 'Monthly Listeners/Followers', type: 'number', required: true },
      { name: 'genre', label: 'Genre/Industry', type: 'text', required: true },
      { name: 'demographics', label: 'Demographics', type: 'textarea', placeholder: 'Describe your audience demographics' },
      { name: 'values', label: 'Brand Values', type: 'text', placeholder: 'sustainability, creativity, innovation' }
    ]
  },
  'trend-analysis': {
    title: 'Add Your Spin to Trends',
    description: 'Analyze current trends and create authentic participation strategies for your brand',
    category: 'CONNECT',
    fields: [
      { name: 'name', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'style', label: 'Style/Aesthetic', type: 'text', required: true, placeholder: 'minimalist, bold, vintage, modern' },
      { name: 'brandVoice', label: 'Brand Voice', type: 'text', required: true, placeholder: 'friendly, professional, quirky, inspirational' },
      { name: 'contentHistory', label: 'Previous Content Examples', type: 'textarea', placeholder: 'Describe some of your recent content or campaigns' }
    ]
  },
  'brand-audit': {
    title: 'Brand Audit',
    description: 'Comprehensive multi-platform brand analysis with actionable recommendations',
    category: 'REPORT',
    fields: [
      { name: 'artistName', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'platforms', label: 'Social Media Handles', type: 'textarea', placeholder: 'Instagram: @handle, TikTok: @handle, etc.' },
      { name: 'website', label: 'Website URL', type: 'text', placeholder: 'https://yourwebsite.com' }
    ]
  },
  'content-calendar': {
    title: 'Content Calendar Creator',
    description: 'Strategic monthly content calendar with cross-platform coordination',
    category: 'PLAN',
    fields: [
      { name: 'artist', label: 'Artist/Brand Name', type: 'text', required: true },
      { name: 'platforms', label: 'Platforms', type: 'text', required: true, placeholder: 'Instagram, TikTok, YouTube' },
      { name: 'frequency', label: 'Content Frequency', type: 'text', required: true, placeholder: 'Daily, 3x per week, etc.' },
      { name: 'campaign', label: 'Campaign Focus', type: 'text', placeholder: 'Album launch, brand awareness, engagement' }
    ]
  },
  'competitor-analysis': {
    title: 'Copy Your Top 3 Competitors',
    description: 'Research top competitors and extract actionable tactics for your brand',
    category: 'RESEARCH',
    fields: [
      { name: 'name', label: 'Your Artist/Brand Name', type: 'text', required: true },
      { name: 'genre', label: 'Genre/Industry', type: 'text', required: true },
      { name: 'marketPosition', label: 'Current Market Position', type: 'text', placeholder: 'emerging artist, established brand, etc.' },
      { name: 'competitors', label: 'Known Competitors', type: 'textarea', placeholder: 'List any competitors you already know about' }
    ]
  }
};

export const AgentModal: React.FC<AgentModalProps> = ({ agentId, isOpen, onClose }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const agentConfig = agentId ? agentConfigs[agentId] : null;

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentConfig) return;

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
        mode: 'fast',
        connectors: getAgentConnectors(agentId!)
      });

      toast({
        title: "Task Created Successfully",
        description: `Your ${agentConfig.title} task has been created with ID: ${task.id}`,
      });

      // Reset form and close modal
      setFormData({});
      onClose();

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

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  if (!agentConfig) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {agentConfig.category}
                </Badge>
              </div>
              <DialogTitle className="text-xl">{agentConfig.title}</DialogTitle>
              <DialogDescription className="text-base mt-2">
                {agentConfig.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            {agentConfig.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
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
                    className="resize-none"
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
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
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
      </DialogContent>
    </Dialog>
  );
};

function generateAgentPrompt(agentId: string, data: Record<string, any>): string {
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
      Platforms: ${data.platforms || 'All major platforms'}
      Website: ${data.website || 'Not provided'}
      
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