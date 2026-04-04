import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

// ──────────────────────────────────────────────────
// SearchableSelect — single-value autocomplete with free text
// ──────────────────────────────────────────────────
interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  maxResults?: number;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  allowCustom = true,
  maxResults = 30,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options.slice(0, maxResults);
    const q = query.toLowerCase();
    return options
      .filter((opt) => opt.toLowerCase().includes(q))
      .slice(0, maxResults);
  }, [options, query, maxResults]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustom && query.trim() ? (
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(query.trim());
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  Use "{query.trim()}"
                </button>
              ) : (
                'No results found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ──────────────────────────────────────────────────
// MultiSelectSearch — multi-value select with search + badges
// ──────────────────────────────────────────────────
interface MultiSelectSearchProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  maxResults?: number;
}

export function MultiSelectSearch({
  options,
  selected,
  onChange,
  placeholder = 'Search and select...',
  allowCustom = true,
  maxResults = 30,
}: MultiSelectSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options.slice(0, maxResults);
    const q = query.toLowerCase();
    return options
      .filter((opt) => opt.toLowerCase().includes(q))
      .slice(0, maxResults);
  }, [options, query, maxResults]);

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const addCustom = () => {
    const trimmed = query.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setQuery('');
    }
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20 pr-1"
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="ml-1 rounded-full outline-none hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal h-10"
          >
            <span className="text-muted-foreground truncate">
              {selected.length > 0
                ? `${selected.length} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {allowCustom && query.trim() ? (
                  <button
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addCustom();
                    }}
                  >
                    Add "{query.trim()}"
                  </button>
                ) : (
                  'No results found.'
                )}
              </CommandEmpty>
              <CommandGroup>
                {filtered.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => toggle(option)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selected.includes(option) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ──────────────────────────────────────────────────
// InstitutionSearch — institution-specific autocomplete with abbreviation + level filter
// ──────────────────────────────────────────────────
interface InstitutionOption {
  name: string;
  abbreviation?: string;
  country: string;
  levels: string[];
}

interface InstitutionSearchProps {
  institutions: InstitutionOption[];
  value: string;
  onChange: (value: string) => void;
  educationLevel?: string;
  placeholder?: string;
}

export function InstitutionSearch({
  institutions,
  value,
  onChange,
  educationLevel,
  placeholder = 'Search institution...',
}: InstitutionSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return institutions
      .filter((inst) => {
        if (educationLevel && educationLevel !== 'other') {
          if (!inst.levels.includes(educationLevel)) return false;
        }
        const nameMatch = inst.name.toLowerCase().includes(q);
        const abbrMatch = inst.abbreviation?.toLowerCase().includes(q);
        const countryMatch = inst.country.toLowerCase().includes(q);
        return nameMatch || abbrMatch || countryMatch;
      })
      .slice(0, 20);
  }, [institutions, query, educationLevel]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {query.trim() ? (
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(query.trim());
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  Use "{query.trim()}" (custom)
                </button>
              ) : (
                'Start typing to search institutions...'
              )}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((inst) => (
                <CommandItem
                  key={`${inst.name}-${inst.country}`}
                  value={inst.name}
                  onSelect={() => {
                    onChange(inst.name);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      value === inst.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">
                      {inst.name}
                      {inst.abbreviation && (
                        <span className="text-muted-foreground ml-1">
                          ({inst.abbreviation})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {inst.country}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ──────────────────────────────────────────────────
// SuggestTextarea — textarea with autocomplete suggestions
// ──────────────────────────────────────────────────
interface SuggestTextareaProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SuggestTextarea({
  suggestions,
  value,
  onChange,
  placeholder,
  className,
}: SuggestTextareaProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filtered, setFiltered] = React.useState<string[]>([]);

  const handleInput = (text: string) => {
    onChange(text);
    if (text.length > 5) {
      const words = text.toLowerCase().split(/\s+/);
      const lastWords = words.slice(-3).join(' ');
      const matches = suggestions.filter((s) =>
        s.toLowerCase().includes(lastWords)
      );
      setFiltered(matches.slice(0, 5));
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={placeholder}
        onFocus={() => {
          if (!value && suggestions.length > 0) {
            setFiltered(suggestions.slice(0, 5));
            setShowSuggestions(true);
          }
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
          {filtered.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent truncate"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
