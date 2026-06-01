## **The Idea**

* One app for every Cebu City government service, hotline, utility, and announcement, fronted by a multilingual AI that asks "what do you need?" in Cebuano, Tagalog, or English and walks citizens straight to the right service, so they stop bouncing between agency offices and Facebook pages just to get one thing done.

* The reason for this is that Cebu City keeps talking about advancements in technology but no centralized civic app actually exists yet. Agencies are active on social media and nowhere else. Citizens are still forced to walk into offices or spend hours searching online just to find one service.

* And also we looked at Naga City's app and asked ourselves, why doesn't Cebu have something like this.

## **User Flow**

1. **First launch (one-time)**  
   * 2–3 onboarding screens explaining what the app does  
   * Final screen points an arrow at the AI bar: "Ask me anything — even in Bisaya"  
   * Skippable, shown once (gate it behind a `shared_preferences` flag)  
2. **Landing \= Dashboard (home screen)**  
   * Lands on the dashboard  
   * AI bar pinned and prominent (top headline or bottom thumb-reach), rotating prompt: *"Unsa imong kinahanglan? / Ano ang kailangan mo? / What do you need?"*  
   * Grid of service tiles fills the body, EXAMPLES: Notary Finder, Hotlines, Permits, Garbage Schedule, Announcements  
   * Both paths always visible, tap a tile to go direct, or tap the AI bar to ask  
   * AI bar reflects state: active when online, dimmed "tap to browse instead" when offline  
3. **AI layer**  
   * Tapping the AI bar slides up a conversational sheet *over* the dashboard  
   * User types/speaks freely, including messy Bisalog/Taglish: *"Asa ko pwede mag-notarize ani?"*  
   * AI replies streaming (text appears in \<1s), mirroring the user's language mix  
   * AI asks clarifying questions before acting (also guards against misread Bisaya)  
4. **Inside a service (sub-app)**  
   * Structured UI handles the actual task — *not* chat  
   * Passive on-demand helper: a small "?" / "Ask" button per screen, context-aware, silent until tapped  
5. **Offline degradation**  
   * Hotlines, requirements, office hours, locations, schedules work with zero connection (cached on install)  
   * Tapping AI offline → graceful message \+ drop into browsable dashboard, never a dead end

## **Sub-apps (Services)**

### **Main Demo** **Transparency Tracker (to show quick visuals \+ callback to the problem)**  User Flow

1. **Entry.** Citizen arrives either by tapping the dashboard tile, or by asking the front-door AI something like *"pila gigasto sa dalan sa amoa?"* which routes here. If its a specific question, the AI will just show what is needed, then have a "view full breakdown" button which routes to the transparency tracker sub-app.

2. **City overview.** Lands on a clean overview: the year's total city budget as a big headline number, a donut chart splitting it by sector (infrastructure, health, education, social services, etc.), and a year selector at the top.

3. **Sector drill-down.** Tapping a sector (e.g. Infrastructure) reveals the projects under it — each row showing name, allocated budget, status (planned / ongoing / completed), and a progress bar.

4. **Project detail.** Tapping a project opens a detail card: allocated vs. spent, status, timeline, barangay, and a map pin of where it physically is.

5. **Map view (OPTIONAL / TO-BE-DISCUSSED) .** A toggle switches to a city map with project pins color-coded by status — "what's being built near me." Tapping a pin opens the same project detail.

6. **Ask the AI.** From the "?" helper or the front door, the citizen asks *"how much for roads in Guadalupe?"* The AI filters the data, answers in plain Bisaya/Taglish, and the screen scrolls to the matching projects/chart.

**Business Permit (this is multi-step, it shows the AI technicality)**  
User Flow  
The roadmap is **not one fixed path**. There's a common backbone every business shares, plus conditional steps that get added based on the citizen's situation. The AI intake is what assembles the personalized path — and watching it do that live is the showpiece moment.

1. **Entry \+ AI intake (the branching engine).** Citizen taps the tile, or asks the front door *"gusto ko magbukas ug tindahan."* Before showing the roadmap, the AI asks a short series of clarifying questions as tappable chips. These answers build a *profile* that determines the path:

   * **New or renewal?** (renewals run Jan 1–20, different path)  
   * **What type of business?** (e.g. sari-sari store / carinderia or restaurant / services / bar-videoke)  
   * **Legal structure?** (sole proprietor → DTI · corporation or partnership → SEC · cooperative → CDA — this sets the prerequisite registration)  
   * *(optional)* **Size / capitalization?** — only if it changes requirements (some kick in at ₱1M+)Chips, not free text — faster for the user and demo-reliable on stage.  
2. **Personalized roadmap reveal.** The walkthrough assembles `backbone + conditional steps` from the profile and reveals the path with total estimated fees and time at the top, and a "0 of N" progress indicator (N varies by path). The base backbone is: Prerequisite Registration (DTI/SEC/CDA) → Barangay Clearance → Sanitary/Health Permit → Fire Clearance → Zoning Clearance → BPLO Application → Treasury Assessment & Payment → Permit Released. **Conditional add-ons are visibly tagged** so the personalization is obvious — e.g. a restaurant shows extra health-card / sanitary steps; a bar shows the STD orientation certificate; a contractor shows a PCAB license; a resort shows a Provincial Capitol Governor's Permit. A sari-sari store sees only the lean backbone.

3. **Step detail.** Tapping a step shows what it is, which office handles it (with a map pin), the requirements to bring (as a checklist), the fee, processing time, and a tip or two.

4. **Progress tracking.** The citizen ticks off requirements and marks steps done; the progress bar fills. Saved locally so they can close the app and resume — including offline.

5. **In-context AI helper.** A "?" on any step lets them ask *"unsa man ni nga zoning clearance?"* — or *"why do I have this step?"* (answer: because you said it's a food business) — grounded in that step's data and the profile.

6. **Completion \+ disclaimer.** When all steps are done, a summary confirms they're ready to claim the permit and shows the final office details, with a soft note: *requirements may vary by business — confirm final requirements with BPLO.*

### **Emergency Services**

- Of course we have a list of emergency services, and we can call them even if offline.

