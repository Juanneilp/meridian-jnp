import fs from "fs";
import { log } from "./logger.js";
import { getPerformanceSummary } from "./lessons.js";
import { escapeHtml } from "./telegram.js";
import { repoPath } from "./repo-root.js";

const STATE_FILE = repoPath("state.json");
const LESSONS_FILE = repoPath("lessons.json");

export async function generateBriefing() {
  const state = loadJson(STATE_FILE) || { positions: {}, recentEvents: [] };
  const lessonsData = loadJson(LESSONS_FILE) || { lessons: [], performance: [] };

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Positions Activity
  const allPositions = Object.values(state.positions || {});
  const openedLast24h = allPositions.filter(p => new Date(p.deployed_at) > last24h);
  const closedLast24h = allPositions.filter(p => p.closed && new Date(p.closed_at) > last24h);

  // 2. Performance Activity (from performance log)
  const perfLast24h = (lessonsData.performance || []).filter(p => new Date(p.recorded_at) > last24h);
  const totalPnLUsd = perfLast24h.reduce((sum, p) => sum + (p.pnl_usd || 0), 0);
  const totalFeesUsd = perfLast24h.reduce((sum, p) => sum + (p.fees_earned_usd || 0), 0);

  // 3. Lessons Learned
  const lessonsLast24h = (lessonsData.lessons || []).filter(l => new Date(l.created_at) > last24h);

  // 4. Current State
  const openPositions = allPositions.filter(p => !p.closed);
  const perfSummary = getPerformanceSummary();

  // 5. Format Message
  const lines = [
    "☀️ <b>Morning Briefing</b>",
    `📅 ${now.toISOString().slice(0, 10)}`,
    "─────────────────",
    "",
    "📊 <b>Activity (24h)</b>",
    `   📥 Opened: <b>${openedLast24h.length}</b>`,
    `   📤 Closed: <b>${closedLast24h.length}</b>`,
    "",
    "💰 <b>Performance (24h)</b>",
    `   ${totalPnLUsd >= 0 ? "🟢" : "🔴"} Net PnL: <b>${totalPnLUsd >= 0 ? "+" : ""}$${totalPnLUsd.toFixed(2)}</b>`,
    `   💎 Fees: <b>$${totalFeesUsd.toFixed(2)}</b>`,
    perfLast24h.length > 0
      ? `   📈 Win Rate: <b>${Math.round((perfLast24h.filter(p => p.pnl_usd > 0).length / perfLast24h.length) * 100)}%</b> (${perfLast24h.length} trades)`
      : "   📈 Win Rate: N/A",
    "",
    "🧠 <b>Lessons Learned</b>",
    lessonsLast24h.length > 0
      ? lessonsLast24h.slice(0, 5).map(l => `   • ${escapeHtml(l.rule.slice(0, 80))}`).join("\n")
      : "   • No new lessons",
    "",
    "📂 <b>Portfolio</b>",
    `   Open: <b>${openPositions.length}</b> positions`,
    perfSummary
      ? `   All-time: $${perfSummary.total_pnl_usd.toFixed(2)} (${perfSummary.win_rate_pct}% win rate)`
      : "",
    "─────────────────",
  ];

  return lines.join("\n");
}

function loadJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    log("briefing_error", `Failed to read ${file}: ${err.message}`);
    return null;
  }
}
