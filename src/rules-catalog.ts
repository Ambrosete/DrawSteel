// Draw Steel Heroes v1.01b. Nombres extraídos del PDF aportado por el usuario.
// sourcePage: página del PDF completo; bookPage: número impreso. El recorte comienza en sourcePage 21 (impresa 6).
export type CatalogOption = { name: string; bookPage: number; sourcePage: number }
export const ancestries = [
  {
    "name": "Devil",
    "bookPage": 26,
    "sourcePage": 41
  },
  {
    "name": "Dragon Knight",
    "bookPage": 28,
    "sourcePage": 43
  },
  {
    "name": "Dwarf",
    "bookPage": 30,
    "sourcePage": 45
  },
  {
    "name": "Hakaan",
    "bookPage": 36,
    "sourcePage": 51
  },
  {
    "name": "High Elf",
    "bookPage": 34,
    "sourcePage": 49
  },
  {
    "name": "Human",
    "bookPage": 38,
    "sourcePage": 53
  },
  {
    "name": "Memonek",
    "bookPage": 40,
    "sourcePage": 55
  },
  {
    "name": "Orc",
    "bookPage": 42,
    "sourcePage": 57
  },
  {
    "name": "Polder",
    "bookPage": 44,
    "sourcePage": 59
  },
  {
    "name": "Revenant",
    "bookPage": 46,
    "sourcePage": 61
  },
  {
    "name": "Time Raider",
    "bookPage": 48,
    "sourcePage": 63
  },
  {
    "name": "Wode Elf",
    "bookPage": 32,
    "sourcePage": 47
  }
] as const

export const careers = [
  {
    "name": "Agent",
    "bookPage": 59,
    "sourcePage": 74
  },
  {
    "name": "Aristocrat",
    "bookPage": 59,
    "sourcePage": 74
  },
  {
    "name": "Artisan",
    "bookPage": 60,
    "sourcePage": 75
  },
  {
    "name": "Beggar",
    "bookPage": 60,
    "sourcePage": 75
  },
  {
    "name": "Criminal",
    "bookPage": 61,
    "sourcePage": 76
  },
  {
    "name": "Disciple",
    "bookPage": 61,
    "sourcePage": 76
  },
  {
    "name": "Explorer",
    "bookPage": 62,
    "sourcePage": 77
  },
  {
    "name": "Farmer",
    "bookPage": 62,
    "sourcePage": 77
  },
  {
    "name": "Gladiator",
    "bookPage": 63,
    "sourcePage": 78
  },
  {
    "name": "Laborer",
    "bookPage": 63,
    "sourcePage": 78
  },
  {
    "name": "Mage’s Apprentice",
    "bookPage": 64,
    "sourcePage": 79
  },
  {
    "name": "Performer",
    "bookPage": 64,
    "sourcePage": 79
  },
  {
    "name": "Politician",
    "bookPage": 65,
    "sourcePage": 80
  },
  {
    "name": "Sage",
    "bookPage": 65,
    "sourcePage": 80
  },
  {
    "name": "Sailor",
    "bookPage": 66,
    "sourcePage": 81
  },
  {
    "name": "Soldier",
    "bookPage": 66,
    "sourcePage": 81
  },
  {
    "name": "Warden",
    "bookPage": 67,
    "sourcePage": 82
  },
  {
    "name": "Watch Officer",
    "bookPage": 67,
    "sourcePage": 82
  }
] as const

export const kits = [
  {
    "name": "Arcane Archer",
    "bookPage": 219,
    "sourcePage": 234
  },
  {
    "name": "Battlemind",
    "bookPage": 219,
    "sourcePage": 234
  },
  {
    "name": "Cloak and Dagger",
    "bookPage": 219,
    "sourcePage": 234
  },
  {
    "name": "Dual Wielder",
    "bookPage": 220,
    "sourcePage": 235
  },
  {
    "name": "Guisarmier",
    "bookPage": 220,
    "sourcePage": 235
  },
  {
    "name": "Martial Artist",
    "bookPage": 220,
    "sourcePage": 235
  },
  {
    "name": "Mountain",
    "bookPage": 220,
    "sourcePage": 235
  },
  {
    "name": "Panther",
    "bookPage": 221,
    "sourcePage": 236
  },
  {
    "name": "Pugilist",
    "bookPage": 221,
    "sourcePage": 236
  },
  {
    "name": "Raider",
    "bookPage": 221,
    "sourcePage": 236
  },
  {
    "name": "Ranger",
    "bookPage": 221,
    "sourcePage": 236
  },
  {
    "name": "Rapid-Fire",
    "bookPage": 222,
    "sourcePage": 237
  },
  {
    "name": "Retiarius",
    "bookPage": 222,
    "sourcePage": 237
  },
  {
    "name": "Shining Armor",
    "bookPage": 222,
    "sourcePage": 237
  },
  {
    "name": "Sniper",
    "bookPage": 223,
    "sourcePage": 238
  },
  {
    "name": "Spellsword",
    "bookPage": 223,
    "sourcePage": 238
  },
  {
    "name": "Stick and Robe",
    "bookPage": 223,
    "sourcePage": 238
  },
  {
    "name": "Swashbuckler",
    "bookPage": 223,
    "sourcePage": 238
  },
  {
    "name": "Sword and Board",
    "bookPage": 224,
    "sourcePage": 239
  },
  {
    "name": "Warrior Priest",
    "bookPage": 224,
    "sourcePage": 239
  },
  {
    "name": "Whirlwind",
    "bookPage": 224,
    "sourcePage": 239
  }
] as const

export const complications = [
  {
    "name": "Advanced Studies",
    "bookPage": 234,
    "sourcePage": 249
  },
  {
    "name": "Amnesia",
    "bookPage": 234,
    "sourcePage": 249
  },
  {
    "name": "Animal Form",
    "bookPage": 234,
    "sourcePage": 249
  },
  {
    "name": "Antihero",
    "bookPage": 234,
    "sourcePage": 249
  },
  {
    "name": "Artifact Bonded",
    "bookPage": 234,
    "sourcePage": 249
  },
  {
    "name": "Bereaved",
    "bookPage": 234,
    "sourcePage": 249
  },
  {
    "name": "Betrothed",
    "bookPage": 234,
    "sourcePage": 249
  },
  {
    "name": "Chaos Touched",
    "bookPage": 235,
    "sourcePage": 250
  },
  {
    "name": "Chosen One",
    "bookPage": 235,
    "sourcePage": 250
  },
  {
    "name": "Consuming Interest",
    "bookPage": 235,
    "sourcePage": 250
  },
  {
    "name": "Corrupted Mentor",
    "bookPage": 235,
    "sourcePage": 250
  },
  {
    "name": "Coward",
    "bookPage": 235,
    "sourcePage": 250
  },
  {
    "name": "Crash Landed",
    "bookPage": 235,
    "sourcePage": 250
  },
  {
    "name": "Cult Victim",
    "bookPage": 235,
    "sourcePage": 250
  },
  {
    "name": "Curse of Caution",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Curse of Immortality",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Curse of Misfortune",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Curse of Poverty",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Curse of Punishment",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Curse of Stone",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Cursed Weapon",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Disgraced",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Dragon Dreams",
    "bookPage": 236,
    "sourcePage": 251
  },
  {
    "name": "Elemental Inside",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Evanesceria",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Exile",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Fallen Immortal",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Famous Relative",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Feytouched",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Fiery Ideal",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Fire and Chaos",
    "bookPage": 237,
    "sourcePage": 252
  },
  {
    "name": "Following in the Footsteps",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Forbidden Romance",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Frostheart",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Getting Too Old for This",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Gnoll-Mauled",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Greening",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Grifter",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Grounded",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Guilty Conscience",
    "bookPage": 238,
    "sourcePage": 253
  },
  {
    "name": "Hawk Rider",
    "bookPage": 239,
    "sourcePage": 254
  },
  {
    "name": "Host Body",
    "bookPage": 239,
    "sourcePage": 254
  },
  {
    "name": "Hunted",
    "bookPage": 239,
    "sourcePage": 254
  },
  {
    "name": "Hunter",
    "bookPage": 239,
    "sourcePage": 254
  },
  {
    "name": "Indebted",
    "bookPage": 239,
    "sourcePage": 254
  },
  {
    "name": "Infernal Contract",
    "bookPage": 239,
    "sourcePage": 254
  },
  {
    "name": "Infernal Contract … But, Like, Bad",
    "bookPage": 239,
    "sourcePage": 254
  },
  {
    "name": "Ivory Tower",
    "bookPage": 240,
    "sourcePage": 255
  },
  {
    "name": "Lifebonded",
    "bookPage": 240,
    "sourcePage": 255
  },
  {
    "name": "Lightning Soul",
    "bookPage": 240,
    "sourcePage": 255
  },
  {
    "name": "Loner",
    "bookPage": 240,
    "sourcePage": 255
  },
  {
    "name": "Lost Your Head",
    "bookPage": 240,
    "sourcePage": 255
  },
  {
    "name": "Lost in Time",
    "bookPage": 240,
    "sourcePage": 255
  },
  {
    "name": "Lucky",
    "bookPage": 240,
    "sourcePage": 255
  },
  {
    "name": "Master Chef",
    "bookPage": 241,
    "sourcePage": 256
  },
  {
    "name": "Meddling Butler",
    "bookPage": 241,
    "sourcePage": 256
  },
  {
    "name": "Medium",
    "bookPage": 241,
    "sourcePage": 256
  },
  {
    "name": "Medusa Blood",
    "bookPage": 241,
    "sourcePage": 256
  },
  {
    "name": "Misunderstood",
    "bookPage": 241,
    "sourcePage": 256
  },
  {
    "name": "Mundane",
    "bookPage": 241,
    "sourcePage": 256
  },
  {
    "name": "Outlaw",
    "bookPage": 241,
    "sourcePage": 256
  },
  {
    "name": "Pirate",
    "bookPage": 242,
    "sourcePage": 257
  },
  {
    "name": "Preacher",
    "bookPage": 242,
    "sourcePage": 257
  },
  {
    "name": "Primordial Sickness",
    "bookPage": 242,
    "sourcePage": 257
  },
  {
    "name": "Prisoner of the Synlirii",
    "bookPage": 242,
    "sourcePage": 257
  },
  {
    "name": "Promising Apprentice",
    "bookPage": 242,
    "sourcePage": 257
  },
  {
    "name": "Psychic Eruption",
    "bookPage": 242,
    "sourcePage": 257
  },
  {
    "name": "Raised by Beasts",
    "bookPage": 242,
    "sourcePage": 257
  },
  {
    "name": "Refugee",
    "bookPage": 243,
    "sourcePage": 258
  },
  {
    "name": "Rival",
    "bookPage": 243,
    "sourcePage": 258
  },
  {
    "name": "Rogue Talent",
    "bookPage": 243,
    "sourcePage": 258
  },
  {
    "name": "Runaway",
    "bookPage": 243,
    "sourcePage": 258
  },
  {
    "name": "Searching for a Cure",
    "bookPage": 243,
    "sourcePage": 258
  },
  {
    "name": "Secret Identity",
    "bookPage": 243,
    "sourcePage": 258
  },
  {
    "name": "Secret Twin",
    "bookPage": 243,
    "sourcePage": 258
  },
  {
    "name": "Self-Taught",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Sewer Folk",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Shadow Born",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Shared Spirit",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Shattered Legacy",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Shipwrecked",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Sibling’s Shield",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Silent Sentinel",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Slight Case of Lycanthropy",
    "bookPage": 244,
    "sourcePage": 259
  },
  {
    "name": "Stolen Face",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Strange Inheritance",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Stripped of Rank",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Thrill Seeker",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Vampire Scion",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Voice in Your Head",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Vow of Duty",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Vow of Honesty",
    "bookPage": 245,
    "sourcePage": 260
  },
  {
    "name": "Waking Dreams",
    "bookPage": 246,
    "sourcePage": 261
  },
  {
    "name": "War Dog Collar",
    "bookPage": 246,
    "sourcePage": 261
  },
  {
    "name": "War of Assassins",
    "bookPage": 246,
    "sourcePage": 261
  },
  {
    "name": "Ward",
    "bookPage": 246,
    "sourcePage": 261
  },
  {
    "name": "Waterborn",
    "bookPage": 246,
    "sourcePage": 261
  },
  {
    "name": "Wodewalker",
    "bookPage": 247,
    "sourcePage": 262
  },
  {
    "name": "Wrathful Spirit",
    "bookPage": 247,
    "sourcePage": 262
  },
  {
    "name": "Wrongly Imprisoned",
    "bookPage": 247,
    "sourcePage": 262
  }
] as const

export const classes = [
  {
    "name": "Censor",
    "bookPage": 79,
    "sourcePage": 94,
    "fixed": [
      "Fuerza",
      "Presencia"
    ],
    "kitCount": 1
  },
  {
    "name": "Conduit",
    "bookPage": 95,
    "sourcePage": 110,
    "fixed": [
      "Intuición"
    ],
    "kitCount": 0
  },
  {
    "name": "Elementalist",
    "bookPage": 113,
    "sourcePage": 128,
    "fixed": [
      "Razón"
    ],
    "kitCount": 0
  },
  {
    "name": "Fury",
    "bookPage": 131,
    "sourcePage": 146,
    "fixed": [
      "Fuerza",
      "Agilidad"
    ],
    "kitCount": 1
  },
  {
    "name": "Null",
    "bookPage": 147,
    "sourcePage": 162,
    "fixed": [
      "Agilidad",
      "Intuición"
    ],
    "kitCount": 0
  },
  {
    "name": "Shadow",
    "bookPage": 161,
    "sourcePage": 176,
    "fixed": [
      "Agilidad"
    ],
    "kitCount": 1
  },
  {
    "name": "Tactician",
    "bookPage": 175,
    "sourcePage": 190,
    "fixed": [
      "Fuerza",
      "Razón"
    ],
    "kitCount": 2
  },
  {
    "name": "Talent",
    "bookPage": 187,
    "sourcePage": 202,
    "fixed": [
      "Razón",
      "Presencia"
    ],
    "kitCount": 0
  },
  {
    "name": "Troubadour",
    "bookPage": 203,
    "sourcePage": 218,
    "fixed": [
      "Agilidad",
      "Presencia"
    ],
    "kitCount": 1
  }
] as const

export const environments = ['Nomadic', 'Rural', 'Secluded', 'Urban', 'Wilderness'] as const
export const organizations = ['Bureaucratic', 'Communal'] as const
export const upbringings = ['Academic', 'Creative', 'Labor', 'Lawless', 'Martial', 'Noble'] as const
export const cultureLanguages = ['Anjali', 'Axiomatic', 'Caelian', 'Filliaric', 'The First Language', 'Hyrallic', 'Illyvric', 'Kalliak', 'Kethaic', 'Khelt', 'Khoursirian', 'High Kuric', 'Low Kuric', 'Mindspeech', 'Proto-Ctholl', 'Szetch', 'Tholl', 'Urollialic', 'Variac', 'Vastariax', 'Vhoric', 'Voll', 'Yllyric', 'Za’hariax', 'Zaliac', 'Uvalic', 'Higaran', 'Oaxuatl', 'Khemharic', 'Phaedran', 'Riojan', 'Vaniric', 'Vaslorian', 'Ananjali', 'High Rhyvian', 'Khamish', 'Kheltivari', 'Low Rhyvian', 'Old Variac'] as const
