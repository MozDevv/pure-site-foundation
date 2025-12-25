// Store for team management - stub implementation
import { create } from 'zustand';

interface IncompleteTeamIdStore {
  incompleteTeamId: string | null;
  setIncompleteTeamId: (id: string | null) => void;
}

export const useIncompleteTeamIdStore = create<IncompleteTeamIdStore>((set) => ({
  incompleteTeamId: null,
  setIncompleteTeamId: (id) => set({ incompleteTeamId: id }),
}));

interface SelectedTeamStore {
  selectedTeamId: string | null;
  setSelectedTeam: (id: string | null) => void;
}

export const useSelectedTeamStore = create<SelectedTeamStore>((set) => ({
  selectedTeamId: null,
  setSelectedTeam: (id) => set({ selectedTeamId: id }),
}));

interface TeamResourceStore {
  selectedTeam: string | null;
  resourceType: string | null;
  resources: any[];
  setSelectedTeam: (id: string | null) => void;
  setResourceType: (type: string | null) => void;
  setResources: (resources: any[]) => void;
}

export const useTeamResourceStore = create<TeamResourceStore>((set) => ({
  selectedTeam: null,
  resourceType: null,
  resources: [],
  setSelectedTeam: (id) => set({ selectedTeam: id }),
  setResourceType: (type) => set({ resourceType: type }),
  setResources: (resources) => set({ resources }),
}));
