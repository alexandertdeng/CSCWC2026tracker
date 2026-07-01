/* World Cup 2026 — Goals Contest tracker
   Fetches the public-domain openfootball feed, sums every goal each team scores
   (including penalty-shootout goals), and ranks the configured nicknames. */

(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };
  var norm = function (s) { return (s || "").trim(); };

  function setStatus(text, cls) {
    var el = $("#status");
    el.textContent = text;
    el.className = "status" + (cls ? " " + cls : "");
  }

  /* Goals a team scored in ONE match.
     - inPlay: score after extra time if present, otherwise full time (this
       already includes any penalties taken during play).
     - shootout: tie-breaker penalty shootout goals (score.p), counted only if
       enabled in config. */
  function goalsForMatch(match, side /* 0 = team1, 1 = team2 */) {
    var s = match.score;
    if (!s) return { inPlay: 0, shootout: 0, played: false };
    var inPlaySrc = s.et || s.ft || s.ht;
    var inPlay = inPlaySrc ? (inPlaySrc[side] || 0) : 0;
    var shootout = (CONFIG.includeShootoutGoals && s.p) ? (s.p[side] || 0) : 0;
    return { inPlay: inPlay, shootout: shootout, played: true };
  }

  /* Build a per-team tally from all matches. */
  function tallyTeams(matches) {
    var tally = {}; // teamName -> { inPlay, shootout, matches }
    function bump(team, g) {
      var t = norm(team);
      if (!tally[t]) tally[t] = { inPlay: 0, shootout: 0, matches: 0 };
      tally[t].inPlay += g.inPlay;
      tally[t].shootout += g.shootout;
      if (g.played) tally[t].matches += 1;
    }
    matches.forEach(function (m) {
      if (!m.score) return;            // only count finished/in-progress matches
      bump(m.team1, goalsForMatch(m, 0));
      bump(m.team2, goalsForMatch(m, 1));
    });
    return tally;
  }

  function isOwnGoal(goal) {
    return !!(goal && (goal.owngoal || goal.ownGoal || goal.own_goal));
  }

  function countOwnGoals(matches) {
    return matches.reduce(function (total, match) {
      var goals1 = Array.isArray(match.goals1) ? match.goals1 : [];
      var goals2 = Array.isArray(match.goals2) ? match.goals2 : [];
      return total + goals1.filter(isOwnGoal).length + goals2.filter(isOwnGoal).length;
    }, 0);
  }

  function textForStage(match) {
    return [match.stage, match.round, match.title, match.name]
      .map(function (v) { return norm(v).toLowerCase(); })
      .filter(Boolean)
      .join(" ");
  }

  function isKnockoutMatch(match) {
    return /round of 32|round-of-32|last 32|1\/16|sixteenth|round of 16|round-of-16|last 16|1\/8|quarter|semi|third place|third-place|final/.test(textForStage(match));
  }

  function isGroupStageMatch(match) {
    var text = textForStage(match);
    return /group/.test(text) || (/matchday/.test(text) && !isKnockoutMatch(match));
  }

  function isRoundOf32Match(match) {
    return /round of 32|round-of-32|last 32|1\/16|sixteenth/.test(textForStage(match));
  }

  function matchWinnerSide(match) {
    if (!match.score) return null;
    var src = match.score.p || match.score.et || match.score.ft;
    if (!src || src[0] === src[1]) return null;
    return src[0] > src[1] ? 0 : 1;
  }

  function isConcreteTeamName(team) {
    var t = norm(team).toLowerCase();
    return !!t && !/winner|runner-up|runner up|third place|3rd place|group|match|tbd|to be determined|unknown/.test(t);
  }

  function eliminatedTeamSet(matches) {
    var eliminated = {};
    var groupTeams = {};
    var roundOf32Teams = {};
    var completedGroupMatches = 0;

    matches.forEach(function (match) {
      var team1 = norm(match.team1);
      var team2 = norm(match.team2);

      if (isGroupStageMatch(match)) {
        if (isConcreteTeamName(team1)) groupTeams[team1] = true;
        if (isConcreteTeamName(team2)) groupTeams[team2] = true;
        if (match.score) completedGroupMatches += 1;
      }

      if (isRoundOf32Match(match)) {
        if (isConcreteTeamName(team1)) roundOf32Teams[team1] = true;
        if (isConcreteTeamName(team2)) roundOf32Teams[team2] = true;
      }

      if (isKnockoutMatch(match) && match.score) {
        var winnerSide = matchWinnerSide(match);
        if (winnerSide !== null) {
          var loser = winnerSide === 0 ? team2 : team1;
          if (isConcreteTeamName(loser)) eliminated[loser] = true;
        }
      }
    });

    if (completedGroupMatches >= 72 && Object.keys(roundOf32Teams).length >= 32) {
      Object.keys(groupTeams).forEach(function (team) {
        if (!roundOf32Teams[team]) eliminated[team] = true;
      });
    }

    return eliminated;
  }

  function getMatchTime(match) {
    return match.datetime || match.date || "";
  }

  function minuteToNumber(minute) {
    var text = String(minute || "0");
    var parts = text.split("+");
    var base = parseInt(parts[0], 10) || 0;
    var extra = parseInt(parts[1], 10) || 0;
    return base + extra;
  }

  function goalSortKey(match, goal, fallbackIndex) {
    var matchTime = getMatchTime(match);
    var base = matchTime ? new Date(matchTime).getTime() : 0;
    if (!base || isNaN(base)) base = new Date((match.date || "1970-01-01") + "T00:00:00").getTime();
    var minuteOffset = minuteToNumber(goal && goal.minute) * 60 * 1000;
    return base + minuteOffset + fallbackIndex;
  }

  function getTeamGoalEvents(matches) {
    var events = {}; // teamName -> [{ sortKey }]

    function addEvent(team, sortKey) {
      var t = norm(team);
      if (!t) return;
      if (!events[t]) events[t] = [];
      events[t].push({ sortKey: sortKey });
    }

    matches.forEach(function (match) {
      var goals1 = Array.isArray(match.goals1) ? match.goals1 : [];
      var goals2 = Array.isArray(match.goals2) ? match.goals2 : [];

      goals1.forEach(function (goal, idx) {
        addEvent(match.team1, goalSortKey(match, goal, idx));
      });
      goals2.forEach(function (goal, idx) {
        addEvent(match.team2, goalSortKey(match, goal, idx));
      });

      if (CONFIG.includeShootoutGoals && match.score && match.score.p) {
        var shootoutBase = goalSortKey(match, { minute: "130" }, goals1.length + goals2.length);
        var p1 = match.score.p[0] || 0;
        var p2 = match.score.p[1] || 0;
        for (var i = 0; i < p1; i += 1) addEvent(match.team1, shootoutBase + i);
        for (var j = 0; j < p2; j += 1) addEvent(match.team2, shootoutBase + p1 + j);
      }
    });

    Object.keys(events).forEach(function (team) {
      events[team].sort(function (a, b) { return a.sortKey - b.sortKey; });
    });

    return events;
  }

  function getOwnGoalScoringTeam(match, goalSide) {
    if (goalSide === "goals1") return norm(match.team2);
    if (goalSide === "goals2") return norm(match.team1);
    return "";
  }

  function getOwnGoalTeams(matches) {
    return matches
      .slice()
      .sort(function (a, b) {
        return new Date(getMatchTime(a) || 0) - new Date(getMatchTime(b) || 0);
      })
      .flatMap(function (match) {
        var goals1 = Array.isArray(match.goals1) ? match.goals1 : [];
        var goals2 = Array.isArray(match.goals2) ? match.goals2 : [];

        return [
          ...goals1.filter(isOwnGoal).map(function (goal) {
            return {
              team: getOwnGoalScoringTeam(match, "goals1"),
              goal: goal,
              match: match
            };
          }),
          ...goals2.filter(isOwnGoal).map(function (goal) {
            return {
              team: getOwnGoalScoringTeam(match, "goals2"),
              goal: goal,
              match: match
            };
          })
        ].filter(function (item) { return item.team; });
      });
  }

  function renderOwnGoalsTotal(ownGoals) {
    var el = $("#own-goals-total");
    if (el) el.textContent = ownGoals;
  }

  function validTeamSet() {
    var set = {};
    (typeof VALID_TEAM_NAMES !== "undefined" ? VALID_TEAM_NAMES : []).forEach(function (n) {
      set[norm(n)] = true;
    });
    return set;
  }

  function render(tally, matches) {
    var validSet = validTeamSet();
    var eliminatedTeams = eliminatedTeamSet(matches);
    var unknown = [];

    var ownGoals = countOwnGoals(matches);
    var ownGoalTeams = getOwnGoalTeams(matches);
    var teamGoalEvents = getTeamGoalEvents(matches);
    renderOwnGoalsTotal(ownGoals);

    var rows = CONFIG.entries.map(function (entry) {
      if (entry.type === "own_goals") {
        return {
          nickname: entry.nickname,
          imageUrl: entry.imageUrl || "",
          type: "own_goals",
          teams: ownGoalTeams.map(function (item) {
            return {
              name: item.team,
              flag: (typeof TEAM_FLAGS !== "undefined" ? TEAM_FLAGS[item.team] : "") || ""
            };
          }),
          total: ownGoals,
          shootout: 0,
          matches: "",
          lastGoalTime: ownGoalTeams.length ? goalSortKey(ownGoalTeams[ownGoalTeams.length - 1].match, ownGoalTeams[ownGoalTeams.length - 1].goal, ownGoalTeams.length - 1) : null,
          eliminated: ownGoals >= 22,
          perfect: ownGoals === 21
        };
      }
      var inPlay = 0, shootout = 0, matches = 0;
      var goalEvents = [];
      var teams = (entry.teams || []).map(function (teamName) {
        var t = norm(teamName);
        var rec = tally[t] || { inPlay: 0, shootout: 0, matches: 0 };
        var known = validSet[t] === true;
        if (!known && Object.keys(validSet).length) unknown.push(t);
        inPlay += rec.inPlay;
        shootout += rec.shootout;
        matches += rec.matches;
        goalEvents = goalEvents.concat(teamGoalEvents[t] || []);
        return {
          name: t,
          goals: rec.inPlay + rec.shootout,
          shootout: rec.shootout,
          matches: rec.matches,
          known: known,
        };
      });
      var total = inPlay + shootout;
      goalEvents.sort(function (a, b) { return a.sortKey - b.sortKey; });
      var lastGoalEvent = total > 0 ? goalEvents[total - 1] : null;
      return {
        nickname: entry.nickname,
        imageUrl: entry.imageUrl || "",
        teams: teams,
        total: total,
        shootout: shootout,
        matches: matches,
        lastGoalTime: lastGoalEvent ? lastGoalEvent.sortKey : null,
        eliminated: total >= 22,
        perfect: total === 21,
      };
    });

    rows.sort(function (a, b) {
      // Eliminated nicknames always sink to the bottom.
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      if (b.total !== a.total) return b.total - a.total;

      var aIsOwen = norm(a.nickname).toLowerCase() === "owen";
      var bIsOwen = norm(b.nickname).toLowerCase() === "owen";
      if (aIsOwen !== bIsOwen) return aIsOwen ? -1 : 1;

      var aMatches = Number(a.matches) || 0;
      var bMatches = Number(b.matches) || 0;
      if (aMatches !== bMatches) return aMatches - bMatches;

      if (a.lastGoalTime !== b.lastGoalTime) {
        if (a.lastGoalTime === null) return 1;
        if (b.lastGoalTime === null) return -1;
        return a.lastGoalTime - b.lastGoalTime;
      }

      return a.nickname.localeCompare(b.nickname);
    });

    var body = $("#ranking-body");
    body.innerHTML = "";
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="5" class="empty">No participants yet. Add some in config.js.</td></tr>';
    }

    var activeRank = 0;
    rows.forEach(function (row, i) {
      var rank = row.eliminated ? null : ++activeRank;
      var isOwnGoalsRow = row.type === "own_goals";
      var badge = row.eliminated ? "OUT" : rank;
      var statusBadge = row.eliminated
        ? '<span class="status-badge ko-badge" aria-label="Knocked out">KO</span>'
        : (row.perfect ? '<span class="status-badge perfect-badge" aria-label="Perfect score">Perfect!</span>' : '');
      var avatar = row.imageUrl
        ? '<img class="avatar" src="' + escapeHtml(row.imageUrl) + '" alt="" loading="lazy">'
        : '';
      var tr = document.createElement("tr");
      tr.className = "row" + (row.eliminated ? " eliminated" : (row.perfect ? " perfect perfect-row r" + rank : " r" + rank));
      if (row.perfect) {
        tr.style.background = "rgba(255, 215, 0, 0.18)";
      }

      function flagHtml(name) {
        var map = (typeof TEAM_FLAGS !== "undefined") ? TEAM_FLAGS : {};
        var flag = map[name] || "";
        return flag ? '<span class="flag">' + flag + '</span> ' : '';
      }

      function teamNameHtml(name) {
        var escaped = escapeHtml(name);
        return eliminatedTeams[name]
          ? '<span style="text-decoration:line-through">' + escaped + '</span>'
          : escaped;
      }
      var chips = isOwnGoalsRow
        ? row.teams.map(function (t) {
          return '<span class="chip" title="Own goal scored by ' + escapeHtml(t.name) + '">' +
                 flagHtml(t.name) +
                 escapeHtml(t.name) + '</span>';
        }).join("")
        : row.teams.map(function (t) {
          var cls = "chip" + (t.known ? "" : " bad");
          var title = t.known
            ? (t.matches + " match" + (t.matches === 1 ? "" : "es") + " played"
               + (t.shootout ? " · incl. " + t.shootout + " shootout" : ""))
            : "Unknown team name — check spelling against config.js";
          return '<span class="' + cls + '" title="' + title + '">' +
                 flagHtml(t.name) +
                 teamNameHtml(t.name) +
                 ' <span class="stat">P:' + t.matches + '</span>' +
                 ' <span class="g">G:' + t.goals + '</span></span>';
        }).join("");

      tr.innerHTML =
        '<td class="col-rank"><span class="rank-badge">' + badge + '</span></td>' +
        '<td><div class="player-cell">' + avatar + '<div class="player-text"><div class="nick-line"><span class="nick">' + escapeHtml(row.nickname) + '</span>' +
          statusBadge + '</div></div></div></td>' +
        '<td><div class="teams">' + chips + '</div></td>' +
        '<td class="goals-cell"><span class="goals-num">' + row.total + '</span>' +
        '<span class="goals-sub">' + (row.eliminated
          ? "eliminated · >21 goals"
          : (row.perfect ? "perfect · exactly 21 goals" : (row.shootout ? "incl. " + row.shootout + " shootout" : ""))) + '</span></td>' +
        '<td class="played-cell"><span class="played-num">' + (isOwnGoalsRow ? "" : row.matches) + '</span></td>';
      body.appendChild(tr);
    });

    var warnBox = $("#warnings");
    var uniqueUnknown = unknown.filter(function (v, idx) { return unknown.indexOf(v) === idx; });
    if (uniqueUnknown.length) {
      warnBox.hidden = false;
      warnBox.innerHTML = "<strong>Heads up:</strong> these team names in config.js weren't " +
        "recognised, so they score 0. Check spelling/accents against VALID_TEAM_NAMES: " +
        uniqueUnknown.map(escapeHtml).join(", ") + ".";
    } else {
      warnBox.hidden = true;
    }
  }

  /* Render the most recently played day's matches as normal scorelines. */
  function renderRecent(matches) {
    var section = $("#recent");
    var list = $("#recent-list");
    var titleEl = $("#recent-title");

    var played = matches.filter(function (m) {
      return m.score && m.date && (m.score.et || m.score.ft || m.score.ht);
    });
    if (!played.length) {
      section.hidden = true;
      return;
    }

    var latest = played.reduce(function (max, m) {
      return m.date > max ? m.date : max;
    }, played[0].date);

    var dayMatches = played.filter(function (m) { return m.date === latest; });

    var when = new Date(latest + "T00:00:00");
    var label = isNaN(when.getTime())
      ? latest
      : when.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    titleEl.textContent = "Latest results — " + label;

    list.innerHTML = '<details class="spoiler"><summary>Reveal day\'s matches</summary><ul class="spoiler-list">' +
      dayMatches.map(function (m) {
        var src = m.score.et || m.score.ft || m.score.ht;
        var a = src[0] || 0, b = src[1] || 0;
        var so = (m.score.p && (m.score.p[0] || m.score.p[1]))
          ? ' <span class="so">(pens ' + (m.score.p[0] || 0) + '–' + (m.score.p[1] || 0) + ')</span>'
          : "";
        var aet = m.score.et ? ' <span class="so">(a.e.t.)</span>' : "";
        return '<li class="score">' +
          '<span class="team-a">' + escapeHtml(norm(m.team1)) + '</span>' +
          '<span class="line">' + a + ' <span class="dash">–</span> ' + b + '</span>' +
          '<span class="team-b">' + escapeHtml(norm(m.team2)) + '</span>' +
          aet + so +
          '</li>';
      }).join("") +
      '</ul></details>';

    section.hidden = false;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function load() {
    setStatus("Loading live data…");
    var url = CONFIG.dataUrl + (CONFIG.dataUrl.indexOf("?") === -1 ? "?" : "&") + "t=" + Date.now();
    fetch(url, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        var matches = (data && data.matches) || [];
        var played = matches.filter(function (m) { return m.score; }).length;
        render(tallyTeams(matches), matches);
        renderRecent(matches);
        var when = new Date();
        $("#updated").textContent = "Updated " + when.toLocaleString();
        if (played === 0) {
          setStatus("Connected · no matches scored yet", "live");
        } else {
          setStatus("Live · " + played + " match" + (played === 1 ? "" : "es") + " counted", "live");
        }
      })
      .catch(function (err) {
        setStatus("Couldn't load data (" + err.message + "). Will retry.", "error");
      });
  }

  // Init
  document.title = CONFIG.contestName || document.title;
  $("#contest-title").textContent = CONFIG.contestName || "World Cup 2026 — Goals Contest";
  $("#refresh").addEventListener("click", load);

  // Render configured participants immediately, before the live data request finishes.
  // This prevents any placeholder rows hardcoded in index.html from remaining visible
  // if the football data feed is slow, unavailable, or blocked.
  render({}, []);

  load();
  if (CONFIG.refreshMinutes > 0) {
    setInterval(load, CONFIG.refreshMinutes * 60 * 1000);
  }
})();
