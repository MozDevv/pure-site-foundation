import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/lib/innovation-hub-data';

interface InnovationContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  toggleUserRole: () => void;
}

function getUserFromStorage(): User {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id || 1,
        name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User',
        email: parsed.email || '',
        role: parsed.role || 'Student',
      };
    }
  } catch {}
  return { id: 1, name: 'User', email: '', role: 'Student' };
}

const InnovationContext = createContext<InnovationContextType | undefined>(undefined);

export function InnovationProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(getUserFromStorage);

  const toggleUserRole = () => {
    setCurrentUser(prev => prev.role === 'Student'
      ? { ...prev, role: 'Admin' as const }
      : { ...prev, role: 'Student' as const }
    );
  };

  return (
    <InnovationContext.Provider value={{ currentUser, setCurrentUser, toggleUserRole }}>
      {children}
    </InnovationContext.Provider>
  );
}

export function useInnovation() {
  const context = useContext(InnovationContext);
  if (!context) {
    throw new Error('useInnovation must be used within InnovationProvider');
  }
  return context;
}
