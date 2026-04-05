import {
  useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense,
  forwardRef,
} from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService, endpoints, API_BASE_URL } from '@/lib/api';
import { Client, IMessage } from '@stomp/stompjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Play, Loader2, RotateCcw, Clock, Cpu, Upload, Download, Share2, Users, Copy,
  Check, LogOut, Plus, X, FileCode, Maximize2, Terminal, Eye,
  AlertCircle, CheckCircle2, XCircle, Trash2, Info, Code2, Globe,
  ChevronDown, GripVertical, ExternalLink, RefreshCw, Monitor, Tablet,
  Smartphone, TestTube, BookOpen, Wand2, Keyboard, History, Moon, Sun,
  ChevronRight, LayoutPanelLeft, LayoutPanelTop, Square, Sparkles,
  FlaskConical, Braces, Settings2,
} from 'lucide-react';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })));

// ── Language catalogue ──────────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'python',       label: 'Python',         monaco: 'python',     ext: '.py',    color: '#3776AB', bg: '#1a2d4a', badge: 'Py',   preview: false },
  { value: 'javascript',   label: 'JavaScript',     monaco: 'javascript', ext: '.js',    color: '#F7DF1E', bg: '#2d2a00', badge: 'JS',   preview: false },
  { value: 'browser-js',   label: 'Browser JS',     monaco: 'javascript', ext: '.js',    color: '#F7DF1E', bg: '#2d2a00', badge: 'bJS',  preview: true  },
  { value: 'typescript',   label: 'TypeScript',     monaco: 'typescript', ext: '.ts',    color: '#3178C6', bg: '#0d2a47', badge: 'TS',   preview: false },
  { value: 'java',         label: 'Java',           monaco: 'java',       ext: '.java',  color: '#ED8B00', bg: '#2d1f00', badge: 'Jv',   preview: false },
  { value: 'c',            label: 'C',              monaco: 'c',          ext: '.c',     color: '#A8B9CC', bg: '#1a2230', badge: 'C',    preview: false },
  { value: 'cpp',          label: 'C++',            monaco: 'cpp',        ext: '.cpp',   color: '#00599C', bg: '#001d33', badge: 'C++',  preview: false },
  { value: 'csharp',       label: 'C#',             monaco: 'csharp',     ext: '.cs',    color: '#68217A', bg: '#1f0a24', badge: 'C#',   preview: false },
  { value: 'go',           label: 'Go',             monaco: 'go',         ext: '.go',    color: '#00ADD8', bg: '#002d3b', badge: 'Go',   preview: false },
  { value: 'rust',         label: 'Rust',           monaco: 'rust',       ext: '.rs',    color: '#DEA584', bg: '#2d1e14', badge: 'Rs',   preview: false },
  { value: 'ruby',         label: 'Ruby',           monaco: 'ruby',       ext: '.rb',    color: '#CC342D', bg: '#2d0a09', badge: 'Rb',   preview: false },
  { value: 'php',          label: 'PHP',            monaco: 'php',        ext: '.php',   color: '#8892BF', bg: '#1a1c2d', badge: 'PHP',  preview: false },
  { value: 'kotlin',       label: 'Kotlin',         monaco: 'kotlin',     ext: '.kt',    color: '#7F52FF', bg: '#1a0f3d', badge: 'Kt',   preview: false },
  { value: 'swift',        label: 'Swift',          monaco: 'swift',      ext: '.swift', color: '#F05138', bg: '#2d1009', badge: 'Sw',   preview: false },
  { value: 'scala',        label: 'Scala',          monaco: 'scala',      ext: '.scala', color: '#DC322F', bg: '#2d0909', badge: 'Sc',   preview: false },
  { value: 'r',            label: 'R',              monaco: 'r',          ext: '.r',     color: '#276DC3', bg: '#0a1d36', badge: 'R',    preview: false },
  { value: 'lua',          label: 'Lua',            monaco: 'lua',        ext: '.lua',   color: '#2C2D72', bg: '#0d0d1e', badge: 'Lua',  preview: false },
  { value: 'perl',         label: 'Perl',           monaco: 'perl',       ext: '.pl',    color: '#39457E', bg: '#0d1124', badge: 'Pl',   preview: false },
  { value: 'haskell',      label: 'Haskell',        monaco: 'haskell',    ext: '.hs',    color: '#9B59B6', bg: '#1e0d2d', badge: 'Hs',   preview: false },
  { value: 'sql',          label: 'SQL',            monaco: 'sql',        ext: '.sql',   color: '#e38c00', bg: '#2d1e00', badge: 'SQL',  preview: false },
  { value: 'bash',         label: 'Bash / Shell',   monaco: 'shell',      ext: '.sh',    color: '#4EAA25', bg: '#0d2409', badge: '$>',   preview: false },
  { value: 'html',         label: 'HTML',           monaco: 'html',       ext: '.html',  color: '#E34F26', bg: '#2d1009', badge: 'HTML', preview: true  },
  { value: 'css',          label: 'CSS',            monaco: 'css',        ext: '.css',   color: '#1572B6', bg: '#0a1d2d', badge: 'CSS',  preview: true  },
  { value: 'react',        label: 'React / JSX',    monaco: 'javascript', ext: '.jsx',   color: '#61DAFB', bg: '#0a2530', badge: 'JSX',  preview: true  },
] as const;

type LangValue = typeof LANGUAGES[number]['value'];
const LANG_MAP = Object.fromEntries(LANGUAGES.map(l => [l.value, l])) as Record<LangValue, typeof LANGUAGES[number]>;

const EXT_TO_LANG: Record<string, string> = {
  '.py': 'python', '.pyw': 'python',
  '.js': 'javascript', '.mjs': 'javascript',
  '.ts': 'typescript', '.tsx': 'react',
  '.jsx': 'react',
  '.java': 'java',
  '.c': 'c', '.h': 'c',
  '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.hpp': 'cpp',
  '.cs': 'csharp',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.kt': 'kotlin', '.kts': 'kotlin',
  '.swift': 'swift',
  '.scala': 'scala',
  '.r': 'r',
  '.lua': 'lua',
  '.pl': 'perl',
  '.hs': 'haskell',
  '.sql': 'sql',
  '.sh': 'bash', '.bash': 'bash',
  '.html': 'html', '.htm': 'html',
  '.css': 'css',
};

// ── Default starter code ────────────────────────────────────────────────────
const DEFAULT_CODE: Record<string, string> = {
  python: [
    '# Python Playground',
    '# Tip: use the Stdin panel below to pre-fill any input() calls',
    '',
    'name = input("Enter your name: ")',
    'print(f"Hello, {name}!")',
    '',
    'squares = [x**2 for x in range(1, 6)]',
    'print("Squares:", squares)',
    '',
  ].join('\n'),
  javascript: [
    '// JavaScript Playground (Node.js)',
    'console.log("Hello, World!");',
    '',
    'const squares = Array.from({length: 5}, (_, i) => (i+1) ** 2);',
    'console.log("Squares:", squares.join(", "));',
    '',
  ].join('\n'),
  'browser-js': [
    '// Browser JavaScript — runs in a sandboxed iframe',
    '// console.log, alert, DOM manipulation all work here',
    '',
    'document.body.style.background = "#0d1117";',
    'document.body.style.color = "#e6edf3";',
    'document.body.style.fontFamily = "monospace";',
    '',
    'const h1 = document.createElement("h1");',
    'h1.textContent = "Hello from Browser JS! 🚀";',
    'document.body.appendChild(h1);',
    '',
    'console.log("This appears in the Console tab →");',
    'console.warn("I am a warning");',
    '',
  ].join('\n'),
  typescript: [
    '// TypeScript Playground',
    'const message: string = "Hello, World!";',
    'console.log(message);',
    '',
    'function factorial(n: number): number {',
    '  return n <= 1 ? 1 : n * factorial(n - 1);',
    '}',
    'console.log("5! =", factorial(5));',
    '',
  ].join('\n'),
  java: [
    'import java.util.Scanner;',
    '',
    'public class Main {',
    '    public static void main(String[] args) {',
    '        Scanner sc = new Scanner(System.in);',
    '        System.out.print("Enter your name: ");',
    '        String name = sc.nextLine();',
    '        System.out.println("Hello, " + name + "!");',
    '    }',
    '}',
    '',
  ].join('\n'),
  c: [
    '#include <stdio.h>',
    '#include <string.h>',
    '',
    'int main() {',
    '    char name[100];',
    '    printf("Enter your name: ");',
    '    fgets(name, sizeof(name), stdin);',
    '    name[strcspn(name, "\\n")] = 0;',
    '    printf("Hello, %s!\\n", name);',
    '    return 0;',
    '}',
    '',
  ].join('\n'),
  cpp: [
    '#include <iostream>',
    '#include <string>',
    'using namespace std;',
    '',
    'int main() {',
    '    string name;',
    '    cout << "Enter your name: ";',
    '    getline(cin, name);',
    '    cout << "Hello, " << name << "!" << endl;',
    '    return 0;',
    '}',
    '',
  ].join('\n'),
  csharp: [
    'using System;',
    '',
    'class Program {',
    '    static void Main() {',
    '        Console.Write("Enter your name: ");',
    '        string name = Console.ReadLine();',
    '        Console.WriteLine($"Hello, {name}!");',
    '    }',
    '}',
    '',
  ].join('\n'),
  go: [
    'package main',
    '',
    'import (',
    '    "bufio"',
    '    "fmt"',
    '    "os"',
    '    "strings"',
    ')',
    '',
    'func main() {',
    '    reader := bufio.NewReader(os.Stdin)',
    '    fmt.Print("Enter your name: ")',
    '    name, _ := reader.ReadString(\'\\n\')',
    '    name = strings.TrimSpace(name)',
    '    fmt.Printf("Hello, %s!\\n", name)',
    '}',
    '',
  ].join('\n'),
  rust: [
    'use std::io::{self, BufRead, Write};',
    '',
    'fn main() {',
    '    print!("Enter your name: ");',
    '    io::stdout().flush().unwrap();',
    '    let stdin = io::stdin();',
    '    let name = stdin.lock().lines().next().unwrap().unwrap();',
    '    println!("Hello, {}!", name);',
    '}',
    '',
  ].join('\n'),
  ruby: [
    '# Ruby Playground',
    'print "Enter your name: "',
    'name = gets.chomp',
    'puts "Hello, #{name}!"',
    '',
  ].join('\n'),
  php: [
    '<?php',
    '$name = trim(fgets(STDIN));',
    'echo "Hello, $name!\\n";',
    '',
  ].join('\n'),
  kotlin: [
    'fun main() {',
    '    print("Enter your name: ")',
    '    val name = readLine() ?: "World"',
    '    println("Hello, $name!")',
    '}',
    '',
  ].join('\n'),
  swift: [
    'import Foundation',
    '',
    'print("Enter your name: ", terminator: "")',
    'if let name = readLine() {',
    '    print("Hello, \\(name)!")',
    '}',
    '',
  ].join('\n'),
  scala: [
    'import scala.io.StdIn',
    '',
    'object Main extends App {',
    '  print("Enter your name: ")',
    '  val name = StdIn.readLine()',
    '  println(s"Hello, $name!")',
    '}',
    '',
  ].join('\n'),
  r: [
    '# R Playground',
    'cat("Hello, World!\\n")',
    'squares <- (1:5)^2',
    'cat("Squares:", squares, "\\n")',
    '',
  ].join('\n'),
  lua: [
    '-- Lua Playground',
    'io.write("Enter your name: ")',
    'local name = io.read()',
    'print("Hello, " .. name .. "!")',
    '',
  ].join('\n'),
  perl: [
    '#!/usr/bin/perl',
    'use strict;',
    'use warnings;',
    '',
    'print "Enter your name: ";',
    'my $name = <STDIN>;',
    'chomp $name;',
    'print "Hello, $name!\\n";',
    '',
  ].join('\n'),
  haskell: [
    '-- Haskell Playground',
    'main :: IO ()',
    'main = do',
    '  putStr "Enter your name: "',
    '  name <- getLine',
    '  putStrLn ("Hello, " ++ name ++ "!")',
    '',
  ].join('\n'),
  sql: [
    '-- SQL Playground (SQLite)',
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);',
    'INSERT INTO users (name, age) VALUES ("Alice", 30), ("Bob", 25), ("Carol", 35);',
    'SELECT name, age FROM users WHERE age > 24 ORDER BY age ASC;',
    '',
  ].join('\n'),
  bash: [
    '#!/bin/bash',
    'echo "Enter your name:"',
    'read name',
    'echo "Hello, $name!"',
    'echo "Today: $(date)"',
    '',
  ].join('\n'),
  html: [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <title>HTML Playground</title>',
    '  <style>',
    '    body { font-family: sans-serif; background: #0d1117; color: #e6edf3; padding: 2rem; }',
    '    h1   { color: #58a6ff; }',
    '    button { background: #7c3aed; color: white; border: none; padding: .5rem 1.2rem; border-radius: 6px; cursor: pointer; }',
    '    button:hover { background: #6d28d9; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <h1>Hello from HTML Playground! 🚀</h1>',
    '  <p>Edit · save · preview instantly.</p>',
    '  <button onclick="this.textContent=\'Clicked! ✓\'">Click me</button>',
    '</body>',
    '</html>',
    '',
  ].join('\n'),
  css: [
    '/* CSS Playground — preview shows these styles on a sample page */',
    'body {',
    '  font-family: "Segoe UI", sans-serif;',
    '  background: linear-gradient(135deg, #0d1117, #161b22);',
    '  color: #e6edf3;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  justify-content: center;',
    '  min-height: 100vh;',
    '  margin: 0;',
    '}',
    '.card {',
    '  background: #21262d;',
    '  border: 1px solid #30363d;',
    '  border-radius: 12px;',
    '  padding: 2rem 3rem;',
    '  text-align: center;',
    '  box-shadow: 0 8px 32px rgba(0,0,0,.4);',
    '}',
    'h1 { color: #58a6ff; margin: 0 0 .5rem; }',
    'p  { color: #8b949e; margin: 0; }',
    '',
  ].join('\n'),
  react: [
    '// React / JSX Playground', 
    '// Uses Babel Standalone + React 18 CDN — no server needed',
    '',
    'const { useState } = React;',
    '',
    'function Counter() {',
    '  const [count, setCount] = useState(0);',
    '  return (',
    '    <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: "2rem",',
    '                  background: "#0d1117", color: "#e6edf3", minHeight: "100vh" }}>',
    '      <h1 style={{ color: "#58a6ff" }}>React Counter ⚛️</h1>',
    '      <p style={{ fontSize: "3rem", margin: "1rem 0" }}>{count}</p>',
    '      <button',
    '        onClick={() => setCount(c => c + 1)}',
    '        style={{ background: "#7c3aed", color: "white", border: "none",',
    '                 padding: ".6rem 1.5rem", borderRadius: "8px", cursor: "pointer",',
    '                 fontSize: "1rem", marginRight: ".5rem" }}',
    '      >+1</button>',
    '      <button',
    '        onClick={() => setCount(0)}',
    '        style={{ background: "#21262d", color: "#e6edf3", border: "1px solid #30363d",',
    '                 padding: ".6rem 1.5rem", borderRadius: "8px", cursor: "pointer",',
    '                 fontSize: "1rem" }}',
    '      >Reset</button>',
    '    </div>',
    '  );',
    '}',
    '',
    'ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);',
    '',
  ].join('\n'),
};

// ── STDIN detection patterns ─────────────────────────────────────────────────
const STDIN_PATTERNS: Record<string, RegExp> = {
  python:     /\binput\s*\(/,
  javascript: /readline|process\.stdin/,
  typescript: /readline|process\.stdin/,
  java:       /Scanner|BufferedReader|System\.in/,
  c:          /scanf|fgets|getchar/,
  cpp:        /cin|getline/,
  csharp:     /Console\.(Read|ReadLine|ReadKey)/,
  go:         /fmt\.Scan|bufio\..*stdin/i,
  rust:       /stdin\(\)|read_line/,
  ruby:       /\bgets\b|STDIN/,
  php:        /fgets\(STDIN/,
  perl:       /<STDIN>/,
  haskell:    /getLine|getChar/,
  bash:       /\bread\b/,
  lua:        /io\.read/,
  swift:      /readLine/,
  scala:      /StdIn|readLine/,
  kotlin:     /readLine/,
};

function codeNeedsStdin(code: string, lang: string): boolean {
  return STDIN_PATTERNS[lang]?.test(code) ?? false;
}

// ── Safety decode for cached raw base64 ──────────────────────────────────────
function safeDecodeOutput(s: string | null | undefined): string {
  if (!s) return '';
  const t = s.trim();
  if (t.includes('=') && /^[A-Za-z0-9+/\r\n]+=*$/.test(t)) {
    try {
      const decoded = atob(t.replace(/\r?\n/g, ''));
      if (/^[\x09\x0a\x0d\x20-\x7e\u0080-\uFFFF]*$/.test(decoded)) return decoded;
    } catch { /* not base64 */ }
  }
  return s;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectLangFromFile(name: string): string | null {
  const m = name.match(/(\.[^.]+)$/);
  return m ? EXT_TO_LANG[m[1].toLowerCase()] ?? null : null;
}
function getDefaultFileName(lang: string): string {
  return `main${LANG_MAP[lang as LangValue]?.ext ?? '.txt'}`;
}
function mergeFiles(fs: EditorFile[]): string {
  if (fs.length === 1) return fs[0].content;
  return fs.map(f => `// ── ${f.name} ──\n${f.content}`).join('\n\n');
}

// ── Types ─────────────────────────────────────────────────────────────────────
type LayoutMode   = 'split-h' | 'split-v' | 'editor' | 'output';
type OutputTab    = 'stdout' | 'stderr' | 'preview' | 'console' | 'info' | 'tests' | 'terminal';
type PreviewSize  = 'desktop' | 'tablet' | 'mobile';
type EditorTheme  = 'vs-dark' | 'vs' | 'hc-black';
type EngineMode   = 'piston' | 'judge0' | 'interactive';

interface PistonResult {
  stdout: string;
  stderr: string;
  output: string;
  exitCode: number;
  language: string;
  version: string;
  engine: string;
  rateLimitRemaining?: number;
}
interface TerminalLine {
  type: 'output' | 'input' | 'system';
  text: string;
  ts: number;
}

interface EditorFile {
  id: string;
  name: string;
  content: string;
}
interface TestCase {
  id: string;
  name: string;
  input: string;
  expected: string;
  result?: { passed: boolean; actual: string; time: number };
}
interface CodeSubmission {
  id: string;
  status: string;
  stdout?: string | null;
  stderr?: string | null;
  exitCode?: number | null;
  executionTimeMs?: number | null;
  memoryUsedKb?: number | null;
  queuePosition?: number | null;
  language?: string;
  createdAt?: string;
}
interface QueueStatus { activeExecutions: number; maxConcurrent: number; queueLength: number; }
interface CollabSession { sessionId: string; language: string; code: string; fileName: string; participants: CollabParticipant[]; }
interface CollabParticipant { userId: string; displayName: string; }

const PARTICIPANT_COLORS = ['#e05b7a','#56b4e9','#e69f00','#009e73','#cc79a7','#0072b2'];

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status, exitCode }: { status: string; exitCode?: number | null }) {
  if (status === 'COMPLETED' && (exitCode == null || exitCode === 0))
    return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  if (status === 'COMPLETED')
    return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === 'TIMEOUT')
    return <Clock className="w-4 h-4 text-orange-400" />;
  if (status === 'ERROR')
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
}

// ────────────────────────────────────────────────────────────────────────────
// Browser-mode iframe builders
// ────────────────────────────────────────────────────────────────────────────
function buildBrowserJsSrc(code: string): string {
  // Wraps user JS in a full HTML page with console capture
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>body{margin:0;background:#0d1117;color:#e6edf3;font-family:monospace;padding:1rem;}</style>
</head>
<body>
<div id="root"></div>
<script>
(function(){
  var L=[];
  var _c=console.log.bind(console);
  var _w=console.warn.bind(console);
  var _e=console.error.bind(console);
  function relay(level,args){
    window.parent.postMessage({type:'console',level,text:args.map(function(a){
      try{return typeof a==='object'?JSON.stringify(a,null,2):String(a)}catch(e){return String(a)}
    }).join(' ')},'*');
    (level==='warn'?_w:level==='error'?_e:_c).apply(console,args);
  }
  console.log=function(){relay('log',Array.from(arguments))};
  console.warn=function(){relay('warn',Array.from(arguments))};
  console.error=function(){relay('error',Array.from(arguments))};
  window.addEventListener('error',function(e){
    window.parent.postMessage({type:'console',level:'error',text:'Uncaught '+e.message+' ('+e.filename+':'+e.lineno+')'},'*');
  });
})();
</script>
<script>
try{
${code}
}catch(e){console.error(e.message||String(e));}
</script>
</body></html>`;
}

function buildCssSrc(css: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>${css}</style>
</head>
<body>
<div class="card"><h1>CSS Playground</h1><p>Your styles are live here!</p></div>
</body></html>`;
}

function buildReactSrc(code: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<script>
(function(){
  var _c=console.log.bind(console);
  console.log=function(){
    var args=Array.from(arguments);
    window.parent.postMessage({type:'console',level:'log',text:args.map(function(a){
      try{return typeof a==='object'?JSON.stringify(a,null,2):String(a)}catch(e){return String(a)}
    }).join(' ')},'*');
    _c.apply(console,args);
  };
  window.addEventListener('error',function(e){
    window.parent.postMessage({type:'console',level:'error',text:'Uncaught '+e.message},'*');
  });
})();
</script>
<script type="text/babel">
try{
${code}
}catch(e){console.error(e.message||String(e));}
</script>
</body></html>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────
export default function CodePlaygroundPage() {
  const { toast } = useToast();

  // ── Core state ────────────────────────────────────────────────────────────
  const [language, setLanguage]               = useState<string>('python');
  const [code, setCode]                       = useState(DEFAULT_CODE.python);
  const [stdin, setStdin]                     = useState('');
  const [stdinOpen, setStdinOpen]             = useState(false);
  const [files, setFiles]                     = useState<EditorFile[]>([
    { id: '1', name: 'main.py', content: DEFAULT_CODE.python },
  ]);
  const [activeFileId, setActiveFileId]       = useState('1');
  const [editingFileName, setEditingFileName] = useState<string | null>(null);

  // ── Layout & display ──────────────────────────────────────────────────────
  const [layout, setLayout]                   = useState<LayoutMode>('split-h');
  const [outputTab, setOutputTab]             = useState<OutputTab>('stdout');
  const [htmlPreviewSrc, setHtmlPreviewSrc]   = useState<string | null>(null);
  const [previewSize, setPreviewSize]         = useState<PreviewSize>('desktop');
  const [autoPreview, setAutoPreview]         = useState(false);
  const [zenMode, setZenMode]                 = useState(false);
  const [editorTheme, setEditorTheme]         = useState<EditorTheme>('vs-dark');
  const [fontSize, setFontSize]               = useState(14);
  const [showSettings, setShowSettings]       = useState(false);
  const [showShortcuts, setShowShortcuts]     = useState(false);
  const [showHistory, setShowHistory]         = useState(false);

  // ── Engine selection (piston | judge0 | interactive) ──────────────────────
  const [engineMode, setEngineMode]           = useState<EngineMode>('piston');
  const [pistonResult, setPistonResult]       = useState<PistonResult | null>(null);

  // ── Interactive terminal ───────────────────────────────────────────────────
  const [terminalLines, setTerminalLines]     = useState<TerminalLine[]>([]);
  const [terminalStatus, setTerminalStatus]   = useState<'idle'|'connecting'|'running'|'done'|'error'>('idle');
  const [terminalInput, setTerminalInput]     = useState('');
  const terminalWsRef                         = useRef<WebSocket | null>(null);
  const terminalScrollRef                     = useRef<HTMLDivElement | null>(null);

  // ── Console capture (browser-mode) ────────────────────────────────────────
  const [consoleLogs, setConsoleLogs]         = useState<{ level: string; text: string }[]>([]);

  // ── Test cases ────────────────────────────────────────────────────────────
  const [testCases, setTestCases]             = useState<TestCase[]>([
    { id: '1', name: 'Sample 1', input: '', expected: '' },
  ]);
  const [batchRunning, setBatchRunning]       = useState(false);

  // ── Execution state ───────────────────────────────────────────────────────
  const [currentSubmission, setCurrentSubmission] = useState<CodeSubmission | null>(null);
  const [polling, setPolling]                 = useState(false);
  const [lastRunCode, setLastRunCode]         = useState('');

  // ── Collaboration state ───────────────────────────────────────────────────
  const [collabSession, setCollabSession]         = useState<CollabSession | null>(null);
  const [collabParticipants, setCollabParticipants] = useState<CollabParticipant[]>([]);
  const [joinDialogOpen, setJoinDialogOpen]       = useState(false);
  const [joinSessionId, setJoinSessionId]         = useState('');
  const [copied, setCopied]                       = useState(false);

  // ── Drag-to-resize ────────────────────────────────────────────────────────
  const [splitRatio, setSplitRatio]           = useState(50); // percent
  const isDragging                            = useRef(false);
  const containerRef                          = useRef<HTMLDivElement>(null);

  const stompClientRef      = useRef<Client | null>(null);
  const isRemoteUpdateRef   = useRef(false);
  const codeUpdateTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef        = useRef<HTMLInputElement>(null);
  const editorRef           = useRef<any>(null);
  const previewAutoTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const langInfo    = LANG_MAP[language as LangValue] ?? LANGUAGES[0];
  const isPreview   = langInfo?.preview ?? false;
  const isBrowserJs = language === 'browser-js';
  const isCss       = language === 'css';
  const isReact     = language === 'react';
  const isHtml      = language === 'html';
  const isClientSide = isPreview;
  const needsStdin  = useMemo(() => codeNeedsStdin(code, language), [code, language]);

  // Auto-open stdin panel when code needs it
  useEffect(() => {
    if (needsStdin && !stdinOpen) setStdinOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsStdin]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'console') {
        setConsoleLogs(prev => [...prev, { level: e.data.level, text: e.data.text }]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // ── Drag resize logic ─────────────────────────────────────────────────────
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const onMove = (me: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = layout === 'split-v'
        ? ((me.clientY - rect.top) / rect.height) * 100
        : ((me.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.min(80, Math.max(20, ratio)));
    };
    const onUp = () => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [layout]);

  // ── File helpers ──────────────────────────────────────────────────────────
  const updateActiveContent = useCallback((content: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
    setCode(content);
  }, [activeFileId]);

  const addFile = useCallback(() => {
    const ext = LANG_MAP[language as LangValue]?.ext ?? '.txt';
    const num = files.length + 1;
    const newFile: EditorFile = { id: Date.now().toString(), name: `file${num}${ext}`, content: '' };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setCode('');
  }, [language, files.length]);

  const removeFile = useCallback((id: string) => {
    if (files.length <= 1) return;
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      if (activeFileId === id) { setActiveFileId(next[0].id); setCode(next[0].content); }
      return next;
    });
  }, [files.length, activeFileId]);

  const renameFile = useCallback((id: string, name: string) => {
    if (!name.trim()) return;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: name.trim() } : f));
    setEditingFileName(null);
  }, []);

  const duplicateFile = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    const newFile: EditorFile = { id: Date.now().toString(), name: `${file.name}.copy`, content: file.content };
    setFiles(prev => [...prev, newFile]);
  }, [files]);

  const switchFile = useCallback((id: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: code } : f));
    const target = files.find(f => f.id === id);
    if (target) { setActiveFileId(id); setCode(target.content); }
  }, [activeFileId, code, files]);

  // ── Import / Export ───────────────────────────────────────────────────────
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast({ title: 'File too large', description: 'Max 500 KB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (!content) return;
      const lang = detectLangFromFile(file.name);
      if (lang) setLanguage(lang);
      setCode(content);
      setFiles([{ id: '1', name: file.name, content }]);
      setActiveFileId('1');
      toast({ title: 'File imported', description: `${file.name}${lang ? ` — detected ${LANG_MAP[lang as LangValue]?.label}` : ''}` });
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [toast]);

  const handleExport = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = files.find(f => f.id === activeFileId)?.name ?? getDefaultFileName(language);
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language, files, activeFileId]);

  const handleOpenInNewTab = useCallback(() => {
    if (!htmlPreviewSrc) return;
    window.open(htmlPreviewSrc, '_blank');
  }, [htmlPreviewSrc]);

  // ── Preview builder ───────────────────────────────────────────────────────
  const buildPreview = useCallback((src: string) => {
    if (htmlPreviewSrc) URL.revokeObjectURL(htmlPreviewSrc);
    let html = src;
    if (isBrowserJs)  html = buildBrowserJsSrc(src);
    else if (isCss)   html = buildCssSrc(src);
    else if (isReact) html = buildReactSrc(src);
    // html and other preview langs: raw html
    const blob = new Blob([html], { type: 'text/html' });
    setHtmlPreviewSrc(URL.createObjectURL(blob));
    setOutputTab('preview');
    setConsoleLogs([]);
    if (layout === 'editor') setLayout('split-h');
  }, [htmlPreviewSrc, isBrowserJs, isCss, isReact, layout]);

  // Auto-preview with debounce
  useEffect(() => {
    if (!autoPreview || !isClientSide) return;
    if (previewAutoTimer.current) clearTimeout(previewAutoTimer.current);
    previewAutoTimer.current = setTimeout(() => buildPreview(code), 600);
    return () => { if (previewAutoTimer.current) clearTimeout(previewAutoTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, autoPreview, isClientSide]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's')     { e.preventDefault(); handleExport(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') { e.preventDefault(); handleFormatCode(); }
      if (e.key === 'F11')                                { e.preventDefault(); setZenMode(z => !z); }
      if (e.key === 'Escape' && zenMode)                  { setZenMode(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── Format code (Monaco built-in) ────────────────────────────────────────
  const handleFormatCode = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  // ── Run selected code ─────────────────────────────────────────────────────
  const handleRunSelected = useCallback(() => {
    const selected = editorRef.current?.getModel()?.getValueInRange(editorRef.current.getSelection());
    if (!selected?.trim()) { toast({ title: 'No selection', description: 'Highlight some code first', variant: 'destructive' }); return; }
    executeMutation.mutate({ code: selected, language, stdin: stdin.trim() || undefined });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, stdin]);

  // ── Collab WebSocket ──────────────────────────────────────────────────────
  const getCollabWsUrl = useCallback(() => {
    const base = API_BASE_URL.startsWith('http') ? API_BASE_URL.replace(/\/api$/, '') : window.location.origin;    const protocol = base.startsWith('https') ? 'wss' : 'ws';
    const host = base.replace(/^https?:\/\//, '');
    return `${protocol}://${host}/ws/code-collab/websocket`;
  }, []);

  const connectCollabWs = useCallback((sessionId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const client = new Client({
      brokerURL: getCollabWsUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/collab/${sessionId}/code`, (msg: IMessage) => {
          const data = JSON.parse(msg.body);
          if (data.userId !== localStorage.getItem('userId')) {
            isRemoteUpdateRef.current = true;
            setCode(data.code);
            setFiles(prev => prev.map((f, i) => i === 0 ? { ...f, content: data.code } : f));
            setTimeout(() => { isRemoteUpdateRef.current = false; }, 50);
          }
        });
        client.subscribe(`/topic/collab/${sessionId}/language`, (msg: IMessage) => {
          const data = JSON.parse(msg.body);
          if (data.userId !== localStorage.getItem('userId')) {
            setLanguage(data.language);
          }
        });
        client.subscribe(`/topic/collab/${sessionId}/participants`, (msg: IMessage) => {
          const data = JSON.parse(msg.body);
          setCollabParticipants(data.filter((p: CollabParticipant) => p.userId !== localStorage.getItem('userId')));
        });
      },
    });
    client.activate();
    stompClientRef.current = client;
  }, [getCollabWsUrl]);

  const disconnectCollab = useCallback(() => {
    stompClientRef.current?.deactivate();
    stompClientRef.current = null;
  }, []);

  const broadcastCode = useCallback((newCode: string) => {
    if (!collabSession || !stompClientRef.current?.connected || isRemoteUpdateRef.current) return;
    if (codeUpdateTimerRef.current) clearTimeout(codeUpdateTimerRef.current);
    codeUpdateTimerRef.current = setTimeout(() => {
      stompClientRef.current?.publish({
        destination: `/app/collab/${collabSession.sessionId}/code`,
        body: JSON.stringify({ code: newCode, userId: localStorage.getItem('userId') || '', displayName: localStorage.getItem('displayName') || 'Anonymous' }),
      });
    }, 300);
  }, [collabSession]);

  const broadcastLanguage = useCallback((lang: string) => {
    if (!collabSession || !stompClientRef.current?.connected) return;
    stompClientRef.current?.publish({
      destination: `/app/collab/${collabSession.sessionId}/language`,
      body: JSON.stringify({ language: lang, userId: localStorage.getItem('userId') || '', displayName: localStorage.getItem('displayName') || 'Anonymous' }),
    });
  }, [collabSession]);

  useEffect(() => () => {
    disconnectCollab();
    if (codeUpdateTimerRef.current) clearTimeout(codeUpdateTimerRef.current);
    // Kill any running interactive terminal session
    if (terminalWsRef.current) {
      try { terminalWsRef.current.send(JSON.stringify({ type: 'kill' })); } catch {}
      terminalWsRef.current.close();
      terminalWsRef.current = null;
    }
  }, [disconnectCollab]);

  // ── Queue status & submission history ─────────────────────────────────────
  const { data: queueStatus } = useQuery<QueueStatus>({
    queryKey: ['codeQueueStatus'],
    queryFn: () => apiService.get(endpoints.getCodeQueueStatus).then(r => r.data),
    refetchInterval: polling ? 3000 : 60000,
  });

  const { data: submissionsData, refetch: refetchSubs } = useQuery({
    queryKey: ['myCodeSubmissions'],
    queryFn: () => apiService.get(endpoints.getMyCodeSubmissions).then(r => r.data),
  });
  const submissions: CodeSubmission[] = submissionsData?.content ?? submissionsData ?? [];

  // ── Poll for submission completion ────────────────────────────────────────
  useEffect(() => {
    if (!currentSubmission || !polling) return;
    const done = ['COMPLETED', 'ERROR', 'TIMEOUT'];
    if (done.includes(currentSubmission.status)) { setPolling(false); refetchSubs(); return; }
    const t = setInterval(async () => {
      try {
        const res = await apiService.get(endpoints.getCodeSubmission(currentSubmission.id));
        setCurrentSubmission(res.data);
        if (done.includes(res.data.status)) { setPolling(false); refetchSubs(); }
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(t);
  }, [currentSubmission, polling, refetchSubs]);

  // ── Execute code ──────────────────────────────────────────────────────────
  const executeMutation = useMutation({
    mutationFn: (payload: { code: string; language: string; stdin?: string }) =>
      apiService.post(endpoints.executeCode, payload).then(r => r.data),
    onSuccess: (data: CodeSubmission) => {
      setCurrentSubmission(data);
      setPistonResult(null);
      if (data.status === 'QUEUED' || data.status === 'RUNNING') setPolling(true);
      if (data.status === 'QUEUED' && (data.queuePosition ?? 0) > 1)
        toast({ title: 'Queued', description: `Position #${data.queuePosition}` });
      setOutputTab(data.stderr?.trim() && !data.stdout?.trim() ? 'stderr' : 'stdout');
    },
    onError: (err: any) => {
      toast({ title: 'Execution failed', description: err?.response?.data?.error ?? 'Unknown error', variant: 'destructive' });
    },
  });

  // ── Piston mutation (batch mode, all stdin upfront) ─────────────────────--
  const pistonMutation = useMutation({
    mutationFn: (payload: { code: string; language: string; stdin?: string }) =>
      apiService.post(endpoints.executeCodePiston, payload).then(r => r.data),
    onSuccess: (data: PistonResult) => {
      setPistonResult(data);
      setCurrentSubmission(null);
      setOutputTab(data.stderr?.trim() && !data.stdout?.trim() ? 'stderr' : 'stdout');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Piston engine unavailable';
      toast({ title: 'Execution failed', description: msg, variant: 'destructive' });
    },
  });

  // ── Interactive terminal WebSocket ────────────────────────────────────────
  const getTerminalWsUrl = useCallback(() => {
    const wsBase = import.meta.env.VITE_WS_BASE_URL as string | undefined;
    if (wsBase) return `${wsBase}/ws/terminal`;
    // fallback: derive from API_BASE_URL
    const base = API_BASE_URL.startsWith('http')
      ? API_BASE_URL.replace(/\/api$/, '')
      : window.location.origin;
    const protocol = base.startsWith('https') ? 'wss' : 'ws';
    const host = base.replace(/^https?:\/\//, '');
    return `${protocol}://${host}/ws/terminal`;
  }, []);

  const handleRunInteractive = useCallback((mergedCode: string) => {
    // Kill any existing session
    if (terminalWsRef.current) {
      try { terminalWsRef.current.send(JSON.stringify({ type: 'kill' })); } catch {}
      terminalWsRef.current.close();
      terminalWsRef.current = null;
    }
    setTerminalLines([]);
    setTerminalStatus('connecting');
    setOutputTab('terminal');
    setPistonResult(null);
    setCurrentSubmission(null);

    const ws = new WebSocket(getTerminalWsUrl());
    terminalWsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'start', language, code: mergedCode }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string);
        switch (msg.type) {
          case 'connected':
            break;
          case 'started':
            setTerminalStatus('running');
            setTerminalLines(prev => [...prev, {
              type: 'system',
              text: `▶ Interactive session started · language=${msg.language || language}`,
              ts: Date.now(),
            }]);
            break;
          case 'output':
            setTerminalLines(prev => [...prev, { type: 'output', text: msg.data as string, ts: Date.now() }]);
            setTimeout(() => {
              if (terminalScrollRef.current) {
                terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
              }
            }, 10);
            break;
          case 'done':
            setTerminalStatus('done');
            setTerminalLines(prev => [...prev, {
              type: 'system',
              text: `\n─── Process exited with code ${msg.exitCode ?? 0} ───`,
              ts: Date.now(),
            }]);
            terminalWsRef.current = null;
            break;
          case 'killed':
            setTerminalStatus('idle');
            setTerminalLines(prev => [...prev, {
              type: 'system', text: '─── Session terminated by user ───', ts: Date.now(),
            }]);
            terminalWsRef.current = null;
            break;
          case 'error':
            setTerminalStatus('error');
            setTerminalLines(prev => [...prev, {
              type: 'system', text: `✖ ${msg.message as string}`, ts: Date.now(),
            }]);
            terminalWsRef.current = null;
            break;
          case 'pong':
            break;
        }
      } catch { /* malformed message */ }
    };

    ws.onerror = () => {
      setTerminalStatus('error');
      setTerminalLines(prev => [...prev, {
        type: 'system', text: '✖ WebSocket connection error. Verify the backend is running and interactive mode is supported.', ts: Date.now(),
      }]);
      terminalWsRef.current = null;
    };

    ws.onclose = () => {
      terminalWsRef.current = null;
      setTerminalStatus(prev => (prev === 'running' || prev === 'connecting') ? 'done' : prev);
    };
  }, [getTerminalWsUrl, language]);

  const handleTerminalSendInput = useCallback(() => {
    if (!terminalWsRef.current || terminalStatus !== 'running' || !terminalInput.trim()) return;
    const inputText = terminalInput;
    terminalWsRef.current.send(JSON.stringify({ type: 'stdin', data: inputText }));
    setTerminalLines(prev => [...prev, { type: 'input', text: inputText, ts: Date.now() }]);
    setTerminalInput('');
  }, [terminalInput, terminalStatus]);

  const handleTerminalKill = useCallback(() => {
    if (!terminalWsRef.current) return;
    try { terminalWsRef.current.send(JSON.stringify({ type: 'kill' })); } catch {}
    terminalWsRef.current.close();
    terminalWsRef.current = null;
    setTerminalStatus('idle');
  }, []);

  const handleRun = useCallback(() => {
    if (isClientSide) {
      buildPreview(code);
      return;
    }
    const updatedFiles = files.map(f => f.id === activeFileId ? { ...f, content: code } : f);
    const merged = mergeFiles(updatedFiles);
    setLastRunCode(merged);

    if (engineMode === 'interactive') {
      handleRunInteractive(merged);
    } else if (engineMode === 'piston') {
      setPistonResult(null);
      setCurrentSubmission(null);
      pistonMutation.mutate({ code: merged, language, stdin: stdin.trim() || undefined });
    } else {
      setCurrentSubmission(null);
      setPistonResult(null);
      executeMutation.mutate({ code: merged, language, stdin: stdin.trim() || undefined });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClientSide, code, files, activeFileId, language, stdin, engineMode, executeMutation, pistonMutation, handleRunInteractive]);

  const handleReRun = useCallback(() => {
    if (!lastRunCode) return;
    executeMutation.mutate({ code: lastRunCode, language, stdin: stdin.trim() || undefined });
  }, [lastRunCode, language, stdin, executeMutation]);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    if (!collabSession) {
      const def = DEFAULT_CODE[lang] ?? '';
      setCode(def);
      setFiles([{ id: '1', name: getDefaultFileName(lang), content: def }]);
      setActiveFileId('1');
    }
    broadcastLanguage(lang);
    setCurrentSubmission(null);
    setConsoleLogs([]);
    const newLangIsPreview = LANG_MAP[lang as LangValue]?.preview ?? false;
    if (newLangIsPreview) setOutputTab('preview');
    else setOutputTab('stdout');
  }, [collabSession, broadcastLanguage]);

  const handleReset = useCallback(() => {
    const def = DEFAULT_CODE[language] ?? '';
    setCode(def);
    setFiles([{ id: '1', name: getDefaultFileName(language), content: def }]);
    setActiveFileId('1');
    setCurrentSubmission(null);
    setPistonResult(null);
    setTerminalLines([]);
    setTerminalStatus('idle');
    setStdin('');
    setConsoleLogs([]);
  }, [language]);

  const handleCodeChange = useCallback((val: string | undefined) => {
    const v = val ?? '';
    updateActiveContent(v);
    broadcastCode(v);
  }, [updateActiveContent, broadcastCode]);

  // ── Test cases ────────────────────────────────────────────────────────────
  const addTestCase = useCallback(() => {
    setTestCases(prev => [...prev, { id: Date.now().toString(), name: `Test ${prev.length + 1}`, input: '', expected: '' }]);
  }, []);

  const updateTestCase = useCallback((id: string, field: keyof TestCase, value: string) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  }, []);

  const removeTestCase = useCallback((id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  }, []);

  const runAllTests = useCallback(async () => {
    if (isClientSide || batchRunning) return;
    setBatchRunning(true);
    const merged = mergeFiles(files.map(f => f.id === activeFileId ? { ...f, content: code } : f));
    const updated: TestCase[] = await Promise.all(
      testCases.map(async (tc) => {
        const start = Date.now();
        try {
          const res = await apiService.post(endpoints.executeCode, {
            code: merged,
            language,
            stdin: tc.input || undefined,
          });
          let sub: CodeSubmission = res.data;
          // Poll until done
          let tries = 0;
          while ((sub.status === 'QUEUED' || sub.status === 'RUNNING') && tries < 30) {
            await new Promise(r => setTimeout(r, 2000));
            const poll = await apiService.get(endpoints.getCodeSubmission(sub.id));
            sub = poll.data;
            tries++;
          }
          const actual = safeDecodeOutput(sub.stdout ?? '').trim();
          const expected = tc.expected.trim();
          return { ...tc, result: { passed: actual === expected, actual, time: Date.now() - start } };
        } catch {
          return { ...tc, result: { passed: false, actual: 'Error', time: Date.now() - start } };
        }
      })
    );
    setTestCases(updated);
    setBatchRunning(false);
    setOutputTab('tests');
    const passed = updated.filter(t => t.result?.passed).length;
    toast({ title: `Tests: ${passed}/${updated.length} passed`, variant: passed === updated.length ? 'default' : 'destructive' });
  }, [isClientSide, batchRunning, files, activeFileId, code, testCases, language, toast]);

  // ── Collab helpers ────────────────────────────────────────────────────────
  const handleCreateSession = useCallback(async () => {
    try {
      const res = await apiService.post(endpoints.createCollabSession, {
        language, code, fileName: files.find(f => f.id === activeFileId)?.name || getDefaultFileName(language),
      });
      const session: CollabSession = res.data;
      setCollabSession(session);
      setCollabParticipants([]);
      connectCollabWs(session.sessionId);
      toast({ title: 'Live session started', description: `Code: ${session.sessionId}` });
    } catch {
      toast({ title: 'Error', description: 'Could not create session', variant: 'destructive' });
    }
  }, [language, code, files, activeFileId, connectCollabWs, toast]);

  const handleJoinSession = useCallback(async () => {
    if (!joinSessionId.trim()) return;
    try {
      const res = await apiService.post(endpoints.joinCollabSession(joinSessionId.trim()));
      const session: CollabSession = res.data;
      setCollabSession(session);
      setLanguage(session.language);
      setCode(session.code);
      setFiles([{ id: '1', name: session.fileName || getDefaultFileName(session.language), content: session.code }]);
      setActiveFileId('1');
      setCollabParticipants(session.participants.filter(p => p.userId !== localStorage.getItem('userId')));
      connectCollabWs(session.sessionId);
      setJoinDialogOpen(false);
      setJoinSessionId('');
      toast({ title: 'Joined session', description: session.sessionId });
    } catch {
      toast({ title: 'Session not found', description: 'It may have expired.', variant: 'destructive' });
    }
  }, [joinSessionId, connectCollabWs, toast]);

  const handleLeaveSession = useCallback(async () => {
    if (!collabSession) return;
    try { await apiService.delete(endpoints.leaveCollabSession(collabSession.sessionId)); } catch { /* ignore */ }
    disconnectCollab();
    setCollabSession(null);
    setCollabParticipants([]);
    toast({ title: 'Left session' });
  }, [collabSession, disconnectCollab, toast]);

  const handleCopySessionId = useCallback(() => {
    if (!collabSession) return;
    navigator.clipboard.writeText(collabSession.sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [collabSession]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const isRunning  = executeMutation.isPending || pistonMutation.isPending || polling || terminalStatus === 'connecting' || terminalStatus === 'running';
  const monacoLang = LANG_MAP[language as LangValue]?.monaco ?? language;
  const serverLoad = queueStatus ? Math.round((queueStatus.activeExecutions / Math.max(queueStatus.maxConcurrent, 1)) * 100) : 0;
  const passedTests = testCases.filter(tc => tc.result?.passed).length;

  // Unified stdout / stderr for display (works for both Judge0 and Piston results)
  const stdout = pistonResult
    ? safeDecodeOutput(pistonResult.stdout)
    : safeDecodeOutput(currentSubmission?.stdout);
  const stderr = pistonResult
    ? safeDecodeOutput(pistonResult.stderr)
    : safeDecodeOutput(currentSubmission?.stderr);
  const hasStderr = stderr.trim().length > 0;

  function buildOutputDisplay(): string {
    if (pistonResult) {
      return pistonResult.stdout || (pistonResult.stderr ? '' : '(program produced no output)');
    }
    const s = currentSubmission;
    if (!s) return '';
    if (s.status === 'QUEUED')  return `Queued — position ${s.queuePosition ?? '…'} in queue.`;
    if (s.status === 'RUNNING') return 'Executing…';
    if (s.status === 'TIMEOUT') return 'Execution timed out (10 s limit). Check for infinite loops.';
    if (s.status === 'ERROR')   return stderr || stdout || 'An internal error occurred.';
    return stdout || '(program produced no output)';
  }

  function outputTextColor(): string {
    if (pistonResult) {
      if (pistonResult.exitCode === 0) return 'text-green-300';
      return pistonResult.stderr ? 'text-red-300' : 'text-green-300';
    }
    const s = currentSubmission;
    if (!s || s.status === 'QUEUED' || s.status === 'RUNNING') return 'text-yellow-300';
    if (s.status === 'TIMEOUT') return 'text-orange-400';
    if (s.status === 'ERROR' || (s.exitCode != null && s.exitCode !== 0)) return 'text-red-300';
    return 'text-green-300';
  }

  const previewWidths: Record<PreviewSize, string> = {
    desktop: '100%', tablet: '768px', mobile: '375px',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      className={`flex flex-col bg-[#0d1117] ${zenMode ? 'fixed inset-0 z-50' : 'h-full'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef} type="file" className="hidden"
        accept=".py,.pyw,.js,.mjs,.ts,.tsx,.jsx,.java,.c,.h,.cpp,.cc,.cxx,.hpp,.cs,.go,.rs,.rb,.php,.kt,.kts,.swift,.scala,.r,.lua,.pl,.hs,.sql,.sh,.bash,.html,.htm,.css,.txt"
        onChange={handleImport}
      />

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      {!zenMode && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#010409] border-b border-[#21262d] shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="h-4 w-px bg-[#21262d]" />
            <Code2 className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="font-bold text-white text-sm tracking-wide">Code Playground</span>
            <span className="text-[#484f58] text-xs hidden lg:inline">· 24 languages · live collab</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Collab */}
            {collabSession ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/40 border border-green-700/50 rounded-lg text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-300 font-semibold">Live</span>
                <code className="text-green-200 font-mono">{collabSession.sessionId}</code>
                <button onClick={handleCopySessionId} className="text-green-400 hover:text-green-200" title="Copy">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
                <button onClick={handleLeaveSession} className="text-red-400 hover:text-red-200" title="Leave">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={handleCreateSession} className="flex items-center gap-1 px-2 py-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] text-xs transition-colors">
                  <Share2 className="w-3 h-3" /> Share
                </button>
                <button onClick={() => setJoinDialogOpen(true)} className="flex items-center gap-1 px-2 py-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] text-xs transition-colors">
                  <Users className="w-3 h-3" /> Join
                </button>
              </>
            )}
            {queueStatus && (
              <div className={`hidden sm:flex items-center gap-1 text-xs ${serverLoad >= 80 ? 'text-red-400' : serverLoad >= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                <Cpu className="w-3 h-3" />
                <span>{queueStatus.activeExecutions}/{queueStatus.maxConcurrent}</span>
              </div>
            )}
            <button onClick={() => setShowHistory(v => !v)} className="flex items-center gap-1 px-2 py-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] text-xs transition-colors">
              <History className="w-3 h-3" /> History
            </button>
            <button onClick={() => setShowSettings(v => !v)} className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Settings">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowShortcuts(v => !v)} className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Keyboard shortcuts">
              <Keyboard className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZenMode(true)} className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Zen mode (F11)">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ══ SETTINGS DRAWER ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-b border-[#21262d] bg-[#0d1117] shrink-0"
          >
            <div className="flex flex-wrap items-center gap-4 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b949e]">Theme</span>
                <Select value={editorTheme} onValueChange={(v: EditorTheme) => setEditorTheme(v)}>
                  <SelectTrigger className="h-7 w-28 bg-[#161b22] border-[#30363d] text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-[#30363d]">
                    <SelectItem value="vs-dark" className="text-xs">Dark</SelectItem>
                    <SelectItem value="vs" className="text-xs">Light</SelectItem>
                    <SelectItem value="hc-black" className="text-xs">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8b949e]">Font size: {fontSize}px</span>
                <div className="w-24">
                  <Slider
                    value={[fontSize]}
                    min={10} max={24} step={1}
                    onValueChange={([v]) => setFontSize(v)}
                    className="w-full"
                  />
                </div>
              </div>
              {isClientSide && (
                <div className="flex items-center gap-2">
                  <Switch checked={autoPreview} onCheckedChange={setAutoPreview} id="auto-preview" />
                  <Label htmlFor="auto-preview" className="text-xs text-[#8b949e] cursor-pointer">Auto-preview</Label>
                </div>
              )}
              <button onClick={() => setShowSettings(false)} className="ml-auto p-1 rounded text-[#8b949e] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ KEYBOARD SHORTCUTS DRAWER ════════════════════════════════════════ */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-b border-[#21262d] bg-[#0d1117] shrink-0"
          >
            <div className="flex flex-wrap gap-3 px-4 py-2.5 text-xs">
              {[
                ['Ctrl+Enter', 'Run code'],
                ['Ctrl+S', 'Export file'],
                ['Ctrl+Shift+F', 'Format code'],
                ['F11', 'Zen mode'],
                ['Esc', 'Exit zen mode'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] font-mono text-[10px]">{key}</kbd>
                  <span className="text-[#8b949e]">{desc}</span>
                </div>
              ))}
              <button onClick={() => setShowShortcuts(false)} className="ml-auto p-1 rounded text-[#8b949e] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HISTORY PANEL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-b border-[#21262d] bg-[#0d1117] shrink-0 max-h-40 overflow-y-auto"
          >
            <div className="px-4 py-2 space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8b949e] font-semibold">Recent Runs</span>
                <button onClick={() => setShowHistory(false)} className="text-[#8b949e] hover:text-white"><X className="w-3 h-3" /></button>
              </div>
              {submissions.length === 0 && <p className="text-xs text-[#484f58]">No runs yet.</p>}
              {submissions.slice(0, 10).map((sub: CodeSubmission) => (
                <button
                  key={sub.id}
                  onClick={() => { setCurrentSubmission(sub); setOutputTab('stdout'); setShowHistory(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#21262d] text-left transition-colors"
                >
                  <StatusIcon status={sub.status} exitCode={sub.exitCode} />
                  <span className="text-xs text-[#8b949e] capitalize">{sub.language}</span>
                  <span className={`text-xs ml-auto ${sub.status === 'COMPLETED' && sub.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>{sub.status}</span>
                  {sub.executionTimeMs != null && <span className="text-xs text-[#484f58]">{sub.executionTimeMs}ms</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ TOOLBAR ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border-b border-[#21262d] flex-wrap gap-y-1.5 shrink-0">
        {/* Language badge + selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="inline-flex items-center justify-center w-8 h-6 rounded text-[10px] font-bold shrink-0"
            style={{ background: langInfo?.bg ?? '#1e1e1e', color: langInfo?.color ?? '#fff' }}
          >
            {langInfo?.badge ?? '?'}
          </span>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-7 w-40 sm:w-48 bg-[#0d1117] border-[#30363d] text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-[#30363d] max-h-64 overflow-y-auto">
              {/* Group: Server-side */}
              <div className="px-2 py-1 text-[10px] text-[#484f58] uppercase tracking-wider">Server-side (Judge0)</div>
              {LANGUAGES.filter(l => !l.preview).map(l => (
                <SelectItem key={l.value} value={l.value} className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-4 rounded text-[9px] font-bold shrink-0" style={{ background: l.bg, color: l.color }}>{l.badge}</span>
                    {l.label}
                  </div>
                </SelectItem>
              ))}
              {/* Group: Client-side preview */}
              <div className="px-2 py-1 text-[10px] text-[#484f58] uppercase tracking-wider border-t border-[#30363d] mt-1 pt-2">Browser / Preview</div>
              {LANGUAGES.filter(l => l.preview).map(l => (
                <SelectItem key={l.value} value={l.value} className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-4 rounded text-[9px] font-bold shrink-0" style={{ background: l.bg, color: l.color }}>{l.badge}</span>
                    {l.label}
                    <span className="text-[9px] text-emerald-400 ml-auto">preview</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-4 w-px bg-[#30363d] hidden sm:block shrink-0" />

        {/* File ops */}
        <button onClick={() => fileInputRef.current?.click()} title="Import file" className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"><Upload className="w-3.5 h-3.5" /></button>
        <button onClick={handleExport} title="Export file" className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"><Download className="w-3.5 h-3.5" /></button>
        <button onClick={handleFormatCode} title="Format code (Ctrl+Shift+F)" className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"><Wand2 className="w-3.5 h-3.5" /></button>
        <button onClick={handleReset} title="Reset to default" className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>

        <div className="h-4 w-px bg-[#30363d] hidden sm:block shrink-0" />

        {/* Engine selector */}
        {!isClientSide && (
          <div className="flex items-center gap-0.5 rounded border border-[#30363d] overflow-hidden" title="Execution engine">
            <button
              onClick={() => setEngineMode('piston')}
              className={`px-2 py-1 text-[10px] font-semibold transition-colors ${engineMode === 'piston' ? 'bg-violet-700 text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}
              title="Piston — fast, 70+ languages, no cgroup requirement"
            >
              Piston
            </button>
            <button
              onClick={() => setEngineMode('judge0')}
              className={`px-2 py-1 text-[10px] font-semibold transition-colors ${engineMode === 'judge0' ? 'bg-blue-700 text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}
              title="Judge0 — grading engine with test cases and scoring"
            >
              Judge0
            </button>
            <button
              onClick={() => setEngineMode('interactive')}
              className={`px-2 py-1 text-[10px] font-semibold transition-colors ${engineMode === 'interactive' ? 'bg-emerald-700 text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}
              title="Interactive — true real-time stdin via Docker container"
            >
              Terminal
            </button>
          </div>
        )}

        {/* Stdin */}
        {!isClientSide && engineMode !== 'interactive' && (
          <button
            className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded border transition-all ${
              stdinOpen ? 'border-violet-500 text-violet-300 bg-violet-900/20' : 'border-[#30363d] text-[#8b949e] hover:text-white'
            }`}
            onClick={() => setStdinOpen(v => !v)}
            title="Toggle stdin"
          >
            <Terminal className="w-3 h-3" />stdin
            {needsStdin && !stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
            {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
          </button>
        )}

        {/* Test cases */}
        {!isClientSide && (
          <button
            onClick={() => setOutputTab('tests')}
            className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded border transition-all ${
              outputTab === 'tests' ? 'border-emerald-500 text-emerald-300 bg-emerald-900/20' : 'border-[#30363d] text-[#8b949e] hover:text-white'
            }`}
            title="Test cases"
          >
            <FlaskConical className="w-3 h-3" />Tests
            {testCases.some(t => t.result) && (
              <span className={`text-[9px] font-bold ${passedTests === testCases.length ? 'text-green-400' : 'text-red-400'}`}>
                {passedTests}/{testCases.length}
              </span>
            )}
          </button>
        )}

        {/* Layout toggles */}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <button onClick={() => setLayout('split-h')} title="Horizontal split" className={`p-1.5 rounded transition-colors ${layout === 'split-h' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}>
            <LayoutPanelLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setLayout('split-v')} title="Vertical split" className={`p-1.5 rounded transition-colors ${layout === 'split-v' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}>
            <LayoutPanelTop className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setLayout(l => l === 'editor' ? 'split-h' : 'editor')} title="Maximize editor" className={`p-1.5 rounded transition-colors ${layout === 'editor' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}>
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setLayout(l => l === 'output' ? 'split-h' : 'output')} title="Maximize output" className={`p-1.5 rounded transition-colors ${layout === 'output' ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'}`}>
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Run button group */}
        <div className="flex items-center gap-1 shrink-0">
          {!isClientSide && lastRunCode && (
            <button
              onClick={handleReRun}
              disabled={isRunning}
              className="h-7 px-2 rounded text-xs text-[#8b949e] hover:text-white hover:bg-[#21262d] border border-[#30363d] transition-colors flex items-center gap-1"
              title="Re-run last"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
          {!isClientSide && (
            <button
              onClick={handleRunSelected}
              disabled={isRunning}
              className="h-7 px-2 rounded text-xs text-[#8b949e] hover:text-white hover:bg-[#21262d] border border-[#30363d] transition-colors flex items-center gap-1"
              title="Run selected code"
            >
              <Braces className="w-3 h-3" />
            </button>
          )}
          <Button
            size="sm"
            className="h-7 gap-1.5 font-semibold text-xs min-w-[80px]"
            style={{ background: isRunning ? '#21262d' : isClientSide ? '#1a472a' : '#7c3aed', color: 'white' }}
            onClick={handleRun}
            disabled={!!isRunning || !code.trim()}
            title={isClientSide ? 'Preview (Ctrl+Enter)' : 'Run (Ctrl+Enter)'}
          >
            {isRunning
              ? <><Loader2 className="w-3 h-3 animate-spin" /><span className="hidden sm:inline">Running…</span></>
              : isClientSide
              ? <><Eye className="w-3 h-3" /><span className="hidden sm:inline">Preview</span></>
              : <><Play className="w-3 h-3" /><span className="hidden sm:inline">Run</span></>
            }
          </Button>
        </div>
      </div>

      {/* ══ STDIN PANEL ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {stdinOpen && !isClientSide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-b border-[#21262d] bg-[#0d1117] shrink-0"
          >
            <div className="px-4 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-[#8b949e] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Standard Input (stdin)
                  {needsStdin && !stdin.trim() && (
                    <span className="text-orange-400 text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />Code reads input — provide values here (one per line)
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStdin(prev => prev + (prev && !prev.endsWith('\n') ? '\n' : '') + '')}
                    className="text-[#8b949e] hover:text-white text-xs flex items-center gap-1 transition-colors"
                    title="Add line"
                  >
                    <Plus className="w-3 h-3" /> Add line
                  </button>
                  <button onClick={() => setStdin('')} className="text-[#8b949e] hover:text-red-400 text-xs flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Line numbers */}
                <div className="select-none text-right text-[#484f58] text-xs font-mono leading-5 pt-1.5 pl-1 pr-2 min-w-[2rem]" style={{ lineHeight: '1.5rem' }}>
                  {(stdin || '\n').split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <Textarea
                  value={stdin}
                  onChange={e => setStdin(e.target.value)}
                  placeholder={"Enter each input value on a separate line:\ne.g.\nAlice\n25\nEngineer"}
                  rows={Math.max(3, (stdin.split('\n').length))}
                  className="font-mono text-xs bg-[#161b22] border-[#30363d] text-[#e6edf3] placeholder:text-[#484f58] resize-none flex-1"
                  style={{ lineHeight: '1.5rem' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ COLLAB PARTICIPANTS ═══════════════════════════════════════════════ */}
      {collabSession && collabParticipants.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1 bg-[#0d1117] border-b border-[#21262d] text-xs shrink-0">
          <Users className="w-3 h-3 text-[#8b949e]" />
          <span className="text-[#8b949e]">Collaborating:</span>
          {collabParticipants.map((p, i) => (
            <span key={p.userId} className="px-2 py-0.5 rounded-full text-white text-[10px] font-semibold" style={{ background: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}>
              {p.displayName}
            </span>
          ))}
        </div>
      )}

      {/* ══ MAIN BODY ════════════════════════════════════════════════════════ */}
      <div
        ref={containerRef}
        className={`flex-1 min-h-0 flex ${layout === 'split-v' ? 'flex-col' : 'flex-row'} overflow-hidden`}
      >
        {/* ── EDITOR PANEL ── */}
        {layout !== 'output' && (
          <div
            className="flex flex-col min-h-0 min-w-0 border-[#21262d]"
            style={
              layout === 'split-h'
                ? { width: `${splitRatio}%`, borderRightWidth: 1 }
                : layout === 'split-v'
                ? { height: `${splitRatio}%`, borderBottomWidth: 1 }
                : { flex: 1 }
            }
          >
            {/* File tabs */}
            <div className="flex items-center bg-[#161b22] border-b border-[#21262d] overflow-x-auto shrink-0">
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => switchFile(file.id)}
                  className={`group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-[#21262d] transition-colors select-none shrink-0 ${
                    activeFileId === file.id ? 'bg-[#0d1117] text-white border-t-2 border-t-violet-500' : 'text-[#8b949e] hover:text-white hover:bg-[#1c2128]'
                  }`}
                >
                  <FileCode className="w-3 h-3 shrink-0" />
                  {editingFileName === file.id ? (
                    <Input
                      autoFocus
                      defaultValue={file.name}
                      className="h-4 w-24 text-[11px] px-1 py-0 bg-transparent border-0 border-b border-violet-500 focus-visible:ring-0 rounded-none"
                      onBlur={e => renameFile(file.id, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') renameFile(file.id, (e.target as HTMLInputElement).value);
                        if (e.key === 'Escape') setEditingFileName(null);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="max-w-[100px] truncate" onDoubleClick={e => { e.stopPropagation(); setEditingFileName(file.id); }}>
                      {file.name}
                    </span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                    <button className="hover:text-blue-400 transition-colors" onClick={e => { e.stopPropagation(); duplicateFile(file.id); }} title="Duplicate">
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                    {files.length > 1 && (
                      <button className="hover:text-red-400 transition-colors" onClick={e => { e.stopPropagation(); removeFile(file.id); }} title="Remove">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addFile} className="flex items-center px-3 py-2 text-[#8b949e] hover:text-white text-xs transition-colors shrink-0" title="Add file">
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Monaco */}
            <div className="flex-1 min-h-0">
              <Suspense fallback={<div className="h-full flex items-center justify-center bg-[#0d1117]"><LoadingSpinner size="lg" /></div>}>
                <MonacoEditor
                  height="100%"
                  language={monacoLang}
                  value={code}
                  onChange={handleCodeChange}
                  theme={editorTheme}
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{
                    fontSize,
                    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
                    fontLigatures: true,
                    minimap: { enabled: layout === 'split-h', side: 'right', scale: 1, renderCharacters: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'off',
                    lineNumbers: 'on',
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'all',
                    bracketPairColorization: { enabled: true },
                    formatOnPaste: true,
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: { other: true, comments: false, strings: false },
                    parameterHints: { enabled: true },
                    folding: true,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    mouseWheelZoom: true,
                    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                    overviewRulerBorder: false,
                    glyphMargin: false,
                    colorDecorators: true,
                    codeLens: false,
                    contextmenu: true,
                  }}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* ── DRAG HANDLE ── */}
        {(layout === 'split-h' || layout === 'split-v') && (
          <div
            onMouseDown={startDrag}
            className={`shrink-0 bg-[#21262d] hover:bg-violet-600/40 transition-colors cursor-col-resize flex items-center justify-center group z-10 ${
              layout === 'split-v' ? 'h-1.5 w-full cursor-row-resize' : 'w-1.5 h-full cursor-col-resize'
            }`}
            title="Drag to resize"
          >
            <GripVertical className={`w-3 h-3 text-[#484f58] group-hover:text-violet-400 ${layout === 'split-v' ? 'rotate-90' : ''}`} />
          </div>
        )}

        {/* ── OUTPUT PANEL ── */}
        {layout !== 'editor' && (
          <div
            className="flex flex-col min-h-0 min-w-0 bg-[#0d1117]"
            style={
              layout === 'split-h'
                ? { width: `${100 - splitRatio}%` }
                : layout === 'split-v'
                ? { height: `${100 - splitRatio}%` }
                : { flex: 1 }
            }
          >
            {/* Output header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#21262d] shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#8b949e]" />
                <span className="text-white text-xs font-semibold">Output</span>
                {currentSubmission && (
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={currentSubmission.status} exitCode={currentSubmission.exitCode} />
                    <span className={`text-xs font-semibold ${
                      currentSubmission.status === 'COMPLETED' && (currentSubmission.exitCode == null || currentSubmission.exitCode === 0) ? 'text-green-400'
                      : currentSubmission.status === 'COMPLETED' ? 'text-red-400'
                      : (currentSubmission.status === 'RUNNING' || currentSubmission.status === 'QUEUED') ? 'text-yellow-400'
                      : 'text-red-400'
                    }`}>
                      {currentSubmission.status}
                      {currentSubmission.executionTimeMs != null && ` · ${currentSubmission.executionTimeMs}ms`}
                      {currentSubmission.exitCode != null && ` · exit ${currentSubmission.exitCode}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isClientSide && htmlPreviewSrc && (
                  <>
                    {/* Preview size controls */}
                    <div className="flex items-center border border-[#30363d] rounded overflow-hidden">
                      {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as [PreviewSize, any][]).map(([size, Icon]) => (
                        <button
                          key={size}
                          onClick={() => setPreviewSize(size)}
                          className={`p-1 transition-colors ${previewSize === size ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:text-white'}`}
                          title={size}
                        >
                          <Icon className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                    <button onClick={handleOpenInNewTab} className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Open in new tab">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                )}
                {(currentSubmission || htmlPreviewSrc) && (
                  <button
                    onClick={() => { setCurrentSubmission(null); if (htmlPreviewSrc) { URL.revokeObjectURL(htmlPreviewSrc); setHtmlPreviewSrc(null); } setConsoleLogs([]); }}
                    className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Clear output"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {stdout.trim() && (
                  <button onClick={() => navigator.clipboard.writeText(stdout)} className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Copy output">
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Output tabs */}
            <div className="flex items-center bg-[#161b22] border-b border-[#21262d] px-1 overflow-x-auto shrink-0">
              {[
                { id: 'stdout'   as OutputTab, label: 'Output',   Icon: Terminal,     dot: false,                       show: !isClientSide },
                { id: 'stderr'   as OutputTab, label: 'Errors',   Icon: AlertCircle,  dot: hasStderr,                   show: !isClientSide },
                { id: 'terminal' as OutputTab, label: 'Terminal', Icon: Terminal,     dot: terminalStatus === 'running', show: !isClientSide && engineMode === 'interactive' },
                { id: 'preview'  as OutputTab, label: 'Preview',  Icon: Eye,          dot: false,                       show: isClientSide  },
                { id: 'console'  as OutputTab, label: 'Console',  Icon: Terminal,     dot: consoleLogs.length > 0,      show: isClientSide  },
                { id: 'tests'    as OutputTab, label: 'Tests',    Icon: FlaskConical, dot: testCases.some(t=>t.result), show: !isClientSide },
                { id: 'info'     as OutputTab, label: 'Info',     Icon: Info,         dot: false,                       show: true          },
              ].filter(t => t.show).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setOutputTab(tab.id)}
                  className={`flex items-center gap-1 px-3 py-2 text-xs transition-colors border-b-2 whitespace-nowrap ${
                    outputTab === tab.id ? 'border-violet-500 text-white' : 'border-transparent text-[#8b949e] hover:text-white'
                  }`}
                >
                  <tab.Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tab.id === 'stderr' ? 'bg-red-500' : tab.id === 'terminal' ? 'bg-emerald-400 animate-pulse' : 'bg-violet-400'}`} />}
                </button>
              ))}
            </div>

            {/* Output body */}
            <div className="flex-1 min-h-0 overflow-hidden">

              {/* stdout */}
              {outputTab === 'stdout' && (
                <pre
                  className={`h-full p-4 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed ${outputTextColor()}`}
                  style={{ background: '#0d1117', fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",Consolas,monospace', fontSize: 13 }}
                >
                  {(currentSubmission || pistonResult)
                    ? buildOutputDisplay()
                    : <span className="text-[#484f58]">Click <strong className="text-[#8b949e]">Run</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] text-xs">Ctrl+Enter</kbd> to execute</span>
                  }
                </pre>
              )}

              {/* stderr */}
              {outputTab === 'stderr' && (
                <pre className="h-full p-4 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed text-red-400" style={{ background: '#0d1117', fontSize: 13 }}>
                  {hasStderr ? stderr : <span className="text-[#484f58]">(no error output)</span>}
                </pre>
              )}

              {/* interactive terminal */}
              {outputTab === 'terminal' && (
                <div className="h-full flex flex-col bg-[#0d1117]">
                  {/* Terminal header */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#21262d] shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{
                        background: terminalStatus === 'running' ? '#27c93f'
                          : terminalStatus === 'error' ? '#ff5f56'
                          : terminalStatus === 'done' ? '#8b949e'
                          : '#484f58',
                      }} />
                      <span className="text-[#8b949e] text-xs font-semibold capitalize">
                        {terminalStatus === 'idle' ? 'Press Run to start interactive session'
                          : terminalStatus === 'connecting' ? 'Connecting to container…'
                          : terminalStatus === 'running' ? 'Container running — type input below'
                          : terminalStatus === 'done' ? 'Session complete'
                          : 'Session error'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {terminalStatus === 'running' && (
                        <button onClick={handleTerminalKill} className="px-2 py-0.5 text-[10px] rounded bg-red-900/40 border border-red-700/50 text-red-300 hover:bg-red-900/70 transition-colors flex items-center gap-1">
                          <Square className="w-2.5 h-2.5" /> Kill
                        </button>
                      )}
                      <button onClick={() => setTerminalLines([])} className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Clear terminal">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Terminal output lines */}
                  <div
                    ref={terminalScrollRef}
                    className="flex-1 overflow-auto p-3 font-mono text-sm space-y-0"
                    style={{ background: '#0d1117', fontSize: 13, fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",Consolas,monospace' }}
                  >
                    {terminalLines.length === 0 && terminalStatus === 'idle' && (
                      <div className="text-[#484f58] text-xs mt-4 text-center">
                        <p>Select <span className="text-emerald-400 font-semibold">Terminal</span> mode and press <kbd className="px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] text-xs">Ctrl+Enter</kbd></p>
                        <p className="mt-1">A sandboxed Docker container will start with your code.</p>
                        <p className="mt-1">Type input in the box below when the program requests it.</p>
                      </div>
                    )}
                    {terminalLines.map((line, idx) => (
                      <div key={idx} className="leading-snug whitespace-pre-wrap break-all">
                        {line.type === 'input' && (
                          <span className="text-cyan-300" style={{ opacity: 0.85 }}>
                            <span className="text-[#484f58] mr-1">›</span>{line.text}
                          </span>
                        )}
                        {line.type === 'system' && (
                          <span className="text-[#484f58] text-xs">{line.text}</span>
                        )}
                        {line.type === 'output' && (
                          <span className="text-green-200">{line.text}</span>
                        )}
                      </div>
                    ))}
                    {(terminalStatus === 'connecting' || terminalStatus === 'running') && (
                      <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5 align-bottom" style={{ marginBottom: 1 }} />
                    )}
                  </div>

                  {/* Interactive stdin input bar */}
                  <div className="border-t border-[#21262d] px-3 py-2 flex items-center gap-2 shrink-0 bg-[#020409]">
                    <span className="text-emerald-400 font-mono text-sm font-bold shrink-0">›</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={e => setTerminalInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleTerminalSendInput(); }}
                      placeholder={terminalStatus === 'running' ? 'Type input and press Enter…' : 'Waiting for session to start…'}
                      disabled={terminalStatus !== 'running'}
                      className="flex-1 bg-transparent border-0 outline-none text-sm font-mono text-[#e6edf3] placeholder-[#484f58] disabled:opacity-40"
                      style={{ fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",Consolas,monospace' }}
                      autoFocus={terminalStatus === 'running'}
                    />
                    <button
                      onClick={handleTerminalSendInput}
                      disabled={terminalStatus !== 'running' || !terminalInput.trim()}
                      className="px-2 py-1 rounded text-xs bg-emerald-700 text-white disabled:opacity-30 hover:bg-emerald-600 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* preview */}
              {outputTab === 'preview' && (
                <div className="h-full flex flex-col items-center bg-[#161b22]">
                  {htmlPreviewSrc
                    ? (
                      <div className="flex-1 flex items-start justify-center w-full overflow-auto py-2">
                        <iframe
                          src={htmlPreviewSrc}
                          sandbox="allow-scripts allow-same-origin"
                          title="Preview"
                          className="bg-white border-0 transition-all"
                          style={{ width: previewWidths[previewSize], height: '100%', minHeight: 300, maxWidth: '100%' }}
                        />
                      </div>
                    )
                    : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#484f58]">
                        <Eye className="w-10 h-10" />
                        <p className="text-sm">Click <strong className="text-[#8b949e]">Preview</strong> to render</p>
                        {autoPreview && <p className="text-xs text-violet-400">Auto-preview is on — changes render automatically</p>}
                      </div>
                    )
                  }
                </div>
              )}

              {/* console (browser-mode) */}
              {outputTab === 'console' && (
                <div className="h-full flex flex-col bg-[#0d1117]">
                  <div className="flex items-center justify-between px-3 py-1 border-b border-[#21262d]">
                    <span className="text-xs text-[#8b949e]">Virtual console ({consoleLogs.length} messages)</span>
                    <button onClick={() => setConsoleLogs([])} className="text-[#8b949e] hover:text-red-400 text-xs flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-2 space-y-0.5 font-mono text-xs">
                    {consoleLogs.length === 0 && <p className="text-[#484f58] p-2">No console output. Click Preview to run.</p>}
                    {consoleLogs.map((log, i) => (
                      <div key={i} className={`flex items-start gap-2 px-2 py-1 rounded ${
                        log.level === 'error' ? 'bg-red-900/20 text-red-300' :
                        log.level === 'warn'  ? 'bg-yellow-900/20 text-yellow-300' :
                        'text-[#e6edf3]'
                      }`}>
                        <span className={`shrink-0 text-[10px] font-bold w-8 mt-0.5 ${
                          log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-green-400'
                        }`}>{log.level.toUpperCase()}</span>
                        <span className="whitespace-pre-wrap break-all">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* tests */}
              {outputTab === 'tests' && (
                <div className="h-full flex flex-col bg-[#0d1117]">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#21262d] shrink-0">
                    <span className="text-xs text-[#8b949e] font-semibold">
                      Test Cases
                      {testCases.some(t => t.result) && (
                        <span className={`ml-2 font-bold ${passedTests === testCases.length ? 'text-green-400' : 'text-red-400'}`}>
                          {passedTests}/{testCases.length} passed
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={addTestCase} className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
                      <Button
                        size="sm"
                        className="h-6 text-xs gap-1"
                        style={{ background: batchRunning ? '#21262d' : '#7c3aed', color: 'white' }}
                        onClick={runAllTests}
                        disabled={batchRunning || isClientSide}
                      >
                        {batchRunning ? <><Loader2 className="w-3 h-3 animate-spin" />Running…</> : <><FlaskConical className="w-3 h-3" />Run All</>}
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-3 space-y-3">
                    {testCases.map((tc, idx) => (
                      <div key={tc.id} className="rounded-lg border border-[#21262d] bg-[#161b22] overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d1117] border-b border-[#21262d]">
                          <div className="flex items-center gap-2">
                            {tc.result && (
                              tc.result.passed
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                : <XCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <Input
                              value={tc.name}
                              onChange={e => updateTestCase(tc.id, 'name', e.target.value)}
                              className="h-5 w-28 text-xs bg-transparent border-0 px-0 font-semibold text-white focus-visible:ring-0"
                            />
                            {tc.result && <span className="text-[10px] text-[#484f58]">{tc.result.time}ms</span>}
                          </div>
                          <button onClick={() => removeTestCase(tc.id)} className="text-[#484f58] hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                          <div className="p-2 border-r border-[#21262d]">
                            <div className="text-[10px] text-[#484f58] mb-1">Input (stdin)</div>
                            <Textarea value={tc.input} onChange={e => updateTestCase(tc.id, 'input', e.target.value)} rows={2} className="text-xs font-mono bg-[#0d1117] border-[#30363d] text-[#e6edf3] resize-none" placeholder="Leave empty for no stdin" />
                          </div>
                          <div className="p-2 border-r border-[#21262d]">
                            <div className="text-[10px] text-[#484f58] mb-1">Expected output</div>
                            <Textarea value={tc.expected} onChange={e => updateTestCase(tc.id, 'expected', e.target.value)} rows={2} className="text-xs font-mono bg-[#0d1117] border-[#30363d] text-[#e6edf3] resize-none" placeholder="Expected stdout" />
                          </div>
                          <div className="p-2">
                            <div className="text-[10px] text-[#484f58] mb-1">Actual output</div>
                            <pre className={`text-xs font-mono whitespace-pre-wrap break-all min-h-[3rem] ${tc.result ? (tc.result.passed ? 'text-green-300' : 'text-red-300') : 'text-[#484f58]'}`}>
                              {tc.result ? (tc.result.actual || '(empty)') : '—'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* info */}
              {outputTab === 'info' && (
                <div className="h-full p-4 overflow-auto">
                  {pistonResult ? (
                    <div className="space-y-3 text-sm">
                      {([
                        ['Engine',    <span className="text-violet-300 font-semibold">Piston</span>],
                        ['Language',  <span className="capitalize text-white">{pistonResult.language}</span>],
                        ['Version',   <span className="font-mono text-white">{pistonResult.version}</span>],
                        ['Exit Code', <span className={`font-mono font-bold ${pistonResult.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>{pistonResult.exitCode}</span>],
                        ['Rate Limit Remaining', <span className="font-mono text-white">{pistonResult.rateLimitRemaining ?? 'N/A'}</span>],
                      ] as [string, React.ReactNode][]).map(([label, value]) => (
                        <div key={label} className="flex items-start">
                          <span className="text-[#8b949e] w-36 shrink-0 text-xs">{label}</span>
                          <span className="text-xs">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : currentSubmission ? (
                    <div className="space-y-3 text-sm">
                      {([
                        ['Language',       <span className="capitalize text-white">{currentSubmission.language}</span>],
                        ['Status',         <span className={`font-semibold ${currentSubmission.status === 'COMPLETED' && currentSubmission.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>{currentSubmission.status}</span>],
                        ['Exit Code',      <span className={`font-mono font-bold ${currentSubmission.exitCode === 0 ? 'text-green-400' : currentSubmission.exitCode != null ? 'text-red-400' : 'text-[#8b949e]'}`}>{currentSubmission.exitCode ?? 'N/A'}</span>],
                        ['Execution Time', <span className="font-mono text-white">{currentSubmission.executionTimeMs != null ? `${currentSubmission.executionTimeMs} ms` : 'N/A'}</span>],
                        ['Memory Used',    <span className="font-mono text-white">{currentSubmission.memoryUsedKb != null ? `${Math.round(currentSubmission.memoryUsedKb / 1024)} MB` : 'N/A'}</span>],
                        ['Submitted',      <span className="text-[#8b949e]">{new Date(currentSubmission.createdAt ?? '').toLocaleString()}</span>],
                      ] as [string, React.ReactNode][]).map(([label, value]) => (
                        <div key={label} className="flex items-start">
                          <span className="text-[#8b949e] w-36 shrink-0 text-xs">{label}</span>
                          <span className="text-xs">{value}</span>
                        </div>
                      ))}
                      {currentSubmission.status === 'TIMEOUT' && (
                        <div className="mt-4 p-3 rounded-lg border border-orange-800 bg-orange-900/20 text-orange-300 text-xs">
                          Execution timed out. Check for infinite loops.
                        </div>
                      )}
                      {needsStdin && !stdin.trim() && (
                        <div className="mt-4 p-3 rounded-lg border border-orange-800 bg-orange-900/20 text-orange-300 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          Code reads stdin but no input was provided. Open the Stdin panel and enter values.
                        </div>
                      )}
                    </div>
                  ) : isClientSide ? (
                    <div className="space-y-3 text-xs text-[#8b949e]">
                      <p className="font-semibold text-white">About this mode: <span className="capitalize text-violet-400">{langInfo.label}</span></p>
                      {isReact && <p>Uses <strong className="text-white">Babel Standalone + React 18 CDN</strong>. Write JSX directly — it transpiles in the browser.</p>}
                      {isBrowserJs && <p>Runs in a sandboxed iframe with console capture. All browser APIs available.</p>}
                      {isCss && <p>CSS is applied to a sample HTML page in the preview.</p>}
                      {isHtml && <p>Full HTML document rendered in a sandboxed iframe.</p>}
                      <p className="text-[#484f58]">No server request is made — execution is entirely client-side.</p>
                    </div>
                  ) : (
                    <p className="text-[#484f58] text-sm">Run your code to see execution details.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ STATUS BAR ═══════════════════════════════════════════════════════ */}
      {!zenMode && (
        <div className="flex items-center justify-between px-4 py-1 bg-[#010409] border-t border-[#21262d] text-[10px] text-[#484f58] shrink-0 flex-wrap gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: langInfo?.color ?? '#fff' }} />
              {langInfo?.label ?? language}
              {isClientSide && <span className="text-emerald-500 ml-0.5">· client-side</span>}
            </span>
            {!isClientSide && (
              <span className={`font-semibold ${engineMode === 'piston' ? 'text-violet-400' : engineMode === 'judge0' ? 'text-blue-400' : 'text-emerald-400'}`}>
                {engineMode === 'piston' ? '⚡ Piston' : engineMode === 'judge0' ? '⚖ Judge0' : '⬛ Interactive'}
              </span>
            )}
            <span>UTF-8</span>
            <span>Spaces: 4</span>
            <span>{fontSize}px</span>
            {needsStdin && !isClientSide && engineMode !== 'interactive' && <span className="text-orange-400">⚠ stdin required</span>}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {pistonResult?.exitCode != null && (
              <span className={`flex items-center gap-1 ${pistonResult.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>
                exit {pistonResult.exitCode} · {pistonResult.language} {pistonResult.version}
              </span>
            )}
            {currentSubmission?.executionTimeMs != null && (
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />{currentSubmission.executionTimeMs}ms
              </span>
            )}
            {currentSubmission?.memoryUsedKb != null && (
              <span className="flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" />{Math.round(currentSubmission.memoryUsedKb / 1024)}MB
              </span>
            )}
            {queueStatus && (
              <span className={`flex items-center gap-1 ${serverLoad >= 80 ? 'text-red-400' : serverLoad >= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                Server load: {serverLoad}%
              </span>
            )}
            {terminalStatus === 'running' && (
              <span className="text-emerald-400 animate-pulse">● Container running</span>
            )}
          </div>
        </div>
      )}

      {/* ══ ZEN MODE EXIT ═══════════════════════════════════════════════════ */}
      {zenMode && (
        <button
          onClick={() => setZenMode(false)}
          className="fixed top-3 right-3 z-50 p-2 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors"
          title="Exit zen mode (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* ══ JOIN DIALOG ══════════════════════════════════════════════════════ */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-[#161b22] border-[#30363d] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Join Live Session</DialogTitle>
            <DialogDescription className="text-[#8b949e]">Enter the session code from your collaborator.</DialogDescription>
          </DialogHeader>
          <Input
            value={joinSessionId}
            onChange={e => setJoinSessionId(e.target.value)}
            placeholder="Session code…"
            className="bg-[#0d1117] border-[#30363d] text-white"
            onKeyDown={e => e.key === 'Enter' && handleJoinSession()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinDialogOpen(false)} className="border-[#30363d] text-[#8b949e]">Cancel</Button>
            <Button onClick={handleJoinSession} style={{ background: '#7c3aed' }}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
