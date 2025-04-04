import React, { useState } from 'react';
import { HelpCircle, BookOpen, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export const HelpButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-zinc-400 hover:bg-blue-600/10 hover:text-blue-500 interactive-item"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              Help & Resources
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Access guides, documentation and knowledge base articles
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          <Tabs defaultValue="guides" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border-zinc-700">
              <TabsTrigger value="guides" className="data-[state=active]:bg-blue-600">
                <BookOpen className="mr-2 h-4 w-4" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="data-[state=active]:bg-blue-600">
                <FileText className="mr-2 h-4 w-4" />
                Knowledge Base
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="guides" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="flex flex-col gap-4">
                  {guides.map((guide, index) => (
                    <GuideItem key={index} {...guide} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="knowledge" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="flex flex-col gap-4">
                  {knowledgeBase.map((article, index) => (
                    <KnowledgeItem key={index} {...article} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface GuideProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const GuideItem = ({ title, description, icon }: GuideProps) => {
  return (
    <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800/90 hover:border-blue-600/40 interactive-item">
      <div className="flex gap-3">
        <div className="mt-1 p-2 bg-blue-600/20 rounded-md text-blue-400">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

interface KnowledgeProps {
  title: string;
  category: string;
  updated: string;
}

const KnowledgeItem = ({ title, category, updated }: KnowledgeProps) => {
  return (
    <div className="p-4 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 hover:border-blue-600/40 interactive-item">
      <h3 className="font-medium text-white">{title}</h3>
      <div className="flex justify-between mt-2">
        <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-400">{category}</span>
        <span className="text-xs text-zinc-500">Updated: {updated}</span>
      </div>
    </div>
  );
};

// Sample data
const guides = [
  {
    title: "Getting Started with Security Platform",
    description: "Learn the basics of our security platform and how to set up your first vehicle.",
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    title: "AI Detection Configuration",
    description: "Configure AI detection parameters for optimal threat recognition.",
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    title: "User Management Guide",
    description: "Learn how to add, remove, and manage user permissions in the system.",
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    title: "Alert Response Protocol",
    description: "Standard operating procedures for responding to different alert types.",
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    title: "Vehicle Assignment",
    description: "How to assign vehicles to drivers and manage fleet operations.",
    icon: <BookOpen className="h-4 w-4" />
  }
];

const knowledgeBase = [
  {
    title: "Troubleshooting Camera Connection Issues",
    category: "Technical",
    updated: "3 days ago"
  },
  {
    title: "Understanding Risk Scoring Algorithm",
    category: "Security",
    updated: "1 week ago"
  },
  {
    title: "Voice Analysis Calibration",
    category: "Technical",
    updated: "2 weeks ago"
  },
  {
    title: "Best Practices for Route Planning in High-Risk Areas",
    category: "Operations",
    updated: "1 month ago"
  },
  {
    title: "Industry Standards for Cash Transport Security",
    category: "Compliance",
    updated: "1 month ago"
  },
  {
    title: "Integrating Third-Party Security Systems",
    category: "Technical",
    updated: "2 months ago"
  }
];