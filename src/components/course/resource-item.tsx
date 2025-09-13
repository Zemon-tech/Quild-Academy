'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Youtube, 
  FileText, 
  ExternalLink, 
  Video, 
  CheckCircle2
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'youtube' | 'pdf' | 'notion' | 'link' | 'meet';
  url: string;
}

interface ResourceItemProps {
  resource: Resource;
  isCompleted: boolean;
  onToggle: () => void;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'youtube':
      return <Youtube className="h-5 w-5 text-red-500" />;
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-600" />;
    case 'notion':
      return <ExternalLink className="h-5 w-5 text-gray-600" />;
    case 'meet':
      return <Video className="h-5 w-5 text-blue-500" />;
    default:
      return <ExternalLink className="h-5 w-5 text-gray-600" />;
  }
};

export function ResourceItem({ resource, isCompleted, onToggle }: ResourceItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
      />
      
      <div className="flex-1 flex items-center space-x-3">
        {getResourceIcon(resource.type)}
        <span className={`flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {resource.title}
        </span>
        {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        asChild
        className="shrink-0"
      >
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1"
        >
          <span>Open</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}
