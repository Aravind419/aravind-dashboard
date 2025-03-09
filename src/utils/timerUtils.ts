
/**
 * Formats seconds into HH:MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  return [
    h > 0 ? h.toString().padStart(2, '0') : '00',
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Saves a study session to the provided study sessions array
 */
export interface StudySession {
  id: string;
  subject: string;
  date: string;
  duration: number;
}

export const createStudySession = (
  duration: number,
  selectedSubject: string,
  subjects: { id: string; name: string; color: string }[]
): StudySession | null => {
  if (duration <= 0) return null;
  
  const today = new Date().toISOString().split('T')[0];
  const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'General';
  
  // Create new study session entry
  return {
    id: crypto.randomUUID(),
    subject: subjectName,
    date: today,
    duration: duration
  };
};
