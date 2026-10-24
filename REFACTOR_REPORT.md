# Memex Refactor Report

## File tree

The tree below describes the current source and standalone login page. The
existing project configuration, public assets, and root-level legacy pages are
listed at the end.

```text
memex_login.html                         Standalone login/signup page entry point.
login.css                                Standalone login page layout and page-specific styles.
login.js                                 Standalone login/signup form and Select2 behavior.
src/
  App.tsx                                Owns application state, effects, handlers, hash routing, and shared shell.
  main.tsx                               Loads shared stylesheets and mounts the React application.
  types.ts                               Shared application data and preference types.
  workspaceStorage.ts                    Existing IndexedDB/workspace file storage implementation; unchanged.
  assets/
    hero.png                             Existing image asset.
    logo-light.png                       Light-theme Memex logo.
    react.svg                            Existing Vite/React starter asset.
    vite.svg                             Existing Vite starter asset.
  components/
    AskSelect.tsx                        Ask AXI study-material dropdown.
    ChatSettingsModal.tsx                Chat settings dialog and its dropdown controls.
    ChatSidebarWithHistory.tsx           Chat history navigation, rename, and delete UI.
    SettingsSelect.tsx                   Settings dropdown with optional theme swatches.
  i18n/
    ar.ts                                Arabic interface translations.
    en.ts                                English interface translations.
    fr.ts                                French interface translations.
    index.ts                             Exports supported language type and translation dictionary.
  pages/
    AskAxi.tsx                           Ask AXI workspace and composer view.
    Courses.tsx                          Course list, selection, and course form view.
    Dashboard.tsx                        Dashboard overview and study shortcuts.
    ErrorRegisterView.tsx                Error-register/weakness view; currently unused.
    Files.tsx                             Study-file list and upload view.
    Profile.tsx                           Profile editor and photo view.
    Settings.tsx                          Preferences and settings view.
  storage/
    chatHistory.ts                        Reads saved chat history and provides fallback sessions.
    preferences.ts                        Reads saved preferences and defines preference defaults.
    profile.ts                            Reads saved profile and defines profile defaults.
  styles/
    base.css                              Global reset, typography, focus, and visually-hidden utility.
    components.css                        Shared controls and reusable component styles.
    layout.css                            Application shell, sidebar, topbar, navigation, and shell breakpoints.
    tokens.css                            Shared semantic theme and login-page CSS variables.
    pages/
      chat.css                            Ask AXI, chat history, and chat settings styles.
      courses.css                         Course page styles.
      dashboard.css                       Dashboard page styles.
      error-register.css                  Error-register/weakness styles; associated page is currently unused.
      files.css                           File list and storage-report styles.
      profile.css                         Profile page and profile-popover styles.
      settings.css                        Settings page styles.
  utils/
    format.ts                             Shared file-size formatting helper.
    greetings.ts                          Localized dashboard and Ask AXI greeting helpers.
```

Other existing root/project files:

- `index.html` — Vite React application entry document.
- `memex_profile.html` — Existing standalone profile page, outside this refactor.
- `REFACTOR_CHECKLIST.md` — Manual page, theme, language, responsive, and workflow checks.
- `package.json` / `package-lock.json` — Project scripts and dependency manifests.
- `README.md` — Existing project overview and usage information.
- `vite.config.ts` — Vite configuration.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript project configurations.
- `.gitignore` — Git ignore rules.
- `.oxlintrc.json` — Oxlint configuration.
- `logo.png`, `Memex.png` — Existing root-level image assets.
- `public/favicon.svg`, `public/icons.svg` — Public favicon and icon asset.

## CSS rules/classes that appear unused

This is based on a literal search of current source markup and selectors, not a
recommendation to delete code. Dynamically generated classes can evade literal
searches, so verify a rule’s runtime use before removing it.

- `.ask-page` in `src/styles/pages/chat.css` — no matching class in current JSX.
- `.settings-privacy-note` in `src/styles/pages/settings.css` — no matching class in current JSX.
- `.calculation` in `src/styles/pages/error-register.css` — generated at runtime from `entry.category.toLowerCase()` for the `Calculation` category in the unused `ErrorRegisterView`.
- `src/styles/pages/error-register.css` as a whole — styles the unused `ErrorRegisterView`. Keep it with the page unless the owner decides to remove or activate that page.
- In that unused page, `.weakness-category-icon` category suffixes and `.weakness-status` status suffixes are generated dynamically: categories include `conceptual`, `calculation`, and `code`; statuses include `to-review`, `practicing`, and `mastered`. A plain text class search is not proof that these generated selectors are unused.

## Bugs and inconsistencies noticed but not fixed

- `defaultPreferences.theme` is `'light'`, while the missing/invalid saved-theme fallback in `readSavedPreferences()` is `'ember'`.
- `readSavedChatSessions()` is invoked twice during initial state setup: once for `chatSessions` and again to choose `activeChatId`.
- The application username is hardcoded as `'Younes'` in `App.tsx`.
- `AskSelect`, `SettingsSelect`, and the dropdown controls inside `ChatSettingsModal` have overlapping implementations and remain separate.
- Several user-facing strings are hardcoded in English instead of using the translation dictionaries, including strings in chat history, chat settings, status messages, and fallback labels.
- The disabled `Feed` and `Review weaknesses` navigation items and their hardcoded English labels are intentionally left for the owner to translate and develop when those features are ready. They remain disabled and were not connected to pages.
- `ErrorRegisterView.tsx` and its stylesheet are present but not connected to a route; they remain intentionally unused.
- The manual coverage items in `REFACTOR_CHECKLIST.md` still require human verification across pages, themes, languages/RTL, responsive widths, and listed workflows.

## Suggested next steps (priority order)

1. Complete the manual checks in `REFACTOR_CHECKLIST.md`, including all four themes, Arabic RTL, responsive widths, and upload/course/chat/modal workflows.
2. Decide the intended initial theme, then align `defaultPreferences.theme` and the saved-preference fallback without changing behavior until that product decision is made.
3. Define the owner-approved behavior and translations for `Feed` and `Review weaknesses`; then implement or remove those disabled navigation entries as appropriate.
4. Localize the remaining hardcoded user-facing English strings through the existing translation dictionaries.
5. Replace the hardcoded username with an agreed profile or authentication data source.
6. Consider sharing the initial result of `readSavedChatSessions()` rather than reading it twice, while preserving the current fallback-session behavior.
7. Evaluate consolidating the three dropdown implementations after defining their distinct interaction and accessibility requirements.
8. Decide whether the error-register page should remain dormant or be activated; retain its dynamically generated category/status styles if it stays.
