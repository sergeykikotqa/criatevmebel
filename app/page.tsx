import Image from "next/image";
import Link from "next/link";

import { HeroFinal } from "@/components/hero-final";
import { Reveal } from "@/components/reveal";
import { landingContent, type ContactLink, type ProofCard } from "@/lib/content";

function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
          {description}
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
  "Комната": {
    problem: "Пространство мешает ритму.",
    outcome: "Комната работает на вас.",
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

              <div className="relative flex h-full flex-col gap-6 p-4 sm:gap-7 sm:p-6 lg:gap-8 lg:p-10">
                <div className="hidden max-w-[14rem] hero:block">
                  <p className="kicker text-white/40">Временные решения</p>
                  <p className="mt-3 text-sm leading-6 text-white/56">
                    То, что сначала кажется терпимым, а потом раздражает каждый день.
                  </p>
                </div>

                <HeroFinal finalPhrase={hero.finalPhrase} transientPhrases={hero.transientPhrases} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max-width)] px-5 py-12 sm:px-6 sm:py-16 lg:px-10 lg:pb-8 lg:pt-16">
        <Reveal>
          <SectionHeader
            kicker="Было → стало"
            title="Уровень чувствуется не по словам, а по тому, как пространство работает."
            description="Здесь один главный акцент и два доказательства: хорошо сделано видно сразу."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,0.92fr)]">
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
      </section>

      <section className="mx-auto max-w-[var(--max-width)] px-5 py-10 sm:px-6 sm:py-12 lg:px-10 lg:pb-14 lg:pt-2">
        <Reveal>
          <SectionHeader
            kicker="Простота"
            title="Нормальный процесс не выглядит как марафон согласований."
            description="Он идёт легко, почти редакционно: одна мысль, один шаг, один понятный результат."
          />
        </Reveal>

        <div className="mt-7 grid gap-4 md:hidden">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={0.04 * index} y={12}>
              <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-4">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-white/34">
                  0{index + 1}
                </p>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.05em] text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  {step.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="relative mt-8 hidden md:block">
          <div className="absolute left-0 right-0 top-[1.2rem] hidden h-px bg-white/10 xl:block" />

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={0.05 * index} y={14}>
                <article className="relative xl:pt-10">
                  <span className="absolute left-0 top-[0.45rem] h-6 w-6 rounded-full border border-[rgba(222,214,199,0.28)] bg-[var(--color-bg)]" />
                  <div className="max-w-[16rem] pl-10">
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-white/34">
                      0{index + 1}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold tracking-[-0.05em] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/56">
                      {step.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max-width)] px-5 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pb-24 lg:pt-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.35rem] border border-white/10 bg-[linear-gradient(145deg,rgba(18,22,29,0.98),rgba(9,12,16,0.94))] px-5 py-10 shadow-[0_34px_90px_rgba(0,0,0,0.3)] sm:rounded-[2.9rem] sm:px-10 sm:py-16 lg:px-14 lg:py-18">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(222,214,199,0.12),transparent_30%),radial-gradient(circle_at_90%_100%,rgba(255,255,255,0.05),transparent_30%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
              <div className="max-w-4xl">
                <p className="kicker">Финал</p>
                <h2 className="mt-6 text-4xl font-semibold tracking-[-0.085em] text-white sm:text-5xl lg:text-[4.1rem] lg:leading-[0.95]">
                  {finalCta.title}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                  {finalCta.description}
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-[rgba(222,214,199,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.018))] p-5 backdrop-blur-sm sm:rounded-[1.8rem] sm:p-6">
                <p className="kicker text-[var(--color-accent)]">Точка входа</p>
                <Link
                  href={primaryContact.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-5 block rounded-[1.45rem] border border-[rgba(222,214,199,0.22)] bg-[linear-gradient(180deg,rgba(222,214,199,0.14),rgba(222,214,199,0.06))] px-4 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-white">
                        {primaryContact.label}
                      </p>
                      {primaryContact.note ? (
                        <p className="mt-2 text-sm leading-6 text-white/62">
                          {primaryContact.note}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm text-white/46 transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
                <Link
                  href={siteConfig.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary mt-5 w-full justify-between text-base"
                >
                  {finalCta.buttonLabel}
                </Link>
                <div className="mt-6 h-px w-20 bg-[linear-gradient(90deg,rgba(222,214,199,0.68),transparent)]" />
                <div className="mt-5">
                  <p className="kicker text-white/30">Дополнительно</p>
                </div>
                <div className="mt-3 grid gap-1.5">
                  {secondaryContactLinks.map((contact) => (
                    <Link
                      key={contact.label}
                      href={contact.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start justify-between gap-4 rounded-[1rem] px-1 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-white/58">{contact.label}</p>
                        {contact.note ? (
                          <p className="mt-1 text-xs leading-5 text-white/32">{contact.note}</p>
                        ) : null}
                      </div>
                      <span className="text-sm text-white/18 transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
