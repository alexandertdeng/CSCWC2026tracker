/* =============================================================================
   WORLD CUP 2026 — GOALS CONTEST CONFIG
   -----------------------------------------------------------------------------
   This is the ONLY file you need to edit to run your contest.
   Edit it, commit, and GitHub Pages will redeploy automatically.

   HOW IT WORKS
   - Give each participant a "nickname" and assign them any number of teams.
   - The tracker sums every goal those teams score across the whole tournament,
     INCLUDING penalty-shootout goals, and ranks the nicknames.
   - Team names must match the official feed EXACTLY (see VALID_TEAM_NAMES below).
     The page will flag any name it doesn't recognize so typos are easy to catch.
   ============================================================================= */

const CONFIG = {
  // Title shown at the top of the page.
  contestName: "Office World Cup 2026 — Goals Contest",

  // Count penalty-shootout goals toward each team's total? (You asked for yes.)
  // Note: penalties scored DURING normal/extra time are already in the score and
  // are always counted. This toggle only affects tie-breaker SHOOTOUT goals.
  includeShootoutGoals: true,

  // Auto-refresh the data every N minutes (the source updates ~once a day).
  refreshMinutes: 30,

  // Official data feed (public domain, no API key). Leave as-is unless you want
  // the faster-updating community mirror — see README.
  dataUrl: "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json",

  // ---------------------------------------------------------------------------
  // PARTICIPANTS — edit this list.
  // Each entry: { nickname: "Name", teams: ["Team A", "Team B", ...] }
  // "teams" can hold ANY number of teams (your office rule is 4 each).
  // ---------------------------------------------------------------------------
entries: [
  {
    nickname: "Mike",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/Mike.jpg",
    teams: ["Spain", "Jordan", "New Zealand", "Uzbekistan"]
  },
  {
    nickname: "Poppy",
    imageUrl: "https://www.nhsfellowship.ai/images/faculty/poppy-cohen.jpg",
    teams: ["Ivory Coast", "New Zealand", "Norway", "Uzbekistan"]
  },
  {
    nickname: "James",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/james.jpeg",
    teams: ["England", "Scotland", "USA", "Cape Verde"]
  },
  {
    nickname: "Agathe",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/Agathe.jpg",
    teams: ["France", "Iraq", "Jordan", "Curaçao"]
  },
  {
    nickname: "Claude Fable 5 MAX thinking",
    imageUrl: "https://images.seeklogo.com/logo-png/55/2/claude-logo-png_seeklogo-554534.png",
    teams: ["Morocco", "Japan", "Switzerland", "Ecuador"]
  },
  {
    nickname: "Mikael",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/mikael.jpg",
    teams: ["Canada", "Colombia", "Ecuador", "Paraguay"]
  },
  {
    nickname: "Keri",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/KeriA.jpg",
    teams: ["Scotland", "Egypt", "Czech Republic", "Ghana"]
  },
  {
    nickname: "Dika",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/Dika.jpg",
    teams: ["Bosnia & Herzegovina", "Croatia", "Japan", "Egypt"]
  },
  {
    nickname: "Theodora",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/theodora.JPG",
    teams: ["Senegal", "Ghana", "DR Congo", "Ivory Coast"]
  },
  {
    nickname: "Sam",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/sam.jpg",
    teams: ["England", "Scotland", "Netherlands", "Belgium"]
  },
  {
    nickname: "Alex",
    imageUrl: "https://www.nhsfellowship.ai/images/faculty/alexander-deng.jpg",
    teams: ["Japan", "South Korea", "New Zealand", "Australia"]
  },
  {
    nickname: "Eleanor",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/Eleanor.jpg",
    teams: ["Germany", "Switzerland", "Tunisia", "Turkey"]
  },
  {
    nickname: "Molly",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/molly.jpg",
    teams: ["Spain", "Senegal", "South Korea", "Portugal"]
  },
  {
    nickname: "Kristina",
    imageUrl: "https://gstt-csc.github.io/assets/img/team/kristina.jpg",
    teams: ["Uruguay", "South Korea", "Canada", "Jordan"]
  },
  {
    nickname: "Owen",
    imageUrl: "https://makeameme.org/media/templates/250/picard-facepalm.jpg",
    type: "own_goals",
    teams: []
  },
],
};

/* =============================================================================
   VALID TEAM NAMES — reference only. Copy names from here EXACTLY.
   42 confirmed countries plus 6 inter-confederation / UEFA play-off slots whose
   names will resolve in the feed once those play-offs are decided.
   ============================================================================= */
const VALID_TEAM_NAMES = [
  // Group A
  "Mexico", "South Africa", "South Korea", "Czech Republic",
  // Group B
  "Canada", "Bosnia & Herzegovina", "Qatar", "Switzerland",
  // Group C
  "Brazil", "Morocco", "Haiti", "Scotland",
  // Group D
  "USA", "Paraguay", "Australia", "Turkey",
  // Group E
  "Germany", "Curaçao", "Ivory Coast", "Ecuador",
  // Group F
  "Netherlands", "Japan", "Sweden", "Tunisia",
  // Group G
  "Belgium", "Egypt", "Iran", "New Zealand",
  // Group H
  "Spain", "Cape Verde", "Saudi Arabia", "Uruguay",
  // Group I
  "France", "Senegal", "Iraq", "Norway",
  // Group J
  "Argentina", "Algeria", "Austria", "Jordan",
  // Group K
  "Portugal", "DR Congo", "Uzbekistan", "Colombia",
  // Group L
  "England", "Croatia", "Ghana", "Panama",
];

const TEAM_FLAGS = {
  "Mexico": "🇲🇽",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "Czech Republic": "🇨🇿",
  "Canada": "🇨🇦",
  "Bosnia & Herzegovina": "🇧🇦",
  "Qatar": "🇶🇦",
  "Switzerland": "🇨🇭",
  "Brazil": "🇧🇷",
  "Morocco": "🇲🇦",
  "Haiti": "🇭🇹",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Turkey": "🇹🇷",
  "Germany": "🇩🇪",
  "Curaçao": "🇨🇼",
  "Ivory Coast": "🇨🇮",
  "Ecuador": "🇪🇨",
  "Netherlands": "🇳🇱",
  "Japan": "🇯🇵",
  "Sweden": "🇸🇪",
  "Tunisia": "🇹🇳",
  "Belgium": "🇧🇪",
  "Egypt": "🇪🇬",
  "Iran": "🇮🇷",
  "New Zealand": "🇳🇿",
  "Spain": "🇪🇸",
  "Cape Verde": "🇨🇻",
  "Saudi Arabia": "🇸🇦",
  "Uruguay": "🇺🇾",
  "France": "🇫🇷",
  "Senegal": "🇸🇳",
  "Iraq": "🇮🇶",
  "Norway": "🇳🇴",
  "Argentina": "🇦🇷",
  "Algeria": "🇩🇿",
  "Austria": "🇦🇹",
  "Jordan": "🇯🇴",
  "Portugal": "🇵🇹",
  "DR Congo": "🇨🇩",
  "Uzbekistan": "🇺🇿",
  "Colombia": "🇨🇴",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croatia": "🇭🇷",
  "Ghana": "🇬🇭",
  "Panama": "🇵🇦"
};
