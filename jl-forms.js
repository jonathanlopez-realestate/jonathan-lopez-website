/* =========================================================
   jl-forms.js  ·  Jonathan Lopez Real Estate  ·  v2 (editorial)
   Powers: multi-step forms, the live preview slip, the street-report
   sample (tabs, radius, expandable rows), Ask topics, the compact
   blog-footer box, and scroll reveal.

   Sends to Web3Forms (same service your current forms use).
   Reads ?src= from the URL into the hidden "src" field.
   No cookies, no localStorage/sessionStorage, nothing new loaded from other sites.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- SETTINGS ---------- */
  var CONFIG = {
    accessKey: "1e05f524-7137-4686-aa6b-d3e659f76eb2",          // the same key your current forms use
    fromName:  "Jonathan Lopez Real Estate Website",
    endpoint:  "https://api.web3forms.com/submit",
    phone:     "(818) 934-7576",
    phoneHref: "tel:8189347576"
  };
  /* ------------------------------ */

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("jl-js");

  function clean(v, max) {
    return String(v || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, max || 60);
  }
  function placementFromPath() {
    var p = window.location.pathname.replace(/\/index(\.html)?$/, "/").replace(/\.html$/, "").replace(/\/$/, "");
    if (p === "") return "home";
    return clean(p.replace(/^\//, "").replace(/\//g, "-"), 120);
  }
  function urlSrc() {
    try { return clean(new URLSearchParams(window.location.search).get("src")); } catch (e) { return ""; }
  }
  function setHidden(form, name, value) {
    var el = form.querySelector("input[type='hidden'][name='" + name + "']");
    if (!el) { el = document.createElement("input"); el.type = "hidden"; el.name = name; form.appendChild(el); }
    el.value = value;
  }

  /* ---------- Live echo: [data-echo="name"] mirrors the field named "name" ---------- */
  function bindEcho(root) {
    var targets = $$("[data-echo]", root);
    if (!targets.length) return;
    function update() {
      targets.forEach(function (t) {
        var field = root.querySelector("[name='" + t.getAttribute("data-echo") + "']");
        var v = field ? field.value.trim() : "";
        if (t.getAttribute("data-echo-first") !== null) v = v.split(/\s+/)[0] || "";
        t.textContent = v || t.getAttribute("data-empty") || "";
        t.classList.toggle("is-empty", !v);
      });
    }
    root.addEventListener("input", update);
    update();
  }

  /* ---------- Forms ----------
     Delivery matches the site's existing forms (/free-sellers-guide, /home-value-*):
     JSON POST to Web3Forms + the native form "submit" event, which the existing
     Follow Up Boss pixel listens for. The pixel reads visible fields by name, so
     names match the existing forms ("Full Name", "Email Address", "Property Address",
     "City", "ZIP") and an off-screen "Message" note carries source, ?src= and details.
     Two-step (home value): step 1 (name + email) sends right away; step 2 adds the
     optional address. ?preview=1 skips every real send. */
  var PREVIEW = /[?&]preview=1\b/.test(window.location.search);

  function val(form, name) {
    var el = form.querySelector("[name='" + name + "']");
    if (!el) return "";
    if (el.type === "checkbox") return el.checked ? "Yes" : "No";
    return (el.value || "").trim();
  }
  function collect(form) {
    var d = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled || el.name === "Message") return;
      if (el.type === "checkbox") {
        if (el.name === "botcheck") { d.botcheck = el.checked; return; }
        d[el.name] = el.checked ? "Yes" : "No";
      } else if (el.type !== "submit" && el.type !== "button") {
        d[el.name] = (el.value || "").trim();
      }
    });
    var topic = form.getAttribute("data-topic");
    if (topic && d.Question && d.Question.indexOf(topic) !== 0) d.Question = topic + ": " + d.Question;
    return d;
  }
  function firstOf(d) { return ((d["Full Name"] || d["First Name"] || "").split(/\s+/)[0]) || ""; }
  function fullAddress(d) {
    var a = d["Property Address"];
    if (!a) return "";
    var tail = [d.City, d.ZIP ? "CA " + d.ZIP : ""].filter(Boolean).join(", ");
    return tail ? a + ", " + tail : a;
  }
  function leadType(form, d) {
    return (form.getAttribute("data-lead-type") || "Website lead") + (d["Quarterly Updates"] === "Yes" ? " - Quarterly" : "");
  }
  function noteText(form, d, extra) {
    var parts = [d.source, leadType(form, d)];
    if (fullAddress(d)) parts.push(fullAddress(d));
    if ("Quarterly Updates" in d) parts.push("Quarterly updates: " + d["Quarterly Updates"]);
    if ("Homeowner" in d) parts.push("Homeowner: " + d.Homeowner);
    if (d.Street) parts.push("Street: " + d.Street);
    if (d.Question) parts.push("Question: " + d.Question);
    if (extra) parts.push(extra);
    return parts.join(" - ");
  }
  function send(data) {
    if (PREVIEW) { if (window.console) console.log("[preview] would send", Object.keys(data)); return Promise.resolve(); }
    return fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || j.success === false) throw new Error("send failed");
      });
    });
  }

  function setupForm(form) {
    var placement = form.getAttribute("data-placement");
    if (!placement || placement === "auto") placement = placementFromPath();
    var src = urlSrc() || placement;
    setHidden(form, "src", src);
    setHidden(form, "placement", placement);
    setHidden(form, "page", window.location.pathname);
    setHidden(form, "source", (form.getAttribute("data-source") || "Website") + " (" + placement + ") - src: " + src);

    var twoStep = form.getAttribute("data-jl-mode") === "two-step";
    var note = $("textarea[name='Message']", form);
    var steps = $$(".jl-step", form);
    var fill = $(".jl-progress-fill", form);
    var now = $("[data-step-now]", form);
    var total = $("[data-step-total]", form);
    var current = 0;
    if (total) total.textContent = pad(steps.length);

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function show(i, dir) {
      form.setAttribute("data-dir", dir || "fwd");
      steps.forEach(function (s, n) { s.hidden = n !== i; });
      current = i;
      if (fill) fill.style.transform = "scaleX(" + ((i + 1) / steps.length) + ")";
      if (now) now.textContent = pad(i + 1);
      if (i > 0 || dir === "back") {
        var first = steps[i].querySelector("input:not([type=hidden]):not([type=checkbox]), textarea");
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduceMotion ? 0 : 280);
      }
    }
    function fieldsValid(scope) {
      var fields = $$("input:not([type=hidden]):not([name=botcheck]), textarea:not([name='Message'])", scope);
      for (var k = 0; k < fields.length; k++) {
        if (fields[k].required && !fields[k].value.trim()) fields[k].value = "";
        if (!fields[k].checkValidity()) { fields[k].reportValidity(); return false; }
      }
      return true;
    }
    if (steps.length) show(0);

    form.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t || !form.contains(t)) return;
      if (t.hasAttribute("data-next")) {
        e.preventDefault();
        if (fieldsValid(steps[current])) show(Math.min(current + 1, steps.length - 1), "fwd");
      } else if (t.hasAttribute("data-back")) {
        e.preventDefault();
        show(Math.max(current - 1, 0), "back");
      } else if (t.hasAttribute("data-skip-submit")) {
        e.preventDefault();
        clearNamed(form, t.getAttribute("data-clear"));
        if (twoStep) { finish(form, collect(form)); return; }   // step 1 already sent
        // Fire a real submit so the FUB pixel sees it, same as clicking the main button
        if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      } else if (t.hasAttribute("data-toggle")) {
        e.preventDefault();
        var target = document.getElementById(t.getAttribute("data-toggle"));
        if (target) {
          var open = !target.classList.contains("is-open");
          target.classList.toggle("is-open", open);
          t.setAttribute("aria-expanded", String(open));
          if (open) { var inp = $("input", target); if (inp) setTimeout(function () { inp.focus(); }, 200); }
        }
      }
    });

    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox" && steps.length > 1 && current < steps.length - 1 && !(twoStep && current === 0)) {
        e.preventDefault();
        if (fieldsValid(steps[current])) show(current + 1, "fwd");
      }
    });

    // Compact (blog-footer) box: the button is always visible; the name/email
    // fields open as the visitor types or presses the button.
    var compact = form.hasAttribute("data-jl-expand");
    if (compact) {
      var opener = $("textarea:not([name='Message']), input:not([type=hidden])", form);
      var openIt = function () { if (opener.value.trim() || document.activeElement === opener) form.classList.add("is-open"); };
      opener.addEventListener("focus", openIt);
      opener.addEventListener("input", openIt);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.__jlBusy) { e.stopImmediatePropagation(); return; }
      if (compact && !form.classList.contains("is-open")) {
        form.classList.add("is-open");
        var q = $("textarea:not([name='Message'])", form);
        if (q && !q.value.trim()) { q.reportValidity(); }
        else { var n = $(".jl-more input", form); if (n) setTimeout(function () { n.focus(); }, reduceMotion ? 0 : 250); }
        e.stopImmediatePropagation(); return;
      }
      var scope = steps.length ? steps[current] : form;
      if (!fieldsValid(scope) || (!twoStep && !fieldsValid(form))) { e.stopImmediatePropagation(); return; }

      var d = collect(form);
      if (d.botcheck) return;
      delete d.botcheck;
      var stage2 = twoStep && current === 1;
      if (stage2 && !d["Property Address"]) { finish(form, d); return; }
      if (twoStep && !stage2) { delete d["Property Address"]; delete d.City; delete d.ZIP; }
      if (!twoStep && !d["Property Address"]) { d.City = ""; d.ZIP = ""; }
      d.Message = noteText(form, d, stage2 ? "Address added" : "");
      if (note) note.value = d.Message;           // the FUB pixel reads this on this same submit event
      d.lead_type = leadType(form, d) + (stage2 ? " - Address" : "");
      d.access_key = CONFIG.accessKey;
      d.from_name = CONFIG.fromName;
      d.subject = (form.getAttribute("data-subject") || d.lead_type) + (stage2 ? " - address added" : "") + " | src: " + src;

      var btns = $$("button", form), status = $(".jl-status", form);
      form.__jlBusy = true;
      btns.forEach(function (b) { b.disabled = true; });
      if (status) { status.className = "jl-status"; status.textContent = "Sending…"; }
      send(d).then(function () {
        form.__jlBusy = false;
        btns.forEach(function (b) { b.disabled = false; });
        if (status) status.textContent = "";
        if (twoStep && !stage2) {
          var t = $("[data-jl-thanks]", form), f = firstOf(d);
          if (t) t.textContent = f ? "Thank you, " + f + ". Your request is in." : "Thank you. Your request is in.";
          show(1, "fwd");
        } else {
          finish(form, d);
        }
      }).catch(function () {
        form.__jlBusy = false;
        btns.forEach(function (b) { b.disabled = false; });
        if (status) {
          status.className = "jl-status jl-status--error";
          status.innerHTML = "That didn’t go through. Please try again, or call " + CONFIG.phone +
            " (<a href=\"" + CONFIG.phoneHref + "\">tap to call</a>).";
        }
      });
    });
  }

  function clearNamed(form, names) {
    // names are field names, some with spaces ("Property Address"); match against known fields
    ["Property Address", "City", "ZIP", "Street"].forEach(function (n) {
      if ((names || "").indexOf(n) !== -1) { var f = form.querySelector("[name='" + n + "']"); if (f) f.value = ""; }
    });
  }

  function finish(form, data) {
    var root = form.closest(".jl-tool") || document;
    var holder = form.closest("[data-jl-holder]") || form.parentNode;
    var ok = $(".jl-success", holder);
    if (!ok) return;
    $$("[data-first-name]", ok).forEach(function (n) { var f = firstOf(data); n.textContent = f ? ", " + f : ""; });
    $$("[data-show-if]", ok).forEach(function (n) {
      var cond = n.getAttribute("data-show-if"), neg = cond.charAt(0) === "!", key = neg ? cond.slice(1) : cond;
      var has = !!data[key] && data[key] !== "No";
      n.hidden = neg ? has : !has;
    });
    $$("[data-fill]", ok).forEach(function (n) { n.textContent = data[n.getAttribute("data-fill")] || ""; });
    form.hidden = true;
    ok.hidden = false;
    ok.setAttribute("tabindex", "-1");
    ok.focus({ preventScroll: true });
    var top = holder.getBoundingClientRect().top;
    if (top < 0) holder.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    root.dispatchEvent(new CustomEvent("jl:sent", { detail: { lead_type: data.lead_type } }));
  }

  /* ---------- Street report sample: tabs, radius, rows, edition ---------- */
  function setupDoc(doc) {
    var tabs = $$("[role=tab]", doc);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          var n = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
          select(tabs[n], true);
        }
      });
    });

    // Radius: show the first N sample residences
    var radiusBtns = $$("[data-jl-radius]", doc);
    var label = $("[data-radius-count]", doc);
    radiusBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var n = parseInt(b.getAttribute("data-jl-radius"), 10);
        radiusBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var rows = $$("[data-sample-sold] .jl-res", doc);
        rows.forEach(function (r, i) { r.hidden = i >= n; });
        if (label) label.textContent = n + " sample residences";
      });
    });

    // Expandable rows
    $$(".jl-res-head", doc).forEach(function (h) {
      h.addEventListener("click", function () {
        h.setAttribute("aria-expanded", String(h.getAttribute("aria-expanded") !== "true"));
      });
    });
  }

  // Quarterly checkbox switches the sample's edition line
  function bindEdition(root) {
    var box = $("input[name='Quarterly Updates']", root);
    var line = $("[data-edition]", root);
    if (!box || !line) return;
    var upd = function () { line.textContent = box.checked ? line.getAttribute("data-on") : line.getAttribute("data-off"); };
    box.addEventListener("change", upd);
    upd();
  }

  /* ---------- Ask: topic prompts + character count ---------- */
  function setupTopics(root) {
    var form = $("form[data-jl-form]", root);
    var area = form && $("textarea[name='Question']", form);
    var btns = $$("[data-topic]", root);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") !== "true";
        btns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", String(on));
        if (on) form.setAttribute("data-topic", b.getAttribute("data-topic"));
        else form.removeAttribute("data-topic");
        var echo = $("[data-topic-echo]", root);
        if (echo) echo.textContent = on ? b.getAttribute("data-topic") : (echo.getAttribute("data-empty") || "");
        if (area && on) {
          setTimeout(function () { area.focus(); }, reduceMotion ? 0 : 200);
        }
      });
    });
  }
  function setupCounters(root) {
    $$("[data-count-for]", root).forEach(function (c) {
      var f = document.getElementById(c.getAttribute("data-count-for"));
      if (!f) return;
      var max = f.getAttribute("maxlength");
      var upd = function () { c.textContent = f.value.length + (max ? " / " + max : ""); };
      f.addEventListener("input", upd); upd();
    });
  }

  /* ---------- Scroll reveal ---------- */
  function setupReveal() {
    var els = $$("[data-jl-reveal]");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function init() {
    $$("form[data-jl-form]").forEach(setupForm);
    $$(".jl-tool").forEach(function (t) { bindEcho(t); bindEdition(t); setupTopics(t); setupCounters(t); });
    $$("[data-jl-doc]").forEach(setupDoc);
    setupReveal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
