import type { Player } from '../types/player'

function p(
  id: string,
  name: string,
  position: Player['position'],
  subPosition: Player['subPosition'],
  birthYear: number,
  currentClub: string,
): Player {
  return { id, name, position, subPosition, birthYear, currentClub }
}

export const PLAYERS: Player[] = [
  // Goalkeepers
  p('gk-trafford', 'James Trafford', 'GK', 'GK', 2002, 'Man City'),
  p('gk-beadle', 'James Beadle', 'GK', 'GK', 2003, 'Brighton'),
  p('gk-ramsdale', 'Aaron Ramsdale', 'GK', 'GK', 1998, 'Newcastle'),
  p('gk-henderson', 'Dean Henderson', 'GK', 'GK', 1997, 'Crystal Palace'),
  p('gk-pickford', 'Jordan Pickford', 'GK', 'GK', 1994, 'Everton'),
  p('gk-woodman', 'Freddie Woodman', 'GK', 'GK', 1997, 'Preston'),

  // Defenders
  p('def-guehi', 'Marc Guéhi', 'DEF', 'CB', 2000, 'Crystal Palace'),
  p('def-colwill', 'Levi Colwill', 'DEF', 'CB', 2003, 'Chelsea'),
  p('def-quansah', 'Jarell Quansah', 'DEF', 'CB', 2003, 'Leverkusen'),
  p('def-stones', 'John Stones', 'DEF', 'CB', 1994, 'Man City'),
  p('def-konsa', 'Ezri Konsa', 'DEF', 'CB', 1997, 'Aston Villa'),
  p('def-chalobah', 'Trevoh Chalobah', 'DEF', 'CB', 1999, 'Chelsea'),
  p('def-cresswell', 'Charlie Cresswell', 'DEF', 'CB', 2003, 'Leeds'),
  p('def-anderson', 'Jarrad Branthwaite', 'DEF', 'CB', 2002, 'Everton'),
  p('def-livramento', 'Tino Livramento', 'DEF', 'RB', 2002, 'Newcastle'),
  p('def-james', 'Reece James', 'DEF', 'RB', 1999, 'Chelsea'),
  p('def-alexander-arnold', 'Trent Alexander-Arnold', 'DEF', 'RB', 1998, 'Real Madrid'),
  p('def-white', 'Ben White', 'DEF', 'RB', 1997, 'Arsenal'),
  p('def-lewis', 'Rico Lewis', 'DEF', 'RB', 2004, 'Man City'),
  p('def-shaw', 'Luke Shaw', 'DEF', 'LB', 1995, 'Man Utd'),
  p('def-hall', 'Lewis Hall', 'DEF', 'LB', 2004, 'Newcastle'),
  p('def-lewis-skelly', 'Myles Lewis-Skelly', 'DEF', 'LB', 2006, 'Arsenal'),
  p('def-gilchrist', 'Alfie Gilchrist', 'DEF', 'RB', 2003, 'Chelsea'),
  p('def-oreilly', "Nico O'Reilly", 'DEF', 'LB', 2005, 'Man City'),
  p('def-trippier', 'Kieran Trippier', 'DEF', 'RB', 1990, 'Newcastle'),
  p('def-wan-bissaka', 'Aaron Wan-Bissaka', 'DEF', 'RB', 1997, 'West Ham'),
  p('def-harwood-bellis', 'Taylor Harwood-Bellis', 'DEF', 'CB', 2002, 'Southampton'),
  p('def-spence', 'Djed Spence', 'DEF', 'LB', 2000, 'Spurs'),

  // Midfielders
  p('mid-bellingham', 'Jude Bellingham', 'MID', 'CM', 2003, 'Real Madrid'),
  p('mid-rice', 'Declan Rice', 'MID', 'CDM', 1999, 'Arsenal'),
  p('mid-foden', 'Phil Foden', 'MID', 'CAM', 2000, 'Man City'),
  p('mid-palmer', 'Cole Palmer', 'MID', 'CAM', 2002, 'Chelsea'),
  p('mid-mainoo', 'Kobbie Mainoo', 'MID', 'CM', 2005, 'Man Utd'),
  p('mid-wharton', 'Adam Wharton', 'MID', 'CDM', 2004, 'Crystal Palace'),
  p('mid-gallagher', 'Conor Gallagher', 'MID', 'CM', 2000, 'Atletico Madrid'),
  p('mid-elliott', 'Harvey Elliott', 'MID', 'CM', 2003, 'Liverpool'),
  p('mid-gibbs-white', 'Morgan Gibbs-White', 'MID', 'CAM', 2000, 'Nottm Forest'),
  p('mid-eze', 'Eberechi Eze', 'MID', 'CAM', 1998, 'Arsenal'),
  p('mid-jones', 'Curtis Jones', 'MID', 'CM', 2001, 'Liverpool'),
  p('mid-anderson', 'Elliot Anderson', 'MID', 'CM', 2002, 'Nottm Forest'),
  p('mid-maddison', 'James Maddison', 'MID', 'CAM', 1996, 'Spurs'),
  p('mid-bellingham-jobe', 'Jobe Bellingham', 'MID', 'CM', 2005, 'Dortmund'),
  p('mid-cook', 'Lewis Cook', 'MID', 'CDM', 1997, 'Bournemouth'),
  p('mid-henderson', 'Jordan Henderson', 'MID', 'CM', 1990, 'Brentford'),
  p('mid-gray', 'Archie Gray', 'MID', 'CM', 2006, 'Spurs'),
  p('mid-nwaneri', 'Ethan Nwaneri', 'MID', 'CAM', 2007, 'Arsenal'),
  p('mid-alex-scott', 'Alex Scott', 'MID', 'CM', 2003, 'Bournemouth'),
  p('mid-mount', 'Mason Mount', 'MID', 'CAM', 1999, 'Man Utd'),
  p('mid-phillips', 'Kalvin Phillips', 'MID', 'CDM', 1995, 'Ipswich'),

  // Forwards
  p('fwd-saka', 'Bukayo Saka', 'FWD', 'RW', 2001, 'Arsenal'),
  p('fwd-madueke', 'Noni Madueke', 'FWD', 'RW', 2002, 'Arsenal'),
  p('fwd-gordon', 'Anthony Gordon', 'FWD', 'LW', 2001, 'Newcastle'),
  p('fwd-bowen', 'Jarrod Bowen', 'FWD', 'RW', 1996, 'West Ham'),
  p('fwd-watkins', 'Ollie Watkins', 'FWD', 'ST', 1995, 'Aston Villa'),
  p('fwd-kane', 'Harry Kane', 'FWD', 'ST', 1993, 'Bayern Munich'),
  p('fwd-toney', 'Ivan Toney', 'FWD', 'ST', 1996, 'Al-Ahli'),
  p('fwd-solanke', 'Dominic Solanke', 'FWD', 'ST', 1997, 'Spurs'),
  p('fwd-delap', 'Liam Delap', 'FWD', 'ST', 2003, 'Chelsea'),
  p('fwd-gittens', 'Jamie Bynoe-Gittens', 'FWD', 'LW', 2004, 'Dortmund'),
  p('fwd-scarlett', 'Dane Scarlett', 'FWD', 'ST', 2004, 'Spurs'),
  p('fwd-lankshear', 'Will Lankshear', 'FWD', 'ST', 2004, 'Spurs'),
  p('fwd-wilson', 'Callum Wilson', 'FWD', 'ST', 1992, 'West Ham'),
  p('fwd-barnes', 'Harvey Barnes', 'FWD', 'LW', 1997, 'Newcastle'),
  p('fwd-amo-ameyaw', 'Sam Amo-Ameyaw', 'FWD', 'RW', 2006, 'Southampton'),
  p('fwd-sterling', 'Raheem Sterling', 'FWD', 'LW', 1994, 'Arsenal'),
  p('fwd-rashford', 'Marcus Rashford', 'FWD', 'LW', 1997, 'Aston Villa'),
  p('fwd-nketiah', 'Eddie Nketiah', 'FWD', 'ST', 1999, 'Crystal Palace'),
  p('fwd-broja', 'Armando Broja', 'FWD', 'ST', 2001, 'Burnley'),
]

export const PLAYERS_BY_ID = Object.fromEntries(PLAYERS.map((player) => [player.id, player])) as Record<
  string,
  Player
>

export function getPlayer(id: string): Player | undefined {
  return PLAYERS_BY_ID[id]
}
