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

### 5. Pencatatan PnL Netto yang Lebih Jujur
**Masalah saat ini:** Di `lessons.js`, PnL dihitung dari `(final_value_usd + fees_earned_usd) - initial_value_usd`. Namun, **gas fee** dan **priority fee** tidak dihitung. Pada modal kecil (< 0.5 SOL), gas fee bisa menggerus keuntungan.
**Solusi Mudah:** Di `recordPerformance()`, kurangi PnL dengan estimasi biaya transaksi (misal flat $0.05 per transaksi * 2 untuk open/close).
**Keuntungan:** Bot (dan agen AI) akan belajar bahwa *take profit* terlalu kecil ($0.10) sebenarnya adalah kerugian karena habis di ongkos gas. Agen akan menjadi lebih sabar.

**Kesimpulan:** 
Untuk meningkatkan performa *meridian-main* Anda tanpa membuatnya rumit, prioritas utamanya bukanlah menambah LLM baru atau dashboard mewah, melainkan **memperketat manajemen risiko mekanis** (Circuit Breaker, Dust Sweeping, Revenge Guard) agar modal tidak bocor secara diam-diam.
