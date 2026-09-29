"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CalendarPlus,
  FolderHeart,
  Home,
  Mail,
  MessageCircle,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge, NewBadge } from "@projectx/ui/Badge";
import { Button, IconButton } from "@projectx/ui/Button";
import { Card, CardHeader, StatCard } from "@projectx/ui/Card";
import { Chip, Switch } from "@projectx/ui/Chip";
import { EmptyState, ErrorState } from "@projectx/ui/EmptyState";
import { IconBox, type IconTone } from "@projectx/ui/IconBox";
import { Input, Textarea } from "@projectx/ui/Input";
import { Modal } from "@projectx/ui/Modal";
import { PageHeader, SectionHeader } from "@projectx/ui/PageHeader";
import { Select } from "@projectx/ui/Select";
import { ListSkeleton, Skeleton } from "@projectx/ui/Skeleton";
import { StarRating } from "@projectx/ui/StarRating";
import { Tabs } from "@projectx/ui/Tabs";
import { Toast, useToast, type ToastTone } from "@projectx/ui/Toast";
import { Tooltip } from "@projectx/ui/Tooltip";
import { Illustration, illustrations, type IllustrationName } from "@projectx/ui/illustrations";
import { Logo, LogoMark } from "@projectx/ui/layout/Logo";

/* This page is a developer's tool and is not translated: its labels are written in Uzbek. */

const SECTIONS = [
  ["colors", "Ranglar"],
  ["type", "Shrift"],
  ["shape", "Radius va soya"],
  ["logo", "Logo"],
  ["icons", "Ikonkalar"],
  ["illustrations", "Illyustratsiyalar"],
  ["buttons", "Tugmalar"],
  ["cards", "Kartalar"],
  ["fields", "Maydonlar"],
  ["chips", "Chip, Badge, Avatar"],
  ["tabs", "Tabs"],
  ["overlays", "Modal, Toast, Tooltip"],
  ["states", "Bo'sh holat, Skeleton"],
  ["headers", "Sarlavhalar"],
] as const;

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
const SCALES: { name: string; token: string; steps: string[]; note: string }[] = [
  { name: "Primary", token: "primary", steps: STEPS, note: "50 fon · 100 chip · 500 brend · 700 matn va tugma · 800 hover · 900 sarlavha" },
  { name: "Neutral", token: "neutral", steps: STEPS, note: "ko'kimtir tonli: 50 sahifa foni · 200 chiziq · 600 ikkinchi matn · 900 matn" },
  { name: "Success", token: "success", steps: ["50", "500", "700"], note: "50 fon + 700 matn" },
  { name: "Warning", token: "warning", steps: ["50", "500", "700"], note: "50 fon + 700 matn" },
  { name: "Danger", token: "danger", steps: ["50", "500", "600", "700"], note: "50 fon + 700 matn · 600 oq yozuv ostida" },
  { name: "Teal (doktor)", token: "teal", steps: ["50", "100", "300", "500", "600", "700"], note: "doktor ilovasi aksenti" },
  { name: "Indigo (admin)", token: "indigo", steps: ["50", "100", "300", "500", "600", "700"], note: "admin ilovasi aksenti" },
];

const TYPE: { name: string; cls: string; spec: string; sample: string }[] = [
  { name: "display", cls: "font-display text-display-sm md:text-display text-primary-900", spec: "Manrope 800 · 40 / 48", sample: "Doktoringizni toping" },
  { name: "h1", cls: "font-display text-h1 text-primary-900", spec: "Manrope 800 · 32", sample: "Найдите своего врача" },
  { name: "h2", cls: "font-display text-h2", spec: "Manrope 700 · 24", sample: "Sog'lig'ingiz bir joyda" },
  { name: "h3", cls: "font-display text-h3", spec: "Manrope 700 · 20", sample: "Keyingi qabul · Следующий приём" },
  { name: "body", cls: "text-body", spec: "Inter 400 · 16 / 1.5", sample: "Tahlillar, rasmlar va doktor xulosalari doim qo'lingizda. Анализы и заключения всегда под рукой." },
  { name: "small", cls: "text-small text-muted", spec: "Inter 400 · 14", sample: "Ertaga 10:30 · Kardiolog · Akfa Medline" },
  { name: "caption", cls: "text-caption text-neutral-500", spec: "Inter 400 · 12", sample: "Oxirgi yangilanish: bugun, 09:41" },
];

const NAV = [
  { icon: Home, label: "Asosiy" },
  { icon: Stethoscope, label: "Doktorlar" },
  { icon: CalendarDays, label: "Qabullar" },
  { icon: FolderHeart, label: "Daftar" },
  { icon: MessageCircle, label: "Chat" },
];

const ACCENTS: { name: string; accent?: "teal" | "indigo"; icon: typeof Users }[] = [
  { name: "Bemor · primary ko'k", icon: Users },
  { name: "Doktor · teal", accent: "teal", icon: Stethoscope },
  { name: "Admin · indigo", accent: "indigo", icon: ShieldCheck },
];

const ILLUSTRATION_LABELS: Record<IllustrationName, string> = {
  appointments: "Bo'sh qabullar",
  records: "Bo'sh kartochka",
  chat: "Bo'sh chat",
  search: "Qidiruv topilmadi",
  error: "Xato",
  offline: "Offline",
  pending: "Tasdiqlash kutilmoqda",
  success: "Muvaffaqiyat",
  findDoctor: "Doktor topish (landing)",
};

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5 border-b border-line pb-3">
        <h2 className="text-h2 text-primary-900">{title}</h2>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Row({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div>
      <div className="mb-2.5 text-caption font-semibold uppercase tracking-wider text-neutral-500">{label}</div>
      <div className={className ?? "flex flex-wrap items-center gap-3"}>{children}</div>
    </div>
  );
}

export function DesignShowcase() {
  const [tab, setTab] = useState("upcoming");
  const [chip, setChip] = useState("cardiologist");
  const [on, setOn] = useState(true);
  const [modal, setModal] = useState(false);
  const [rating, setRating] = useState(4);
  const [tone, setTone] = useState<ToastTone>("neutral");
  const { toast, show } = useToast();
  const notify = (t: ToastTone, message: string) => {
    setTone(t);
    show(message);
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-page">
          <Logo href="/design" />
          <Badge tone="primary">Design system</Badge>
          <nav className="ml-auto flex gap-1 overflow-x-auto scrollbar-none text-sm font-medium text-muted">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 rounded-pill px-2.5 py-1.5 hover:bg-primary-50 hover:text-primary-700">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] animate-enter flex-col gap-12 px-page py-8 md:py-12">
        <PageHeader
          title="ProjectX dizayn tizimi"
          subtitle="Tokenlar va komponentlar, hamma variantlari bilan. Faqat development rejimida ochiladi."
          className="mb-0 md:mb-0"
        />

        <Section id="colors" title="Ranglar" note="Brend ko'k o'zgarmagan (#1a9be6). Neytral ranglar sof kulrang emas, ko'kimtir.">
          {SCALES.map((s) => (
            <Row key={s.token} label={`${s.name} — ${s.note}`} className="grid grid-cols-5 gap-2 md:grid-cols-10">
              {s.steps.map((step) => (
                <div key={step}>
                  <div
                    className="h-14 rounded-md border border-neutral-900/5"
                    style={{ background: `var(--color-${s.token}-${step})` }}
                  />
                  <div className="mt-1 text-caption font-medium text-muted">{step}</div>
                </div>
              ))}
            </Row>
          ))}
        </Section>

        <Section id="type" title="Shrift" note="Sarlavha: Manrope 700/800, letter-spacing −0.02em, line-height 1.15. Matn: Inter 400/500/600, line-height 1.5. Ikkalasi ham kirillni qo'llaydi.">
          <Card>
            <div className="flex flex-col divide-y divide-line">
              {TYPE.map((t) => (
                <div key={t.name} className="grid grid-cols-1 gap-1 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_1fr] md:items-baseline md:gap-6">
                  <div>
                    <div className="text-sm font-semibold text-heading">{t.name}</div>
                    <div className="text-caption text-neutral-500">{t.spec}</div>
                  </div>
                  <div className={t.cls}>{t.sample}</div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section id="shape" title="Radius va soya" note="Kartalar lg, tugmalar pill, inputlar md, sheet va modal xl. Soyalar ko'kimtir va yumshoq.">
          <Row label="Radius" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {[
              ["sm", "10px", "rounded-sm"],
              ["md", "14px · input", "rounded-md"],
              ["lg", "20px · karta", "rounded-lg"],
              ["xl", "28px · modal", "rounded-xl"],
              ["pill", "999px · tugma", "rounded-pill"],
            ].map(([name, note, cls]) => (
              <div key={name}>
                <div className={`h-20 border-2 border-primary-300 bg-primary-50 ${cls}`} />
                <div className="mt-2 text-sm font-semibold text-heading">{name}</div>
                <div className="text-caption text-neutral-500">{note}</div>
              </div>
            ))}
          </Row>
          <Row label="Soya" className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              ["shadow-sm", "1 · karta", "shadow-sm"],
              ["shadow-md", "2 · hover, suzuvchi karta", "shadow-md"],
              ["shadow-lg", "3 · menyu, modal", "shadow-lg"],
            ].map(([name, note, cls]) => (
              <div key={name} className={`rounded-lg bg-card p-5 ${cls}`}>
                <div className="text-sm font-semibold text-heading">{name}</div>
                <div className="text-caption text-neutral-500">{note}</div>
              </div>
            ))}
          </Row>
        </Section>

        <Section id="logo" title="Logo" note="Plus + chat pufakchasi: tibbiyot belgisi va muloqot. Bitta rang; favicon va PWA ikonkalari shu belgidan chiziladi.">
          <Card>
            <div className="flex flex-wrap items-end gap-8">
              {[24, 32, 48].map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <LogoMark size={size} />
                  <span className="text-caption text-neutral-500">{size}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary-500">
                  <LogoMark size={40} light />
                </span>
                <span className="text-caption text-neutral-500">ilova ikonkasi</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Logo href="/design" />
                <span className="text-caption text-neutral-500">so&apos;z bilan</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <span className="rounded-md bg-primary-900 px-4 py-3">
                  <Logo href="/design" light />
                </span>
                <span className="text-caption text-neutral-500">to&apos;q fonda</span>
              </div>
            </div>
          </Card>
        </Section>

        <Section id="icons" title="Ikonkalar" note="lucide, stroke 1.75. Yalang'och ikonka yo'q: har biri o'z konteynerida.">
          <Row label="Navigatsiya — 40px yumaloq-kvadrat, aktiv holatda primary-500 fon + oq ikonka">
            {NAV.map((n, i) => (
              <div key={n.label} className="flex w-16 flex-col items-center gap-1.5">
                <IconBox size="md" shape="square" active={i === 0}>
                  <n.icon />
                </IconBox>
                <span className={`text-caption font-semibold ${i === 0 ? "text-primary-700" : "text-muted"}`}>{n.label}</span>
              </div>
            ))}
          </Row>
          <Row label="Kartalarda — 44–48px duo-tone: och doira + 700 ikonka">
            {(["primary", "teal", "indigo", "success", "warning", "danger", "neutral"] as IconTone[]).map((t, i) => {
              const Icon = [Stethoscope, Users, ShieldCheck, CalendarPlus, Bell, Trash2, Mail][i];
              return (
                <div key={t} className="flex flex-col items-center gap-1.5">
                  <IconBox tone={t} size="xl">
                    <Icon />
                  </IconBox>
                  <span className="text-caption text-neutral-500">{t}</span>
                </div>
              );
            })}
          </Row>
          <Row label="Rol aksentlari — asos bir xil, faqat aksent farq qiladi" className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ACCENTS.map((a) => (
              <div key={a.name} data-accent={a.accent}>
                <Card accent="accent">
                  <div className="flex items-center gap-3">
                    <IconBox tone="accent" size="xl">
                      <a.icon />
                    </IconBox>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-heading">{a.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge tone="accent" dot>
                          Aksent
                        </Badge>
                        <IconBox tone="accent" size="sm" shape="square" active>
                          <a.icon />
                        </IconBox>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="accent" size="sm">
                      Aksent tugma
                    </Button>
                    <Button size="sm">Asosiy tugma</Button>
                  </div>
                </Card>
              </div>
            ))}
          </Row>
        </Section>

        <Section id="illustrations" title="Illyustratsiyalar" note="160×120, yassi, uch rang (primary-100 / 300 / 500) va oq: yumshoq fon ustida oq buyum.">
          <Row label="Bo'sh holatlar va landing uchun" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {(Object.keys(illustrations) as IllustrationName[]).map((name) => (
              <Card key={name} className="flex flex-col items-center text-center">
                <Illustration name={name} />
                <div className="mt-2 text-sm font-semibold text-heading">{ILLUSTRATION_LABELS[name]}</div>
                <div className="text-caption text-neutral-500">{name}</div>
              </Card>
            ))}
          </Row>
        </Section>

        <Section id="buttons" title="Tugmalar" note="Pill shakl. Oq yozuv faqat primary-700 ustida (5.15:1); primary-500 fon, aksent va ikonka konteynerlarida qoladi. Bosilganda 0.98 scale.">
          {(["primary", "secondary", "ghost", "danger"] as const).map((v) => (
            <Row key={v} label={v}>
              <Button variant={v} size="sm">
                Kichik
              </Button>
              <Button variant={v}>O&apos;rta</Button>
              <Button variant={v} size="lg">
                Katta
              </Button>
              <Button variant={v} icon={v === "danger" ? <Trash2 /> : <CalendarPlus />}>
                Ikonka bilan
              </Button>
              <Button variant={v} iconRight={<ArrowRight />}>
                Davom etish
              </Button>
              <Button variant={v} loading>
                Yuklanmoqda
              </Button>
              <Button variant={v} disabled>
                O&apos;chirilgan
              </Button>
            </Row>
          ))}
          <Row label="Ikonka tugma">
            <IconButton label="Bildirishnomalar">
              <Bell className="h-5 w-5" />
            </IconButton>
            <IconButton label="Qo'shish" className="bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-800">
              <Plus className="h-5 w-5" />
            </IconButton>
          </Row>
        </Section>

        <Section id="cards" title="Kartalar" note="Radius lg, ichki bo'shliq 20–24. Interaktiv karta hover da 2px ko'tariladi (150ms).">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader title="Oddiy karta" subtitle="Ma'lumot ko'rsatadi, bosilmaydi" />
              <p className="text-sm text-muted">Oq fon, ingichka chegara, birinchi darajali soya.</p>
            </Card>
            <Card href="#cards">
              <CardHeader title="Interaktiv karta" subtitle="Ustiga olib boring" action={<ArrowRight className="h-5 w-5 text-primary-700" />} />
              <p className="text-sm text-muted">2px ko&apos;tariladi, soya ikkinchi darajaga o&apos;tadi.</p>
            </Card>
            <Card accent="primary">
              <CardHeader title="Ajratilgan karta" subtitle="Chap tomonda aksent chiziq" />
              <p className="text-sm text-muted">Ro&apos;yxat ichida muhim yozuvni ajratish uchun.</p>
            </Card>
          </div>
          <Row label="StatCard — katta raqam + kichik yorliq + ikonka konteyner" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Keyingi qabul" value="10:30" hint="Ertaga · Kardiolog" icon={<CalendarDays />} />
            <StatCard label="Bugungi dorilar" value="3" hint="1 tasi ichildi" icon={<Pill />} tone="success" />
            <StatCard label="Yangi xabar" value="2" hint="Dr. Rahimov" icon={<MessageCircle />} tone="warning" href="#cards" />
          </Row>
        </Section>

        <Section id="fields" title="Maydonlar" note="Yorliq tepada, radius md, focus da 2px primary-500 halqa.">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input label="Ism" placeholder="Dilnoza" hint="Pasportdagidek yozing" />
            <Input label="Qidiruv" placeholder="Mutaxassislik yoki doktor ismi" leftIcon={<Search className="h-5 w-5" />} />
            <Input label="Telefon" defaultValue="+998 90 123" error="Telefon raqami to'liq emas" />
            <Input label="O'chirilgan" defaultValue="dilnoza@example.com" disabled />
            <Select
              label="Mutaxassislik"
              placeholder="Tanlang"
              options={[
                { value: "cardiologist", label: "Kardiolog" },
                { value: "dentist", label: "Stomatolog" },
                { value: "pediatrician", label: "Pediatr" },
              ]}
            />
            <Select label="Shahar" placeholder="Tanlang" options={[{ value: "tashkent", label: "Toshkent" }]} error="Shaharni tanlang" />
            <Textarea label="Shikoyat" placeholder="Nima bezovta qilyapti?" hint="Doktor qabuldan oldin o'qiydi" />
            <Textarea label="Izoh" defaultValue="Juda qisqa" error="Kamida 20 ta belgi yozing" />
          </div>
        </Section>

        <Section id="chips" title="Chip, Badge, Avatar">
          <Row label="Chip — tanlangan: primary-100 fon">
            {[
              ["cardiologist", "Kardiolog"],
              ["dentist", "Stomatolog"],
              ["pediatrician", "Pediatr"],
              ["neurologist", "Nevrolog"],
            ].map(([k, label]) => (
              <Chip key={k} active={chip === k} onClick={() => setChip(k)}>
                {label}
              </Chip>
            ))}
            <Chip disabled>Band</Chip>
            <Switch checked={on} onChange={setOn} label="Eslatma" />
          </Row>
          <Row label="Badge — 50 fon + 700 matn">
            <Badge tone="primary" dot>
              Rejalashtirilgan
            </Badge>
            <Badge tone="success" dot>
              Yakunlangan
            </Badge>
            <Badge tone="warning" dot>
              Kutilmoqda
            </Badge>
            <Badge tone="danger" dot>
              Kelmadi
            </Badge>
            <Badge tone="neutral" dot>
              Bekor qilingan
            </Badge>
            <Badge tone="accent">Aksent</Badge>
            <NewBadge label="Yangi" />
          </Row>
          <Row label="Avatar — rasm bo'lmasa rangli initsial">
            {["Dilnoza Karimova", "Aziz Rahimov", "Malika Yusupova", "Bobur Aliyev", "Нодира Ахмедова", "Sardor Tursunov"].map((n) => (
              <Avatar key={n} name={n} />
            ))}
            <Avatar name="Dilnoza Karimova" size="xs" />
            <Avatar name="Dilnoza Karimova" size="sm" />
            <Avatar name="Dilnoza Karimova" size="lg" ring />
            <Avatar name="Dilnoza Karimova" size="xl" />
          </Row>
          <Row label="Reyting">
            <StarRating value={4.5} showValue count={128} />
            <StarRating value={rating} onChange={setRating} size="md" />
          </Row>
        </Section>

        <Section id="tabs" title="Tabs" note="Pill-segment: aktiv bo'lim oq, soya bilan.">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: "upcoming", label: "Kelgusi", count: 2 },
              { key: "past", label: "O'tgan", count: 14 },
              { key: "cancelled", label: "Bekor qilingan" },
            ]}
          />
          <Tabs
            variant="underline"
            value={tab}
            onChange={setTab}
            items={[
              { key: "upcoming", label: "Kelgusi", count: 2 },
              { key: "past", label: "O'tgan", count: 14 },
              { key: "cancelled", label: "Bekor qilingan" },
            ]}
          />
        </Section>

        <Section id="overlays" title="Modal, Toast, Tooltip" note="Mobilda modal pastdan chiqadi, tepasida tutqich chizig'i bor. Radius xl.">
          <Row label="Ochish">
            <Button variant="secondary" onClick={() => setModal(true)}>
              Modal / Sheet
            </Button>
            <Button variant="secondary" onClick={() => notify("neutral", "Havola nusxalandi")}>
              Toast
            </Button>
            <Button variant="secondary" onClick={() => notify("success", "Qabul tasdiqlandi")}>
              Toast · muvaffaqiyat
            </Button>
            <Button variant="secondary" onClick={() => notify("danger", "Saqlab bo'lmadi")}>
              Toast · xato
            </Button>
            <span className="inline-flex items-center gap-1 text-sm text-muted">
              Tooltip <Tooltip label="Izoh" text="Qabuldan 2 soat oldin bepul bekor qilish mumkin." />
            </span>
          </Row>
          <Row label="Modal ko'rinishi (namuna)" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-card shadow-lg">
              <div className="flex items-center justify-between gap-3 pl-6 pr-4 pt-5 pb-2">
                <h3 className="text-h3">Qabulni bekor qilish</h3>
              </div>
              <p className="px-6 pb-6 text-muted">Ertaga 10:30 dagi qabul bekor qilinadi. To&apos;lov 3 kun ichida qaytariladi.</p>
              <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
                <Button variant="ghost">Yo&apos;q</Button>
                <Button variant="danger">Bekor qilish</Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[375px] overflow-hidden rounded-t-xl bg-card shadow-lg">
              <div className="mx-auto mt-2.5 h-1.5 w-11 rounded-pill bg-neutral-300" />
              <div className="px-5 pt-3 pb-2">
                <h3 className="text-h3">Filtrlar</h3>
              </div>
              <div className="flex flex-wrap gap-2 px-5 pb-5">
                <Chip active>Toshkent</Chip>
                <Chip>Samarqand</Chip>
                <Chip>Buxoro</Chip>
              </div>
              <div className="border-t border-line px-5 py-4">
                <Button fullWidth>Ko&apos;rsatish</Button>
              </div>
            </div>
          </Row>
        </Section>

        <Section id="states" title="Bo'sh holat, Skeleton">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <EmptyState
              illustration="appointments"
              title="Hali qabul yo'q"
              description="Doktor tanlang va o'zingizga qulay vaqtga yoziling."
              action={<Button icon={<Search />}>Doktor topish</Button>}
            />
            <ErrorState
              title="Yuklab bo'lmadi"
              description="Internet aloqasini tekshirib, qayta urinib ko'ring."
              action={<Button variant="secondary">Qayta urinish</Button>}
            />
            <EmptyState compact illustration="search" title="Hech narsa topilmadi" description="So'rovni o'zgartirib ko'ring." />
            <EmptyState compact illustration="chat" title="Xabarlar yo'q" description="Doktorga savol yozing." />
          </div>
          <Row label="Skeleton" className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ListSkeleton rows={2} />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72 max-w-full" />
              <Skeleton className="h-28 rounded-lg" />
            </div>
          </Row>
        </Section>

        <Section id="headers" title="Sarlavhalar">
          <Card>
            <PageHeader
              title="Qabullarim"
              subtitle="Kelgusi va o'tgan qabullaringiz"
              backHref="#headers"
              actions={<Button icon={<CalendarPlus />}>Yangi qabul</Button>}
              className="mb-6 md:mb-6"
            />
            <SectionHeader
              description="Bugun ichishingiz kerak bo'lgan dorilar"
              action={
                <Button variant="ghost" size="sm" iconRight={<ArrowRight />}>
                  Hammasi
                </Button>
              }
            >
              Bugungi dorilar
            </SectionHeader>
            <div className="rounded-md bg-neutral-50 p-4 text-sm text-muted">Bo&apos;lim mazmuni</div>
          </Card>
        </Section>
      </main>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Qabulni bekor qilish"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Yo&apos;q
            </Button>
            <Button variant="danger" onClick={() => setModal(false)}>
              Bekor qilish
            </Button>
          </>
        }
      >
        <p className="text-muted">Ertaga 10:30 dagi qabul bekor qilinadi. To&apos;lov 3 kun ichida qaytariladi.</p>
      </Modal>
      <Toast message={toast} tone={tone} />
    </div>
  );
}
