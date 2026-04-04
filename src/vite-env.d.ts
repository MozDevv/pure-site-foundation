/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
        renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        prompt: () => void;
      };
    };
  };
}
