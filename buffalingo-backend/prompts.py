import random

PROMPT_WORDS = [
    # Core Buffalo Culture
    "wings", "snow", "Bills", "Sabres", "Zubaz", "tailgate", "buffalo",
    
    # Weather + Winter Vibes
    "blizzard", "shovel", "lake", "icicles", "frostbite", "snowplow", "cold", "sled", "black ice", "sleet",

    # Stadium & Game Day
    "stadium", "tailgate", "kickoff", "helmet", "touchdown", "penalty", "ref", "halftime", "jersey",

    # Food + Local Flavor
    "blue cheese", "ranch", "beef on weck", "pierogi", "loganberry", "popcorn", "grill", "nachos", "hot sauce",

    # City Stuff
    "Erie", "downtown", "716", "Broadway Market", "Elmwood", "Niagara", "Falls", "bar", "train", "parking",

    # Fan Life
    "Mafia", "flag", "facepaint", "drunk", "fireball", "chug", "cheer", "fumble", "chant", "boom",

    # Fun/Random
    "fire", "ice", "beer", "highmark", "anthem", "buffalove", "huddle", "legend", "weather", "grit"
]


def get_random_prompt():
    return random.choice(PROMPT_WORDS)
