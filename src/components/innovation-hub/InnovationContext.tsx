import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/lib/innovation-hub-data';

interface InnovationContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  toggleUserRole: () => void;
}

const defaultStudent: User = {
  id: 1,
  name: "Alex Chen",
  email: "alex@student.com",
  role: "Student"
};

const defaultAdmin: User = {
  id: 99,
  name: "Dr. Maria Garcia",
  email: "maria@admin.com",
  role: "Admin"
};

const InnovationContext = createContext<InnovationContextType | undefined>(undefined);

export function InnovationProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultStudent);

  const toggleUserRole = () => {
    setCurrentUser(prev => prev.role === "Student" ? defaultAdmin : defaultStudent);
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
