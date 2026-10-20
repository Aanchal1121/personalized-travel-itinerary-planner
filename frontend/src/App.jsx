import { useEffect, useMemo, useState } from "react";
import "./App.css";

const TRAVEL_STYLES = [
  { id: "culture", label: "Culture & Heritage", icon: "🏛️", hint: "Museums, historic districts & monuments" },
  { id: "food", label: "Food & Culinary", icon: "🍜", hint: "Local markets, regional dining & street eats" },
  { id: "adventure", label: "Adventure & Outdoors", icon: "🥾", hint: "Hikes, nature trails & scenic explorations" },
  { id: "relaxation", label: "Slow & Relaxation", icon: "🌿", hint: "Cafes, scenic strolls, spa & rest" },
];

const INTERESTS = [
  { id: "culture", label: "Culture", icon: "🏛️" },
  { id: "food", label: "Gastronomy", icon: "🥘" },
  { id: "nature", label: "Nature & Parks", icon: "🌲" },
  { id: "adventure", label: "Active & Outdoors", icon: "🧗" },
  { id: "relaxation", label: "Wellness & Rest", icon: "🧘" },
];

const PACES = [
  { id: "relaxed", label: "Relaxed", hint: "Fewer stops, unhurried meals and plenty of downtime" },
  { id: "balanced", label: "Balanced", hint: "A steady cadence of sightseeing, breaks, and exploration" },
  { id: "fast-paced", label: "Fast-Paced", hint: "Maximize sightings with active, energetic scheduling" },
];

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Style" },
  { id: 3, label: "Comfort" },
  { id: 4, label: "Review" },
];

const QUICK_DIETS = ["Vegetarian", "Vegan", "Halal", "Gluten-Free", "No Seafood", "No Peanuts"];

const INITIAL_PREFERENCES = {
  destination: "",
  departureDate: "",
  returnDate: "",
  travelers: 2,
  budget: "1200",
  travelStyle: "culture",
  interests: ["culture", "food"],
  dietary: "",
  pace: "balanced",
};

function tripDaysFromDates(departureDate, returnDate) {
  if (!departureDate || !returnDate) return 0;
  const start = new Date(`${departureDate}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function App() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [errors, setErrors] = useState({});
  const [itinerary, setItinerary] = useState(null);
  const [formError, setFormError] = useState("");
  const [activeDayTab, setActiveDayTab] = useState(0); // 0 = View All, or 1, 2, ...
  
  // Generation & saving states
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Check backend health on initial load
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${apiUrl.replace(/\/$/, "")}/health`);
        if (res.ok) {
          const data = await res.json();
          setBackendHealth(data);
        } else {
          setBackendHealth({ status: "error" });
        }
      } catch {
        setBackendHealth({ status: "offline" });
      }
    }
    checkHealth();
  }, [apiUrl]);

  const tripDays = useMemo(
    () => tripDaysFromDates(preferences.departureDate, preferences.returnDate),
    [preferences.departureDate, preferences.returnDate]
  );

  function updatePreference(name, value) {
    setPreferences((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  }

  function toggleInterest(id) {
    setPreferences((prev) => {
      const selected = prev.interests.includes(id)
        ? prev.interests.filter((item) => item !== id)
        : [...prev.interests, id];
      return { ...prev, interests: selected };
    });
    if (errors.interests) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.interests;
        return copy;
      });
    }
  }

  function validateStep(currentStep) {
    const nextErrors = {};
    const destination = preferences.destination.trim();

    if (currentStep === 1) {
      if (destination.length < 2) {
        nextErrors.destination = "Please enter a destination with at least 2 characters.";
      }
      if (!preferences.departureDate) {
        nextErrors.departureDate = "Please choose a departure date.";
      }
      if (!preferences.returnDate) {
        nextErrors.returnDate = "Please choose a return date.";
      }
      if (preferences.departureDate && preferences.returnDate) {
        if (new Date(`${preferences.returnDate}T00:00:00`) < new Date(`${preferences.departureDate}T00:00:00`)) {
          nextErrors.returnDate = "Return date must be on or after the departure date.";
        } else if (tripDays < 1 || tripDays > 14) {
          nextErrors.returnDate = "Trips must be between 1 and 14 days.";
        }
      }
      const travelers = Number(preferences.travelers);
      if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) {
        nextErrors.travelers = "Please enter between 1 and 20 travelers.";
      }
    }

    if (currentStep === 2) {
      const budget = Number(preferences.budget);
      if (!preferences.budget || Number.isNaN(budget) || budget <= 0) {
        nextErrors.budget = "Please enter a budget greater than $0.";
      }
      if (!preferences.travelStyle) {
        nextErrors.travelStyle = "Please select a travel style.";
      }
      if (preferences.interests.length === 0) {
        nextErrors.interests = "Please choose at least one interest.";
      }
    }

    if (currentStep === 3) {
      if (!preferences.pace) {
        nextErrors.pace = "Please select a travel pace.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setFormError("");
      setStep((prev) => Math.min(prev + 1, 4));
    }
  }

  function handleBack() {
    setFormError("");
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleGenerateItinerary(e) {
    if (e) e.preventDefault();

    if (step < 4) {
      handleNext();
      return;
    }

    // Comprehensive validation before generation
    const v1 = validateStep(1);
    const v2 = validateStep(2);
    const v3 = validateStep(3);
    if (!v1 || !v2 || !v3) {
      setFormError("Please go back and correct invalid fields before generating.");
      return;
    }

    setFormError("");
    setSaveStatus(null);
    setIsGenerating(true);
    setLoadingStepText("Consulting Groq AI Travel Engine...");

    const destination = preferences.destination.trim();
    const days = tripDaysFromDates(preferences.departureDate, preferences.returnDate);
    const budget = Number(preferences.budget);
    const travelers = Number(preferences.travelers);

    const stepTimer1 = setTimeout(() => {
      setLoadingStepText("Optimizing route sequence to minimize backtracking...");
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setLoadingStepText("Personalizing activities, timing, and local vibe notes...");
    }, 3200);

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/generate-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days,
          budget,
          travel_style: preferences.travelStyle,
          interests: preferences.interests,
          pace: preferences.pace,
          travelers,
          dietary: preferences.dietary,
          departure_date: preferences.departureDate,
          return_date: preferences.returnDate,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const generatedPlan = data.itinerary;
      setItinerary(generatedPlan);
      setActiveDayTab(0); // default to view all

      // Automatically trigger Supabase save flow via backend
      await saveGeneratedTrip(destination, days, budget, preferences.travelStyle, generatedPlan);
    } catch (err) {
      setFormError(`Generation error: ${err.message || "Failed to communicate with backend."}`);
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveGeneratedTrip(destination, days, budget, style, itineraryData) {
    setSaveStatus({ type: "saving", message: "Saving itinerary to database..." });
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days,
          budget,
          travel_style: style,
          itinerary: itineraryData,
        }),
      });

      const resData = await response.json().catch(() => null);

      if (response.ok) {
        setSaveStatus({
          type: "success",
          message: "Saved to database successfully.",
        });
      } else {
        const detailMsg = resData?.detail || "Could not save to database.";
        setSaveStatus({
          type: "warning",
          message: detailMsg,
        });
      }
    } catch {
      setSaveStatus({
        type: "warning",
        message: "Itinerary is ready, but backend database sync was unreachable.",
      });
    }
  }

  function handleCopyItinerary() {
    if (!itinerary) return;
    const text = [
      `TRAVEL ITINERARY: ${itinerary.destination}`,
      `Overview: ${itinerary.summary}`,
      "",
      ...itinerary.days.map((d) => [
        `DAY ${d.day}: ${d.title}`,
        `Route Order: ${(d.route_order || []).join(" -> ")}`,
        `Morning (${d.morning?.time || "9:00 AM"}): ${d.morning?.activity} [${d.morning?.duration_minutes}m] - ${d.morning?.notes}`,
        `Afternoon (${d.afternoon?.time || "1:00 PM"}): ${d.afternoon?.activity} [${d.afternoon?.duration_minutes}m] - ${d.afternoon?.notes}`,
        `Evening (${d.evening?.time || "6:00 PM"}): ${d.evening?.activity} [${d.evening?.duration_minutes}m] - ${d.evening?.notes}`,
        `Tips: ${(d.travel_tips || []).join("; ")}`,
        "",
      ].join("\n")),
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    });
  }

  function handlePrint() {
    window.print();
  }

  function handleReset() {
    setItinerary(null);
    setSaveStatus(null);
    setStep(1);
  }

  const selectedStyle = TRAVEL_STYLES.find((s) => s.id === preferences.travelStyle);
  const selectedPace = PACES.find((p) => p.id === preferences.pace);
  const selectedInterests = INTERESTS.filter((i) => preferences.interests.includes(i.id));

  const daysToRender = useMemo(() => {
    if (!itinerary || !itinerary.days) return [];
    if (activeDayTab === 0) return itinerary.days;
    return itinerary.days.filter((d) => d.day === activeDayTab);
  }, [itinerary, activeDayTab]);

  return (
    <div className="app-container">
      {/* Top Brand Nav */}
      <nav className="top-nav" aria-label="Main navigation">
        <a href="/" className="brand">
          <div className="brand-icon">W</div>
          <span className="brand-title">WanderWise</span>
        </a>
        <div className="tech-badges">
          <span className={`badge ${backendHealth?.status === "ok" ? "active" : ""}`}>
            Backend: {backendHealth?.status === "ok" ? "Online" : "Connecting..."}
          </span>
          <span className="badge">Groq AI</span>
          <span className="badge">Supabase DB</span>
        </div>
      </nav>

      <main className="page-main">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-eyebrow">Personalized AI Travel Planner</div>
          <h1>
            Your Custom Journey, <span className="hero-gradient">Intelligently Planned</span>
          </h1>
          <p className="hero-subtitle">
            Tailored itineraries with smart geographic route sequencing, realistic visit durations,
            and personal vibe curation powered by Groq AI and Supabase.
          </p>
        </header>

        <div className="planner-grid">
          {/* Column 1: Multi-Step Preferences Form */}
          <section className="card form-card" aria-labelledby="form-heading">
            <h2 id="form-heading" className="sr-only" style={{ position: "absolute", left: "-9999px" }}>
              Trip Preferences Form
            </h2>

            {/* Stepper Navigation */}
            <ol className="stepper-nav" aria-label="Planner Progress Steps">
              {STEPS.map((s) => (
                <li
                  key={s.id}
                  className={`step-item ${step === s.id ? "current" : ""} ${step > s.id ? "completed" : ""}`}
                  onClick={() => {
                    if (s.id < step || validateStep(step)) {
                      setStep(s.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (s.id < step || validateStep(step)) setStep(s.id);
                    }
                  }}
                >
                  <span className="step-bubble">{step > s.id ? "✓" : s.id}</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ol>

            {/* Step 1: Trip Basics */}
            {step === 1 && (
              <div className="step-panel">
                <div className="panel-header">
                  <h2>Where & When</h2>
                  <p>Tell us your destination, dates, and group size.</p>
                </div>

                <div className="input-group">
                  <label htmlFor="destination">
                    Destination
                    <span className="label-hint">City, Country or Region</span>
                  </label>
                  <input
                    id="destination"
                    type="text"
                    placeholder="e.g. Kyoto, Japan or Florence, Italy"
                    value={preferences.destination}
                    onChange={(e) => updatePreference("destination", e.target.value)}
                  />
                  {errors.destination && <p className="error-text">{errors.destination}</p>}
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="departureDate">Departure Date</label>
                    <input
                      id="departureDate"
                      type="date"
                      value={preferences.departureDate}
                      onChange={(e) => updatePreference("departureDate", e.target.value)}
                    />
                    {errors.departureDate && <p className="error-text">{errors.departureDate}</p>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="returnDate">Return Date</label>
                    <input
                      id="returnDate"
                      type="date"
                      value={preferences.returnDate}
                      onChange={(e) => updatePreference("returnDate", e.target.value)}
                    />
                    {errors.returnDate && <p className="error-text">{errors.returnDate}</p>}
                  </div>
                </div>

                {tripDays > 0 && (
                  <div style={{ fontSize: "0.88rem", color: "#0f766e", fontWeight: 600 }}>
                    📅 Trip Duration: {tripDays} day{tripDays === 1 ? "" : "s"}
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="travelers">
                    Number of Travelers
                    <span className="label-hint">Total guests</span>
                  </label>
                  <input
                    id="travelers"
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.travelers}
                    onChange={(e) => updatePreference("travelers", e.target.value)}
                  />
                  {errors.travelers && <p className="error-text">{errors.travelers}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Budget & Style */}
            {step === 2 && (
              <div className="step-panel">
                <div className="panel-header">
                  <h2>Budget & Travel Vibe</h2>
                  <p>Choose how you like to spend and explore.</p>
                </div>

                <div className="input-group">
                  <label htmlFor="budget">
                    Total Trip Budget (USD)
                    {tripDays > 0 && preferences.budget && (
                      <span className="label-hint">
                        ~${Math.round(Number(preferences.budget) / tripDays)}/day
                      </span>
                    )}
                  </label>
                  <input
                    id="budget"
                    type="number"
                    min="50"
                    step="50"
                    placeholder="e.g. 1500"
                    value={preferences.budget}
                    onChange={(e) => updatePreference("budget", e.target.value)}
                  />
                  {errors.budget && <p className="error-text">{errors.budget}</p>}
                </div>

                <div className="input-group">
                  <label>Primary Travel Style</label>
                  <div className="style-grid">
                    {TRAVEL_STYLES.map((st) => (
                      <div
                        key={st.id}
                        className={`style-card ${preferences.travelStyle === st.id ? "selected" : ""}`}
                        onClick={() => updatePreference("travelStyle", st.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") updatePreference("travelStyle", st.id);
                        }}
                      >
                        <div className="style-card-header">
                          <span>{st.icon}</span>
                          <span>{st.label}</span>
                        </div>
                        <span className="style-card-hint">{st.hint}</span>
                      </div>
                    ))}
                  </div>
                  {errors.travelStyle && <p className="error-text">{errors.travelStyle}</p>}
                </div>

                <div className="input-group">
                  <label>Specific Interests (Select 1 or more)</label>
                  <div className="chip-grid">
                    {INTERESTS.map((intItem) => (
                      <div
                        key={intItem.id}
                        className={`chip ${preferences.interests.includes(intItem.id) ? "selected" : ""}`}
                        onClick={() => toggleInterest(intItem.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") toggleInterest(intItem.id);
                        }}
                      >
                        <span>{intItem.icon}</span>
                        <span>{intItem.label}</span>
                      </div>
                    ))}
                  </div>
                  {errors.interests && <p className="error-text">{errors.interests}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Comfort & Pace */}
            {step === 3 && (
              <div className="step-panel">
                <div className="panel-header">
                  <h2>Pace & Dietary Needs</h2>
                  <p>Fine-tune schedule intensity and meal considerations.</p>
                </div>

                <div className="input-group">
                  <label>Travel Pace</label>
                  <div className="style-grid" style={{ gridTemplateColumns: "1fr" }}>
                    {PACES.map((p) => (
                      <div
                        key={p.id}
                        className={`style-card ${preferences.pace === p.id ? "selected" : ""}`}
                        onClick={() => updatePreference("pace", p.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") updatePreference("pace", p.id);
                        }}
                      >
                        <div className="style-card-header">
                          <span>⏱</span>
                          <span>{p.label}</span>
                        </div>
                        <span className="style-card-hint">{p.hint}</span>
                      </div>
                    ))}
                  </div>
                  {errors.pace && <p className="error-text">{errors.pace}</p>}
                </div>

                <div className="input-group">
                  <label htmlFor="dietary">
                    Dietary Requirements
                    <span className="label-hint">Optional</span>
                  </label>
                  <input
                    id="dietary"
                    type="text"
                    placeholder="e.g. Vegetarian, Halal, Nut allergy"
                    value={preferences.dietary}
                    onChange={(e) => updatePreference("dietary", e.target.value)}
                  />
                  <div className="quick-options">
                    {QUICK_DIETS.map((diet) => (
                      <button
                        key={diet}
                        type="button"
                        className="quick-btn"
                        onClick={() => {
                          const current = preferences.dietary.trim();
                          const val = current ? `${current}, ${diet}` : diet;
                          updatePreference("dietary", val);
                        }}
                      >
                        + {diet}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review Screen */}
            {step === 4 && (
              <div className="step-panel">
                <div className="panel-header">
                  <h2>Review Preferences</h2>
                  <p>Double-check your choices before AI generation.</p>
                </div>

                <div className="review-summary">
                  <div className="review-item">
                    <span className="review-label">Destination</span>
                    <span className="review-val">{preferences.destination || "Not set"}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Dates & Length</span>
                    <span className="review-val">
                      {formatDate(preferences.departureDate)} – {formatDate(preferences.returnDate)}
                      {tripDays > 0 ? ` (${tripDays} days)` : ""}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Travelers</span>
                    <span className="review-val">{preferences.travelers} traveler(s)</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Total Budget</span>
                    <span className="review-val">${preferences.budget}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Style</span>
                    <span className="review-val">{selectedStyle?.label || preferences.travelStyle}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Pace</span>
                    <span className="review-val">{selectedPace?.label || preferences.pace}</span>
                  </div>
                  <div className="review-item full-width">
                    <span className="review-label">Interests</span>
                    <span className="review-val">
                      {selectedInterests.map((i) => i.label).join(", ") || "None"}
                    </span>
                  </div>
                  <div className="review-item full-width">
                    <span className="review-label">Dietary</span>
                    <span className="review-val">{preferences.dietary.trim() || "No restrictions"}</span>
                  </div>
                </div>
              </div>
            )}

            {formError && <div className="status-banner warning">⚠️ {formError}</div>}

            {/* Form Action Buttons */}
            <div className="form-actions">
              {step > 1 ? (
                <button type="button" className="btn btn-secondary" onClick={handleBack}>
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateItinerary}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating Plan..." : "✨ Generate AI Itinerary"}
                </button>
              )}
            </div>
          </section>

          {/* Column 2: Results & Itinerary View */}
          <section className="card results-card" aria-live="polite">
            {/* Empty State */}
            {!itinerary && !isGenerating && (
              <div className="empty-state">
                <div className="empty-icon">🗺️</div>
                <h3>Your Personalized Itinerary Awaits</h3>
                <p>
                  Complete the 4 quick steps on the left to review your preferences. WanderWise will
                  construct a day-by-day plan with smart routing, visit estimates, and vibe curation.
                </p>
              </div>
            )}

            {/* Loading / Generating State */}
            {isGenerating && (
              <div className="loading-state">
                <div className="spinner" />
                <h3>Crafting Your Itinerary</h3>
                <p style={{ color: "#0f766e", fontWeight: 600 }}>{loadingStepText}</p>
                <div className="loading-steps">
                  <span>• Arranging attractions in geographic sequence</span>
                  <span>• Calculating transit buffers & meal windows</span>
                  <span>• Applying budget guidance & vibe personalization</span>
                </div>
              </div>
            )}

            {/* Generated Itinerary Display */}
            {itinerary && !isGenerating && (
              <>
                {/* Header Row */}
                <div className="itinerary-header">
                  <div className="itinerary-top-row">
                    <h2 className="itinerary-title">{itinerary.destination}</h2>
                    <span className={`source-badge ${itinerary.source === "ai" ? "ai" : "fallback"}`}>
                      {itinerary.source === "ai" ? "✨ Groq AI Curated" : "🛡️ Deterministic Fallback"}
                    </span>
                  </div>
                  <p className="itinerary-summary">{itinerary.summary}</p>

                  {/* Status Banner (e.g. Supabase save status) */}
                  {saveStatus && (
                    <div className={`status-banner ${saveStatus.type}`}>
                      {saveStatus.type === "success" && "✅ "}
                      {saveStatus.type === "warning" && "ℹ️ "}
                      {saveStatus.type === "saving" && "⏳ "}
                      {saveStatus.message}
                    </div>
                  )}

                  {/* Vibe Personalization Box */}
                  {itinerary.personalization && (
                    <div className="personalization-box">
                      <h4>🎯 Why this itinerary matches you</h4>
                      <div className="personalization-grid">
                        <div className="pers-item">
                          <span className="pers-title">Travel Style</span>
                          <span className="pers-desc">{itinerary.personalization.travel_style}</span>
                        </div>
                        <div className="pers-item">
                          <span className="pers-title">Pace Strategy</span>
                          <span className="pers-desc">{itinerary.personalization.pace}</span>
                        </div>
                        <div className="pers-item">
                          <span className="pers-title">Budget Allocation</span>
                          <span className="pers-desc">{itinerary.personalization.budget_strategy}</span>
                        </div>
                        {itinerary.personalization.dietary_notes && (
                          <div className="pers-item">
                            <span className="pers-title">Dietary Tailoring</span>
                            <span className="pers-desc">{itinerary.personalization.dietary_notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Day Switcher Tabs */}
                {itinerary.days && itinerary.days.length > 1 && (
                  <div className="days-nav" role="tablist">
                    <button
                      type="button"
                      className={`day-tab ${activeDayTab === 0 ? "active" : ""}`}
                      onClick={() => setActiveDayTab(0)}
                    >
                      View All ({itinerary.days.length} Days)
                    </button>
                    {itinerary.days.map((d) => (
                      <button
                        key={d.day}
                        type="button"
                        className={`day-tab ${activeDayTab === d.day ? "active" : ""}`}
                        onClick={() => setActiveDayTab(d.day)}
                      >
                        Day {d.day}
                      </button>
                    ))}
                  </div>
                )}

                {/* Days Plans */}
                <div className="days-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {daysToRender.map((day) => (
                    <article key={day.day} className="day-plan">
                      <div className="day-plan-header">
                        <h3>{day.title}</h3>
                        <span className="day-badge">Day {day.day}</span>
                      </div>

                      {/* Geographic Route Flow (Activity 4.2) */}
                      {day.route_order && day.route_order.length > 0 && (
                        <div className="route-sequence">
                          <span className="route-sequence-label">Route Sequence:</span>
                          {day.route_order.map((stop, idx) => (
                            <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <span className="route-stop">
                                <strong>{idx + 1}.</strong> {stop}
                              </span>
                              {idx < day.route_order.length - 1 && <span className="route-arrow">➔</span>}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Activities Timeline (Morning, Afternoon, Evening) */}
                      <div className="activities-list">
                        {/* Morning */}
                        {day.morning && (
                          <div className="activity-card">
                            <div className="time-col">
                              <span className="time-tag">{day.morning.time || "09:00 AM"}</span>
                              <span className="period-label">Morning</span>
                            </div>
                            <div className="content-col">
                              <h4 className="activity-heading">{day.morning.activity}</h4>
                              <div className="activity-meta">
                                <span className="meta-badge">⏱ {day.morning.duration_minutes || 90} mins</span>
                                {day.morning.travel_from_previous_minutes > 0 && (
                                  <span className="meta-badge">
                                    🚶 ~{day.morning.travel_from_previous_minutes} min transit est.
                                  </span>
                                )}
                              </div>
                              {day.morning.notes && <p className="activity-notes">{day.morning.notes}</p>}
                            </div>
                          </div>
                        )}

                        {/* Afternoon */}
                        {day.afternoon && (
                          <div className="activity-card">
                            <div className="time-col">
                              <span className="time-tag">{day.afternoon.time || "01:00 PM"}</span>
                              <span className="period-label">Afternoon</span>
                            </div>
                            <div className="content-col">
                              <h4 className="activity-heading">{day.afternoon.activity}</h4>
                              <div className="activity-meta">
                                <span className="meta-badge">⏱ {day.afternoon.duration_minutes || 120} mins</span>
                                <span className="meta-badge">
                                  🚶 ~{day.afternoon.travel_from_previous_minutes || 20} min transit est.
                                </span>
                              </div>
                              {day.afternoon.notes && <p className="activity-notes">{day.afternoon.notes}</p>}
                            </div>
                          </div>
                        )}

                        {/* Evening */}
                        {day.evening && (
                          <div className="activity-card">
                            <div className="time-col">
                              <span className="time-tag">{day.evening.time || "06:30 PM"}</span>
                              <span className="period-label">Evening</span>
                            </div>
                            <div className="content-col">
                              <h4 className="activity-heading">{day.evening.activity}</h4>
                              <div className="activity-meta">
                                <span className="meta-badge">⏱ {day.evening.duration_minutes || 90} mins</span>
                                <span className="meta-badge">
                                  🚶 ~{day.evening.travel_from_previous_minutes || 20} min transit est.
                                </span>
                              </div>
                              {day.evening.notes && <p className="activity-notes">{day.evening.notes}</p>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Day Footer: Budget, Tips & Alternatives */}
                      <div className="day-footer">
                        {day.travel_tips && day.travel_tips.length > 0 && (
                          <div className="footer-block">
                            <span className="footer-block-title">💡 Travel Tips</span>
                            <ul>
                              {day.travel_tips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {day.alternatives && day.alternatives.length > 0 && (
                          <div className="footer-block">
                            <span className="footer-block-title">🔀 Smart Alternative</span>
                            <p>{day.alternatives[0]}</p>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {/* Itinerary Bottom Action Bar */}
                <div className="itinerary-actions">
                  <div className="action-group">
                    <button type="button" className="btn btn-secondary" onClick={handleCopyItinerary}>
                      {copyFeedback ? "✅ Copied to Clipboard!" : "📋 Copy Plan"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handlePrint}>
                      🖨️ Print / PDF
                    </button>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleReset}>
                    ✨ Plan Another Trip
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="page-footer">
        <p>WanderWise • Autonomous AI Travel Itinerary Planner • Powered by FastAPI & Groq</p>
      </footer>
    </div>
  );
}
