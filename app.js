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

  function validTeamSet() {
    var set = {};
    (typeof VALID_TEAM_NAMES !== "undefined" ? VALID_TEAM_NAMES : []).forEach(function (n) {
      set[norm(n)] = true;
    });
    return set;
  }

  function render(tally) {
    var validSet = validTeamSet();
    var unknown = [];

    var rows = CONFIG.entries.map(function (entry) {
      var inPlay = 0, shootout = 0;
      var teams = (entry.teams || []).map(function (teamName) {
        var t = norm(teamName);
        var rec = tally[t] || { inPlay: 0, shootout: 0, matches: 0 };
        var known = validSet[t] === true;
        if (!known && Object.keys(validSet).length) unknown.push(t);
        inPlay += rec.inPlay;
        shootout += rec.shootout;
        return {
          name: t,
          goals: rec.inPlay + rec.shootout,
          shootout: rec.shootout,
          matches: rec.matches,
          known: known,
        };
      });
      return {
        nickname: entry.nickname,
        teams: teams,
        total: inPlay + shootout,
        shootout: shootout,
      };
    });

    rows.sort(function (a, b) {
      if (b.total !== a.total) return b.total - a.total;
      return a.nickname.localeCompare(b.nickname);
    });

    var body = $("#ranking-body");
    body.innerHTML = "";
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="4" class="empty">No participants yet. Add some in config.js.</td></tr>';
    }

    rows.forEach(function (row, i) {
      var rank = i + 1;
      var tr = document.createElement("tr");
      tr.className = "row r" + rank;

      var chips = row.teams.map(function (t) {
        var cls = "chip" + (t.known ? "" : " bad");
        var title = t.known
          ? (t.matches + " match" + (t.matches === 1 ? "" : "es") + " played"
             + (t.shootout ? " · incl. " + t.shootout + " shootout" : ""))
          : "Unknown team name — check spelling against config.js";
        return '<span class="' + cls + '" title="' + title + '">' +
               escapeHtml(t.name) + ' <span class="g">' + t.goals + '</span></span>';
      }).join("");

      var sub = row.shootout
        ? "incl. " + row.shootout + " shootout"
        : "across all teams";

      tr.innerHTML =
        '<td class="col-rank"><span class="rank-badge">' + rank + '</span></td>' +
        '<td><div class="nick">' + escapeHtml(row.nickname) + '</div></td>' +
        '<td><div class="teams">' + chips + '</div></td>' +
        '<td class="goals-cell"><span class="goals-num">' + row.total + '</span>' +
        '<span class="goals-sub">' + sub + '</span></td>';
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
        render(tallyTeams(matches));
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
  load();
  if (CONFIG.refreshMinutes > 0) {
    setInterval(load, CONFIG.refreshMinutes * 60 * 1000);
  }
})();
