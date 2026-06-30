/* Placeholder content for the skeleton.
   In a later phase this gets replaced by data from Supabase tables. */

export const ORG = {
  name: 'RzRevelation',
  short: 'Rz',
  game: 'Marvel Rivals',
  tagline:
    'An RzRevelation esports house competing in Marvel Rivals — three rosters, one community, one climb.',
}

export const socials = {
  discord: 'https://discord.gg/rzrevelation',
  x: 'https://x.com/rzrevelation',
  twitch: 'https://twitch.tv/rzrevelation',
  youtube: 'https://youtube.com/@rzrevelation',
  instagram: 'https://instagram.com/rzrevelation',
}

export type Role = 'Vanguard' | 'Duelist' | 'Strategist'

export type Player = {
  id: string
  gamertag: string
  name: string
  role: Role
  main: string // signature Marvel Rivals hero
  accent: 'orange' | 'sky'
  bio: string
}

export type Team = {
  slug: string
  name: string
  tagline: string
  blurb: string
  accent: 'orange' | 'sky'
  roster: Player[]
}

export const teams: Team[] = [
  {
    slug: 'revenants',
    name: 'Rz Revenants',
    tagline: 'No mercy',
    accent: 'sky',
    blurb:
      'The veteran squad — heavy aggression, deep map knowledge, and zero patience. Revenants punish mistakes before you know you made one.',
    roster: [
      { id: 'rn-wraith', gamertag: 'Sib', name: 'Kai Mwangi', role: 'Vanguard', main: 'Dr. Strange', accent: 'sky', bio: 'Dives the backline and drags it down with him. Pure disruption, every fight.' },
      { id: 'rn-tomb', gamertag: 'Zonix', name: 'Ivan Petrov', role: 'Vanguard', main: 'Hulk', accent: 'orange', bio: 'Locks down zones and makes territory cost blood. The squad fights on Tomb’s terms.' },
      { id: 'rn-riot', gamertag: 'Art', name: 'Elena Costa', role: 'Duelist', main: 'Magik', accent: 'sky', bio: 'Owns the air. Riot rains damage from angles ground teams can’t answer.' },
      { id: 'rn-cinder', gamertag: 'Fallen', name: 'Noah Brandt', role: 'Duelist', main: 'Iron Man', accent: 'orange', bio: 'Deletes clustered teams in a blink. Punishes every grouped push instantly.' },
      { id: 'rn-hex', gamertag: 'Levi', name: 'Yuki Sato', role: 'Strategist', main: 'Invisible Woman', accent: 'sky', bio: 'Heals and flips fights with one well-timed swap. The glue holding the aggression together.' },
      { id: 'rn-relic', gamertag: 'Falkiri', name: 'Omar Haddad', role: 'Strategist', main: 'Loki', accent: 'orange', bio: 'Sneaky sustain and the occasional match-ending swallow. Underestimate Relic once.' },
    ],
  },
  {
    slug: 'recharge',
    name: 'Rz Recharge',
    tagline: 'The proving ground',
    accent: 'sky',
    blurb:
      'Our academy roster — hungry, fast-improving, and one breakout split away from the main stage. Recharge is where the next Rz revelation gets made.',
    roster: [
      { id: 'rc-surge', gamertag: 'Surge', name: 'Devon Park', role: 'Vanguard', main: 'Doctor Strange', accent: 'sky', bio: 'Anchors the dive and portals the team out of trouble. Reads space two beats ahead of everyone else.' },
      { id: 'rc-bulwark', gamertag: 'Bulwark', name: 'Theo Lindqvist', role: 'Vanguard', main: 'Groot', accent: 'orange', bio: 'Walls off chokes and never gives ground. If a site holds, Bulwark built the fence.' },
      { id: 'rc-nova', gamertag: 'Nova', name: 'Maya Reyes', role: 'Duelist', main: 'Storm', accent: 'sky', bio: 'Tempo from the sky. Opens fights with pressure and closes them with positioning.' },
      { id: 'rc-quill', gamertag: 'Quill', name: 'Jonas Eklund', role: 'Duelist', main: 'Star-Lord', accent: 'orange', bio: 'Slippery, aggressive, and impossible to pin down mid-fight. Lives for the flank.' },
      { id: 'rc-lull', gamertag: 'Lull', name: 'Aria Haddad', role: 'Strategist', main: 'Luna Snow', accent: 'sky', bio: 'Keeps the squad alive through chaos and times the freeze when it matters most.' },
      { id: 'rc-patch', gamertag: 'Patch', name: 'Leo Fischer', role: 'Strategist', main: 'Rocket Raccoon', accent: 'orange', bio: 'Pocket healing and revives nobody expects. The reason Recharge wins overtime.' },
    ],
  },
  {
    slug: 'revelation',
    name: 'Rz Revelation',
    tagline: 'The flagship',
    accent: 'orange',
    blurb:
      'The banner roster. Revelation carries Rz into the biggest Marvel Rivals events — the lineup the org is built around and the one to beat.',
    roster: [
      { id: 'rv-vyper', gamertag: 'Vyper', name: 'Marco Adeyemi', role: 'Vanguard', main: 'Magneto', accent: 'orange', bio: 'Shotcaller and frontline. Calls the comp, sets the tempo, and bends every fight toward Rz.' },
      { id: 'rv-atlas', gamertag: 'Atlas', name: 'Sam Okafor', role: 'Vanguard', main: 'Hulk', accent: 'sky', bio: 'Dive engine. When Atlas jumps, the team jumps — and the enemy backline scatters.' },
      { id: 'rv-echo', gamertag: 'Echo', name: 'Lena Vorisek', role: 'Duelist', main: 'Hela', accent: 'orange', bio: 'Surgical from range. Picks the angle nobody covered and the kill nobody saw coming.' },
      { id: 'rv-specter', gamertag: 'Specter', name: 'Aiko Tanaka', role: 'Duelist', main: 'Black Panther', accent: 'sky', bio: 'In, out, three kills, gone. The flank threat that warps how teams have to defend.' },
      { id: 'rv-halo', gamertag: 'Halo', name: 'Priya Nair', role: 'Strategist', main: 'Mantis', accent: 'orange', bio: 'Perfect uptime and clutch sleeps. The calm voice on comms when the round goes sideways.' },
      { id: 'rv-sol', gamertag: 'Sol', name: 'Diego Salas', role: 'Strategist', main: 'Adam Warlock', accent: 'sky', bio: 'Resurrects the round single-handed. Sol turns lost fights into highlight reels.' },
    ],
  },
]

export function getTeam(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug)
}

export type Product = {
  id: string
  name: string
  category: 'Apparel' | 'Desk' | 'Accessory'
  price: number
  blurb: string
  accent: 'orange' | 'sky'
}

export const products: Product[] = [
  {
    id: 'pro-jersey',
    name: 'Rz Pro Jersey',
    category: 'Apparel',
    price: 64,
    blurb: 'Official match-day jersey in sublimated navy with sky and orange detailing. The kit all three rosters compete in.',
    accent: 'orange',
  },
  {
    id: 'logo-hoodie',
    name: 'Rz Logo Hoodie',
    category: 'Apparel',
    price: 58,
    blurb: 'Heavyweight fleece hoodie with an embroidered Rz crest. Built for late queues and longer ranked nights.',
    accent: 'sky',
  },
  {
    id: 'xl-desk-mat',
    name: 'Rz XL Desk Mat',
    category: 'Desk',
    price: 32,
    blurb: 'Extended 900×400mm mat with a stitched edge and a low-friction surface tuned for tracking and flicks.',
    accent: 'orange',
  },
  {
    id: 'crest-keychain',
    name: 'Rz Crest Keychain',
    category: 'Accessory',
    price: 12,
    blurb: 'Die-cast enamel Rz crest in navy and orange. Small flex, big energy.',
    accent: 'sky',
  },
]

export type Announcement = {
  id: string
  title: string
  category: string
  date: string
  author: string
  excerpt: string
}

export const announcements: Announcement[] = [
  {
    id: 'revelation-invitational',
    title: 'Rz Revelation tops its group at the Marvel Rivals Summer Invitational',
    category: 'Tournament',
    date: 'Jun 24, 2026',
    author: 'Rz Staff',
    excerpt:
      'A clean 3–0 group stage puts the flagship roster into the upper bracket. Here’s how the dive comps landed and who Revelation faces next.',
  },
  {
    id: 'recharge-roster',
    title: 'Rz Recharge finalizes its six for the academy split',
    category: 'Roster',
    date: 'Jun 18, 2026',
    author: 'Rz Staff',
    excerpt:
      'Two new signings round out the Recharge lineup ahead of the academy season. Meet the players and the strat behind the pickups.',
  },
  {
    id: 'community-night',
    title: 'Community Night: Marvel Rivals customs with all three squads',
    category: 'Community',
    date: 'Jun 12, 2026',
    author: 'Rz Staff',
    excerpt:
      'Queue up against Recharge, Revelation, and Revenants this Friday. Prizes, drops, and a few players streaming their POV. Grab a slot in the Discord.',
  },
]
