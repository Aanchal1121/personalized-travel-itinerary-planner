# WanderWise — Personalized Travel Itinerary Planner
## Phase 1: Ideation Phase Documentation

---

### Project Header & Administrative Information

| Parameter | Details |
| :--- | :--- |
| **Project Title** | WanderWise — Generative AI-Based Personalized Travel Itinerary Planner |
| **Project Category** | Generative Artificial Intelligence (Generative AI) |
| **Document Phase** | Phase 1: Ideation Phase |
| **Date** | 31 January 2026 |
| **Team ID** | [TO BE PROVIDED] |
| **Repository URL** | [https://github.com/Aanchal1121/personalized-travel-itinerary-planner](https://github.com/Aanchal1121/personalized-travel-itinerary-planner) |
| **Maximum Marks** | 10 Marks (Empathy Map: 4 Marks, Problem Statement: 2 Marks, Brainstorming & Prioritization: 4 Marks) |

---

## 1. Executive Summary & Project Overview

### 1.1 The Real-World Travel Planning Challenge
Modern leisure travel planning is fragmented, overwhelming, and time-intensive. Prospective travelers must manually sift through dozens of travel blogs, TripAdvisor reviews, commercial booking portals, social media feeds, and map navigation applications. Despite spending an average of 10 to 20 hours researching a single trip, travelers frequently end up with:
1. **Generic, Rigid Itineraries**: Conventional tour packages and static aggregator itineraries cater to average mass tourism, disregarding individual pacing preferences, dietary constraints, travel styles, and strict financial bounds.
2. **Geographic Inefficiency & Backtracking**: Manual planning often leads to grouping disparate tourist spots without understanding transit topology, resulting in wasted hours travelling across the same city quadrants repeatedly.
3. **Pacing Fatigue**: Static guides cram unrealistic numbers of attractions into single-day schedules without factoring in visit duration, fatigue buffers, or dining logistics.
4. **Fragility of Cloud AI Providers**: Emerging AI travel tools depend entirely on third-party cloud APIs that suffer from latency, strict rate limits, and outages, leaving travelers stranded without an itinerary when connectivity or credits fail.

### 1.2 Proposed Generative AI Solution: WanderWise
**WanderWise** is a full-stack, autonomous Generative AI travel itinerary planner engineered to synthesize hyper-personalized, topologically coherent, day-by-day travel schedules in seconds. Powered by the Groq LPU inference engine running high-throughput Large Language Models (such as `openai/gpt-oss-20b` or `llama-3.3-70b-versatile`), WanderWise pairs rapid prompt inference with a deterministic, local rule-based fallback engine and a serverless Supabase PostgreSQL persistence layer.

---

## 2. Empathy Map Canvas (Maximum Marks: 4 Marks)

An empathy map is a visual, collaborative tool that captures behavioral knowledge, attitudes, environmental influences, internal motivations, and operational pain points of the target traveler.

### 2.1 Target Persona Profile
* **Name**: Sarah Jenkins (and traveling companion)
* **Demographics**: 28 years old, UX Designer & independent traveler
* **Scenario**: Planning a 4-day trip to Kyoto, Japan on a strict budget of $1,200 with cultural exploration, balanced pacing, and vegetarian dietary preferences.

```
+--------------------------------------------------------------------------------------------------+
|                                    EMPATHY MAP CANVAS                                            |
|                                                                                                  |
|   1. WHO ARE WE EMPATHIZING WITH?                                                                |
|      - Independent travelers, couples, and small travel groups planning multi-day trips.         |
|      - Tech-savvy users who want customized experiences rather than packaged group tours.        |
|      - Users constrained by time, realistic budgets, specific diets, and fatigue thresholds.      |
|                                                                                                  |
|   2. WHAT DO THEY NEED TO DO?                                                                    |
|      - Generate a complete, day-by-day itinerary tailored to their destination and schedule.     |
|      - Group attractions by geographical proximity to avoid backtracking across urban transit.   |
|      - Obtain actionable visit timings, realistic activity durations, and dietary lunch options. |
|      - Save, print, or export their travel plan for offline mobile access while roaming.         |
+--------------------------------------------------------------------------------------------------+
|   3. WHAT DO THEY SEE?                         |   4. WHAT DO THEY SAY?                          |
|      - Generic "Top 10 Things to Do" listicles |      - "I want to visit authentic temples, but  |
|        with sponsored rankings.                |        not spend all day stuck in transit."     |
|      - Complex spreadsheet templates.          |      - "Can I find vegetarian options near the   |
|      - Travel agency packages with fixed buses.|        activities on Day 2?"                    |
|      - AI chat interfaces spitting unstructured|      - "Are these attractions actually open and |
|        plain text without time buffers.        |        geographically close to one another?"    |
+--------------------------------------------------------------------------------------------------+
|   5. WHAT DO THEY DO?                          |   6. WHAT DO THEY HEAR?                         |
|      - Open 25+ browser tabs simultaneously.   |      - Friends recommending niche cafes.        |
|      - Manually cross-reference Google Maps    |      - Social media influencers promoting       |
|        for driving and train times.            |        overhyped tourist spots.                  |
|      - Copy-paste notes into Apple Notes.      |      - Travel warnings about peak-hour crowds    |
|      - Second-guess daily budget estimates.    |        and long admission queues.                |
+--------------------------------------------------------------------------------------------------+
|   7. WHAT DO THEY THINK AND FEEL?                                                                |
|                                                                                                  |
|   PAINS (Fears, Frustrations, Obstacles):                                                        |
|   - Overwhelmed by information overload and contradictory blog recommendations.                  |
|   - Fear of getting exhausted due to overly packed daily schedules without rest breaks.           |
|   - Frustration with AI chatbots producing hallucinations or invalid formatting.                |
|   - Anxiety about network connectivity drops while travelling abroad.                            |
|                                                                                                  |
|   GAINS (Wants, Needs, Success Criteria):                                                        |
|   - Clear visual progression from morning to afternoon to evening.                               |
|   - Logical route flow minimizing transit time and avoiding zig-zagging across town.             |
|   - Confidence that dietary preferences and budget boundaries are respected.                     |
|   - Instant one-click copy, PDF export, and cloud database persistence.                         |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Customer Problem Statements Template (Maximum Marks: 2 Marks)

The Customer Problem Statement framework articulates customer frustrations from a human-centric perspective: **"I am... I'm trying to... But... Because... Which makes me feel..."**

| Problem Statement (PS) | I am (Customer) | I'm trying to | But | Because | Which makes me feel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PS-1: Fragmented Planning & Information Overload** | An independent solo traveler planning a 5-day international journey. | Synthesize an organized, personalized daily schedule from scratch. | I spend over 15 hours cross-referencing disjointed blogs, guides, and review sites. | Existing websites provide static lists rather than unified, contextual daily schedules. | Overwhelmed, exhausted, and anxious that I will miss out on key cultural experiences. |
| **PS-2: Geographic Inefficiency & Backtracking** | A working professional planning a weekend city getaway with my partner. | Visit key landmarks efficiently during our limited available days. | Our itinerary has us crisscrossing opposite sides of the city multiple times a day. | Traditional travel recommendation engines do not compute geographic clustering or transit flows between consecutive activities. | Frustrated by wasted travel time, unnecessary transit fares, and physical fatigue. |
| **PS-3: Dietary & Pacing Neglect** | A vegetarian traveler travelling with a group of friends. | Find activities and dining recommendations that match our pace and dietary restrictions. | Most itineraries recommend generic dining without vegetarian verification and ignore pacing preferences. | Static tour templates cater only to standard omnivore diets and high-intensity sightseeing schedules. | Excluded, stressed about meal planning, and rushed during cultural visits. |
| **PS-4: AI Cloud Dependency & System Outage Risk** | A mobile traveler relying on an AI web planner while on the go. | Access reliable itinerary details continuously, even during high traffic or spotty connections. | The service crashes or fails with timeout errors when the underlying LLM provider encounters rate limits. | Most generative AI applications lack local deterministic fallbacks and offline-ready persistence. | Helpless, stranded, and unable to consult the day's itinerary. |

---

## 4. Brainstorming & Idea Prioritization Template (Maximum Marks: 4 Marks)

### 4.1 Step 1: Brainstorm and Idea Listing
The engineering and design team generated raw feature concepts across key architectural categories without preliminary filtering:

| S.No | Team Member | Idea / Suggestion | Category | Group No. |
| :---: | :--- | :--- | :--- | :---: |
| 1 | [TO BE PROVIDED] | LLM-driven structured JSON generator using Groq API for sub-second inference. | AI Engine | Group 1 |
| 2 | [TO BE PROVIDED] | Multi-step user preference questionnaire (destination, days, budget, style, pace, dietary). | User Experience | Group 2 |
| 3 | [TO BE PROVIDED] | Deterministic, local rule-based fallback generator for zero-downtime reliability. | Reliability & Resilience | Group 1 |
| 4 | [TO BE PROVIDED] | Visual geographic route sequencer (`Stop 1 ➔ Stop 2 ➔ Stop 3`) with transit time buffers. | Algorithmic Optimization | Group 3 |
| 5 | [TO BE PROVIDED] | Serverless PostgreSQL persistence using Supabase with Row Level Security (RLS). | Cloud & Database | Group 4 |
| 6 | [TO BE PROVIDED] | One-click clipboard copy and native print-to-PDF export mechanism. | Productization & UX | Group 2 |
| 7 | [TO BE PROVIDED] | Full booking engine integration with live flight/hotel payments and checkout. | Commercial Integration | Group 5 |
| 8 | [TO BE PROVIDED] | Real-time GPS turn-by-turn driving navigation with live satellite traffic overlays. | Telematics / Navigation | Group 5 |
| 9 | [TO BE PROVIDED] | Day-by-day interactive tabs (`View All`, `Day 1`, `Day 2`...) with responsive layout. | User Interface | Group 2 |
| 10 | [TO BE PROVIDED] | Vibe-based personalization rationale providing contextual explanations for every pick. | Explainable AI | Group 3 |

### 4.2 Step 2: Idea Prioritization
Ideas were grouped and evaluated using a structured **Feasibility vs. Importance Priority Matrix**:

| Group No. | Final Idea Group | Feasibility (High / Medium / Low) | Importance (High / Medium / Low) | Priority | Selected (Yes / No) | Justification & Technical Scope |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Group 1** | **Hybrid AI Engine with Local Fallback**<br>Groq LLM async completion + deterministic local fallback. | **High** | **High** | **P1 (Highest)** | **Yes** | Core intellectual value of the Generative AI project. Guarantees 100% uptime even under API quotas. |
| **Group 2** | **Multi-Step Intuitive UI & Export Engine**<br>Interactive preference wizard, day tabs, copy, and PDF export. | **High** | **High** | **P1 (Highest)** | **Yes** | Enables intuitive user engagement, client-side validation, and instant utility without paywalls. |
| **Group 3** | **Geographic Sequencing & Vibe Rationalization**<br>Route ordering, realistic transit buffers, and explainable AI tips. | **High** | **High** | **P1 (Highest)** | **Yes** | Eliminates backtracking; differentiates WanderWise from basic uncurated text chatbots. |
| **Group 4** | **Secure Supabase Cloud Persistence**<br>PostgreSQL table with PostgREST, RLS policies, and server-side secret management. | **High** | **Medium** | **P2** | **Yes** | Allows travelers to save itineraries permanently and retrieve recent community plans securely. |
| **Group 5** | **Live Flight/Hotel Booking & Turn-by-Turn GPS**<br>Commercial payment gateways and live map navigation SDKs. | **Low** | **Low** | **P3 (Deferred)** | **No** | Out of scope for an autonomous academic itinerary synthesizer; introduces costly commercial API dependencies. |

---

## 5. Technical Justification for Generative AI

### 5.1 Why Traditional Static Systems Fall Short
* **Combinatorial Explosion**: A travel planner with 50 destinations, 14 duration options, 6 travel styles, 8 interest categories, 3 pace levels, and diverse dietary needs produces over $50 \times 14 \times 6 \times 2^8 \times 3 \approx 32,256,000$ unique permutations. Hardcoding rule sets or maintaining relational static templates for millions of scenarios is operationally impossible.
* **Lack of Narrative Context**: Static databases cannot explain *why* an activity was chosen or adapt to nuanced phrases such as "hidden gems for photography enthusiasts who love street food."

### 5.2 Why Generative AI is the Optimal Architecture
* **Semantic Synthesis**: Generative Pretrained Transformers possess deep contextual knowledge of world geography, cultural sites, culinary traditions, and local customs.
* **Structured Output Generation**: By applying schema constraints (JSON mode) to state-of-the-art LLMs, the system transforms creative geographic reasoning into typed, validated data structures directly consumable by modern web interfaces.
* **Ultra-Low Latency via Groq LPU**: Utilizing Groq's Language Processing Units (LPUs) delivers generation speeds exceeding 300 tokens per second, enabling full multi-day itineraries to render in under 3 seconds.

---

## 6. Project Scope, Feasibility & Limitations

### 6.1 In-Scope Capabilities (Implemented & Verified)
* Interactive client-side preference collection with real-time validation.
* Fast asynchronous backend API built with FastAPI and Pydantic v2.
* Prompt engineering pipeline returning structured JSON containing exact day counts, morning/afternoon/evening activities, visit durations, transit times, and geographic route ordering.
* Deterministic, zero-crash local fallback engine when API credentials or internet connectivity are absent.
* Serverless Supabase PostgreSQL persistence with Row-Level Security.
* Mobile-responsive interface with day switcher tabs, clipboard copying, and PDF printing.

### 6.2 Out-of-Scope Capabilities (Explicitly Planned for Future Releases)
* Direct flight, hotel, or attraction ticket transaction booking.
* Live real-time road traffic monitoring or satellite GPS turn-by-turn navigation.
* Dynamic multi-currency bank account synchronization.

---

## 7. Phase 1 Sign-Off & Verification Checklist

| Deliverable Item | Status | Verification Reference |
| :--- | :---: | :--- |
| Real-World Problem Definition | Completed | Section 1.1 & Section 3 (PS-1 to PS-4) |
| Empathy Map Canvas | Completed | Section 2 (7 core empathy quadrants) |
| Brainstorming & Idea Prioritization | Completed | Section 4 (10 brainstormed ideas, 5 prioritized groups) |
| Technical Justification for Generative AI | Completed | Section 5 (Combinatorial math & Groq LPU justification) |
| Project Scope & Limitations | Completed | Section 6 (In-scope vs. out-of-scope boundaries) |
| Administrative Fields Prepared | Completed | Date: 31 Jan 2026; Team ID: `[TO BE PROVIDED]` |
