'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ResourceItem } from './resource-item';

interface Resource {
  id: string;
  title: string;
  type: 'youtube' | 'pdf' | 'notion' | 'link' | 'meet';
  url: string;
}

interface Module {
  id: string;
  title: string;
  resources: Resource[];
}

interface CourseModulesProps {
  courseId: string;
  modules: Module[];
}

export function CourseModules({ courseId, modules }: CourseModulesProps) {
  const [completedResources, setCompletedResources] = useState<string[]>([]);

  // Fetch completed resources on component mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/progress?courseId=${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCompletedResources(data.completedResources || []);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    };

    fetchProgress();
  }, [courseId]);

  const handleResourceToggle = async (resourceId: string) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          resourceId,
        }),
      });

      if (response.ok) {
        setCompletedResources(prev => {
          if (prev.includes(resourceId)) {
            return prev.filter(id => id !== resourceId);
          } else {
            return [...prev, resourceId];
          }
        });
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Course Modules</h2>
      
      <Accordion type="single" collapsible className="w-full">
        {modules.map((module, index) => (
          <AccordionItem key={module.id} value={`module-${module.id}`}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">
                  Module {index + 1}
                </span>
                <span className="font-semibold">{module.title}</span>
                <span className="text-sm text-gray-500">
                  ({module.resources.length} resources)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {module.resources.map((resource) => (
                  <ResourceItem
                    key={resource.id}
                    resource={resource}
                    isCompleted={completedResources.includes(resource.id)}
                    onToggle={() => handleResourceToggle(resource.id)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
