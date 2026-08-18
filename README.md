# Website Prep — Live on a free Cloudflare subdomain, custom domain not yet connected

**Status (updated 2026-08-17):** Site is deployed and live at https://jonathan-lopez-website.pages.dev via Cloudflare Pages, connected to the `jonathanlopez-realestate/jonathan-lopez-website` GitHub repo (main branch). Every push to `main` auto-deploys within about a minute, no manual redeploy step. Real brand colors and logo are live (see below). Only remaining step to go fully live on Jonathan's own domain: he buys a domain (~$12-15/yr) and it gets connected under Cloudflare Pages > Custom domains, then all `REPLACE-WITH-DOMAIN.com` placeholders in the code get swapped for the real domain.

---

## What's Built So Far

- `index.html` — homepage with RealEstateAgent schema (JSON-LD), all 8 services, brand phrase leading with Woodland Hills.
- `style.css` — shared stylesheet, no dependencies, no build step needed.
- `about.html` — About page, ProfilePage schema, built from Jonathan's own Q&A answers, no personal details per his request.
- `sellers-guide.html` — Seller's Guide, Service + HowTo + FAQPage schema. Backbone is the Mike Ferry Organization 5-step listing process (from `06_Appointments_and_Listings/Setting_Appointments_SOP.md`), reframed for a consumer audience with the Plan of Action (POA) as the lead differentiator. Structure (numbered steps, intro, closing) took inspiration from Jim Sandoval Group's own seller's guide page, but no text was copied from it. Replaces the earlier rejected `selling.html`, which is now unlinked from all nav (left in place, not deleted, pending Jonathan's call on whether to remove the file entirely).
- `blog/is-now-a-good-time-to-sell-woodland-hills.html` — first blog post, converted from `05_Marketing/Content_Woodland_Hills_Is_Now_A_Good_Time_To_Sell.md`, with Article schema + FAQPage schema embedded. **Use this file as the template** for converting future `Content_*.md` files into pages.
- `blog/inherited-a-house-woodland-hills.html` — second blog post, converted from `05_Marketing/Content_Inherited_A_House_Now_What.md` (long version, which already led with Woodland Hills correctly, unlike the GBP short version, see the "known miss" note in `AI_Search_GEO_SOP.md` Rule #0). Article + FAQPage schema, probate/step-up-basis/Prop 19 content, explicit not-legal-advice framing preserved.
- `blog/index.html` — blog listing page, add a new `<li>` link here each time a new post page is built.
- **12 more blog posts added 2026-08-17**, converting every previously-published GBP post (#3-14 in `GBP_Post_Log.md`) that hadn't made it to the website yet: price-cut worry, Zestimate accuracy, 20% down myth, net-proceeds breakdown, buyer-agent compensation/AB 2992, Prop 13 assessed value (disclaimer), spring-vs-now timing, staging/photography ROI above $1M, CA outmigration, sibling inheritance disputes (disclaimer, cross-linked with the original inherited-house post), FHA loan limits, and homeowners insurance/fire zones. Same template and schema conventions as the first 2 posts. All 14 published GBP posts now have a matching website page, logged in `GBP_Post_Log.md`.

**Decision: no standalone Market Guide page.** Built one (`market-guide.html`) with hard current stats, then deleted it on Jonathan's call: a page titled "Market Guide" implies always-current, and he doesn't want to own a monthly manual-update task he knows he'll forget. Current, sourced market numbers live only in dated blog posts, which are expected to age by their timestamp and already get refreshed on the weekday automated content run. Don't rebuild a stats-bearing evergreen market page unless Jonathan asks for it again with a real update plan attached.

- `first-time-buyers.html` — Service + HowTo + FAQPage schema. Covers qualifying conversation, a written Buyer Plan of Action, pre-approval, the 2024 NAR buyer representation agreement requirement, touring/offers/inspection/closing, and a qualitative (no hard numbers) note on CA first-time buyer assistance programs like CalHFA, same staleness reasoning as the deleted market guide. Step 2 (Plan of Action) is now built from a real source: `Buyer_POA_Template_Reference_Adam_Carpenter.pdf`, uploaded by Jonathan 2026-07-28 and filed in `06_Appointments_and_Listings/`. It's Adam Carpenter's (a different agent, Richmond VA) sample Buyer POA, the same "Adam's version, 22-point" template referenced in `Setting_Appointments_SOP.md`, used the same way Jim's website was used for the Seller's Guide: structural/conceptual reference, not copied text. Per Jonathan's explicit instruction ("don't give away all my golden nuggets... be strategic"), the page describes the *category* of what a Buyer POA covers (proactive search, vendor connections, weekly updates, negotiation, contract-to-close) and does not list out the specific internal tactics or numeric habits (call volume, prospecting hours, daily MLS-check cadence) from the source document. **Still outstanding:** `JLJS script with questions.docx` from the same June 25 email was not uploaded, only the Buyer POA was. Rebuild again if/when Jonathan sends that one too.

## Backend / Technical SEO (added 2026-07-28, per direct review of Scott Cheng's live AgentSpotlight-powered site)

Every page now carries, in addition to its per-page JSON-LD schema:
- A permissive `robots` meta tag (`index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`).
- Geo meta tags (`ICBM`, `geo.position`, `geo.region`, `geo.placename`) pinned to Woodland Hills, 34.1684, -118.6059.
- Full Open Graph + Twitter Card tags (previously only `index.html` had partial OG tags).
- `about.html` also carries a name-collision disambiguation FAQ (correct phone number, brokerage, "is this the same Jonathan Lopez," who to contact), with its own FAQPage schema, matching the exact pattern Scott Cheng's site uses to fight entity confusion.

`sitemap.xml` and `robots.txt` are built and sitting in this folder, ready to go live the moment there's a real domain. `robots.txt` explicitly allows GPTBot, ChatGPT-User, Google-Extended, PerplexityBot, ClaudeBot, anthropic-ai, and CCBot by name, not just the wildcard, since the known Cloudflare-blocking-crawlers trap (see `AI_Search_GEO_SOP.md` Step 2.5) means this needs to be double-checked against whatever host/CDN is chosen, this file alone doesn't override a host-level block.

`og:image`, favicon, and header logo are now real assets (see Brand Colors / Logo section above), not placeholders. See `AI_Search_GEO_SOP.md` Step 4 for the full list of what was checked, what was added, and what's genuinely unclear (AI-content-disclosure rules, review schema) rather than assumed.

## Not Yet Built (next up, one at a time per Jonathan's pace)

- Blog pages for the remaining `Content_*.md` files already drafted (Zestimate accuracy, price-cut/pricing, and whatever the automated weekday drafts produce)

## How to Deploy When Ready (no ongoing cost beyond the domain)

1. Buy a domain (~$12-15/year) from any registrar (Jonathan completes checkout himself, payment info required).
2. Host for free on GitHub Pages or Cloudflare Pages — both support a custom domain and free SSL, no monthly fee.
3. Point the domain's DNS at the host per that host's instructions.
4. Replace every `https://REPLACE-WITH-DOMAIN.com/` placeholder in the HTML/schema/sitemap/robots.txt with the real domain (find-and-replace across all files).
5. Confirm the host/CDN isn't silently blocking crawlers (Rich Results Test, see `AI_Search_GEO_SOP.md` Step 2.5), then submit `sitemap.xml` to Google Search Console.
6. Update `05_Marketing/AI_Search_GEO_SOP.md` Step 3 status once live, and add the URL to the GBP "Website" field.

## Pre-Launch Backend Checklist (added 2026-07-28, cross-checked against the full Scott Cheng/AgentSpotlight transcript)

Jonathan asked specifically for confidence nothing breaks once this goes live. Everything below was checked against that full transcript, not just the earlier paraphrase, so this list is the actual answer to "did we miss anything."

**Already done, nothing more to do:**
- Per-page JSON-LD: Article, FAQPage, Service, HowTo, ProfilePage, RealEstateAgent (whichever apply per page).
- BreadcrumbList schema on every page (added 2026-07-28, this was the one real gap found against Scott's "15 items" Rich Results checklist).
- Contextual internal links between related pages (Seller's Guide ↔ both blog posts), the free version of the auto-backlinking his tool does.
- Permissive robots meta tag, geo meta tags, full Open Graph/Twitter tags, all pages.
- Name-collision disambiguation FAQ on `about.html`.
- `sitemap.xml` and `robots.txt` with AI crawlers explicitly allowed.
- Visible legal/tax disclaimer block where applicable.
- No fabricated stats, no dashes, Woodland Hills always leads, three-element review-ask structure ready for when reviews start (still blocked on a first closed deal).

**Can't be finished until there's a live URL, do this at deploy time, not before:**
- Replace every `REPLACE-WITH-DOMAIN.com` placeholder (step 4 above).
- Run the Rich Results Test and Schema Validator against the real, live URL, not this local folder, neither tool can check files that aren't hosted yet.
- Submit `sitemap.xml` to Google Search Console.
- Start linking future GBP posts back to their website page (see `Hyperlocal_GBP_Post_Workflow_SOP.md` step 2.5, added 2026-07-28).

**Confirmed as vendor-proprietary, deliberately not built here, not a gap:**
- "Friday" AI assistant, "Agent Vault" persistent memory, the cross-subscriber backlink network, the multi-LLM inference tool, auto-connection to a CRM like Follow Up Boss. These only work inside AgentSpotlight's paid platform and don't have a free DIY equivalent. Listed here so it's clear they were reviewed and intentionally skipped, not missed. Full reasoning in `00_Coaching_and_Training/Office_Training_Log.md`.

**Still needs Jonathan, not a backend item:**
- The domain/host decision itself.
- Confirming with his brokerage whether AI-content disclosure is required (see `AI_Search_GEO_SOP.md` Step 4).

## Brand Colors (set 2026-08-17)

Jonathan confirmed real brand colors, replacing the placeholder green scheme every page had been built with unreviewed:
- Deep Navy `#0B1F33` (primary, `--brand`/`--ink`)
- Warm White `#F8F6F2` (page background, `--bg`)
- Soft Gold `#C9A24D` (accent only, `--gold`) — used sparingly: link-hover underline color, FAQ item left border, disclaimer box left border. Not used as a background or button color anywhere, by design.

All colors live as CSS variables in `style.css`, so this was a single-file update that rethemed every page.

**Logo (added 2026-08-17):** Jonathan's real navy/gold-framed "JL" monogram logo is now in `assets/` (`logo.jpg` original, `logo.png` for the header) and wired into all 8 pages' header, replacing the plain text wordmark (text still shows next to it for clarity, since "JL" alone doesn't spell out the name to a first-time visitor). Also generated from it: `assets/favicon.ico` (16/32/48px) linked in every page's `<head>`, and `assets/og-image.jpg` (1200x630, logo centered on navy) replacing the placeholder path every page's Open Graph/Twitter meta tags already pointed to. Nothing left open on branding assets.

## Rules Carried Over From the Rest of the Content System

- Woodland Hills leads every page/post opening — see `AI_Search_GEO_SOP.md` Rule #0.
- No em-dashes/dash-separated clauses in body copy.
- No fabricated stats — every page sources real data.
- No AI-generated images.
- **Legal/tax content gets a visible disclaimer block** (added 2026-07-28, new `.disclaimer` class in `style.css`): any page touching probate, tax rates, Prop 19, or similar legal/tax specifics needs a standalone disclaimer stating Jonathan isn't an attorney/CPA and that the cited laws/figures can change, not just a passing mention folded into prose. First applied to `blog/inherited-a-house-woodland-hills.html`. Apply to any future content on the same kind of topic.
