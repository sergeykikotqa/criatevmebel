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
  secondaryCta?: string;
  rotatingPhrases: string[];
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
  image?: ImageAsset;
};

export type SiteConfig = {
  brandName: string;
  telegramUrl: string;
  seoDescription: string;
  contacts: {
    telegram: ContactLink;
    vk?: ContactLink;
    avito?: ContactLink;
    map?: ContactLink;
    address?: string;
  };
};

export type LandingContent = {
  hero: HeroContent;
  proofCards: ProofCard[];
  steps: StepItem[];
  finalCta: FinalCta;
  siteConfig: SiteConfig;
};

const publicAsset = (path: string) => {
  const isGithubActions = process.env.GITHUB_ACTIONS === "true";
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
  const isUserOrOrgPages = repoName.endsWith(".github.io");
  const basePath = isGithubActions && repoName && !isUserOrOrgPages ? `/${repoName}` : "";
  return `${basePath}${path}`;
};

export const landingContent: LandingContent = {
  hero: {
    eyebrow: "Мебель на заказ",
    title: "Мебель, после которой не хочется ничего переделывать",
    description:
      'Для тех, у кого "временно", "потом заменим" и "ну вроде нормально" затянулось на годы.',
    primaryCta: "Обсудить проект",
    secondaryCta: "Хочу такой стиль",
    rotatingPhrases: [
      "пока сойдёт",
      "потом переделаем",
      "ну вроде норм",
      "нормально сделано",
    ],
    image: {
      src: publicAsset("/hero-lounge.jpg"),
      alt: "Светлая гостиная с встроенной мебелью, мягким светом и ощущением простора.",
    },
  },
  proofCards: [
    {
      label: "Кухня",
      size: "large",
      problem:
        "Столешница занята, хранение неудобное, каждое движение лишнее.",
      outcome:
        "У всего есть своё место, и кухня работает спокойно, без лишней суеты.",
      image: {
        src: publicAsset("/proof-kitchen.jpg"),
        alt: "Минималистичная кухня в светлых тонах с чёткой геометрией фасадов.",
      },
    },
    {
      label: "Шкаф",
      size: "small",
      problem:
        "Внутри вечный компромисс: что-то мешает, цепляет и выглядит временно.",
      outcome: "Собран под вас и закрывает вопрос хранения без раздражения.",
      image: {
        src: publicAsset("/proof-wardrobe.jpg"),
        alt: "Сдержанный встроенный шкаф в мягкой светлой палитре.",
      },
    },
    {
      label: "Комната",
      size: "small",
      problem: "Чужая логика, неудобные углы и ощущение, что всё не на своём месте.",
      outcome:
        "Пространство начинает поддерживать ваш ритм жизни, а не спорить с ним.",
    },
  ],
  steps: [
    {
      title: "Вы говорите, что бесит",
      description: "Коротко и по-человечески, без сложных формулировок.",
    },
    {
      title: "Мы собираем решение",
      description: "Под ваши размеры, привычки и реальный ритм жизни.",
    },
    {
      title: "Делаем аккуратно",
      description: "Без лишней суеты и бесконечных кругов согласований.",
    },
    {
      title: "Вы просто живёте",
      description: "И не думаете, что это надо бы однажды переделать.",
    },
  ],
  finalCta: {
    title: "Хватит подстраивать жизнь под временные решения.",
    description:
      "Сделаем пространство, которое выглядит собранно, ощущается спокойно и работает как надо каждый день.",
    buttonLabel: "Обсудить проект",
  },
  siteConfig: {
    brandName: "MESTO",
    telegramUrl: "https://t.me/",
    seoDescription:
      "Брендовый лендинг для мебели на заказ: мягкий свет, точная композиция и ощущение пространства, которое наконец работает как надо.",
    contacts: {
      telegram: {
        label: "Telegram",
        href: "https://t.me/",
        note: "Главный вход в проект",
      },
      vk: {
        label: "VK",
        href: "https://vk.com/",
        note: "Лента и сообщения",
      },
      avito: {
        label: "Авито",
        href: "https://www.avito.ru/",
        note: "Объявления и примеры работ",
      },
      map: {
        label: "Карта",
        href: "https://yandex.ru/maps/",
        note: "Открыть на Яндекс Картах",
      },
    },
  },
};
