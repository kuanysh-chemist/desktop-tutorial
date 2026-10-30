# Установленные сторонние скиллы

Скиллы скачаны с GitHub 30.10.2026 и проверены перед установкой: в коде нет скрытых сетевых вызовов. Обращения к внешним API (ElevenLabs, 21st.dev, Unsplash) делаются только по ключу пользователя. Удаление файлов затрагивает только временные папки самих скиллов. Лицензия источника лежит в каждой папке в файле `LICENSE.upstream`.

| Скиллы | Источник | Лицензия |
|---|---|---|
| claude-animation-base (обёртка, набор в `kit/`) | [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | MIT |
| painted-animation, kinetic-reel | [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) | MIT |
| claude-animation | [buildwithhanif/claude-animation-skill](https://github.com/buildwithhanif/claude-animation-skill) | MIT |
| motion-design | [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) | MIT |
| animated-chart, apple-launch-film, brand-intake, launch-video, loop-cover, milestone-reveal, model-showdown, motion-brief-writer, motion-effects, motion-prompt-writer, newsletter-promo, reel-export, reference-to-motion, title-sequence-3d, vox-explainer | [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | MIT |
| animate, animate-expo, improve-animations, review-animations, animation-vocabulary, animation-performance, find-animation-opportunities, remove-animations | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT |
| threejs-* (10), lottie-bodymovin, manim-composer, manimce-best-practices, visual-style, ffmpeg, video-edit | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AGPL-3.0 |

Что не попало в репозиторий:
- `motion-designer` из [gabrielgreco1/skills](https://github.com/gabrielgreco1/skills) установлен только локально: у репозитория нет лицензии, поэтому копировать его сюда нельзя.
- `Miftahul-Islam-Efaz/Motion-graphics-skill` на GitHub недоступен.
- Остальные скиллы OpenMontage (около 120) не установлены. Это либо платные API (HeyGen, ElevenLabs, faceswap, генерация видео), либо части пайплайна, которые работают только внутри самого OpenMontage.
- Скиллы, не связанные с анимацией (веб-скрейпинг, Swift и т.п.), тоже не установлены.
