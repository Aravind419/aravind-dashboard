
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubjectSelectorProps {
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  subjects: { id: string; name: string; color: string }[];
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubject,
  setSelectedSubject,
  subjects,
}) => {
  return (
    <div className="w-full mb-4">
      <Select 
        value={selectedSubject} 
        onValueChange={setSelectedSubject}
      >
        <SelectTrigger className="w-full max-w-xs mx-auto">
          <SelectValue placeholder="Select Subject" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map(subject => (
            <SelectItem key={subject.id} value={subject.id}>
              <div className="flex items-center">
                <span 
                  className="mr-2 inline-block w-2 h-2 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                />
                {subject.name}
              </div>
            </SelectItem>
          ))}
          {subjects.length === 0 && (
            <SelectItem value="general">General</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SubjectSelector;
