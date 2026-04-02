import Image from "next/image";
import Link from "next/link";

import { HeroOverlay } from "@/components/hero-overlay";
import { Reveal } from "@/components/reveal";
import { landingContent, type ContactLink, type ProofCard } from "@/lib/content";

function SectionRail({
  kicker,
  title,
  description,
  bridge,
}: {
  kicker: string;
  title: string;
  description?: string;
  bridge?: string;
}) {
  return (
    <div className="max-w-[24rem]">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-5 text-[clamp(2rem,4vw,3.7rem)] font-semibold leading-[0.96] tracking-[-0.075em] text-white">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-[22rem] text-base leading-7 text-[var(--color-muted)] sm:text-lg">
          {description}
        </p>
      ) : null}
      {bridge ? (
        <p className="mt-4 max-w-[21rem] text-sm leading-6 text-white/46 sm:text-[0.98rem] sm:leading-7">
          {bridge}
        </p>
      ) : null}
    </div>
  );
}

const mobileProofCopy: Record<string, { problem: string; outcome: string }> = {
  "Кухня": {
    problem: "Лишние движения каждый день.",
    outcome: "У всего есть своё место.",
  },
  "Шкаф": {
    problem: "Внутри вечный компромисс.",
    outcome: "Хранение закрывает вопрос.",
  },
};

function ProofLeadCard({ card }: { card: ProofCard }) {
  const compact = mobileProofCopy[card.label];

  return (
    <article className="relative min-h-[26rem] overflow-hidden rounded-[2.35rem] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.32)] sm:min-h-[32rem] sm:rounded-[2.75rem]">
      {card.image ? (
        <>
          <Image
            src={card.image.src}
            alt={card.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,15,0.2)_0%,rgba(8,11,15,0.42)_40%,rgba(8,11,15,0.95)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_32%)] opacity-60" />
        </>
      ) : null}

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-8 lg:p-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
              01
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white sm:text-3xl">
              {card.label}
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-black/10 px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.28em] text-white/42 backdrop-blur-sm">
            proof
          </span>
        </div>

        <div className="grid gap-4 lg:max-w-[30rem]">
          <div className="rounded-[1.6rem] border border-white/7 bg-[rgba(5,7,10,0.62)] p-4 backdrop-blur-md sm:rounded-[1.8rem] sm:p-5">
            <p className="kicker text-white/26">Было</p>
            <p className="mt-4 text-sm leading-6 text-white/24 line-through decoration-white/10 sm:hidden">
              {compact.problem}
            </p>
            <p className="mt-4 hidden text-base leading-7 text-white/28 line-through decoration-white/12 sm:block sm:text-lg">
              {card.problem}
            </p>
          </div>
          <div className="rounded-[1.7rem] border border-[rgba(222,214,199,0.34)] bg-[rgba(222,214,199,0.2)] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)] backdrop-blur-md sm:rounded-[1.9rem] sm:p-5">
            <p className="kicker text-[var(--color-accent)]">Стало</p>
            <p className="mt-4 text-sm leading-6 text-white sm:hidden">
              {compact.outcome}
            </p>
            <p className="mt-4 hidden text-base leading-7 text-white sm:block sm:text-lg">
              {card.outcome}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProofSmallCard({ card, index }: { card: ProofCard; index: number }) {
  const compact = mobileProofCopy[card.label];

  return (
    <article className="group relative overflow-hidden rounded-[1.95rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,22,29,0.92),rgba(10,13,17,0.78))] shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:rounded-[2.15rem]">
      {card.image ? (
        <>
          <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3]">
            <Image
              src={card.image.src}
              alt={card.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,13,0.16),rgba(8,10,13,0.52)_72%,rgba(8,10,13,0.76))]" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(222,214,199,0.12),transparent_34%),linear-gradient(180deg,rgba(17,22,29,0.92),rgba(10,13,17,0.78))]" />
      )}

      <div className="relative p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-white/38">
            0{index + 2}
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/28">
            {card.size}
          </p>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-[-0.05em] text-white">
          {card.label}
        </h3>
        <div className="mt-5 grid gap-3">
          <div className="rounded-[1.25rem] border border-white/7 bg-[rgba(5,7,10,0.58)] p-3.5 sm:rounded-[1.35rem] sm:p-4">
            <p className="kicker text-white/24">Было</p>
            <p className="mt-3 text-sm leading-6 text-white/24 line-through decoration-white/10 sm:hidden">
              {compact.problem}
            </p>
            <p className="mt-3 hidden text-sm leading-6 text-white/28 line-through decoration-white/10 sm:block">
              {card.problem}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-[rgba(222,214,199,0.26)] bg-[rgba(222,214,199,0.15)] p-3.5 sm:rounded-[1.45rem] sm:p-4">
            <p className="kicker text-[var(--color-accent)]">Стало</p>
            <p className="mt-3 text-sm leading-6 text-white/96 sm:hidden">
              {compact.outcome}
            </p>
            <p className="mt-3 hidden text-sm leading-6 text-white/94 sm:block">
              {card.outcome}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const { hero, proofCards, steps, finalCta, siteConfig } = landingContent;
  const leadProof = proofCards.find((card) => card.size === "large") ?? proofCards[0];
  const secondaryProofs = proofCards.filter((card) => card !== leadProof);
  const secondaryContactLinks = [
    siteConfig.contacts.vk,
    siteConfig.contacts.avito,
    siteConfig.contacts.map,
  ].filter((contact): contact is ContactLink => Boolean(contact));
  const primaryContact = siteConfig.contacts.telegram;

  return (
    <main className="relative overflow-x-clip pb-8">
      <header className="sticky top-0 z-30 border-b border-white/6 bg-[rgba(8,10,13,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[var(--max-width)] items-center justify-between gap-6 px-5 py-3 sm:px-6 lg:px-10">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.38em] text-white/78">
            {siteConfig.brandName}
          </p>
          <Link
            href={siteConfig.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="button-secondary text-sm"
          >
            {hero.primaryCta}
          </Link>
        </div>
      </header>

      <section
        data-hero
        className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-[var(--max-width)] items-center px-5 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:min-h-[calc(100svh-5rem)] lg:px-10 lg:pb-12 lg:pt-10"
      >
        <div className="grid w-full gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(22rem,0.94fr)] lg:items-center lg:gap-8">
          <div className="max-w-3xl">
            <div className="hero-enter">
              <span className="kicker rounded-full border border-white/8 px-4 py-2">
                {hero.eyebrow}
              </span>
            </div>

            <h1 className="hero-enter hero-enter-delay-1 mt-7 max-w-[11ch] text-[clamp(2.55rem,9vw,4.85rem)] font-semibold leading-[0.92] tracking-[-0.095em] text-white sm:mt-8 sm:max-w-4xl sm:text-[clamp(2.95rem,5.7vw,5.55rem)]">
              {hero.title}
            </h1>

            <p className="hero-enter hero-enter-delay-2 mt-4 max-w-[27rem] text-[0.97rem] leading-7 text-[var(--color-muted)] sm:mt-6 sm:text-xl sm:leading-8">
              {hero.description}
            </p>

            <div className="hero-enter hero-enter-delay-3 mt-6 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
              <Link
                href={siteConfig.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="button-primary text-sm sm:text-base"
              >
                {hero.primaryCta}
              </Link>
              {hero.secondaryCta ? (
                <div className="hidden sm:block">
                  <Link
                    href={siteConfig.telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary text-sm sm:text-base"
                  >
                    {hero.secondaryCta}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pt-1 sm:pt-2 lg:pt-0">
            <div className="relative isolate min-h-[13.5rem] overflow-hidden rounded-[2.1rem] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:min-h-[15rem] lg:min-h-[31rem] lg:rounded-[2.75rem]">
              <Image
                src={hero.image.src}
                alt={hero.image.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(5,7,10,0.94)_6%,rgba(5,7,10,0.66)_42%,rgba(5,7,10,0.86)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_32%)] opacity-70" />
              <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(180deg,transparent,rgba(7,10,14,0.92))]" />

              <div className="absolute inset-0 z-10 flex flex-col gap-6 p-4 sm:gap-7 sm:p-6 lg:p-10">
                <div className="flex flex-1 items-end hero:hidden">
                  <div className="w-fit max-w-[13.5rem] rounded-[1.6rem] border border-[rgba(222,214,199,0.2)] bg-[linear-gradient(180deg,rgba(9,13,18,0.82),rgba(9,13,18,0.52))] px-4 py-4 backdrop-blur-md sm:max-w-[15rem] sm:px-5">
                    <p className="kicker text-[var(--color-accent)]">Остаётся</p>
                    <p className="mt-3 text-[clamp(1.8rem,8vw,2.7rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white sm:mt-4">
                      {hero.finalPhrase}
                    </p>
                  </div>
                </div>

                <div className="relative hidden h-full w-full hero:flex hero:flex-1">
                  <div className="relative h-full w-full">
                    <div className="relative z-20 max-w-[13rem]">
                      <p className="kicker text-white/40">Временные решения</p>
                      <p className="mt-3 text-sm leading-6 text-white/56">
                        То, что сначала кажется терпимым, а потом раздражает каждый день.
                      </p>
                    </div>

                    <div className="absolute inset-y-0 right-0 w-full max-w-[21rem]">
                      <div className="relative flex h-full flex-col">
                        <div className="pointer-events-none absolute inset-x-0 top-[5.15rem] bottom-[9.35rem] z-10">
                          <HeroOverlay phrases={hero.transientPhrases} />
                        </div>

                        <div className="relative z-20 mt-auto w-full rounded-[1.8rem] border border-white/6 bg-[linear-gradient(180deg,rgba(13,17,22,0.68),rgba(11,15,20,0.44))] px-5 py-4 backdrop-blur-md">
                          <p className="kicker text-[var(--color-accent)]">Остаётся</p>
                          <p className="mt-3 max-w-[8ch] text-[clamp(2.05rem,3vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white">
                            {hero.finalPhrase}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max-width)] px-5 py-12 sm:px-6 sm:py-16 lg:px-10 lg:pb-8 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(16rem,0.62fr)_minmax(0,1.38fr)] lg:items-start lg:gap-12">
          <Reveal>
            <div className="lg:pt-2">
              <SectionRail
                kicker="Было → стало"
                title="Уровень чувствуется не по словам, а по тому, как пространство работает."
                description="Здесь один главный акцент и два доказательства: качество видно сразу."
                bridge="Разница продаётся быстрее всего в тот момент, когда пространство перестаёт спорить с повседневной жизнью."
              />
            </div>
          </Reveal>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            <Reveal>
              <ProofLeadCard card={leadProof} />
            </Reveal>

            <div className="grid gap-4">
              {secondaryProofs.map((card, index) => (
                <Reveal key={card.label} delay={0.06 * (index + 1)} y={16}>
                  <ProofSmallCard card={card} index={index} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max-width)] px-5 py-10 sm:px-6 sm:py-12 lg:px-10 lg:pb-16 lg:pt-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(16rem,0.62fr)_minmax(0,1.38fr)] lg:items-start lg:gap-12">
          <Reveal>
            <div className="lg:pt-1">
              <SectionRail
                kicker="Простота"
                title="Нормальный процесс не выглядит как марафон согласований."
                description="Он идёт легко, почти редакционно: одна мысль, один шаг, один понятный результат."
                bridge="Хороший процесс не требует от вас учиться новой системе. Он просто убирает лишнее между задачей и готовым результатом."
              />
            </div>
          </Reveal>

          <div className="border-y border-white/8">
            <div>
              {steps.map((step, index) => (
                <Reveal key={step.title} delay={0.05 * index} y={12}>
                  <article className="grid gap-4 border-b border-white/8 py-5 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6 sm:py-6">
                    <div className="flex items-center gap-4 text-white/34">
                      <span className="font-mono text-[0.7rem] uppercase tracking-[0.32em]">
                        0{index + 1}
                      </span>
                      <span className="h-px flex-1 bg-white/10 sm:hidden" />
                    </div>
                    <div className="max-w-[27rem]">
                      <h3 className="text-xl font-semibold tracking-[-0.05em] text-white sm:text-[1.45rem]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/56 sm:text-base sm:leading-7">
                        {step.description}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max-width)] px-5 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pb-24 lg:pt-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.35rem] border border-white/10 bg-[linear-gradient(145deg,rgba(18,22,29,0.98),rgba(9,12,16,0.94))] px-5 py-10 shadow-[0_34px_90px_rgba(0,0,0,0.3)] sm:rounded-[2.9rem] sm:px-10 sm:py-16 lg:px-14 lg:py-18">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(222,214,199,0.12),transparent_30%),radial-gradient(circle_at_90%_100%,rgba(255,255,255,0.05),transparent_30%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.82fr)] lg:items-start lg:gap-8">
              <div className="max-w-[34rem]">
                <p className="kicker">Финал</p>
                <h2 className="mt-6 max-w-[10ch] text-4xl font-semibold tracking-[-0.085em] text-white sm:text-5xl lg:text-[4.1rem] lg:leading-[0.95]">
                  {finalCta.title}
                </h2>
                <p className="mt-6 max-w-[30rem] text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                  {finalCta.description}
                </p>
                <p className="mt-5 max-w-[24rem] text-sm leading-6 text-white/46 sm:text-base sm:leading-7">
                  Один короткий диалог в Telegram заменяет длинную цепочку из разных точек входа и лишних уточнений.
                </p>
              </div>

              <div className="w-full lg:pt-[4.25rem]">
                <div className="w-full rounded-[1.8rem] border border-[rgba(222,214,199,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_22px_55px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:rounded-[2rem] sm:p-6">
                  <p className="kicker text-[var(--color-accent)]">{primaryContact.label}</p>
                  <h3 className="mt-4 max-w-[9ch] text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-white">
                    Самый быстрый вход в проект
                  </h3>
                  <p className="mt-4 max-w-[18rem] text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
                    {primaryContact.note ?? "Главный вход в проект"}
                  </p>
                  <Link
                    href={primaryContact.href}
                    target="_blank"
                    rel="noreferrer"
                    className="button-primary mt-8 w-full justify-between text-base"
                  >
                    {finalCta.buttonLabel}
                  </Link>
                  <p className="mt-3 text-xs leading-5 text-white/28">
                    Без длинной формы, без второй точки входа и без лишнего шага между интересом и разговором.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {secondaryContactLinks.length ? (
          <Reveal delay={0.08} y={10}>
            <div className="mt-4 border-t border-white/8 pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                {secondaryContactLinks.map((contact) => (
                  <Link
                    key={contact.label}
                    href={contact.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-[1rem] px-1 py-2 text-white/46 transition-colors duration-200 hover:text-white/74"
                  >
                    <div>
                      <p className="text-sm font-medium">{contact.label}</p>
                      {contact.note ? (
                        <p className="mt-1 text-xs leading-5 text-white/26 transition-colors duration-200 group-hover:text-white/38">
                          {contact.note}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm text-white/18 transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        ) : null}
      </section>
    </main>
  );
}
