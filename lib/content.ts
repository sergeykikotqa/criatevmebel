export type ImageAsset = {
  src: string;
  alt: string;
};

export type ContactLink = {
  label: string;
  href: string;
  note?: string;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  microTrust: string[];
  transientPhrases: [string, string, string];
  finalPhrase: string;
  image: ImageAsset;
};

export type ProofCard = {
  label: string;
  problem: string;
  outcome: string;
  size: "large" | "small";
  image?: ImageAsset;
};

export type StepItem = {
  title: string;
  description: string;
};

export type FinalCta = {
  title: string;
  description: string;
  buttonLabel: string;
  directContactLabel: string;
};

export type QuizOption<Value extends string = string> = {
  value: Value;
  label: string;
};

export type QuizQuestion<Value extends string = string> = {
  title: string;
  options: QuizOption<Value>[];
};

export type ContactQuestion = {
  phoneLabel: string;
  telegramLabel: string;
  phoneIntentTitle: string;
  phoneIntentCallLabel: string;
  phoneIntentMessageLabel: string;
  phonePlaceholder: string;
  telegramPlaceholder: string;
  phoneIntentError: string;
  phoneError: string;
  telegramError: string;
  submitLabel: string;
};

export type QuizContent = {
  missionLabel: string;
  introTitle: string;
  introBody: string;
  introButtonLabel: string;
  progressLabel: string;
  profileLabels: {
    layout: string;
    space: string;
    budget: string;
    timeline: string;
    recommendation: string;
  };
  previewTitle: string;
  previewButton: string;
  contactTitle: string;
  contactHint: string;
  socialProof: string;
  resumeTitle: string;
  resumeDescription: string;
  continueLabel: string;
  previousLabel: string;
  budgetLoaderTitle: string;
  submitPendingTitle: string;
  submitResultTitle: string;
  successTitle: string;
  successBody: string;
  successPrompt: string;
  successButtonLabel: string;
  fallbackTitle: string;
  fallbackBody: string;
  fallbackButtonLabel: string;
  questions: {
    kitchenType: QuizQuestion<"straight" | "corner" | "u-shaped" | "unknown">;
    kitchenSize: QuizQuestion<"lt2" | "2to3" | "3to5" | "gt5">;
    budget: QuizQuestion<"lt100" | "100to200" | "200to400" | "gt400">;
    timeline: QuizQuestion<"urgent" | "month" | "research">;
    contact: ContactQuestion;
  };
};

export type TrustContent = {
  title: string;
  bullets: string[];
};

export type SiteConfig = {
  brandName: string;
  companyName: string;
  city: string;
  cityInLocation: string;
  phone: string;
  telegramUrl: string;
  seoDescription: string;
  contacts: {
    telegram: ContactLink;
    address?: string;
  };
};

export type LandingContent = {
  hero: HeroContent;
  proofCards: ProofCard[];
  steps: StepItem[];
  finalCta: FinalCta;
  quiz: QuizContent;
  trust: TrustContent;
  siteConfig: SiteConfig;
};

const publicAsset = (path: string) => {
  const isGithubActions = process.env.GITHUB_ACTIONS === "true";
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
  const isUserOrOrgPages = repoName.endsWith(".github.io");
  const basePath = isGithubActions && repoName && !isUserOrOrgPages ? `/${repoName}` : "";
  return `${basePath}${path}`;
};

const city = "Иркутск";
const cityInLocation = "Иркутске";

export const landingContent: LandingContent = {
  hero: {
    eyebrow: `Кухни на заказ в ${cityInLocation}`,
    title: "Мебель, после которой не хочется ничего переделывать",
    description:
      "Для тех, у кого «временно», «потом заменим» и «ну вроде нормально» затянулось на годы.",
    primaryCta: "Рассчитать кухню",
    microTrust: ["Бесплатный расчет", "Срок от 7 дней", "Гарантия 2 года"],
    transientPhrases: ["пока сойдёт", "потом переделаем", "ну вроде норм"],
    finalPhrase: "хорошо сделано",
    image: {
      src: publicAsset("/hero-lounge.jpg"),
      alt: "Светлая кухня-гостиная с встроенной мебелью и спокойным современным интерьером.",
    },
  },
  proofCards: [
    {
      label: "Угловая кухня",
      size: "large",
      problem:
        "Мало рабочей поверхности, техника мешает проходу, а хранение быстро превращается в хаос.",
      outcome:
        "Рабочая зона собрана, проход свободный, и кухня работает спокойно каждый день.",
      image: {
        src: publicAsset("/proof-kitchen.jpg"),
        alt: "Светлая угловая кухня с чистой рабочей зоной и встроенной техникой.",
      },
    },
    {
      label: "Пенал до потолка",
      size: "small",
      problem:
        "Часть вещей всегда остается на виду, а внутри не хватает места под повседневные задачи.",
      outcome:
        "Хранение закрывает вопрос, кухня выглядит собранно, а нужные вещи остаются под рукой.",
      image: {
        src: publicAsset("/proof-wardrobe.jpg"),
        alt: "Высокий светлый шкаф-пенал с аккуратной внутренней организацией хранения.",
      },
    },
  ],
  steps: [
    {
      title: "Оставляете заявку",
      description: "Коротко отвечаете на несколько вопросов и сразу задаете бюджет, размер и срок.",
    },
    {
      title: "Получаете расчет и проект",
      description: "Мы подбираем формат кухни под вашу планировку и отправляем понятный ориентир по стоимости.",
    },
    {
      title: "Согласуем детали",
      description: "Материалы, наполнение и размеры собираются под ваш реальный сценарий использования.",
    },
    {
      title: "Производим и устанавливаем",
      description: "Делаем кухню аккуратно и доводим все до состояния, в котором ничего не хочется переделывать.",
    },
  ],
  finalCta: {
    title: "Рассчитайте стоимость кухни за 2 минуты",
    description:
      "Ответьте на несколько вопросов и получите расчет под ваш бюджет и размеры.",
    buttonLabel: "Рассчитать кухню",
    directContactLabel: "Нужно быстрее? Напишите нам напрямую:",
  },
  quiz: {
    missionLabel: "Без регистрации и звонков — просто ответьте на несколько вопросов",
    introTitle: "Подберем кухню под ваш бюджет и размеры",
    introBody: "Ответ займет 1–2 минуты и поможет сразу рассчитать стоимость",
    introButtonLabel: "Начать расчет",
    progressLabel: "Шаг {current} из {total}",
    profileLabels: {
      layout: "Планировка",
      space: "Пространство",
      budget: "Бюджет",
      timeline: "Срок",
      recommendation: "Комментарий",
    },
    previewTitle: "Профиль кухни собран",
    previewButton: "Продолжить к срокам и расчету",
    contactTitle: "Оставьте контакт, чтобы получить расчет и варианты кухонь",
    contactHint: "Ответим в течение 10–15 минут",
    socialProof: "Более 150 кухонь уже подобрано под клиентов",
    resumeTitle: "Продолжить расчет?",
    resumeDescription: "Мы сохранили ваши ответы.",
    continueLabel: "Продолжить",
    previousLabel: "Назад",
    budgetLoaderTitle: "Подбираем варианты под ваш бюджет...",
    submitPendingTitle: "Формируем расчет под ваши параметры...",
    submitResultTitle: "Мы подобрали для вас 2–3 варианта кухонь под ваш бюджет",
    successTitle: "Готово! Мы получили вашу заявку",
    successBody: "Расчет и варианты кухонь отправим сегодня, чтобы вы сразу увидели понятный следующий шаг.",
    successPrompt: "Если хотите ускорить — напишите нам в Telegram",
    successButtonLabel: "Открыть Telegram",
    fallbackTitle: "Заявка не отправилась автоматически, но мы уже почти получили ваши данные.",
    fallbackBody: "Нажмите кнопку ниже и напишите нам — мы сразу продолжим расчет.",
    fallbackButtonLabel: "Открыть Telegram",
    questions: {
      kitchenType: {
        title: "Какую кухню планируете?",
        options: [
          { value: "straight", label: "Прямая" },
          { value: "corner", label: "Угловая" },
          { value: "u-shaped", label: "П-образная" },
          { value: "unknown", label: "Пока не знаю" },
        ],
      },
      kitchenSize: {
        title: "Примерный размер кухни?",
        options: [
          { value: "lt2", label: "До 2 м" },
          { value: "2to3", label: "2–3 м" },
          { value: "3to5", label: "3–5 м" },
          { value: "gt5", label: "Более 5 м" },
        ],
      },
      budget: {
        title: "Бюджет проекта?",
        options: [
          { value: "lt100", label: "До 100 000 ₽" },
          { value: "100to200", label: "100–200 тыс." },
          { value: "200to400", label: "200–400 тыс." },
          { value: "gt400", label: "400+ тыс." },
        ],
      },
      timeline: {
        title: "Когда планируете?",
        options: [
          { value: "urgent", label: "Срочно (до 2 недель)" },
          { value: "month", label: "В течение месяца" },
          { value: "research", label: "Пока рассматриваю" },
        ],
      },
      contact: {
        phoneLabel: "Телефон",
        telegramLabel: "Telegram",
        phoneIntentTitle: "Как с вами удобнее связаться?",
        phoneIntentCallLabel: "Перезвоните мне",
        phoneIntentMessageLabel: "Напишите мне",
        phonePlaceholder: "+7 (___) ___-__-__",
        telegramPlaceholder: "@username",
        phoneIntentError: "Выберите, как с вами удобнее связаться.",
        phoneError: "Введите корректный телефон, чтобы получить расчет.",
        telegramError: "Укажите Telegram в удобном для связи формате.",
        submitLabel: "Получить расчет и варианты кухонь",
      },
    },
  },
  trust: {
    title: "Почему выбирают нас",
    bullets: [
      "Более 10 лет на рынке",
      "Более 150 кухонь под заказ",
      "Собственное производство",
      "Работаем по договору",
      "Гарантия до 2 лет",
    ],
  },
  siteConfig: {
    brandName: "MESTO",
    companyName: "MESTO Кухни",
    city,
    cityInLocation,
    phone: "+7 (999) 000-00-00",
    telegramUrl: "https://t.me/",
    seoDescription:
      `Кухни на заказ в ${cityInLocation}: расчет за 2 минуты, проект за 1 день, производство и установка под ваш бюджет и размеры.`,
    contacts: {
      telegram: {
        label: "Telegram",
        href: "https://t.me/",
        note: "Ответим и продолжим расчет без лишней переписки.",
      },
    },
  },
};
