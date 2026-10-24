// Quran Transliteration Engine: English phonetic & Arabic to Bengali pronunciation
// Specially crafted for authentic Quranic Bengali recitation standards

const CANONICAL_WORDS: [RegExp, string][] = [
  // Basmalah and Takbir
  [/^bismil-laahir-rahmaanir-raheem$/i, 'বিসমিল্লাহির রাহমানির রাহীম'],
  [/^bismillaahir-rahmaanir-raheem$/i, 'বিসমিল্লাহির রাহমানির রাহীম'],
  [/^bismillahir-rahmanir-rahim$/i, 'বিসমিল্লাহির রাহমানির রাহীম'],
  [/^allahu akbar$/i, 'আল্লাহু আকবার'],

  // Surah Openers (Muqatta'at)
  [/^alif-laaam-meeem$/i, 'আলিফ-লাম-মীম'],
  [/^alif-laam-meem$/i, 'আলিফ-লাম-মীম'],
  [/^alif-laaam-meeem-saaad$/i, 'আলিফ-লাম-মীম-ছোয়াদ'],
  [/^alif-laaam-raa$/i, 'আলিফ-লাম-রা'],
  [/^alif-laaam-meeem-raa$/i, 'আলিফ-লাম-মীম-রা'],
  [/^kaaf-haa-yaa-'aiiin-saaad$/i, 'কাফ-হা-ইয়া-আইন-ছোয়াদ'],
  [/^taa-haa$/i, 'ত্বা-হা'],
  [/^taa-seeen-meeem$/i, 'ত্বা-সীন-মীম'],
  [/^taa-seeen$/i, 'ত্বা-সীন'],
  [/^yaa-seeen$/i, 'ইয়া-সীন'],
  [/^saaad$/i, 'ছোয়াদ'],
  [/^haa-meeem$/i, 'হা-মীম'],
  [/^haa-meee-qaaaf$/i, 'হা-মীম-ক্বাফ'],
  [/^qaaaaf$/i, 'ক্বাফ'],
  [/^nooon$/i, 'নূন'],

  // Common sacred phrases and Divine names
  [/\bAllaahu\b/gi, 'আল্লাহু'],
  [/\bAllahu\b/gi, 'আল্লাহু'],
  [/\bAllaah\b/gi, 'আল্লাহ'],
  [/\bAllah\b/gi, 'আল্লাহ'],
  [/\blillaahi\b/gi, 'লিল্লাহি'],
  [/\bLillaahi\b/gi, 'লিল্লাহি'],
  [/\blillaah\b/gi, 'লিল্লাহ'],
  [/\b'aalameen\b/gi, 'আলামীন'],
  [/\baalameen\b/gi, 'আলামীন'],
  [/\bAr-Rahmaanir-Raheem\b/gi, 'আর-রাহমানির রাহীম'],
  [/\bRahmaanir-Raheem\b/gi, 'রাহমানির রাহীম'],
  [/\bar-rahmaan\b/gi, 'আর-রাহমান'],
  [/\bar-raheem\b/gi, 'আর-রাহীম'],
  [/\bYawmid-Deen\b/gi, 'ইয়াওমিদ্দীন'],
  [/\byawmid-deen\b/gi, 'ইয়াওমিদ্দীন'],
  [/\bMustaqeem\b/gi, 'মুস্তাক্বীম'],
  [/\bmustaqeem\b/gi, 'মুস্তাক্বীম'],
  [/\bSubhaana\b/gi, 'সুবহানা'],
  [/\bsubhaana\b/gi, 'সুবহানা'],
  [/\bAlhamdu\b/gi, 'আলহামদু'],
  [/\balhamdu\b/gi, 'আলহামদু'],
  [/\bRabbil\b/gi, 'রাব্বিল'],
  [/\brabbil\b/gi, 'রাব্বিল'],
  [/\bRabbaka\b/gi, 'রাব্বাকা'],
  [/\brabbaka\b/gi, 'রাব্বাকা'],
  [/\bRabbika\b/gi, 'রাব্বিকা'],
  [/\brabbika\b/gi, 'রাব্বিকা'],
  [/\bRabbihim\b/gi, 'রাব্বিহিম'],
  [/\brabbihim\b/gi, 'রাব্বিহিম'],
  [/\bRabbanaa\b/gi, 'রাব্বানা'],
  [/\brabbanaa\b/gi, 'রাব্বানা'],
  [/\bIyyaaka\b/gi, 'ইয়্যাক্বা'],
  [/\biyyaaka\b/gi, 'ইয়্যাক্বা'],
  [/\bna'budu\b/gi, "না'বুদু"],
  [/\bnasta'een\b/gi, "নাস্তা'ঈন"],
  [/\bghayril-maghdoobi\b/gi, 'গাইরিল মাগদূবি'],
  [/\blad-daaaalleen\b/gi, 'লাদ-দ্বাল্লীন'],
  [/\blad-daalleen\b/gi, 'লাদ-দ্বাল্লীন']
];

function handleVowelFollower(s: string, idx: number): string {
  if (idx >= s.length) return '';
  const c3 = s.slice(idx, idx + 3).toLowerCase();
  const c2 = s.slice(idx, idx + 2).toLowerCase();
  const c1 = s[idx].toLowerCase();

  if (c3 === 'aaa') return 'া';
  if (c3 === 'eee') return 'ী';
  if (c3 === 'ooo') return 'ূ';

  if (c2 === 'aa') return 'া';
  if (c2 === 'ee') return 'ী';
  if (c2 === 'oo') return 'ূ';
  if (c2 === 'ai' || c2 === 'ay') return 'াই';
  if (c2 === 'au' || c2 === 'aw') return 'াও';

  if (c1 === 'a') return 'া';
  if (c1 === 'i') return 'ি';
  if (c1 === 'u') return 'ু';
  if (c1 === 'e') return 'ে';
  if (c1 === 'o') return 'ো';

  return '';
}

function skipVowelFollower(s: string, idx: number): number {
  if (idx >= s.length) return 0;
  const c3 = s.slice(idx, idx + 3).toLowerCase();
  const c2 = s.slice(idx, idx + 2).toLowerCase();
  const c1 = s[idx].toLowerCase();

  if (c3 === 'aaa' || c3 === 'eee' || c3 === 'ooo') return 3;
  if (c2 === 'aa' || c2 === 'ee' || c2 === 'oo' || c2 === 'ai' || c2 === 'ay' || c2 === 'au' || c2 === 'aw') return 2;
  if (c1 === 'a' || c1 === 'i' || c1 === 'u' || c1 === 'e' || c1 === 'o') return 1;

  return 0;
}

function transliterateWord(word: string): string {
  if (!word) return '';

  // Check dictionary
  for (const [regex, repl] of CANONICAL_WORDS) {
    if (regex.test(word)) {
      return word.replace(regex, repl);
    }
  }

  // Handle prefix like 'al-', 'wal-', 'bil-', 'lil-', 'fal-', 'kal-'
  let prefix = '';
  let rest = word;

  const prefixMatch = rest.match(/^(wa-|wal-|wabil-|fa-|fal-|bil-|lil-|kal-|al-)(.*)$/i);
  if (prefixMatch) {
    const rawP = prefixMatch[1].toLowerCase();
    rest = prefixMatch[2];
    if (rawP === 'al-') prefix = 'আল-';
    else if (rawP === 'wal-') prefix = 'ওয়াল-';
    else if (rawP === 'wabil-') prefix = 'ওয়াবিল-';
    else if (rawP === 'fa-') prefix = 'ফা ';
    else if (rawP === 'fal-') prefix = 'ফাল-';
    else if (rawP === 'bil-') prefix = 'বিল-';
    else if (rawP === 'lil-') prefix = 'লিল-';
    else if (rawP === 'kal-') prefix = 'কাল-';
    else if (rawP === 'wa-') prefix = 'ওয়া ';
  }

  let res = '';
  let i = 0;
  const s = rest;
  const len = s.length;

  while (i < len) {
    const c3 = s.slice(i, i + 3).toLowerCase();
    const c2 = s.slice(i, i + 2).toLowerCase();
    const c1 = s[i].toLowerCase();

    // Vowel sequences at beginning or standalone
    if (c3 === 'aaa') {
      res += res.length === 0 ? 'আ' : 'া';
      i += 3;
      continue;
    }
    if (c3 === 'eee') {
      res += res.length === 0 ? 'ঈ' : 'ী';
      i += 3;
      continue;
    }
    if (c3 === 'ooo') {
      res += res.length === 0 ? 'ঊ' : 'ূ';
      i += 3;
      continue;
    }

    if (c2 === 'aa') {
      res += res.length === 0 ? 'আ' : 'া';
      i += 2;
      continue;
    }
    if (c2 === 'ee') {
      res += res.length === 0 ? 'ঈ' : 'ী';
      i += 2;
      continue;
    }
    if (c2 === 'oo') {
      res += res.length === 0 ? 'ঊ' : 'ূ';
      i += 2;
      continue;
    }
    if (c2 === 'ai' || c2 === 'ay') {
      res += res.length === 0 ? 'আই' : 'াই';
      i += 2;
      continue;
    }
    if (c2 === 'au' || c2 === 'aw') {
      res += res.length === 0 ? 'আও' : 'াও';
      i += 2;
      continue;
    }

    // 2-letter consonants
    if (c2 === 'kh') {
      res += 'খ';
      i += 2;
      res += handleVowelFollower(s, i);
      i += skipVowelFollower(s, i);
      continue;
    }
    if (c2 === 'gh') {
      res += 'গ';
      i += 2;
      res += handleVowelFollower(s, i);
      i += skipVowelFollower(s, i);
      continue;
    }
    if (c2 === 'sh') {
      res += 'শ';
      i += 2;
      res += handleVowelFollower(s, i);
      i += skipVowelFollower(s, i);
      continue;
    }
    if (c2 === 'th') {
      res += 'ছ';
      i += 2;
      res += handleVowelFollower(s, i);
      i += skipVowelFollower(s, i);
      continue;
    }
    if (c2 === 'dh') {
      res += 'য';
      i += 2;
      res += handleVowelFollower(s, i);
      i += skipVowelFollower(s, i);
      continue;
    }
    if (c2 === 'zh') {
      res += 'য';
      i += 2;
      res += handleVowelFollower(s, i);
      i += skipVowelFollower(s, i);
      continue;
    }

    // Single consonants
    const charMap: Record<string, string> = {
      q: 'ক্ব',
      k: 'ক',
      b: 'ব',
      t: 'ত',
      d: 'দ',
      r: 'র',
      l: 'ল',
      m: 'ম',
      n: 'ন',
      h: 'হ',
      f: 'ফ',
      s: 'স',
      z: 'য',
      j: 'জ',
      w: 'ওয়',
      y: 'ইয়',
      p: 'প',
      v: 'ভ',
      "'": "'"
    };

    if (charMap[c1]) {
      res += charMap[c1];
      i += 1;
      res += handleVowelFollower(s, i);
      i += skipVowelFollower(s, i);
      continue;
    }

    // Single standalone vowels
    if (c1 === 'a') {
      res += res.length === 0 ? 'আ' : 'া';
      i++;
      continue;
    }
    if (c1 === 'i') {
      res += res.length === 0 ? 'ই' : 'ি';
      i++;
      continue;
    }
    if (c1 === 'u') {
      res += res.length === 0 ? 'উ' : 'ু';
      i++;
      continue;
    }
    if (c1 === 'e') {
      res += res.length === 0 ? 'এ' : 'ে';
      i++;
      continue;
    }
    if (c1 === 'o') {
      res += res.length === 0 ? 'ও' : 'ো';
      i++;
      continue;
    }

    // Passthrough
    res += s[i];
    i++;
  }

  return prefix + res;
}

export function convertEnTransliterationToBengali(englishText: string): string {
  if (!englishText) return '';

  let text = englishText;

  // Global phrase replacements first
  for (const [regex, repl] of CANONICAL_WORDS) {
    text = text.replace(regex, repl);
  }

  // Tokenize by spaces and punctuation while keeping delimiters
  const tokens = text.split(/([\s,;:!?—\(\)\[\]]+)/);
  return tokens
    .map((tok) => {
      if (!tok || /^[\s,;:!?—\(\)\[\]]+$/.test(tok)) {
        return tok;
      }
      if (/[\u0980-\u09FF]/.test(tok)) {
        return tok;
      }
      return transliterateWord(tok);
    })
    .join('');
}

// Direct Arabic Uthmani text to Bengali pronunciation engine (Offline fallback for 100% ayah coverage)
export function arabicToBengaliPronunciation(arabic: string): string {
  if (!arabic) return '';

  // Arabic letters & diacritics
  const clean = arabic
    .replace(/[\u06D6-\u06ED]/g, '') // Quranic pause marks
    .trim();

  const words = clean.split(/\s+/);
  return words
    .map((w) => convertArabicWord(w))
    .filter(Boolean)
    .join(' ');
}

function convertArabicWord(word: string): string {
  let res = '';
  const len = word.length;

  for (let i = 0; i < len; i++) {
    const ch = word[i];
    const next = word[i + 1] || '';
    const hasShaddah = next === '\u0651' || word[i + 2] === '\u0651';

    // Letters
    let base = '';
    switch (ch) {
      case 'ا':
      case 'أ':
      case 'إ':
      case 'آ':
      case 'ٱ':
      case 'ء':
        base = res.length === 0 ? 'আ' : '';
        break;
      case 'ب': base = 'ব'; break;
      case 'ت': base = 'ত'; break;
      case 'ث': base = 'ছ'; break;
      case 'ج': base = 'জ'; break;
      case 'ح': base = 'হ'; break;
      case 'خ': base = 'খ'; break;
      case 'د': base = 'দ'; break;
      case 'ذ': base = 'য'; break;
      case 'ر': base = 'র'; break;
      case 'ز': base = 'য'; break;
      case 'س': base = 'স'; break;
      case 'ش': base = 'শ'; break;
      case 'ص': base = 'ছ'; break;
      case 'ض': base = 'দ'; break;
      case 'ط': base = 'ত্ব'; break;
      case 'ظ': base = 'যা'; break;
      case 'ع': base = res.length === 0 ? "'আ" : "'"; break;
      case 'غ': base = 'গ'; break;
      case 'ف': base = 'ফ'; break;
      case 'ق': base = 'ক্ব'; break;
      case 'ك': base = 'ক'; break;
      case 'ل': base = 'ল'; break;
      case 'م': base = 'ম'; break;
      case 'ن': base = 'ন'; break;
      case 'ه':
      case 'ة': base = 'হ'; break;
      case 'و': base = 'ওয়'; break;
      case 'ي':
      case 'ى': base = res.length === 0 ? 'ইয়া' : 'ই'; break;
      // Harakat
      case '\u064E': // Fatha
        if (res.length > 0 && !res.endsWith('া') && !res.endsWith('ি') && !res.endsWith('ু')) {
          base = 'া';
        }
        break;
      case '\u064F': // Damma
        base = 'ু';
        break;
      case '\u0650': // Kasra
        base = 'ি';
        break;
      case '\u0652': // Sukun
        base = '';
        break;
      case '\u064B': // Fathatan
        base = 'ান';
        break;
      case '\u064C': // Dammatan
        base = 'উন';
        break;
      case '\u064D': // Kasratan
        base = 'ইন';
        break;
      case '\u0670': // Dagger Alif
        base = 'া';
        break;
    }

    if (base) {
      if (hasShaddah && base.length === 1 && /[\u0995-\u09B9]/.test(base)) {
        res += base + base;
      } else {
        res += base;
      }
    }
  }

  return res;
}
