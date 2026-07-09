export const LANGUAGES = [
  { code: "az", label: "AZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export const DEFAULT_LANGUAGE = "az";

const MONTHS = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export function formatEventDate(dateStr, lang, city) {
  const months = MONTHS[lang] || MONTHS.az;
  let datePart = "";
  if (dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    if (!Number.isNaN(d.getTime())) {
      datePart = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  }
  if (datePart && city) return `${datePart} · ${city}`;
  return datePart || city || "";
}

const translations = {
  az: {
    landing: "Albomu açmaq üçün masanızdakı QR kodu skan edin ✦",
    errors: {
      tooShort: "Ad çox qısadır",
      tooLong: "Ad çox uzundur",
      invalidChars: "Xahiş olunur, latın əlifbasından istifadə edin (ingilis və ya Azərbaycan hərfləri)",
      profanity: "Zəhmət olmasa, real adınızı daxil edin",
    },
    entry: {
      subtitle: "Bu axşamı bizimlə bölüşün",
      title: "Xoş gəlmisiniz",
      label: "Adınız",
      namePlaceholder: "Məsələn: Kamran Cəfərli",
      helper: "Ad və soyad · yalnız latın əlifbası",
      footer: "Ad bu brauzerdə yadda saxlanılacaq",
      submit: "Albuma daxil ol",
      submitting: "Daxil olunur…",
      saveError: "Ad yadda saxlanılmadı. Yenidən cəhd edin.",
    },
    eventGate: {
      loading: "Albom açılır…",
      notFound: "Tədbir tapılmadı. QR koddakı linki yoxlayın.",
      inactive: "Bu tədbir üçün səsvermə başa çatıb.",
      wrongEvent: "Bu brauzer artıq başqa bir tədbirə qeydiyyatdan keçib. Başqa brauzerdə və ya gizli rejimdə açın.",
      generic: "Tədbiri yükləmək mümkün olmadı.",
    },
    gallery: {
      sortPopular: "Populyar",
      sortFresh: "Yeni",
      momentsWord: "axşamın anı",
      loading: "Anlar toplanır…",
      empty: "Hələ heç bir foto yoxdur. İlk siz olun.",
      share: "An paylaş",
      winnerLink: "Qalib",
    },
    profile: {
      back: "Geri",
      guestFallback: "Qonaq",
      photoCount: "an paylaşdı",
      loading: "Yüklənir…",
      empty: "Bu qonaq hələ foto paylaşmayıb.",
    },
    winner: {
      title: "Gecənin ən yaxşı anı",
      pending: "Qalib hələ elan olunmayıb. Sonra yenidən baxın ✦",
      author: "Müəllif:",
    },
    winnerGate: {
      notFound: "Tədbir tapılmadı.",
    },
    upload: {
      heading: "Anı paylaş",
      shareTitle: "An paylaş",
      optCamera: "Şəkil çək",
      optCameraSub: "Tətbiqdən birbaşa",
      optGallery: "Qalereyadan seç",
      optGallerySub: "Telefonunuzdan yükləyin",
      pickPrompt: "Şəkil çəkin və ya qalereyadan seçin",
      captionPlaceholder: "Şəklə qeyd (məcburi deyil) — arzu, an, zarafat…",
      replace: "Dəyiş",
      publish: "Paylaş",
      processing: "Foto hazırlanır…",
      uploading: "Dərc edilir…",
      done: "An saxlanıldı ✦",
      limitError: "Bu tədbir üçün 30 foto limitinə çatdınız.",
      genericError: "Foto dərc edilmədi. Əlaqəni yoxlayıb yenidən cəhd edin.",
    },
    photoCard: {
      guestFallback: "Qonaq",
      you: "siz",
      likeAria: "Bəyən",
      commentAria: "Şərhlər",
      downloadAria: "Orijinalı yüklə",
      download: "Yüklə",
      deleteConfirm: "Bu foto silinsin? Geri qaytarmaq mümkün olmayacaq.",
      deleting: "Silinir…",
      delete: "Sil",
      downloadError: "Foto yüklənmədi. Yenidən cəhd edin.",
      deleteError: "Foto silinmədi. Yenidən cəhd edin.",
    },
    likers: {
      title: "Bəyənənlər",
      loading: "Yüklənir…",
      empty: "Hələ heç kim bəyənməyib.",
      andOne: "və daha 1 nəfər",
      andMany: "və daha # nəfər",
    },
    comments: {
      title: "Şərhlər",
      loading: "Yüklənir…",
      empty: "Hələ şərh yoxdur",
      placeholder: "Şərh əlavə edin…",
      send: "Göndər",
      likeAria: "Bəyən",
      delete: "sil",
      deleteConfirm: "Şərh silinsin?",
      tooLong: "Şərh çox uzundur",
      profanity: "Xahiş olunur, nəzakətli olun",
      sendError: "Göndərilmədi, yenidən cəhd edin",
    },
  },

  ru: {
    landing: "Отсканируйте QR-код на вашем столе, чтобы открыть альбом ✦",
    errors: {
      tooShort: "Имя слишком короткое",
      tooLong: "Имя слишком длинное",
      invalidChars: "Используйте латиницу (английские или азербайджанские буквы)",
      profanity: "Пожалуйста, введите настоящее имя",
    },
    entry: {
      subtitle: "Разделите с нами этот вечер",
      title: "Добро пожаловать",
      label: "Ваше имя",
      namePlaceholder: "Например: Kamran Jafarli",
      helper: "Имя и фамилия · только латиница",
      footer: "Имя сохранится в этом браузере",
      submit: "Войти в альбом",
      submitting: "Входим…",
      saveError: "Не получилось сохранить имя. Попробуйте ещё раз.",
    },
    eventGate: {
      loading: "Открываем альбом…",
      notFound: "Событие не найдено. Проверьте ссылку из QR-кода.",
      inactive: "Голосование для этого события завершено.",
      wrongEvent: "Этот браузер уже зарегистрирован на другом мероприятии. Откройте ссылку в другом браузере или в режиме инкогнито.",
      generic: "Не удалось загрузить событие.",
    },
    gallery: {
      sortPopular: "Популярные",
      sortFresh: "Новые",
      momentsWord: "моментов вечера",
      loading: "Собираем моменты…",
      empty: "Пока ни одного фото. Станьте первым, кто поделится моментом.",
      share: "Поделиться моментом",
      winnerLink: "Победитель",
    },
    profile: {
      back: "Назад",
      guestFallback: "Гость",
      photoCount: "поделился моментами",
      loading: "Загрузка…",
      empty: "Этот гость ещё не поделился фото.",
    },
    winner: {
      title: "Лучший момент вечера",
      pending: "Победитель ещё не объявлен. Загляните позже ✦",
      author: "Автор:",
    },
    winnerGate: {
      notFound: "Событие не найдено.",
    },
    upload: {
      heading: "Поделиться моментом",
      shareTitle: "Поделиться моментом",
      optCamera: "Сделать фото",
      optCameraSub: "Снять прямо в приложении",
      optGallery: "Выбрать из галереи",
      optGallerySub: "Загрузить с телефона",
      pickPrompt: "Сделать фото или выбрать из галереи",
      captionPlaceholder: "Подпись к фото (необязательно) — пожелание, момент, шутка…",
      replace: "Заменить",
      publish: "Опубликовать",
      processing: "Готовим фото…",
      uploading: "Публикуем…",
      done: "Момент сохранён ✦",
      limitError: "Вы достигли лимита в 30 фото за это событие.",
      genericError: "Не получилось опубликовать фото. Проверьте связь и попробуйте снова.",
    },
    photoCard: {
      guestFallback: "Гость",
      you: "вы",
      likeAria: "Поставить лайк",
      commentAria: "Комментарии",
      downloadAria: "Скачать оригинал",
      download: "Скачать",
      deleteConfirm: "Удалить это фото? Отменить будет нельзя.",
      deleting: "Удаляем…",
      delete: "Удалить",
      downloadError: "Не получилось скачать фото. Попробуйте ещё раз.",
      deleteError: "Не получилось удалить фото. Попробуйте ещё раз.",
    },
    likers: {
      title: "Отметки «нравится»",
      loading: "Загрузка…",
      empty: "Пока никто не лайкнул.",
      andOne: "и ещё 1 человек",
      andMany: "и ещё # человек",
    },
    comments: {
      title: "Комментарии",
      loading: "Загрузка…",
      empty: "Пока нет комментариев",
      placeholder: "Добавить комментарий…",
      send: "Отправить",
      likeAria: "Поставить лайк",
      delete: "удалить",
      deleteConfirm: "Удалить комментарий?",
      tooLong: "Слишком длинный комментарий",
      profanity: "Пожалуйста, будьте вежливы",
      sendError: "Не получилось отправить, попробуйте ещё раз",
    },
  },

  en: {
    landing: "Scan the QR code on your table to open the album ✦",
    errors: {
      tooShort: "Name is too short",
      tooLong: "Name is too long",
      invalidChars: "Please use Latin letters (English or Azerbaijani)",
      profanity: "Please enter your real name",
    },
    entry: {
      subtitle: "Share this evening with us",
      title: "Welcome",
      label: "Your name",
      namePlaceholder: "e.g. Kamran Jafarli",
      helper: "First and last name · Latin letters only",
      footer: "Your name will be saved in this browser",
      submit: "Enter the album",
      submitting: "Signing in…",
      saveError: "Couldn't save your name. Please try again.",
    },
    eventGate: {
      loading: "Opening the album…",
      notFound: "Event not found. Check the link from the QR code.",
      inactive: "Voting for this event has ended.",
      wrongEvent: "This browser is already registered for another event. Open the link in a different browser or in private mode.",
      generic: "Couldn't load the event.",
    },
    gallery: {
      sortPopular: "Popular",
      sortFresh: "Recent",
      momentsWord: "moments of the evening",
      loading: "Gathering moments…",
      empty: "No photos yet. Be the first to share a moment.",
      share: "Share a moment",
      winnerLink: "Winner",
    },
    profile: {
      back: "Back",
      guestFallback: "Guest",
      photoCount: "moments shared",
      loading: "Loading…",
      empty: "This guest hasn't shared any photos yet.",
    },
    winner: {
      title: "Best moment of the night",
      pending: "The winner hasn't been announced yet. Check back later ✦",
      author: "By:",
    },
    winnerGate: {
      notFound: "Event not found.",
    },
    upload: {
      heading: "Share a moment",
      shareTitle: "Share a moment",
      optCamera: "Take a photo",
      optCameraSub: "Shoot right in the app",
      optGallery: "Choose from gallery",
      optGallerySub: "Upload from your phone",
      pickPrompt: "Take a photo or choose from your gallery",
      captionPlaceholder: "Caption (optional) — a wish, a moment, a joke…",
      replace: "Replace",
      publish: "Publish",
      processing: "Preparing photo…",
      uploading: "Publishing…",
      done: "Moment saved ✦",
      limitError: "You've reached the 30-photo limit for this event.",
      genericError: "Couldn't publish the photo. Check your connection and try again.",
    },
    photoCard: {
      guestFallback: "Guest",
      you: "you",
      likeAria: "Like",
      commentAria: "Comments",
      downloadAria: "Download original",
      download: "Download",
      deleteConfirm: "Delete this photo? This can't be undone.",
      deleting: "Deleting…",
      delete: "Delete",
      downloadError: "Couldn't download the photo. Please try again.",
      deleteError: "Couldn't delete the photo. Please try again.",
    },
    likers: {
      title: "Liked by",
      loading: "Loading…",
      empty: "No likes yet.",
      andOne: "and 1 other",
      andMany: "and # others",
    },
    comments: {
      title: "Comments",
      loading: "Loading…",
      empty: "No comments yet",
      placeholder: "Add a comment…",
      send: "Send",
      likeAria: "Like",
      delete: "delete",
      deleteConfirm: "Delete this comment?",
      tooLong: "Comment is too long",
      profanity: "Please be respectful",
      sendError: "Couldn't send, please try again",
    },
  },
};

export function getTranslator(lang) {
  const dict = translations[lang] || translations[DEFAULT_LANGUAGE];
  return function t(path) {
    const value = path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), dict);
    return value ?? path;
  };
}
