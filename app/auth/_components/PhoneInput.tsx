"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

export type Country = {
  name: string;
  code: string; // ISO 2-letter code
  dialCode: string; // e.g. "+234"
};

export const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "AF", dialCode: "+93" },
  { name: "Albania", code: "AL", dialCode: "+355" },
  { name: "Algeria", code: "DZ", dialCode: "+213" },
  { name: "Andorra", code: "AD", dialCode: "+376" },
  { name: "Angola", code: "AO", dialCode: "+244" },
  { name: "Argentina", code: "AR", dialCode: "+54" },
  { name: "Armenia", code: "AM", dialCode: "+374" },
  { name: "Australia", code: "AU", dialCode: "+61" },
  { name: "Austria", code: "AT", dialCode: "+43" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994" },
  { name: "Bahamas", code: "BS", dialCode: "+1242" },
  { name: "Bahrain", code: "BH", dialCode: "+973" },
  { name: "Bangladesh", code: "BD", dialCode: "+880" },
  { name: "Barbados", code: "BB", dialCode: "+1246" },
  { name: "Belarus", code: "BY", dialCode: "+375" },
  { name: "Belgium", code: "BE", dialCode: "+32" },
  { name: "Belize", code: "BZ", dialCode: "+501" },
  { name: "Benin", code: "BJ", dialCode: "+229" },
  { name: "Bhutan", code: "BT", dialCode: "+975" },
  { name: "Bolivia", code: "BO", dialCode: "+591" },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387" },
  { name: "Botswana", code: "BW", dialCode: "+267" },
  { name: "Brazil", code: "BR", dialCode: "+55" },
  { name: "Brunei", code: "BN", dialCode: "+673" },
  { name: "Bulgaria", code: "BG", dialCode: "+359" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226" },
  { name: "Burundi", code: "BI", dialCode: "+257" },
  { name: "Cambodia", code: "KH", dialCode: "+855" },
  { name: "Cameroon", code: "CM", dialCode: "+237" },
  { name: "Canada", code: "CA", dialCode: "+1" },
  { name: "Cape Verde", code: "CV", dialCode: "+238" },
  { name: "Central African Republic", code: "CF", dialCode: "+236" },
  { name: "Chad", code: "TD", dialCode: "+235" },
  { name: "Chile", code: "CL", dialCode: "+56" },
  { name: "China", code: "CN", dialCode: "+86" },
  { name: "Colombia", code: "CO", dialCode: "+57" },
  { name: "Comoros", code: "KM", dialCode: "+269" },
  { name: "Congo", code: "CG", dialCode: "+242" },
  { name: "Costa Rica", code: "CR", dialCode: "+506" },
  { name: "Croatia", code: "HR", dialCode: "+385" },
  { name: "Cuba", code: "CU", dialCode: "+53" },
  { name: "Cyprus", code: "CY", dialCode: "+357" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420" },
  { name: "Democratic Republic of the Congo", code: "CD", dialCode: "+243" },
  { name: "Denmark", code: "DK", dialCode: "+45" },
  { name: "Djibouti", code: "DJ", dialCode: "+253" },
  { name: "Dominica", code: "DM", dialCode: "+1767" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1809" },
  { name: "Ecuador", code: "EC", dialCode: "+593" },
  { name: "Egypt", code: "EG", dialCode: "+20" },
  { name: "El Salvador", code: "SV", dialCode: "+503" },
  { name: "Equatorial Guinea", code: "GQ", dialCode: "+240" },
  { name: "Eritrea", code: "ER", dialCode: "+291" },
  { name: "Estonia", code: "EE", dialCode: "+372" },
  { name: "Eswatini", code: "SZ", dialCode: "+268" },
  { name: "Ethiopia", code: "ET", dialCode: "+251" },
  { name: "Fiji", code: "FJ", dialCode: "+679" },
  { name: "Finland", code: "FI", dialCode: "+358" },
  { name: "France", code: "FR", dialCode: "+33" },
  { name: "Gabon", code: "GA", dialCode: "+241" },
  { name: "Gambia", code: "GM", dialCode: "+220" },
  { name: "Georgia", code: "GE", dialCode: "+995" },
  { name: "Germany", code: "DE", dialCode: "+49" },
  { name: "Ghana", code: "GH", dialCode: "+233" },
  { name: "Greece", code: "GR", dialCode: "+30" },
  { name: "Grenada", code: "GD", dialCode: "+1473" },
  { name: "Guatemala", code: "GT", dialCode: "+502" },
  { name: "Guinea", code: "GN", dialCode: "+224" },
  { name: "Guinea-Bissau", code: "GW", dialCode: "+245" },
  { name: "Guyana", code: "GY", dialCode: "+592" },
  { name: "Haiti", code: "HT", dialCode: "+509" },
  { name: "Honduras", code: "HN", dialCode: "+504" },
  { name: "Hong Kong", code: "HK", dialCode: "+852" },
  { name: "Hungary", code: "HU", dialCode: "+36" },
  { name: "Iceland", code: "IS", dialCode: "+354" },
  { name: "India", code: "IN", dialCode: "+91" },
  { name: "Indonesia", code: "ID", dialCode: "+62" },
  { name: "Iran", code: "IR", dialCode: "+98" },
  { name: "Iraq", code: "IQ", dialCode: "+964" },
  { name: "Ireland", code: "IE", dialCode: "+353" },
  { name: "Israel", code: "IL", dialCode: "+972" },
  { name: "Italy", code: "IT", dialCode: "+39" },
  { name: "Ivory Coast", code: "CI", dialCode: "+225" },
  { name: "Jamaica", code: "JM", dialCode: "+1876" },
  { name: "Japan", code: "JP", dialCode: "+81" },
  { name: "Jordan", code: "JO", dialCode: "+962" },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7" },
  { name: "Kenya", code: "KE", dialCode: "+254" },
  { name: "Kiribati", code: "KI", dialCode: "+686" },
  { name: "Kuwait", code: "KW", dialCode: "+965" },
  { name: "Kyrgyzstan", code: "KG", dialCode: "+996" },
  { name: "Laos", code: "LA", dialCode: "+856" },
  { name: "Latvia", code: "LV", dialCode: "+371" },
  { name: "Lebanon", code: "LB", dialCode: "+961" },
  { name: "Lesotho", code: "LS", dialCode: "+266" },
  { name: "Liberia", code: "LR", dialCode: "+231" },
  { name: "Libya", code: "LY", dialCode: "+218" },
  { name: "Liechtenstein", code: "LI", dialCode: "+423" },
  { name: "Lithuania", code: "LT", dialCode: "+370" },
  { name: "Luxembourg", code: "LU", dialCode: "+352" },
  { name: "Macao", code: "MO", dialCode: "+853" },
  { name: "Madagascar", code: "MG", dialCode: "+261" },
  { name: "Malawi", code: "MW", dialCode: "+265" },
  { name: "Malaysia", code: "MY", dialCode: "+60" },
  { name: "Maldives", code: "MV", dialCode: "+960" },
  { name: "Mali", code: "ML", dialCode: "+223" },
  { name: "Malta", code: "MT", dialCode: "+356" },
  { name: "Mauritania", code: "MR", dialCode: "+222" },
  { name: "Mauritius", code: "MU", dialCode: "+230" },
  { name: "Mexico", code: "MX", dialCode: "+52" },
  { name: "Moldova", code: "MD", dialCode: "+373" },
  { name: "Monaco", code: "MC", dialCode: "+377" },
  { name: "Mongolia", code: "MN", dialCode: "+976" },
  { name: "Montenegro", code: "ME", dialCode: "+382" },
  { name: "Morocco", code: "MA", dialCode: "+212" },
  { name: "Mozambique", code: "MZ", dialCode: "+258" },
  { name: "Myanmar", code: "MM", dialCode: "+95" },
  { name: "Namibia", code: "NA", dialCode: "+264" },
  { name: "Nepal", code: "NP", dialCode: "+977" },
  { name: "Netherlands", code: "NL", dialCode: "+31" },
  { name: "New Zealand", code: "NZ", dialCode: "+64" },
  { name: "Nicaragua", code: "NI", dialCode: "+505" },
  { name: "Niger", code: "NE", dialCode: "+227" },
  { name: "Nigeria", code: "NG", dialCode: "+234" },
  { name: "North Macedonia", code: "MK", dialCode: "+389" },
  { name: "Norway", code: "NO", dialCode: "+47" },
  { name: "Oman", code: "OM", dialCode: "+968" },
  { name: "Pakistan", code: "PK", dialCode: "+92" },
  { name: "Palestine", code: "PS", dialCode: "+970" },
  { name: "Panama", code: "PA", dialCode: "+507" },
  { name: "Papua New Guinea", code: "PG", dialCode: "+675" },
  { name: "Paraguay", code: "PY", dialCode: "+595" },
  { name: "Peru", code: "PE", dialCode: "+51" },
  { name: "Philippines", code: "PH", dialCode: "+63" },
  { name: "Poland", code: "PL", dialCode: "+48" },
  { name: "Portugal", code: "PT", dialCode: "+351" },
  { name: "Qatar", code: "QA", dialCode: "+974" },
  { name: "Romania", code: "RO", dialCode: "+40" },
  { name: "Russia", code: "RU", dialCode: "+7" },
  { name: "Rwanda", code: "RW", dialCode: "+250" },
  { name: "Saint Kitts and Nevis", code: "KN", dialCode: "+1869" },
  { name: "Saint Lucia", code: "LC", dialCode: "+1758" },
  { name: "Saint Vincent and the Grenadines", code: "VC", dialCode: "+1784" },
  { name: "Samoa", code: "WS", dialCode: "+685" },
  { name: "San Marino", code: "SM", dialCode: "+378" },
  { name: "Sao Tome and Principe", code: "ST", dialCode: "+239" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966" },
  { name: "Senegal", code: "SN", dialCode: "+221" },
  { name: "Serbia", code: "RS", dialCode: "+381" },
  { name: "Seychelles", code: "SC", dialCode: "+248" },
  { name: "Sierra Leone", code: "SL", dialCode: "+232" },
  { name: "Singapore", code: "SG", dialCode: "+65" },
  { name: "Slovakia", code: "SK", dialCode: "+421" },
  { name: "Slovenia", code: "SI", dialCode: "+386" },
  { name: "Somalia", code: "SO", dialCode: "+252" },
  { name: "South Africa", code: "ZA", dialCode: "+27" },
  { name: "South Korea", code: "KR", dialCode: "+82" },
  { name: "South Sudan", code: "SS", dialCode: "+211" },
  { name: "Spain", code: "ES", dialCode: "+34" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94" },
  { name: "Sudan", code: "SD", dialCode: "+249" },
  { name: "Suriname", code: "SR", dialCode: "+597" },
  { name: "Sweden", code: "SE", dialCode: "+46" },
  { name: "Switzerland", code: "CH", dialCode: "+41" },
  { name: "Syria", code: "SY", dialCode: "+963" },
  { name: "Taiwan", code: "TW", dialCode: "+886" },
  { name: "Tajikistan", code: "TJ", dialCode: "+992" },
  { name: "Tanzania", code: "TZ", dialCode: "+255" },
  { name: "Thailand", code: "TH", dialCode: "+66" },
  { name: "Togo", code: "TG", dialCode: "+228" },
  { name: "Tonga", code: "TO", dialCode: "+676" },
  { name: "Trinidad and Tobago", code: "TT", dialCode: "+1868" },
  { name: "Tunisia", code: "TN", dialCode: "+216" },
  { name: "Turkey", code: "TR", dialCode: "+90" },
  { name: "Turkmenistan", code: "TM", dialCode: "+993" },
  { name: "Uganda", code: "UG", dialCode: "+256" },
  { name: "Ukraine", code: "UA", dialCode: "+380" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971" },
  { name: "United Kingdom", code: "GB", dialCode: "+44" },
  { name: "United States", code: "US", dialCode: "+1" },
  { name: "Uruguay", code: "UY", dialCode: "+598" },
  { name: "Uzbekistan", code: "UZ", dialCode: "+998" },
  { name: "Vanuatu", code: "VU", dialCode: "+678" },
  { name: "Vatican City", code: "VA", dialCode: "+39" },
  { name: "Venezuela", code: "VE", dialCode: "+58" },
  { name: "Vietnam", code: "VN", dialCode: "+84" },
  { name: "Yemen", code: "YE", dialCode: "+967" },
  { name: "Zambia", code: "ZM", dialCode: "+260" },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263" },
];

/** Renders high quality flag image for country */
export function FlagImage({ code, name }: { code: string; name: string }) {
  const lowerCode = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${lowerCode}.png`}
      srcSet={`https://flagcdn.com/w80/${lowerCode}.png 2x`}
      width="20"
      height="15"
      alt={`${name} flag`}
      className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm border border-slate-200/80 shrink-0 inline-block"
      loading="lazy"
    />
  );
}

// Sort countries by dial code length descending for auto-detection matching
const SORTED_COUNTRIES_BY_DIAL_LEN = [...COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "+1 (555) 000-0000",
  required = false,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === "US") || COUNTRIES[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect country code from value when typed or initialized
  useEffect(() => {
    if (!value) return;

    // Clean leading whitespace / chars
    const cleaned = value.trim();
    const withPlus = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;

    // Find longest matching dial code
    const matched = SORTED_COUNTRIES_BY_DIAL_LEN.find((c) =>
      withPlus.startsWith(c.dialCode)
    );

    if (matched && matched.code !== selectedCountry.code) {
      setSelectedCountry(matched);
    }
  }, [value]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered countries based on search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.dialCode.replace("+", "").includes(q)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);

    // Extract national number if user already typed one with previous dial code
    let nationalNumber = value.trim();
    if (nationalNumber.startsWith("+")) {
      const currentDial = selectedCountry.dialCode;
      if (nationalNumber.startsWith(currentDial)) {
        nationalNumber = nationalNumber.slice(currentDial.length).trim();
      } else {
        const matched = SORTED_COUNTRIES_BY_DIAL_LEN.find((c) =>
          nationalNumber.startsWith(c.dialCode)
        );
        if (matched) {
          nationalNumber = nationalNumber.slice(matched.dialCode.length).trim();
        }
      }
    }

    onChange(`${country.dialCode} ${nationalNumber}`.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Check for auto-detection while typing
    const cleaned = val.trim();
    let valWithPlus = cleaned;
    if (!valWithPlus.startsWith("+") && valWithPlus.length > 0 && /^\d/.test(valWithPlus)) {
      valWithPlus = `+${valWithPlus}`;
    }

    const matched = SORTED_COUNTRIES_BY_DIAL_LEN.find((c) =>
      valWithPlus.startsWith(c.dialCode)
    );

    if (matched && matched.code !== selectedCountry.code) {
      setSelectedCountry(matched);
    }

    onChange(val);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-[#00bfa5] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#00bfa5]/50 overflow-hidden shadow-sm">
        {/* Country Code Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-3.5 bg-slate-100/80 hover:bg-slate-200/70 border-r border-slate-200 text-[14px] text-slate-800 font-medium select-none shrink-0 transition-colors"
          title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <FlagImage code={selectedCountry.code} name={selectedCountry.name} />
          <span className="text-xs font-bold text-slate-700">{selectedCountry.dialCode}</span>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile Input */}
        <input
          autoComplete="tel"
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          type="tel"
          value={value}
          className="w-full bg-transparent px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none"
        />
      </div>

      {/* Searchable Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-1.5 w-80 max-h-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10">
            <div className="relative">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#00bfa5] focus:ring-1 focus:ring-[#00bfa5]/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {filteredCountries.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400">No country found</div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-[#00bfa5]/10 ${
                      isSelected ? "bg-[#00bfa5]/10 font-bold text-[#006d40]" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <FlagImage code={c.code} name={c.name} />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0 font-semibold">{c.dialCode}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
