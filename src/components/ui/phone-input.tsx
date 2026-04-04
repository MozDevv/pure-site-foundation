import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, Phone } from 'lucide-react';

// ── Country data with dial codes and flags ──
interface CountryEntry {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dial: string; // e.g. "+254"
  flag: string; // emoji flag
  format?: string; // placeholder format e.g. "7XX XXX XXX"
}

const COUNTRY_DATA: CountryEntry[] = [
  // Africa
  { name: 'Kenya', code: 'KE', dial: '+254', flag: '🇰🇪', format: '7XX XXX XXX' },
  { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬', format: '8XX XXX XXXX' },
  { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦', format: '6X XXX XXXX' },
  { name: 'Tanzania', code: 'TZ', dial: '+255', flag: '🇹🇿', format: '7XX XXX XXX' },
  { name: 'Uganda', code: 'UG', dial: '+256', flag: '🇺🇬', format: '7XX XXX XXX' },
  { name: 'Ethiopia', code: 'ET', dial: '+251', flag: '🇪🇹', format: '9XX XXX XXX' },
  { name: 'Ghana', code: 'GH', dial: '+233', flag: '🇬🇭', format: '2X XXX XXXX' },
  { name: 'Rwanda', code: 'RW', dial: '+250', flag: '🇷🇼', format: '7XX XXX XXX' },
  { name: 'Cameroon', code: 'CM', dial: '+237', flag: '🇨🇲', format: '6XX XX XX XX' },
  { name: 'Egypt', code: 'EG', dial: '+20', flag: '🇪🇬', format: '1X XXXX XXXX' },
  { name: 'Morocco', code: 'MA', dial: '+212', flag: '🇲🇦', format: '6XX XXX XXX' },
  { name: 'Senegal', code: 'SN', dial: '+221', flag: '🇸🇳', format: '7X XXX XX XX' },
  { name: 'Ivory Coast', code: 'CI', dial: '+225', flag: '🇨🇮', format: 'XX XX XX XX XX' },
  { name: 'Mozambique', code: 'MZ', dial: '+258', flag: '🇲🇿', format: '8X XXX XXXX' },
  { name: 'Zambia', code: 'ZM', dial: '+260', flag: '🇿🇲', format: '9XX XXX XXX' },
  { name: 'Zimbabwe', code: 'ZW', dial: '+263', flag: '🇿🇼', format: '7X XXX XXXX' },
  { name: 'Malawi', code: 'MW', dial: '+265', flag: '🇲🇼', format: '9XX XX XX XX' },
  { name: 'Botswana', code: 'BW', dial: '+267', flag: '🇧🇼', format: '7X XXX XXX' },
  { name: 'Madagascar', code: 'MG', dial: '+261', flag: '🇲🇬', format: '3X XX XXX XX' },
  { name: 'Somalia', code: 'SO', dial: '+252', flag: '🇸🇴', format: '6X XXX XXXX' },
  { name: 'Congo (DRC)', code: 'CD', dial: '+243', flag: '🇨🇩', format: '9XX XXX XXX' },
  { name: 'Sudan', code: 'SD', dial: '+249', flag: '🇸🇩', format: '9XX XXX XXX' },
  { name: 'South Sudan', code: 'SS', dial: '+211', flag: '🇸🇸', format: '9XX XXX XXX' },
  { name: 'Algeria', code: 'DZ', dial: '+213', flag: '🇩🇿', format: '5XX XX XX XX' },
  { name: 'Tunisia', code: 'TN', dial: '+216', flag: '🇹🇳', format: 'XX XXX XXX' },
  { name: 'Libya', code: 'LY', dial: '+218', flag: '🇱🇾', format: '9X XXX XXXX' },
  { name: 'Sierra Leone', code: 'SL', dial: '+232', flag: '🇸🇱', format: '7X XXX XXX' },
  { name: 'Namibia', code: 'NA', dial: '+264', flag: '🇳🇦', format: '8X XXX XXXX' },
  // Americas
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸', format: 'XXX XXX XXXX' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦', format: 'XXX XXX XXXX' },
  { name: 'Mexico', code: 'MX', dial: '+52', flag: '🇲🇽', format: 'XX XXXX XXXX' },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷', format: 'XX XXXXX XXXX' },
  { name: 'Argentina', code: 'AR', dial: '+54', flag: '🇦🇷', format: '9XX XXXX XXXX' },
  { name: 'Colombia', code: 'CO', dial: '+57', flag: '🇨🇴', format: '3XX XXX XXXX' },
  { name: 'Jamaica', code: 'JM', dial: '+1876', flag: '🇯🇲', format: 'XXX XXXX' },
  // Europe
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧', format: '7XXX XXX XXX' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪', format: '1XX XXXXXXX' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷', format: '6 XX XX XX XX' },
  { name: 'Italy', code: 'IT', dial: '+39', flag: '🇮🇹', format: '3XX XXX XXXX' },
  { name: 'Spain', code: 'ES', dial: '+34', flag: '🇪🇸', format: '6XX XX XX XX' },
  { name: 'Netherlands', code: 'NL', dial: '+31', flag: '🇳🇱', format: '6 XXXX XXXX' },
  { name: 'Sweden', code: 'SE', dial: '+46', flag: '🇸🇪', format: '7X XXX XX XX' },
  { name: 'Norway', code: 'NO', dial: '+47', flag: '🇳🇴', format: 'XXX XX XXX' },
  { name: 'Denmark', code: 'DK', dial: '+45', flag: '🇩🇰', format: 'XX XX XX XX' },
  { name: 'Switzerland', code: 'CH', dial: '+41', flag: '🇨🇭', format: '7X XXX XX XX' },
  { name: 'Portugal', code: 'PT', dial: '+351', flag: '🇵🇹', format: '9XX XXX XXX' },
  { name: 'Poland', code: 'PL', dial: '+48', flag: '🇵🇱', format: 'XXX XXX XXX' },
  { name: 'Ireland', code: 'IE', dial: '+353', flag: '🇮🇪', format: '8X XXX XXXX' },
  { name: 'Belgium', code: 'BE', dial: '+32', flag: '🇧🇪', format: '4XX XX XX XX' },
  { name: 'Austria', code: 'AT', dial: '+43', flag: '🇦🇹', format: '6XX XXX XXXX' },
  { name: 'Finland', code: 'FI', dial: '+358', flag: '🇫🇮', format: '4X XXX XXXX' },
  { name: 'Czech Republic', code: 'CZ', dial: '+420', flag: '🇨🇿', format: 'XXX XXX XXX' },
  { name: 'Greece', code: 'GR', dial: '+30', flag: '🇬🇷', format: '6XX XXX XXXX' },
  { name: 'Romania', code: 'RO', dial: '+40', flag: '🇷🇴', format: '7XX XXX XXX' },
  { name: 'Turkey', code: 'TR', dial: '+90', flag: '🇹🇷', format: '5XX XXX XX XX' },
  { name: 'Russia', code: 'RU', dial: '+7', flag: '🇷🇺', format: '9XX XXX XX XX' },
  // Asia & Middle East
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳', format: '9XXX XXX XXX' },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳', format: '1XX XXXX XXXX' },
  { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵', format: '90 XXXX XXXX' },
  { name: 'South Korea', code: 'KR', dial: '+82', flag: '🇰🇷', format: '10 XXXX XXXX' },
  { name: 'Indonesia', code: 'ID', dial: '+62', flag: '🇮🇩', format: '8XX XXX XXXX' },
  { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭', format: '9XX XXX XXXX' },
  { name: 'Pakistan', code: 'PK', dial: '+92', flag: '🇵🇰', format: '3XX XXX XXXX' },
  { name: 'Bangladesh', code: 'BD', dial: '+880', flag: '🇧🇩', format: '1XXX XXXXXX' },
  { name: 'Thailand', code: 'TH', dial: '+66', flag: '🇹🇭', format: '8X XXX XXXX' },
  { name: 'Vietnam', code: 'VN', dial: '+84', flag: '🇻🇳', format: '9XX XXX XXX' },
  { name: 'Malaysia', code: 'MY', dial: '+60', flag: '🇲🇾', format: '1X XXXX XXXX' },
  { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬', format: '8XXX XXXX' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦', format: '5X XXX XXXX' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪', format: '5X XXX XXXX' },
  { name: 'Qatar', code: 'QA', dial: '+974', flag: '🇶🇦', format: 'XXXX XXXX' },
  { name: 'Israel', code: 'IL', dial: '+972', flag: '🇮🇱', format: '5X XXX XXXX' },
  { name: 'Jordan', code: 'JO', dial: '+962', flag: '🇯🇴', format: '7X XXX XXXX' },
  { name: 'Lebanon', code: 'LB', dial: '+961', flag: '🇱🇧', format: '7X XXX XXX' },
  { name: 'Iraq', code: 'IQ', dial: '+964', flag: '🇮🇶', format: '7XX XXX XXXX' },
  { name: 'Iran', code: 'IR', dial: '+98', flag: '🇮🇷', format: '9XX XXX XXXX' },
  // Oceania
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺', format: '4XX XXX XXX' },
  { name: 'New Zealand', code: 'NZ', dial: '+64', flag: '🇳🇿', format: '2X XXX XXXX' },
];

// ── Utility: parse an existing phone value to detect country ──
function detectCountryFromValue(value: string): CountryEntry | null {
  if (!value) return null;
  const cleaned = value.replace(/[\s()-]/g, '');
  if (!cleaned.startsWith('+')) return null;
  // Sort by dial code length (longest first) for best match
  const sorted = [...COUNTRY_DATA].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (cleaned.startsWith(c.dial)) return c;
  }
  return null;
}

function extractLocalNumber(value: string, country: CountryEntry): string {
  if (!value) return '';
  const cleaned = value.replace(/[\s()-]/g, '');
  if (cleaned.startsWith(country.dial)) {
    return cleaned.slice(country.dial.length);
  }
  if (cleaned.startsWith('+')) {
    // Different country prefix — just strip the +
    const detected = detectCountryFromValue(cleaned);
    if (detected) return cleaned.slice(detected.dial.length);
    return cleaned.replace(/^\+\d{1,4}/, '');
  }
  // Local number — strip leading 0
  if (cleaned.startsWith('0')) return cleaned.slice(1);
  return cleaned;
}

// ── Props ──
interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  defaultCountry?: string; // ISO code e.g. "KE"
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'KE',
  placeholder,
  disabled = false,
  className,
  error = false,
}: PhoneInputProps) {
  const defaultEntry = COUNTRY_DATA.find(c => c.code === defaultCountry) || COUNTRY_DATA[0];
  
  const [selectedCountry, setSelectedCountry] = useState<CountryEntry>(() => {
    if (value) {
      const detected = detectCountryFromValue(value);
      if (detected) return detected;
    }
    return defaultEntry;
  });
  
  const [localNumber, setLocalNumber] = useState(() => extractLocalNumber(value, selectedCountry));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync from external value changes
  useEffect(() => {
    if (value) {
      const detected = detectCountryFromValue(value);
      if (detected && detected.code !== selectedCountry.code) {
        setSelectedCountry(detected);
      }
      const local = extractLocalNumber(value, detected || selectedCountry);
      if (local !== localNumber) {
        setLocalNumber(local);
      }
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search on dropdown open
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRY_DATA;
    const s = search.toLowerCase();
    return COUNTRY_DATA.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.dial.includes(s) ||
      c.code.toLowerCase().includes(s)
    );
  }, [search]);

  const handleLocalNumberChange = useCallback((raw: string) => {
    // Strip non-digit characters except leading + for paste
    let digits = raw.replace(/[^\d]/g, '');
    setLocalNumber(digits);
    onChange(`${selectedCountry.dial}${digits}`);
  }, [selectedCountry, onChange]);

  const handleCountrySelect = useCallback((country: CountryEntry) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearch('');
    // Re-emit with new country code
    onChange(`${country.dial}${localNumber}`);
    phoneInputRef.current?.focus();
  }, [localNumber, onChange]);

  // Handle paste of full international numbers
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted.startsWith('+') || pasted.startsWith('00')) {
      e.preventDefault();
      const normalized = pasted.replace(/^00/, '+');
      const detected = detectCountryFromValue(normalized);
      if (detected) {
        setSelectedCountry(detected);
        const local = extractLocalNumber(normalized, detected);
        setLocalNumber(local);
        onChange(`${detected.dial}${local}`);
      } else {
        // Just use the digits
        const digits = normalized.replace(/[^\d]/g, '');
        setLocalNumber(digits);
        onChange(`${selectedCountry.dial}${digits}`);
      }
    }
  }, [selectedCountry, onChange]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className={cn(
        'flex items-center border rounded-md transition-colors',
        error ? 'border-destructive' : 'border-input',
        disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
        'bg-background'
      )}>
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1 px-2 py-2 h-10 border-r border-input',
            'hover:bg-accent rounded-l-md transition-colors text-sm shrink-0',
            disabled && 'cursor-not-allowed'
          )}
          aria-label={`Selected country: ${selectedCountry.name} (${selectedCountry.dial})`}
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-xs text-muted-foreground">{selectedCountry.dial}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Phone number input */}
        <div className="flex items-center flex-1 px-2">
          <Phone className="h-4 w-4 text-muted-foreground mr-1.5 shrink-0" />
          <input
            ref={phoneInputRef}
            type="tel"
            inputMode="numeric"
            value={localNumber}
            onChange={e => handleLocalNumberChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder || selectedCountry.format || 'Phone number'}
            disabled={disabled}
            className="w-full bg-transparent border-none outline-none text-sm h-10 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>
          {/* List */}
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">No countries found</div>
            ) : (
              filteredCountries.map(c => (
                <button
                  key={`${c.code}-${c.dial}`}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left',
                    c.code === selectedCountry.code && c.dial === selectedCountry.dial && 'bg-accent/50 font-medium'
                  )}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Normalize a phone number string for submission to the server.
 * Accepts local (0712...) or international (+254712...) formats.
 * Returns the full international format string.
 */
export function normalizePhoneNumber(value: string, defaultDialCode = '+254'): string {
  if (!value) return '';
  let cleaned = value.replace(/[\s()-]/g, '');
  // Already international
  if (cleaned.startsWith('+')) return cleaned;
  // 00-prefixed international
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  // Local number with leading 0
  if (cleaned.startsWith('0')) return defaultDialCode + cleaned.slice(1);
  // Just digits — prepend default
  return defaultDialCode + cleaned;
}

/**
 * Validate a phone number (accepts both local and international).
 * Returns true if the number has between 7 and 15 digits (E.164 range).
 */
export function isValidPhoneNumber(value: string): boolean {
  if (!value) return false;
  const digits = value.replace(/[^\d]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export { COUNTRY_DATA, type CountryEntry };
