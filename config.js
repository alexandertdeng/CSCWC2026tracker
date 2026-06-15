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
  { nickname: "Mike",          teams: ["Spain", "Jordan", "New Zealand", "Uzbekistan"] },
  { nickname: "Poppy",         teams: ["Ivory Coast", "New Zealand", "Norway", "Uzbekistan"] },
  { nickname: "James",         teams: ["England", "Scotland", "USA", "Cape Verde"] },
  { nickname: "Agathe",        teams: ["France", "Iraq", "Jordan", "Curaçao"] },
  { nickname: "Claude Fable 5 MAX thinking", teams: ["Morocco", "Japan", "Switzerland", "Ecuador"] },
  { nickname: "Mikael",        teams: ["Canada", "Colombia", "Ecuador", "Paraguay"] },
  { nickname: "Keri",          teams: ["Scotland", "Egypt", "Czechia", "Ghana"] },
  { nickname: "Dika",          teams: ["Bosnia and Herzegovina", "Croatia", "Japan", "Egypt"] },
  { nickname: "Theodora",      teams: ["Senegal", "Ghana", "DR Congo", "Ivory Coast"] },
  { nickname: "Sam",           teams: ["England", "Scotland", "Netherlands", "Belgium"] },
  { nickname: "Alexander Deng", teams: ["Japan", "South Korea", "New Zealand", "Australia"] },
  { nickname: "Eleanor",       teams: ["Germany", "Switzerland", "Tunisia", "Türkiye"] },
  { nickname: "Molly",         teams: ["Spain", "Senegal", "South Korea", "Portugal"] },
  { nickname: "Kristina",      teams: ["Uruguay", "Czechia", "South Korea", "Canada"] },
],
};

/* =============================================================================
   VALID TEAM NAMES — reference only. Copy names from here EXACTLY.
   42 confirmed countries plus 6 inter-confederation / UEFA play-off slots whose
   names will resolve in the feed once those play-offs are decided.
   ============================================================================= */
const VALID_TEAM_NAMES = [
  // Alternate feed names accepted by validation logic
  // (prevents false warnings when feed naming differs)
  "Turkey",
  "Bosnia",
  // Group A
  "Mexico", "South Africa", "South Korea", "Czechia",
  // Group B
  "Canada", "Bosnia and Herzegovina", "Bosnia", "Qatar", "Switzerland",
  // Group C
  "Brazil", "Morocco", "Haiti", "Scotland",
  // Group D
  "USA", "Paraguay", "Australia", "Türkiye", "Turkey",
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
  // Legacy / alternate names occasionally returned by older feed snapshots
  "Denmark",
];
