"""Deterministic fallback itinerary generator when AI provider is unavailable.

Ensures the application remains completely functional even under API rate limits or network issues,
while explicitly and transparently indicating that the output is from a local rule-based fallback.
"""
from typing import Any


ACTIVITIES_BY_STYLE = {
    "adventure": {
        "morning": [
            ("Scenic Trail Walk & Hike", 120, 15, "Head out early for panoramic nature views and refreshing morning air."),
            ("Mountain Footpath Exploration", 150, 20, "Explore elevated vistas and quiet wilderness footpaths."),
            ("Coastal Path Trek", 130, 25, "Walk along marked trails observing natural landscapes and rock formations."),
        ],
        "afternoon": [
            ("Outdoor Recreation & Active Sightseeing", 120, 20, "Rent equipment or follow marked loops through local outdoor parks."),
            ("River Valley Exploration", 110, 30, "Follow waterside routes and discover scenic viewpoints."),
            ("Forest Canopy Trail", 100, 25, "Walk shaded nature trails suitable for all fitness levels."),
        ],
        "evening": [
            ("Sunset Viewpoint Gathering", 90, 15, "Relax at a premier elevated lookout to watch the sunset."),
            ("Campfire-Style Casual Dinner", 90, 20, "Refuel with hearty local specialties at an outdoor-themed bistro."),
            ("Stargazing & Evening Stroll", 75, 15, "Take a peaceful twilight stroll away from bright city lights."),
        ],
    },
    "culture": {
        "morning": [
            ("Heritage Quarter & Historic Landmark", 120, 10, "Explore centuries-old architecture and iconic cultural landmarks early to beat crowds."),
            ("Fine Arts & Antiquities Museum", 130, 15, "Discover curated galleries detailing the region's rich artistic history."),
            ("Historic Temple & Memorial Grounds", 110, 20, "Appreciate peaceful garden courtyards and preserved monuments."),
        ],
        "afternoon": [
            ("Artisan Workshops & Craft Center", 110, 20, "Observe master artisans practicing traditional crafts, textiles, or pottery."),
            ("Old Town Architectural Walk", 120, 15, "Wander cobblestone lanes and photograph heritage facades and hidden alleys."),
            ("Cultural Center & Living History Exhibit", 100, 20, "Engage with interactive displays celebrating local customs and folk traditions."),
        ],
        "evening": [
            ("Traditional Performance or Evening Tour", 90, 20, "Attend an authentic musical, theatrical, or heritage showcase if available."),
            ("Historic District Dinner & Illumination Walk", 105, 15, "Dine at a heritage restaurant followed by seeing illuminated historic gates."),
            ("Twilight Promenade in the Cultural District", 80, 10, "Experience the ambient lighting and quiet evening charm of the oldest district."),
        ],
    },
    "food": {
        "morning": [
            ("Artisanal Bakery & Morning Market", 90, 10, "Savor fresh morning pastries and observe bustling regional food stalls."),
            ("Historic Coffee Roastery & Local Breakfast", 75, 15, "Taste traditional breakfast staples alongside locally roasted coffee or tea."),
            ("Waterfront Fish & Produce Market", 90, 20, "Experience the lively wholesale market and taste fresh seasonal produce."),
        ],
        "afternoon": [
            ("Gourmet Food Hall & Regional Tasting Tour", 120, 15, "Sample a curated flight of regional specialties across several authentic vendors."),
            ("Traditional Cooking Class or Food Hall Walk", 135, 20, "Learn the secrets behind beloved local sauces and culinary techniques."),
            ("Culinary Street Tasting Safari", 110, 15, "Walk through a neighborhood renowned for specialty grocers and delis."),
        ],
        "evening": [
            ("Bistronomy Tasting Dinner", 120, 20, "Enjoy a seated dinner featuring seasonal local ingredients and regional pairings."),
            ("Night Market Gastronomy Crawl", 110, 15, "Graze through famous food stalls offering sizzling, freshly made street delicacies."),
            ("Cozy Neighborhood Trattoria/Izakaya Experience", 105, 15, "Unwind at a convivial local eatery known for authentic hospitality."),
        ],
    },
    "relaxation": {
        "morning": [
            ("Botanical Gardens & Serene Greenhouse", 105, 10, "Take an unhurried morning walk among rare flora and shaded paths."),
            ("Waterside Promenade & Slow Cafe", 90, 15, "Sip warm tea with water views and gentle morning ambiance."),
            ("Quiet Historic Courtyard Visit", 80, 10, "Sit and read in peaceful cloistered courtyards with tranquil fountain features."),
        ],
        "afternoon": [
            ("Thermal Spa, Bathhouse, or Quiet Library", 120, 20, "Dedicate time to wellness, hydrotherapy, or browsing rare book collections."),
            ("Scenic Boat Tour or Shaded Park Picnic", 110, 15, "Drift along placid waterways or rest beneath ancient shade trees."),
            ("Artisan Tea House & Mindfulness Garden", 90, 15, "Experience a slow, meditative tea service in an authentic garden setting."),
        ],
        "evening": [
            ("Sunset Stroll & Fine Dining", 100, 15, "Watch the colors change across the horizon before a relaxed candlelit dinner."),
            ("Quiet Waterfront Terrace Dinner", 90, 15, "Dine al fresco with gentle breezes and a calm, quiet atmosphere."),
            ("Unrushed Twilight Cafe & Dessert", 75, 10, "Conclude the evening with artisanal dessert and soothing herbal tea."),
        ],
    },
}


def generate_fallback_itinerary(preferences: dict[str, Any]) -> dict[str, Any]:
    """Build a deterministic, high-quality itinerary matching the exact schema."""
    destination = preferences.get("destination", "Your Destination")
    days_count = max(1, min(14, int(preferences.get("days", 3))))
    style = preferences.get("travel_style", "culture").lower()
    interests = preferences.get("interests", ["culture"])
    pace = preferences.get("pace", "balanced").lower()
    budget = float(preferences.get("budget", 1000))
    travelers = max(1, int(preferences.get("travelers", 1)))
    dietary = preferences.get("dietary", "").strip()

    style_pool = ACTIVITIES_BY_STYLE.get(style, ACTIVITIES_BY_STYLE["culture"])

    # Pace modifiers
    duration_multiplier = {"relaxed": 0.85, "balanced": 1.0, "fast-paced": 1.15}.get(pace, 1.0)
    travel_time_base = {"relaxed": 20, "balanced": 15, "fast-paced": 25}.get(pace, 15)

    per_day_budget = budget / days_count

    days_list = []
    for day_num in range(1, days_count + 1):
        idx = day_num - 1

        m_act, m_dur, m_trav, m_note = style_pool["morning"][idx % len(style_pool["morning"])]
        a_act, a_dur, a_trav, a_note = style_pool["afternoon"][idx % len(style_pool["afternoon"])]
        e_act, e_dur, e_trav, e_note = style_pool["evening"][idx % len(style_pool["evening"])]

        # Route order
        route_stops = [
            f"{m_act} ({destination})",
            f"{a_act} ({destination})",
            f"{e_act} ({destination})",
        ]

        # Dietary tailoring
        diet_note = f" Dietary requirement considered: {dietary}." if dietary else ""

        days_list.append({
            "day": day_num,
            "title": f"Day {day_num}: Discovering {destination} Highlights",
            "route_order": route_stops,
            "morning": {
                "time": "09:00 AM",
                "activity": f"{m_act} in central {destination}",
                "duration_minutes": int(m_dur * duration_multiplier),
                "travel_from_previous_minutes": 0,
                "notes": f"{m_note} Convenient morning start.",
            },
            "afternoon": {
                "time": "01:30 PM",
                "activity": f"{a_act} nearby",
                "duration_minutes": int(a_dur * duration_multiplier),
                "travel_from_previous_minutes": max(10, m_trav + travel_time_base // 2),
                "notes": f"{a_note}{diet_note}",
            },
            "evening": {
                "time": "06:30 PM",
                "activity": f"{e_act}",
                "duration_minutes": int(e_dur * duration_multiplier),
                "travel_from_previous_minutes": max(10, a_trav + travel_time_base // 2),
                "notes": f"{e_note} Perfect way to conclude day {day_num}.",
            },
            "estimated_daily_budget": f"Estimated ~${int(per_day_budget):,} total daily allocation for {travelers} traveler(s).",
            "travel_tips": [
                f"Group visits in the same quadrant of {destination} to reduce transit times.",
                "Use local transit day passes or verified transit cards when possible.",
                "Keep cash and cards handy; check seasonal attraction hours ahead.",
            ],
            "alternatives": [
                f"If the weather changes, switch afternoon activity to an indoor museum or artisan gallery in {destination}.",
            ],
        })

    return {
        "destination": destination,
        "summary": (
            f"A curated {days_count}-day {style} itinerary for {travelers} traveler(s) exploring {destination}. "
            f"Designed for a {pace} pace and a total budget of ${int(budget):,}."
        ),
        "personalization": {
            "travel_style": f"Focused on {style} experiences with curated daily highlights.",
            "interests": interests if interests else [style],
            "pace": f"{pace.capitalize()} scheduling allowing realistic visit windows and transit buffers.",
            "budget_strategy": f"Balanced spending averaging ~${int(per_day_budget):,}/day for accommodations, meals, and visits.",
            "dietary_notes": f"Meals curated with {dietary} options in mind." if dietary else "Standard culinary options with local varieties.",
        },
        "days": days_list,
        "is_fallback": True,
        "source": "local_fallback",
        "notice": "Generated using deterministic local fallback planner (AI provider was offline or skipped).",
    }
