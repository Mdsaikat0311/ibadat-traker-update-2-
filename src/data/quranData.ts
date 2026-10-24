import { convertEnTransliterationToBengali, arabicToBengaliPronunciation } from '../utils/quranTransliteration';
export { convertEnTransliterationToBengali, arabicToBengaliPronunciation };

export interface SurahMeta {
  number: number;
  name: string; // Arabic name
  englishName: string;
  banglaName: string;
  revelationType: 'MECCAN' | 'MEDINAN';
  revelationTypeBn: string;
  numberOfAyahs: number;
  startJuz: number;
  startPage: number;
}

export interface Ayah {
  numberInSurah: number;
  numberInQuran: number;
  textArabic: string;
  transliterationBn: string;
  translationBn: string;
  audioUrl?: string;
  juz?: number;
  page?: number;
}

export interface JuzMeta {
  number: number;
  nameArabic: string;
  nameBn: string;
  startSurahNumber: number;
  startSurahName: string;
  startAyah: number;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber?: number;
  createdAt: number;
  note?: string;
}

// 30 Juz metadata
export const JUZ_LIST: JuzMeta[] = [
  { number: 1, nameArabic: "الم", nameBn: "আলিফ লাম মীম", startSurahNumber: 1, startSurahName: "Al-Fatihah", startAyah: 1 },
  { number: 2, nameArabic: "سَيَقُولُ", nameBn: "সায়াকুলু", startSurahNumber: 2, startSurahName: "Al-Baqarah", startAyah: 142 },
  { number: 3, nameArabic: "تِلْكَ الرُّسُلُ", nameBn: "তিলকার রুসুলু", startSurahNumber: 2, startSurahName: "Al-Baqarah", startAyah: 253 },
  { number: 4, nameArabic: "لَنْ تَنَالُوا", nameBn: "লান তানালু", startSurahNumber: 3, startSurahName: "Ali 'Imran", startAyah: 93 },
  { number: 5, nameArabic: "وَالْمُحْصَنَاتُ", nameBn: "ওয়াল মুহসানাতু", startSurahNumber: 4, startSurahName: "An-Nisa'", startAyah: 24 },
  { number: 6, nameArabic: "لَا يُحِبُّ اللَّهُ", nameBn: "লা ইউহিব্বুল্লাহু", startSurahNumber: 4, startSurahName: "An-Nisa'", startAyah: 148 },
  { number: 7, nameArabic: "وَإِذَا سَمِعُوا", nameBn: "ওয়া ইযা সামিউ", startSurahNumber: 5, startSurahName: "Al-Ma'idah", startAyah: 82 },
  { number: 8, nameArabic: "وَلَوْ أَنَّنَا", nameBn: "ওয়া লাও আন্নানা", startSurahNumber: 6, startSurahName: "Al-An'am", startAyah: 111 },
  { number: 9, nameArabic: "قَالَ الْمَلَأُ", nameBn: "ক্বালাল মালাউ", startSurahNumber: 7, startSurahName: "Al-A'raf", startAyah: 88 },
  { number: 10, nameArabic: "وَاعْلَمُوا", nameBn: "ওয়া'লামু", startSurahNumber: 8, startSurahName: "Al-Anfal", startAyah: 41 },
  { number: 11, nameArabic: "يَعْتَذِرُونَ", nameBn: "ইয়া'তাযিরূনা", startSurahNumber: 9, startSurahName: "At-Tawbah", startAyah: 93 },
  { number: 12, nameArabic: "وَمَا مِنْ دَابَّةٍ", nameBn: "ওয়া মা মিন দা-ব্বাতিন", startSurahNumber: 11, startSurahName: "Hud", startAyah: 6 },
  { number: 13, nameArabic: "وَمَا أُبَرِّئُ", nameBn: "ওয়া মা উবাররিউ", startSurahNumber: 12, startSurahName: "Yusuf", startAyah: 53 },
  { number: 14, nameArabic: "رُبَمَا", nameBn: "রুবা-মা", startSurahNumber: 15, startSurahName: "Al-Hijr", startAyah: 1 },
  { number: 15, nameArabic: "سُبْحَانَ الَّذِي", nameBn: "সুবহানাল্লাযী", startSurahNumber: 17, startSurahName: "Al-Isra'", startAyah: 1 },
  { number: 16, nameArabic: "قَالَ أَلَمْ", nameBn: "ক্বালা আলাম", startSurahNumber: 18, startSurahName: "Al-Kahf", startAyah: 75 },
  { number: 17, nameArabic: "اقْتَرَبَ لِلنَّاسِ", nameBn: "ইক্বতারা বা লিন্নাস", startSurahNumber: 21, startSurahName: "Al-Anbiya'", startAyah: 1 },
  { number: 18, nameArabic: "قَدْ أَفْلَحَ", nameBn: "ক্বাদ আফলাহা", startSurahNumber: 23, startSurahName: "Al-Mu'minun", startAyah: 1 },
  { number: 19, nameArabic: "وَقَالَ الَّذِينَ", nameBn: "ওয়া ক্বালাল্লাযীনা", startSurahNumber: 25, startSurahName: "Al-Furqan", startAyah: 21 },
  { number: 20, nameArabic: "أَمَّنْ خَلَقَ", nameBn: "আম্মান খালাক্বা", startSurahNumber: 27, startSurahName: "An-Naml", startAyah: 56 },
  { number: 21, nameArabic: "اتْلُ مَا أُوحِيَ", nameBn: "উতলু মা উহিয়া", startSurahNumber: 29, startSurahName: "Al-'Ankabut", startAyah: 46 },
  { number: 22, nameArabic: "وَمَنْ يَقْنُتْ", nameBn: "ওয়া মাই ইয়াক্বনুত", startSurahNumber: 33, startSurahName: "Al-Ahzab", startAyah: 31 },
  { number: 23, nameArabic: "وَمَا لِيَ", nameBn: "ওয়ামালিয়া", startSurahNumber: 36, startSurahName: "Ya-Sin", startAyah: 28 },
  { number: 24, nameArabic: "فَمَنْ أَظْلَمُ", nameBn: "ফামান আজলামু", startSurahNumber: 39, startSurahName: "Az-Zumar", startAyah: 32 },
  { number: 25, nameArabic: "إِلَيْهِ يُرَدُّ", nameBn: "ইলাইহি ইউরাদ্দু", startSurahNumber: 41, startSurahName: "Fussilat", startAyah: 47 },
  { number: 26, nameArabic: "حم", nameBn: "হা-মীম", startSurahNumber: 46, startSurahName: "Al-Ahqaf", startAyah: 1 },
  { number: 27, nameArabic: "قَالَ فَمَا خَطْبُكُمْ", nameBn: "ক্বালা ফামা খাতবুকুম", startSurahNumber: 51, startSurahName: "Adh-Dhariyat", startAyah: 31 },
  { number: 28, nameArabic: "قَدْ سَمِعَ اللَّهُ", nameBn: "ক্বাদ সামি'আল্লাহু", startSurahNumber: 58, startSurahName: "Al-Mujadila", startAyah: 1 },
  { number: 29, nameArabic: "تَبَارَكَ الَّذِي", nameBn: "তাবা-রাকাল্লাযী", startSurahNumber: 67, startSurahName: "Al-Mulk", startAyah: 1 },
  { number: 30, nameArabic: "عَمَّ", nameBn: "আম্মা ইয়াতাসা'আলূন", startSurahNumber: 78, startSurahName: "An-Naba'", startAyah: 1 },
];

// All 114 Surahs complete list with exact English & Bengali names, revelation place, and ayah count
export const ALL_SURAHS: SurahMeta[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", banglaName: "আল-ফাতিহা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 7, startJuz: 1, startPage: 1 },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", banglaName: "আল-বাক্বারাহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 286, startJuz: 1, startPage: 2 },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", banglaName: "আলে ইমরান", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 200, startJuz: 3, startPage: 50 },
  { number: 4, name: "النساء", englishName: "An-Nisa'", banglaName: "আন-নিসা", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 176, startJuz: 4, startPage: 77 },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", banglaName: "আল-মায়িদাহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 120, startJuz: 6, startPage: 106 },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", banglaName: "আল-আনআম", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 165, startJuz: 7, startPage: 128 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", banglaName: "আল-আরাফ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 206, startJuz: 8, startPage: 151 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", banglaName: "আল-আনফাল", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 75, startJuz: 9, startPage: 177 },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", banglaName: "আত-তাওবাহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 129, startJuz: 10, startPage: 187 },
  { number: 10, name: "يونس", englishName: "Yunus", banglaName: "ইউনুস", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 109, startJuz: 11, startPage: 208 },
  { number: 11, name: "هود", englishName: "Hud", banglaName: "হুদ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 123, startJuz: 11, startPage: 221 },
  { number: 12, name: "يوسف", englishName: "Yusuf", banglaName: "ইউসুফ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 111, startJuz: 12, startPage: 235 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", banglaName: "আর-রাদ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 43, startJuz: 13, startPage: 249 },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", banglaName: "ইব্রাহীম", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 52, startJuz: 13, startPage: 255 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", banglaName: "আল-হিজর", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 99, startJuz: 14, startPage: 262 },
  { number: 16, name: "النحل", englishName: "An-Nahl", banglaName: "আন-নাহল", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 128, startJuz: 14, startPage: 267 },
  { number: 17, name: "الإسراء", englishName: "Al-Isra'", banglaName: "বনী ইসরাঈল (আল-ইসরা)", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 111, startJuz: 15, startPage: 282 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", banglaName: "আল-কাহফ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 110, startJuz: 15, startPage: 293 },
  { number: 19, name: "مريم", englishName: "Maryam", banglaName: "মারইয়াম", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 98, startJuz: 16, startPage: 305 },
  { number: 20, name: "طه", englishName: "Ta-Ha", banglaName: "ত্বা-হা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 135, startJuz: 16, startPage: 312 },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya'", banglaName: "আল-আম্বিয়া", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 112, startJuz: 17, startPage: 322 },
  { number: 22, name: "الحج", englishName: "Al-Hajj", banglaName: "আল-হাজ্জ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 78, startJuz: 17, startPage: 332 },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", banglaName: "আল-মুমিনূন", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 118, startJuz: 18, startPage: 342 },
  { number: 24, name: "النور", englishName: "An-Nur", banglaName: "আন-নূর", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 64, startJuz: 18, startPage: 350 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", banglaName: "আল-ফুরক্বান", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 77, startJuz: 18, startPage: 359 },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", banglaName: "আশ-শুআরা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 227, startJuz: 19, startPage: 367 },
  { number: 27, name: "النمل", englishName: "An-Naml", banglaName: "আন-নামল", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 93, startJuz: 19, startPage: 377 },
  { number: 28, name: "القصص", englishName: "Al-Qasas", banglaName: "আল-ক্বাসাস", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 88, startJuz: 20, startPage: 385 },
  { number: 29, name: "العنكبوت", englishName: "Al-'Ankabut", banglaName: "আল-আনকাবূত", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 69, startJuz: 20, startPage: 396 },
  { number: 30, name: "الروم", englishName: "Ar-Rum", banglaName: "আর-রূম", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 60, startJuz: 21, startPage: 404 },
  { number: 31, name: "لقمان", englishName: "Luqman", banglaName: "লুক্বমান", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 34, startJuz: 21, startPage: 411 },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", banglaName: "আস-সাজদাহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 30, startJuz: 21, startPage: 415 },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", banglaName: "আল-আহযাব", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 73, startJuz: 21, startPage: 418 },
  { number: 34, name: "سبإ", englishName: "Saba", banglaName: "সাবা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 54, startJuz: 22, startPage: 428 },
  { number: 35, name: "فاطر", englishName: "Fatir", banglaName: "ফাতির", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 45, startJuz: 22, startPage: 434 },
  { number: 36, name: "يس", englishName: "Ya-Sin", banglaName: "ইয়া-সীন", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 83, startJuz: 22, startPage: 440 },
  { number: 37, name: "الصافات", englishName: "As-Saffat", banglaName: "আস-সাফফাত", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 182, startJuz: 23, startPage: 446 },
  { number: 38, name: "ص", englishName: "Sad", banglaName: "ছোয়াদ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 88, startJuz: 23, startPage: 453 },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", banglaName: "আয-যুমার", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 75, startJuz: 23, startPage: 458 },
  { number: 40, name: "غافر", englishName: "Ghafir", banglaName: "আল-মু'মিন (গাফির)", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 85, startJuz: 24, startPage: 467 },
  { number: 41, name: "فصلت", englishName: "Fussilat", banglaName: "ফুসসিলাত", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 54, startJuz: 24, startPage: 477 },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", banglaName: "আশ-শূরা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 53, startJuz: 25, startPage: 483 },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", banglaName: "আয-যুখরুফ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 89, startJuz: 25, startPage: 489 },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", banglaName: "আদ-দুখান", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 59, startJuz: 25, startPage: 496 },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", banglaName: "আল-জাসিয়াহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 37, startJuz: 25, startPage: 499 },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", banglaName: "আল-আহক্বাফ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 35, startJuz: 26, startPage: 502 },
  { number: 47, name: "محمد", englishName: "Muhammad", banglaName: "মুহাম্মাদ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 38, startJuz: 26, startPage: 507 },
  { number: 48, name: "الفتح", englishName: "Al-Fath", banglaName: "আল-ফাতহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 29, startJuz: 26, startPage: 511 },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", banglaName: "আল-হুজুরাত", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 18, startJuz: 26, startPage: 515 },
  { number: 50, name: "ق", englishName: "Qaf", banglaName: "ক্বাফ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 45, startJuz: 26, startPage: 518 },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", banglaName: "আয-যারিয়াত", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 60, startJuz: 26, startPage: 520 },
  { number: 52, name: "الطور", englishName: "At-Tur", banglaName: "আত-তূর", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 49, startJuz: 27, startPage: 523 },
  { number: 53, name: "النجم", englishName: "An-Najm", banglaName: "আন-নাজম", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 62, startJuz: 27, startPage: 526 },
  { number: 54, name: "القمر", englishName: "Al-Qamar", banglaName: "আল-ক্বামার", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 55, startJuz: 27, startPage: 528 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", banglaName: "আর-রাহমান", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 78, startJuz: 27, startPage: 531 },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", banglaName: "আল-ওয়াক্বিয়াহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 96, startJuz: 27, startPage: 534 },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", banglaName: "আল-হাদীদ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 29, startJuz: 27, startPage: 537 },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", banglaName: "আল-মুজাদালাহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 22, startJuz: 28, startPage: 542 },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", banglaName: "আল-হাশর", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 24, startJuz: 28, startPage: 545 },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", banglaName: "আল-মুমতাহানাহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 13, startJuz: 28, startPage: 549 },
  { number: 61, name: "الصف", englishName: "As-Saff", banglaName: "আস-সাফ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 14, startJuz: 28, startPage: 551 },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", banglaName: "আল-জুমুআহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 11, startJuz: 28, startPage: 553 },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", banglaName: "আল-মুনাফিকূন", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 11, startJuz: 28, startPage: 554 },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", banglaName: "আত-তাগাবুন", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 18, startJuz: 28, startPage: 556 },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", banglaName: "আত-ত্বালাক্ব", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 12, startJuz: 28, startPage: 558 },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", banglaName: "আত-তাহরীম", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 12, startJuz: 28, startPage: 560 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", banglaName: "আল-মুলক", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 30, startJuz: 29, startPage: 562 },
  { number: 68, name: "القلم", englishName: "Al-Qalam", banglaName: "আল-ক্বলম", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 52, startJuz: 29, startPage: 564 },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", banglaName: "আল-হাক্বক্বাহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 52, startJuz: 29, startPage: 566 },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", banglaName: "আল-মাআরিজ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 44, startJuz: 29, startPage: 568 },
  { number: 71, name: "نوح", englishName: "Nuh", banglaName: "নূহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 28, startJuz: 29, startPage: 570 },
  { number: 72, name: "الجن", englishName: "Al-Jinn", banglaName: "আল-জিন", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 28, startJuz: 29, startPage: 572 },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", banglaName: "আল-মুযযাম্মিল", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 20, startJuz: 29, startPage: 574 },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", banglaName: "আল-মুদ্দাসসির", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 56, startJuz: 29, startPage: 575 },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", banglaName: "আল-ক্বিয়ামাহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 40, startJuz: 29, startPage: 577 },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", banglaName: "আল-ইনসান (আদ-দাহর)", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 31, startJuz: 29, startPage: 578 },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", banglaName: "আল-মুরসালাত", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 50, startJuz: 29, startPage: 580 },
  { number: 78, name: "النبإ", englishName: "An-Naba'", banglaName: "আন-নাবা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 40, startJuz: 30, startPage: 582 },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", banglaName: "আন-নাযিআত", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 46, startJuz: 30, startPage: 583 },
  { number: 80, name: "عبس", englishName: "'Abasa", banglaName: "আবাসা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 42, startJuz: 30, startPage: 585 },
  { number: 81, name: "التكوير", englishName: "At-Takwir", banglaName: "আত-তাকবীর", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 29, startJuz: 30, startPage: 586 },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", banglaName: "আল-ইনফিতার", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 19, startJuz: 30, startPage: 587 },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", banglaName: "আল-মুতাফফিফীন", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 36, startJuz: 30, startPage: 587 },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", banglaName: "আল-ইনশিক্বাক্ব", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 25, startJuz: 30, startPage: 589 },
  { number: 85, name: "البروج", englishName: "Al-Buruj", banglaName: "আল-বুরূজ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 22, startJuz: 30, startPage: 590 },
  { number: 86, name: "الطارق", englishName: "At-Tariq", banglaName: "আত-তারিক্ব", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 17, startJuz: 30, startPage: 591 },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", banglaName: "আল-আলা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 19, startJuz: 30, startPage: 591 },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", banglaName: "আল-গাশিয়াহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 26, startJuz: 30, startPage: 592 },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", banglaName: "আল-ফজর", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 30, startJuz: 30, startPage: 593 },
  { number: 90, name: "البلد", englishName: "Al-Balad", banglaName: "আল-বালাদ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 20, startJuz: 30, startPage: 594 },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", banglaName: "আশ-শামস", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 15, startJuz: 30, startPage: 595 },
  { number: 92, name: "الليل", englishName: "Al-Layl", banglaName: "আল-লাইল", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 21, startJuz: 30, startPage: 595 },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", banglaName: "আদ-দুহা", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 11, startJuz: 30, startPage: 596 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", banglaName: "আল-ইনশিরাহ (আশ-শারহ)", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 8, startJuz: 30, startPage: 596 },
  { number: 95, name: "التين", englishName: "At-Tin", banglaName: "আত-তীন", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 8, startJuz: 30, startPage: 597 },
  { number: 96, name: "العلق", englishName: "Al-'Alaq", banglaName: "আল-আলাক্ব", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 19, startJuz: 30, startPage: 597 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", banglaName: "আল-ক্বাদর", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 5, startJuz: 30, startPage: 598 },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", banglaName: "আল-বায়্যিনাহ", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 8, startJuz: 30, startPage: 598 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", banglaName: "যিলযাল (আয-যালযালাহ)", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 8, startJuz: 30, startPage: 599 },
  { number: 100, name: "العاديات", englishName: "Al-'Adiyat", banglaName: "আল-আদিয়াত", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 11, startJuz: 30, startPage: 599 },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", banglaName: "আল-ক্বারিয়াহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 11, startJuz: 30, startPage: 600 },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", banglaName: "আত-তাকাসুর", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 8, startJuz: 30, startPage: 600 },
  { number: 103, name: "العصر", englishName: "Al-'Asr", banglaName: "আল-আসর", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 3, startJuz: 30, startPage: 601 },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", banglaName: "আল-হুমাযাহ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 9, startJuz: 30, startPage: 601 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", banglaName: "আল-ফীল", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 5, startJuz: 30, startPage: 601 },
  { number: 106, name: "قريش", englishName: "Quraysh", banglaName: "কুরাইশ", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 4, startJuz: 30, startPage: 602 },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", banglaName: "আল-মাউন", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 7, startJuz: 30, startPage: 602 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", banglaName: "আল-কাউসার", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 3, startJuz: 30, startPage: 602 },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", banglaName: "আল-কাফিরূন", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 6, startJuz: 30, startPage: 603 },
  { number: 110, name: "النصر", englishName: "An-Nasr", banglaName: "আন-নাসর", revelationType: "MEDINAN", revelationTypeBn: "মাদানী", numberOfAyahs: 3, startJuz: 30, startPage: 603 },
  { number: 111, name: "المسد", englishName: "Al-Masad", banglaName: "আল-লাহাব (আল-মাসাদ)", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 5, startJuz: 30, startPage: 603 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", banglaName: "আল-ইখলাস", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 4, startJuz: 30, startPage: 604 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", banglaName: "আল-ফালাক্ব", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 5, startJuz: 30, startPage: 604 },
  { number: 114, name: "الناس", englishName: "An-Nas", banglaName: "আন-নাস", revelationType: "MECCAN", revelationTypeBn: "মাক্কী", numberOfAyahs: 6, startJuz: 30, startPage: 604 }
];

// Pre-bundled Surah 1 (Al-Fatihah) exactly as depicted in Screenshot 2
export const SURAH_FAT_IHAH_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 1,
    textArabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    transliterationBn: "বিছমিল্লাহির রাহমানির রাহিম।",
    translationBn: "(আরম্ভ করছি) পরম করুণাময় অসীম দয়াময় আল্লাহর নামে।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 2,
    textArabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
    transliterationBn: "আল হামদুলিল্লা-হি রাব্বিল ‘আ-লামীন।",
    translationBn: "যাবতীয় প্রশংসা জগৎসমূহের প্রতিপালক আল্লাহরই জন্য।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 3,
    textArabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    transliterationBn: "আররাহমা-নির রাহীম।",
    translationBn: "যিনি পরম করুণাময় অতি দয়ালু।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3"
  },
  {
    numberInSurah: 4,
    numberInQuran: 4,
    textArabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
    transliterationBn: "মা-লিকি ইয়াওমিদ্দীন।",
    translationBn: "যিনি প্রতিফল দিবসের মালিক।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3"
  },
  {
    numberInSurah: 5,
    numberInQuran: 5,
    textArabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    transliterationBn: "ইয়্যা-কা না'বুদুওয়া ইয়্যা-কা নাছতা'ঈন।",
    translationBn: "আমরা কেবল তোমারই ‘ইবাদাত করি এবং কেবলমাত্র তোমারই সাহায্য প্রার্থনা করি।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3"
  },
  {
    numberInSurah: 6,
    numberInQuran: 6,
    textArabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    transliterationBn: "ইহদিনাসসিরা-তাল মুছতাক্বীম।",
    translationBn: "আমাদেরকে সরল সঠিক পথ প্রদর্শন কর ও তার প্রতি অটুট থাকার তাওফীক দান কর।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3"
  },
  {
    numberInSurah: 7,
    numberInQuran: 7,
    textArabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
    transliterationBn: "সিরা-তাল্লাযীনা আন'আমতা 'আলাইহিম। গাইরিল মাগদূ বি 'আলাইহিম ওয়ালাদ্দাল্লীন।",
    translationBn: "তাদের পথ, যাদের প্রতি তুমি অনুগ্রহ করেছ। তাদের পথ, যারা গযবপ্রাপ্ত (ইয়াহূদী) ও পথভ্রষ্ট (খ্রিস্টান) নয়।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3"
  }
];

// Pre-bundled Surah 112 (Al-Ikhlas)
export const SURAH_IKHLAS_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6222,
    textArabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
    transliterationBn: "ক্বুল হুওয়াল্লা-হু আহাদ।",
    translationBn: "বলুন, তিনিই আল্লাহ, একক-অদ্বিতীয়।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6223,
    textArabic: "ٱللَّهُ ٱلصَّمَدُ",
    transliterationBn: "আল্লা-হুস সামাদ।",
    translationBn: "আল্লাহ অমুখাপেক্ষী (সকলের আশ্রয়)।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6224,
    textArabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    transliterationBn: "লাম ইয়ালিদ ওয়া লাম ইউলাদ।",
    translationBn: "তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3"
  },
  {
    numberInSurah: 4,
    numberInQuran: 6225,
    textArabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
    transliterationBn: "ওয়া লাম ইয়াকুল লাহু কুফুওয়ান আহাদ।",
    translationBn: "এবং তাঁর সমতুল্য কেউই নেই।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3"
  }
];

// Pre-bundled Surah 113 (Al-Falaq)
export const SURAH_FALAQ_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6226,
    textArabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
    transliterationBn: "কুল আ'ঊযুবিরাব্বিল ফালাক্ব",
    translationBn: "বল, 'আমি আশ্রয় চাচ্ছি সকাল বেলার রব-এর,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6227,
    textArabic: "مِن شَرِّ مَا خَلَقَ",
    transliterationBn: "মিন শাররি মা-খালাক্ব।",
    translationBn: "তিনি যা সৃষ্টি করেছেন তার অনিষ্ট হতে,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6227.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6228,
    textArabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
    transliterationBn: "ওয়া মিন শাররি গা-ছিকিন ইযা-ওয়াক্বাব।",
    translationBn: "আর অন্ধকার রাতের অনিষ্ট হতে যখন তা আচ্ছন্ন হয়ে যায়।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6228.mp3"
  },
  {
    numberInSurah: 4,
    numberInQuran: 6229,
    textArabic: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
    transliterationBn: "ওয়া মিন শাররিন নাফফা-ছা-তি ফিল 'উক্বাদ।",
    translationBn: "এবং (জাদু করার উদ্দেশ্যে) গিরায় ফুৎকারকারিণীদের অনিষ্ট হতে,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6229.mp3"
  },
  {
    numberInSurah: 5,
    numberInQuran: 6230,
    textArabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    transliterationBn: "ওয়া মিন শাররি হা-ছিদিন ইযা-হাছাদ।",
    translationBn: "এবং হিংসুকের অনিষ্ট হতে, যখন সে হিংসা করে।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6230.mp3"
  }
];

// Pre-bundled Surah 114 (An-Nas)
export const SURAH_NAS_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6231,
    textArabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
    transliterationBn: "কুল আ'ঊযুবিরাব্বিন্না-ছ,",
    translationBn: "বল, 'আমি আশ্রয় চাচ্ছি মানুষের প্রতিপালকের,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6231.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6232,
    textArabic: "مَلِكِ ٱلنَّاسِ",
    transliterationBn: "মালিকিন্না-ছ,",
    translationBn: "মানুষের অধিপতির,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6232.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6233,
    textArabic: "إِلَٰهِ ٱلنَّاسِ",
    transliterationBn: "ইলা-হিন্না-ছ।",
    translationBn: "মানুষের প্রকৃত ইলাহর,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6233.mp3"
  },
  {
    numberInSurah: 4,
    numberInQuran: 6234,
    textArabic: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
    transliterationBn: "মিন শাররিল ওয়াছ ওয়া-ছিল খান্না-ছ।",
    translationBn: "যে নিজেকে লুকিয়ে রেখে বার বার এসে কুমন্ত্রণা দেয় তার অনিষ্ট হতে,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6234.mp3"
  },
  {
    numberInSurah: 5,
    numberInQuran: 6235,
    textArabic: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
    transliterationBn: "আল্লাযী ইউওয়াছবিছুফী ছুদূরিন্নাছ-।",
    translationBn: "যে কুমন্ত্রণা দেয় মানুষের অন্তরে",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6235.mp3"
  },
  {
    numberInSurah: 6,
    numberInQuran: 6236,
    textArabic: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
    transliterationBn: "মিনাল জিন্নাতি ওয়ান্না-ছ।",
    translationBn: "(এই কুমন্ত্রণাদাতা হচ্ছে) জ্বিনের মধ্য হতে এবং মানুষের মধ্য হতে।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3"
  }
];

// Pre-bundled Surah 108 (Al-Kawthar)
export const SURAH_KAWTHAR_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6205,
    textArabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    transliterationBn: "ইন্না- আ'তাইনা-কাল কাওছার।",
    translationBn: "নিশ্চয় আমি তোমাকে কাওছার দান করেছি।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6205.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6206,
    textArabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
    transliterationBn: "ফাছাল্লি লিরাব্বিকা ওয়ানহার।",
    translationBn: "অতএব তোমার প্রতিপালকের উদ্দেশ্যে সালাত আদায় কর এবং কুরবানী কর।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6206.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6207,
    textArabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
    transliterationBn: "ইন্না শা-নিআকা হুওয়াল আবতার।",
    translationBn: "নিশ্চয় তোমার প্রতি বিদ্বেষ পোষণকারীই তো নির্বংশ।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6207.mp3"
  }
];

// Pre-bundled Surah 109 (Al-Kafirun)
export const SURAH_KAFIRUN_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6208,
    textArabic: "قُلْ يَا أَيُّهَا الْكَافِرُونَ",
    transliterationBn: "ক্বুল ইয়া- আইয়ুহাল কা-ফিরূন।",
    translationBn: "বল, ‘হে কাফিররা!’",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6208.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6209,
    textArabic: "لَا أَعْبُدُ مَا تَعْبُدُونَ",
    transliterationBn: "লা- আ’বুদু মা- তা’বুদূন।",
    translationBn: "‘আমি তার ইবাদাত করি না যার ইবাদাত তোমরা কর,’",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6209.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6210,
    textArabic: "وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ",
    transliterationBn: "ওয়ালা- আনতুম ‘আ-বিদূনা মা- আ’বুদ।",
    translationBn: "‘এবং তোমরাও তার ইবাদাতকারী নও যার ইবাদাত আমি করি,’",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6210.mp3"
  },
  {
    numberInSurah: 4,
    numberInQuran: 6211,
    textArabic: "وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ",
    transliterationBn: "ওয়ালা- আনা ‘আ-বিদুম মা- ‘আবাদতুম।",
    translationBn: "‘এবং আমি তার ইবাদাতকারী হব না যার ইবাদাত তোমরা করে আসছ,’",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6211.mp3"
  },
  {
    numberInSurah: 5,
    numberInQuran: 6212,
    textArabic: "وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ",
    transliterationBn: "ওয়ালা- আনতুম ‘আ-বিদূনা মা- আ’বুদ।",
    translationBn: "‘এবং তোমরাও তার ইবাদাতকারী হবে না যার ইবাদাত আমি করি।’",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6212.mp3"
  },
  {
    numberInSurah: 6,
    numberInQuran: 6213,
    textArabic: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
    transliterationBn: "লাকুম দীনুকুম ওয়ালিয়া দীন।",
    translationBn: "‘তোমাদের জন্য তোমাদের দীন আর আমার জন্য আমার দীন।’",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6213.mp3"
  }
];

// Pre-bundled Surah 110 (An-Nasr)
export const SURAH_NASR_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6214,
    textArabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
    transliterationBn: "ইযা- জা-আ নাসরুল্লাহি ওয়াল ফাতহু।",
    translationBn: "যখন আল্লাহর সাহায্য ও বিজয় আসবে,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6214.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6215,
    textArabic: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا",
    transliterationBn: "ওয়া রাআইতান না-ছা ইয়াদখুলূনা ফী দীনিল্লাহি আফওয়া-জা-।",
    translationBn: "এবং তুমি মানুষকে দলে দলে আল্লাহর দীনে প্রবেশ করতে দেখবে,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6215.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6216,
    textArabic: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا",
    transliterationBn: "ফাসাব্বিহ বিহামদি রাব্বিকা ওয়াসতাগফিরহু, ইন্নাহু কা-না তাওওয়া-বা-।",
    translationBn: "তখন তুমি তোমার প্রতিপালকের প্রশংসার সাথে তাঁর পবিত্রতা বর্ণনা কর এবং তাঁর নিকট ক্ষমা প্রার্থনা কর; নিশ্চয় তিনি অধিক তাওবাহ কবূলকারী।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6216.mp3"
  }
];

// Pre-bundled Surah 111 (Al-Masad)
export const SURAH_MASAD_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6217,
    textArabic: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ",
    transliterationBn: "তাব্বাত ইয়াদা- আবী লাহাবিঁও ওয়াতাব্ব।",
    translationBn: "ধ্বংস হোক আবু লাহাবের দু’হাত এবং ধ্বংস হোক সে নিজেও।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6217.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6218,
    textArabic: "مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ",
    transliterationBn: "মা- আগনা- ‘আনহু মা-লুহু ওয়ামা- কাসাব।",
    translationBn: "তার ধন-সম্পদ ও যা সে অর্জন করেছে তা তার কোন উপকারে আসেনি।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6218.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6219,
    textArabic: "سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ",
    transliterationBn: "সাইয়াসলা- না-রান যা-তা লাহাব।",
    translationBn: "শীঘ্রই সে প্রবেশ করবে লেলিহান আগুনে,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6219.mp3"
  },
  {
    numberInSurah: 4,
    numberInQuran: 6220,
    textArabic: "وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ",
    transliterationBn: "ওয়ামরাআতুহু হাম্মা-লাতাল হাতাব।",
    translationBn: "এবং তার স্ত্রীও, যে কাঠ বহনকারিণী;",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6220.mp3"
  },
  {
    numberInSurah: 5,
    numberInQuran: 6221,
    textArabic: "فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ",
    transliterationBn: "ফী জীদিহা- হাবলুম মিম মাসাদ।",
    translationBn: "তার গলদেশে পাকানো রশি।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6221.mp3"
  }
];

// Pre-bundled Surah 103 (Al-'Asr)
export const SURAH_ASR_AYAHS: Ayah[] = [
  {
    numberInSurah: 1,
    numberInQuran: 6177,
    textArabic: "وَالْعَصْرِ",
    transliterationBn: "ওয়াল ‘আস্র।",
    translationBn: "সময়ের শপথ,",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6177.mp3"
  },
  {
    numberInSurah: 2,
    numberInQuran: 6178,
    textArabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
    transliterationBn: "ইন্নাল ইনসা-না লাফী খুস্র্।",
    translationBn: "নিশ্চয় মানুষ ক্ষতির মধ্যে নিমজ্জিত।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6178.mp3"
  },
  {
    numberInSurah: 3,
    numberInQuran: 6179,
    textArabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    transliterationBn: "ইল্লাল্লাযীনা আ-মানূ ওয়া ‘আমিলুস স-লিহা-তি ওয়া তাওয়া-সাও বিল হাক্বক্বি ওয়া তাওয়া-সাও বিস সাব্র্।",
    translationBn: "তবে তারা ছাড়া যারা ঈমান এনেছে এবং সৎকর্ম করেছে আর একে অপরকে হকের উপদেশ দিয়েছে ও একে অপরকে ধৈর্যের উপদেশ দিয়েছে।",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6179.mp3"
  }
];

// Helper to convert number to Bengali numeral
export const toBengaliNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
};

// Helper to convert number to Arabic-Indic numeral (for Ayah end symbols)
export const toArabicNumber = (num: number | string): string => {
  const arDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => arDigits[parseInt(d, 10)]);
};

// Fetch full Surah from API with guaranteed Bengali transliteration and caching
export const fetchSurahAyahs = async (surahNumber: number): Promise<Ayah[]> => {
  // Check static pre-bundled first for instant 0ms offline load
  if (surahNumber === 1) return SURAH_FAT_IHAH_AYAHS;
  if (surahNumber === 103) return SURAH_ASR_AYAHS;
  if (surahNumber === 108) return SURAH_KAWTHAR_AYAHS;
  if (surahNumber === 109) return SURAH_KAFIRUN_AYAHS;
  if (surahNumber === 110) return SURAH_NASR_AYAHS;
  if (surahNumber === 111) return SURAH_MASAD_AYAHS;
  if (surahNumber === 112) return SURAH_IKHLAS_AYAHS;
  if (surahNumber === 113) return SURAH_FALAQ_AYAHS;
  if (surahNumber === 114) return SURAH_NAS_AYAHS;

  const cacheKey = `ibadat_quran_surah_v5_${surahNumber}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.transliterationBn) {
        return parsed;
      }
    } catch {
      // Continue to fetch fresh
    }
  }

  try {
    // AlQuran Cloud API: fetch Uthmani Arabic, Bengali Translation (bn.bengali) and English Transliteration (en.transliteration)
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,bn.bengali,en.transliteration`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${surahNumber}`);
    }
    const json = await response.json();
    if (json.code !== 200 || !json.data || json.data.length < 2) {
      throw new Error(`Invalid data received for surah ${surahNumber}`);
    }

    const arabicEdition = json.data[0];
    const bengaliEdition = json.data[1];
    const translitEdition = json.data[2] || null;

    const ayahs: Ayah[] = arabicEdition.ayahs.map((arAyah: any, idx: number) => {
      const bnAyah = bengaliEdition.ayahs[idx] || {};
      const enTransAyah = translitEdition?.ayahs ? translitEdition.ayahs[idx] : null;

      let arabicText = arAyah.text || '';
      // Strip Bismillah if it's attached to verse 1 (except Surah Al-Fatihah)
      if (surahNumber !== 1 && surahNumber !== 9 && idx === 0) {
        const bismillahRegex = /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/;
        arabicText = arabicText.replace(bismillahRegex, '').trim() || arabicText;
      }

      // Convert phonetic English transliteration to Bengali or fallback to Arabic pronunciation
      let transliteration = '';
      if (enTransAyah?.text) {
        transliteration = convertEnTransliterationToBengali(enTransAyah.text);
      }
      if (!transliteration) {
        transliteration = arabicToBengaliPronunciation(arabicText);
      }

      const globalNumber = arAyah.number;

      return {
        numberInSurah: arAyah.numberInSurah,
        numberInQuran: globalNumber,
        textArabic: arabicText,
        transliterationBn: transliteration,
        translationBn: bnAyah.text || '',
        audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNumber}.mp3`,
        juz: arAyah.juz,
        page: arAyah.page
      };
    });

    try {
      localStorage.setItem(cacheKey, JSON.stringify(ayahs));
    } catch {
      // Storage might be full, safe to ignore
    }

    return ayahs;
  } catch (err) {
    console.warn(`Error fetching Surah ${surahNumber}:`, err);
    return [];
  }
};

// Bookmarks management
export const getBookmarks = (): QuranBookmark[] => {
  try {
    const raw = localStorage.getItem('ibadat_quran_bookmarks');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveBookmark = (bookmark: Omit<QuranBookmark, 'id' | 'createdAt'>): QuranBookmark[] => {
  const current = getBookmarks();
  const newBookmark: QuranBookmark = {
    ...bookmark,
    id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now()
  };
  const updated = [newBookmark, ...current.filter(b => !(b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber))];
  localStorage.setItem('ibadat_quran_bookmarks', JSON.stringify(updated));
  return updated;
};

export const removeBookmark = (id: string): QuranBookmark[] => {
  const current = getBookmarks();
  const updated = current.filter(b => b.id !== id);
  localStorage.setItem('ibadat_quran_bookmarks', JSON.stringify(updated));
  return updated;
};
