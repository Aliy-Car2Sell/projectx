import type { SpecialtyKey, SummaryTemplate, SummaryTemplateSection } from "@projectx/types";

type L = { uz: string; ru: string; en: string };
type SectionDef = { title: L; placeholder: L; role?: SummaryTemplateSection["role"] };
const l = (uz: string, ru: string, en: string): L => ({ uz, ru, en });

// ---------- parts shared by several templates ----------
const complaints: SectionDef = {
  title: l("Shikoyatlar", "Жалобы", "Complaints"),
  placeholder: l("Bemor nimadan shikoyat qiladi, qachondan beri", "На что жалуется пациент и как давно", "What the patient complains of, and since when"),
};
const anamnesis: SectionDef = {
  title: l("Anamnez", "Анамнез", "History"),
  placeholder: l("Kasallik tarixi, surunkali kasalliklar, qabul qilayotgan dorilar", "История болезни, хронические заболевания, принимаемые препараты", "History of the illness, chronic conditions, current medication"),
};
const exam: SectionDef = {
  title: l("Ko'rik", "Осмотр", "Examination"),
  placeholder: l("Umumiy holat, teri, nafas, yurak, qorin", "Общее состояние, кожа, дыхание, сердце, живот", "General condition, skin, breathing, heart, abdomen"),
};
const diagnosis: SectionDef = {
  title: l("Tashxis", "Диагноз", "Diagnosis"),
  placeholder: l("Masalan: Arterial gipertoniya, 1-daraja", "Например: Артериальная гипертензия, 1 степень", "E.g. Arterial hypertension, grade 1"),
  role: "diagnosis",
};
const advice: SectionDef = {
  title: l("Tavsiyalar", "Рекомендации", "Recommendations"),
  placeholder: l("Davolash, dorilar va dozasi, qayta ko'rik muddati", "Лечение, препараты и дозировка, срок повторного осмотра", "Treatment, medication and dose, when to come back"),
  role: "recommendations",
};

const defs: { id: string; specialty: SpecialtyKey | "general"; name: L; sections: SectionDef[] }[] = [
  { id: "tpl-blank", specialty: "general", name: l("Bo'sh", "Пустой", "Blank"), sections: [diagnosis, advice] },
  {
    id: "tpl-therapist-first",
    specialty: "therapist",
    name: l("Terapevt: birlamchi ko'rik", "Терапевт: первичный осмотр", "Therapist: first visit"),
    sections: [complaints, anamnesis, exam, diagnosis, advice],
  },
  {
    id: "tpl-therapist-followup",
    specialty: "therapist",
    name: l("Terapevt: qayta ko'rik", "Терапевт: повторный осмотр", "Therapist: follow-up"),
    sections: [
      {
        title: l("Dinamika", "Динамика", "Progress"),
        placeholder: l("Oldingi ko'rikdan beri nima o'zgardi, davolash qanday ta'sir qildi", "Что изменилось с прошлого осмотра, как подействовало лечение", "What changed since the last visit, how the treatment worked"),
      },
      exam,
      diagnosis,
      advice,
    ],
  },
  {
    id: "tpl-cardio-visit",
    specialty: "cardiologist",
    name: l("Kardiolog ko'rigi", "Осмотр кардиолога", "Cardiology visit"),
    sections: [
      complaints,
      anamnesis,
      {
        title: l("AD va puls", "АД и пульс", "Blood pressure and pulse"),
        placeholder: l("Masalan: AD 140/90 mm sim. ust., puls 78, ritmik", "Например: АД 140/90 мм рт. ст., пульс 78, ритмичный", "E.g. BP 140/90 mmHg, pulse 78, regular"),
      },
      {
        title: l("EKG", "ЭКГ", "ECG"),
        placeholder: l("Ritm, YuQS, o'tkazuvchanlik, ST-T o'zgarishlari", "Ритм, ЧСС, проводимость, изменения ST-T", "Rhythm, heart rate, conduction, ST-T changes"),
      },
      exam,
      diagnosis,
      advice,
    ],
  },
  {
    id: "tpl-cardio-bp",
    specialty: "cardiologist",
    name: l("Gipertoniya nazorati", "Контроль гипертонии", "Hypertension follow-up"),
    sections: [
      {
        title: l("AD kundaligi", "Дневник АД", "Blood pressure diary"),
        placeholder: l("Uydagi o'lchovlar: ertalab / kechqurun, eng yuqori qiymat", "Домашние измерения: утро / вечер, максимальное значение", "Home readings: morning / evening, highest value"),
      },
      {
        title: l("AD va puls", "АД и пульс", "Blood pressure and pulse"),
        placeholder: l("Qabuldagi o'lchov", "Измерение на приёме", "Reading at the visit"),
      },
      {
        title: l("Dori qabul qilish", "Приём препаратов", "Medication taken"),
        placeholder: l("Qaysi dorilar, muntazammi, nojo'ya ta'sirlar", "Какие препараты, регулярно ли, побочные эффекты", "Which medicines, how regularly, side effects"),
      },
      { title: l("EKG", "ЭКГ", "ECG"), placeholder: l("O'zgarish bo'lsa yozing", "Опишите изменения, если есть", "Note any change") },
      diagnosis,
      advice,
    ],
  },
  {
    id: "tpl-gyn-visit",
    specialty: "gynecologist",
    name: l("Ginekolog ko'rigi", "Осмотр гинеколога", "Gynaecology visit"),
    sections: [
      complaints,
      {
        title: l("Hayz sikli", "Менструальный цикл", "Menstrual cycle"),
        placeholder: l("Oxirgi hayz sanasi, sikl davomiyligi, muntazamligi", "Дата последней менструации, длительность и регулярность цикла", "Last period, cycle length and regularity"),
      },
      {
        title: l("Akusherlik anamnezi", "Акушерский анамнез", "Obstetric history"),
        placeholder: l("Homiladorliklar, tug'ruqlar, abortlar", "Беременности, роды, аборты", "Pregnancies, births, abortions"),
      },
      { ...exam, placeholder: l("Ko'zgu va bimanual ko'rik natijasi", "Осмотр в зеркалах и бимануальное исследование", "Speculum and bimanual examination") },
      { title: l("UTT", "УЗИ", "Ultrasound"), placeholder: l("Bachadon, tuxumdonlar, endometriy qalinligi", "Матка, яичники, толщина эндометрия", "Uterus, ovaries, endometrial thickness") },
      diagnosis,
      advice,
    ],
  },
  {
    id: "tpl-pediatric-visit",
    specialty: "pediatrician",
    name: l("Pediatr ko'rigi", "Осмотр педиатра", "Paediatric visit"),
    sections: [
      { ...complaints, placeholder: l("Ota-ona so'zidan: nima bezovta qilyapti, qachondan beri", "Со слов родителей: что беспокоит и как давно", "From the parents: what is wrong, and since when") },
      anamnesis,
      {
        title: l("Vazn va bo'y", "Вес и рост", "Weight and height"),
        placeholder: l("Masalan: vazn 14,2 kg, bo'y 96 sm", "Например: вес 14,2 кг, рост 96 см", "E.g. weight 14.2 kg, height 96 cm"),
      },
      { title: l("Harorat", "Температура", "Temperature"), placeholder: l("Masalan: 37,4 °C", "Например: 37,4 °C", "E.g. 37.4 °C") },
      { ...exam, placeholder: l("Tomoq, quloq, teri, nafas, qorin", "Зев, уши, кожа, дыхание, живот", "Throat, ears, skin, breathing, abdomen") },
      { title: l("Emlash", "Вакцинация", "Vaccination"), placeholder: l("Taqvim bo'yicha, keyingi emlash", "По календарю, следующая прививка", "On schedule, next vaccine due") },
      diagnosis,
      advice,
    ],
  },
  {
    id: "tpl-neuro-visit",
    specialty: "neurologist",
    name: l("Nevrolog ko'rigi", "Осмотр невролога", "Neurology visit"),
    sections: [
      complaints,
      anamnesis,
      {
        title: l("Nevrologik status", "Неврологический статус", "Neurological status"),
        placeholder: l("Ong, bosh miya nervlari, harakat, koordinatsiya", "Сознание, черепные нервы, движения, координация", "Consciousness, cranial nerves, movement, coordination"),
      },
      {
        title: l("Reflekslar va sezuvchanlik", "Рефлексы и чувствительность", "Reflexes and sensation"),
        placeholder: l("Pay reflekslari, patologik belgilar, sezuvchanlik", "Сухожильные рефлексы, патологические знаки, чувствительность", "Tendon reflexes, pathological signs, sensation"),
      },
      diagnosis,
      advice,
    ],
  },
  {
    id: "tpl-dentist-visit",
    specialty: "dentist",
    name: l("Stomatolog ko'rigi", "Осмотр стоматолога", "Dental visit"),
    sections: [
      complaints,
      {
        title: l("Tish sxemasi", "Зубная формула", "Dental chart"),
        placeholder: l("Tish raqami — holati. Masalan: 16 — karies, 26 — plomba, 36 — yo'q, 46 — pulpit", "Номер зуба — состояние. Например: 16 — кариес, 26 — пломба, 36 — отсутствует, 46 — пульпит", "Tooth number — state. E.g. 16 — caries, 26 — filling, 36 — missing, 46 — pulpitis"),
      },
      { ...exam, placeholder: l("Milk, shilliq qavat, tishlam", "Дёсны, слизистая, прикус", "Gums, mucosa, bite") },
      {
        title: l("Bajarilgan muolaja", "Проведённое лечение", "Treatment done"),
        placeholder: l("Qaysi tish, nima qilindi, anesteziya", "Какой зуб, что сделано, анестезия", "Which tooth, what was done, anaesthesia"),
      },
      diagnosis,
      advice,
    ],
  },
];

/** Ready-made summary layouts in the reader's language ("uz" when the locale is unknown). */
export function getSummaryTemplates(locale: string): SummaryTemplate[] {
  const k = (locale === "ru" || locale === "en" ? locale : "uz") as keyof L;
  return defs.map((d) => ({
    id: d.id,
    specialty: d.specialty,
    name: d.name[k],
    sections: d.sections.map((s) => ({ title: s.title[k], placeholder: s.placeholder[k], role: s.role })),
  }));
}
