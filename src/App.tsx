import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { repository, IbadatRepository } from './data/repository';
import { DuaNote, TaskStats, ChampionInfo } from './types/ibadat';
import { TabId, BottomNav } from './components/BottomNav';
import { AppHeader } from './components/AppHeader';
import { DetailsDialog } from './components/dialogs/DetailsDialog';
import { ReminderDialog } from './components/dialogs/ReminderDialog';
import { NoteDetailDialog } from './components/dialogs/NoteDetailDialog';
import { LeaderboardDialog } from './components/dialogs/LeaderboardDialog';
import { CustomAlertDialog } from './components/dialogs/CustomAlertDialog';
import { getRandomHadithFromAllCollections } from './data/hadithBank';

import { AmalnamaScreen, AmalnamaSubTab } from './screens/AmalnamaScreen';
import { QuranScreen } from './screens/QuranScreen';
import { NotesScreen } from './screens/NotesScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { DuaScreen } from './screens/DuaScreen';
import { HadithScreen } from './screens/HadithScreen';
import { MoreScreen } from './screens/MoreScreen';
import { NotificationService } from './services/notificationService';
import { FCMService } from './services/fcmService';
import {
  auth,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  syncStateToFirebase,
  fetchUserCloudState,
  fetchUserRank,
  fetchFirebaseChampion,
  fetchUserAccountLifetimePoints,
  fetchUserPointsHistory,
  subscribeCommunityUsers,
  fetchAllCommunityUsers
} from './services/firebase';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('amalnama');
  const [amalnamaSubTab, setAmalnamaSubTab] = useState<AmalnamaSubTab>('salah');
  const [currentViewingDate, setCurrentViewingDate] = useState<string>(repository.getTodayKey());

  const [openAllahNamesInDua, setOpenAllahNamesInDua] = useState<boolean>(false);

  const handleTabChange = useCallback((tab: TabId) => {
    if (tab !== 'dua') {
      setOpenAllahNamesInDua(false);
    }
    if (tab === 'salah') {
      setActiveTab('amalnama');
      setAmalnamaSubTab('salah');
    } else if (tab === 'dhikr') {
      setActiveTab('amalnama');
      setAmalnamaSubTab('dhikr');
    } else {
      setActiveTab(tab);
    }
  }, []);

  const handleOpenAllahNames = useCallback(() => {
    setActiveTab('dua');
    setOpenAllahNamesInDua(true);
  }, []);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // State slices
  const [salahLog, setSalahLog] = useState<Record<string, boolean>>({});
  const [nawafilLog, setNawafilLog] = useState<Record<string, boolean>>({});
  const [dhikrLog, setDhikrLog] = useState<Record<string, boolean>>({});
  const [morningLog, setMorningLog] = useState<Record<string, boolean>>({});
  const [nightlyLog, setNightlyLog] = useState<Record<string, boolean>>({});
  const [quranLog, setQuranLog] = useState<Record<string, boolean>>({});
  const [specialAmalLog, setSpecialAmalLog] = useState<Record<string, boolean>>({});

  const [appStats, setAppStats] = useState(repository.getAppStats(currentViewingDate));
  const [yesterdayChampion, setYesterdayChampion] = useState<ChampionInfo | null>(repository.getYesterdayChampion());
  const [duaNotes, setDuaNotes] = useState<DuaNote[]>(repository.getDuaNotes());
  const [reminders, setReminders] = useState(repository.getReminders());
  const [userName, setUserName] = useState<string>(repository.getUserName());
  const [autoHadithEnabled, setAutoHadithEnabled] = useState<boolean>(repository.isAutoHadithEnabled());
  const [generalReminder, setGeneralReminder] = useState(repository.getGeneralReminder());
  const [lifetimeStartDate, setLifetimeStartDate] = useState<string>(repository.getLifetimeStartDate());
  const [isQuranReading, setIsQuranReading] = useState<boolean>(false);

  // Live Firebase User Ranks cache
  const [userRanks, setUserRanks] = useState<Record<string, number>>({});
  const [communityUpdateTick, setCommunityUpdateTick] = useState<number>(0);

  // Modals
  const [detailsModal, setDetailsModal] = useState<{ title: string; content: string } | null>(null);
  const [reminderModal, setReminderModal] = useState<{ key: string; name: string } | null>(null);
  const [noteModal, setNoteModal] = useState<DuaNote | null>(null);
  const [leaderboardModal, setLeaderboardModal] = useState<{ metric: string; title: string } | null>(null);
  const [alertState, setAlertState] = useState<{ msg: string; isSuccess: boolean } | null>(null);
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);

  const showAlert = useCallback((message: string, isSuccess: boolean) => {
    setAlertState({ msg: message, isSuccess });
  }, []);

  const refreshAll = useCallback(() => {
    setSalahLog(repository.getLog("salah", currentViewingDate));
    setNawafilLog(repository.getLog("nawafil", currentViewingDate));
    setDhikrLog(repository.getLog("dhikr", currentViewingDate));
    setMorningLog(repository.getLog("morning", currentViewingDate));
    setNightlyLog(repository.getLog("nightly", currentViewingDate));
    setQuranLog(repository.getLog("quran", currentViewingDate));
    setSpecialAmalLog(repository.getLog("specialAmal", currentViewingDate));

    const updatedStats = repository.getAppStats(currentViewingDate);
    setAppStats(updatedStats);
    setDuaNotes(repository.getDuaNotes());
    setReminders(repository.getReminders());
    setUserName(repository.getUserName());
    setAutoHadithEnabled(repository.isAutoHadithEnabled());
    setGeneralReminder(repository.getGeneralReminder());
    setLifetimeStartDate(repository.getLifetimeStartDate());
  }, [currentViewingDate]);

  // Refresh view data when viewing date changes
  useEffect(() => {
    refreshAll();
  }, [currentViewingDate, refreshAll]);

  // Debounced Sync to Firebase Realtime Database to guarantee 0ms instant UI clicks
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveToFirebaseCloud = useCallback((dateKey = currentViewingDate, immediate = false) => {
    const points = repository.calculatePoints(dateKey);
    repository.savePointsForDate(dateKey, points);
    const stats = repository.getAppStats(dateKey);
    setAppStats(stats);

    // Keep yesterday champion updated in case yesterday's deeds changed
    const champ = repository.getYesterdayChampion();
    if (champ) {
      setYesterdayChampion(champ);
    }

    // Dynamic Nightly Notifications update moved to background doSync
    if (!auth.currentUser) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const doSync = async () => {
      try {
        await syncStateToFirebase(dateKey, points, stats, repository.getFullState());
        // Dynamic Nightly Notifications update scheduled in background
        NotificationService.scheduleDynamicNightlyNotifications();
      } catch (err) {
        console.warn("Failed saving state to Firebase:", err);
      }
    };

    if (immediate) {
      doSync();
    } else {
      saveTimeoutRef.current = setTimeout(doSync, 1200);
    }
  }, [currentViewingDate]);

  // Auth State Listener & Cloud Sync - runs ONLY once on initial mount
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Fetch cloud state from Firebase Realtime Database
          const cloudState = await fetchUserCloudState(user.uid);
          if (cloudState) {
            repository.loadFromCloudState(cloudState);
          }

          // Fetch user account lifetime points and pointsHistory from Firebase
          const cloudLifetime = await fetchUserAccountLifetimePoints(user.uid);
          if (cloudLifetime !== null && cloudLifetime > 0) {
            repository.setAccountLifetimePoints(cloudLifetime);
          }

          const cloudHistory = await fetchUserPointsHistory(user.uid);
          if (cloudHistory && typeof cloudHistory === 'object') {
            repository.saveAllPointsHistory(cloudHistory);
          }

          const displayName = user.displayName || 'ব্যবহারকারী';
          repository.setUserName(displayName);
          repository.setCurrentUser({
            id: user.uid,
            name: displayName,
            email: user.email || ''
          });

          refreshAll();

          // Sync FCM push token to user profile if available
          const currentFcmToken = FCMService.getToken();
          if (currentFcmToken) {
            FCMService.saveTokenToFirebase(currentFcmToken);
          }
        } catch (err) {
          console.warn("Failed syncing user state from cloud on auth:", err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [refreshAll]);

  // Fetch Firebase Champion and Ranks
  const refreshFirebaseMetrics = useCallback(async () => {
    // 1. Champion
    try {
      const champ = await fetchFirebaseChampion();
      if (champ) {
        setYesterdayChampion(champ);
      } else {
        setYesterdayChampion(repository.getYesterdayChampion());
      }
    } catch {
      setYesterdayChampion(repository.getYesterdayChampion());
    }

    // 2. Ranks & Lifetime Points for logged-in user
    if (auth.currentUser) {
      const metrics = [
        'todayPoints',
        'yesterdayPoints',
        'totalPoints7Days',
        'totalPoints30Days',
        'totalPoints',
        'highScore30Days'
      ];
      const ranksObj: Record<string, number> = {};
      await Promise.all(
        metrics.map(async (m) => {
          const r = await fetchUserRank(m);
          if (r !== null) {
            ranksObj[m] = r;
          }
        })
      );
      setUserRanks(ranksObj);

      // Verify and set account lifetime points and pointsHistory from Firebase
      try {
        const cloudLifetime = await fetchUserAccountLifetimePoints(auth.currentUser.uid);
        if (cloudLifetime !== null && cloudLifetime > 0) {
          repository.setAccountLifetimePoints(cloudLifetime);
        }

        const cloudHistory = await fetchUserPointsHistory(auth.currentUser.uid);
        if (cloudHistory && typeof cloudHistory === 'object') {
          repository.saveAllPointsHistory(cloudHistory);
        }

        setAppStats(repository.getAppStats(repository.getTodayKey()));
      } catch (err) {
        console.warn("Failed syncing account points:", err);
      }
    }
  }, []);

  useEffect(() => {
    refreshFirebaseMetrics();
    NotificationService.syncAllCordovaReminders(repository.getReminders());
    NotificationService.scheduleFardSalahNotifications();
    if (repository.isAutoHadithEnabled()) {
      NotificationService.scheduleCordovaHadithReminders(60);
    }

    // Initialize Firebase Cloud Messaging and Cordova Push plugins
    FCMService.init();
    const unsubscribePush = FCMService.onMessage((payload) => {
      showAlert(`${payload.title}\n${payload.body}`, true);
    });

    const unsubscribe = NotificationService.onDeviceReady(() => {
      console.log('App: Cordova device is ready! Resyncing all reminders to Android AlarmManager...');
      NotificationService.syncAllCordovaReminders(repository.getReminders());
      NotificationService.scheduleFardSalahNotifications();
      NotificationService.scheduleDynamicNightlyNotifications();
      if (repository.isAutoHadithEnabled()) {
        NotificationService.scheduleCordovaHadithReminders(60);
      }
    });

    fetchAllCommunityUsers().then((users) => {
      if (users && users.length > 0) {
        repository.setCommunityUsers(users);
        const champ = repository.getYesterdayChampion();
        if (champ) {
          setYesterdayChampion(champ);
        }
        setCommunityUpdateTick((prev) => prev + 1);
      }
    }).catch(() => {});

    const unsubscribeCommunity = subscribeCommunityUsers((users) => {
      repository.setCommunityUsers(users);
      const champ = repository.getYesterdayChampion();
      if (champ) {
        setYesterdayChampion(champ);
      }
      setCommunityUpdateTick((prev) => prev + 1);
    });

    const unsubscribeInApp = NotificationService.addInAppListener((title, body) => {
      showAlert(`${title}\n\n${body}`, !title.includes('⚠️'));
    });

    return () => {
      unsubscribe();
      unsubscribeCommunity();
      unsubscribePush();
      unsubscribeInApp();
    };
  }, []);

  // Periodic reminder checking interval (every 15s) for in-app and browser notifications
  useEffect(() => {
    const timer = setInterval(() => {
      NotificationService.checkTick(
        reminders,
        autoHadithEnabled,
        generalReminder,
        (title, message) => {
          showAlert(`${title}\n${message}`, true);
        }
      );
    }, 15000);

    return () => clearInterval(timer);
  }, [reminders, autoHadithEnabled, generalReminder, showAlert]);

  // Periodic dynamic leaderboard notification updater (every 10 minutes)
  useEffect(() => {
    NotificationService.scheduleDynamicNightlyNotifications();
    const interval10m = setInterval(() => {
      NotificationService.scheduleDynamicNightlyNotifications();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval10m);
  }, []);

  const isViewingToday = currentViewingDate === repository.getTodayKey();

  const handleSelectDate = (dateKey: string) => {
    const today = repository.getTodayKey();
    if (dateKey > today) {
      showAlert("আগামীকাল বা ভবিষ্যতের ডেটা আপডেট করা সম্ভব নয়।", false);
      return;
    }
    setCurrentViewingDate(dateKey);
  };

  const handleMoveDate = (offset: number) => {
    const d = new Date(currentViewingDate);
    d.setDate(d.getDate() + offset);
    const target = repository.formatIsoDate(d);
    const today = repository.getTodayKey();
    if (target > today) {
      showAlert("আগামীকালের ডেটা দেখা বা আপডেট করা সম্ভব নয়।", false);
      return;
    }
    setCurrentViewingDate(target);
  };

  const handleGoToToday = () => {
    setCurrentViewingDate(repository.getTodayKey());
  };

  // Instant local UI updates with debounced background cloud sync
  const handleToggleSalah = (key: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask("salah", currentViewingDate, key);
    setSalahLog(repository.getLog("salah", currentViewingDate));
    saveToFirebaseCloud(currentViewingDate);
  };

  const handleToggleNawafil = (key: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask("nawafil", currentViewingDate, key);
    setNawafilLog(repository.getLog("nawafil", currentViewingDate));
    saveToFirebaseCloud(currentViewingDate);
  };

  const handleToggleDhikr = (key: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask("dhikr", currentViewingDate, key);
    setDhikrLog(repository.getLog("dhikr", currentViewingDate));
    saveToFirebaseCloud(currentViewingDate);
  };

  const handleToggleRoutineTask = (category: string, taskKey: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask(category, currentViewingDate, taskKey);
    if (category === "specialAmal") {
      setSpecialAmalLog(repository.getLog("specialAmal", currentViewingDate));
    } else if (category === "morning") {
      setMorningLog(repository.getLog("morning", currentViewingDate));
    } else if (category === "nightly") {
      setNightlyLog(repository.getLog("nightly", currentViewingDate));
    } else if (category === "quran") {
      setQuranLog(repository.getLog("quran", currentViewingDate));
    }
    saveToFirebaseCloud(currentViewingDate);
  };

  const handleGetTaskStats = useCallback((category: string, taskKey: string): TaskStats => {
    return repository.getTaskCompletionStats(category, taskKey);
  }, [communityUpdateTick]);

  const handleSaveReminder = (key: string, name: string, start: string, count: number, interval: number) => {
    const setting = { key, name, start, count, interval };
    repository.saveReminder(setting);
    NotificationService.scheduleCordovaReminders(setting);
    setReminderModal(null);
    refreshAll();
    saveToFirebaseCloud();
    showAlert(`${name}-এর রিমাইন্ডার সেট হয়েছে (${start} থেকে শুরু)!`, true);
  };

  const handleDeleteReminder = (key: string, name: string) => {
    repository.deleteReminder(key);
    NotificationService.cancelCordovaReminders(key);
    setReminderModal(null);
    refreshAll();
    saveToFirebaseCloud();
    showAlert(`${name}-এর রিমাইন্ডার বন্ধ করা হয়েছে।`, true);
  };

  const handleAddNote = (title: string, text: string) => {
    if (!text.trim()) return;
    repository.addDuaNote(title, text);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleDeleteNote = (id: string) => {
    repository.deleteDuaNote(id);
    setNoteModal(null);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleSetUserName = (name: string) => {
    if (name.trim()) {
      repository.setUserName(name.trim());
      refreshAll();
      saveToFirebaseCloud();
      showAlert("নাম পরিবর্তন করা হয়েছে!", true);
    }
  };

  const handleToggleAutoHadith = async () => {
    const next = !autoHadithEnabled;
    if (next) {
      await NotificationService.requestPermission();
      const hadith = getRandomHadithFromAllCollections();
      NotificationService.sendNotification(hadith.title, hadith.body);
      NotificationService.scheduleCordovaHadithReminders(60);
    } else {
      NotificationService.cancelCordovaHadithReminders();
    }
    repository.setAutoHadithEnabled(next);
    setAutoHadithEnabled(next);
    saveToFirebaseCloud();
    if (next) {
      showAlert("চালু হয়েছে! প্রতি ১ ঘণ্টা পর পর সরাসরি নোটিফিকেশনে নতুন হাদিস আসবে।", true);
    } else {
      showAlert("অটোমেটিক হাদিস রিমাইন্ডার বন্ধ করা হয়েছে।", false);
    }
  };

  const handleToggleGeneralReminder = async () => {
    const next = { ...generalReminder, enabled: !generalReminder.enabled };
    if (next.enabled) {
      await NotificationService.requestPermission();
      NotificationService.sendNotification("তাওবাহ ও যিকির রিমাইন্ডার চালু", `প্রতি ${next.interval} মিনিট পর পর যিকিরের স্মরণ করিয়ে দেওয়া হবে।`);
    }
    repository.setGeneralReminder(next);
    setGeneralReminder(next);
    saveToFirebaseCloud();
    if (next.enabled) {
      showAlert(`চালু হয়েছে! প্রতি ${next.interval} মিনিট পর পর রিমাইন্ডার আসবে।`, true);
    } else {
      showAlert("সাধারণ রিমাইন্ডার বন্ধ করা হয়েছে।", false);
    }
  };

  const handleSetGeneralInterval = (interval: number) => {
    const next = { ...generalReminder, interval };
    repository.setGeneralReminder(next);
    setGeneralReminder(next);
    saveToFirebaseCloud();
    showAlert(`সময় পরিবর্তন হয়েছে: ${interval} মিনিট পর পর।`, true);
  };

  const handleSetLifetimeStartDate = (dateStr: string) => {
    const today = repository.getTodayKey();
    if (dateStr > today) {
      showAlert("ভবিষ্যতের কোনো তারিখ নির্বাচন করা যাবে না।", false);
      return;
    }
    repository.setLifetimeStartDate(dateStr);
    setLifetimeStartDate(dateStr);
    refreshAll();
    saveToFirebaseCloud();
    showAlert(`লাইফটাইম পয়েন্ট কাউন্ট শুরু ${dateStr} তারিখ থেকে সেট করা হয়েছে।`, true);
  };

  // Auth Handlers for Settings
  const handleLogin = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    setCurrentUser(user);

    // Fetch cloud state from Firebase Realtime Database
    const cloudState = await fetchUserCloudState(user.uid);
    if (cloudState) {
      repository.loadFromCloudState(cloudState);
    }
    const displayName = user.displayName || 'ব্যবহারকারী';
    repository.setUserName(displayName);
    repository.setCurrentUser({
      id: user.uid,
      name: displayName,
      email: user.email || ''
    });

    refreshAll();
    await saveToFirebaseCloud();
    refreshFirebaseMetrics();
    showAlert("লগইন সফল হয়েছে!", true);
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });

    setCurrentUser(user);
    repository.setUserName(name);
    repository.setCurrentUser({
      id: user.uid,
      name,
      email
    });

    refreshAll();
    await saveToFirebaseCloud();
    refreshFirebaseMetrics();
    showAlert("রেজিস্ট্রেশন সফল হয়েছে!", true);
    setActiveTab('reports');
  };

  const handleLogout = async () => {
    await signOut(auth);
    repository.resetAllData();
    setCurrentUser(null);
    setCurrentViewingDate(repository.getTodayKey());
    refreshAll();
    setUserRanks({});
    showAlert("লগ আউট সফলভাবে সম্পন্ন হয়েছে।", true);
  };

  const handleConfirmReset = () => {
    setShowResetDialog(false);
    repository.resetAllData();
    setCurrentViewingDate(repository.getTodayKey());
    refreshAll();
    saveToFirebaseCloud();
  };

  // User Rank resolver (uses live Firebase rank if available, else local)
  const getMyRank = (metric: string): number => {
    if (!currentUser) return 0;
    const stats = repository.getAppStats(repository.getTodayKey());
    let currentScore = stats.totalLifetimePoints;
    if (metric === "todayPoints") currentScore = stats.todayPoints;
    else if (metric === "yesterdayPoints") currentScore = stats.yesterdayPoints;
    else if (metric === "totalPoints7Days") currentScore = stats.totalPoints7Days;
    else if (metric === "totalPoints30Days") currentScore = stats.totalPoints30Days;
    else if (metric === "highScore30Days") currentScore = stats.highScore30Days;
    if (currentScore === 0) return 0;

    if (userRanks[metric] !== undefined && userRanks[metric] !== null) {
      return userRanks[metric];
    }
    const list = repository.getLeaderboard(metric);
    const found = list.find((u) => u.isCurrentUser);
    return found ? found.rank : 0;
  };

  // Header display calculations
  const headerInfo = useMemo(() => {
    switch (activeTab) {
      case 'amalnama':
      case 'salah':
      case 'dhikr': {
        if (amalnamaSubTab === 'salah') {
          const fardKeys = ["fajr", "zuhr", "asr", "maghrib", "isha"];
          const todaySalah = repository.getLog("salah", repository.getTodayKey());
          const fardCompleted = fardKeys.filter((k) => todaySalah[k]).length;
          return {
            title: "আমলনামা",
            subtitle: `${fardCompleted}/৫ ফরয সালাত`
          };
        } else if (amalnamaSubTab === 'amal') {
          return {
            title: "আমলনামা",
            subtitle: `আজকের পয়েন্ট: ${appStats.todayPoints}`
          };
        } else {
          const todayDhikr = repository.getLog("dhikr", repository.getTodayKey());
          const visibleTasks = IbadatRepository.DHIKR_CHECKLIST_TASKS.filter((t) => !t.hidden);
          const dhikrCompleted = visibleTasks.filter((t) => todayDhikr[t.key]).length;
          return {
            title: "আমলনামা",
            subtitle: `${dhikrCompleted}/${visibleTasks.length} যিকির সম্পন্ন`
          };
        }
      }
      case 'dua':
        return {
          title: "দোয়া ও মোনাজাত",
          subtitle: "দৈনন্দিন দোয়া ও জিকির"
        };
      case 'quran':
        return {
          title: "কুরআন মাজীদ",
          subtitle: "১১৪ টি সূরা ও ৩০ পারা"
        };
      case 'hadith':
        return {
          title: "আল-হাদিস",
          subtitle: "ইসলামিক জ্ঞান ও দিকনির্দেশনা"
        };
      case 'more':
        return {
          title: "অন্যান্য ফিচারসমূহ",
          subtitle: "রিপোর্ট, নোট ও সেটিংস"
        };
      case 'duaNotes':
        return {
          title: "ইসলামিক নোট ও দু’আ",
          subtitle: `${duaNotes.length} টি সংরক্ষিত নোট`
        };
      case 'reports':
        return {
          title: "সারাংশ ও ইতিহাস",
          subtitle: `মোট লাইফটাইম পয়েন্ট: ${appStats.totalLifetimePoints}`
        };
      case 'settings':
        return {
          title: currentUser ? "আমার প্রোফাইল" : "সেটিংস ও তথ্য",
          subtitle: currentUser ? "অ্যাকাউন্ট ও সেটিংস" : "সাইন ইন / রেজিস্ট্রেশন"
        };
      default:
        return {
          title: "আমলনামা",
          subtitle: `আজকের পয়েন্ট: ${appStats.todayPoints}`
        };
    }
  }, [activeTab, amalnamaSubTab, duaNotes.length, appStats.todayPoints, appStats.totalLifetimePoints, currentUser]);

  const dateDisplayStr = useMemo(() => {
    if (isViewingToday) return "আজকের দিন";
    try {
      return new Intl.DateTimeFormat('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(currentViewingDate));
    } catch {
      return currentViewingDate;
    }
  }, [isViewingToday, currentViewingDate]);

  return (
    <div className="main-container">
      {/* Header - Hidden on Amalnama, Dua, and Hadith */}
      {activeTab !== 'dua' &&
        activeTab !== 'hadith' &&
        activeTab !== 'amalnama' &&
        activeTab !== 'salah' &&
        activeTab !== 'quran' &&
        activeTab !== 'dhikr' && (
        <AppHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          dateDisplay={dateDisplayStr}
          isViewingToday={isViewingToday}
          onGoToToday={handleGoToToday}
        />
      )}

      {/* Main Content */}
      <main id="app-main-content" className={`flex-grow space-y-6 overflow-y-auto pb-24 ${activeTab === 'dua' || activeTab === 'hadith' || activeTab === 'quran' ? 'p-4 bg-[#0e1412]' : 'p-4'}`}>
        {(activeTab === 'amalnama' || activeTab === 'salah' || activeTab === 'dhikr') && (
          <AmalnamaScreen
            currentSubTab={amalnamaSubTab}
            onSubTabChange={setAmalnamaSubTab}
            dateDisplayStr={dateDisplayStr}
            onGoToToday={handleGoToToday}
            onOpenSettings={() => handleTabChange('settings')}
            appStats={appStats}
            yesterdayChampion={yesterdayChampion}
            salahLog={salahLog}
            nawafilLog={nawafilLog}
            reminders={reminders}
            isViewingToday={isViewingToday}
            onToggleSalah={handleToggleSalah}
            onToggleNawafil={handleToggleNawafil}
            onOpenDetails={(title, content) => setDetailsModal({ title, content })}
            onOpenReminder={(key, name) => setReminderModal({ key, name })}
            onOpenLeaderboard={(metric, title) => setLeaderboardModal({ metric, title })}
            getMyRank={getMyRank}
            getTaskStats={handleGetTaskStats}
            specialAmalLog={specialAmalLog}
            morningLog={morningLog}
            nightlyLog={nightlyLog}
            quranLog={quranLog}
            onToggleRoutineTask={handleToggleRoutineTask}
            dhikrLog={dhikrLog}
            onToggleDhikr={handleToggleDhikr}
            onOpenAllahNames={handleOpenAllahNames}
          />
        )}

        {/* Quran Screen: kept mounted to allow background recitation across tabs */}
        <div className={activeTab === 'quran' ? 'contents' : 'hidden'}>
          <QuranScreen
            onShowAlert={showAlert}
            onReadingChange={setIsQuranReading}
          />
        </div>

        {activeTab === 'dua' && (
          <DuaScreen
            onShowAlert={showAlert}
            initialShowAllahNames={openAllahNamesInDua}
          />
        )}

        {activeTab === 'hadith' && (
          <HadithScreen onShowAlert={showAlert} />
        )}

        {activeTab === 'duaNotes' && (
          <NotesScreen
            duaNotes={duaNotes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onOpenNoteDetail={(note) => setNoteModal(note)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsScreen
            currentViewingDate={currentViewingDate}
            onSelectDate={handleSelectDate}
            onMoveDate={handleMoveDate}
            onOpenLeaderboard={(metric, title) => setLeaderboardModal({ metric, title })}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            currentUser={currentUser}
            userName={userName}
            appStats={appStats}
            autoHadithEnabled={autoHadithEnabled}
            generalReminder={generalReminder}
            lifetimeStartDate={lifetimeStartDate}
            isViewingToday={isViewingToday}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            onSetUserName={handleSetUserName}
            onToggleAutoHadith={handleToggleAutoHadith}
            onToggleGeneralReminder={handleToggleGeneralReminder}
            onSetGeneralInterval={handleSetGeneralInterval}
            onSetLifetimeStartDate={handleSetLifetimeStartDate}
            onRequestReset={() => setShowResetDialog(true)}
            onOpenLeaderboard={(metric, title) => setLeaderboardModal({ metric, title })}
            getMyRank={getMyRank}
            onShowAlert={showAlert}
          />
        )}

        {activeTab === 'more' && (
          <MoreScreen
            appStats={appStats}
            notesCount={duaNotes.length}
            userName={userName}
            onSelectTab={handleTabChange}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (hidden during full-screen Quran reading so audio player is unobstructed) */}
      {!(activeTab === 'quran' && isQuranReading) && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* Modals & Dialogs */}
      {detailsModal && (
        <DetailsDialog
          title={detailsModal.title}
          content={detailsModal.content}
          onDismiss={() => setDetailsModal(null)}
        />
      )}

      {reminderModal && (
        <ReminderDialog
          activityKey={reminderModal.key}
          activityName={reminderModal.name}
          initialSetting={reminders[reminderModal.key]}
          onSave={handleSaveReminder}
          onDelete={handleDeleteReminder}
          onDismiss={() => setReminderModal(null)}
        />
      )}

      {noteModal && (
        <NoteDetailDialog
          note={noteModal}
          onDelete={handleDeleteNote}
          onDismiss={() => setNoteModal(null)}
        />
      )}

      {leaderboardModal && (
        <LeaderboardDialog
          initialTitle={leaderboardModal.title}
          initialMetric={leaderboardModal.metric}
          onDismiss={() => setLeaderboardModal(null)}
        />
      )}

      {alertState && (
        <CustomAlertDialog
          title={alertState.isSuccess ? "সফল!" : "সতর্কতা!"}
          message={alertState.msg}
          isSuccess={alertState.isSuccess}
          onDismiss={() => setAlertState(null)}
        />
      )}

      {showResetDialog && (
        <CustomAlertDialog
          title="ডেটা মুছে ফেলা হবে!"
          message="আপনি কি নিশ্চিত যে আপনি সমস্ত অ্যাপ্লিকেশন ডেটা মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।"
          isSuccess={false}
          isConfirm={true}
          onConfirm={handleConfirmReset}
          onDismiss={() => setShowResetDialog(false)}
        />
      )}
    </div>
  );
};
