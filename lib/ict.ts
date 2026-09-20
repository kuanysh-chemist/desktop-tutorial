/**
 * Каталог цифровых (ИКТ) ресурсов кабинета химии.
 *
 * Графа «Ресурсы» в КСП раньше заполнялась одной и той же строкой
 * «презентация, учебник, доска». Здесь собраны сервисы и оборудование,
 * которые реально доступны школе Казахстана, с указанием, на каком этапе
 * и для какой задачи они нужны.
 *
 * Ссылки не проверялись из этой среды: сетевой доступ ограничен реестром
 * npm и GitHub. Адреса приведены по общеизвестным названиям сервисов —
 * перед печатью документа стоит убедиться, что ресурс открывается в школе.
 */
import type { Bilingual } from "./types";
import type { TopicKind } from "./kb/topic";
import type { StageId } from "./types";

/** Что ресурс делает на уроке. */
export type IctPurpose =
  | "simulation"
  | "visual"
  | "quiz"
  | "collaboration"
  | "content"
  | "equipment";

export interface IctResource {
  id: string;
  name: Bilingual;
  purpose: IctPurpose;
  stages: StageId[];
  /** Типы тем, где ресурс особенно уместен. Пустой список — универсален. */
  kinds: TopicKind[];
  /** Нужны ли устройства у обучающихся (телефон, планшет, ноутбук). */
  needsStudentDevice: boolean;
  /** Как ресурс записывается в графе «Ресурсы». */
  inPlan: Bilingual;
}

export const ICT: IctResource[] = [
  {
    id: "phet",
    name: { ru: "Интерактивные симуляции PhET", kk: "PhET интерактивті симуляциялары" },
    purpose: "simulation",
    stages: ["middle"],
    kinds: ["concept", "experiment"],
    needsStudentDevice: true,
    inPlan: {
      ru: "Интерактивная симуляция PhET (phet.colorado.edu, есть казахская локализация): обучающиеся меняют параметры и наблюдают результат до реального опыта.",
      kk: "PhET интерактивті симуляциясы (phet.colorado.edu, қазақша нұсқасы бар): оқушылар нақты тәжірибеге дейін параметрлерді өзгертіп, нәтижені бақылайды.",
    },
  },
  {
    id: "molview",
    name: { ru: "3D-модели молекул MolView", kk: "MolView 3D молекула үлгілері" },
    purpose: "visual",
    stages: ["middle"],
    kinds: ["concept", "equation"],
    needsStudentDevice: true,
    inPlan: {
      ru: "MolView (molview.org) для вращения объёмной модели молекулы: видна пространственная форма, углы связей и различие изомеров.",
      kk: "Молекуланың көлемді үлгісін айналдыру үшін MolView (molview.org): кеңістіктік пішіні, байланыс бұрыштары және изомерлер айырмашылығы көрінеді.",
    },
  },
  {
    id: "ptable",
    name: { ru: "Интерактивная таблица Ptable", kk: "Ptable интерактивті кестесі" },
    purpose: "visual",
    stages: ["start", "middle"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Интерактивная периодическая таблица ptable.com: включение режимов «радиус атома», «электроотрицательность», «степени окисления» показывает закономерность сразу по всему периоду.",
      kk: "ptable.com интерактивті периодтық кестесі: «атом радиусы», «электртерістілік», «тотығу дәрежесі» режимдерін қосу заңдылықты бүкіл период бойынша бірден көрсетеді.",
    },
  },
  {
    id: "virtual-lab",
    name: { ru: "Виртуальная лаборатория", kk: "Виртуалды зертхана" },
    purpose: "simulation",
    stages: ["middle"],
    kinds: ["experiment", "equation"],
    needsStudentDevice: true,
    inPlan: {
      ru: "Виртуальная лаборатория (ChemCollective, Labster либо раздел «Виртуальная лаборатория» на BilimLand): опыт проводится на экране, если реактивы отсутствуют или реакция опасна для класса.",
      kk: "Виртуалды зертхана (ChemCollective, Labster немесе BilimLand-тағы «Виртуалды зертхана» бөлімі): реактивтер болмаса не реакция сынып үшін қауіпті болса, тәжірибе экранда жүргізіледі.",
    },
  },
  {
    id: "video-experiment",
    name: { ru: "Видеофрагмент опыта", kk: "Тәжірибенің бейнеүзіндісі" },
    purpose: "content",
    stages: ["middle"],
    kinds: ["experiment"],
    needsStudentDevice: false,
    inPlan: {
      ru: "Видеофрагмент опыта (1–2 мин) с остановкой перед результатом: класс предсказывает, что произойдёт, затем сверяет с записью.",
      kk: "Нәтиже алдында тоқтатылатын тәжірибе бейнеүзіндісі (1–2 мин): сынып не болатынын болжап, содан соң жазбамен салыстырады.",
    },
  },
  {
    id: "bilimland",
    name: { ru: "BilimLand / iTest", kk: "BilimLand / iTest" },
    purpose: "content",
    stages: ["start", "middle", "end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Цифровые уроки и тесты BilimLand (bilimland.kz) и iTest: анимация процесса на двух языках и банк заданий по цели обучения.",
      kk: "BilimLand (bilimland.kz) және iTest цифрлық сабақтары мен тесттері: үдеріс анимациясы екі тілде және оқу мақсаты бойынша тапсырмалар банкі.",
    },
  },
  {
    id: "daryn-online",
    name: { ru: "Daryn Online", kk: "Daryn Online" },
    purpose: "content",
    stages: ["middle", "end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Daryn Online (daryn.online): видеоразбор темы и задания повышенного уровня для тех, кто заканчивает раньше.",
      kk: "Daryn Online (daryn.online): тақырыптың бейнеталдауы және ерте бітіргендерге арналған жоғары деңгейдегі тапсырмалар.",
    },
  },
  {
    id: "okulyk",
    name: { ru: "Электронный учебник okulyk.kz", kk: "okulyk.kz электрондық оқулығы" },
    purpose: "content",
    stages: ["start", "middle", "end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Электронный учебник okulyk.kz: параграф выводится на экран, класс работает с одним и тем же текстом при чтении с пометками.",
      kk: "okulyk.kz электрондық оқулығы: параграф экранға шығарылады, белгілеп оқу кезінде сынып бір мәтінмен жұмыс істейді.",
    },
  },
  {
    id: "kahoot",
    name: { ru: "Викторина Kahoot!", kk: "Kahoot! викторинасы" },
    purpose: "quiz",
    stages: ["start", "end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Kahoot! (kahoot.com): экспресс-викторина на 5–7 вопросов; диаграмма ответов сразу показывает, какое понятие усвоено хуже остальных.",
      kk: "Kahoot! (kahoot.com): 5–7 сұрақтан тұратын жедел викторина; жауаптар диаграммасы қай ұғымның нашар меңгерілгенін бірден көрсетеді.",
    },
  },
  {
    id: "quizizz",
    name: { ru: "Quizizz", kk: "Quizizz" },
    purpose: "quiz",
    stages: ["middle", "end"],
    kinds: ["calculation", "equation"],
    needsStudentDevice: true,
    inPlan: {
      ru: "Quizizz (quizizz.com) в режиме своего темпа: каждый решает задания по цели обучения, педагог видит таблицу правильных ответов по каждому.",
      kk: "Quizizz (quizizz.com) өз қарқынымен режимінде: әркім оқу мақсаты бойынша тапсырма орындайды, педагог әрқайсысы бойынша дұрыс жауаптар кестесін көреді.",
    },
  },
  {
    id: "wordwall",
    name: { ru: "Интерактивные игры Wordwall", kk: "Wordwall интерактивті ойындары" },
    purpose: "quiz",
    stages: ["start", "middle", "end"],
    kinds: ["concept"],
    needsStudentDevice: true,
    inPlan: {
      ru: "Wordwall (wordwall.net): шаблон «Найди пару» или «Групповая сортировка» для терминов и формул темы — задание собирается за несколько минут.",
      kk: "Wordwall (wordwall.net): тақырып терминдері мен формулалары үшін «Жұбын тап» немесе «Топтық сұрыптау» үлгісі — тапсырма бірнеше минутта жиналады.",
    },
  },
  {
    id: "learningapps",
    name: { ru: "LearningApps", kk: "LearningApps" },
    purpose: "quiz",
    stages: ["middle", "end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "LearningApps (learningapps.org): интерактивное упражнение на классификацию веществ или восстановление последовательности этапов процесса.",
      kk: "LearningApps (learningapps.org): заттарды жіктеуге немесе үдеріс кезеңдерінің ретін қалпына келтіруге арналған интерактивті жаттығу.",
    },
  },
  {
    id: "plickers",
    name: { ru: "Plickers", kk: "Plickers" },
    purpose: "quiz",
    stages: ["start", "end"],
    kinds: [],
    needsStudentDevice: false,
    inPlan: {
      ru: "Plickers (plickers.com): опрос по карточкам, устройство нужно только педагогу — подходит классу без телефонов, срез занимает две минуты.",
      kk: "Plickers (plickers.com): карточкалар арқылы сауалнама, құрылғы тек педагогқа қажет — телефонсыз сыныпқа қолайлы, көрініс екі минут алады.",
    },
  },
  {
    id: "mentimeter",
    name: { ru: "Mentimeter", kk: "Mentimeter" },
    purpose: "collaboration",
    stages: ["start", "end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Mentimeter (mentimeter.com): облако слов из ассоциаций класса к теме в начале урока и повторный опрос в конце — разница видна на одном экране.",
      kk: "Mentimeter (mentimeter.com): сабақ басында тақырыпқа сынып ассоциацияларынан сөз бұлты және соңында қайталама сауалнама — айырмашылық бір экранда көрінеді.",
    },
  },
  {
    id: "padlet",
    name: { ru: "Padlet", kk: "Padlet" },
    purpose: "collaboration",
    stages: ["middle", "end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Padlet (padlet.com): общая доска, куда группы выкладывают фотографии наблюдений и выводы — получается цифровая «галерея работ».",
      kk: "Padlet (padlet.com): топтар бақылау фотосуреттері мен қорытындыларын жүктейтін ортақ тақта — цифрлық «жұмыстар галереясы» шығады.",
    },
  },
  {
    id: "google-forms",
    name: { ru: "Google Формы", kk: "Google Формалар" },
    purpose: "quiz",
    stages: ["end"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "Google Форма как цифровой выходной билет: два вопроса по цели урока, ответы автоматически сводятся в таблицу для планирования следующего урока.",
      kk: "Google Форма цифрлық шығу билеті ретінде: сабақ мақсаты бойынша екі сұрақ, жауаптар келесі сабақты жоспарлау үшін кестеге автоматты түрде жиналады.",
    },
  },
  {
    id: "shared-sheet",
    name: { ru: "Совместная таблица данных", kk: "Ортақ деректер кестесі" },
    purpose: "collaboration",
    stages: ["middle"],
    kinds: ["experiment", "calculation"],
    needsStudentDevice: true,
    inPlan: {
      ru: "Общая таблица (Google Таблицы или Excel на одном компьютере): группы вносят свои измерения, класс сразу строит общий график по данным всех групп.",
      kk: "Ортақ кесте (Google Кестелер немесе бір компьютердегі Excel): топтар өз өлшемдерін енгізеді, сынып барлық топтың дерегі бойынша бірден ортақ график салады.",
    },
  },
  {
    id: "online-board",
    name: { ru: "Онлайн-доска Jamboard / Miro", kk: "Jamboard / Miro онлайн тақтасы" },
    purpose: "collaboration",
    stages: ["start", "middle"],
    kinds: ["concept"],
    needsStudentDevice: true,
    inPlan: {
      ru: "Онлайн-доска (Miro, Jamboard или аналог): кластер и диаграмма Венна собираются группами одновременно и остаются доступными для домашней работы.",
      kk: "Онлайн тақта (Miro, Jamboard немесе ұқсас): кластер мен Венн диаграммасын топтар бір мезгілде құрады және үй жұмысына қолжетімді күйде қалады.",
    },
  },
  {
    id: "qr-cards",
    name: { ru: "QR-коды на карточках заданий", kk: "Тапсырма карточкаларындағы QR-кодтар" },
    purpose: "content",
    stages: ["middle"],
    kinds: [],
    needsStudentDevice: true,
    inPlan: {
      ru: "QR-коды на карточках станций: ведут к подсказке, видеофрагменту опыта или ответу для самопроверки — поддержка выдаётся без обращения к педагогу.",
      kk: "Станция карточкаларындағы QR-кодтар: нұсқауға, тәжірибе бейнеүзіндісіне немесе өзін-өзі тексеру жауабына апарады — қолдау педагогқа жүгінбей беріледі.",
    },
  },
  {
    id: "doc-camera",
    name: { ru: "Документ-камера", kk: "Құжат камерасы" },
    purpose: "equipment",
    stages: ["middle", "end"],
    kinds: ["experiment", "equation"],
    needsStudentDevice: false,
    inPlan: {
      ru: "Документ-камера: демонстрация опыта и записей в тетради на большом экране — видно всему классу, включая задние парты.",
      kk: "Құжат камерасы: тәжірибені және дәптердегі жазбаны үлкен экранда көрсету — артқы парталарды қоса, бүкіл сыныпқа көрінеді.",
    },
  },
  {
    id: "interactive-board",
    name: { ru: "Интерактивная доска", kk: "Интерактивті тақта" },
    purpose: "equipment",
    stages: ["start", "middle", "end"],
    kinds: [],
    needsStudentDevice: false,
    inPlan: {
      ru: "Интерактивная доска: перетаскивание карточек при классификации веществ и расстановка коэффициентов прямо на экране.",
      kk: "Интерактивті тақта: заттарды жіктеу кезінде карточкаларды жылжыту және коэффициенттерді тікелей экранда қою.",
    },
  },
  {
    id: "phone-timer",
    name: { ru: "Секундомер и камера смартфона", kk: "Смартфон секундөлшегіші мен камерасы" },
    purpose: "equipment",
    stages: ["middle"],
    kinds: ["experiment", "calculation"],
    needsStudentDevice: true,
    inPlan: {
      ru: "Секундомер и камера смартфона: время реакции фиксируется точно, а замедленная съёмка позволяет пересмотреть момент изменения окраски.",
      kk: "Смартфон секундөлшегіші мен камерасы: реакция уақыты дәл тіркеледі, ал баяу түсірілім түс өзгеру сәтін қайта қарауға мүмкіндік береді.",
    },
  },
  {
    id: "kundelik",
    name: { ru: "Kundelik.kz", kk: "Kundelik.kz" },
    purpose: "content",
    stages: ["end"],
    kinds: [],
    needsStudentDevice: false,
    inPlan: {
      ru: "Kundelik.kz: домашнее задание с прикреплённой ссылкой на симуляцию или разбор, обратная связь по формативному оцениванию для родителей.",
      kk: "Kundelik.kz: симуляцияға немесе талдауға сілтеме тіркелген үй тапсырмасы, ата-аналарға формативті бағалау бойынша кері байланыс.",
    },
  },
];

/** Пул ресурсов для этапа с учётом характера темы (см. activePool). */
export function ictPool(stage: StageId, kind: TopicKind): IctResource[] {
  const byStage = ICT.filter((r) => r.stages.includes(stage));
  const specific = byStage.filter((r) => r.kinds.includes(kind));
  const universal = byStage.filter((r) => r.kinds.length === 0);
  return specific.length >= 3 ? specific : [...specific, ...universal];
}
