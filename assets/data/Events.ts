export interface KidsGuidance {
  title: string;
  titleUrdu: string;
  points: { pointEnglish: string; pointUrdu: string; }[];
}

export interface EventData {
  name: string;
  nameUrdu: string;
  description: string;
  descriptionUrdu: string;
  color: string;
  date?: {
    hijri: any;
    gregorian: any;
  };
  kidsGuidance?: KidsGuidance;
}

// Common translations
export const commonTranslations = {
  english: {
    aboutThisEvent: "About This Event",
    significance: "Significance",
    viewDetails: "View Details",
    eventDetails: "Event Details"
  },
  urdu: {
    aboutThisEvent: "اس تہوار کے بارے میں",
    significance: "اہمیت",
    viewDetails: "مزید دیکھیں",
    eventDetails: "تہوار کی تفصیلات"
  }
};

// Event-specific significance texts
export const eventSignificance = {
  english: {
    "Ramadan": "Ramadan is a sacred month of spiritual renewal, self-discipline, and heightened devotion. Muslims fast from dawn to sunset, increase prayer, recite the Quran, and engage in charity, seeking to purify their souls and earn Allah's mercy and forgiveness.",
    "Eid-ul-Fitr": "Eid-ul-Fitr celebrates the completion of Ramadan, symbolizing spiritual victory and renewal. It's a day of gratitude, community, and joy, where Muslims gather for special prayers, share meals, exchange gifts, and strengthen family and community bonds.",
    "Eid-ul-Adha": "Eid-ul-Adha commemorates Prophet Ibrahim's unwavering faith and willingness to sacrifice his son in obedience to Allah. It teaches Muslims the importance of sacrifice, submission to Allah's will, and generosity toward those in need.",
    "Ashura": "Ashura holds dual significance: it commemorates the day Allah saved Prophet Musa (A.S) and the Israelites from Pharaoh, and for Muslims, it marks the martyrdom of Imam Hussain at Karbala, symbolizing the struggle against injustice and oppression.",
    "Lailat-ul-Qadr": "Lailat-ul-Qadr, the Night of Power, is when the first verses of the Quran were revealed to Prophet Muhammad. It is considered more valuable than a thousand months of worship, offering Muslims a special opportunity for prayer, forgiveness, and divine blessings.",
    "Mawlid al-Nabi": "Mawlid al-Nabi celebrates the birth of Prophet Muhammad, honoring his life, teachings, and character. It's a time for Muslims to reflect on his example, strengthen their connection to his Sunnah, and renew their commitment to following his guidance.",
    "Lailat-ul-Miraj": "Lailat-ul-Miraj commemorates Prophet Muhammad's miraculous night journey from Mecca to Jerusalem and his ascension through the heavens, where he received the command for daily prayers. It represents the spiritual elevation possible through devotion to Allah.",
    "Beginning of the holy months": "The beginning of sacred months like Rajab, Shaban, and Ramadan marks a period of increased spiritual awareness and preparation. These months offer special opportunities for repentance, reflection, and drawing closer to Allah through additional acts of worship.",
    "Islamic New Year": "The Islamic New Year marks Prophet Muhammad's migration (Hijrah) from Mecca to Medina, a pivotal moment that established the first Muslim community. It represents perseverance, faith, and the willingness to sacrifice for one's beliefs and community.",
    "default": "This is an important Islamic event that helps Muslims connect with their faith and strengthen their relationship with Allah. It is observed by Muslims worldwide with various traditions and practices."
  },
  urdu: {
    "Ramadan": "رمضان ایک خاص مہینہ ہے جس میں مسلمان روزے رکھتے ہیں۔ ہم سورج نکلنے سے لے کر سورج ڈوبنے تک کھانا نہیں کھاتے۔ اس مہینے میں ہم زیادہ نماز پڑھتے ہیں، قرآن پڑھتے ہیں، اور غریبوں کی مدد کرتے ہیں تاکہ اللہ ہم سے خوش ہو۔",
    "Eid-ul-Fitr": "عید الفطر رمضان کے مہینے کے بعد آتی ہے۔ یہ ایک خوشی کا دن ہے۔ ہم عید کی نماز پڑھتے ہیں، اچھے کپڑے پہنتے ہیں، اور سب کو 'عید مبارک' کہتے ہیں۔ ہم اپنے دوستوں اور خاندان کے ساتھ مٹھائیاں کھاتے ہیں اور مل کر خوشی مناتے ہیں۔",
    "Eid-ul-Adha": "عید الاضحی ہمیں حضرت ابراہیم کی کہانی یاد دلاتی ہے، جنہوں نے اللہ کی خوشی کے لیے قربانی دینے کا فیصلہ کیا تھا۔ اس دن ہم جانور کی قربانی دیتے ہیں اور گوشت کو غریبوں، دوستوں اور اپنے خاندان میں بانٹتے ہیں۔",
    "Ashura": "عاشورہ دو وجوہات سے اہم ہے: اس دن اللہ نے حضرت موسیٰ اور ان کی قوم کو فرعون سے بچایا تھا۔ مسلمانوں کے لیے، یہ وہ دن ہے جب امام حسین شہید ہوئے تھے۔ یہ دن ہمیں سکھاتا ہے کہ ہمیشہ صحیح کام کرنا چاہیے۔",
    "Lailat-ul-Qadr": "لیلۃ القدر وہ خاص رات ہے جب اللہ نے پہلی بار قرآن کی آیات نبی کریم کو بھیجیں تھیں۔ یہ رات ہزار مہینوں سے بھی زیادہ اچھی ہے۔ اس رات میں دعائیں مانگنا بہت اچھا ہے کیونکہ اللہ ہماری دعائیں سنتا ہے۔",
    "Mawlid al-Nabi": "میلاد النبی نبی کریم کی پیدائش کا جشن ہے۔ ہم نبی کریم کی زندگی کے بارے میں سیکھتے ہیں، ان کی اچھی باتوں کو یاد کرتے ہیں، اور ان کی طرح بننے کی کوشش کرتے ہیں۔ اس دن ہم درود پڑھتے ہیں اور اکٹھے ہو کر خوشی مناتے ہیں۔",
    "Lailat-ul-Miraj": "لیلۃ المعراج وہ رات ہے جب نبی کریم مکہ سے بیت المقدس گئے اور پھر آسمانوں پر گئے۔ وہاں اللہ نے انہیں پانچ نمازوں کا حکم دیا۔ یہ ہمیں بتاتا ہے کہ اللہ کی عبادت کرنے سے ہم روحانی طور پر اونچے ہوتے ہیں۔",
    "Beginning of the holy months": "خاص مہینوں جیسے رجب، شعبان، اور رمضان کا آغاز ایک ایسا وقت ہے جب ہم زیادہ عبادت کرتے ہیں۔ ان مہینوں میں ہم توبہ کرتے ہیں، اچھے کام کرتے ہیں، اور اللہ سے اپنا تعلق مضبوط کرتے ہیں۔",
    "Islamic New Year": "اسلامی نیا سال وہ وقت ہے جب نبی کریم مکہ سے مدینہ ہجرت کر گئے تھے۔ یہ ہمیں سکھاتا ہے کہ اپنے ایمان پر مضبوط رہنا چاہیے اور مشکل وقت میں بھی ہمت نہیں ہارنی چاہیے۔",
    "default": "یہ ایک اہم اسلامی تہوار ہے جس سے ہم اللہ سے اپنا تعلق مضبوط کرتے ہیں۔ دنیا بھر کے مسلمان اس کو مناتے ہیں۔"
  }
};

export const getKidsGuidance = (eventName: string): KidsGuidance | null => {
  // Convert event name to lowercase for case-insensitive matching
  const eventLower = eventName.toLowerCase();
  
  // Match the event with appropriate guidance
  if (eventLower.includes("ramadan")) {
    return {
      title: "Kids' Guide to Ramadan",
      titleUrdu: "بچوں کے لیے رمضان کی گائیڈ",
      points: [
        { pointEnglish: "Try fasting for part of the day if you're old enough", pointUrdu: "اگر آپ بڑے ہیں تو دن کا تھوڑا وقت روزہ رکھنے کی کوشش کریں" },
        { pointEnglish: "Help prepare iftar (breaking fast) meals with your family", pointUrdu: "افطاری کی تیاری میں اپنی فیملی کی مدد کریں" },
        { pointEnglish: "Read Quran daily or learn short surahs", pointUrdu: "روزانہ قرآن پڑھیں یا چھوٹی سورتیں سیکھیں" },
        { pointEnglish: "Make a Ramadan calendar to count down the days", pointUrdu: "رمضان کا کیلنڈر بنائیں اور دن گنیں" },
        { pointEnglish: "Give to charity and help those in need", pointUrdu: "غریبوں کی مدد کریں اور خیرات دیں" }
      ]
    };
  } else if (eventLower.includes("eid-ul-fitr") || eventLower.includes("eid al-fitr")) {
    return {
      title: "Kids' Guide to Eid-ul-Fitr",
      titleUrdu: "بچوں کے لیے عید الفطر کی گائیڈ",
      points: [
        { pointEnglish: "Take a shower and wear your best or new clothes", pointUrdu: "نہا کر صاف ستھرے اور اچھے کپڑے پہنیں" },
        { pointEnglish: "Give sadaqah (charity) before Eid prayer", pointUrdu: "عید کی نماز سے پہلے غریبوں کو پیسے دیں" },
        { pointEnglish: "Say 'Eid Mubarak' to friends and family", pointUrdu: "دوستوں اور فیملی کو 'عید مبارک' کہیں" },
        { pointEnglish: "Share sweets and food with neighbors", pointUrdu: "پڑوسیوں کے ساتھ مٹھائیاں اور کھانا بانٹیں" },
        { pointEnglish: "Remember to be thankful to Allah for all blessings", pointUrdu: "یاد رکھیں کہ اللہ کا شکر کرنا ہے جو ہمیں اچھی چیزیں دیتا ہے" }
      ]
    };
  } else if (eventLower.includes("eid-ul-adha") || eventLower.includes("eid al-adha")) {
    return {
      title: "Kids' Guide to Eid-ul-Adha",
      titleUrdu: "بچوں کے لیے عید الاضحی کی گائیڈ",
      points: [
        { pointEnglish: "Take a shower and wear your best clothes", pointUrdu: "نہا کر اچھے کپڑے پہنیں" },
        { pointEnglish: "Learn about Prophet Ibrahim's (AS) sacrifice", pointUrdu: "حضرت ابراہیم کی قربانی کے بارے میں جانیں" },
        { pointEnglish: "Share the meat with family, neighbors, and those in need", pointUrdu: "قربانی کا گوشت فیملی، پڑوسیوں اور غریبوں میں بانٹیں" },
        { pointEnglish: "Be kind and loving to animals", pointUrdu: "جانوروں سے پیار سے پیش آئیں" },
        { pointEnglish: "Thank Allah for all the blessings in your life", pointUrdu: "اللہ کا شکر کریں جو آپ کو اچھی چیزیں دیتا ہے" }
      ]
    };
  } else if (eventLower.includes("ashura")) {
    return {
      title: "Kids' Guide to Ashura",
      titleUrdu: "بچوں کے لیے عاشورہ کی گائیڈ",
      points: [
        { pointEnglish: "Learn about the historical significance of Ashura", pointUrdu: "عاشورہ کی تاریخی اہمیت کے بارے میں جانیں" },
        { pointEnglish: "Fast on the day of Ashura if you're able", pointUrdu: "اگر آپ کر سکتے ہیں تو عاشورہ کا روزہ رکھیں" },
        { pointEnglish: "Remember Prophet Musa (AS) and how Allah saved him", pointUrdu: "یاد کریں کیسے اللہ نے حضرت موسیٰ کو بچایا تھا" },
        { pointEnglish: "Learn about the sacrifice of Imam Hussain (RA)", pointUrdu: "امام حسین کی قربانی کے بارے میں جانیں" },
        { pointEnglish: "Be thankful for the blessings in your life", pointUrdu: "اپنی زندگی میں اچھی چیزوں کے لیے شکر کریں" }
      ]
    };
  } else if (eventLower.includes("lailat-ul-qadr") || eventLower.includes("night of power")) {
    return {
      title: "Kids' Guide to Lailat-ul-Qadr",
      titleUrdu: "بچوں کے لیے لیلۃ القدر کی گائیڈ",
      points: [
        { pointEnglish: "Stay up for extra prayers with your family", pointUrdu: "اپنی فیملی کے ساتھ رات کو جاگ کر نمازیں پڑھیں" },
        { pointEnglish: "Read Quran and make special duas", pointUrdu: "قرآن پڑھیں اور خاص دعائیں مانگیں" },
        { pointEnglish: "Learn why this night is so special", pointUrdu: "جانیں کہ یہ رات اتنی خاص کیوں ہے" },
        { pointEnglish: "Do extra good deeds on this blessed night", pointUrdu: "اس مبارک رات میں زیادہ اچھے کام کریں" },
        { pointEnglish: "Remember it's better than a thousand months of worship", pointUrdu: "یاد رکھیں کہ یہ رات ہزار مہینوں سے بہتر ہے" }
      ]
    };
  } else if (eventLower.includes("mawlid") || eventLower.includes("mawlid al-nabi")) {
    return {
      title: "Kids' Guide to Mawlid al-Nabi",
      titleUrdu: "بچوں کے لیے میلاد النبی کی گائیڈ",
      points: [
        { pointEnglish: "Learn about the life of Prophet Muhammad (SAW)", pointUrdu: "نبی کریم کی زندگی کے بارے میں جانیں" },
        { pointEnglish: "Share stories about the Prophet's kindness", pointUrdu: "نبی کریم کی مہربانی کی کہانیاں سنائیں" },
        { pointEnglish: "Recite durood and salawat", pointUrdu: "درود پڑھیں" },
        { pointEnglish: "Practice following the Prophet's example", pointUrdu: "نبی کریم کی طرح اچھے کام کرنے کی کوشش کریں" },
        { pointEnglish: "Share food and sweets with others", pointUrdu: "دوسروں کے ساتھ کھانا اور مٹھائیاں بانٹیں" }
      ]
    };
  }
  
  // Return null if no matching guidance is found
  return null;
};

// Event Urdu translations
export const eventTranslations = {
  "Ramadan": "رمضان",
  "Eid-ul-Fitr": "عید الفطر",
  "Eid-ul-Adha": "عید الاضحی",
  "Ashura": "عاشورہ",
  "Lailat-ul-Qadr": "لیلۃ القدر",
  "Mawlid al-Nabi": "میلاد النبی",
  "Lailat-ul-Miraj": "لیلۃ المعراج",
  "Beginning of the holy months": "مقدس مہینوں کا آغاز",
  "Islamic New Year": "اسلامی نیا سال"
};

// Event descriptions Urdu translations
export const eventDescriptionsUrdu = {
  "Ramadan": "رمضان وہ مہینہ ہے جس میں مسلمان روزے رکھتے ہیں اور قرآن پڑھتے ہیں۔ اس مہینے میں قرآن نازل ہوا تھا۔",
  "Eid-ul-Fitr": "عید الفطر رمضان کے بعد آتی ہے۔ ہم اس دن خوشی مناتے ہیں، نماز پڑھتے ہیں، اور مٹھائیاں کھاتے ہیں۔",
  "Eid-ul-Adha": "عید الاضحی پر ہم جانوروں کی قربانی دیتے ہیں، جیسے حضرت ابراہیم نے اللہ کے حکم پر قربانی دینے کی تیاری کی تھی۔",
  "Ashura": "عاشورہ محرم کا دسواں دن ہے۔ اس دن اللہ نے حضرت موسیٰ کو بچایا تھا، اور امام حسین شہید ہوئے تھے۔",
  "Lailat-ul-Qadr": "لیلۃ القدر رمضان کی ایک خاص رات ہے جب قرآن کی پہلی آیات نبی کریم پر نازل ہوئیں تھیں۔",
  "Mawlid al-Nabi": "میلاد النبی نبی کریم کی پیدائش کا دن ہے، جسے دنیا بھر کے مسلمان مناتے ہیں۔",
  "Lailat-ul-Miraj": "لیلۃ المعراج وہ رات ہے جب نبی کریم آسمانوں پر گئے تھے اور وہاں انہیں پانچ نمازوں کا حکم ملا تھا۔",
  "Beginning of the holy months": "رجب، شعبان، اور رمضان خاص مہینے ہیں جن میں ہم زیادہ عبادت کرتے ہیں۔",
  "Islamic New Year": "اسلامی نیا سال اس وقت شروع ہوتا ہے جب نبی کریم مکہ سے مدینہ ہجرت کرکے گئے تھے۔"
};

// Month names in Urdu
export const hijriMonthsUrdu = {
  1: "محرم", 2: "صفر", 3: "ربیع الاول", 4: "ربیع الثانی",
  5: "جمادی الاول", 6: "جمادی الثانی", 7: "رجب", 8: "شعبان",
  9: "رمضان", 10: "شوال", 11: "ذوالقعدہ", 12: "ذوالحجہ"
};

// Date formatting
export const dateFormatTranslations = {
  english: (hijriDate: any, gregorianDate: any) => {
    return `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH / ${gregorianDate.day} ${gregorianDate.month.en} ${gregorianDate.year} CE`;
  },
  urdu: (hijriDate: any, gregorianDate: any) => {
    // Convert numbers to Urdu numerals
    const toUrduNumeral = (num: string) => {
      const urduNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return num.split('').map(digit => {
        return isNaN(parseInt(digit)) ? digit : urduNumerals[parseInt(digit)];
      }).join('');
    };
    
    // Get Urdu month name
    const hijriMonthUrdu = hijriMonthsUrdu[parseInt(hijriDate.month.number)];
    
    return `${toUrduNumeral(hijriDate.day)} ${hijriMonthUrdu} ${toUrduNumeral(hijriDate.year)} ھ / ${toUrduNumeral(gregorianDate.day)} ${gregorianDate.month.en} ${toUrduNumeral(gregorianDate.year)} ء`;
  }
};