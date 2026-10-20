const ALLOWED_STYLES = ["adventure", "relaxation", "culture", "food"];
const ALLOWED_PACES = ["relaxed", "balanced", "fast-paced"];
const ALLOWED_INTERESTS = ["culture", "nature", "adventure", "food", "relaxation"];

export function buildTravelPrompt(preferences) {
  if (!preferences || typeof preferences !== "object") {
    throw new Error("Travel preferences are required.");
  }

  const destination = String(preferences.destination ?? "").trim();
  if (destination.length < 2) {
    throw new Error("Please provide a valid destination.");
  }

  const departureDate = String(preferences.departureDate ?? "").trim();
  const returnDate = String(preferences.returnDate ?? "").trim();
  const start = new Date(`${departureDate}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);

  const days =
    departureDate &&
    returnDate &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime())
      ? Math.round((end - start) / 86400000) + 1
      : 0;

  if (!Number.isInteger(days) || days < 1 || days > 14) {
    throw new Error("Trip dates must describe a trip of 1 to 14 days.");
  }

  const travelers = Number(preferences.travelers);
  if (!Number.isInteger(travelers) || travelers < 1) {
    throw new Error("Travelers must be a positive whole number.");
  }

  const budget = Number(preferences.budget);
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error("Budget must be greater than zero.");
  }

  const travelStyle = String(preferences.travelStyle ?? "culture").trim();
  if (!ALLOWED_STYLES.includes(travelStyle)) {
    throw new Error("Please select a supported travel style.");
  }

  const interests = Array.isArray(preferences.interests)
    ? preferences.interests.filter((item) => ALLOWED_INTERESTS.includes(item))
    : [];

  const pace = String(preferences.pace ?? "balanced");
  if (!ALLOWED_PACES.includes(pace)) {
    throw new Error("Please select a supported travel pace.");
  }

  const dietary = String(preferences.dietary ?? "").trim();

  const structuredPreferences = {
    destination,
    departureDate,
    returnDate,
    days,
    travelers,
    budget,
    travelStyle,
    interests,
    dietary,
    pace,
  };

  const prompt = [
    "Create a sample travel itinerary using these preferences.",
    `Destination: ${destination}`,
    `Dates: ${departureDate} to ${returnDate} (${days} days)`,
    `Travelers: ${travelers}`,
    `Total budget: ${budget}`,
    `Travel style: ${travelStyle}`,
    `Interests: ${interests.length ? interests.join(", ") : "Not specified"}`,
    `Dietary requirements: ${dietary || "None specified"}`,
    `Travel pace: ${pace}`,
    "Provide morning, afternoon, and evening suggestions for each day.",
    "Treat suggestions as examples, not verified bookings or live recommendations.",
  ].join("\n");

  return { preferences: structuredPreferences, prompt };
}
