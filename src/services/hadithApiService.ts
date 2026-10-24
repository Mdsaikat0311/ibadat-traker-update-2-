import { HadithItem } from '../data/hadithCollection';
import bookSectionsMeta from '../data/bookSectionsMeta.json';
import nawawi40Full from '../data/nawawi40Full.json';
import qudsi40Full from '../data/qudsi40Full.json';
import shamayilFull from '../data/shamayilFull.json';
import selected300Full from '../data/selected300Full.json';
import adabMufradFull from '../data/adabMufradFull.json';
import riyadFull from '../data/riyadFull.json';

// In-memory cache for fast tab switching
const sectionCache: Record<string, HadithItem[]> = {};
const hadithCache: Record<string, HadithItem> = {};

// Bengali dictionary for popular chapter titles
const BENGALI_CHAPTER_MAP: Record<string, string> = {
  'Revelation': 'ওহীর সূচনা',
  'Belief': 'ঈমান ও বিশ্বাস',
  'Knowledge': 'ইলম ও জ্ঞান',
  "Ablutions (Wudu')": 'পবিত্রতা ও ওযু',
  'Bathing (Ghusl)': 'গোসলের নিয়মাবলী',
  'Menstrual Periods': 'ঋতুস্রাব (হায়েয)',
  'Rubbing hands and feet with dust (Tayammum)': 'তায়াম্মুম',
  'Prayers (Salat)': 'সালাত ও নামাজ',
  'Times of the Prayers': 'সালাতের ওয়াক্তসমূহ',
  'Call to Prayers (Adhaan)': 'আযান ও ইকামাত',
  'Characteristics of Prayer': 'নামাজের বৈশিষ্ট্য ও নিয়ম',
  'Friday Prayer': 'জুমু‘আর নামাজ',
  'Fear Prayer': 'ভয়ের সালাত',
  'The Two Festivals (Eids)': 'দুই ঈদের নামাজ',
  'Witr Prayer': 'বিতর সালাত',
  'Invoking Allah for Rain (Istisqaa)': 'বৃষ্টির জন্য প্রার্থনা (ইস্তিসকা)',
  'Eclipses': 'সূর্যগ্রহণ ও চন্দ্রগ্রহণ (কুসূফ)',
  'Prostration During Recitation of Quran': 'সিজদায়ে তিলাওয়াত',
  'Shortening the Prayers (At-Taqseer)': 'কসর সালাত (মুসাফিরের নামাজ)',
  'Prayer at Night (Tahajjud)': 'তাহাজ্জুদ ও রাতের নামাজ',
  'Actions while Praying': 'নামাজের মধ্যকার আমল',
  'Funerals (Al-Janaaiz)': 'জানাযার নামাজ ও কাফন-দাফন',
  'Obligatory Charity Tax (Zakat)': 'যাকাত ও সদকা',
  'Obligatory Charity Tax After Ramadan (Zakat ul Fitr)': 'সাদকাতুল ফিতর',
  'Hajj (Pilgrimage)': 'হজ্জ ও উমরাহ',
  'Fasting': 'সাওম ও রোজা',
  'Praying at Night in Ramadaan (Taraweeh)': 'তারাবীহ সালাত',
  'Retiring to a Mosque for Remembrance of Allah (I\'tikaf)': 'ইতিকাফ',
  'Sales and Trade': 'ক্রয়-বিক্রয় ও বাণিজ্য',
  'Distribution of Water': 'পানি বণ্টন ও সেচ',
  'Loans, Payment of Loans, Freezing of Property, Bankruptcy': 'ঋণ ও পাওনা পরিশোধ',
  'Lost Things Picked up by Someone (Luqatah)': 'হারানো বস্তু প্রাপ্তি (লুকতাহ)',
  'Oppressions': 'জুলুম ও অত্যাচার প্রতিরোধ',
  'Partnership': 'অংশীদারি কারবার',
  'Mortgaging': 'বন্ধক রাখা',
  'Manumission of Slaves': 'দাসমুক্তি ও মানবকল্যাণ',
  'Gifts': 'উপহার ও হাদিয়া বিনিময়',
  'Witnesses': 'সাক্ষ্য ও বিচার',
  'Peacemaking': 'পারস্পরিক মীমাংসা ও সম্প্রীতি',
  'Conditions': 'চুক্তি ও শর্তাবলী',
  'Wills and Testaments (Wasaayaa)': 'অসিয়ত ও উইল',
  'Fighting for the Cause of Allah (Jihaad)': 'আল্লাহর পথে সংগ্রাম ও আত্মত্যাগ',
  'One-fifth of Booty to the Cause of Allah (Khumus)': 'গনীমতের সম্পদ বণ্টন',
  'Prophets': 'নবী-রাসূলগণের ঘটনা ও শিক্ষা',
  'Virtues and Merits of the Prophet (pbuh) and his Companions': 'রাসূলুল্লাহ (ﷺ) ও সাহাবীদের মর্যাদা',
  'Companions of the Prophet': 'সাহাবায়ে কিরামের জীবনী ও ফযিলত',
  'Merits of the Helpers in Madinah (Ansaar)': 'আনসারদের মর্যাদা',
  'Military Expeditions led by the Prophet (pbuh) (Al-Maghaazi)': 'মাগাযী (ঐতিহাসিক যুদ্ধ ও বিজয়)',
  'Prophetic Commentary on the Qur\'an (Tafseer)': 'কুরআনের তাফসীর ও ব্যাখ্যা',
  'Virtues of the Qur\'an': 'পবিত্র কুরআনের ফযিলত',
  'Wedlock, Marriage (Nikaah)': 'বিবাহ ও দাম্পত্য জীবন',
  'Divorce': 'তালাক ও পারিবারিক সমাধান',
  'Supporting the Family': 'পরিবারের ভরণপোষণ',
  'Food, Meals': 'খাদ্য ও আহারের আদব',
  'Sacrifice on Occasion of Birth (`Aqiqa)': 'আকিকা',
  'Hunting, Slaughtering': 'শিকার ও হালাল যবাই',
  'Al-Adha Festival Sacrifice (Al-Udhiyah)': 'কোরবানি',
  'Drinks': 'পানীয় ও পানাহারের আদব',
  'Patients': 'রোগীর সেবা ও পরিচর্যা',
  'Medicine': 'চিকিৎসা ও শেফা',
  'Dress': 'পোশাক-পরিচ্ছদ ও শালীনতা',
  'Good Manners and Form (Al-Adab)': 'উত্তম চরিত্র ও শিষ্টাচার (আদব)',
  'Asking for Permission': 'অনুমতি প্রার্থনা ও সালাম',
  'Invocations': 'দোয়া ও যিকির',
  'To make the Heart Tender (Ar-Riqaq)': 'অন্তর গলানো উপদেশ (রিকাক)',
  'Divine Will (Al-Qadar)': 'তাকদীর ও ভাগ্য',
  'Oaths and Vows': 'কসম ও মান্নত',
  'Holding Fast to the Qur\'an and Sunnah': 'কুরআন ও সুন্নাহকে আঁকড়ে ধরা',
  'Sayings of the Prophet': 'নবীজীর বাণী',
  'Forty Hadith of an-Nawawi': 'ইমাম নববীর ৪০ হাদিস',
  'Forty Hadith Qudsi': '৪০ হাদিসে কুদসী'
};

export interface BookSectionDetail {
  sectionNumber: number;
  englishTitle: string;
  bengaliTitle: string;
  firstHadithNumber: number;
  lastHadithNumber: number;
  count: number;
}

// Canonical mapping between internal bookId and external meta/API ids
function normalizeBookId(bookId: string): string {
  if (bookId === 'abudawood') return 'abudawud';
  if (bookId === 'nawawi40') return 'nawawi';
  if (bookId === 'qudsi40') return 'qudsi';
  return bookId;
}

export class HadithApiService {
  /**
   * Get sections/chapters for a given book
   */
  static getBookSections(bookId: string): BookSectionDetail[] {
    // 1. Imam Nawawi 40 Hadith
    if (bookId === 'nawawi' || bookId === 'nawawi40') {
      return [
        {
          sectionNumber: 1,
          englishTitle: 'Forty Hadith of an-Nawawi',
          bengaliTitle: 'ইমাম নববীর ৪০ হাদিস (সম্পূর্ণ ৪২টি)',
          firstHadithNumber: 1,
          lastHadithNumber: 42,
          count: 42
        }
      ];
    }

    // 2. 40 Hadith Qudsi
    if (bookId === 'qudsi' || bookId === 'qudsi40') {
      return [
        {
          sectionNumber: 1,
          englishTitle: 'Forty Hadith Qudsi',
          bengaliTitle: '৪০ হাদিসে কুদসী (সম্পূর্ণ সংকলন)',
          firstHadithNumber: 1,
          lastHadithNumber: 40,
          count: 40
        }
      ];
    }

    // 3. Shamayil Tirmidhi
    if (bookId === 'shamayil') {
      return extractSectionsFromList(shamayilFull as any[], 'shamayil');
    }

    // 4. Selected 300 Hadiths
    if (bookId === 'selected300') {
      return extractSectionsFromList(selected300Full as any[], 'selected300');
    }

    // 5. Al-Adab Al-Mufrad
    if (bookId === 'adab_mufrad') {
      return extractSectionsFromList(adabMufradFull as any[], 'adab_mufrad');
    }

    // 6. Riyadus Salihin (500 or Full)
    if (bookId === 'riyad500' || bookId === 'riyad_full') {
      return extractSectionsFromList(riyadFull as any[], 'riyad');
    }

    // 7. Canonical API Books from bookSectionsMeta (Bukhari, Muslim, Abu Dawood, Tirmidhi, Nasai, Ibn Majah, Malik)
    const normId = normalizeBookId(bookId);
    const meta = (bookSectionsMeta as any)[normId];
    if (!meta || !meta.sections) {
      return [
        {
          sectionNumber: 1,
          englishTitle: 'All Hadiths',
          bengaliTitle: 'সকল হাদিস সংকলন',
          firstHadithNumber: 1,
          lastHadithNumber: 50,
          count: 50
        }
      ];
    }

    const sections: BookSectionDetail[] = [];
    const sectionObj = meta.sections;
    const detailsObj = meta.details || {};

    Object.entries(sectionObj).forEach(([secKey, secName]) => {
      const secNum = parseInt(secKey, 10);
      const strName = String(secName).trim();
      if (secNum === 0 && !strName) return; // Skip empty intro index
      if (!strName && secNum !== 1) return;

      const detail = detailsObj[secKey] || {};
      const first = detail.hadithnumber_first || 1;
      const last = detail.hadithnumber_last || first;
      const count = Math.max(1, last - first + 1);

      const bengaliTitle =
        BENGALI_CHAPTER_MAP[strName] ||
        (secNum === 1 && !strName ? 'অধ্যায় ১' : strName);

      sections.push({
        sectionNumber: secNum,
        englishTitle: strName || `Section ${secNum}`,
        bengaliTitle,
        firstHadithNumber: first,
        lastHadithNumber: last,
        count
      });
    });

    return sections;
  }

  /**
   * Fetch all hadiths of a specific section/chapter for a book
   */
  static async fetchHadithsBySection(
    bookId: string,
    sectionNumber: number,
    bookTitle: string
  ): Promise<HadithItem[]> {
    const cacheKey = `${bookId}_sec_${sectionNumber}`;
    if (sectionCache[cacheKey]) {
      return sectionCache[cacheKey];
    }

    // Special bundled handling for Nawawi 40
    if (bookId === 'nawawi' || bookId === 'nawawi40') {
      const items = mapBundledToHadithItems(nawawi40Full as any[], 'nawawi40');
      sectionCache[cacheKey] = items;
      return items;
    }

    // Special bundled handling for 40 Hadith Qudsi
    if (bookId === 'qudsi' || bookId === 'qudsi40') {
      const items = mapBundledToHadithItems(qudsi40Full as any[], 'qudsi40');
      sectionCache[cacheKey] = items;
      return items;
    }

    // Special bundled handling for Shamayil
    if (bookId === 'shamayil') {
      const allShamayil = mapBundledToHadithItems(shamayilFull as any[], 'shamayil');
      const sections = extractSectionsFromList(shamayilFull as any[], 'shamayil');
      const targetSec = sections.find((s) => s.sectionNumber === sectionNumber);
      if (targetSec) {
        const filtered = allShamayil.filter(
          (h) => {
            const num = parseHadithNum(h.hadithNumber);
            return num >= targetSec.firstHadithNumber && num <= targetSec.lastHadithNumber;
          }
        );
        sectionCache[cacheKey] = filtered;
        return filtered;
      }
      sectionCache[cacheKey] = allShamayil;
      return allShamayil;
    }

    // Special bundled handling for Selected 300
    if (bookId === 'selected300') {
      const all300 = mapBundledToHadithItems(selected300Full as any[], 'selected300');
      const sections = extractSectionsFromList(selected300Full as any[], 'selected300');
      const targetSec = sections.find((s) => s.sectionNumber === sectionNumber);
      if (targetSec) {
        const filtered = all300.filter((h) => {
          const num = parseHadithNum(h.hadithNumber);
          return num >= targetSec.firstHadithNumber && num <= targetSec.lastHadithNumber;
        });
        sectionCache[cacheKey] = filtered;
        return filtered;
      }
      sectionCache[cacheKey] = all300;
      return all300;
    }

    // Special bundled handling for Al-Adab Al-Mufrad
    if (bookId === 'adab_mufrad') {
      const allAdab = mapBundledToHadithItems(adabMufradFull as any[], 'adab_mufrad');
      const sections = extractSectionsFromList(adabMufradFull as any[], 'adab_mufrad');
      const targetSec = sections.find((s) => s.sectionNumber === sectionNumber);
      if (targetSec) {
        const filtered = allAdab.filter((h) => {
          const num = parseHadithNum(h.hadithNumber);
          return num >= targetSec.firstHadithNumber && num <= targetSec.lastHadithNumber;
        });
        sectionCache[cacheKey] = filtered;
        return filtered;
      }
      sectionCache[cacheKey] = allAdab;
      return allAdab;
    }

    // Special bundled handling for Riyadus Salihin (500 or Full)
    if (bookId === 'riyad500' || bookId === 'riyad_full') {
      const allRiyad = mapBundledToHadithItems(riyadFull as any[], bookId);
      const sections = extractSectionsFromList(riyadFull as any[], 'riyad');
      const targetSec = sections.find((s) => s.sectionNumber === sectionNumber);
      if (targetSec) {
        const filtered = allRiyad.filter((h) => {
          const num = parseHadithNum(h.hadithNumber);
          return num >= targetSec.firstHadithNumber && num <= targetSec.lastHadithNumber;
        });
        sectionCache[cacheKey] = filtered;
        return filtered;
      }
      sectionCache[cacheKey] = allRiyad;
      return allRiyad;
    }

    // Canonical API fetch
    const normId = normalizeBookId(bookId);
    const benUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${normId}/sections/${sectionNumber}.min.json`;
    const araUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${normId}/sections/${sectionNumber}.min.json`;

    try {
      const [benRes, araRes] = await Promise.all([
        fetch(benUrl),
        fetch(araUrl).catch(() => null)
      ]);

      if (!benRes.ok) {
        throw new Error(`Failed to fetch section ${sectionNumber} for ${normId}`);
      }

      const benData = await benRes.json();
      let araData: any = null;
      if (araRes && araRes.ok) {
        try {
          araData = await araRes.json();
        } catch {}
      }

      const araMap: Record<number, string> = {};
      if (araData && Array.isArray(araData.hadiths)) {
        araData.hadiths.forEach((h: any) => {
          araMap[h.hadithnumber] = h.text;
        });
      }

      const sectionTitle =
        benData.metadata?.section?.[String(sectionNumber)] ||
        benData.metadata?.sections?.[String(sectionNumber)] ||
        `অধ্যায় ${sectionNumber}`;
      const bnSectionTitle = BENGALI_CHAPTER_MAP[sectionTitle] || sectionTitle;

      const hadiths: HadithItem[] = (benData.hadiths || []).map((h: any) => {
        const arabicText = araMap[h.hadithnumber] || '';
        const rawText = h.text || '';
        const referenceStr = extractReference(rawText, bookTitle, h.hadithnumber);

        return {
          id: `${bookId}_${h.hadithnumber}`,
          bookId,
          hadithNumber: `হাদিস নং ${h.hadithnumber}`,
          chapter: bnSectionTitle,
          narrator: extractNarrator(rawText),
          arabic: arabicText,
          translation: cleanHadithText(rawText),
          grade: determineGrade(h.grades, rawText),
          reference: referenceStr
        };
      });

      sectionCache[cacheKey] = hadiths;
      return hadiths;
    } catch (err) {
      console.warn(`Error fetching section ${sectionNumber} for ${bookId}:`, err);
      return [];
    }
  }

  /**
   * Fetch all hadiths of a bundled collection at once
   */
  static getAllBundledHadiths(bookId: string): HadithItem[] | null {
    if (bookId === 'nawawi' || bookId === 'nawawi40') {
      return mapBundledToHadithItems(nawawi40Full as any[], 'nawawi40');
    }
    if (bookId === 'qudsi' || bookId === 'qudsi40') {
      return mapBundledToHadithItems(qudsi40Full as any[], 'qudsi40');
    }
    if (bookId === 'shamayil') {
      return mapBundledToHadithItems(shamayilFull as any[], 'shamayil');
    }
    if (bookId === 'selected300') {
      return mapBundledToHadithItems(selected300Full as any[], 'selected300');
    }
    if (bookId === 'adab_mufrad') {
      return mapBundledToHadithItems(adabMufradFull as any[], 'adab_mufrad');
    }
    if (bookId === 'riyad500' || bookId === 'riyad_full') {
      return mapBundledToHadithItems(riyadFull as any[], bookId);
    }
    return null;
  }

  /**
   * Fetch a single Hadith directly by its number (e.g., Hadith 1, 500, 7549)
   */
  static async fetchHadithByNumber(
    bookId: string,
    hadithNumber: number,
    bookTitle: string
  ): Promise<HadithItem | null> {
    const cacheKey = `${bookId}_single_${hadithNumber}`;
    if (hadithCache[cacheKey]) {
      return hadithCache[cacheKey];
    }

    // 1. Check bundled collections first
    const bundledAll = this.getAllBundledHadiths(bookId);
    if (bundledAll) {
      const match = bundledAll.find((h) => parseHadithNum(h.hadithNumber) === hadithNumber);
      if (match) {
        hadithCache[cacheKey] = match;
        return match;
      }
    }

    // 2. Fetch from API for canonical books
    const normId = normalizeBookId(bookId);
    const benUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${normId}/${hadithNumber}.min.json`;
    const araUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${normId}/${hadithNumber}.min.json`;

    try {
      const [benRes, araRes] = await Promise.all([
        fetch(benUrl),
        fetch(araUrl).catch(() => null)
      ]);

      if (!benRes.ok) return null;

      const benData = await benRes.json();
      const rawHadith = benData.hadiths?.[0];
      if (!rawHadith) return null;

      let arabicText = '';
      if (araRes && araRes.ok) {
        try {
          const araData = await araRes.json();
          arabicText = araData.hadiths?.[0]?.text || '';
        } catch {}
      }

      const secObj = benData.metadata?.section || benData.metadata?.sections || {};
      const secName = Object.values(secObj)[0] || 'হাদিস সংকলন';
      const bnSec = BENGALI_CHAPTER_MAP[String(secName)] || String(secName);

      const item: HadithItem = {
        id: `${bookId}_${rawHadith.hadithnumber}`,
        bookId,
        hadithNumber: `হাদিস নং ${rawHadith.hadithnumber}`,
        chapter: bnSec,
        narrator: extractNarrator(rawHadith.text || ''),
        arabic: arabicText,
        translation: cleanHadithText(rawHadith.text || ''),
        grade: determineGrade(rawHadith.grades, rawHadith.text || ''),
        reference: extractReference(rawHadith.text || '', bookTitle, rawHadith.hadithnumber)
      };

      hadithCache[cacheKey] = item;
      return item;
    } catch (e) {
      console.warn(`Error fetching hadith ${hadithNumber} for ${bookId}:`, e);
      return null;
    }
  }
}

// Helpers
function parseHadithNum(label: string): number {
  const match = label.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function extractSectionsFromList(list: any[], _bookId?: string): BookSectionDetail[] {
  const chapterMap = new Map<string, { first: number; last: number; count: number }>();
  list.forEach((item) => {
    const ch = item.chapter || 'সাধারণ';
    const num = item.hadithnumber || 1;
    if (!chapterMap.has(ch)) {
      chapterMap.set(ch, { first: num, last: num, count: 1 });
    } else {
      const curr = chapterMap.get(ch)!;
      curr.last = Math.max(curr.last, num);
      curr.count += 1;
    }
  });

  const sections: BookSectionDetail[] = [];
  let secIdx = 1;
  chapterMap.forEach((meta, chName) => {
    sections.push({
      sectionNumber: secIdx,
      englishTitle: chName,
      bengaliTitle: chName,
      firstHadithNumber: meta.first,
      lastHadithNumber: meta.last,
      count: meta.count
    });
    secIdx++;
  });

  return sections;
}

function mapBundledToHadithItems(list: any[], bookId: string): HadithItem[] {
  return list.map((h) => ({
    id: `${bookId}_${h.hadithnumber}`,
    bookId,
    hadithNumber: `হাদিস নং ${h.hadithnumber}`,
    chapter: h.chapter || 'হাদিস সংকলন',
    narrator: h.narrator || extractNarrator(h.text || ''),
    arabic: h.arabicText || '',
    translation: cleanHadithText(h.text || ''),
    grade: (h.grade as any) || 'সহীহ',
    reference: h.reference || `হাদিস নং ${h.hadithnumber}`,
    explanation: h.explanation
  }));
}

function extractNarrator(text: string): string {
  const match1 = text.match(/([^\n।]+?(?:হতে বর্ণিত|\(রাঃ\)[^।\n]*?বলেন|\(রাঃ\)[^।\n]*?বর্ণনা করেছেন))/);
  if (match1 && match1[1].length < 120) {
    return match1[1].trim();
  }
  return 'সাহাবী (রাঃ)';
}

function cleanHadithText(text: string): string {
  return text.trim();
}

function extractReference(text: string, defaultBook: string, hadithNum: number): string {
  const match = text.match(/\[([^\]]+)\]$/) || text.match(/\(([^)]*(?:আধুনিক|ইসলামিক|মুসলিম|বুখারী)[^)]*)\)/);
  if (match && match[1]) {
    return `${defaultBook}: ${match[1].trim()}`;
  }
  return `${defaultBook}: হাদিস নং ${hadithNum}`;
}

function determineGrade(grades: any[], text: string): 'সহীহ' | 'হাসান' | 'মুতাওয়াতির' | 'হাসান সহীহ' {
  if (Array.isArray(grades) && grades.length > 0) {
    const g = String(grades[0]?.grade || '').toLowerCase();
    if (g.includes('sahih')) return 'সহীহ';
    if (g.includes('hasan')) return 'হাসান';
  }
  if (text.includes('সহীহ') || text.includes('বুখারী') || text.includes('মুসলিম')) {
    return 'সহীহ';
  }
  return 'সহীহ';
}
