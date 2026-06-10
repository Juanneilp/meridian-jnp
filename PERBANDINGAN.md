# Perbandingan Lengkap 4 Sumber Kode Meridian AI Agent

> **Dokumen ini ditulis agar mudah dipahami oleh developer junior atau model AI yang lebih kecil.**
> Setiap istilah teknis dijelaskan. Setiap keputusan diberi alasan. Jika Anda baru pertama kali membaca kodebase ini, mulai dari Bagian 0 dan baca berurutan.

---

## Daftar Isi

- [Bagian 0 — Apa itu Meridian?](#bagian-0--apa-itu-meridian)
- [Bagian 1 — Sumber Repo & Hubungan Antar Kodebase](#bagian-1--sumber-repo--hubungan-antar-kodebase)
- [Bagian 2 — Perbandingan Fitur per Dimensi](#bagian-2--perbandingan-fitur-per-dimensi)
- [Bagian 3 — Repo Keempat: meteora-dlmm-lp-skill](#bagian-3--repo-keempat-meteora-dlmm-lp-skill)
- [Bagian 4 — Perbedaan Arsitektur Kunci](#bagian-4--perbedaan-arsitektur-kunci)
- [Bagian 5 — Keunggulan Masing-masing Versi](#bagian-5--keunggulan-masing-masing-versi)
- [Bagian 6 — Apa yang Bisa Dipelajari & Diimplementasikan](#bagian-6--apa-yang-bisa-dipelajari--diimplementasikan)
- [Bagian 7 — Roadmap Implementasi yang Disarankan](#bagian-7--roadmap-implementasi-yang-disarankan)

---

## Bagian 0 — Apa itu Meridian?

**Meridian** adalah bot AI otonom yang berjalan di Node.js. Tugasnya:

1. **Screening** — Secara otomatis mencari pool likuiditas terbaik di DEX Meteora (di blockchain Solana).
2. **Deploy** — Menaruh SOL (mata uang Solana) ke pool terpilih untuk mendapat fee dari trading.
3. **Manage** — Memantau posisi yang sudah dibuka: kapan harus claim fee, kapan harus keluar.
4. **Learn** — Mencatat hasil setiap posisi (untung/rugi) dan menggunakan data itu untuk keputusan berikutnya.

Bot ini menggunakan LLM (Large Language Model, seperti ChatGPT) untuk membuat keputusan, tapi keputusan kritis (stop loss, trailing take-profit) dijalankan secara deterministik (tanpa LLM) agar cepat dan dapat diandalkan.

**Istilah penting:**
- **DLMM** = Dynamic Liquidity Market Maker — cara Meteora mengelola pool likuiditas dengan "bin" (kotak harga).
- **Pool** = Tempat dua token diperdagangkan. LP (Liquidity Provider) menaruh uang di sini dan mendapat fee.
- **Bin** = Satu kotak harga dalam pool DLMM. Setiap bin punya harga spesifik.
- **Active Bin** = Bin di mana harga pasar saat ini berada.
- **In Range** = Harga masih di dalam range bin yang kita pasang (kita dapat fee).
- **Out of Range (OOR)** = Harga sudah di luar range kita (kita tidak dapat fee).
- **PnL** = Profit and Loss — untung atau rugi.
- **Trailing TP** = Trailing Take Profit — otomatis ambil untung ketika harga turun dari puncak.

---

## Bagian 1 — Sumber Repo & Hubungan Antar Kodebase

### 1a. Empat Sumber Kode

| # | Nama Pendek | URL / Lokasi | Deskripsi |
|---|-------------|-------------|-----------|
| 1 | **meridian-main** | Folder lokal `/root/meridian-main` (clone dari `github.com/yunus-0x/meridian` branch `main`) | Fork kita — basis kode saat ini. Paling siap production. |
| 2 | **meridian-experimental** | `github.com/yunus-0x/meridian` branch `experimental` | Branch percobaan dari author asli. Menambah GMGN integration, menghapus beberapa fitur. |
| 3 | **meridian-gh** | `github.com/fciaf420/meridian` branch `main` | Fork oleh developer lain (`fciaf420`) dengan pengembangan besar-besaran: web dashboard, 5 LLM provider, memory system baru, dll. |
| 4 | **meteora-dlmm-lp-skill** | `github.com/fciaf420/meteora-dlmm-lp-skill` | **Bukan fork Meridian.** Ini adalah Claude Code "Skill" — file knowledge base yang berisi panduan strategi LP Meteora DLMM secara mendalam. Bisa diintegrasikan ke agent mana saja. |

### 1b. Diagram Hubungan

```
yunus-0x/meridian (main)  ◄── INI YANG KITA FORK
        │
        ├── branch: experimental
        │     └── Tambahan: GMGN API client (733 baris)
        │     └── Hilang: Claude Code, Discord listener, HiveMind cache
        │
        └── di-fork oleh fciaf420
              │
              ├── fciaf420/meridian  ← Pengembangan terbesar:
              │     Web Dashboard, 5 LLM Provider, Nuggets Memory,
              │     Knowledge Base, Autoresearch, USDC Mode,
              │     Evil Panda Strategy, PnL Watcher, dll.
              │
              └── fciaf420/meteora-dlmm-lp-skill  ← REPO TERPISAH
                    Bukan fork Meridian. Berisi knowledge base
                    tentang strategi LP DLMM (bin steps, shapes,
                    dynamic fees, IL management).
```

**Poin penting:**
- `meridian-main` dan `meridian-experimental` berasal dari author yang sama (`yunus-0x`).
- `meridian-gh` adalah fork yang sudah sangat berbeda arsitekturnya.
- `meteora-dlmm-lp-skill` adalah proyek terpisah yang bisa diambil knowledge-nya saja.
- Branch `experimental` adalah **jembatan evolusi**: sudah punya GMGN tapi belum punya web dashboard atau multi-provider.

---

## Bagian 2 — Perbandingan Fitur per Dimensi

> **Cara membaca tabel:** ✅ = ada, ❌ = tidak ada, teks = keterangan spesifik.

### 2a. Dependencies & Scripts (`package.json`)

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **`bin`** (bisa dipanggil via `meridian` di terminal) | ✅ `cli.js` | ✅ | ❌ |
| **Scripts PM2** (`pm2:start`, `pm2:stop`, dll) | ✅ | ✅ | ❌ |
| **Scripts Web** (`dev:web`, `build:web`) | ❌ | ❌ | ✅ |
| **`env:encrypt`** (enkripsi file .env) | ✅ | ✅ | ❌ |
| **`lint`** (pengecekan kualitas kode) | ❌ | ❌ | ✅ |
| **`@meteora-ag/dlmm`** (SDK utama) | `1.9.4` (pinned) | `1.9.4` (pinned) | `latest` (selalu terbaru) |
| **`@solana/spl-token`** | ❌ | ✅ | ✅ |
| **`express` + `ws`** (web server) | ❌ | ❌ | ✅ |
| **`jsonrepair`** (perbaiki JSON rusak dari LLM) | ✅ | ✅ | ❌ |
| **`nuggets` (file:)** (holographic memory) | ❌ | ❌ | ✅ |
| **`knip`** (dead code detection) | ✅ | ❌ | ❌ |

**Penjelasan:**
- `jsonrepair` penting karena LLM murah sering menghasilkan JSON yang tidak valid. Kita repair otomatis sebelum parse. Fitur ini ada di main dan experimental, tapi **tidak ada** di meridian-gh — ini keunggulan kita.
- meridian-gh pakai `@meteora-ag/dlmm: latest` yang berisiko — versi baru bisa breaking. Kita pin di `1.9.4` yang stabil.

---

### 2b. File Unik per Versi

#### Hanya di meridian-main (fork kita)

| File | Fungsi | Kenapa Penting |
|------|--------|----------------|
| `.claude/` (agents, commands, settings.json) | Claude Code sub-agents + slash commands | Memungkinkan interaksi via Claude Code IDE |
| `discord-listener/` | Selfbot Discord listener untuk LP Army signals | Sumber sinyal tambahan dari komunitas |
| `tools/agent-meridian.js` | Agent Meridian API client (top LPers, chart indicators) | Data dari API proprietary |
| `tools/chart-indicators.js` | 8 preset konfirmasi teknikal (RSI, Supertrend, Bollinger, dll) | Validasi entry/exit dengan indikator teknikal |
| `envcrypt.js` | XOR cipher untuk enkripsi .env | Keamanan kunci API di production |
| `screening-scales.js` | Threshold penyaringan otomatis berdasarkan timeframe | Adaptasi filter ke market condition |
| `ecosystem.config.cjs` | PM2 ecosystem file | Production deployment |
| `deployer-blacklist.json` | Daftar deployer yang di-blacklist | Filter scammer |
| `utils/number.js` | Number utility | Helper |

#### Hanya di meridian-experimental

| File | Fungsi | Kenapa Penting |
|------|--------|----------------|
| `tools/gmgn.js` (733 baris) | **GMGN OpenAPI integration** — trending pool discovery, security analysis, KOL/smart money tracking | Sumber data screening alternatif yang sangat kaya |
| `docs/hivemind-reference.md` | Dokumentasi referensi HiveMind | Dokumentasi |
| `docs/hivemind-summary.md` | Ringkasan HiveMind | Dokumentasi |
| `gmgn-config.example.json` | Contoh konfigurasi GMGN | Template konfigurasi |
| `test-screening.js` | Test screening mandiri | Testing |

**Catatan tentang GMGN (`tools/gmgn.js` di experimental):**

GMGN adalah API pihak ketiga yang memberikan data tentang token Solana. File `gmgn.js` di branch experimental berisi:
1. **Trending Pool Discovery** — menemukan pool yang sedang trending, alternatif dari Meteora discovery API.
2. **Security Analysis** — cek apakah token aman: apakah mint authority sudah direnounce? Apakah honeypot? Berapa rug ratio?
3. **KOL/Smart Money Tracking** — siapa KOL (Key Opinion Leader) yang hold token ini? Apakah mereka dump atau accumulate?
4. **Holder Analysis** — berapa persen bundler? Sniper? Fresh wallet? (Indikator manipulasi).
5. **Indicator Rules** — konfirmasi teknikal via Supertrend, RSI, Bollinger Bands dari data GMGN.

#### Hanya di meridian-gh

| File | Fungsi | Kenapa Penting |
|------|--------|----------------|
| `web/` (full React + TypeScript) | **Web dashboard** dengan WebSocket, shadcn/ui | Monitoring visual real-time |
| `packages/nuggets/` | **Holographic memory** — memory system baru | Persistent cross-session memory |
| `memory.js` / `unified-memory.js` | Nuggets memory client + unified brief | Abstraksi memory |
| `knowledge-base.js` | **Knowledge base** markdown article system | Penyimpanan pengetahuan terstruktur |
| `autoresearch.js` / `autoresearch.json` | **ATLAS-inspired prompt optimization** — otomatis tune prompt berdasarkan hasil real | Self-improving screening |
| `server.js` / `session.js` | Web HTTP + WebSocket server | Backend untuk dashboard |
| `notifier.js` | Pub/sub notification hub (event bus) | Decoupling notifikasi |
| `pnl-watcher.js` | PnL watcher daemon sub-30s | Monitoring PnL terpisah, lebih responsif |
| `llm-provider.js` | **5 LLM provider abstraction** (Claude, Codex, OpenRouter, DeepSeek, MiniMax) | Resilience & cost optimization |
| `tools/usdc-mode.js` | **USDC capital mode** — deploy/close settlement dalam USDC | Stabilitas nilai |
| `tools/gmgn-screen.js` | GMGN screening pipeline terstruktur | Pipeline screening dari GMGN |
| `tools/gmgn.js` | GMGN API client (versi berbeda dari experimental) | Lebih terintegrasi ke pipeline |
| `tools/lp-overview.js` | LP Agent historical position map | Insight historis |
| `tools/knowledge-graph.js` | Knowledge base graph data | Visualisasi knowledge |
| `tools/knowledge-base-tools.js` | KB tool handlers (read/write/search) | CRUD knowledge base |
| `runtime-helpers.js` | Shared utilities (CONFIG_KEY_MAP, calculateBins) | Helper functions |
| `get_status.js` | Quick status script | Diagnostik cepat |
| `install.sh` | Install script | Deployment |
| `lpagent-keys.js` | LP Agent key rotation | Keamanan |
| `video/` | Promotional video project (Remotion) | Marketing |
| `data/nuggets/` | Nuggets persistent memory storage | Data directory |

---

### 2c. LLM Provider (Otak AI-nya)

> **Penjelasan:** LLM Provider adalah layanan yang menyediakan AI. Agent Meridian menggunakan AI untuk memutuskan pool mana yang bagus dan kapan harus keluar. Jika provider down, agent tidak bisa berpikir.

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **Jumlah Provider** | 1 (OpenRouter) | 1 (OpenRouter) | **5** (Claude, Codex, OpenRouter, DeepSeek, MiniMax) |
| **Provider Abstraction** | ❌ (langsung `new OpenAI(...)`) | ❌ (langsung `new OpenAI(...)`) | ✅ `llm-provider.js` |
| **Fallback Model** | `stepfun/step-3.5-flash:free` (satu fallback) | ❌ (tidak ada fallback) | Per-role fallback chain + DeepSeek global fallback |
| **`jsonrepair`** | ✅ (repair JSON rusak dari LLM) | ✅ | ❌ (tidak ada, berisiko crash) |
| **`lightChat` fast-path** | ❌ | ❌ | ✅ (jalur cepat untuk chat ringan) |
| **Model Default** | `hermes-3-405b` / `healer-alpha` | `hermes-3-405b` | Per provider, berbeda |
| **Per-role Model Config** | ✅ (management/screening/generalModel) | ✅ | ✅ + `fallbackModels` per role |

**Implikasi untuk kita:**
- Saat ini kita hanya punya 1 provider (OpenRouter). Jika OpenRouter down → agent mati total.
- meridian-gh punya 5 provider dengan fallback chain → jika satu down, otomatis pindah ke yang lain.
- **Tapi** kita punya `jsonrepair` yang meridian-gh tidak punya. Ini kritis karena LLM murah sering output JSON yang rusak. Kita repair otomatis; meridian-gh akan crash.

---

### 2d. Screening Pipeline (Cara Mencari Pool)

> **Penjelasan:** Screening adalah proses mencari pool likuiditas yang layak di-invest. Pipeline = serangkaian tahapan filter, dari yang paling kasar ke yang paling halus.

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **Sumber Data Utama** | Meteora Pool Discovery API | **Meteora ATAU GMGN** (bisa dipilih via config `screeningSource`) | Meteora ATAU GMGN |
| **GMGN Integration** | ❌ | ✅ `tools/gmgn.js` (733 baris, sangat lengkap) | ✅ `tools/gmgn.js` + `tools/gmgn-screen.js` (pipeline terstruktur) |
| **Discord Signals** | ✅ (selfbot + pre-checks pipeline) | ❌ | ❌ |
| **PVP Rival Detection** | ✅ (deteksi token kompetitor) | ✅ | ❌ |
| **Chart Indicator Confirmation** | ✅ (8 presets: RSI, Supertrend, Bollinger, Fibonacci, dll) | ✅ (via `gmgn.js` import) | ❌ |
| **Agent Meridian Scoring** | ✅ (data dari API Agent Meridian) | ❌ | ❌ |
| **Dev Blocklist** | ✅ (blokir deployer scammer) | ✅ | ❌ |
| **Lone Candidate Skip** | ✅ (tolak jika hanya 1 kandidat lolos & tidak cukup bagus) | ❌ | ❌ |
| **Screening Scales** (threshold otomatis per timeframe) | ✅ (`screening-scales.js`) | ✅ (sama) | ❌ |

**Penjelasan perbedaan:**
- Kita punya screening paling **defensif** — banyak layer filter sebelum deploy.
- Experimental punya GMGN yang memberikan data security/KOL/holder yang sangat berharga.
- meridian-gh punya GMGN + structured pipeline, tapi kehilangan banyak filter defensif (PVP, chart indicators, lone candidate skip).

---

### 2e. Memory & Learning System (Cara Agent Belajar)

> **Penjelasan:** Agent yang baik belajar dari kesalahan. Setiap kali posisi ditutup, hasilnya dicatat. Data ini digunakan untuk screening berikutnya.

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **lessons.json** (catatan pelajaran) | ✅ | ✅ | ✅ |
| **Lesson Deduplication** (hapus pelajaran duplikat) | ❌ | ❌ | ✅ `deduplicateLessons()` |
| **Lesson-based Evolution** (evolusi otomatis dari pelajaran) | ❌ | ❌ | ✅ `evolveFromLessons()` |
| **HiveMind** (shared learning antar agent) | ✅ | ✅ | ❌ |
| **HiveMind Cache** (cache data HiveMind lokal) | ✅ | ❌ | ❌ |
| **Nuggets Holographic Memory** (memory persistens lintas sesi) | ❌ | ❌ | ✅ |
| **Knowledge Base** (artikel pengetahuan markdown) | ❌ | ❌ | ✅ |
| **Autoresearch** (auto-tune prompt dari hasil nyata) | ❌ | ❌ | ✅ |
| **Darwinian Signal Weights** (bobot sinyal evolusioner) | ✅ | ✅ | ✅ (dengan tambahan config) |
| **Pool Memory** (riwayat per-pool) | ✅ | ✅ | ✅ |
| **Strategy Library** (koleksi strategi tersimpan) | ✅ (`strategy-library.json`, persisten) | ❌ (tidak persist) | ❌ |
| **Degraded File Recovery** (pemulihan file rusak) | ❌ | ❌ | ✅ |

**Penjelasan:**
- **Lesson deduplication** penting karena tanpanya, `lessons.json` terus membesar. Duplikat berarti token LLM terbuang di prompt. Di kita belum ada — perlu ditambahkan.
- **HiveMind** adalah fitur sharing pelajaran antar agent — hanya ada di kita dan experimental. meridian-gh tidak punya ini.
- **Autoresearch** adalah fitur paling advanced: agent menganalisis pattern dari 50+ close result, lalu otomatis memodifikasi cara screening-nya. Ini meta-learning.

---

### 2f. Position Management & Deploy (Cara Mengelola Posisi)

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **Trailing TP 2-phase confirmation** (recheck 15 detik) | ✅ | ✅ (sama) | ❌ (langsung close tanpa recheck) |
| **PnL Watcher** | Embedded di `index.js` (30s `setInterval`) | Embedded di `index.js` | ✅ (dedicated `pnl-watcher.js` — file terpisah) |
| **USDC Mode** (settlement dalam USDC) | ❌ | ❌ | ✅ |
| **Priority Fee Estimation** (via Helius API) | ❌ (hardcode) | ❌ | ✅ (dinamis via Helius `getPriorityFeeEstimate`) |
| **Evil Panda Strategy** (strategi agresif baru) | ❌ | ❌ | ✅ |
| **Two-Sided Spot** (`sol_split_pct` — deploy SOL + token) | ❌ (SOL only) | ❌ (SOL only) | ✅ |
| **MIN_SAFE_BINS_BELOW=35** (minimum bin range safety) | ✅ | ✅ | ❌ |
| **`calculate_bins` tool** (preview bin range sebelum deploy) | ❌ | ❌ | ✅ |
| **`splitRangeBins`** (split range jadi beberapa chunk) | ❌ | ❌ | ✅ |
| **Deploy Strategy Default** | `bid_ask` | `bid_ask` | Evil Panda |
| **Cooldown Logic** (jeda setelah OOR/repeat deploy) | ✅ (lengkap: pool + token + min fee earned) | ✅ | ❌ |
| **Deterministic Close Rules** | ✅ (5 rules: stop loss, take profit, pumped above, OOR, low yield) | ✅ (5 rules) | ✅ (4 rules, berbeda) |
| **State sanitization** (bersihkan teks sebelum simpan) | ✅ `sanitizeStoredText` | ✅ | ❌ |

**Penjelasan key differences:**
- **Trailing TP 2-phase confirmation** adalah fitur keamanan kita: sebelum close karena trailing take-profit, kita tunggu 15 detik lalu cek ulang. Ini mencegah false positive dari data PnL yang fluktuatif. meridian-gh langsung close tanpa recheck — berisiko close di wrong moment.
- **Priority Fee Estimation** yang dinamis (via Helius) penting karena priority fee Solana berubah-ubah. Fee terlalu rendah = transaksi gagal. Fee terlalu tinggi = overpay.
- **USDC Mode** memungkinkan agent bekerja dalam denominasi USDC (stablecoin), bukan SOL yang volatil.

---

### 2g. Telegram Integration (Cara User Berinteraksi)

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **Live Messages** (progress tool real-time di Telegram) | ✅ | ✅ | ❌ |
| **Inline Button Menus** (tombol settings di Telegram) | ✅ (toggle/step buttons untuk setiap setting) | ✅ (sama) | ❌ |
| **Callback Query Handler** (respons klik tombol) | ✅ | ✅ | ❌ |
| **Auth Model** | Manual `chatId` + `ALLOWED_USER_IDS` (aman) | Manual `chatId` + `ALLOWED_USER_IDS` | Auto-register first sender (kurang aman) |
| **Notifier Pub/Sub** | ❌ (direct imports) | ❌ | ✅ `notifier.js` (event bus) |
| **HTML Messages** | ✅ (format kaya) | ✅ | ✅ (dasar) |
| **Bot Commands Register** | ✅ (18 commands terdaftar) | ✅ | ❌ |

**Penjelasan:**
- Telegram UI kita yang paling sophisticated. Live messages menunjukkan progress tool call secara real-time (ℹ️ → ✅/❌ per tool).
- Inline button menus memungkinkan user mengubah settings tanpa mengetik command.
- meridian-gh punya `notifier.js` (pub/sub pattern) yang bagus secara arsitektur — memudahkan penambahan channel notifikasi baru.

---

### 2h. Config System (`config.js`)

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **GMGN Section** | ❌ | ✅ (40+ fields: apiKey, interval, filters, KOL, indicators, dll) | ✅ (sama + extended) |
| **USDC Section** | ❌ | ❌ | ✅ |
| **Autoresearch Section** | ❌ | ❌ | ✅ |
| **Knowledge Base Section** | ❌ | ❌ | ✅ |
| **Memory Section** | ❌ | ❌ | ✅ (`nuggetsFirst` — prioritaskan Nuggets vs lessons) |
| **Web Section** | ❌ | ❌ | ✅ (port configuration) |
| **HiveMind Section** | ✅ (url, apiKey, agentId, pullMode) | ✅ | ❌ |
| **Jupiter Section** | ✅ (apiKey, referralAccount, referralFeeBps) | ✅ | ❌ |
| **API Section** (Agent Meridian) | ✅ (url, publicApiKey, lpAgentRelayEnabled) | ✅ | ❌ |
| **Indicators Section** | ✅ (8 presets, intervals, RSI config) | ✅ | ❌ |
| **Discord Config** | ✅ (useDiscordSignals, discordSignalMode) | ✅ | ❌ |
| **PVP Config** | ✅ (avoidPvpSymbols, blockPvpSymbols) | ✅ | ❌ |
| **`screeningSource`** | ❌ (hardcoded Meteora) | ✅ (`"meteora"` / `"gmgn"`) | ✅ (sama) |
| **Darwin Config** | ✅ | ✅ | ✅ (extended) |
| **`reloadScreeningThresholds()`** | ✅ | ✅ | ✅ |
| **`computeDeployAmount()`** | ✅ | ✅ | ✅ |

---

### 2i. Agent Loop (`agent.js`) — Otak Utama

> **Penjelasan:** `agent.js` berisi loop ReAct (Reasoning + Acting). Agent menerima goal → berpikir → panggil tool → lihat hasil → berpikir lagi → ulangi sampai selesai.

| Aspek | meridian-main | meridian-experimental | meridian-gh |
|-------|:---:|:---:|:---:|
| **OpenAI Client** | ✅ (hardcoded `new OpenAI(...)`) | ✅ (sama) | ✅ (via `llm-provider.js` abstraction) |
| **Role System** | MANAGER / SCREENER / GENERAL | MANAGER / SCREENER / GENERAL | MANAGER / SCREENER / GENERAL + AUTORESEARCH |
| **Intent Matching** (deteksi maksud user) | ✅ `INTENT_PATTERNS` regex (17 patterns) | ✅ (sama) | ❌ (pakai `TOOL_SUMMARIES` text matching — kurang presisi) |
| **`GENERAL_INTENT_ONLY_TOOLS`** (tools yang hanya muncul jika intent cocok) | ✅ | ✅ | ❌ |
| **`ONCE_PER_SESSION` locks** (cegah tool dipanggil 2x) | ✅ (deploy/close/swap) | ✅ (sama) | ✅ (`WRITE_TOOLS`) |
| **Write Tools Serial** (tool tulis dijalankan satu-satu) | ❌ (parallel) | ❌ (parallel) | ✅ (serial — lebih aman tapi lebih lambat) |
| **Fallback Model** | `stepfun/step-3.5-flash:free` | ❌ (tidak ada) | ✅ DeepSeek + per-role fallback chain |
| **Memory Context** (apa yang diinjeksi ke prompt) | lessons + hivemind + decision log | lessons + hivemind + decision log | nuggets + unified-memory + lp-overview |
| **`screenerLoop` export** | ❌ | ❌ | ✅ (bisa dipanggil dari luar) |
| **`lightChat`** (fast path untuk chat ringan) | ❌ | ❌ | ✅ (skip heavy context building) |
| **Provider Mode Switching** (otomatis switch jika system role ditolak) | ✅ (`system` → `user_embedded`) | ✅ | ✅ (5 provider + transcript format switching) |

---

### 2j. Tools Set (Kemampuan Agent)

| Tool | meridian-main | meridian-experimental | meridian-gh | Penjelasan |
|------|:---:|:---:|:---:|------------|
| **deploy_position** | SOL-only, `bins_below` | SOL-only, `bins_below` | `price_range_pct` + `sol_split_pct` | meridian-gh bisa two-sided deploy |
| **calculate_bins** | ❌ | ❌ | ✅ | Preview bin range sebelum deploy |
| **get_pool_info** | ❌ | ❌ | ✅ | Detail info pool |
| **remember_fact / recall_memory / forget_fact** | ❌ | ❌ | ✅ (Nuggets) | Persistent memory CRUD |
| **kb_read / kb_write / kb_search / kb_list / kb_delete / kb_migrate / kb_stats** | ❌ | ❌ | ✅ | Knowledge base operations |
| **get_recent_decisions** | ✅ | ✅ | ❌ | Lihat keputusan terakhir + alasan |
| **block_deployer / unblock_deployer / list_blocked_deployers** | ✅ | ✅ | ❌ | Blokir deployer scammer |
| **pin_lesson / unpin_lesson / list_lessons / clear_lessons** | ✅ | ✅ | ✅ | Manajemen pelajaran |
| **add_to_blacklist / remove_from_blacklist** | ✅ | ✅ | ❌ | Blacklist token |
| **add_pool_note** | ✅ | ✅ | ❌ | Catatan per pool |
| **get_token_narrative** | ✅ | ✅ | ✅ (standalone tool) | Narasi token dari Jupiter |
| **chart indicators tools** | ✅ (via `agent-meridian.js`) | ✅ (via `gmgn.js` import) | ❌ | Konfirmasi indikator teknikal |

---

## Bagian 3 — Repo Keempat: meteora-dlmm-lp-skill

> **Ini repo yang sebelumnya belum tercakup di dokumen perbandingan.**

### 3a. Apa Itu

`fciaf420/meteora-dlmm-lp-skill` adalah **Claude Code Skill** — bukan bot, bukan fork Meridian. Ini adalah file knowledge base (`SKILL.md`) yang ketika di-load oleh Claude Code, membuat Claude menjadi **expert advisor** untuk LP Meteora DLMM.

**URL:** `https://github.com/fciaf420/meteora-dlmm-lp-skill`

### 3b. Struktur File

```
meteora-dlmm-lp-skill/
├── README.md        ← Deskripsi dan cara install
└── SKILL.md         ← Knowledge base utama (114 baris, 8KB)
```

Sangat minimalis — hanya 2 file. Tapi isi `SKILL.md` sangat padat dan berharga.

### 3c. Konten `SKILL.md` — Apa yang Diajarkan

| Topik | Isi | Kenapa Relevan untuk Kita |
|-------|-----|---------------------------|
| **How DLMM Works** | Penjelasan mekanika bin: setiap bin = mini limit order. Active bin = harga pasar saat ini. Swap dalam 1 bin = zero slippage. | Agent kita perlu memahami ini agar bisa memilih bin range yang tepat |
| **Bins & Bin Steps** | Tabel rekomendasi bin step per jenis pair: Stablecoins (1-5 bps), Blue chips (10-25), Mid-cap (25-80), Memecoins (80-200+). Default max bins = 69, bisa extend ke 1400. | Kita sudah punya `minBinStep/maxBinStep` di config tapi agent tidak punya konteks *kenapa* angka-angka itu dipilih |
| **Liquidity Shapes** | 3 bentuk distribusi likuiditas: **Spot** (uniform, forgiving, default choice), **Curve** (bell curve, highest efficiency near center, vulnerable to trending), **Bid-Ask** (inverse curve, good for volatility capture & DCA) | Agent kita selalu deploy `bid_ask` — tapi kadang `spot` atau `curve` lebih tepat tergantung market condition |
| **Dynamic Fees** | Formula: Base Fee = `bin_step × base_factor × 10^power_factor`. Variable fee naik saat volatilitas tinggi (surge pricing). Fee hanya diterima dari bin yang *dilalui* harga. | Membantu agent memahami kenapa fee/TVL berubah dan kapan fee tinggi vs rendah |
| **Impermanent Loss (IL)** | IL di DLMM adalah step-function (bukan continuous). IL terjadi saat harga melewati bin. Dalam satu bin, zero additional IL. | Kritis untuk keputusan kapan close — agent perlu tahu IL tidak smooth tapi per-bin |
| **Single-Sided & DCA** | Bisa deposit 1 token saja. Bid-Ask + single token = DCA strategy (otomatis sell saat harga naik melewati bin). | Membuka strategi baru yang belum kita implementasikan |

### 3d. Contoh Knowledge yang Bisa Langsung Digunakan

Dari `SKILL.md`, tabel bin step recommendation:

```
| Pair Type                  | Suggested Bin Step | Why                                          |
|---                         |---                 |---                                           |
| Stablecoins (USDC/USDT)   | 1-5 bps            | Price barely moves; tight bins               |
| Blue chips (SOL/USDC)     | 10-25 bps          | Moderate volatility; good balance             |
| Mid-cap volatile pairs    | 25-80 bps          | Need wider range to avoid OOR quickly         |
| Memecoins / new launches  | 80-200+ bps        | Extreme volatility; wider bins, higher fees   |
```

Dan penjelasan dynamic fee:
```
Base Fee = bin_step × base_factor × 10^base_fee_power_factor
Variable Fee = meningkat saat volatilitas tinggi (surge pricing)
→ High-volatility periods: fee spike untuk kompensasi IL risk
→ Low activity: fee turun
```

### 3e. Cara Mengintegrasikan ke Fork Kita

Ada 3 opsi:

1. **Paling sederhana:** Copy isi `SKILL.md` ke file `knowledge/dlmm-strategy.md` di repo kita, inject ke system prompt SCREENER.
2. **Medium:** Buat knowledge injection system di `prompt.js` yang membaca file-file dari folder `knowledge/`.
3. **Paling advanced:** Implementasi knowledge-base system seperti di meridian-gh (`knowledge-base.js`).

**Rekomendasi:** Opsi 1 untuk mulai, karena hanya perlu 1 file baru + 3 baris kode di `prompt.js`.

---

## Bagian 4 — Perbedaan Arsitektur Kunci

### 4a. LLM Provider Strategy

```
meridian-main
  └── agent.js → new OpenAI({baseURL: openrouter, apiKey}) → 1 provider
       └── Fallback: stepfun/step-3.5-flash:free (hanya 1 level fallback)

meridian-experimental
  └── agent.js → new OpenAI({baseURL: openrouter, apiKey}) → 1 provider
       └── Fallback: ❌ TIDAK ADA

meridian-gh
  └── agent.js → llm-provider.js → 5 backend:
       ├── claude     (via CLI: claude -p "prompt")
       ├── codex      (via CLI: codex exec "prompt")
       ├── openrouter (via HTTP: OpenAI-compatible API)
       ├── deepseek   (via HTTP: DeepSeek API)
       └── minimax    (via HTTP: MiniMax API)
       └── Fallback: per-role fallback chain + DeepSeek sebagai global fallback
```

**Kenapa ini penting:** Jika satu provider down, agent tanpa fallback tidak bisa bekerja sama sekali. Dengan multi-provider, agent tetap beroperasi walau satu provider down.

### 4b. Sumber Data Screening

```
meridian-main
  └── Meteora Pool Discovery API ─────────────────── "Resmi, stabil, terbatas"
       └── + Discord signals (selfbot listener)

meridian-experimental
  └── Meteora Pool Discovery API ──── configurable ── "Bisa pilih sumber"
       └── ATAU GMGN OpenAPI ──────── via screeningSource config

meridian-gh
  └── Meteora Pool Discovery API ──── configurable ── "Sama + pipeline khusus"
       └── ATAU GMGN OpenAPI
       └── + gmgn-screen.js (pipeline terstruktur)
```

### 4c. Memory & Learning Flow

```
meridian-main
  └── close position → recordPerformance()
       ├── lessons.json  (catatan apa yang berhasil/gagal)
       ├── pool-memory   (riwayat per pool: avg PnL, win rate)
       ├── signal-weights (Darwinian: sinyal bagus naik bobotnya)
       └── HiveMind      (share ke agent lain, pull pelajaran bersama)

meridian-gh
  └── close position → recordPerformance()
       ├── lessons.json + deduplicateLessons() (hapus duplikat)
       ├── pool-memory
       ├── signal-weights (extended config)
       ├── Nuggets holographic memory (persistent cross-session)
       ├── knowledge-base.js (markdown articles)
       └── autoresearch.js (auto-tune prompt dari pattern wins/losses)
```

### 4d. UI / Control Surface

```
meridian-main
  ├── REPL (terminal interaktif — ketik perintah langsung)
  ├── Telegram (sophisticated: live msg progress, inline buttons, 18 commands)
  └── Claude Code CLI (slash commands: /screen, /manage, /balance, dll)

meridian-experimental
  ├── REPL
  └── Telegram (sama seperti main, tanpa Claude Code)

meridian-gh
  ├── REPL
  ├── Telegram (sederhana — tanpa live msg atau inline buttons)
  └── Web Dashboard (React + TypeScript + WebSocket — visual monitoring)
```

---

## Bagian 5 — Keunggulan Masing-masing Versi

### meridian-main (Fork Kita) — Paling Siap Production & Paling Defensif

**Keunggulan unik (tidak ada di versi lain):**

| Fitur | Penjelasan Singkat |
|-------|-------------------|
| ✅ Claude Code sub-agents & slash commands | Bisa berinteraksi via Claude Code IDE |
| ✅ Discord Listener untuk LP Army signals | Sumber sinyal tambahan dari komunitas |
| ✅ HiveMind shared learning + cache | Belajar dari agent lain |
| ✅ Decision Log (rolling 100 entries) | Audit trail: kenapa deploy? kenapa skip? |
| ✅ Deployer Blocklist + Token Blacklist | Filter scammer yang sudah teridentifikasi |
| ✅ Chart Indicators (8 presets teknikal) | Validasi entry/exit dengan RSI, Supertrend, Bollinger, Fibonacci |
| ✅ PVP Rival Detection | Deteksi token kompetitor yang bisa bikin harga jatuh |
| ✅ PM2 ecosystem (`ecosystem.config.cjs`) | Production deployment dengan auto-restart |
| ✅ Telegram live messages & inline button settings | UI paling sophisticated |
| ✅ `screening-scales.js` (threshold per timeframe) | Adaptasi filter ke market condition |
| ✅ Environment encryption (`envcrypt.js`) | Keamanan kunci API |
| ✅ `jsonrepair` (perbaiki JSON rusak dari LLM) | Resilience terhadap LLM murah |
| ✅ Trailing TP 2-phase confirmation (15s recheck) | Cegah false positive close |
| ✅ Lone Candidate Skip rule | Tolak kandidat tunggal yang kurang bagus |
| ✅ Strategy Library (5 preset + persistence) | Koleksi strategi tersimpan |
| ✅ CLAUDE.md (436 baris engineering manual) | Dokumentasi arsitektur lengkap |

### meridian-experimental — GMGN Integration

**Keunggulan unik:**

| Fitur | Penjelasan Singkat |
|-------|-------------------|
| ✅ **GMGN OpenAPI client** (733 baris) | Data screening yang sangat kaya |
| — Security check | Deteksi honeypot, wash trading, rug ratio, renounced authority |
| — KOL/smart money tracking | Siapa yang hold? Dump atau accumulate? |
| — Holder analysis | Bundler, sniper, fresh wallet detection |
| — Indicator rules | Supertrend, RSI, Bollinger dari data GMGN |
| — Trending pool discovery | Alternatif dari Meteora discovery |
| ✅ `screeningSource` config | Bisa pilih Meteora atau GMGN |
| ✅ HiveMind documentation | Dokumentasi lengkap di `docs/` |

**Kehilangan dari main:** Claude Code, Discord listener, `chart-indicators.js`, strategy library persist, HiveMind cache, `envcrypt.js`.

### meridian-gh — Paling Inovatif & Fitur Terbanyak

**Keunggulan unik:**

| Fitur | Penjelasan Singkat |
|-------|-------------------|
| ✅ **5 LLM Provider** dengan fallback chain | Resilience: jika 1 down, pindah ke yang lain |
| ✅ **Web Dashboard** (React + TypeScript + WebSocket) | Monitoring visual real-time |
| ✅ **Nuggets Holographic Memory** | Memory persistens lintas sesi — agent ingat fakta lama |
| ✅ **Knowledge Base** (markdown article system) | Menyimpan dan mengquery pengetahuan terstruktur |
| ✅ **Autoresearch** (ATLAS-inspired) | Auto-tune prompt screening dari pattern nyata |
| ✅ **USDC Mode** | Deploy/close settlement dalam USDC (stabil) |
| ✅ **GMGN Screening** (full pipeline) | `gmgn-screen.js` — pipeline terstruktur |
| ✅ **Evil Panda Strategy** | Strategi agresif baru untuk volatile markets |
| ✅ **PnL Watcher** dedicated daemon | Monitoring PnL terpisah — lebih responsif |
| ✅ **Priority Fee Estimation** via Helius | Dynamic priority fee — tidak overpay, tidak gagal |
| ✅ **Lesson Dedup & Lesson-based Evolution** | Lessons bersih + self-improvement otomatis |
| ✅ **`calculate_bins` tool** | Preview bin range sebelum deploy |
| ✅ **`lightChat` fast-path** | Jalur cepat untuk chat ringan (hemat token) |
| ✅ **Notifier Pub/Sub** (`notifier.js`) | Event bus — mudah tambah channel notifikasi |
| ✅ **Degraded File Recovery** | Pemulihan otomatis file JSON yang rusak |
| ✅ **Two-Sided Deploy** (`sol_split_pct`) | Deploy SOL + token sekaligus |
| ✅ **Write Tools Serial Execution** | Tool write dijalankan satu-satu — lebih aman |

**Kehilangan dari main:** HiveMind, Discord listener, PVP detection, chart indicators, decision log tools, deployer blocklist, PM2 ecosystem, envcrypt, screening-scales, Telegram live messages & inline buttons, Claude Code integration, `jsonrepair`, lone candidate skip, trailing TP recheck, `sanitizeStoredText`.

### meteora-dlmm-lp-skill — Knowledge Base Murni

| Fitur | Penjelasan Singkat |
|-------|-------------------|
| ✅ **Expert knowledge Meteora DLMM** | Panduan strategi LP yang sangat mendalam |
| — Bin step recommendation per pair type | Stablecoins: 1-5 bps, Memecoins: 80-200+ bps |
| — Liquidity shape selection guide | Kapan pakai Spot vs Curve vs Bid-Ask |
| — Dynamic fee formula | Cara fee bekerja di DLMM |
| — IL (Impermanent Loss) mechanics | IL step-function, bukan continuous |
| — Single-sided DCA strategy | Bid-Ask + single token = auto DCA |

**Bukan bot.** Ini murni knowledge yang bisa diinjeksikan ke system prompt agent kita.

---

## Bagian 6 — Apa yang Bisa Dipelajari & Diimplementasikan

> **Bagian ini menjelaskan FITUR KONKRET apa yang bisa kita ambil dari masing-masing repo, dan BAGAIMANA cara mengimplementasikannya.**

### 6a. Dari meridian-experimental: GMGN OpenAPI Integration

**Apa:** Integrasi dengan GMGN OpenAPI untuk mendapatkan data token yang jauh lebih kaya dibanding Meteora discovery saja.

**Kenapa penting:** Saat ini screening kita hanya mengandalkan data dari Meteora Pool Discovery API. Data ini terbatas — kita tidak tahu apakah token honeypot, berapa rug ratio-nya, atau siapa KOL yang hold. GMGN memberikan semua data ini.

**Apa saja yang bisa kita dapat dari GMGN:**
1. **Trending Pool Discovery** — menemukan pool yang sedang trending berdasarkan data GMGN, bukan hanya Meteora.
2. **Security Check** — `is_renounced`, `is_honeypot`, `wash_trading_score`, `rug_ratio`.
3. **KOL Tracking** — daftar KOL yang hold token, apakah mereka beli atau dump, rasio preferred vs dump KOL.
4. **Holder Quality** — persentase bundler, sniper, fresh wallet (indikator manipulasi).
5. **Indicator Rules** — konfirmasi teknikal (Supertrend, RSI, Bollinger) langsung dari data GMGN.

**File yang perlu dibuat:**
- `tools/gmgn.js` — Port dari `experimental:tools/gmgn.js` (733 baris).
- `tools/gmgn-screen.js` — Pipeline wrapper (opsional, bisa mulai tanpa ini).
- Tambahan config section `gmgn` di `config.js`.
- Tambahan env var `GMGN_API_KEY` di `.env.example`.

**Yang harus diperhatikan:**
- GMGN memerlukan API key — perlu didaftarkan.
- Bisa dimulai dengan mode `hybrid`: Meteora tetap primary, GMGN hanya sebagai pengayaan data (security check + KOL di atas kandidat Meteora).
- Jangan hapus fitur existing (Discord signals, PVP detection, chart indicators) saat menambah GMGN.

**Estimasi effort:** 3-5 hari untuk port + integrasi + testing.

---

### 6b. Dari meridian-gh: Multi-LLM Provider Abstraction

**Apa:** Abstraksi layer yang memungkinkan agent menggunakan beberapa LLM provider dengan fallback chain.

**Kenapa penting:** Saat ini kita hanya punya 1 provider (OpenRouter). Jika OpenRouter mengalami gangguan (502, 503, 529), agent kita hanya bisa retry beberapa kali lalu menyerah. Dengan multi-provider, agent otomatis pindah ke provider lain.

**Bagaimana cara kerjanya di meridian-gh:**
```
Request masuk → coba Provider #1 (OpenRouter)
  ├── Berhasil → selesai
  └── Gagal → coba Provider #2 (DeepSeek)
       ├── Berhasil → selesai
       └── Gagal → coba Provider #3 (MiniMax)
            └── dst...
```

**Yang perlu kita implementasikan:**
- File baru `llm-provider.js` — factory function yang membuat OpenAI client untuk setiap provider.
- Modify `agent.js` — ganti hardcoded `new OpenAI({...})` dengan factory function + fallback chain.
- Tambahan env vars: `DEEPSEEK_API_KEY`, `LLM_FALLBACK_PROVIDER`, dll.

**Yang harus dipertahankan:**
- `jsonrepair` — ini kekuatan kita yang tidak ada di meridian-gh. LLM murah sering output JSON rusak. Tanpa repair, agent crash.
- `INTENT_PATTERNS` regex — lebih presisi daripada `TOOL_SUMMARIES` text matching di meridian-gh.
- `ONCE_PER_SESSION` locks — safety guard kita yang mencegah double-deploy.

**Estimasi effort:** 3-4 hari.

---

### 6c. Dari meteora-dlmm-lp-skill: DLMM Strategy Knowledge Injection

**Apa:** Menginjeksikan expert knowledge tentang strategi LP DLMM ke system prompt agent, sehingga agent punya konteks mendalam tentang bin steps, liquidity shapes, dynamic fees, dan impermanent loss.

**Kenapa penting:** Saat ini system prompt kita (`prompt.js`) berisi instruksi operasional, tapi tidak berisi *pengetahuan domain* tentang DLMM. Agent harus mengandalkan pengetahuan dari training data LLM, yang mungkin outdated atau general.

**Contoh impact:**
- Tanpa knowledge injection: Agent deploy `bid_ask` di semua market condition karena itulah default.
- Dengan knowledge injection: Agent tahu bahwa untuk market sideways, `spot` shape lebih resilient; untuk token launch, `bid_ask` dengan bin step 80-200+ bps lebih tepat.

**Cara implementasi (paling sederhana):**
1. Buat folder `knowledge/` di root repo.
2. Copy konten `SKILL.md` ke `knowledge/dlmm-strategy.md`.
3. Di `prompt.js`, tambahkan kode berikut di `buildSystemPrompt()` untuk role SCREENER:
   ```javascript
   // Di dalam buildSystemPrompt(), setelah sections lain:
   if (agentType === "SCREENER") {
     try {
       const knowledgePath = repoPath("knowledge/dlmm-strategy.md");
       if (fs.existsSync(knowledgePath)) {
         const knowledge = fs.readFileSync(knowledgePath, "utf8").slice(0, 2000);
         sections.push(`── DLMM STRATEGY KNOWLEDGE ──\n${knowledge}`);
       }
     } catch { /* non-critical */ }
   }
   ```

**Estimasi effort:** 1 hari (termasuk tuning token budget).

---

### 6d. Dari meridian-gh: Lesson Deduplication

**Apa:** Fungsi `deduplicateLessons()` yang menghapus pelajaran duplikat dari `lessons.json`.

**Kenapa penting:** Setiap kali agent close posisi, pelajaran baru ditambahkan ke `lessons.json`. Setelah ratusan close, file ini bisa berisi pelajaran yang mirip atau identik. Ini:
1. **Buang token LLM** — duplikat diinjeksi ke prompt tanpa value tambahan.
2. **Noise** — pelajaran yang saling bertentangan (dari market condition berbeda) membingungkan LLM.
3. **File bloat** — `lessons.json` terus membesar tanpa batas.

**Cara implementasi:**
1. Tambahkan fungsi `deduplicateLessons()` di `lessons.js`:
   - Normalize setiap pelajaran (lowercase, replace angka dengan "N", trim whitespace).
   - Gunakan normalized text sebagai hash key.
   - Jika ada duplikat, pertahankan yang confidence-nya lebih tinggi.
   - Merge tags dari semua versi.
2. Panggil `deduplicateLessons()` setiap N `recordPerformance()` calls (misal setiap 10 close).

**Estimasi effort:** 1 hari.

---

### 6e. Dari meridian-gh: Dedicated PnL Watcher

**Apa:** Memisahkan PnL polling logic dari `index.js` ke file terpisah `pnl-watcher.js`.

**Kenapa penting:**
1. **Separation of concerns** — `index.js` sudah 2000 baris. Semakin besar, semakin sulit debug.
2. **Testability** — PnL watcher terpisah lebih mudah di-test.
3. **Tunability** — Bisa adjust interval, thresholds, dll tanpa menyentuh file utama.

**Saat ini di kita:** PnL poller tertanam di `index.js` sebagai `setInterval(async () => { ... }, 30_000)` (baris 746-797). Logic-nya:
- Skip jika management/screening sedang berjalan.
- Fetch positions via `getMyPositions({ force: true })`.
- Cek trailing TP peak confirmation + trailing drop confirmation.
- Jika exit alert, trigger management cycle (dengan cooldown).

**Cara implementasi:**
1. Extract blok tersebut ke `pnl-watcher.js`.
2. Export `startPnlWatcher(opts)` dan `stopPnlWatcher()`.
3. Di `index.js`, ganti `setInterval` dengan `startPnlWatcher()` call.
4. Pass dependencies via options object (bukan import langsung) untuk decoupling.

**Estimasi effort:** 1 hari.

---

### 6f. Dari meridian-gh: Priority Fee Estimation via Helius

**Apa:** Menggunakan Helius RPC `getPriorityFeeEstimate` untuk menentukan priority fee secara dinamis, bukan hardcode.

**Kenapa penting:** Priority fee di Solana berubah-ubah tergantung network congestion:
- Fee terlalu rendah → transaksi gagal (tidak diproses validator).
- Fee terlalu tinggi → overpay (buang uang).
- Fee dinamis → optimal: cukup untuk konfirmasi, tidak berlebihan.

**Cara implementasi:**
1. Tambahkan helper function di `tools/dlmm.js`:
   ```javascript
   async function estimatePriorityFee(accountKeys = []) {
     const heliusKey = process.env.HELIUS_API_KEY;
     if (!heliusKey) return 200_000; // fallback default jika tidak ada Helius key
     try {
       const resp = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           jsonrpc: "2.0", id: 1,
           method: "getPriorityFeeEstimate",
           params: [{ accountKeys, options: { recommended: true } }],
         }),
       });
       const { result } = await resp.json();
       return result?.priorityFeeEstimate ?? 200_000;
     } catch {
       return 200_000; // fallback on error
     }
   }
   ```
2. Panggil sebelum `deployPosition()` dan `closePosition()` untuk set `computeUnitPrice` pada transaksi.

**Prasyarat:** `HELIUS_API_KEY` di `.env` (sudah recommended di kita, tapi belum dipakai untuk priority fee).

**Estimasi effort:** 1 hari.

---

### 6g. Dari meridian-gh: Notifier Pub/Sub Pattern

**Apa:** Event bus sederhana (`notifier.js`) yang decouple notifikasi dari core logic.

**Kenapa penting:** Saat ini kode kita memanggil `sendMessage()`, `notifyDeploy()`, dll secara langsung dari `index.js` dan `tools/executor.js`. Ini berarti:
- Setiap kali mau tambah channel notifikasi baru (webhook, web dashboard, logging), harus edit banyak file.
- Susah disable satu channel tanpa mempengaruhi yang lain.
- Testing jadi sulit karena notifikasi tercampur logic bisnis.

**Cara implementasi:**
1. Buat `notifier.js` — event emitter sederhana:
   ```javascript
   import { EventEmitter } from "events";
   const emitter = new EventEmitter();
   export const EVENTS = {
     DEPLOY: "position:deployed",
     CLOSE: "position:closed",
     CLAIM: "fees:claimed",
     EXIT_ALERT: "position:exit_alert",
     // ... dll
   };
   export function emit(event, data) { emitter.emit(event, data); }
   export function on(event, handler) { emitter.on(event, handler); }
   ```
2. Di `telegram.js`, register listener: `on(EVENTS.DEPLOY, (data) => notifyDeploy(data))`.
3. Di `executor.js`, ganti `notifyDeploy(...)` langsung dengan `emit(EVENTS.DEPLOY, data)`.

**Estimasi effort:** 1-2 hari.

---

### 6h. Dari meridian-gh: USDC Mode & Two-Sided Deploy

**Apa:**
- **USDC Mode:** Deploy/close/settle dalam USDC bukan SOL. SOL otomatis di-swap ke USDC sebelum deploy, dan USDC di-swap ke SOL setelah close.
- **Two-Sided Deploy:** Deploy SOL + token sekaligus (bukan SOL-only). Parameter `sol_split_pct` menentukan berapa persen SOL vs token.

**Kenapa penting:**
- USDC mode mengurangi eksposur terhadap volatilitas SOL sendiri. Saat SOL turun 10%, nilai portfolio kita juga turun 10% meskipun LP position kita OK.
- Two-sided deploy membuka strategi baru: full range positions, more fee capture di active bin.

**Estimasi effort:** 3-5 hari (melibatkan perubahan di `tools/dlmm.js`, `config.js`, `tools/definitions.js`, `tools/executor.js`).

---

### 6i. Dari meridian-gh: Autoresearch (Meta-Learning)

**Apa:** System yang menganalisis pattern dari result close yang sudah terjadi (50+), lalu otomatis memodifikasi screening prompt untuk meningkatkan hit rate.

**Contoh:**
- Agent notice bahwa 80% winning positions punya `organic_score > 85` dan `fee_tvl_ratio > 0.1`.
- Agent otomatis menambahkan hint ke screener prompt: "Prioritaskan pool dengan organic > 85 dan fee/TVL > 0.1."

**Kenapa di-ranking rendah:** Membutuhkan banyak data (50+ closes) dan berisiko overfit ke recent market conditions. Perlu framework evaluasi yang fair.

**Rekomendasi:** Implementasikan versi "lite" dulu yang hanya menganalisis dan menampilkan insight, tanpa otomatis memodifikasi prompt. User bisa review dulu sebelum mengapply.

**Estimasi effort:** 5-7 hari untuk versi lite.

---

### 6j. Dari meridian-gh: Web Dashboard

**Apa:** Full React + TypeScript web application dengan WebSocket untuk monitoring real-time.

**Rekomendasi: TUNDA.** Alasan:
1. Fork kita sudah punya Telegram UI yang sophisticated (live messages, inline buttons, 18 commands).
2. Sudah punya Claude Code slash commands.
3. Web dashboard effort-nya tinggi (1-2 minggu), impact-nya rendah untuk trading performance.
4. Fokus ke fitur yang meningkatkan *keputusan trading* (GMGN, multi-provider, knowledge injection) lebih berdampak.

---

## Bagian 7 — Roadmap Implementasi yang Disarankan

### Phase 1: Quick Wins (masing-masing 1-2 hari)

Fitur-fitur yang low-effort, high-impact, dan tidak mengubah arsitektur existing.

| # | Fitur | Sumber | Effort | Impact |
|---|-------|--------|--------|--------|
| 1 | DLMM Strategy Knowledge Injection | meteora-dlmm-lp-skill | 1 hari | Agent punya domain expertise |
| 2 | Lesson Deduplication | meridian-gh | 1 hari | Prompt lebih bersih, hemat token |
| 3 | PnL Watcher Extraction | meridian-gh | 1 hari | Kode lebih modular |
| 4 | Priority Fee Estimation | meridian-gh | 1 hari | Transaksi lebih reliable |
| 5 | Notifier Pub/Sub | meridian-gh | 1-2 hari | Arsitektur lebih bersih |

### Phase 2: Medium Effort (masing-masing 3-5 hari)

Fitur yang perlu perubahan di beberapa file tapi value-nya tinggi.

| # | Fitur | Sumber | Effort | Impact |
|---|-------|--------|--------|--------|
| 6 | GMGN OpenAPI Integration | experimental | 3-5 hari | Data screening JAUH lebih kaya |
| 7 | Multi-LLM Provider Abstraction | meridian-gh | 3-4 hari | Resilience & cost optimization |
| 8 | USDC Mode & Two-Sided Deploy | meridian-gh | 3-5 hari | Strategi baru + stabilitas |

### Phase 3: Major Features (masing-masing 1-2 minggu)

Fitur besar yang perlu desain arsitektur baru.

| # | Fitur | Sumber | Effort | Impact |
|---|-------|--------|--------|--------|
| 9 | Autoresearch Lite | meridian-gh | 5-7 hari | Self-improving screening |
| 10 | Web Dashboard | meridian-gh | 2 minggu | Visual monitoring (opsional) |

### Prinsip Implementasi

> [!IMPORTANT]
> **Jangan hapus fitur existing saat menambah fitur baru.** Banyak fitur kita (PVP detection, chart indicators, Discord listener, HiveMind, jsonrepair, trailing TP recheck, lone candidate skip) adalah keunggulan yang tidak ada di repo lain. Fitur baru harus *ditambahkan di atas* basis yang sudah ada, bukan menggantikan.

> [!IMPORTANT]
> **Test di DRY_RUN mode dulu.** Setiap perubahan di screening/management pipeline harus ditest dengan `DRY_RUN=true` sebelum production.

> [!IMPORTANT]
> **Perhatikan token budget.** Setiap data yang diinjeksi ke system prompt (GMGN data, knowledge base, lessons) menambah token usage. Pastikan total prompt tidak melebihi context window model yang dipakai. Truncate jika perlu.

---

## Lampiran A — Tabel Ringkasan Semua File

| File | main | exp | gh | skill |
|------|:---:|:---:|:---:|:---:|
| `index.js` | ✅ ~2000 baris | ✅ | ✅ (berbeda) | ❌ |
| `agent.js` | ✅ 417 baris | ✅ | ✅ (via llm-provider) | ❌ |
| `config.js` | ✅ 277 baris | ✅ + GMGN section | ✅ + banyak section baru | ❌ |
| `prompt.js` | ✅ | ✅ | ✅ | ❌ |
| `state.js` | ✅ | ✅ | ✅ | ❌ |
| `lessons.js` | ✅ | ✅ | ✅ + dedup + evolve | ❌ |
| `pool-memory.js` | ✅ | ✅ | ✅ | ❌ |
| `signal-weights.js` | ✅ | ✅ | ✅ | ❌ |
| `telegram.js` | ✅ (sophisticated) | ✅ | ✅ (sederhana) | ❌ |
| `hivemind.js` | ✅ | ✅ | ❌ | ❌ |
| `decision-log.js` | ✅ | ✅ | ❌ | ❌ |
| `strategy-library.js` | ✅ (+ JSON persist) | ❌ | ❌ | ❌ |
| `screening-scales.js` | ✅ | ✅ | ❌ | ❌ |
| `smart-wallets.js` | ✅ | ✅ | ✅ | ❌ |
| `token-blacklist.js` | ✅ | ✅ | ❌ | ❌ |
| `dev-blocklist.js` | ✅ | ✅ | ❌ | ❌ |
| `envcrypt.js` | ✅ | ✅ | ❌ | ❌ |
| `briefing.js` | ✅ | ✅ | ✅ | ❌ |
| `logger.js` | ✅ | ✅ | ✅ | ❌ |
| `cli.js` | ✅ | ✅ | ❌ | ❌ |
| `setup.js` | ✅ | ✅ | ❌ | ❌ |
| `llm-provider.js` | ❌ | ❌ | ✅ | ❌ |
| `notifier.js` | ❌ | ❌ | ✅ | ❌ |
| `pnl-watcher.js` | ❌ | ❌ | ✅ | ❌ |
| `autoresearch.js` | ❌ | ❌ | ✅ | ❌ |
| `knowledge-base.js` | ❌ | ❌ | ✅ | ❌ |
| `memory.js` / `unified-memory.js` | ❌ | ❌ | ✅ | ❌ |
| `server.js` / `session.js` | ❌ | ❌ | ✅ | ❌ |
| `tools/gmgn.js` | ❌ | ✅ (733 baris) | ✅ (versi berbeda) | ❌ |
| `tools/gmgn-screen.js` | ❌ | ❌ | ✅ | ❌ |
| `tools/usdc-mode.js` | ❌ | ❌ | ✅ | ❌ |
| `tools/chart-indicators.js` | ✅ (8 presets) | ✅ (via gmgn.js) | ❌ | ❌ |
| `tools/agent-meridian.js` | ✅ | ❌ | ❌ | ❌ |
| `tools/lp-overview.js` | ❌ | ❌ | ✅ | ❌ |
| `tools/knowledge-base-tools.js` | ❌ | ❌ | ✅ | ❌ |
| `tools/knowledge-graph.js` | ❌ | ❌ | ✅ | ❌ |
| `discord-listener/` | ✅ | ❌ | ❌ | ❌ |
| `.claude/` | ✅ | ❌ | ❌ | ❌ |
| `web/` | ❌ | ❌ | ✅ (React+TS) | ❌ |
| `packages/nuggets/` | ❌ | ❌ | ✅ | ❌ |
| `SKILL.md` | ❌ | ❌ | ❌ | ✅ (knowledge base) |
| `CLAUDE.md` | ✅ (436 baris) | ❌ | ❌ | ❌ |

---

## Lampiran B — Glosarium Istilah

| Istilah | Penjelasan |
|---------|-----------|
| **DLMM** | Dynamic Liquidity Market Maker — protokol AMM (Automated Market Maker) di Meteora yang menggunakan sistem "bin" untuk concentrasi likuiditas |
| **Bin** | Kotak harga diskrit. Setiap bin punya harga tetap. LP menaruh likuiditas di range bin tertentu |
| **Active Bin** | Bin yang sedang menjadi harga pasar saat ini |
| **Bin Step** | Jarak harga antara 2 bin berurutan, dalam basis points (bps). 1 bps = 0.01% |
| **In Range** | Harga masih di dalam range bin yang kita pasang → kita dapat fee |
| **Out of Range (OOR)** | Harga sudah di luar range kita → kita tidak dapat fee |
| **PnL** | Profit and Loss — untung atau rugi |
| **Trailing TP** | Trailing Take Profit — ambil untung otomatis. Saat PnL naik di atas trigger, catat peak. Saat PnL turun X% dari peak, close |
| **LP** | Liquidity Provider — orang/bot yang menyediakan likuiditas ke pool |
| **LLM** | Large Language Model — model AI besar seperti GPT-4, Claude, DeepSeek yang bisa memahami instruksi dan membuat keputusan |
| **ReAct Loop** | Reasoning + Acting loop — agent menerima goal → berpikir → panggil tool → lihat hasil → berpikir lagi → dst |
| **OpenRouter** | Layanan yang menyediakan akses ke banyak LLM via satu API |
| **HiveMind** | Sistem sharing pelajaran antar agent Meridian. Satu agent belajar, semua agent mendapat manfaat |
| **GMGN** | API pihak ketiga yang memberikan data enrichment tentang token Solana (security, KOL, holders) |
| **KOL** | Key Opinion Leader — influencer crypto yang followers-nya mengikuti trading-nya |
| **PVP** | Player vs Player — situasi di mana ada 2 pool untuk token yang mirip (misalnya BONK vs BONK2). LP di satu pool bisa rugi jika trader pindah ke pool lain |
| **Darwinian Weights** | Sistem bobot sinyal evolusioner. Sinyal yang sering muncul di winning positions bobotnya naik. Yang sering di losing positions, turun |
| **Nuggets** | Holographic memory system di meridian-gh. Menyimpan fakta-fakta yang bisa di-recall lintas sesi |
| **Priority Fee** | Fee tambahan di Solana agar transaksi diproses lebih cepat oleh validator |
| **Pub/Sub** | Publish/Subscribe pattern — pengirim event (publish) terpisah dari penerima (subscribe). Decoupling |
| **DCA** | Dollar-Cost Averaging — strategi beli/jual bertahap di berbagai harga |
| **IL** | Impermanent Loss — kerugian sementara LP dibanding hold. Di DLMM, IL terjadi per-bin (step-function) |

---

## Bagian 8 — Rekomendasi Ekstra untuk Fork Ini (Kuat, Akurat, Cuan, Tanpa Ribet)

Berdasarkan analisis pada kodebase Anda saat ini (`meridian-main`), ada beberapa penambahan **low-hanging fruit** (mudah diterapkan tapi berdampak besar) yang **tidak ada di repo lain** namun sangat disarankan untuk ditambahkan ke kode Anda. 

Tujuannya adalah: **Profit lebih tinggi, risiko lebih rendah, dan bot tidak mudah "nyangkut".**

### 1. Smart "Dust" Swap (✅ Sudah Diimplementasikan)
**Apa itu:** Saat bot melakukan `close_position`, ia akan men-swap token kembali ke SOL jika nilainya di atas $0.10. 
**Penyelesaian Masalah:** Jika transaksi swap gagal karena slippage atau RPC error, token sebelumnya tertinggal di wallet menjadi "dust". Kini telah ditambahkan fungsi `sweepDust()` yang berjalan otomatis setiap 24 jam di `index.js`. Fungsi ini akan mengecek token selain SOL yang bernilai > $0.50 dan bot tidak memiliki posisi terbuka di token tersebut, lalu otomatis men-swapnya kembali ke SOL.
**Keuntungan:** Menjaga kebersihan wallet, mengatasi isu auto-swap yang kadang gagal saat *close position*, dan mengembalikan modal yang nyangkut.
*(Tambahan: Perbaikan isu konfirmasi false positive saat close position juga telah diterapkan pada `dlmm.js`)*

### 2. Auto-Pause saat Market Crash (Circuit Breaker)
**Masalah saat ini:** Bot akan terus mencari pool dan deploy meskipun harga SOL sedang jatuh bebas (market crash). LP di saat crash sangat berisiko karena Impermanent Loss (IL) akan sangat besar dan nilai portfolio turun drastis.
**Solusi Mudah:** Tambahkan pengecekan sederhana di pipeline screening: "Jika harga SOL turun lebih dari 5% dalam 1 jam terakhir, berhentikan otomatis fungsi deploy selama 2 jam."
**Keuntungan:** Mencegah bot "menangkap pisau jatuh" (catch a falling knife) dan menghemat modal saat market sedang tidak rasional.

### 3. Dynamic Bin Step Berdasarkan Volatilitas (✅ Sudah Diimplementasikan)
**Apa itu:** Menyesuaikan kerapatan bin (bin_step) secara otomatis berdasarkan profil risiko token sebelum diberikan ke agen AI.
**Penyelesaian Masalah:** Agen AI sering memilih `bin_step` yang tidak sesuai dengan karakteristik aset. Di file `executor.js`, kami menyuntikkan fungsi filter pada fungsi eksekusi untuk setiap data kandidat kolam (pool):
- Jika Token Tipe "Meme/Baru" (umur < 24 jam, mcap < $1M): **Paksakan** `bin_step` minimal 80.
- Jika Token Tipe "Bluechip/Lama" (umur > 7 hari, mcap > $50M): **Paksakan** `bin_step` maksimal 29 (di bawah 30).
**Keuntungan:** Mengurangi kesalahan agen AI dalam memilih kerapatan bin. Bin yang terlalu rapat di memecoin = cepat *Out of Range*. Bin terlalu lebar di bluechip = *fee* sangat kecil.

### 4. Pencegahan "Re-Deploy" Dendam (Revenge Trading Guard)
**Masalah saat ini:** Kode Anda sudah punya `repeatDeployCooldownEnabled`, tapi berbasis *pool*. Agen bisa saja deploy di pool A (token X), rugi, lalu langsung deploy di pool B (token X versi lain).
**Solusi Mudah:** Perkuat sistem cooldown agar mengecek berdasarkan **Mint Address Token**, bukan hanya alamat pool. Jika token X baru saja membuat bot rugi/stop-loss, blokir token X tersebut selama 24 jam penuh di semua pool.
**Keuntungan:** Mencegah bot dipermainkan oleh token yang sama berulang-ulang.

### 5. Pencatatan PnL Netto yang Lebih Jujur (✅ Sudah Diimplementasikan)
**Masalah saat ini:** Di `lessons.js`, PnL dihitung dari `(final_value_usd + fees_earned_usd) - initial_value_usd`. Namun, **gas fee** dan **priority fee** tidak dihitung. Pada modal kecil (< 0.5 SOL), gas fee bisa menggerus keuntungan.
**Solusi Mudah:** Di `recordPerformance()`, kurangi PnL dengan estimasi biaya transaksi (misal flat $0.05 per transaksi * 2 untuk open/close).
**Keuntungan:** Bot (dan agen AI) akan belajar bahwa *take profit* terlalu kecil ($0.10) sebenarnya adalah kerugian karena habis di ongkos gas. Agen akan menjadi lebih sabar.

**Kesimpulan:** 
Untuk meningkatkan performa *meridian-main* Anda tanpa membuatnya rumit, prioritas utamanya bukanlah menambah LLM baru atau dashboard mewah, melainkan **memperketat manajemen risiko mekanis** (Circuit Breaker, Dust Sweeping, Revenge Guard) agar modal tidak bocor secara diam-diam.

---

## Bagian 9 — Memaksimalkan LLM Murah/Flash untuk Meridian (Panduan Lengkap)

> **Konteks:** Anda menggunakan `deepseek/deepseek-v4-flash` via OpenRouter sebagai otak keputusan bot LP ini. Model flash/murah sangat efisien secara biaya (penting untuk bot 24/7), tetapi rentan halusinasi, lemah di penalaran abstrak, dan mudah bingung jika diberikan terlalu banyak konteks sekaligus. Bagian ini menjelaskan cara **memeras performa maksimal** dari model murah tanpa mengganti ke model mahal.

### Filosofi Utama: "LLM sebagai Eksekutor, Bukan Analis"

```
┌─────────────────────────────────────────────────────────────────┐
│ ARSITEKTUR KEPUTUSAN MERIDIAN-MAIN                              │
│                                                                 │
│   DATA MENTAH                                                   │
│   (API Meteora, GMGN, Jupiter)                                  │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────────┐     ← KODE JavaScript melakukan:          │
│   │  HARD FILTERS   │       - Filter TVL, Volume, Organic       │
│   │  (screening.js, │       - Block bot holders > 30%            │
│   │   index.js,     │       - Block launchpad tertentu           │
│   │   executor.js)  │       - Block bin_step di luar range       │
│   └────────┬────────┘       - Block PVP symbols                  │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐     ← KODE JavaScript melakukan:          │
│   │   ENRICHMENT    │       - Fetch smart wallets                │
│   │   (index.js     │       - Fetch narrative                    │
│   │    screening    │       - Fetch token info + audit           │
│   │    cycle)       │       - Pre-fetch active_bin               │
│   └────────┬────────┘       - Compute bins_below formula         │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐     ← LLM HANYA melakukan:               │
│   │   LLM DECISION  │       - Pilih 1 dari 2-5 kandidat         │
│   │   (prompt.js +  │       - Evaluasi narrative quality         │
│   │    agent.js)    │       - Call deploy_position               │
│   └─────────────────┘       - Tulis laporan singkat              │
│                                                                 │
│   ┌─────────────────┐     ← KODE JavaScript melakukan:          │
│   │   MANAGEMENT    │       - Stop loss (deterministik)          │
│   │   (index.js     │       - Take profit (deterministik)        │
│   │    getDetermini │       - OOR close (deterministik)          │
│   │    sticClose    │       - Low yield close (deterministik)    │
│   │    Rule)        │       - LLM hanya dipanggil jika ada       │
│   └─────────────────┘         action (bukan STAY)               │
└─────────────────────────────────────────────────────────────────┘
```

**Insight kunci:** Semakin banyak keputusan yang bisa dipindahkan ke JavaScript (deterministik), semakin sedikit beban di LLM, dan semakin kecil peluang kesalahan. Model murah paling optimal jika hanya diminta membuat 1-2 keputusan sederhana per siklus.

---

### Strategi 1: Turunkan Temperature ke Titik Analitis

**Apa itu Temperature?**
Temperature mengontrol "keacakan" output LLM. Semakin tinggi (misal 0.7-1.0), semakin kreatif dan tak terprediksi. Semakin rendah (misal 0.1-0.2), semakin deterministik dan konsisten.

**Untuk trading bot, kita butuh AI yang kaku dan kalkulatif, bukan kreatif.**

**Implementasi di `user-config.json`:**
```json
{
  "temperature": 0.1
}
```

**Lokasi kode:** File `config.js` baris 141:
```javascript
// config.js
llm: {
  temperature: u.temperature ?? 0.373,  // ← default 0.373
  // ...
}
```

File `agent.js` baris 211 — temperature dipakai saat API call:
```javascript
// agent.js
const reqParams = {
  model: usedModel,
  messages,
  tools: getToolsForRole(agentType, goal),
  temperature: config.llm.temperature,  // ← dipakai di sini
  max_tokens: maxOutputTokens ?? config.llm.maxTokens,
};
```

**Kenapa 0.1?**
- Di temperature 0.1, DeepSeek-v4-flash akan **hampir selalu** memberikan jawaban yang sama untuk input yang sama.
- Ini menghilangkan perilaku "mood swing" di mana kadang bot deploy, kadang skip, untuk kandidat yang identik.
- Untuk penalaran analitis (bukan generasi teks kreatif), temperature rendah terbukti lebih akurat.

> **⚠️ PENTING:** Jangan set temperature ke 0.0 karena beberapa provider (termasuk OpenRouter) bisa error atau menghasilkan output repetitif/stuck. Nilai 0.1 adalah sweet spot.

---

### Strategi 2: Perketat Hard Filter di JavaScript (Kurangi Beban LLM)

**Prinsip:** Semakin sedikit kandidat yang sampai ke LLM, semakin akurat keputusannya.

Model murah akan bingung jika disodori 10 kandidat sekaligus dan diminta memilih. Tapi jika hanya 2-3 kandidat yang **semuanya sudah layak**, bahkan model paling murah pun bisa memilih dengan benar.

**Implementasi di `user-config.json`:**
```json
{
  "minFeeActiveTvlRatio": 0.2,
  "minOrganic": 65,
  "minQuoteOrganic": 65,
  "minHolders": 1000,
  "minMcap": 200000,
  "minTokenFeesSol": 30,
  "maxTop10Pct": 55,
  "maxBotHoldersPct": 25,
  "minVolume": 2000
}
```

**Apa efeknya?**
| Parameter | Default | Recommended | Efek |
|---|---|---|---|
| `minFeeActiveTvlRatio` | 0.05 | 0.2+ | Hanya pool dengan fee tinggi yang lolos |
| `minOrganic` | 60 | 65+ | Buang pool dengan aktivitas bot/fake |
| `minHolders` | 500 | 1000+ | Hanya token dengan komunitas nyata |
| `maxBotHoldersPct` | 30 | 25 | Lebih agresif blok token bot-heavy |
| `maxTop10Pct` | 60 | 55 | Hindari whale-dominated tokens |
| `minVolume` | 500 | 2000+ | Pastikan ada volume nyata |
| `minMcap` | 150000 | 200000+ | Hindari ultra-micro cap |

**Lokasi kode:** File `index.js` fungsi `runScreeningCycle()` (baris 419-738).
Sebelum data sampai ke LLM, kode JavaScript sudah melakukan filter bertingkat:
1. `getTopCandidates()` di `screening.js` — filter awal berdasarkan config
2. Launchpad filter di `index.js` baris 507-527
3. Bot holder filter di `index.js` baris 519-526
4. Lone candidate quality check di `getLoneCandidateSkipReason()` baris 1691-1711

Semakin ketat parameter ini, semakin sedikit sampah yang sampai ke LLM.

---

### Strategi 3: Gunakan Sistem Lesson (Memori) Secara Agresif

**Apa itu?**
Sistem `lessons.js` adalah memori permanen bot. Setiap lesson yang di-pin akan **selalu disuntikkan** ke dalam system prompt LLM di setiap siklus. Ini adalah cara paling ampuh untuk "mengajarkan" model murah tanpa mengubah kode.

**Kenapa penting untuk model murah?**
Model murah tidak bisa "bernalar dari prinsip pertama" (first-principle reasoning). Mereka butuh instruksi eksplisit. Kata kunci `CRITICAL`, `NEVER`, `ALWAYS`, `MUST` sangat efektif karena model flash dilatih untuk mematuhi instruksi tegas.

**Cara menambah lesson via terminal:**
```bash
cd /root/meridian-main

# Contoh 1: Lesson tentang single-sided deploy
node -e 'import("./lessons.js").then(m => {
  m.addLesson(
    "CRITICAL: This bot ONLY deposits SOL. Never claim Bid-Ask splits capital into 2 tokens. All shapes distribute 100% SOL single-sided below active price.",
    ["strategy", "single_sided"],
    { pinned: true, role: null }
  );
  console.log("Done");
}).catch(console.error);'

# Contoh 2: Lesson tentang minimal holding time
node -e 'import("./lessons.js").then(m => {
  m.addLesson(
    "RULE: Never close a position within 30 minutes of opening unless stop-loss is hit. Young positions need time to earn fees.",
    ["management", "patience"],
    { pinned: true, role: "MANAGER" }
  );
  console.log("Done");
}).catch(console.error);'

# Contoh 3: Lesson tentang narrative
node -e 'import("./lessons.js").then(m => {
  m.addLesson(
    "SCREENING: Tokens with no narrative AND no smart wallets are NEVER worth deploying, even if metrics look good. Skip immediately.",
    ["screening", "narrative"],
    { pinned: true, role: "SCREENER" }
  );
  console.log("Done");
}).catch(console.error);'
```

**Atau via Telegram (jika sudah terhubung):**
```
/teach CRITICAL: Always prefer pools with smart wallet confirmation over pools without.
```

**Tips menulis lesson yang efektif untuk model murah:**
1. **Gunakan kata imperatif:** `MUST`, `NEVER`, `ALWAYS`, `CRITICAL`, `RULE`
2. **Satu lesson = satu aturan.** Jangan gabungkan 3 aturan dalam 1 lesson.
3. **Spesifik, bukan abstrak.** ❌ "Hati-hati dengan pool baru" → ✅ "NEVER deploy to pools with organic_score below 60"
4. **Maks 400 karakter** per lesson (batas di `lessons.js` baris 34).
5. **Pin lesson penting** agar selalu dimuat (lesson tidak di-pin bisa tertimpa oleh yang lebih baru).
6. **Gunakan role** agar lesson hanya dimuat di siklus yang relevan:
   - `role: "SCREENER"` → hanya dimuat saat screening
   - `role: "MANAGER"` → hanya dimuat saat management
   - `role: null` → dimuat di semua siklus (GENERAL)

**Lokasi kode:**
- Lesson dimuat di `agent.js` baris 162: `const lessons = getLessonsForPrompt({ agentType });`
- Lesson disuntikkan ke prompt di `prompt.js` baris 33, 56, 128
- Tiering: PINNED (selalu muncul) → ROLE-MATCHED → RECENT (file `lessons.js` baris 609-675)

**Cap per role:**
| Role | Pinned Cap | Role Cap | Total Cap |
|---|---|---|---|
| SCREENER/MANAGER | 5 | 6 | 10 |
| GENERAL | 10 | 15 | 35 |

> **⚠️ JANGAN terlalu banyak lesson.** Jika total lesson terlalu banyak, token budget prompt akan membesar, model murah jadi lambat dan mahal. Idealnya **5-10 pinned lesson** yang sangat spesifik.

---

### Strategi 4: Pindahkan Logika Matematis ke JavaScript (Jangan Biarkan LLM Hitung)

**Masalah:** Model flash sangat buruk dalam aritmatika. Jika Anda meminta model menghitung "berapa bins_below optimal untuk volatility 3.2?", hasilnya sering salah.

**Solusi:** Meridian sudah melakukan ini sebagian besar. Berikut peta logika yang sudah deterministik (di JavaScript) vs yang masih di LLM:

| Keputusan | Handler | Deterministik? |
|---|---|---|
| Stop Loss (PnL ≤ -30%) | `getDeterministicCloseRule()` di `index.js:924` | ✅ Ya, di JS |
| Take Profit (PnL ≥ 5%) | `getDeterministicCloseRule()` di `index.js:927` | ✅ Ya, di JS |
| OOR Close (> 30 menit) | `getDeterministicCloseRule()` di `index.js:937` | ✅ Ya, di JS |
| Low Yield Close | `getDeterministicCloseRule()` di `index.js:945` | ✅ Ya, di JS |
| Trailing TP | `updatePnlAndCheckExits()` di `state.js` | ✅ Ya, di JS |
| Hitung bins_below | `computeBinsBelow()` di `index.js:1713` | ✅ Ya, di JS |
| Deploy amount | `computeDeployAmount()` di `config.js:220` | ✅ Ya, di JS |
| Dynamic bin_step | `applyDynamicBinStep()` di `executor.js:607` | ✅ Ya, di JS |
| Bot/Launchpad filter | `runScreeningCycle()` hard filters | ✅ Ya, di JS |
| Lone candidate skip | `getLoneCandidateSkipReason()` di `index.js:1691` | ✅ Ya, di JS |
| **Pilih pool mana?** | LLM di `agentLoop()` | ❌ Di LLM |
| **Evaluasi narrative** | LLM di `agentLoop()` | ❌ Di LLM |
| **Evaluasi instruction** | LLM di management cycle | ❌ Di LLM |

**Kunci:** LLM hanya diminta melakukan **3 hal** yang memang butuh "kecerdasan":
1. Memilih pool terbaik dari kandidat yang sudah lolos filter
2. Mengevaluasi kualitas narrative (apakah token punya cerita nyata)
3. Mengevaluasi instruksi custom user (misal "close at 5% profit")

**Rekomendasi tambahan jika ingin mengurangi peran LLM lebih jauh:**

Anda bisa menambahkan hard filter di JavaScript untuk narrative quality. Contoh di `index.js` sebelum LLM dipanggil:
```javascript
// Tambahkan di index.js setelah baris 527 (setelah bot filter)
// Auto-skip candidates tanpa narrative DAN tanpa smart wallets
const passing2 = passing.filter(({ pool, sw, n }) => {
  const hasNarrative = !!n?.narrative;
  const hasSmartWallets = (sw?.in_pool?.length ?? 0) > 0;
  if (!hasNarrative && !hasSmartWallets) {
    log("screening", `Auto-skipped ${pool.name} — no narrative, no smart wallets`);
    return false;
  }
  return true;
});
```

Dengan ini, LLM tidak perlu lagi membuang step untuk mengevaluasi kandidat yang jelas-jelas tidak layak.

---

### Strategi 5: Fokuskan pada Satu Strategi (Jangan Beri Terlalu Banyak Pilihan)

**Masalah:** File `strategy-library.json` berisi 5+ strategi berbeda (Custom Ratio Spot, Single-Sided Reseed, Fee Compounding, Multi-Layer, Partial Harvest). Jika LLM diminta memilih strategi **dan** memilih pool **dan** menentukan parameter, bebannya terlalu berat untuk model flash.

**Solusi:** Kunci strategi ke satu pilihan dan biarkan kode yang menentukan parameternya.

**Implementasi di `user-config.json`:**
```json
{
  "strategy": "spot"
}
```

Strategi sudah di-hardcode di screening cycle (`index.js` baris 478-480):
```javascript
const deployStrategy = config.strategy.strategy;
const strategyBlock = `DEPLOY STRATEGY: ${deployStrategy} (from config)
  | bins_above: 0 (FIXED — never change)
  | deposit: SOL only (amount_y, amount_x=0)`;
```

**Ini artinya:**
- LLM **tidak perlu memilih** antara Spot, Bid-Ask, atau Curve
- Kode sudah memaksakan `bins_above = 0` dan `amount_x = 0`
- LLM tinggal memilih **pool mana** dan **memanggil deploy_position**

> **💡 Tips:** Jika Anda ingin bereksperimen dengan strategi lain (misal Bid-Ask), ubah `"strategy": "bid_ask"` di `user-config.json`. Tapi **jangan biarkan LLM yang memilih** strategi mana yang dipakai — ini terlalu abstrak untuk model flash.

---

### Strategi 6: Optimalkan Prompt agar Ringkas dan Terstruktur

**Masalah:** System prompt yang terlalu panjang membuat model flash kehilangan fokus. Model murah punya "attention window" yang lebih lemah — informasi di awal prompt bisa "dilupakan" jika prompt terlalu panjang.

**Kenapa MANAGER prompt sudah optimal:**
Perhatikan di `prompt.js` baris 18-34 — prompt MANAGER sangat ringkas:
```javascript
if (agentType === "MANAGER") {
  return `You are an autonomous DLMM LP agent...
This is a mechanical rule-application task.
All position data is pre-loaded.
Apply the close/claim rules directly and output the report.
No extended analysis or deliberation required.
...`;
}
```

Kalimat "**mechanical rule-application task**" dan "**No extended analysis or deliberation required**" sangat penting untuk model murah — ini memberitahu model bahwa tugasnya sederhana dan tidak perlu "berpikir terlalu dalam".

**Kenapa SCREENER prompt juga sudah cukup baik:**
Di `prompt.js` baris 98-129, SCREENER prompt sudah memiliki:
- Aturan eksplisit: `fees_sol < X → SKIP`
- Formula bins_below yang sudah ditulis: `bins_below = round(minBins + (volatility/5)*(maxBins-minBins))`
- Instruksi format output yang ketat (report template)

**Tips tambahan untuk model murah:**
1. **Jangan minta LLM menulis esai.** Batas `maxTokens` di 2048 sudah baik. Jangan naikkan ke 4096 kecuali untuk GENERAL (chat interaktif).
2. **Format output ketat** — template report di screening cycle (baris 647-693 di `index.js`) memaksa LLM mengikuti format, bukan berimprovisasi.
3. **Gunakan `maxSteps` yang wajar.** Default 20 sudah baik. Untuk model murah, 15 mungkin lebih aman karena semakin banyak step, semakin besar peluang halusinasi.

**Implementasi:**
```json
{
  "maxTokens": 2048,
  "maxSteps": 15
}
```

---

### Strategi 7: Manfaatkan Sistem Darwinian Signal Weights

**Apa itu?**
File `signal-weights.js` mengimplementasikan sistem evolusioner: sinyal screening (organic_score, fee_tvl_ratio, volume, dll.) yang **sering muncul di posisi yang profit** akan mendapat bobot lebih tinggi. Yang sering muncul di posisi rugi, bobotnya turun.

**Kenapa penting untuk model murah?**
Bobot sinyal disuntikkan ke prompt SCREENER (di `prompt.js` baris 128):
```javascript
${weightsSummary ? `${weightsSummary}\nPrioritize candidates whose strongest
 attributes align with high-weight signals.\n\n` : ""}
```

Contoh output yang dilihat LLM:
```
Signal Weights (Darwinian — learned from past positions):
  fee_tvl_ratio            1.15  ####......  [above avg]
  smart_wallets_present    1.10  ####......  [above avg]
  organic_score            0.95  ###.......  [neutral]
  volume                   0.85  ##........  [neutral]
  mcap                     0.60  #.........  [below avg]
```

Model murah **sangat patuh** pada daftar terstruktur seperti ini. Jika `fee_tvl_ratio` bertuliskan `[STRONG]` dan `mcap` bertuliskan `[weak]`, model flash akan secara konsisten memprioritaskan fee/TVL di atas market cap.

**Implementasi di `user-config.json`:**
```json
{
  "darwinEnabled": true,
  "darwinWindowDays": 60,
  "darwinRecalcEvery": 5,
  "darwinMinSamples": 10
}
```

> **⚠️ CATATAN:** Darwin membutuhkan minimal 10 posisi yang sudah di-close (`darwinMinSamples: 10`) sebelum mulai menghitung bobot. Di awal, semua sinyal bobotnya 1.0 (netral). Setelah cukup data, sistem akan otomatis menyesuaikan.

---

### Strategi Bonus: Multi-Model Split (Model Berbeda untuk Tugas Berbeda)

**Apa itu?**
Meridian mendukung penggunaan model LLM yang berbeda untuk setiap role:

```json
{
  "managementModel": "deepseek/deepseek-v4-flash",
  "screeningModel": "deepseek/deepseek-v4-flash",
  "generalModel": "openai/gpt-oss-120b:free"
}
```

**Lokasi kode:** `config.js` baris 144-146:
```javascript
llm: {
  managementModel: u.managementModel ?? process.env.LLM_MODEL,
  screeningModel:  u.screeningModel  ?? process.env.LLM_MODEL,
  generalModel:    u.generalModel    ?? process.env.LLM_MODEL,
}
```

**Cara kerjanya:**
- `managementModel` → dipanggil saat management cycle (close/claim decisions)
- `screeningModel` → dipanggil saat screening cycle (pilih pool + deploy)
- `generalModel` → dipanggil saat user chat via Telegram

**Rekomendasi konfigurasi:**

| Role | Rekomendasi Model | Alasan |
|---|---|---|
| `managementModel` | Model flash/murah | Keputusan management sudah 90% deterministik di JS. LLM hanya eksekutor. |
| `screeningModel` | Model flash/murah ATAU model sedang | Ini role terpenting — pilih pool. Model sedikit lebih pintar bisa membantu. |
| `generalModel` | Model gratis/murah | Hanya untuk chat interaktif, tidak kritis. |

**Contoh konfigurasi hemat:**
```json
{
  "managementModel": "deepseek/deepseek-v4-flash",
  "screeningModel": "deepseek/deepseek-v4-flash",
  "generalModel": "openai/gpt-oss-120b:free"
}
```

**Contoh konfigurasi hybrid (sedikit lebih mahal, screening lebih pintar):**
```json
{
  "managementModel": "deepseek/deepseek-v4-flash",
  "screeningModel": "deepseek/deepseek-chat",
  "generalModel": "deepseek/deepseek-v4-flash"
}
```

---

### Rangkuman: Checklist Optimasi LLM Murah

| # | Aksi | File | Prioritas | Status |
|---|---|---|---|---|
| 1 | Set `temperature: 0.1` | `user-config.json` | 🔴 Kritis | ✅ Sudah |
| 2 | Perketat screening threshold | `user-config.json` | 🔴 Kritis | ⚠️ Review |
| 3 | Pin 5-10 lesson kritis | `lessons.json` via terminal | 🔴 Kritis | ⚠️ Ongoing |
| 4 | Set `maxSteps: 15` | `user-config.json` | 🟡 Penting | Opsional |
| 5 | Kunci 1 strategi (`strategy: "spot"`) | `user-config.json` | 🟡 Penting | ✅ Sudah |
| 6 | Aktifkan Darwin weights | `user-config.json` | 🟢 Bagus | ✅ Sudah |
| 7 | Multi-model split | `user-config.json` | 🟢 Bagus | ✅ Sudah |
| 8 | Tambah hard filter narrative+SW di JS | `index.js` | 🟢 Bonus | Belum |

### Penutup

**Kesimpulan akhir:** Model LLM murah seperti DeepSeek-v4-flash **bukan masalah** jika arsitektur keputusan Anda dirancang dengan benar. Kunci utamanya:

1. **JavaScript = Polisi.** Semua aturan yang bisa dihitung (stop loss, take profit, OOR, yield check) harus di-hardcode di JS. Jangan andalkan LLM untuk matematika.
2. **LLM = Hakim.** LLM hanya diminta membuat keputusan "judgement call" yang memang butuh kecerdasan: evaluasi narrative, pilih pool terbaik dari yang sudah lolos filter.
3. **Lesson = Hukum.** Pinned lessons adalah "undang-undang" yang memaksa model murah berperilaku konsisten. Tanpa lesson, model flash akan berubah-ubah keputusannya.
4. **Data = Makanan.** Semakin bersih data yang sampai ke LLM (sudah difilter ketat di JS), semakin akurat keputusannya. Garbage in = garbage out, terutama untuk model murah.

Dengan menerapkan 7 strategi di atas, performa DeepSeek-v4-flash di Meridian bisa **mendekati** model mahal seperti GPT-4o atau Claude Sonnet — karena sebagian besar "kecerdasan" sebenarnya sudah ada di kode JavaScript, bukan di LLM.

---

## Bagian 10 — Memindahkan Beban dari Lessons ke JavaScript (Menghemat Prompt)

> **Pertanyaan Penting:** *"Karena slot lesson sangat terbatas (hanya 5 slot Pinned per siklus), aturan apa saja yang BISA dan SEHARUSNYA dipindahkan ke JavaScript (hardcode) alih-alih dijadikan lesson?"*

Slot lesson adalah real estate paling berharga di LLM prompt. Jangan buang slot lesson untuk aturan yang bisa **dipaksakan secara matematis** di level kode. Model LLM murah (*DeepSeek-v4-flash*) sering mengabaikan instruksi teks panjang, tapi mereka **tidak bisa** melanggar kode JavaScript yang memblokir eksekusinya.

### 1. Apa yang SUDAH Berhasil Dipindahkan ke JS di Meridian-Main?

Kode Anda di `tools/executor.js` dan `index.js` saat ini **sudah sangat solid**. Berikut hal-hal yang **tidak perlu** Anda buatkan lesson karena sudah di-block paksa oleh JavaScript:

- ❌ **"Jangan pakai 2 sisi (Bid-Ask), pakai 1 sisi (Spot) saja."**
  - **Di JS:** `executor.js` baris 737 memblokir transaksi jika `amount_x > 0`. Transaksi akan ditolak sebelum sampai ke Solana.
- ❌ **"Jangan pasang bins di atas harga."**
  - **Di JS:** `executor.js` baris 784 menolak transaksi jika `bins_above !== 0` untuk single-sided deploy.
- ❌ **"Jangan deploy ke pool sampah yang bot-nya banyak."**
  - **Di JS:** `index.js` baris 519 sudah mem-filter kandidat sebelum datanya dikirim ke LLM. LLM tidak akan pernah melihat kandidat ini.
- ❌ **"Close posisi kalau rugi -30%."**
  - **Di JS:** Fungsi `getDeterministicCloseRule()` di `index.js` baris 924 otomatis mendeteksi rugi -30% dan menginstruksikan close *tanpa* harus bertanya ke LLM.

### 2. Aturan yang HARUS Segera Dipindahkan ke JS (Menghemat 3 Slot Lesson)

Berdasarkan audit pada kode, ada 3 perilaku di mana LLM murah sering membuat kesalahan, namun saat ini kita harus membuang slot lesson untuk memperbaikinya. Ini harusnya dipindahkan ke JavaScript!

#### A. Memaksa `deploy_amount` Sesuai Config
**Masalah:** LLM murah sering mengarang angka `amount_y` saat memanggil tool `deploy_position` (misal disuruh 0.15 SOL, malah input 0.5 SOL).
**Cara salah (menggunakan lesson):** "CRITICAL: deploy_position amount_y MUST match exactly 0.15 SOL." (Membuang 1 slot lesson).
**Cara JUNIOR DEV (Hardcode di JS):**
Abaikan input `amount_y` dari LLM sepenuhnya. Di `executor.js` fungsi `deploy_position`, paksa nilainya menggunakan config.

**Implementasi:**
Di `tools/executor.js` baris 735:
```javascript
// SEBELUMNYA: Percaya pada input LLM
// const deployAmountY = Number(args.amount_y ?? args.amount_sol ?? 0);

// SESUDAHNYA: Abaikan input LLM, paksa ambil dari dompet / config
const currentBalance = await getWalletBalances();
const deployAmountY = computeDeployAmount(currentBalance.sol);
args.amount_y = deployAmountY; // Paksa timpa argumen dari LLM
args.amount_sol = deployAmountY;
```
**Efek:** LLM mau menginput 1000 SOL pun, sistem akan tetap deploy 0.15 SOL. Slot lesson aman!

#### B. Mencegah LLM Memanggil Tool yang Tidak Perlu (`get_active_bin`)
**Masalah:** Di siklus screening, data `active_bin` **sudah** disertakan di prompt untuk setiap pool. Tapi LLM murah kadang masih iseng memanggil tool `get_active_bin`, membuang 1 turn (dan waktu).
**Cara salah (menggunakan lesson):** "RULE: Do not call get_active_bin, it is already provided."
**Cara JUNIOR DEV (Hardcode di JS):**
Hapus tool tersebut dari daftar alat yang boleh dipakai oleh SCREENER.

**Implementasi:**
Di `agent.js` baris 8:
```javascript
// SEBELUMNYA:
// const SCREENER_TOOLS = new Set(["deploy_position", "get_active_bin", "get_top_candidates", ...]);

// SESUDAHNYA: Hapus "get_active_bin" dan "get_top_candidates" karena data ini SUDAH di-load di index.js sebelum LLM dipanggil.
const SCREENER_TOOLS = new Set(["deploy_position", "check_smart_wallets_on_pool", "get_token_narrative", ...]);
```
**Efek:** Jika LLM mencoba memanggil `get_active_bin`, tool itu tidak akan tersedia. LLM terpaksa langsung memanggil `deploy_position`. Bot berjalan 2x lebih cepat.

#### C. Mencegah LLM Melakukan Double-Swap
**Masalah:** Saat `close_position`, JS executor sudah **otomatis** men-swap sisa token kembali ke SOL (Dust Sweeping). Tapi LLM murah yang bingung sering memanggil tool `swap_token` lagi secara manual setelahnya.
**Cara salah (menggunakan lesson):** "RULE: If result says auto_swapped, do not call swap_token."
**Cara JUNIOR DEV (Hardcode di JS):**
Buat guard di `swap_token` yang memblokir eksekusi jika di siklus tersebut sudah terjadi auto-swap.

**Implementasi:**
Di `agent.js` baris 180 (Once Per Session Guard):
Kode Anda sudah memiliki `ONCE_PER_SESSION = new Set(["deploy_position", "swap_token", "close_position"])`. Ini sudah bagus! Jika LLM panggil swap 2x, yang kedua akan diblok.

Namun, untuk koneksi antara `close_position` dan `swap_token`, tambahkan di `executor.js` bagian eksekusi `swap_token`:
```javascript
// Tambahkan di dalam fungsi executeTool("swap_token")
if (context.hasAutoSwappedThisSession) {
  return { error: "Already auto-swapped during close_position. Do not call swap_token again." };
}
```

### 3. Aturan yang TIDAK BISA Dipindah ke JS (Wajib Tetap Jadi Lesson)

Beberapa hal sangat abstrak dan **hanya bisa** dievaluasi oleh LLM. Untuk inilah 5 slot Pinned Lesson Anda harus dihemat:

1. **Evaluasi Narasi (Narrative):**
   *Wajib jadi lesson:* "CRITICAL: A token is ONLY valid if narrative is a specific real-world event. 'Community taken over' or 'Next 100x' is fake narrative. SKIP IT."
   *(JS tidak bisa membaca bahasa manusia).*

2. **Deteksi PVP / Tren Meta:**
   *Wajib jadi lesson:* "RULE: If there are 3 pools with the same ticker (e.g., TRUMP), DO NOT deploy unless smart wallets confirm the real one."
   *(JS sulit mendeteksi kemiripan ticker secara kontekstual).*

3. **Penyelarasan Strategi Khusus:**
   *Wajib jadi lesson:* "MANAGER RULE: Do not close early if PnL is between -10% and +2%. Let it breathe for at least 1 hour to accumulate fees."
   *(Bisa di-JS, tapi lebih mudah dituning lewat lesson jika ingin mengubah strategi on-the-fly).*

### Ringkasan Eksekusi untuk LLM Murah

| Aturan yang Diinginkan | Jangan Pakai Lesson! Lakukan Ini: | Lokasi File |
|---|---|---|
| Paksa amount 0.15 SOL | Timpa `args.amount_y` dengan nilai dari config | `tools/executor.js` (Fungsi deploy) |
| Cegah spam get_active_bin | Hapus dari daftar `SCREENER_TOOLS` | `agent.js` |
| Paksa bins_below | Hitung `bins_below` di JS, timpa argumen dari LLM | `tools/executor.js` (Fungsi deploy) |
| Jangan deploy volatility 0 | Hapus dari array JS *sebelum* dikirim ke LLM | `index.js` (Screening pre-filter) |

**Kesimpulan Utama:**
Jika sebuah masalah bisa dijawab dengan **"Ya/Tidak"** secara matematis, selesaikan di **JavaScript**.
Simpan LLM (dan slot lesson) hanya untuk pertanyaan yang butuh **"Kenapa/Bagaimana"** (membaca sentimen narasi, membaca pergerakan smart wallet). Ini akan membuat DeepSeek-v4-flash Anda beroperasi sekelas GPT-4o dengan biaya 1/100-nya.
