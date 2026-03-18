/** Language as returned by GET /api/languages */
export interface Language {
  code: string;
  englishName: string;
  nativeName: string;
  script: string;
  rtl: boolean;
}

/** Fallback static list — matches the 82 SSP-supported languages.
 *  Components should prefer fetching from GET /api/languages for live data. */
export const LANGUAGES: Language[] = [
  // ── Latin Script ────────────────────────────────────────
  { code: 'af',      englishName: 'Afrikaans',          nativeName: 'Afrikaans',           script: 'Latin',      rtl: false },
  { code: 'sq',      englishName: 'Albanian',            nativeName: 'Shqip',               script: 'Latin',      rtl: false },
  { code: 'az',      englishName: 'Azerbaijani',         nativeName: 'Azərbaycan',          script: 'Latin',      rtl: false },
  { code: 'eu',      englishName: 'Basque',              nativeName: 'Euskara',             script: 'Latin',      rtl: false },
  { code: 'bs',      englishName: 'Bosnian',             nativeName: 'Bosanski',            script: 'Latin',      rtl: false },
  { code: 'ca',      englishName: 'Catalan',             nativeName: 'Català',              script: 'Latin',      rtl: false },
  { code: 'hr',      englishName: 'Croatian',            nativeName: 'Hrvatski',            script: 'Latin',      rtl: false },
  { code: 'cs',      englishName: 'Czech',               nativeName: 'Čeština',             script: 'Latin',      rtl: false },
  { code: 'da',      englishName: 'Danish',              nativeName: 'Dansk',               script: 'Latin',      rtl: false },
  { code: 'nl',      englishName: 'Dutch',               nativeName: 'Nederlands',          script: 'Latin',      rtl: false },
  { code: 'en',      englishName: 'English',             nativeName: 'English',             script: 'Latin',      rtl: false },
  { code: 'eo',      englishName: 'Esperanto',           nativeName: 'Esperanto',           script: 'Latin',      rtl: false },
  { code: 'et',      englishName: 'Estonian',            nativeName: 'Eesti',               script: 'Latin',      rtl: false },
  { code: 'tl',      englishName: 'Tagalog',             nativeName: 'Tagalog',             script: 'Latin',      rtl: false },
  { code: 'fi',      englishName: 'Finnish',             nativeName: 'Suomi',               script: 'Latin',      rtl: false },
  { code: 'fr',      englishName: 'French',              nativeName: 'Français',            script: 'Latin',      rtl: false },
  { code: 'gl',      englishName: 'Galician',            nativeName: 'Galego',              script: 'Latin',      rtl: false },
  { code: 'de',      englishName: 'German',              nativeName: 'Deutsch',             script: 'Latin',      rtl: false },
  { code: 'ht',      englishName: 'Haitian Creole',      nativeName: 'Kreyòl ayisyen',      script: 'Latin',      rtl: false },
  { code: 'ha',      englishName: 'Hausa',               nativeName: 'Hausa',               script: 'Latin',      rtl: false },
  { code: 'hu',      englishName: 'Hungarian',           nativeName: 'Magyar',              script: 'Latin',      rtl: false },
  { code: 'is',      englishName: 'Icelandic',           nativeName: 'Íslenska',            script: 'Latin',      rtl: false },
  { code: 'ig',      englishName: 'Igbo',                nativeName: 'Igbo',                script: 'Latin',      rtl: false },
  { code: 'id',      englishName: 'Indonesian',          nativeName: 'Bahasa Indonesia',    script: 'Latin',      rtl: false },
  { code: 'ga',      englishName: 'Irish',               nativeName: 'Gaeilge',             script: 'Latin',      rtl: false },
  { code: 'it',      englishName: 'Italian',             nativeName: 'Italiano',            script: 'Latin',      rtl: false },
  { code: 'lv',      englishName: 'Latvian',             nativeName: 'Latviešu',            script: 'Latin',      rtl: false },
  { code: 'lt',      englishName: 'Lithuanian',          nativeName: 'Lietuvių',            script: 'Latin',      rtl: false },
  { code: 'lb',      englishName: 'Luxembourgish',       nativeName: 'Lëtzebuergesch',      script: 'Latin',      rtl: false },
  { code: 'mg',      englishName: 'Malagasy',            nativeName: 'Malagasy',            script: 'Latin',      rtl: false },
  { code: 'ms',      englishName: 'Malay',               nativeName: 'Bahasa Melayu',       script: 'Latin',      rtl: false },
  { code: 'mt',      englishName: 'Maltese',             nativeName: 'Malti',               script: 'Latin',      rtl: false },
  { code: 'mi',      englishName: 'Maori',               nativeName: 'Te Reo Māori',        script: 'Latin',      rtl: false },
  { code: 'no',      englishName: 'Norwegian',           nativeName: 'Norsk',               script: 'Latin',      rtl: false },
  { code: 'pl',      englishName: 'Polish',              nativeName: 'Polski',              script: 'Latin',      rtl: false },
  { code: 'pt',      englishName: 'Portuguese',          nativeName: 'Português',           script: 'Latin',      rtl: false },
  { code: 'ro',      englishName: 'Romanian',            nativeName: 'Română',              script: 'Latin',      rtl: false },
  { code: 'sm',      englishName: 'Samoan',              nativeName: 'Gagana Sāmoa',        script: 'Latin',      rtl: false },
  { code: 'sn',      englishName: 'Shona',               nativeName: 'chiShona',            script: 'Latin',      rtl: false },
  { code: 'sk',      englishName: 'Slovak',              nativeName: 'Slovenčina',          script: 'Latin',      rtl: false },
  { code: 'sl',      englishName: 'Slovenian',           nativeName: 'Slovenščina',         script: 'Latin',      rtl: false },
  { code: 'so',      englishName: 'Somali',              nativeName: 'Soomaali',            script: 'Latin',      rtl: false },
  { code: 'st',      englishName: 'Sotho',               nativeName: 'Sesotho',             script: 'Latin',      rtl: false },
  { code: 'es',      englishName: 'Spanish',             nativeName: 'Español',             script: 'Latin',      rtl: false },
  { code: 'su',      englishName: 'Sundanese',           nativeName: 'Basa Sunda',          script: 'Latin',      rtl: false },
  { code: 'sw',      englishName: 'Swahili',             nativeName: 'Kiswahili',           script: 'Latin',      rtl: false },
  { code: 'sv',      englishName: 'Swedish',             nativeName: 'Svenska',             script: 'Latin',      rtl: false },
  { code: 'tk',      englishName: 'Turkmen',             nativeName: 'Türkmen',             script: 'Latin',      rtl: false },
  { code: 'tr',      englishName: 'Turkish',             nativeName: 'Türkçe',              script: 'Latin',      rtl: false },
  { code: 'uz',      englishName: 'Uzbek',               nativeName: "O'zbek",              script: 'Latin',      rtl: false },
  { code: 'vi',      englishName: 'Vietnamese',          nativeName: 'Tiếng Việt',          script: 'Latin',      rtl: false },
  { code: 'cy',      englishName: 'Welsh',               nativeName: 'Cymraeg',             script: 'Latin',      rtl: false },
  { code: 'xh',      englishName: 'Xhosa',               nativeName: 'IsiXhosa',            script: 'Latin',      rtl: false },
  { code: 'yo',      englishName: 'Yoruba',              nativeName: 'Yorùbá',              script: 'Latin',      rtl: false },
  { code: 'zu',      englishName: 'Zulu',                nativeName: 'IsiZulu',             script: 'Latin',      rtl: false },

  // ── Cyrillic Script ─────────────────────────────────────
  { code: 'be',      englishName: 'Belarusian',          nativeName: 'Беларуская',          script: 'Cyrillic',   rtl: false },
  { code: 'bg',      englishName: 'Bulgarian',           nativeName: 'Български',           script: 'Cyrillic',   rtl: false },
  { code: 'kk',      englishName: 'Kazakh',              nativeName: 'Қазақша',             script: 'Cyrillic',   rtl: false },
  { code: 'ky',      englishName: 'Kyrgyz',              nativeName: 'Кыргызча',            script: 'Cyrillic',   rtl: false },
  { code: 'mk',      englishName: 'Macedonian',          nativeName: 'Македонски',          script: 'Cyrillic',   rtl: false },
  { code: 'mn',      englishName: 'Mongolian',           nativeName: 'Монгол',              script: 'Cyrillic',   rtl: false },
  { code: 'ru',      englishName: 'Russian',             nativeName: 'Русский',             script: 'Cyrillic',   rtl: false },
  { code: 'sr',      englishName: 'Serbian',             nativeName: 'Српски',              script: 'Cyrillic',   rtl: false },
  { code: 'tg',      englishName: 'Tajik',               nativeName: 'Тоҷикӣ',              script: 'Cyrillic',   rtl: false },
  { code: 'tt',      englishName: 'Tatar',               nativeName: 'Татар',               script: 'Cyrillic',   rtl: false },
  { code: 'uk',      englishName: 'Ukrainian',           nativeName: 'Українська',          script: 'Cyrillic',   rtl: false },

  // ── Arabic Script (RTL) ─────────────────────────────────
  { code: 'ar',      englishName: 'Arabic',              nativeName: 'العربية',             script: 'Arabic',     rtl: true  },
  { code: 'fa',      englishName: 'Persian',             nativeName: 'فارسی',               script: 'Arabic',     rtl: true  },
  { code: 'ps',      englishName: 'Pashto',              nativeName: 'پښتو',                script: 'Arabic',     rtl: true  },
  { code: 'ur',      englishName: 'Urdu',                nativeName: 'اردو',                script: 'Arabic',     rtl: true  },

  // ── Hebrew Script (RTL) ─────────────────────────────────
  { code: 'he',      englishName: 'Hebrew',              nativeName: 'עברית',               script: 'Hebrew',     rtl: true  },

  // ── Greek Script ────────────────────────────────────────
  { code: 'el',      englishName: 'Greek',               nativeName: 'Ελληνικά',            script: 'Greek',      rtl: false },

  // ── Armenian Script ─────────────────────────────────────
  { code: 'hy',      englishName: 'Armenian',            nativeName: 'Հայերեն',             script: 'Armenian',   rtl: false },

  // ── Georgian Script ─────────────────────────────────────
  { code: 'ka',      englishName: 'Georgian',            nativeName: 'ქართული',             script: 'Georgian',   rtl: false },

  // ── Devanagari Script ───────────────────────────────────
  { code: 'hi',      englishName: 'Hindi',               nativeName: 'हिन्दी',              script: 'Devanagari', rtl: false },
  { code: 'mr',      englishName: 'Marathi',             nativeName: 'मराठी',               script: 'Devanagari', rtl: false },
  { code: 'ne',      englishName: 'Nepali',              nativeName: 'नेपाली',              script: 'Devanagari', rtl: false },
  { code: 'sa',      englishName: 'Sanskrit',            nativeName: 'संस्कृतम्',            script: 'Devanagari', rtl: false },

  // ── Other Indic Scripts ─────────────────────────────────
  { code: 'bn',      englishName: 'Bengali',             nativeName: 'বাংলা',               script: 'Bengali',    rtl: false },
  { code: 'gu',      englishName: 'Gujarati',            nativeName: 'ગુજરાતી',             script: 'Gujarati',   rtl: false },
  { code: 'kn',      englishName: 'Kannada',             nativeName: 'ಕನ್ನಡ',               script: 'Kannada',    rtl: false },
  { code: 'ml',      englishName: 'Malayalam',           nativeName: 'മലയാളം',              script: 'Malayalam',  rtl: false },
  { code: 'pa',      englishName: 'Punjabi',             nativeName: 'ਪੰਜਾਬੀ',              script: 'Gurmukhi',   rtl: false },
  { code: 'si',      englishName: 'Sinhala',             nativeName: 'සිංහල',               script: 'Sinhala',    rtl: false },
  { code: 'ta',      englishName: 'Tamil',               nativeName: 'தமிழ்',               script: 'Tamil',      rtl: false },
  { code: 'te',      englishName: 'Telugu',              nativeName: 'తెలుగు',              script: 'Telugu',     rtl: false },

  // ── CJK ─────────────────────────────────────────────────
  { code: 'zh-Hans', englishName: 'Chinese (Simplified)',  nativeName: '中文（简体）',        script: 'CJK',        rtl: false },
  { code: 'zh-Hant', englishName: 'Chinese (Traditional)', nativeName: '中文（繁體）',        script: 'CJK',        rtl: false },
  { code: 'ja',      englishName: 'Japanese',             nativeName: '日本語',              script: 'CJK',        rtl: false },
  { code: 'ko',      englishName: 'Korean',               nativeName: '한국어',              script: 'Korean',     rtl: false },

  // ── Southeast Asian Scripts ─────────────────────────────
  { code: 'km',      englishName: 'Khmer',               nativeName: 'ភាសាខ្មែរ',            script: 'Khmer',      rtl: false },
  { code: 'lo',      englishName: 'Lao',                 nativeName: 'ລາວ',                 script: 'Lao',        rtl: false },
  { code: 'my',      englishName: 'Burmese',             nativeName: 'မြန်မာဘာသာ',           script: 'Myanmar',    rtl: false },
  { code: 'th',      englishName: 'Thai',                nativeName: 'ภาษาไทย',             script: 'Thai',       rtl: false },

  // ── Ethiopic Script ─────────────────────────────────────
  { code: 'am',      englishName: 'Amharic',             nativeName: 'አማርኛ',               script: 'Ethiopic',   rtl: false },
];

/** Quick lookup map: code → Language */
export const LANGUAGE_MAP = new Map<string, Language>(
  LANGUAGES.map(l => [l.code, l])
);

/** Returns true if the language code is RTL */
export function isRtlLanguage(code: string): boolean {
  return LANGUAGE_MAP.get(code)?.rtl ?? false;
}

/** Returns "English Name — Native Name" label for a language code */
export function languageDisplayLabel(code: string): string {
  const l = LANGUAGE_MAP.get(code);
  return l ? `${l.englishName} — ${l.nativeName}` : code.toUpperCase();
}
