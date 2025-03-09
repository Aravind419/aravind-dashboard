
import { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Edit2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import useLocalStorage from '@/hooks/useLocalStorage';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const Notes = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('study-notes', []);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Select the first note if none is selected
    if (notes.length > 0 && !currentNote) {
      setCurrentNote(notes[0]);
    }
  }, [notes, currentNote]);
  
  const createNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote);
    setIsEditing(true);
  };
  
  const updateNote = (updates: Partial<Note>) => {
    if (!currentNote) return;
    
    const updatedNote = {
      ...currentNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    setNotes(notes.map(note => 
      note.id === currentNote.id ? updatedNote : note
    ));
    
    setCurrentNote(updatedNote);
  };
  
  const deleteNote = (id: string) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    setNotes(filteredNotes);
    
    if (currentNote?.id === id) {
      setCurrentNote(filteredNotes.length > 0 ? filteredNotes[0] : null);
    }
    
    setIsEditing(false);
  };
  
  // Filter notes by search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <BookOpen className="h-5 w-5" />
        <span>Notes</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={createNewNote}
              title="Create new note"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? (
                  <p>No matching notes found.</p>
                ) : (
                  <>
                    <p>No notes yet.</p>
                    <Button 
                      variant="link" 
                      onClick={createNewNote}
                      className="mt-2"
                    >
                      Create your first note
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredNotes.map(note => (
                  <li 
                    key={note.id}
                    className={`rounded-lg p-3 cursor-pointer transition-colors ${
                      currentNote?.id === note.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    }`}
                    onClick={() => {
                      setCurrentNote(note);
                      setIsEditing(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{note.title}</h3>
                      {currentNote?.id === note.id && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-7 w-7 rounded-full ${
                              currentNote?.id === note.id ? 'hover:bg-primary-foreground/10' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm truncate">
                      {note.content.substring(0, 50)}
                      {note.content.length > 50 ? '...' : ''}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-secondary/50 rounded-xl p-4 flex flex-col">
          {currentNote ? (
            <>
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <Input
                    value={currentNote.title}
                    onChange={(e) => updateNote({ title: e.target.value })}
                    className="font-medium text-lg"
                    placeholder="Note title"
                  />
                ) : (
                  <h3 className="font-medium text-lg">{currentNote.title}</h3>
                )}
                
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {isEditing ? (
                <Textarea 
                  value={currentNote.content}
                  onChange={(e) => updateNote({ content: e.target.value })}
                  className="flex-1 min-h-[240px] resize-none"
                  placeholder="Write your notes here..."
                />
              ) : (
                <div className="flex-1 overflow-y-auto whitespace-pre-line">
                  {currentNote.content || (
                    <p className="text-muted-foreground">This note is empty. Click the edit button to add content.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No note selected.</p>
                <Button 
                  variant="link" 
                  onClick={createNewNote}
                  className="mt-2"
                >
                  Create a new note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
