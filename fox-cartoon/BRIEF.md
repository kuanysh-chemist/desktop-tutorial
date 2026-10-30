# «Фонарик» — перекладной мультфильм по рисункам из Gemini/GPT

Длительность — около 25 секунд, 1920×1080, 60 кадров/с, с голосом и музыкой.

Как это работает: рисунки делаете вы в Gemini или ChatGPT по запросам ниже. Я вырезаю из них фазы, выравниваю, анимирую с принципами Диснея (предвкушение, дуги, захлёст, сжатие и растяжение), добавляю камеру, свет фонаря, снег, звук и монтаж.

## Раскадровка

| # | Время | Что происходит | Какие рисунки нужны |
|---|---|---|---|
| 1 | 0–5 с | Ночной зимний лес, луна. Лиса бежит по тропинке. Камера ведёт её сбоку, деревья проплывают в несколько слоёв. «В самую длинную ночь зимы лиса бежала через лес» | бег (03), фон леса (10) |
| 2 | 5–8 с | Лиса резко тормозит со скольжением и снежной пылью. Уши встают, она удивлённо смотрит вниз: под снегом что-то светится. «Вдруг в снегу что-то засветилось» | торможение и обнюхивание (04), эмоции (02), поляна (11) |
| 3 | 8–12 с | Крупный план: лиса раскапывает снег лапами, под ним фонарик. Она осторожно берёт его в зубы, свет падает ей на морду. «Кто-то потерял фонарик…» | раскопка и подъём (05), фонарь (09), эмоции (02) |
| 4 | 12–17 с | Общий план: маленький огонёк качается в огромном синем лесу — лиса трусит домой. «Лиса бережно понесла его домой» | рысь с фонарём (06), фон леса (10) |
| 5 | 17–21 с | Нора под корнями. Темно, светятся только три пары глаз. Входит лиса, свет растекается, видны зайчата. «Туда, где в темноте ждали зайчата» | вход и опускание фонаря (07), зайчата (08), нора тёмная и светлая (12) |
| 6 | 21–25 с | Зайчата прыгают к фонарю и обнимают лису. Лиса поворачивается к нам и улыбается, нора наполняется светом. «И в норе стало светло» | зайчата (08), разворот лисы (01), эмоции (02) |

## Стиль — вставляйте этот абзац в КАЖДЫЙ запрос

> STYLE: classic Disney 2D hand-drawn animation style (1990s feature film look), clean cel shading with soft painted shadows, expressive appealing design, warm rich colors, consistent proportions. Character art on a pure white background (#FFFFFF), flat even lighting, no ground shadow, no text, no watermark, high resolution.

## Порядок генерации

1. Сначала сделайте **01 — разворот лисы** и перегенерируйте его, пока лиса вам не понравится. Это эталон.
2. **Прикладывайте этот эталон к каждому следующему запросу** (зайчатам — их собственный эталон 08). Не прикладывайте последнюю удачную картинку вместо эталона: ошибки накапливаются.
3. Фазы движения — одной картинкой-сеткой: в одном изображении модель держит персонажа стабильнее.
4. Сохраняйте в PNG максимального размера, называйте как в списке (`01_fox_turnaround.png` …) и присылайте в чат.

## Запросы

**01 — разворот лисы (эталон)** · `01_fox_turnaround.png`
> Character turnaround model sheet of a young red fox, female, slim and graceful, big expressive amber eyes, white chest, white tail tip, black "socks" on paws, fluffy oversized tail. 8 views in one row, rotating in equal steps from front view to back view: front, front 3/4 left, side left, back 3/4 left, back, back 3/4 right, side right, front 3/4 right. Same neutral standing pose in every view, all feet on the same baseline, equal spacing, no overlaps. + STYLE

**02 — эмоции** · `02_fox_expressions.png`
> Expression sheet of the SAME fox from the attached reference: head and shoulders, 3/4 view facing right, 8 expressions in a 4×2 grid: neutral, curious (head tilt, ears forward), surprised (ears up, eyes wide), worried, focused sniffing (eyes half closed), happy, tender warm smile with closed eyes, determined. Same proportions, colors and markings as the reference. + STYLE

**03 — бег** · `03_fox_run.png`
> Sprite sheet: the SAME fox from the reference running, side view facing right, full body. 8 frames in one row, a complete loopable run cycle: contact, down, passing, up, contact (other leg), down, passing, up. Tail flowing behind with follow-through, ears back. All frames the same size and scale, feet on one baseline, equal spacing, no overlaps. + STYLE

**04 — торможение и обнюхивание** · `04_fox_stop_sniff.png`
> Sprite sheet, 8 frames in one row, side view facing right, the SAME fox: 1 running, 2 braking with front legs stiff and body leaning back, 3 skidding with snow spray, 4 stopped with an overshoot (head and tail swinging forward), 5 standing, 6 ears perk up, 7 head lowered sniffing the ground, 8 surprised look down with ears up. Same scale, one baseline, equal spacing. + STYLE

**05 — раскопка и подъём фонаря** · `05_fox_dig_lift.png`
> Sprite sheet, 8 frames in one row, 3/4 side view facing right, the SAME fox: 1–3 digging snow with front paws (alternating paws, snow flying), 4 nose into the snow, 5 gently biting the handle of a small old brass lantern, 6 lifting the head with the lantern, 7 standing proudly holding the lantern in her mouth, 8 looking at the lantern tenderly. The lantern is small (about head size), brass with glass panes, a candle inside. Same scale, one baseline. + STYLE

**06 — рысь с фонарём** · `06_fox_trot_lantern.png`
> Sprite sheet: the SAME fox trotting with the small brass lantern held by its handle in her mouth, side view facing right. 8 frames in one row, a loopable trot cycle, the lantern swinging slightly on its handle, tail with follow-through. Same scale, one baseline, equal spacing. + STYLE

**07 — вход в нору и опускание фонаря** · `07_fox_enter_set_down.png`
> Sprite sheet, 6 frames in one row, side view facing left, the SAME fox with the lantern in her mouth: 1–2 walking in carefully, 3 lowering the head, 4 setting the lantern down on the ground, 5 sitting down next to it, 6 sitting with a warm smile, tail wrapped around her paws. Same scale, one baseline. + STYLE

**08 — зайчата** · `08_bunnies.png`
> Character sheet of three baby hares (siblings), cute round bodies, long ears, big eyes, soft grey-brown fur with cream bellies; one tiny with a floppy ear, one middle-sized, one bigger and braver. Grid 4 columns × 3 rows (one row per bunny): huddled scared in a ball, ears up surprised, mid-hop, hugging pose with arms open. Same scale for each bunny across its row. + STYLE

**09 — фонарь** · `09_lantern.png`
> Prop sheet: small old brass lantern with glass panes and a candle, top ring handle. 4 views in one row: front unlit, side unlit, front lit (warm candle glow inside), side lit. Plus a separate candle flame on its own. + STYLE

**10 — фон: ночной зимний лес (панорама)** · `10_bg_forest.png` — формат 21:9 или 3:1
> Wide panoramic background painting, no characters: snowy pine forest at night under a big full moon, deep blue and violet palette, soft moonlight on the snow, a winding path in the foreground, layered depth (far misty trees, middle trees, close dark trunks). Classic Disney 2D background painting style (like Bambi / The Lion King backgrounds), painterly, rich atmosphere. No text.

Если получится, сделайте этот фон ещё **тремя отдельными слоями**: небо с луной; дальние и средние деревья на чисто белом фоне; передние стволы и сугробы на чисто белом фоне. Тогда параллакс будет настоящим.

**11 — фон: поляна с фонарём** · `11_bg_clearing.png` — 16:9
> Background painting, no characters: a small snowy clearing at night between pine trunks, closer framing, a soft round snow mound in the center glowing warm orange from beneath (something buried glows), blue moonlight. Classic Disney 2D background painting style. No text.

**12 — фон: нора, тёмная и освещённая** · `12a_bg_burrow_dark.png` и `12b_bg_burrow_lit.png` — 16:9
> Background painting, no characters: a cozy burrow under the roots of a big old tree, earthen walls, hanging roots, a bed of dry leaves and moss on the right, the entrance on the left with blue night snow outside. Version A: almost completely dark, only faint blue light from the entrance. Version B: EXACTLY the same composition, warmly lit by a lantern placed in the center (golden light, soft shadows). Classic Disney 2D background painting style. No text.

## Что я проверю у присланных картинок

- Совпадают ли с эталоном пропорции, цвета и отметины (белая грудка, кончик хвоста, «носочки»).
- Стоят ли фазы на одной линии и в одном масштабе, нет ли перекрытий.
- Ровный ли фон, чтобы его можно было чисто вырезать.

Если отдельные фазы уплывут, я пришлю точный запрос на перегенерацию только этих фаз.
