-- ============================================================
-- RzRevelation — seed data
-- Run AFTER 001_schema.sql in Supabase SQL editor
-- ============================================================

insert into public.teams (id, slug, name, tagline, blurb, accent, sort_order) values
  ('00000000-0000-0000-0000-000000000001',
   'revenants', 'Rz Revenants', 'No mercy',
   'The veteran squad — heavy aggression, deep map knowledge, and zero patience. Revenants punish mistakes before you know you made one.',
   'sky', 1),
  ('00000000-0000-0000-0000-000000000002',
   'recharge', 'Rz Recharge', 'The proving ground',
   'Our academy roster — hungry, fast-improving, and one breakout split away from the main stage. Recharge is where the next Rz revelation gets made.',
   'sky', 2),
  ('00000000-0000-0000-0000-000000000003',
   'revelation', 'Rz Revelation', 'The flagship',
   'The banner roster. Revelation carries Rz into the biggest Marvel Rivals events — the lineup the org is built around and the one to beat.',
   'orange', 3)
on conflict (id) do nothing;

insert into public.players
  (id, team_id, gamertag, full_name, role, main_hero, accent, bio, sort_order)
values
  -- Revenants
  ('rn-wraith',  '00000000-0000-0000-0000-000000000001', 'Sib',     'Kai Mwangi',    'Vanguard',   'Dr. Strange',     'sky',    'Dives the backline and drags it down with him. Pure disruption, every fight.',                      1),
  ('rn-tomb',    '00000000-0000-0000-0000-000000000001', 'Zonix',   'Ivan Petrov',   'Vanguard',   'Hulk',            'orange', 'Locks down zones and makes territory cost blood. The squad fights on Tomb''s terms.',              2),
  ('rn-riot',    '00000000-0000-0000-0000-000000000001', 'Art',     'Elena Costa',   'Duelist',    'Magik',           'sky',    'Owns the air. Riot rains damage from angles ground teams can''t answer.',                        3),
  ('rn-cinder',  '00000000-0000-0000-0000-000000000001', 'Fallen',  'Noah Brandt',   'Duelist',    'Iron Man',        'orange', 'Deletes clustered teams in a blink. Punishes every grouped push instantly.',                      4),
  ('rn-hex',     '00000000-0000-0000-0000-000000000001', 'Levi',    'Yuki Sato',     'Strategist', 'Invisible Woman', 'sky',    'Heals and flips fights with one well-timed swap. The glue holding the aggression together.',      5),
  ('rn-relic',   '00000000-0000-0000-0000-000000000001', 'Falkiri', 'Omar Haddad',   'Strategist', 'Loki',            'orange', 'Sneaky sustain and the occasional match-ending swallow. Underestimate Relic once.',                6),
  -- Recharge
  ('rc-surge',   '00000000-0000-0000-0000-000000000002', 'Surge',   'Devon Park',    'Vanguard',   'Doctor Strange',  'sky',    'Anchors the dive and portals the team out of trouble. Reads space two beats ahead of everyone else.', 1),
  ('rc-bulwark', '00000000-0000-0000-0000-000000000002', 'Bulwark', 'Theo Lindqvist','Vanguard',   'Groot',           'orange', 'Walls off chokes and never gives ground. If a site holds, Bulwark built the fence.',               2),
  ('rc-nova',    '00000000-0000-0000-0000-000000000002', 'Nova',    'Maya Reyes',    'Duelist',    'Storm',           'sky',    'Tempo from the sky. Opens fights with pressure and closes them with positioning.',                  3),
  ('rc-quill',   '00000000-0000-0000-0000-000000000002', 'Quill',   'Jonas Eklund',  'Duelist',    'Star-Lord',       'orange', 'Slippery, aggressive, and impossible to pin down mid-fight. Lives for the flank.',                 4),
  ('rc-lull',    '00000000-0000-0000-0000-000000000002', 'Lull',    'Aria Haddad',   'Strategist', 'Luna Snow',       'sky',    'Keeps the squad alive through chaos and times the freeze when it matters most.',                   5),
  ('rc-patch',   '00000000-0000-0000-0000-000000000002', 'Patch',   'Leo Fischer',   'Strategist', 'Rocket Raccoon',  'orange', 'Pocket healing and revives nobody expects. The reason Recharge wins overtime.',                    6),
  -- Revelation
  ('rv-vyper',   '00000000-0000-0000-0000-000000000003', 'Vyper',   'Marco Adeyemi', 'Vanguard',   'Magneto',         'orange', 'Shotcaller and frontline. Calls the comp, sets the tempo, and bends every fight toward Rz.',       1),
  ('rv-atlas',   '00000000-0000-0000-0000-000000000003', 'Atlas',   'Sam Okafor',    'Vanguard',   'Hulk',            'sky',    'Dive engine. When Atlas jumps, the team jumps — and the enemy backline scatters.',                 2),
  ('rv-echo',    '00000000-0000-0000-0000-000000000003', 'Echo',    'Lena Vorisek',  'Duelist',    'Hela',            'orange', 'Surgical from range. Picks the angle nobody covered and the kill nobody saw coming.',              3),
  ('rv-specter', '00000000-0000-0000-0000-000000000003', 'Specter', 'Aiko Tanaka',   'Duelist',    'Black Panther',   'sky',    'In, out, three kills, gone. The flank threat that warps how teams have to defend.',                4),
  ('rv-halo',    '00000000-0000-0000-0000-000000000003', 'Halo',    'Priya Nair',    'Strategist', 'Mantis',          'orange', 'Perfect uptime and clutch sleeps. The calm voice on comms when the round goes sideways.',          5),
  ('rv-sol',     '00000000-0000-0000-0000-000000000003', 'Sol',     'Diego Salas',   'Strategist', 'Adam Warlock',    'sky',    'Resurrects the round single-handed. Sol turns lost fights into highlight reels.',                  6)
on conflict (id) do nothing;

-- Seeded without author_id; assign to a real profile later via Supabase dashboard
insert into public.announcements (id, title, category, excerpt, published_at) values
  ('revelation-invitational',
   'Rz Revelation tops its group at the Marvel Rivals Summer Invitational',
   'Tournament',
   'A clean 3–0 group stage puts the flagship roster into the upper bracket. Here''s how the dive comps landed and who Revelation faces next.',
   '2026-06-24T12:00:00Z'),
  ('recharge-roster',
   'Rz Recharge finalizes its six for the academy split',
   'Roster',
   'Two new signings round out the Recharge lineup ahead of the academy season. Meet the players and the strat behind the pickups.',
   '2026-06-18T12:00:00Z'),
  ('community-night',
   'Community Night: Marvel Rivals customs with all three squads',
   'Community',
   'Queue up against Recharge, Revelation, and Revenants this Friday. Prizes, drops, and a few players streaming their POV. Grab a slot in the Discord.',
   '2026-06-12T12:00:00Z')
on conflict (id) do nothing;
