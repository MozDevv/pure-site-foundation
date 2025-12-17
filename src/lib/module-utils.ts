// Course Module Types and Utilities

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  contentMarkdown: string;
  contentUrl: string;
  durationInMinutes: number;
  orderIndex: number;
  parentId: string | null;
  subModules: CourseModule[];
}

export interface ModuleFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// Find a module by ID in the tree
export function findModuleById(
  modules: CourseModule[],
  id: string
): CourseModule | null {
  for (const module of modules) {
    if (module.id === id) return module;
    if (module.subModules?.length) {
      const found = findModuleById(module.subModules, id);
      if (found) return found;
    }
  }
  return null;
}

// Get breadcrumb path for a module
export function getModuleBreadcrumbs(
  modules: CourseModule[],
  targetId: string,
  path: CourseModule[] = []
): CourseModule[] {
  for (const module of modules) {
    if (module.id === targetId) {
      return [...path, module];
    }
    if (module.subModules?.length) {
      const found = getModuleBreadcrumbs(module.subModules, targetId, [
        ...path,
        module,
      ]);
      if (found.length > 0) return found;
    }
  }
  return [];
}

// Update a module in the tree (immutable)
export function updateModuleInTree(
  modules: CourseModule[],
  updatedModule: CourseModule
): CourseModule[] {
  return modules.map((module) => {
    if (module.id === updatedModule.id) {
      return { ...updatedModule, subModules: module.subModules };
    }
    if (module.subModules?.length) {
      return {
        ...module,
        subModules: updateModuleInTree(module.subModules, updatedModule),
      };
    }
    return module;
  });
}

// Remove a module from the tree
export function removeModuleFromTree(
  modules: CourseModule[],
  moduleId: string
): CourseModule[] {
  return modules
    .filter((m) => m.id !== moduleId)
    .map((module) => ({
      ...module,
      subModules: module.subModules?.length
        ? removeModuleFromTree(module.subModules, moduleId)
        : [],
    }));
}

// Add a child module
export function addChildModule(
  modules: CourseModule[],
  parentId: string,
  newModule: CourseModule
): CourseModule[] {
  return modules.map((module) => {
    if (module.id === parentId) {
      return {
        ...module,
        subModules: [...(module.subModules || []), newModule],
      };
    }
    if (module.subModules?.length) {
      return {
        ...module,
        subModules: addChildModule(module.subModules, parentId, newModule),
      };
    }
    return module;
  });
}

// Reorder siblings
export function reorderSiblings(
  modules: CourseModule[],
  parentId: string | null,
  fromIndex: number,
  toIndex: number
): CourseModule[] {
  if (parentId === null) {
    const newModules = [...modules];
    const [moved] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, moved);
    return newModules.map((m, i) => ({ ...m, orderIndex: i }));
  }

  return modules.map((module) => {
    if (module.id === parentId) {
      const newChildren = [...(module.subModules || [])];
      const [moved] = newChildren.splice(fromIndex, 1);
      newChildren.splice(toIndex, 0, moved);
      return {
        ...module,
        subModules: newChildren.map((m, i) => ({ ...m, orderIndex: i })),
      };
    }
    if (module.subModules?.length) {
      return {
        ...module,
        subModules: reorderSiblings(module.subModules, parentId, fromIndex, toIndex),
      };
    }
    return module;
  });
}

// Get depth level name
export function getDepthLabel(depth: number): string {
  const labels = ['Module', 'Topic', 'Unit', 'Lesson', 'Section', 'Item'];
  return labels[depth] || `Level ${depth + 1}`;
}

// Count total modules
export function countModules(modules: CourseModule[]): number {
  return modules.reduce((count, module) => {
    return count + 1 + (module.subModules?.length ? countModules(module.subModules) : 0);
  }, 0);
}

// Format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Generate UUID
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Mock data for demo
export const mockModules: CourseModule[] = [
  {
    id: 'mod-1',
    title: 'Getting Started with Web Development',
    description: 'Introduction to modern web development concepts',
    contentMarkdown: '## Welcome to Web Development\n\nIn this module, you will learn the fundamentals of building modern web applications.\n\n### What You Will Learn\n- HTML5 and semantic markup\n- CSS3 and responsive design\n- JavaScript ES6+ features',
    contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationInMinutes: 45,
    orderIndex: 0,
    parentId: null,
    subModules: [
      {
        id: 'top-1-1',
        title: 'HTML Fundamentals',
        description: 'Learn the building blocks of web pages',
        contentMarkdown: '## HTML Basics\n\nHTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.',
        contentUrl: '',
        durationInMinutes: 20,
        orderIndex: 0,
        parentId: 'mod-1',
        subModules: [
          {
            id: 'unit-1-1-1',
            title: 'Document Structure',
            description: 'Understanding HTML document structure',
            contentMarkdown: '## Document Structure\n\nEvery HTML document follows a basic structure:\n\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>Page Title</title>\n  </head>\n  <body>\n    Content goes here\n  </body>\n</html>\n```',
            contentUrl: '',
            durationInMinutes: 10,
            orderIndex: 0,
            parentId: 'top-1-1',
            subModules: [],
          },
          {
            id: 'unit-1-1-2',
            title: 'Semantic Elements',
            description: 'Using semantic HTML elements',
            contentMarkdown: '## Semantic HTML\n\nSemantic elements clearly describe their meaning:\n\n- `<header>` - Page header\n- `<nav>` - Navigation\n- `<main>` - Main content\n- `<article>` - Self-contained content\n- `<footer>` - Page footer',
            contentUrl: '',
            durationInMinutes: 10,
            orderIndex: 1,
            parentId: 'top-1-1',
            subModules: [],
          },
        ],
      },
      {
        id: 'top-1-2',
        title: 'CSS Styling',
        description: 'Master CSS for beautiful designs',
        contentMarkdown: '## CSS Overview\n\nCSS (Cascading Style Sheets) is used to style HTML elements.',
        contentUrl: '',
        durationInMinutes: 25,
        orderIndex: 1,
        parentId: 'mod-1',
        subModules: [],
      },
    ],
  },
  {
    id: 'mod-2',
    title: 'JavaScript Essentials',
    description: 'Core JavaScript programming concepts',
    contentMarkdown: '## JavaScript Fundamentals\n\nJavaScript is the programming language of the web.',
    contentUrl: '',
    durationInMinutes: 60,
    orderIndex: 1,
    parentId: null,
    subModules: [
      {
        id: 'top-2-1',
        title: 'Variables and Data Types',
        description: 'Understanding JavaScript data types',
        contentMarkdown: '## Variables\n\nJavaScript has three ways to declare variables:\n\n```javascript\nconst name = "John"; // constant\nlet age = 25; // block-scoped\nvar legacy = true; // function-scoped (avoid)\n```',
        contentUrl: '',
        durationInMinutes: 30,
        orderIndex: 0,
        parentId: 'mod-2',
        subModules: [],
      },
    ],
  },
];
