# ODS → XLSX Converter
Сайт доступен по адресу: https://kestgalax.github.io/ods-xlsx/

Конвертер ODS-файлов в XLSX прямо в браузере. Файл не покидает устройство — вся обработка на клиенте через SheetJS.

## Стек

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Card, Button, Badge, Table, Tabs, Progress, Alert, ScrollArea, Separator)
- [SheetJS (xlsx)](https://sheetjs.com/) — чтение ODS, запись XLSX

## Быстрый старт

```bash
npm install
npm run dev
```

Откроется http://localhost:5173

## Сборка для продакшена

```bash
npm run build
npm run preview
```

## Деплой

### GitHub Pages

```bash
git push
```

Деплой запускается автоматически через GitHub Actions. Сайт доступен по адресу: https://kestgalax.github.io/ods-xlsx/

## Структура

```
src/
├── App.tsx              # корень, подключает ThemeProvider
├── OdsConverter.tsx     # основной компонент
├── theme.tsx            # провайдер светлой/тёмной темы
├── index.css            # Tailwind + shadcn CSS-переменные
└── components/ui/       # shadcn-компоненты
```

## Возможности

- Drag & drop или выбор через диалог
- Поддержка `.ods` и `.xlsx`
- Предпросмотр всех листов с переключением вкладок
- Мета-информация: размер файлов, количество листов и строк
- Скачивание готового `.xlsx`
- Светлая / тёмная тема (автоопределение из системы, сохраняется в localStorage)

## Как встроить в своё приложение

Компонент `OdsConverter.tsx` самодостаточен. Для встраивания в существующий проект:

```bash
npm install xlsx
npx shadcn@latest add card button badge table tabs progress alert scroll-area separator
```

Скопируйте `OdsConverter.tsx` и `theme.tsx`, оберните в `<ThemeProvider>`.
