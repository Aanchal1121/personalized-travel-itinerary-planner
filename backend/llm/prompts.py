import json


def build_itinerary_prompt(preferences: dict) -> str:
    """Build a personalized itinerary prompt with route and time planning."""
    trip = json.dumps(preferences, ensure_ascii=False, indent=2)

    return f"""
You are an expert travel itinerary planner.

USER PREFERENCES:
{trip}

Return ONLY valid JSON using this exact structure:
{{
  "destination": "destination name",
  "summary": "Short overview of the personalized trip",
  "personalization": {{
    "travel_style": "How the selected style shaped this plan",
    "interests": ["Interest matched"],
    "pace": "How the requested pace is applied",
    "budget_strategy": "General approach to staying within budget",
    "dietary_notes": "How dietary preferences are considered"
  }},
  "days": [
    {{
      "day": 1,
      "title": "Day title",
      "route_order": ["First place", "Second place", "Third place"],
      "morning": {{
        "time": "9:00 AM",
        "activity": "Activity or place",
        "duration_minutes": 90,
        "travel_from_previous_minutes": 0,
        "notes": "Useful practical details"
      }},
      "afternoon": {{
        "time": "1:00 PM",
        "activity": "Activity or place",
        "duration_minutes": 120,
        "travel_from_previous_minutes": 25,
        "notes": "Useful practical details"
      }},
      "evening": {{
        "time": "6:00 PM",
        "activity": "Activity or place",
        "duration_minutes": 90,
        "travel_from_previous_minutes": 20,
        "notes": "Useful practical details"
      }},
      "estimated_daily_budget": "Qualitative estimate, not an invented exact price",
      "travel_tips": ["Practical tip"],
      "alternatives": ["Optional alternative activity"]
    }}
  ]
}}

REQUIREMENTS:
- Generate exactly the requested number of days.
- Include morning, afternoon, and evening for every day.
- Personalize activities using travel style, all relevant interests, pace,
  number of travelers, budget, and dietary preferences.
- Group nearby attractions on the same day where reasonably possible.
- Put activities in a sensible geographic order to reduce backtracking.
- Give plausible visit durations and approximate travel-time estimates.
- Travel times are estimates, not live navigation data. Do not claim
  access to live traffic, current routes, or real-time transport.
- Leave realistic time for meals, breaks, and movement between places.
- Respect the requested pace: relaxed means fewer stops; fast-paced means
  more stops only when practical; balanced means a reasonable mix.
- Keep recommendations appropriate for the destination and trip length.
- Do not invent exact ticket prices, opening hours, bookings, or live data.
- If a detail is uncertain, clearly describe it as an estimate or suggest
  checking locally.
- Return valid JSON only, with no Markdown fences or extra commentary.
"""
