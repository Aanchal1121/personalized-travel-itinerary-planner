import { useMemo, useState } from "react";
import "./App.css";

const TRAVEL_STYLES = [
  { id: "adventure", label: "Adventure", hint: "Hikes, outdoor fun" },
  { id: "relaxation", label: "Relaxation", hint: "Slow days, rest" },
  { id: "culture", label: "Culture", hint: "Museums, history" },
  { id: "food", label: "Food", hint: "Markets, local meals" },
];

const BUDGETS = [
  { id: "budget", label: "Budget" },
  { id: "moderate", label: "Moderate" },
  { id: "luxury", label: "Luxury" },
];

const STYLE_ACTIVITIES = {
  adventure: {
    morning: ["Start with an outdoor walk or short hike", "Join a morning nature trail"],
    afternoon: ["Visit a scenic lookout", "Try a local outdoor activity"],
    evening: ["Watch sunset from a viewpoint", "Share dinner after an active day"],
  },
  relaxation: {
    morning: ["Enjoy a slow cafe breakfast", "Take a quiet garden walk"],
    afternoon: ["Rest at your stay or a spa", "Read by a beach, park, or pool"],
    evening: ["Take an unhurried sunset stroll", "Have a calm dinner nearby"],
  },
  culture: {
    morning: ["Visit a museum or historic site", "Walk through an old neighborhood"],
    afternoon: ["Join a short cultural tour", "Explore a local market or temple"],
    evening: ["Attend a local performance if available", "Try a traditional dinner"],
  },
  food: {
    morning: ["Breakfast at a popular local spot", "Sample pastries at a neighborhood bakery"],
    afternoon: ["Take a food-market tasting walk", "Try a regional specialty for lunch"],
    evening: ["Dinner at a well-loved restaurant", "Street-food evening in a busy area"],
  },
};

function pickActivity(list, index) {
  return list[index % list.length];
}

function buildItinerary({ destination, days, budget, style }) {
  const activities = STYLE_ACTIVITIES[style] || STYLE_ACTIVITIES.culture;
  const budgetNote = {
    budget: "Keep meals simple and use walking or public transit.",
    moderate: "Mix free sights with one paid experience each day.",
    luxury: "Choose comfortable stays and a special treat each day.",
  }[budget];

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    return {
      day,
      title: `Day ${day} in ${destination}`,
      morning: pickActivity(activities.morning, index),
      afternoon: pickActivity(activities.afternoon, index),
      evening: pickActivity(activities.evening, index),
      tip: budgetNote,
    };
  });
}

export default function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("moderate");
  const [style, setStyle] = useState("culture");
  const [itinerary, setItinerary] = useState([]);
  const [error, setError] = useState("");

  const canGenerate = useMemo(
    () => destination.trim().length >= 2 && days >= 1,
    [destination, days],
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (!destination.trim()) {
      setError("Please enter a destination.");
      setItinerary([]);
      return;
    }

    const tripDays = Number(days);
    if (!tripDays || tripDays < 1 || tripDays > 14) {
      setError("Choose between 1 and 14 travel days.");
      setItinerary([]);
      return;
    }

    setError("");
    setItinerary(
      buildItinerary({
        destination: destination.trim(),
        days: tripDays,
        budget,
        style,
      }),
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Milestone 1</p>
        <h1>Plan a trip in a few simple steps</h1>
        <p className="lede">
          Enter where you want to go, how long you will stay, your budget, and
          your travel style. We will build a sample itinerary you can start from.
        </p>
      </header>

      <main className="layout">
        <form className="card form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Destination</span>
            <input
              type="text"
              name="destination"
              placeholder="Example: Kyoto, Japan"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Number of travel days</span>
            <input
              type="number"
              name="days"
              min="1"
              max="14"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </label>

          <fieldset className="field">
            <legend>Budget</legend>
            <div className="chip-row">
              {BUDGETS.map((option) => (
                <label
                  key={option.id}
                  className={budget === option.id ? "chip selected" : "chip"}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={option.id}
                    checked={budget === option.id}
                    onChange={() => setBudget(option.id)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Travel style</legend>
            <div className="style-grid">
              {TRAVEL_STYLES.map((option) => (
                <label
                  key={option.id}
                  className={style === option.id ? "style-card selected" : "style-card"}
                >
                  <input
                    type="radio"
                    name="style"
                    value={option.id}
                    checked={style === option.id}
                    onChange={() => setStyle(option.id)}
                  />
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error ? <p className="error">{error}</p> : null}

          <button type="submit" disabled={!canGenerate}>
            Generate Itinerary
          </button>
        </form>

        <section className="card results" aria-live="polite">
          <h2>Your itinerary</h2>
          {itinerary.length === 0 ? (
            <p className="empty">
              Fill in the form and click Generate Itinerary. Your day-by-day
              plan will show up here.
            </p>
          ) : (
            <ol className="days">
              {itinerary.map((item) => (
                <li key={item.day} className="day">
                  <h3>{item.title}</h3>
                  <p>
                    <strong>Morning:</strong> {item.morning}
                  </p>
                  <p>
                    <strong>Afternoon:</strong> {item.afternoon}
                  </p>
                  <p>
                    <strong>Evening:</strong> {item.evening}
                  </p>
                  <p className="tip">{item.tip}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
