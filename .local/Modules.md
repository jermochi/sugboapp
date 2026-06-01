# **SugboApp — Software Design Document (Module Breakdown)**

A modular decomposition of SugboApp for a **team of 5**, designed so everyone can build in parallel against frozen interfaces. Stack: **React Native \+ Expo (TypeScript), Expo Router, Zustand, Gemini 2.5 Flash, AsyncStorage, react-native-gifted-charts, react-native-maps, expo-linking, @react-native-community/netinfo.**

The single most important idea in this document: **freeze the shared contracts in the first hour** (data schemas, routes, AI function signatures, core interfaces). Once those are committed, each module can be built independently with mock data and stubs, and integration becomes wiring rather than negotiation.

---

## **1\. Architectural Approach**

* **Feature-first, layered.** A shared `core` foundation that everyone depends on, and self-contained `feature` modules that depend only on `core` — never on each other.  
* **Contract-first.** Data types, navigation routes, and the AI function signatures are agreed and stubbed before feature work begins. Devs build against TypeScript interfaces, not implementations.  
* **Dependency inversion for the AI.** The AI module never imports a feature module. Instead, each feature *registers a handler* with a registry defined in `core`. The AI dispatches by function name. This is what decouples the hardest module (AI) from the features — the AI dev and feature devs only need to agree on a function name \+ signature, then work apart.  
* **Offline-first data.** All content is static JSON bundled with the app, loaded into an AsyncStorage cache on first run, read from cache thereafter. No live backend, no PII, no payments.

### **Module dependency graph**

graph TD  
    Core\[core: theme, components, data, routing, AI registry\]  
    AI\[ai\_assistant\]  
    Dash\[dashboard \+ onboarding\]  
    Trans\[transparency\]  
    Permit\[permit\]  
    Emer\[emergency\]

    AI \--\> Core  
    Dash \--\> Core  
    Dash \--\> AI  
    Trans \--\> Core  
    Permit \--\> Core  
    Emer \--\> Core  
    Trans \-. registers handler .-\> Core  
    Permit \-. registers handler .-\> Core  
![][image1]

In words: everything depends on `core`. `dashboard` also depends on `ai_assistant` (the AI bar opens the sheet). Feature modules (`transparency`, `permit`, `emergency`) depend only on `core` and *register* their AI handlers into the registry — so the AI module calls them without importing them. No feature depends on another feature.

---

## **2\. Repository / Folder Structure**

Expo Router uses file-based routing, so screens live under `app/`. Everything else lives under `src/`.

app/                          \# Expo Router — thin route files only  
  \_layout.tsx                 \# root stack \+ ProviderScope equivalent  
  index.tsx                   \# Dashboard (re-exports features/dashboard)  
  onboarding.tsx  
  transparency.tsx  
  permit.tsx  
  emergency.tsx  
src/  
  core/  
    theme/            \# colors, typography, spacing, trilingual hero strings  
    components/       \# ServiceTile, ServiceCard, AppButton, SectionHeader, AIHelperButton (shell)  
    data/             \# assetDataSource, cacheStore (AsyncStorage), baseRepository  
    services/         \# connectivityService  
    ai-contract/      \# AIFunctionHandler type, AIFunctionRegistry  (the decoupling layer)  
    routing/          \# route names \+ typed nav helpers (wrap expo-router)  
    models/           \# shared types (Coordinates, ServiceTileData)  
  features/  
    onboarding/  
    dashboard/        \# home grid \+ AI bar  
    ai-assistant/     \# Gemini client, conversational sheet, helper sheet, dispatcher  
    transparency/  
      data/  domain/  components/  
    permit/  
      data/  domain/  components/  
    emergency/  
  l10n/               \# light hardcoded trilingual strings (no full i18n system)  
assets/  
  data/               \# budget.json, permit\_steps.json, hotlines.json

Each feature follows a light `data / domain / components` split so it's self-contained and one dev can own it end to end. The files in `app/` stay thin — they import and render the real screen from `src/features/...` so routing and screen logic don't tangle.

---

## **3\. Shared Contracts — FREEZE THESE FIRST (Phase 0\)**

These are committed as type files \+ mock JSON before parallel work starts. Treat them as frozen; changes require a quick team sync because they ripple across modules.

### **3.1 Data schemas (in `assets/data/`)**

The JSON is **identical** to before — data is stack-agnostic and carries over untouched.

**budget.json** (Transparency)

{  
  "year": 2025,  
  "total": 25000000000,  
  "currency": "PHP",  
  "sectors": \[{ "id": "infra", "name": "Infrastructure", "amount": 8000000000 }\],  
  "projects": \[{  
    "id": "p1", "name": "N. Bacalso Ave Rehab", "sectorId": "infra",  
    "allocated": 120000000, "spent": 72000000, "status": "ongoing",  
    "progress": 0.6, "barangay": "Guadalupe", "lat": 10.30, "lng": 123.89,  
    "timeline": "Q1–Q4 2025"  
  }\]  
}

**permit\_steps.json** (Permit) — base path \+ conditional steps

{  
  "steps": \[{  
    "order": 1, "id": "dti", "title": "DTI Registration",  
    "office": "DTI Cebu", "address": "...", "lat": 10.3, "lng": 123.9,  
    "requirements": \["Valid ID", "Proposed business names"\],  
    "fee": "₱200–₱2,000", "processingTime": "Same day",  
    "notes": "...", "condition": { "legalStructure": "sole" }  
  }\]  
}

`condition: null` \= always shown. Otherwise a matcher like `{ "businessType": "food" }`. **Profile** (built from intake chips): `{ application, businessType, legalStructure, size }`

**hotlines.json** (Emergency)

{  
  "categories": \[{  
    "id": "medical", "name": "Medical / Hospital",  
    "contacts": \[{ "name": "Cebu City Medical Center", "number": "032..." }\]  
  }\]  
}

### **3.2 Navigation routes (in `src/core/routing/`)**

Route paths map to files in `app/`. Use the typed constants — never hardcode a path string.

| Route | Screen | Optional params |
| ----- | ----- | ----- |
| `/onboarding` | First-launch flow | — |
| `/` | Dashboard | — |
| `/transparency` | Transparency Tracker | `sectorId`, `barangay` |
| `/permit` | Permit Walkthrough | `profile` (JSON-encoded) |
| `/emergency` | Emergency Services | — |

### **3.3 AI function-calling contract (the registry)**

The AI module exposes these to Gemini and dispatches them through `AIFunctionRegistry`. Feature modules implement the handlers.

| Function | Args | Returns | Handler owned by |
| ----- | ----- | ----- | ----- |
| `route_to_service` | `serviceId`, `params?` | navigation side-effect | core/routing |
| `query_budget` | `sector?`, `barangay?`, `year?` | filtered budget slice | transparency |
| `get_permit_path` | `profile` | ordered visible steps | permit |
| `explain` | `topic`, `context` | grounded plain-language string | the relevant feature |

### **3.4 Core interfaces (TypeScript, abbreviated)**

export interface DataSource {  
  loadJson\<T\>(assetKey: string): Promise\<T\>;  
}

export interface CacheStore {  
  put(key: string, value: unknown): Promise\<void\>;  
  get\<T\>(key: string): Promise\<T | null\>;  
  has(key: string): Promise\<boolean\>;  
}

export interface AIFunctionHandler {  
  readonly name: string;                                 // e.g. "query\_budget"  
  // GROUNDING RULE: return only data sourced from JSON. Never fabricate.  
  call(args: Record\<string, unknown\>): Promise\<Record\<string, unknown\>\>;  
}

export class AIFunctionRegistry {  
  register(handler: AIFunctionHandler): void;  
  dispatch(name: string, args: Record\<string, unknown\>): Promise\<Record\<string, unknown\>\>;  
}

export interface ConnectivityService {  
  readonly isOnline: boolean;  
  subscribe(listener: (online: boolean) \=\> void): () \=\> void;  
}

### **3.5 Design tokens (in `src/core/theme/`)**

Primary \+ accent colors, sector colors, status colors (planned/ongoing/completed), spacing scale, text styles, and the trilingual hero strings constant (`"Unsa imong kinahanglan? / Ano ang kailangan mo? / What do you need?"`). Everyone imports these; nobody hardcodes a color. Exported as plain TS objects (no Tailwind required; if the team prefers, NativeWind can layer on top).

---

## **4\. Module Specifications**

### **M0 — Core / Platform**

* **Responsibility.** The spine. Theme \+ design system, shared components, data layer (asset loader \+ AsyncStorage cache \+ base repository), connectivity service, the AI function registry, routing helpers, shared types.  
* **Exposes.** Everything in §3 — design tokens, shared components, `DataSource`/`CacheStore`, `AIFunctionRegistry`, route helpers, `ConnectivityService`.  
* **Depends on.** Nothing.  
* **Packages.** `zustand`, `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`, `expo-router`.  
* **Done when.** Skeleton \+ all interface stubs are committed, mock JSON loads through the cache, theme applies, navigation between empty placeholder screens works.

### **M1 — AI Assistant**

* **Responsibility.** Gemini integration (streaming on, thinking budget off, function calling); the conversational bottom sheet (front door); the reusable in-context `AIHelperButton` \+ helper sheet; the function dispatcher; the system prompt (language mirroring, grounding rules); the keyword→intent fallback map.  
* **Exposes.** `<AIConversationSheet />` (opened by the dashboard AI bar), `<AIHelperButton context={...} />` (dropped into any feature screen), and the wired dispatcher that calls registered handlers.  
* **Depends on.** `core` (registry, routing, types). Never imports a feature.  
* **Packages.** `@google/generative-ai` (Gemini JS SDK; calls are plain `fetch` under the hood), `@gorhom/bottom-sheet`, `zustand`.  
* **Done when.** Typing in the sheet streams a mirrored-language reply, function calls dispatch through the registry, and the helper button works on a placeholder screen.

### **M2 — Dashboard \+ Onboarding**

* **Responsibility.** First-launch onboarding (gated by an AsyncStorage flag); the home dashboard grid of service tiles; the pinned AI bar (rotating trilingual prompt, online/offline state from `ConnectivityService`); navigation into sub-apps.  
* **Exposes.** `/` and `/onboarding` screens.  
* **Depends on.** `core` (tiles, theme, routing, connectivity) \+ `ai-assistant` (AI bar opens the conversational sheet).  
* **Packages.** `@react-native-async-storage/async-storage`, `expo-router`.  
* **Done when.** Onboarding shows once, dashboard renders tiles, AI bar opens the sheet, tiles navigate, bar dims when offline.

### **M3 — Transparency Tracker**

* **Responsibility.** City budget overview (donut \+ year selector), sector drill-down, project detail, optional project map; budget repository; the `query_budget` handler (grounded, no invented numbers); in-chat answer \+ "view full breakdown" deep-link target.  
* **Exposes.** `/transparency` screen; registers `query_budget` handler.  
* **Depends on.** `core` only.  
* **Packages.** `react-native-gifted-charts` (donut/bar; or `victory-native`), `react-native-maps` (optional map).  
* **Done when.** Overview chart renders from `budget.json`, drill-down \+ detail work, `query_budget` returns a slice matching the on-screen numbers exactly.

Annual Budget

[https://www.cebucity.gov.ph/transparency/full-disclosure-data/city-annual-budget/](https://www.cebucity.gov.ph/transparency/full-disclosure-data/city-annual-budget/)

Financial Reports

[https://www.cebucity.gov.ph/category/full-disclosure-data/](https://www.cebucity.gov.ph/category/full-disclosure-data/)

Bids and Projects

[https://www.cebucity.gov.ph/category/procurements/](https://www.cebucity.gov.ph/category/procurements/)

https://www.cebucity.gov.ph/category/uncategorized/

### **M4 — Business Permit**

* **Responsibility.** Intake chips → profile; profile-based step filter (`backbone + conditional`); personalized roadmap reveal with tagged add-ons; stepper \+ step detail \+ requirements checklist; progress persistence (resumable offline); per-step map; the `get_permit_path` \+ `explain` handlers.  
* **Exposes.** `/permit` screen; registers `get_permit_path` and step-`explain` handlers.  
* **Depends on.** `core` only.  
* **Packages.** custom stepper (simple `View` map; no extra dep needed), `react-native-maps`, `expo-linking` (directions), `@react-native-async-storage/async-storage`.  
* **Done when.** Different chip selections produce different visible step lists from one JSON, progress persists across restarts, the helper answers "why do I have this step?" from the profile.

### **M5 — Emergency Servicesl\`**

* **Responsibility.** Categorized hotline directory; one-tap dialing; **must work fully offline** (bundled \+ cached) — this is the demo's airplane-mode closer.  
* **Exposes.** `/emergency` screen.  
* **Depends on.** `core` only.  
* **Packages.** `expo-linking` (`tel:`).  
* **Done when.** Hotlines render and dial from cache with the device in airplane mode.

---

## **5\. Team Assignment (5 Developers)**

| Dev | Owns | Notes |
| ----- | ----- | ----- |
| **A — Platform Lead** | M0 Core \+ M5 Emergency | Most pivotal; build the skeleton \+ stubs first to unblock everyone, then Emergency (small, mostly core-data \+ offline). Leads integration. Best generalist. |
| **B — AI** | M1 AI Assistant | Most specialized. Gemini, streaming, function calling, prompt, fallback. |
| **C — Front Door** | M2 Dashboard \+ Onboarding | Heavy UI integration with the AI module's sheet. |
| **D — Transparency** | M3 | Charts \+ map \+ budget data \+ `query_budget`. |
| **E — Permit** | M4 | Intake/profile/filter \+ stepper \+ handlers — the most logic-heavy feature. |

Emergency is small enough to shift to whoever finishes first if Dev A is buried in integration.

---

## **6\. Build Sequence (Phases)**

1. **Phase 0 — Contracts & Skeleton (whole team, \~first 2 hours).** Agree §3 together. Dev A scaffolds the Expo project with the type stubs \+ mock JSON and commits. Now every interface is stable.  
2. **Phase 1 — Parallel build (everyone).** Each dev builds their module against the stubs and mock data. Features expose handlers but don't need the live AI. Dashboard uses a stub sheet. Nothing blocks anything.  
3. **Phase 2 — Integration (A \+ B lead).** Register feature handlers into the dispatcher; wire the dashboard AI bar to the real sheet; connect real navigation; swap stubs for real screens.  
4. **Phase 3 — Polish & rehearse.** Offline pass, airplane-mode emergency, the demo run-through (Bisaya query → in-chat answer → deep-link → charts; permit branching reveal; airplane-mode closer).

---

## **7\. Collaboration Hygiene**

* **One feature branch per module**, short-lived, frequent merges to `main`.  
* **The contract files (§3) merge first and are treated as frozen** — touching them is a team decision, not a solo commit, because they ripple.  
* **Mock data is committed early** so no one waits on real content.  
* **Integration owners** (A \+ B) merge feature handlers; feature devs don't wire the AI themselves.  
* **Grounding rule is enforced in review:** any handler that returns content to the AI must read from JSON only — no invented figures, fees, or steps.  
* **TypeScript strict mode on** \+ shared ESLint/Prettier config committed in Phase 0, so the codebase stays consistent across 5 people.

---

## **8\. Integration Points & Risks**

* **AI bar ↔ AI sheet** (M2↔M1): the one cross-feature UI dependency. Stub the sheet early so Dev C isn't blocked.  
* **AI ↔ feature handlers** (M1↔M3/M4): mediated only by the registry \+ function signatures. If those are frozen Phase 0, this integrates cleanly.  
* **Number consistency** (M1↔M3): the in-chat budget answer and the tracker screen must read the same source — single source of truth, enforced because both go through `query_budget`.  
* **Maps need a dev build, not Expo Go.** `react-native-maps` with the Google provider requires an Expo development build (`npx expo run:android` / EAS) plus an API key — it won't run in plain Expo Go. Dev A should produce a dev build early so Devs D and E can test maps; everything else runs in Expo Go.  
* **WSL2 \+ physical device.** Expo Go's LAN connection across the WSL2 boundary is unreliable. Use `npx expo start --tunnel`, or run the dev server from the Windows side. Sort this before demo day.  
* **Biggest risk:** wiring the AI before screens exist. Mitigation — AI hooks are Phase 2, screens are Phase 1\. Build the destinations first, the intelligence on top.

---

## **Appendix — What changed from the Flutter version**

The architecture, module split, team assignment, phases, and all the data (the three JSON files) are unchanged. Only stack specifics moved:

| Concern | Flutter | React Native \+ Expo |
| ----- | ----- | ----- |
| Language | Dart | TypeScript |
| State | Riverpod | Zustand |
| Routing | go\_router | Expo Router (file-based) |
| Offline cache | Hive | AsyncStorage |
| Connectivity | connectivity\_plus | @react-native-community/netinfo |
| Charts | fl\_chart | react-native-gifted-charts (or victory-native) |
| Maps | google\_maps\_flutter | react-native-maps (needs dev build) |
| Dialing / links | url\_launcher | expo-linking |
| Gemini SDK | google\_generative\_ai (Dart) | @google/generative-ai (JS) |
| Bottom sheet | built-in showModalBottomSheet | @gorhom/bottom-sheet |
| Interfaces | abstract classes | TS interfaces |
| Onboarding flag | shared\_preferences | AsyncStorage |

[image1]: <data:image/png;base64,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>