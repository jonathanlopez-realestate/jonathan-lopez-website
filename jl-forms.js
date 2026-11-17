/* =========================================================
   jl-forms.js — Jonathan Lopez Real Estate lead forms
   Powers every form with the attribute data-jl-form
   (home-value block, street report, Ask Your Neighbor).

   Same delivery as the site's existing forms (/free-sellers-guide,
   /home-value-*): JSON POST to Web3Forms, plus the native form
   "submit" event that the existing Follow Up Boss Widget Tracker
   (pixel) listens for. The pixel reads the visible-type fields
   (text/email/tel/textarea) by name, so field names match the
   existing forms: "Full Name"/"First Name", "Email Address",
   "Property Address", "City", "ZIP", plus an off-screen "Message"
   note that carries the source, ?src= tag and any extra details.

   • Reads ?src= from the page URL (door, gbp, news, ig, ...). If there
     is none, it uses where the form sits (home, selling, blog-<post>,
     ask, street-report).
   • No cookies, no localStorage/sessionStorage, nothing new loaded.
   • ?preview=1 on any page skips the real send (console only).
   ========================================================= */
(function () {
  "use strict";

  var CONFIG = {
    accessKey: "1e05f524-7137-4686-aa6b-d3e659f76eb2",
    fromName:  "Jonathan Lopez Real Estate Website",
    endpoint:  "https://api.web3forms.com/submit"
  };
  var PREVIEW = /[?&]preview=1\b/.test(window.location.search);
  var ERR = "That didn't go through. Please try again, or call or text <a href=\"tel:8189347576\">(818) 934-7576</a>.";

  function clean(v, max) {
    return String(v || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, max || 60);
  }
  function placementFromPath() {
    var p = window.location.pathname.replace(/\/index(\.html)?$/, "/").replace(/\.html$/, "").replace(/\/$/, "");
    if (p === "") return "home";
    return clean(p.replace(/^\//, "").replace(/\//g, "-"), 120);
  }
  function urlSrc() {
    try { return clean(new URLSearchParams(window.location.search).get("src")); }
    catch (e) { return ""; }
  }
  function val(form, name) {
    var el = form.querySelector("[name='" + name + "']");
    if (!el) return "";
    if (el.type === "checkbox") return el.checked ? "Yes" : "No";
    return (el.value || "").trim();
  }
  function setHidden(form, name, value) {
    var el = form.querySelector("input[type='hidden'][name='" + name + "']");
    if (!el) { el = document.createElement("input"); el.type = "hidden"; el.name = name; form.appendChild(el); }
    el.value = value;
  }

  function send(data) {
    if (PREVIEW) { if (window.console) console.log("[preview] would send", Object.keys(data)); return Promise.resolve(); }
    return fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || j.success === false) throw new Error((j && j.message) || "send failed");
      });
    });
  }

  function setupForm(form) {
    var placement = form.getAttribute("data-placement");
    if (!placement || placement === "auto") placement = placementFromPath();
    var src = urlSrc() || placement;
    var leadTypeBase = form.getAttribute("data-lead-type") || "Website lead";
    var sourceBase = form.getAttribute("data-source") || ("Website - " + leadTypeBase);
    var subjectBase = form.getAttribute("data-subject") || leadTypeBase;
    var twoStep = form.getAttribute("data-jl-mode") === "two-step";
    var note = form.querySelector("textarea[name='Message']");
    var status = form.querySelector(".jl-status");
    var card = form.closest(".jl-card") || form.parentNode;
    var ok = card.querySelector(".jl-success");
    var steps = Array.prototype.slice.call(form.querySelectorAll(".jl-step"));
    var bar = form.querySelector(".jl-progress span");

    setHidden(form, "src", src);
    setHidden(form, "placement", placement);
    setHidden(form, "page", window.location.pathname);

    function source() { return sourceBase + " (" + placement + ") - src: " + src; }
    function nameValue() { return val(form, "Full Name") || val(form, "First Name"); }
    function firstName() { return nameValue().split(/\s+/)[0] || ""; }

    function show(i) {
      steps.forEach(function (s, n) { s.hidden = n !== i; });
      if (bar) bar.style.width = (i === 0 ? 50 : 100) + "%";
      if (status) { status.className = "jl-status"; status.textContent = ""; }
    }
    function fail(btn, label) {
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (status) { status.className = "jl-status jl-status--error"; status.innerHTML = ERR; }
    }
    function finish() {
      var slot = ok && ok.querySelector("[data-first-name]");
      if (slot) slot.textContent = firstName() ? ", " + firstName() : "";
      form.hidden = true;
      if (ok) { ok.hidden = false; ok.setAttribute("tabindex", "-1"); ok.focus(); }
    }
    function validate(container) {
      var fields = container.querySelectorAll("input:not([type=hidden]):not([type=checkbox]), textarea:not([name='Message'])");
      for (var k = 0; k < fields.length; k++) {
        var f = fields[k];
        if (f.required && !f.value.trim()) { f.value = ""; }
        if (!f.checkValidity()) { f.reportValidity(); return false; }
      }
      return true;
    }
    function payload(extra) {
      var d = {
        access_key: CONFIG.accessKey,
        from_name: CONFIG.fromName,
        botcheck: !!(form.querySelector("[name='botcheck']") || {}).checked,
        source: source(),
        src: src,
        placement: placement,
        page: window.location.pathname
      };
      Array.prototype.forEach.call(form.querySelectorAll("input:not([type=hidden]):not([name=botcheck]), textarea:not([name='Message'])"), function (el) {
        if (!el.name) return;
        d[el.name] = el.type === "checkbox" ? (el.checked ? "Yes" : "No") : (el.value || "").trim();
      });
      for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) d[k] = extra[k];
      return d;
    }
    function leadType() {
      return leadTypeBase + (val(form, "Quarterly Updates") === "Yes" ? " - Quarterly" : "");
    }
    function noteText(addOn) {
      var parts = [source(), leadType()];
      var addr = val(form, "Property Address");
      if (addr) {
        var city = val(form, "City"), zip = val(form, "ZIP");
        parts.push(city || zip ? addr + ", " + city + ", CA " + zip : addr);
      }
      if (form.querySelector("[name='Quarterly Updates']")) parts.push("Quarterly updates: " + val(form, "Quarterly Updates"));
      if (form.querySelector("[name='Homeowner']")) parts.push("Homeowner: " + val(form, "Homeowner"));
      if (val(form, "Street")) parts.push("Street: " + val(form, "Street"));
      if (val(form, "Question")) parts.push("Question: " + val(form, "Question"));
      if (addOn) parts.push(addOn);
      return parts.join(" - ");
    }

    if (steps.length) show(0);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Two-step: a submit while step 2 is showing is our own re-dispatch for the FUB pixel. Do nothing.
      if (twoStep && steps[0] && steps[0].hidden) return;
      var scope = twoStep ? steps[0] : form;
      if (!validate(scope)) { e.stopImmediatePropagation(); return; }
      if (note) note.value = noteText();
      var d = payload({ Message: note ? note.value : "", lead_type: leadType(), subject: subjectBase + " | src: " + src });
      if (twoStep) delete d["Property Address"];
      if (d.botcheck) return;
      var btn = scope.querySelector("button[type=submit]"), label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      send(d).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (twoStep) {
          var t = form.querySelector("[data-jl-thanks]");
          if (t) t.textContent = firstName() ? "Thanks, " + firstName() + "! Your request is in." : "Thanks! Your request is in.";
          show(1);
          var a = steps[1] && steps[1].querySelector("input");
          if (a) a.focus();
        } else {
          finish();
        }
      }).catch(function () { fail(btn, label); });
    });

    if (twoStep) {
      var addrBtn = form.querySelector("[data-jl-addr]");
      var skipBtn = form.querySelector("[data-jl-skip]");
      var addrInput = form.querySelector("[name='Property Address']");
      if (addrInput) addrInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); if (addrBtn) addrBtn.click(); }
      });
      if (skipBtn) skipBtn.addEventListener("click", function () { finish(); });
      if (addrBtn) addrBtn.addEventListener("click", function () {
        var a = addrInput ? addrInput.value.trim() : "";
        if (!a) { if (addrInput) addrInput.focus(); return; }
        var label = addrBtn.textContent;
        addrBtn.disabled = true; addrBtn.textContent = "Sending...";
        if (note) note.value = noteText("Address added");
        var d = payload({ Message: note ? note.value : "", lead_type: leadTypeBase + " - Address", subject: subjectBase + " - address added | src: " + src });
        if (d.botcheck) return;
        send(d).then(function () {
          // Re-fire submit so the FUB pixel records name + email + address on the same lead.
          try { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); } catch (_) {}
          if (PREVIEW) window.__fubRepost = 1;
          finish();
        }).catch(function () { fail(addrBtn, label); });
      });
    }
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("form[data-jl-form]"), setupForm);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
