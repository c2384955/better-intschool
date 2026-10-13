// ==UserScript==
// @name         Better Intschool
// @version      1.02
// @description  Visualization adaptor, grade  calculator, task manager for shc.intschool.cn · 显示优化 / 成绩计算 / 任务管理
// @match        https://shc.intschool.cn/*
// @icon         https://shc.intschool.cn/logo_icon.png
// @grant        GM_addStyle
// @run-at       document-end
// @author       Chace & D.C & D.H
// @license      MIT
// @namespace    https://github.com/c2384955/better-intschool
// @homepageURL  https://github.com/c2384955/better-intschool
// @supportURL   https://github.com/c2384955/better-intschool/issues
// @updateURL    https://raw.githubusercontent.com/c2384955/better-intschool/main/better-intschool-dev.user.js
// @downloadURL  https://raw.githubusercontent.com/c2384955/better-intschool/main/better-intschool-dev.user.js
// ==/UserScript==

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty, __defProps = Object.defineProperties, __getOwnPropDesc = Object.getOwnPropertyDescriptor, __getOwnPropDescs = Object.getOwnPropertyDescriptors, __getOwnPropNames = Object.getOwnPropertyNames, __getOwnPropSymbols = Object.getOwnPropertySymbols, __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty, __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value, __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      __hasOwnProp.call(b, prop) && __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b))
        __propIsEnum.call(b, prop) && __defNormalProp(a, prop, b[prop]);
    return a;
  }, __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __esm = (fn, res) => function() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from == "object" || typeof from == "function")
      for (let key of __getOwnPropNames(from))
        !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
    mod
  ));

  // v8.30/utils.js
  function normalizeWeights(w, label) {
    if (!Array.isArray(w) || w.length !== 5 || w.some((x) => typeof x != "number" || !isFinite(x) || x < 0))
      return console.error("[\u6743\u91CD] " + label + " \u6743\u91CD\u6570\u7EC4\u975E\u6CD5\uFF0C\u56DE\u843D\u9ED8\u8BA4\u6743\u91CD", w), [...DEFAULT_WEIGHTS];
    let sum = w.reduce((a, b) => a + b, 0);
    return sum <= 0 ? (console.error("[\u6743\u91CD] " + label + " \u6743\u91CD\u548C <= 0\uFF0C\u56DE\u843D\u9ED8\u8BA4\u6743\u91CD", w), [...DEFAULT_WEIGHTS]) : Math.abs(sum - 1) > 1e-3 ? (console.error("[\u6743\u91CD] " + label + " \u6743\u91CD\u548C=" + sum + "\uFF0C\u4E0D\u4E3A 1.0\uFF0C\u5DF2\u81EA\u52A8\u5F52\u4E00\u5316\uFF08\u811A\u672C\u7EE7\u7EED\u8FD0\u884C\uFF09", w), w.map((x) => x / sum)) : [...w];
  }
  function validateWeights() {
    let problems = [], ds = DEFAULT_WEIGHTS.reduce((a, b) => a + b, 0);
    Math.abs(ds - 1) > 1e-3 && problems.push("\u9ED8\u8BA4\u6743\u91CD\u548C=" + ds);
    for (let rule of SUBJECT_WEIGHT_RULES) {
      let s = rule.weights.reduce((a, b) => a + b, 0);
      Math.abs(s - 1) > 1e-3 && problems.push('\u89C4\u5219 "' + rule.keywords.join(" ") + '" \u6743\u91CD\u548C=' + s);
    }
    return problems.length && console.error("[\u6743\u91CD] \u81EA\u68C0\u53D1\u73B0\u95EE\u9898\uFF08\u5DF2\u5F52\u4E00\u5316\u5904\u7406\uFF0C\u4E0D\u5F71\u54CD\u8FD0\u884C\uFF09: " + problems.join("; ")), problems;
  }
  function scoreToLetter(s) {
    if (s === null || isNaN(s)) return null;
    for (let b of GRADE_BANDS) if (s >= b.min) return b.letter;
    return "F";
  }
  function getUnweightedGPA(s) {
    let l = scoreToLetter(s);
    return l ? LETTER_TO_GPA.get(l) : null;
  }
  function getWeightBonus(n) {
    return n.includes("AP") ? 1 : n.includes("ECP") ? 0.5 : 0;
  }
  function getGPAForScore(s, wb) {
    if (s === null || isNaN(s)) return null;
    let uw = getUnweightedGPA(s);
    return uw !== null ? { uw, w: uw + wb } : null;
  }
  function formatScorePrecision(v) {
    if (v === null || isNaN(v)) return "\u2014";
    let num = Number(v);
    return num === 0 ? "0" : num.toPrecision(4).replace(/\.?0+$/, "");
  }
  function formatGPA(g) {
    return g ? `UW: ${g.uw.toFixed(2)} / W: ${g.w.toFixed(2)}` : "\u2014";
  }
  function formatDiff(d) {
    if (d == null) return "";
    if (Math.abs(d) < 5e-3) return '<span style="color:#000;">0.00</span>';
    let sign = d > 0 ? "+" : "";
    return `<span style="color:${d > 0 ? "green" : "red"};">${sign}${d.toFixed(2)}</span>`;
  }
  function iconChevron(expanded, size) {
    let s = size || "12px";
    return '<i class="anticon anticon-' + (expanded ? "up" : "down") + '" style="display:inline-flex;align-items:center;' + (expanded ? "transform:rotate(180deg);" : "") + 'vertical-align:-0.125em;margin-right:4px;"><svg viewBox="64 64 896 896" data-icon="' + (expanded ? "up" : "down") + '" width="' + s + '" height="' + s + '" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + ANTD_DOWN_PATH + '"></path></svg></i>';
  }
  function iconTable(size) {
    let s = size || "12px";
    return '<i class="anticon anticon-table" style="display:inline-flex;align-items:center;vertical-align:-0.125em;margin-right:4px;"><svg viewBox="64 64 896 896" data-icon="table" width="' + s + '" height="' + s + '" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + ANTD_TABLE_PATH + '"></path></svg></i>';
  }
  function iconArrowRight() {
    return '<svg viewBox="0 0 12 8" data-icon="arrow-right" aria-hidden="true" focusable="false" style="width:0.9em;height:0.6em;vertical-align:0.1em;margin:0 0.18em;overflow:visible;" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4h9.4M7.6 1.6 10.6 4 7.6 6.4"></path></svg>';
  }
  function escapeHtml(str) {
    return str == null ? "" : String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] || m);
  }
  function calcF(p, e) {
    return p === null && e === null ? null : p === null ? e : e === null ? p : p * 0.8 + e * 0.2;
  }
  function courseIdent(course) {
    return course ? course.courseId !== void 0 && course.courseId !== null && course.courseId !== "" ? "c" + course.courseId : "n" + String(course.name || "").replace(/\s+/g, " ").trim().toLowerCase() : "";
  }
  function to3SigFigs(num) {
    if (num == null || num === 0) return 0;
    let power = 3 - Math.ceil(Math.log10(Math.abs(num)));
    return Math.round(num * Math.pow(10, power)) / Math.pow(10, power);
  }
  function helpIcon(zhText, enText, down) {
    return '<span class="ints-help-wrap" data-help-text="' + t(zhText, enText).replace(/"/g, "&quot;") + '" data-help-down="' + (down ? "1" : "0") + '" style="display:inline-flex;align-items:center;margin-left:4px;vertical-align:middle;cursor:help;"><svg viewBox="64 64 896 896" width="14" height="14" fill="#999" style="flex-shrink:0;pointer-events:none;"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/><path d="M464 688a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"/></svg></span>';
  }
  function setupHelpTooltip() {
    if (_helpTooltipDone) return;
    _helpTooltipDone = !0;
    var floatEl = document.createElement("div");
    floatEl.id = "ints-help-float", floatEl.style.display = "none", document.body.appendChild(floatEl);
    var hideTimer = null;
    function show(wrap) {
      clearTimeout(hideTimer);
      var text = wrap.getAttribute("data-help-text");
      if (text) {
        floatEl.innerHTML = text.replace(/\n/g, "<br>"), floatEl.style.display = "block", floatEl.className = wrap.getAttribute("data-help-down") === "1" ? "ints-help-float-down" : "ints-help-float-up";
        var rect = wrap.getBoundingClientRect();
        floatEl.style.visibility = "hidden", floatEl.style.left = "0", floatEl.style.top = "0";
        var tw = floatEl.offsetWidth, th = floatEl.offsetHeight;
        floatEl.style.visibility = "";
        var left = rect.left + rect.width / 2 - tw / 2, top = wrap.getAttribute("data-help-down") === "1" ? rect.bottom + 8 : rect.top - th - 8, margin = 8;
        left < margin && (left = margin), left + tw > window.innerWidth - margin && (left = window.innerWidth - tw - margin), top < margin && (top = margin), top + th > window.innerHeight - margin && (top = window.innerHeight - th - margin), floatEl.style.left = left + "px", floatEl.style.top = top + "px";
      }
    }
    function hide() {
      hideTimer = setTimeout(function() {
        floatEl.style.display = "none";
      }, 150);
    }
    document.addEventListener("mouseover", function(e) {
      var wrap = e.target.closest(".ints-help-wrap");
      wrap && show(wrap);
    }, !0), document.addEventListener("mouseout", function(e) {
      var wrap = e.target.closest(".ints-help-wrap");
      wrap && hide();
    }, !0), floatEl.addEventListener("mouseenter", function() {
      clearTimeout(hideTimer);
    }), floatEl.addEventListener("mouseleave", function() {
      hide();
    });
  }
  function loadingBlockHtml(label, pad) {
    return '<div style="padding:' + (pad || "40px") + ';text-align:center;font-size:14px;color:#555;">' + iconLoading() + (label || t("\u52A0\u8F7D\u4E2D...", "Loading...")) + "</div>";
  }
  function loadingCountText(n, m) {
    let done = n || 0;
    return !done && !m ? "" : " (" + t("\u8BF7\u6C42", "Request") + " " + done + (m ? "/" + m : "") + ")";
  }
  function getMarkIconPath() {
    try {
      let v = localStorage.getItem("ints_mark_icon");
      if (v && MARK_ICONS[v]) return MARK_ICONS[v];
    } catch (e) {
    }
    return MARK_ICONS.tag;
  }
  function iconMark(color, size) {
    return '<i aria-hidden="true" class="anticon ints-mark-icon"' + (size ? ' style="font-size:' + size + ';"' : "") + '><svg viewBox="64 64 896 896" data-icon="mark" width="1em" height="1em" fill="' + (color || "currentColor") + '" aria-hidden="true" focusable="false"><path d="' + getMarkIconPath() + '"></path></svg></i>';
  }
  function getTermFromDate(ts, raw) {
    if (raw) {
      let t4 = String(raw).toUpperCase();
      if (t4.includes("FIRST") || t4 === "1") return "S1";
      if (t4.includes("SECOND") || t4 === "2") return "S2";
    }
    if (!ts) return null;
    let d = new Date(ts), m = d.getMonth(), day = d.getDate();
    return m === 1 && day >= 16 && day <= 29 ? null : m >= 7 || m === 0 || m === 1 && day <= 15 ? "S1" : m === 2 && day >= 1 || m >= 3 && m <= 6 ? "S2" : null;
  }
  function computeColumnGPASummary(courses, getScore) {
    let tu = 0, tw = 0, tc = 0;
    for (let c of courses) {
      let s = getScore(c);
      if (s !== null && !isNaN(s)) {
        let g = getGPAForScore(s, c.weightBonus);
        g && c.credit > 0 && (tu += g.uw * c.credit, tw += g.w * c.credit, tc += c.credit);
      }
    }
    return tc === 0 ? null : { uw: tu / tc, w: tw / tc };
  }
  function computeAnnualGPA(courses, getS1F, getS2F) {
    let s1g = computeColumnGPASummary(courses, getS1F), s2g = computeColumnGPASummary(courses, getS2F);
    return !s1g && !s2g ? null : s1g ? s2g ? { uw: (s1g.uw + s2g.uw) / 2, w: (s1g.w + s2g.w) / 2 } : s1g : s2g;
  }
  function computeAnnualFromSemesters(effS1F, effS2F) {
    if (!effS1F && !effS2F) return null;
    let uwVals = [], wVals = [];
    effS1F && effS1F.uw !== null && uwVals.push(effS1F.uw), effS2F && effS2F.uw !== null && uwVals.push(effS2F.uw), effS1F && effS1F.w !== null && wVals.push(effS1F.w), effS2F && effS2F.w !== null && wVals.push(effS2F.w);
    let uw = uwVals.length > 0 ? uwVals.reduce((a, b) => a + b, 0) / uwVals.length : null, w = wVals.length > 0 ? wVals.reduce((a, b) => a + b, 0) / wVals.length : null;
    return uw === null && w === null ? null : { uw, w };
  }
  function typeShortName(typeName) {
    let idx = TYPE_PATTERNS.findIndex((p) => p.test(String(typeName == null ? "" : typeName)));
    return idx >= 0 ? t(TYPE_SHORT_ZH[idx], TYPE_SHORT_EN[idx]) : t("\u5176\u4ED6", "Other");
  }
  function virtualTaskName(entityId, typeName) {
    let n = Math.abs(Number(entityId) || 0), short = typeShortName(typeName);
    return t("\u865A\u62DF" + short + n, "Virtual " + short + " " + n);
  }
  function valueIsSimulated(shown, schoolValue) {
    return typeof shown != "number" || isNaN(shown) ? !1 : typeof schoolValue != "number" || isNaN(schoolValue) ? !0 : Math.abs(shown - schoolValue) > 1e-9;
  }
  function getCourseWeights(subject) {
    if (subject) {
      let s = subject.toLowerCase();
      for (let rule of SUBJECT_WEIGHT_RULES)
        if (rule.keywords.every((kw) => s.includes(kw)))
          return normalizeWeights(rule.weights, '\u89C4\u5219 "' + rule.keywords.join(" ") + '"');
    }
    return normalizeWeights(DEFAULT_WEIGHTS, "\u9ED8\u8BA4\u6743\u91CD");
  }
  function calcPFromCategoryData(catData, subject) {
    let weights = getCourseWeights(subject), wSum = 0, tWeight = 0;
    for (let i = 0; i < 5; i++) {
      let c = catData[i];
      c.max > 0 && weights[i] > 0 && (wSum += c.score / c.max * weights[i], tWeight += weights[i]);
    }
    return tWeight > 0 ? wSum / tWeight * 100 : null;
  }
  function aggregateCategoriesFromTasks(tasks, term, useSimulated = !0) {
    let filtered = tasks.filter((t4) => getTermFromDate(t4.endDate, t4.termRaw) === term), catData = Array(5).fill().map(() => ({ score: 0, max: 0 }));
    for (let t4 of filtered) {
      let idx = TYPE_PATTERNS.findIndex((p) => p.test(t4.typeName));
      if (idx >= 0 && idx < 5) {
        let scoreVal = useSimulated && t4.simulatedScore !== void 0 ? t4.simulatedScore : t4.originalScore;
        if (scoreVal === -1) continue;
        scoreVal != null && t4.topScore != null && t4.topScore > 0 && (catData[idx].score += scoreVal, catData[idx].max += t4.topScore);
      }
    }
    return catData;
  }
  function calculateTermAverageByCategory(tasks, subject, term) {
    let filtered = tasks.filter((t4) => t4.score != null && t4.score !== -1 && !t4.excluded && t4.topScore !== 0 && getTermFromDate(t4.endDate, t4.termRaw) === term);
    if (filtered.length === 0) return null;
    let catTotals = Array(5).fill().map(() => ({ score: 0, topScore: 0 }));
    for (let t4 of filtered) {
      let idx = TYPE_PATTERNS.findIndex((p) => p.test(t4.typeName));
      idx >= 0 && idx < 5 && (catTotals[idx].score += t4.score, catTotals[idx].topScore += t4.topScore);
    }
    let weights = getCourseWeights(subject), wSum = 0, tWeight = 0;
    for (let i = 0; i < 5; i++) {
      let c = catTotals[i];
      c.topScore > 0 && weights[i] > 0 && (wSum += c.score / c.topScore * weights[i], tWeight += weights[i]);
    }
    return tWeight > 0 ? wSum / tWeight * 100 : null;
  }
  function alignToSchoolPrecision(estimate, schoolValue) {
    if (typeof estimate != "number" || isNaN(estimate) || typeof schoolValue != "number" || isNaN(schoolValue)) return estimate;
    let frac = String(schoolValue).split(".")[1], dec = frac ? Math.min(frac.length, 6) : 0;
    return Number(estimate.toFixed(dec));
  }
  function differsFromSchool(estimate, schoolValue, tol) {
    if (typeof estimate != "number" || isNaN(estimate) || typeof schoolValue != "number" || isNaN(schoolValue)) return !1;
    let limit = (typeof tol == "number" ? tol : SCHOOL_DIFF_TOLERANCE) + SCHOOL_DIFF_EPS;
    return Math.abs(alignToSchoolPrecision(estimate, schoolValue) - schoolValue) > limit;
  }
  function extractSubjectKey(name) {
    let lowerName = name.toLowerCase();
    for (let kw of SUBJECT_KEYWORDS) if (lowerName.includes(kw.toLowerCase())) return kw;
    return null;
  }
  function countUngradedTasks(tasks, term) {
    return tasks.filter((t4) => getTermFromDate(t4.endDate, t4.termRaw) === term).filter((t4) => t4.score === null).length;
  }
  var locale, t, GRADE_BANDS, LETTER_TO_GPA, DEFAULT_WEIGHTS, SUBJECT_WEIGHT_RULES, ANTD_DOWN_PATH, ANTD_TABLE_PATH, _helpTooltipDone, iconPlus, iconSync, iconCheck, iconDelete, iconLoading, MARK_ICONS, MARK_ICON_PATH, MARK_COLOR_OFF, MARK_COLOR_ON, TYPE_PATTERNS, TYPE_NAMES, TYPE_SHORT_ZH, TYPE_SHORT_EN, SCHOOL_DIFF_TOLERANCE, SCHOOL_DIFF_EPS, SUBJECT_KEYWORDS, init_utils = __esm({
    "v8.30/utils.js"() {
      locale = (() => {
        try {
          return localStorage.getItem("locale") === "en" ? "en" : "zh";
        } catch (e) {
          return "zh";
        }
      })(), t = (zh, en) => locale === "zh" ? zh : en, GRADE_BANDS = [
        { min: 97, letter: "A+" },
        { min: 93, letter: "A" },
        { min: 90, letter: "A-" },
        { min: 87, letter: "B+" },
        { min: 83, letter: "B" },
        { min: 80, letter: "B-" },
        { min: 77, letter: "C+" },
        { min: 73, letter: "C" },
        { min: 70, letter: "C-" },
        { min: 67, letter: "D+" },
        { min: 63, letter: "D" },
        { min: 60, letter: "D-" },
        { min: 0, letter: "F" }
      ], LETTER_TO_GPA = /* @__PURE__ */ new Map([
        ["A+", 4],
        ["A", 4],
        ["A-", 3.7],
        ["B+", 3.3],
        ["B", 3],
        ["B-", 2.7],
        ["C+", 2.3],
        ["C", 2],
        ["C-", 1.7],
        ["D+", 1.3],
        ["D", 1],
        ["D-", 1],
        ["F", 0]
      ]), DEFAULT_WEIGHTS = [0.1, 0.15, 0.15, 0.4, 0.2], SUBJECT_WEIGHT_RULES = [
        { keywords: ["chinese", "humanities"], weights: [0.1, 0.15, 0.3, 0.2, 0.25] },
        { keywords: ["chinese", "language"], weights: [0.1, 0.2, 0.15, 0.4, 0.15] },
        { keywords: ["global", "humanities"], weights: [0, 0.5, 0, 0.3, 0.2] },
        { keywords: ["chinese"], weights: [0.1, 0.2, 0.15, 0.4, 0.15] },
        // 人文组课程按 syllabus：20% Tests / 30% Projects / 25% Quizzes / 10% Homework / 15% In-Class
        { keywords: ["humanities"], weights: [0.1, 0.15, 0.3, 0.2, 0.25] },
        { keywords: ["computer", "science"], weights: [0.1, 0.2, 0.4, 0.3, 0] },
        { keywords: ["design", "technology"], weights: [0.1, 0.2, 0.4, 0.3, 0] },
        { keywords: ["creative", "art"], weights: [0.1, 0.3, 0.45, 0.15, 0] },
        { keywords: ["physical"], weights: [0.1, 0.4, 0, 0.5, 0] },
        { keywords: ["health"], weights: [0.1, 0.4, 0, 0.5, 0] },
        { keywords: ["wellness"], weights: [0.1, 0.4, 0, 0.5, 0] },
        { keywords: ["english"], weights: [0.1, 0.25, 0.25, 0.25, 0.15] },
        { keywords: ["french"], weights: [0.1, 0.25, 0.25, 0.25, 0.15] },
        { keywords: ["spanish"], weights: [0.1, 0.25, 0.25, 0.25, 0.15] },
        { keywords: ["math"], weights: [0.1, 0.15, 0.15, 0.3, 0.3] },
        { keywords: ["science"], weights: [0.1, 0.15, 0.2, 0.4, 0.15] }
      ];
      validateWeights();
      for (let rule of SUBJECT_WEIGHT_RULES) rule.weights = normalizeWeights(rule.weights, '\u89C4\u5219 "' + rule.keywords.join(" ") + '"');
      ANTD_DOWN_PATH = "M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z";
      ANTD_TABLE_PATH = "M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 208H676V232h212v136zm0 224H676V432h212v160zM412 432h200v160H412V432zm200-64H412V232h200v136zm-476 64h212v160H136V432zm0-200h212v136H136V232zm0 424h212v136H136V656zm276 0h200v136H412V656zm476 136H676V656h212v136z";
      _helpTooltipDone = !1;
      iconPlus = () => '<i aria-label="icon: plus" class="anticon anticon-plus"><svg viewBox="64 64 896 896" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg></i>', iconSync = () => '<i aria-label="icon: sync" class="anticon anticon-sync"><svg viewBox="64 64 896 896" data-icon="sync" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M168 504.2c1-43.7 10-86.1 26.9-126 17.3-41 42.1-77.7 73.7-109.4S337 212.3 378 195c42.4-17.9 87.4-27 133.9-27s91.5 9.1 133.8 27A341.5 341.5 0 0 1 755 268.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 0 0 3 14.1l175.7 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c0-6.7-7.7-10.5-12.9-6.3l-56.4 44.1C765.8 155.1 646.2 92 511.8 92 282.7 92 96.3 275.6 92 503.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8zm756 7.8h-60c-4.4 0-7.9 3.5-8 7.8-1 43.7-10 86.1-26.9 126-17.3 41-42.1 77.8-73.7 109.4A342.45 342.45 0 0 1 512.1 856a342.24 342.24 0 0 1-243.2-100.8c-9.9-9.9-19.2-20.4-27.8-31.4l60.2-47a8 8 0 0 0-3-14.1l-175.7-43c-5-1.2-9.9 2.6-9.9 7.7l-.7 181c0 6.7 7.7 10.5 12.9 6.3l56.4-44.1C258.2 868.9 377.8 932 512.2 932c229.2 0 415.5-183.7 419.8-411.8a8 8 0 0 0-8-8.2z"></path></svg></i>', iconCheck = () => '<i aria-label="icon: check" class="anticon anticon-check"><svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path></svg></i>', iconDelete = () => '<i aria-label="icon: delete" class="anticon anticon-delete"><svg viewBox="64 64 896 896" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path></svg></i>', iconLoading = () => '<i aria-label="icon: loading" class="anticon anticon-loading anticon-spin"><svg viewBox="0 0 1024 1024" data-icon="loading" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg></i>';
      MARK_ICONS = {
        pushpin: "M878.3 392.1L631.9 145.7c-6.5-6.5-15-9.7-23.5-9.7s-17 3.2-23.5 9.7L423.8 306.9c-12.2-1.4-24.5-2-36.8-2-73.2 0-146.4 24.1-206.5 72.3-15.4 12.3-16.6 35.4-2.7 49.4l181.7 181.7-215.4 215.2a15.8 15.8 0 00-4.6 9.8l-3.4 37.2c-.9 9.4 6.6 17.4 15.9 17.4.5 0 1 0 1.5-.1l37.2-3.4c3.7-.3 7.2-2 9.8-4.6l215.4-215.4 181.7 181.7c6.5 6.5 15 9.7 23.5 9.7 9.7 0 19.3-4.2 25.9-12.4 56.3-70.3 79.7-158.3 70.2-243.4l161.1-161.1c12.9-12.8 12.9-33.8 0-46.8z",
        tag: "M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-3.2 0-5.7 1-7.6 2.9L88.9 557.2a9.96 9.96 0 000 14.1l363.8 363.8c1.9 1.9 4.4 2.9 7.1 2.9s5.2-1 7.1-2.9l468.3-468.3c2-2.1 3-5 2.8-8zM699 387c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z",
        flag: "M880 305H624V192c0-17.7-14.3-32-32-32H184v-40c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v784c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V640h248v113c0 17.7 14.3 32 32 32h416c17.7 0 32-14.3 32-32V337c0-17.7-14.3-32-32-32z",
        highlight: "M957.6 507.4L603.2 158.2a7.9 7.9 0 00-11.2 0L353.3 393.4a8.03 8.03 0 00-.1 11.3l.1.1 40 39.4-117.2 115.3a32.09 32.09 0 00-9.5 21.9l-1 46.6-31.1 29.5a33.4 33.4 0 00-2.3 2.6l-27.1 27.2a15.5 15.5 0 000 22l92.6 92.5c3 3 7.1 4.7 11.3 4.7s8.2-1.7 11.2-4.7l55.4-55.4a11.5 11.5 0 002.6-2.3l29.6-31 46.6-1c8.1-.2 15.9-3.4 21.8-9.3l115.4-115.2 39.5 40.1c3.1 3.1 8.2 3.1 11.3 0L957.5 518.6c3.1-3.1 3.1-8.2.1-11.2z"
      }, MARK_ICON_PATH = MARK_ICONS.tag, MARK_COLOR_OFF = "#1f1f1f", MARK_COLOR_ON = "#faad14";
      TYPE_PATTERNS = [/homework/i, /in.?class|classwork/i, /project|lab/i, /test/i, /quiz/i], TYPE_NAMES = ["Homework", "In-Class/Classwork", "Projects/Labs", "Tests", "Quizzes"], TYPE_SHORT_ZH = ["\u4F5C\u4E1A", "\u8BFE\u5802", "\u9879\u76EE", "\u6D4B\u9A8C", "\u5C0F\u6D4B"], TYPE_SHORT_EN = ["HW", "Class", "Proj.", "Test", "Quiz"];
      SCHOOL_DIFF_TOLERANCE = 0.1, SCHOOL_DIFF_EPS = 1e-9;
      SUBJECT_KEYWORDS = ["English", "Math", "Physics", "Chemistry", "Biology", "History", "Geography", "Chinese", "Economics", "Art", "Music", "PE", "Physical Education"];
    }
  });

  // v8.30/styles.js
  var require_styles = __commonJS({
    "v8.30/styles.js"() {
      GM_addStyle(`
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 0.4s;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    ::view-transition-old(root) { animation-name: vt-fade-out; }
    ::view-transition-new(root) { animation-name: vt-fade-in; }
    @keyframes vt-fade-out { to { opacity: 0; } }
    @keyframes vt-fade-in { from { opacity: 0; } to { opacity: 1; } }

    html.vt-freeze *,
    html.vt-freeze *::before,
    html.vt-freeze *::after {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-delay: 0s !important;
    }

    html.dark-fallback body,
    html.dark-fallback #app,
    html.dark-fallback .ant-layout,
    html.dark-fallback .ant-layout-header,
    html.dark-fallback .ant-layout-sider,
    html.dark-fallback .ant-layout-content,
    html.dark-fallback .ant-menu,
    html.dark-fallback .ant-table,
    html.dark-fallback .ant-table td,
    html.dark-fallback .ant-table th,
    html.dark-fallback .ant-card,
    html.dark-fallback .ant-card-body,
    html.dark-fallback .ant-btn,
    html.dark-fallback .ant-modal-content,
    html.dark-fallback .course-container,
    html.dark-fallback .side-bar,
    html.dark-fallback .ant-tabs-content,
    html.dark-fallback .ant-collapse,
    html.dark-fallback .ant-collapse-header,
    html.dark-fallback .ant-timeline-item,
    html.dark-fallback .ant-list-item,
    html.dark-fallback .ant-alert,
    html.dark-fallback .ant-tag,
    html.dark-fallback .ant-divider,
    html.dark-fallback .ant-drawer-content {
      transition: background-color 0.35s ease,
                  color 0.3s ease,
                  border-color 0.3s ease !important;
    }
`);
      GM_addStyle(`
    /* \u8FD9\u91CC\u53EA\u5217\u9875\u9762\u5185\u8054\u89C6\u56FE\u7528\u5F97\u5230\u7684\u89C4\u5219\uFF1A\u9762\u677F\u4E13\u5C5E\u6837\u5F0F\uFF08#intschool-grade-panel-modal\u3001
       #intschool-custom-grade-btn\u3001.editable-score/-exam/-pstar \u7B49\uFF09\u968F"\u5220\u9762\u677F\u3001\u6539\u7A97\u53E3\u58F3"
       \u4E00\u5E76\u53BB\u6389\u4E86 \u2014\u2014 \u5B83\u4EEC\u9009\u62E9\u7684\u662F\u65E7\u9762\u677F\u7684 DOM\uFF0C\u7167\u7740\u7559\u7740\u53EA\u4F1A\u8BEF\u5BFC\u540E\u6765\u7684\u4EBA\u3002
       \u9700\u8981\u90A3\u6279\u5916\u89C2\u65F6\u6309\u7A97\u53E3\u58F3\u7684\u7C7B\u540D\uFF08.ints-win*\uFF09\u91CD\u5199\uFF0C\u4E0D\u8981\u518D\u4ECE\u65E7\u9762\u677F\u7167\u6284\u3002 */
    .subject-detail-modal .editable-star-cat:hover { background: #ffe7ba; }
    /* ====================== \u901A\u7528\u7A97\u53E3\u58F3 ======================
       \u70B9\u6210\u7EE9\u683C\u6253\u5F00\u7684\u5355\u79D1\u7A97\u53E3\u3001\u4EE5\u53CA\u5B83\u7684\u300C\u79D1\u76EE\u660E\u7EC6\u300D\uFF0C\u5171\u7528\u8FD9\u4E00\u5957\u5916\u89C2\u3002
       \u89C2\u611F\u5BF9\u9F50\u7AD9\u70B9\u81EA\u5DF1\u7684 antd\uFF1A\u540C\u6837\u7684\u5706\u89D2/\u8FB9\u6846/\u9634\u5F71\u8272\uFF0C\u5B57\u53F7 12\u201313px\uFF0C\u4E3B\u8272 #1890ff\u3002
       **\u5B9A\u4F4D**\uFF1A\u7A97\u53E3\u662F .ant-table-body\uFF08\u6210\u7EE9\u518C\u81EA\u5DF1\u7684\u6EDA\u52A8\u5BB9\u5668\uFF09\u7684\u7EDD\u5BF9\u5B9A\u4F4D\u5B50\u8282\u70B9 \u2014\u2014
       \u8DDF\u968F\u6EDA\u52A8\u56E0\u6B64\u662F\u539F\u751F\u7684\uFF0C\u5E76\u4E14\u88AB\u8868\u5934/\u7B5B\u9009\u680F/\u5DE6\u4FA7\u5BFC\u822A\u680F\u5929\u7136\u6321\u4F4F\uFF08\u8BE6\u89C1 win-shell.js \u5934\u6CE8\uFF09\u3002
       **\u5C42\u7EA7**\uFF1A\u7A97\u53E3\u5C42 30\u201339\uFF08\u884C\u5185\u9010\u7A97\u53E3\u9012\u589E\uFF09\uFF1A\u9AD8\u4E8E\u8868\u683C\u5185\u5BB9\uFF0C\u4F4E\u4E8E\u6211\u4EEC\u81EA\u5DF1\u7684\u5DE5\u5177\u680F/\u603B\u89C8
       \uFF0840/41/50/60\uFF09\uFF0C\u66F4\u4F4E\u4E8E\u7AD9\u70B9\u81EA\u5DF1\u7684\u6D6E\u5C42\uFF08antd modal 1000+\uFF09\u2014\u2014 \u5B66\u6821\u6D6E\u5C42\u6C38\u8FDC\u4F18\u5148\u3002 */
    .ints-win { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px;
        box-shadow: 0 6px 22px rgba(0,0,0,0.18); font-size: 12px; color: rgba(0,0,0,0.85); }
    .ints-win-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
        padding: 8px 10px 7px; border-bottom: 1px solid #f0f0f0; cursor: grab; }
    .ints-win-title { min-width: 0; font-weight: 600; font-size: 13px; line-height: 1.45; }
    .ints-win-close { flex-shrink: 0; background: none; border: none; padding: 0 2px; margin: -2px 0 0;
        font-size: 18px; line-height: 1; color: rgba(0,0,0,0.45); cursor: pointer; border-radius: 4px; }
    .ints-win-close:hover { color: #f5222d; background: #fff1f0; }
    .ints-win-body { padding: 10px 12px; overflow: auto; }
    .ints-win-foot { padding: 8px 12px; border-top: 1px solid #f0f0f0; text-align: right; }
    .ints-win-foot .ant-btn + .ant-btn { margin-left: 12px; }
    .ints-win-dragging { cursor: grabbing; }
    .ints-win-dragging, .ints-win-dragging * { user-select: none !important; cursor: grabbing !important; }
    /* \u7A97\u53E3\u91CC\u7684"\u5361\u7247/\u8868\u683C"\u5757\uFF1A\u660E\u7EC6\u7A97\u53E3\u7528 */
    .ints-win .iw-card { border: 1px solid #e8e8e8; border-radius: 6px; margin-bottom: 10px; overflow: hidden; }
    .ints-win .iw-card:last-child { margin-bottom: 0; }
    .ints-win .iw-card-head { background: #fafafa; border-bottom: 1px solid #f0f0f0; padding: 6px 10px;
        font-weight: 600; font-size: 12px; color: rgba(0,0,0,0.85); }
    .ints-win .iw-table { width: 100%; border-collapse: collapse; }
    .ints-win .iw-table th { background: #fafafa; color: rgba(0,0,0,0.85); font-weight: 600; text-align: left;
        padding: 7px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; white-space: nowrap; }
    .ints-win .iw-table td { padding: 6px 10px; border-bottom: 1px solid #f5f5f5; font-size: 12px; }
    .ints-win .iw-table tr:last-child td { border-bottom: none; }
    .ints-win .iw-table tbody tr:hover td { background: #fafafa; }
    .ints-win .iw-table tr.iw-prow td { background: #f0f9ff; font-weight: 500; }
    .ints-win .iw-table tr.iw-prow:hover td { background: #e6f7ff; }
    .ints-win .iw-num { font-variant-numeric: tabular-nums; }
    .ints-win .iw-warn { margin-top: 6px; padding: 6px 10px; border-radius: 4px; font-size: 12px;
        background: #fff1f0; border: 1px solid #ffccc7; color: #d4380d; }
    .ints-win .iw-note { color: rgba(0,0,0,0.45); font-size: 12px; }
    .ints-win .iw-err { color: #d4380d; font-size: 12px; line-height: 1.7; }
    .ints-win .iw-input { width: 84px; padding: 2px 6px; text-align: center; border: 1px solid #d9d9d9;
        border-radius: 4px; font-size: 12px; height: 24px; box-sizing: border-box; }
    .ints-win .iw-input:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.15); outline: none; }
    .ints-win .iw-sim-cell { cursor: pointer; background: #fff; border-radius: 10px; padding: 2px 8px;
        border: 1px solid #ffe58f; }
    .ints-win .iw-sim-cell:hover { background: #ffe7ba; }
    .ints-win .iw-locked { color: rgba(0,0,0,0.45); }
    .anticon-spin { animation: anticon-spin-anim 1s infinite linear; }
    @keyframes anticon-spin-anim { 100% { transform: rotate(360deg); } }
    .anticon-spin-once { animation: anticon-spin-once-anim 0.6s ease; }
    @keyframes anticon-spin-once-anim { 100% { transform: rotate(360deg); } }
    .my-gpa-editable:hover { background: #e6f7ff !important; border-radius: 3px; }
    /* \u6210\u7EE9\u683C\u91CC\u90A3\u4E00\u679A GPA \u76D2\u5B50\uFF1A\u53EA\u5728"\u8FD9\u4E00\u683C\u88AB\u6A21\u62DF\u8FC7"\u65F6\u8DDF\u7740\u53D8\u9ED1\uFF08\u5E73\u65F6\u4FDD\u6301\u7070\u8272\u6B21\u8981\u5C42\u7EA7\uFF09\u3002
       \u7528\u7C7B + !important \u8986\u76D6\u5185\u8054\u7684 color \u2014\u2014 \u4E09\u5904 GPA \u76D2\u5B50\u7684**\u5185\u8054\u6837\u5F0F**\u5FC5\u987B\u9010\u9879\u76F8\u540C
       \uFF08P31_colGpaSameStyleAsScore \u6BD4\u7684\u5C31\u662F\u5185\u8054\u503C\uFF09\uFF0C\u6240\u4EE5\u989C\u8272\u5DEE\u5F02\u53EA\u80FD\u8D70\u6837\u5F0F\u8868\u3002 */
    .ant-table-tbody [data-ints-sim].ints-gpa-strong { color: rgba(0, 0, 0, 0.88) !important; }
    /* ====================== \u6CE8\u5165\u5C42 z-index \u5951\u7EA6 ======================
       \u7AD9\u70B9\u81EA\u5DF1\u7528\u7684\u662F antd-vue 1.5\uFF0C\u5B83\u7684\u6D6E\u5C42 z-index \u662F\uFF1Amodal 1000 / message 1010 /
       popover 1030 / dropdown 1050 / tooltip 1060\u3002**\u5B66\u6821\u81EA\u5DF1\u7684\u6D6E\u5C42\u6C38\u8FDC\u4F18\u5148** \u2014\u2014
       \u6211\u4EEC\u6240\u6709\u5E38\u9A7B\u6CE8\u5165\u5143\u7D20\u90FD\u5FC5\u987B\u4F4E\u4E8E 1000\uFF0C\u5426\u5219\u4F1A\u628A\u7AD9\u70B9\u81EA\u5DF1\u7684\u60AC\u6D6E\u6587\u672C\u6846\u76D6\u4F4F
       \uFF08\u4EFB\u52A1\u540D / \u79D1\u76EE\u540D\u7684 antd Tooltip \u662F 1060\uFF09\u3002
       \u672C\u63D2\u4EF6\u5185\u90E8\u5C42\u6B21\uFF08\u7531\u4F4E\u5230\u9AD8\uFF09\uFF1A
         20   \u62D6\u62FD\u6295\u653E\u533A\uFF08dragmark.js\uFF0C\u5FC5\u987B\u5728\u9875\u9762\u5185\u5BB9\u4E4B\u4E0A\u3001\u6309\u94AE\u4E4B\u4E0B\uFF09
         30\u201339 \u7A97\u53E3\u5C42\uFF08win-shell.js\uFF1A\u5355\u79D1\u7A97\u53E3 / \u79D1\u76EE\u660E\u7EC6\u7A97\u53E3\uFF1B\u4F4F\u5728 .ant-table-body \u91CC\u3001\u88AB\u5BB9\u5668\u88C1\u5207\uFF09
         40   DDL \u60AC\u6D6E\u5361\u7247\u5224\u5B9A\u533A\uFF08.intschool-deadline-tooltip-fixed\uFF09
         41   DDL \u26A0 \u6309\u94AE\uFF08#intschool-deadline-btn\uFF0C\u6BD4\u5224\u5B9A\u533A\u9AD8\u4E00\u70B9\u4FDD\u8BC1\u53EF\u70B9\uFF09
         50   /points \u6CE8\u5165\u4E0B\u62C9\u83DC\u5355\uFF08#ints-inline-menu-*\uFF09
         60   /points \u591A\u5E74\u7EA7\u603B\u89C8\u7A97\u53E3\uFF08#ints-overview-view\uFF0C\u76D6\u4F4F\u6211\u4EEC\u81EA\u5DF1\u7684\u6CE8\u5165\u5143\u7D20\uFF09
         100001 \u5E2E\u52A9\u6D6E\u5C42\uFF08#ints-help-float\uFF0C\u6211\u4EEC\u4E3B\u52A8\u5F39\u7684\uFF09
         20020 \u865A\u62DF\u4EFB\u52A1\u5F39\u7A97\uFF08simulation.js\uFF0C\u5C45\u4E2D\u6A21\u6001\uFF0C\u4E0D\u53C2\u4E0E\u7A97\u53E3\u5C42\u89C4\u5219\uFF09 */
    /* \u865A\u62DF\u4EFB\u52A1\u5F39\u7A97\uFF1A\u5916\u89C2\u5168\u90E8\u8D70\u7AD9\u70B9\u81EA\u5DF1\u7684 antd 1.5 \u7C7B\uFF08.ant-modal* / .ant-form-item* / .ant-btn*\uFF09\uFF0C
       \u8FD9\u91CC\u53EA\u8865\u4E24\u4EF6 antd \u7ED9\u4E0D\u4E86\u7684\u4E8B \u2014\u2014 \u2460 \u538B\u6389 .ant-modal \u81EA\u5E26\u7684 top \u504F\u79FB\u4E0E\u5E95\u90E8\u7559\u767D\uFF08\u5C45\u4E2D\u7531\u6211\u4EEC
       \u81EA\u5DF1\u7684\u906E\u7F69 flex \u8D1F\u8D23\uFF09\uFF1B\u2461 \u5185\u5BB9\u533A\u9650\u9AD8\uFF08\u8868\u5355\u6BD4 antd \u9ED8\u8BA4\u7684\u786E\u8BA4\u6846\u957F\uFF0C\u4E0D\u7559\u6EDA\u52A8\u6761\u4F1A\u9876\u51FA\u5C4F\u5E55\uFF09\u3002 */
    .virtual-task-modal .ant-modal { top: 0; padding-bottom: 0; }
    .virtual-task-modal .ant-modal-body { max-height: 68vh; overflow-y: auto; }
    .virtual-task-modal .ant-modal-close { border: 0; background: transparent; cursor: pointer; }
    /* \u60AC\u6D6E\u63D0\u793A\uFF1A\u767D\u8272\u5361\u7247\u672C\u4F53\u3002**\u5224\u5B9A\u533A\u4E0E\u5361\u7247\u5916\u6846\u5B8C\u5168\u91CD\u5408**\uFF08padding:0\uFF09\u2014\u2014
       \u9F20\u6807\u79BB\u5F00\u5361\u7247\u5373\u8FDB\u5165 180ms \u9690\u85CF\u5012\u8BA1\u65F6\uFF1B\u6309\u94AE\u2192\u5361\u7247\u4E4B\u95F4\u90A3 8px \u7A7A\u9699\u7531\u8FD9 180ms \u515C\u4F4F
       \uFF08deadline.js \u7684 _hideFloatTip\uFF09\uFF0C\u6240\u4EE5\u4E0D\u4F1A\u8BEF\u5173\u3002\u5224\u5B9A\u533A\u82E5\u6BD4\u5361\u7247\u5927\u4E00\u5708\uFF0C
       \u89C6\u89C9\u4E0A\u4F1A\u591A\u51FA\u4E00\u4E2A\u770B\u4E0D\u89C1\u7684\u8FB9\u6846\u3002 */
    .intschool-deadline-tooltip-fixed {
        position: fixed;
        padding: 0;
        z-index: 40;
        pointer-events: auto;
    }
    .intschool-deadline-tooltip-box {
        position: relative;
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        padding: 8px 12px;
        font-size: 13px;
        line-height: 1.8;
        color: #333;
        max-height: 70vh;
        overflow-y: auto;
    }
    .intschool-deadline-tooltip-box::after { content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-bottom-color: #fff; }
    .intschool-deadline-tooltip-box::before { content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); border: 7px solid transparent; border-bottom-color: #e8e8e8; }
    /* \u6309\u94AE\u7F6E\u4E8E\u5224\u5B9A\u533A\u4E4B\u4E0A\uFF0C\u4FDD\u8BC1\u6309\u94AE\u59CB\u7EC8\u53EF\u70B9\u51FB\uFF1B\u4F46\u4ECD\u4F4E\u4E8E\u7AD9\u70B9\u81EA\u5DF1\u7684\u6D6E\u5C42\uFF08\u89C1\u4E0A\u65B9\u5C42\u6B21\u5951\u7EA6\uFF09 */
    #intschool-deadline-btn { position: relative; z-index: 41; }
    .task-dash-row:hover { background: #fafafa; }
    .task-toggle-switch { appearance: none; -webkit-appearance: none; width: 28px; height: 16px; background: #ccc; border-radius: 8px; position: relative; outline: none; cursor: pointer; transition: background 0.2s; margin: 0; flex-shrink: 0; }
    .task-toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
    .task-toggle-switch:checked { background: #1890ff; }
    .task-toggle-switch:checked::after { transform: translateX(12px); }
    .task-toggle-label { user-select: none; }
    #ints-help-float { position: fixed; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); padding: 8px 12px; font-size: 12px; line-height: 1.6; color: #555; z-index: 100001; white-space: normal; width: 320px; font-weight: normal; pointer-events: auto; }
    .ints-help-float-up::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: #fff; }
    .ints-help-float-up::before { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top-color: #d9d9d9; }
    .ints-help-float-down::after { content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-bottom-color: #fff; }
    .ints-help-float-down::before { content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-bottom-color: #d9d9d9; }
`);
    }
  });

  // v8.30/state.js
  function _serTask(t4) {
    return { e: t4.entityId, n: t4.name, y: t4.typeName, s: t4.score, t: t4.topScore, d: t4.endDate, r: t4.termRaw, o: t4.originalScore, m: t4.simulatedScore, v: t4.isVirtual || !1, x: t4.excluded === !0 };
  }
  function _deserTask(o) {
    let isVirtual = o.v === !0;
    return { entityId: o.e, taskStudentId: o.e, id: o.e, name: isVirtual ? virtualTaskName(o.e, o.y) : o.n, typeName: o.y, score: o.s, topScore: o.t, endDate: o.d, termRaw: o.r, originalScore: o.o, simulatedScore: o.m, isVirtual, excluded: o.x === !0 };
  }
  function _serCourse(c) {
    return { n: c.name, ci: c.courseId, cr: c.credit, wb: c.weightBonus, su: c.subject || null, og: { s1p: c.originalGrades.s1p, s1e: c.originalGrades.s1e, s1f: c.originalGrades.s1f, s2p: c.originalGrades.s2p, s2e: c.originalGrades.s2e, s2f: c.originalGrades.s2f }, sg: c.simGrades ? { s1p: c.simGrades.s1p, s1e: c.simGrades.s1e, s1f: c.simGrades.s1f, s2p: c.simGrades.s2p, s2e: c.simGrades.s2e, s2f: c.simGrades.s2f } : null, ss: c.showStar ? { s1: c.showStar.s1, s2: c.showStar.s2 } : null, op: c.overrideP ? { s1: c.overrideP.s1, s2: c.overrideP.s2 } : null, ts: (c.tasks || []).map((t4) => _serTask(t4)) };
  }
  function _deserCourse(o) {
    let c = { name: o.n, courseId: o.ci, credit: o.cr, weightBonus: o.wb, subject: o.su || null, originalGrades: o.og, simGrades: o.sg || { s1p: o.og.s1p, s1e: o.og.s1e, s1f: o.og.s1f, s2p: o.og.s2p, s2e: o.og.s2e, s2f: o.og.s2f }, showStar: o.ss || { s1: !1, s2: !1 }, overrideP: o.op || { s1: null, s2: null }, tasks: (o.ts || []).map((t4) => _deserTask(t4)) };
    return c.simGrades.s1p === void 0 && (c.simGrades.s1p = c.originalGrades.s1p), c.simGrades.s2p === void 0 && (c.simGrades.s2p = c.originalGrades.s2p), c;
  }
  function _serUserCourse(c) {
    let e = null;
    c.simGrades && c.originalGrades && (c.simGrades.s1e !== c.originalGrades.s1e || c.simGrades.s2e !== c.originalGrades.s2e) && (e = { s1e: c.simGrades.s1e, s2e: c.simGrades.s2e });
    let te = [], vt = [];
    for (let t4 of c.tasks || []) {
      if (t4.isVirtual) {
        vt.push(_serTask(t4));
        continue;
      }
      t4.simulatedScore !== t4.originalScore && te.push({ e: t4.entityId, m: t4.simulatedScore });
    }
    return {
      ci: c.courseId,
      n: c.name,
      e,
      op: c.overrideP ? { s1: c.overrideP.s1, s2: c.overrideP.s2 } : null,
      te,
      vt
    };
  }
  function _userLayerDirty(uc) {
    return !!(uc.te.length || uc.vt.length || uc.e || uc.op && (uc.op.s1 !== null || uc.op.s2 !== null));
  }
  function calibrationExcluded(yearKey, entityId) {
    let set = S.calibExcluded.get(String(yearKey));
    return !!(set && set.has(String(entityId)));
  }
  function markCalibrationExcluded(yearKey, entityId) {
    if (entityId == null || entityId === "") return !1;
    let k = String(yearKey), set = S.calibExcluded.get(k);
    set || (set = /* @__PURE__ */ new Set(), S.calibExcluded.set(k, set));
    let id = String(entityId);
    return set.has(id) ? !1 : (set.add(id), markDirty(), !0);
  }
  function _isSchoolYear(yearKey) {
    return S.schoolYearKey === null || String(yearKey) === String(S.schoolYearKey);
  }
  function _simsForSave(yearKey, entry) {
    return String(yearKey) === String(S.simYearKey) && S.simCourses && S.simCourses.length ? S.simCourses : entry.simCourses;
  }
  function _collectUserLayer() {
    let prev = {};
    try {
      let raw = localStorage.getItem(STORAGE_KEY_USER);
      raw && (prev = JSON.parse(raw) || {});
    } catch (e) {
      prev = {};
    }
    let out = __spreadValues({}, prev);
    for (let [k, v] of S.yearDataCache) {
      if (!_isSchoolYear(k)) continue;
      let sims = _simsForSave(k, v);
      if (!sims || !sims.length) continue;
      let cs = [];
      for (let c of sims) {
        let uc = _serUserCourse(c);
        _userLayerDirty(uc) && cs.push(uc);
      }
      cs.length ? out[k] = { vt: String(k) === String(S.simYearKey) ? S.virtualTaskIdCounter : v.virtualTaskIdCounter, c: cs } : delete out[k];
    }
    return out;
  }
  function flushSave(force) {
    if (!_saveDisabled && !(!force && !S._saveDirty)) {
      S._saveDirty = !1, clearTimeout(S._saveTimer), S._saveTimer = null;
      try {
        let cacheObj = {};
        for (let [k, v] of S.yearDataCache) {
          let ser = { sectionName: v.sectionName, annualGPA: v.annualGPA, cumulativeGPA: v.cumulativeGPA, dataTs: v.dataTs || 0 };
          if (v.originalCourses && (ser.oc = v.originalCourses.map((c) => _serCourse(c))), _isSchoolYear(k)) {
            let sims = _simsForSave(k, v);
            sims && sims.length && (ser.sc = sims.map((c) => _serCourse(c)));
          }
          let vt = String(k) === String(S.simYearKey) ? S.virtualTaskIdCounter : v.virtualTaskIdCounter;
          vt != null && (ser.vt = vt), cacheObj[k] = ser;
        }
        localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(cacheObj)), localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(_collectUserLayer()));
        let calib = {};
        for (let [k, set] of S.calibExcluded)
          set && set.size && (calib[k] = [...set]);
        localStorage.setItem(STORAGE_KEY_CALIB, JSON.stringify(calib)), localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(S.multiYearGPAOverrides)), localStorage.setItem(STORAGE_KEY_VTID, String(S.virtualTaskIdCounter)), S.lastSelectedYearKey !== null && localStorage.setItem(STORAGE_KEY_LAST_YEAR, S.lastSelectedYearKey), localStorage.setItem(STORAGE_KEY_LAST_FILTER, S.lastSelectedFilter), localStorage.setItem(STORAGE_KEY_COLS, S.colsExpanded ? "1" : "0"), S.targetUWGPA !== null ? localStorage.setItem(STORAGE_KEY_TARGET_UW, String(S.targetUWGPA)) : localStorage.removeItem(STORAGE_KEY_TARGET_UW), S.targetWGPA !== null ? localStorage.setItem(STORAGE_KEY_TARGET_W, String(S.targetWGPA)) : localStorage.removeItem(STORAGE_KEY_TARGET_W), localStorage.setItem(STORAGE_KEY_TARGET_MODE, S.targetGPAMode);
      } catch (e) {
        console.error("[\u4FDD\u5B58] flushSave \u5931\u8D25:", e.message);
      }
    }
  }
  function markDirty() {
    _saveDisabled || (S._saveDirty = !0, S._saveTimer || (S._saveTimer = setTimeout(() => flushSave(), 2e3)));
  }
  function clearServerCache() {
    try {
      return _saveDisabled = !0, S._saveTimer && (clearTimeout(S._saveTimer), S._saveTimer = null), S._saveDirty = !1, localStorage.removeItem(STORAGE_KEY_CACHE), localStorage.removeItem(STORAGE_KEY_CALIB), localStorage.removeItem(STORAGE_KEY_SITE_SCHEDULE), S.yearDataCache.clear(), S.calibExcluded.clear(), S._creditMapCache = null, !0;
    } catch (e) {
      return console.error("[\u4FDD\u5B58] \u6E05\u9664\u7F13\u5B58\u5931\u8D25:", e.message), !1;
    }
  }
  function isYearCacheFresh(yearKey) {
    let v = S.yearDataCache.get(String(yearKey));
    if (!v) return !1;
    let ts = v.dataTs || 0;
    return ts ? Date.now() - ts < CACHE_TTL : !1;
  }
  function loadFromLocalStorage() {
    try {
      let cacheStr = localStorage.getItem(STORAGE_KEY_CACHE);
      if (cacheStr) {
        let cacheObj = JSON.parse(cacheStr);
        delete cacheObj._ts;
        for (let [k, v] of Object.entries(cacheObj)) {
          let restored = { sectionName: v.sectionName, annualGPA: v.annualGPA, cumulativeGPA: v.cumulativeGPA, dataTs: v.dataTs || 0 };
          v.oc && (restored.originalCourses = v.oc.map((o) => _deserCourse(o))), v.sc && (restored.simCourses = v.sc.map((o) => _deserCourse(o))), v.vt !== void 0 && (restored.virtualTaskIdCounter = v.vt), S.yearDataCache.set(k, restored);
        }
      }
      let userStr = localStorage.getItem(STORAGE_KEY_USER);
      if (userStr) {
        let userObj = JSON.parse(userStr);
        for (let [k, v] of Object.entries(userObj || {}))
          v && Array.isArray(v.c) && S.userSimCache.set(k, v);
      }
      let ovStr = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      ovStr && (S.multiYearGPAOverrides = JSON.parse(ovStr));
      let calStr = localStorage.getItem(STORAGE_KEY_CALIB);
      if (calStr) {
        let calObj = JSON.parse(calStr) || {};
        S.calibExcluded = new Map(Object.entries(calObj).map(([k, v]) => [k, new Set((Array.isArray(v) ? v : []).map(String))]));
      }
      let vtidStr = localStorage.getItem(STORAGE_KEY_VTID);
      vtidStr && (S.virtualTaskIdCounter = parseInt(vtidStr) || -1);
      let lyStr = localStorage.getItem(STORAGE_KEY_LAST_YEAR);
      lyStr && (S.lastSelectedYearKey = lyStr);
      let lfStr = localStorage.getItem(STORAGE_KEY_LAST_FILTER);
      lfStr && (S.lastSelectedFilter = lfStr), S.colsExpanded = localStorage.getItem(STORAGE_KEY_COLS) === "1";
      let tuwStr = localStorage.getItem(STORAGE_KEY_TARGET_UW);
      tuwStr && (S.targetUWGPA = parseFloat(tuwStr));
      let twStr = localStorage.getItem(STORAGE_KEY_TARGET_W);
      twStr && (S.targetWGPA = parseFloat(twStr));
      let modeStr = localStorage.getItem(STORAGE_KEY_TARGET_MODE);
      (modeStr === "exam" || modeStr === "subject") && (S.targetGPAMode = modeStr);
    } catch (e) {
      console.error("[\u52A0\u8F7D] loadFromLocalStorage \u5931\u8D25:", e.message);
    }
  }
  function ensureStorageLoaded() {
    S._storageLoaded || (S._storageLoaded = !0, loadFromLocalStorage());
  }
  var BASE_URL, BUTTON_ID, DEADLINE_CACHE_TTL, CACHE_TTL, COLUMN_KEY_MAPPING, STORAGE_KEY_TASK_TOGGLES, STORAGE_KEY_TASK_MARKS, STORAGE_KEY_TASK_IGNORE, STORAGE_KEY_CACHE, STORAGE_KEY_USER, STORAGE_KEY_OVERRIDES, STORAGE_KEY_VTID, STORAGE_KEY_CALIB, STORAGE_KEY_LAST_YEAR, STORAGE_KEY_LAST_FILTER, STORAGE_KEY_COLS, STORAGE_KEY_TARGET_UW, STORAGE_KEY_TARGET_W, STORAGE_KEY_TARGET_MODE, STORAGE_KEY_SITE_SCHEDULE, S, _saveDisabled, init_state = __esm({
    "v8.30/state.js"() {
      init_utils();
      BASE_URL = "https://shc.intschool.cn/api", BUTTON_ID = "intschool-custom-grade-btn", DEADLINE_CACHE_TTL = 300 * 1e3, CACHE_TTL = 3600 * 1e3, COLUMN_KEY_MAPPING = {
        "2025-2026": { s1p: "189", s1e: "191", s1f: null, s2p: "226", s2e: null, s2f: null }
      }, STORAGE_KEY_TASK_TOGGLES = "ints_task_toggles", STORAGE_KEY_TASK_MARKS = "ints_task_marks", STORAGE_KEY_TASK_IGNORE = "ints_ddl_ignore", STORAGE_KEY_CACHE = "ints_gs_cache", STORAGE_KEY_USER = "ints_gs_user", STORAGE_KEY_OVERRIDES = "ints_gs_overrides", STORAGE_KEY_VTID = "ints_gs_vtid", STORAGE_KEY_CALIB = "ints_calib_excluded", STORAGE_KEY_LAST_YEAR = "ints_gs_lastYear", STORAGE_KEY_LAST_FILTER = "ints_gs_lastFilter", STORAGE_KEY_COLS = "ints_gs_colsExpanded", STORAGE_KEY_TARGET_UW = "ints_gs_targetUW", STORAGE_KEY_TARGET_W = "ints_gs_targetW", STORAGE_KEY_TARGET_MODE = "ints_gs_targetMode", STORAGE_KEY_SITE_SCHEDULE = "schedule", S = {
        currentYearKey: null,
        currentYearValue: null,
        // 在读学年（只认第一次）—— 能不能模拟、要不要写用户数据、跑不跑校准看它
        schoolYearKey: null,
        // originalCourses/simCourses 属于哪一年 —— 落盘与校准写哪个槽位认它（currentYearKey 是先改键后换数据，不能当键用）
        simYearKey: null,
        isCurrentYear: !0,
        yearList: [],
        originalCourses: [],
        simCourses: [],
        currentFilter: "all",
        activeSubModal: !1,
        warningTimeout: null,
        isCalibrating: !1,
        calibrateAbortController: null,
        taskDetailCache: /* @__PURE__ */ new Map(),
        yearDataCache: /* @__PURE__ */ new Map(),
        userSimCache: /* @__PURE__ */ new Map(),
        // yearKey → 用户层（无 TTL，见 STORAGE_KEY_USER）
        virtualTaskIdCounter: -1,
        creditMap: /* @__PURE__ */ new Map(),
        _creditMapCache: null,
        isMultiYearMode: !1,
        multiYearEntries: [],
        multiYearCourseMap: /* @__PURE__ */ new Map(),
        currentYearAnnualGPA: null,
        currentYearCumulativeGPA: null,
        studentIdCache: null,
        yearListCache: null,
        multiYearGPAOverrides: {},
        loadingRequestCount: 0,
        expectedRequestCount: 0,
        currentAbortController: null,
        lastSelectedYearKey: null,
        lastSelectedFilter: "all",
        // 「详情」展开态：用户点出来的视图状态，跟着落盘（不记住就得每次重开）
        colsExpanded: !1,
        targetUWGPA: null,
        targetWGPA: null,
        targetGPAMode: "subject",
        _targetGapCache: /* @__PURE__ */ new Map(),
        _deadlineCache: { ts: 0, data: [] },
        _deadlineAllTasks: [],
        _deadlineCheckInFlight: !1,
        // 截止提醒懒加载：checkedOnce = 这一页查过没有、CheckTrigger = 首次触发来源、FallbackArmed = 30 秒兜底
        _deadlineCheckedOnce: !1,
        _deadlineCheckTrigger: null,
        _deadlineFallbackArmed: !1,
        _taskIgnore: {},
        _taskToggles: {},
        _taskMarks: {},
        _taskDragging: !1,
        _errors: [],
        _navGeneration: 0,
        _autoCalibrateCounts: /* @__PURE__ */ new Map(),
        // courseId → 本会话已自动校准次数（每科上限见 simulation.js）
        calibExcluded: /* @__PURE__ */ new Map(),
        // yearKey → Set(entityId)：校准确认不计分的任务（无 TTL，跨会话）
        _simGen: 0,
        // 模拟层代次（initSimCourses 每次重建 +1，校准据此放弃过期结果）
        _saveDirty: !1,
        _saveTimer: null,
        _storageLoaded: !1
      };
      _saveDisabled = !1;
    }
  });

  // v8.30/log.js
  function getBuildChannel() {
    return "dev";
  }
  function isLogOn() {
    return _on;
  }
  function setLogOn(on) {
    _on = !!(on && on !== "0" && on !== "false");
    try {
      localStorage.setItem(LOG_KEY, _on ? "1" : "0");
    } catch (e) {
    }
    return _on;
  }
  function log(...args) {
    if (_on)
      try {
        console.log(...args);
      } catch (e) {
      }
  }
  var LOG_KEY, _on, init_log = __esm({
    "v8.30/log.js"() {
      LOG_KEY = "ints_log";
      _on = (function() {
        try {
          let stored = localStorage.getItem(LOG_KEY);
          if (stored === "1") return !0;
          if (stored === "0") return !1;
        } catch (e) {
        }
        return !0;
      })();
    }
  });

  // v8.30/api.js
  function getToken() {
    return sessionStorage.getItem("token") || (() => {
      try {
        let t4 = localStorage.getItem("token");
        if (t4) return JSON.parse(t4).token;
      } catch (e) {
      }
      return null;
    })();
  }
  function getSchoolId() {
    try {
      let info = localStorage.getItem("schoolInfo");
      if (info) return JSON.parse(info).schoolId;
    } catch (e) {
    }
    return null;
  }
  function getLocale() {
    return localStorage.getItem("locale") || "en";
  }
  async function apiRequest(url, options = {}) {
    let token = getToken(), schoolId = getSchoolId(), locale2 = getLocale(), headers = __spreadValues({
      "x-token": token,
      "x-schoolid": String(schoolId),
      "x-locale": locale2
    }, options.headers), signal = options.signal || (S.currentAbortController ? S.currentAbortController.signal : null), response = await fetch(url, __spreadProps(__spreadValues({}, options), { headers, credentials: "include", signal }));
    if (!response.ok) throw new Error(`HTTP ${response.status} @ ${url}`);
    return response.json();
  }
  async function promiseLimit(promises, limit = 5) {
    let results = [], executing = [];
    for (let promise of promises) {
      let p = Promise.resolve().then(() => promise);
      if (results.push(p), limit <= promises.length) {
        let e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e), executing.length >= limit && await Promise.race(executing);
      }
    }
    return Promise.all(results);
  }
  async function fetchSchoolYearList() {
    if (S.yearListCache) return S.yearListCache;
    log("[API] \u83B7\u53D6\u5B66\u5E74\u5217\u8868");
    let data = await apiRequest(BASE_URL + "/dropDown/schoolYearRuleList");
    if (!Array.isArray(data) || data.length === 0)
      throw S.yearListCache = null, new Error("[API] \u5B66\u5E74\u5217\u8868\u54CD\u5E94\u65E0\u6548\u6216\u4E3A\u7A7A: " + (data === null ? "null" : Array.isArray(data) ? "\u7A7A\u6570\u7EC4" : typeof data));
    return S.yearListCache = data.map((item) => ({ key: item.key, value: item.value })), S.yearListCache;
  }
  function parseScheduleToCreditMap(raw) {
    try {
      let sched = JSON.parse(raw), scsResponses = sched.scsResponses;
      if (!Array.isArray(scsResponses))
        return console.warn("[\u52A0\u8F7D] schedule \u6570\u636E\u7F3A\u5C11 scsResponses \u6570\u7EC4\uFF0C\u9876\u5C42 keys: " + Object.keys(sched).join(",")), null;
      let map = /* @__PURE__ */ new Map(), totalCourses = 0, withCredit = 0;
      return scsResponses.forEach((scs) => {
        [...scs.courses || [], ...scs.ongoingCourses || []].forEach((c) => {
          totalCourses++, c.courseId && typeof c.effectiveCredit == "number" ? (map.set(c.courseId, c.effectiveCredit), withCredit++) : totalCourses <= 3 && console.warn("[\u52A0\u8F7D] schedule \u8BFE\u7A0B\u7F3A\u5C11 courseId/effectiveCredit: " + JSON.stringify({ courseId: c.courseId, courseName: c.courseName, effectiveCredit: c.effectiveCredit }));
        });
      }), log(`[\u52A0\u8F7D] loadCreditMap: scsResponses=${scsResponses.length} \u8BFE\u7A0B=${totalCourses} \u5B66\u5206\u6761\u76EE=${withCredit}`), map;
    } catch (e) {
      return console.error("[\u8C03\u8BD5] loadCreditMap \u89E3\u6790 schedule \u5F02\u5E38", e), null;
    }
  }
  async function loadCreditMap() {
    if (S._creditMapCache) return S._creditMapCache;
    try {
      let raw = localStorage.getItem("schedule");
      if (raw) {
        let map = parseScheduleToCreditMap(raw);
        if (map)
          return S._creditMapCache = map, map;
      }
    } catch (e) {
      console.error("[\u8C03\u8BD5] loadCreditMap \u8BFB\u53D6 schedule \u5F02\u5E38", e);
    }
    try {
      let data = await apiRequest(BASE_URL + "/schedule"), map = parseScheduleToCreditMap(JSON.stringify(data));
      if (map) {
        try {
          localStorage.setItem("schedule", JSON.stringify(data));
        } catch (e) {
        }
        return S._creditMapCache = map, map;
      }
    } catch (e) {
      console.warn("[\u52A0\u8F7D] /api/schedule \u8BF7\u6C42\u5931\u8D25: " + e.message + "\uFF0C\u7B49\u5F85 localStorage \u515C\u5E95");
    }
    let pollDeadline = Date.now() + 5e3;
    for (; Date.now() < pollDeadline; ) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        let raw = localStorage.getItem("schedule");
        if (raw) {
          let map = parseScheduleToCreditMap(raw);
          if (map)
            return S._creditMapCache = map, map;
        }
      } catch (e) {
        console.error("[\u8C03\u8BD5] loadCreditMap \u8F6E\u8BE2\u8BFB\u53D6 schedule \u5F02\u5E38", e);
      }
    }
    return console.warn("[\u52A0\u8F7D] loadCreditMap \u672A\u53D6\u5230 schedule \u6570\u636E\uFF08localStorage \u4E0E /api/schedule \u5747\u5931\u8D25\uFF09\uFF0C\u5B66\u5206\u6620\u5C04\u4E3A\u7A7A"), S._creditMapCache = /* @__PURE__ */ new Map(), S._creditMapCache;
  }
  function mergeTasksForTerm(targetCourse, sourceCourse, term) {
    let sourceTasks = sourceCourse.tasks.filter((t4) => getTermFromDate(t4.endDate, t4.termRaw) === term), existingIds = new Set(targetCourse.tasks.map((t4) => t4.id));
    for (let task of sourceTasks)
      if (!existingIds.has(task.id)) {
        let newTask = __spreadProps(__spreadValues({}, task), { originalScore: task.score, simulatedScore: task.score });
        targetCourse.tasks.push(newTask);
      }
    targetCourse.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
  }
  async function fetchAllTasksForCourse(courseId, schoolYearId, signal) {
    log(`[\u6821\u51C6] \u83B7\u53D6\u8BFE\u7A0B ${courseId} \u5B8C\u6574\u4EFB\u52A1\u5217\u8868`);
    let allTasks = [], pageCurrent = 1, pageSize = 30, maxPages = 20, total = 0, fetched = 0;
    do {
      let url = `${BASE_URL}/task/mergeList?pageSize=${pageSize}&pageCurrent=${pageCurrent}&courseId=${courseId}&schoolYearId=${schoolYearId}&name=`, data = await apiRequest(url, { signal }), items = data.items || [];
      if (allTasks.push(...items), fetched += items.length, total = data.totalItem || 0, items.length === 0 || items.length < pageSize || pageCurrent >= maxPages) break;
      pageCurrent++;
    } while (fetched < total);
    return allTasks;
  }
  async function fetchTaskDetail(taskStudentId, signal) {
    let id = parseInt(taskStudentId, 10);
    if (S.taskDetailCache.has(id)) return S.taskDetailCache.get(id);
    log(`[\u6821\u51C6] \u83B7\u53D6\u4EFB\u52A1\u8BE6\u60C5 taskStudentId=${id}`);
    let url = `${BASE_URL}/task/detail?taskStudentId=${id}`, inTotal = (await apiRequest(url, { signal })).inTotal === !0;
    if (S.taskDetailCache.size >= TASK_CACHE_MAX) {
      let oldestKey = S.taskDetailCache.keys().next().value;
      S.taskDetailCache.delete(oldestKey);
    }
    return S.taskDetailCache.set(id, inTotal), inTotal;
  }
  var TASK_CACHE_MAX, init_api = __esm({
    "v8.30/api.js"() {
      init_state();
      init_utils();
      init_log();
      TASK_CACHE_MAX = 300;
    }
  });

  // v8.30/deadline.js
  function DL(...a) {
    log(...a);
  }
  function taskHref(entityId) {
    return _TASK_HREF_PATTERN ? _TASK_HREF_PATTERN.replace("{id}", String(entityId)) : null;
  }
  function _ensureFloatTip() {
    if (_deadlineFloatTip && _deadlineFloatTip.isConnected) {
      DL("[DDL] _ensureFloatTip: \u590D\u7528\u5DF2\u8FDE\u63A5\u5224\u5B9A\u533A");
      return;
    }
    DL("[DDL] _ensureFloatTip: \u91CD\u5EFA\u5224\u5B9A\u533A (oldConnected=" + !!(_deadlineFloatTip && _deadlineFloatTip.isConnected) + ")"), _deadlineFloatBox = document.createElement("div"), _deadlineFloatBox.className = "intschool-deadline-tooltip-box", _deadlineFloatTip = document.createElement("div"), _deadlineFloatTip.className = "intschool-deadline-tooltip-fixed", _deadlineFloatTip.style.display = "none", _deadlineFloatTip.appendChild(_deadlineFloatBox), document.body.appendChild(_deadlineFloatTip), _deadlineFloatTip.addEventListener("mouseenter", function() {
      clearTimeout(_deadlineFloatTimer);
    }), _deadlineFloatTip.addEventListener("mouseleave", _hideFloatTip);
  }
  function _positionFloatTip() {
    clearTimeout(_deadlineFloatTimer);
    let btn = document.getElementById("intschool-deadline-btn");
    if (!btn) {
      console.warn("[DDL] _positionFloatTip: \u6309\u94AE\u4E0D\u5B58\u5728");
      return;
    }
    if (!_deadlineFloatTip || !_deadlineFloatTip.isConnected) {
      console.warn("[DDL] _positionFloatTip: \u5224\u5B9A\u533A\u672A\u8FDE\u63A5");
      return;
    }
    let boxState = _deadlineFloatBox && _deadlineFloatBox.dataset.intsState || "ready", hasTasks = !!_deadlineFloatBox && _deadlineFloatBox.dataset.hasTasks === "1";
    if (!_deadlineFloatBox || !_deadlineFloatBox.textContent.trim() || boxState === "ready" && !hasTasks) {
      _deadlineFloatTip && (_deadlineFloatTip.style.display = "none"), DL("[DDL] _positionFloatTip: \u5DF2\u52A0\u8F7D\u4E14\u65E0\u4EFB\u52A1\uFF0C\u4E0D\u89E6\u53D1\u60AC\u6D6E\u7A97");
      return;
    }
    let rect = btn.getBoundingClientRect();
    _deadlineFloatTip.style.visibility = "hidden", _deadlineFloatTip.style.display = "block", _deadlineFloatTip.style.left = "0", _deadlineFloatTip.style.top = "0";
    let tw = _deadlineFloatBox.offsetWidth, th = _deadlineFloatBox.offsetHeight;
    _deadlineFloatTip.style.visibility = "";
    let margin = 8, left = rect.left + rect.width / 2 - tw / 2, top = rect.bottom + 8;
    left < margin && (left = margin), left + tw > window.innerWidth - margin && (left = window.innerWidth - tw - margin), top + th > window.innerHeight - margin && (top = rect.top - th - 8), _deadlineFloatTip.style.left = left - ZONE_PAD + "px", _deadlineFloatTip.style.top = top - ZONE_PAD + "px", DL("[DDL] _positionFloatTip: btn=" + btn.getBoundingClientRect().top.toFixed(0) + "," + btn.getBoundingClientRect().left.toFixed(0) + " box=" + tw + "x" + th + " zoneLeft=" + (left - ZONE_PAD) + " zoneTop=" + (top - ZONE_PAD));
  }
  function _hideFloatTip() {
    if (S._taskDragging) {
      DL("[DDL] _hideFloatTip: \u62D6\u62FD\u8FDB\u884C\u4E2D\uFF0C\u6682\u4E0D\u9690\u85CF");
      return;
    }
    _deadlineFloatTimer = setTimeout(function() {
      _deadlineFloatTip && (_deadlineFloatTip.style.display = "none");
    }, 180);
  }
  function _bindFloatTipEvents(wrap) {
    if (_floatTipBoundWrap === wrap) {
      DL("[DDL] _bindFloatTipEvents: \u5DF2\u7ED1\u5B9A\uFF0C\u8DF3\u8FC7");
      return;
    }
    _floatTipBoundWrap = wrap, DL("[DDL] _bindFloatTipEvents: \u7ED1\u5B9A\u60AC\u505C\u4E8B\u4EF6\u5230\u65B0wrap"), wrap.addEventListener("mouseenter", function() {
      _onUserInterest("hover"), _positionFloatTip();
    }), wrap.addEventListener("mouseleave", _hideFloatTip);
  }
  function armDeadlineFallback() {
    _fallbackTimer || S._deadlineCheckedOnce || (S._deadlineFallbackArmed = !0, _fallbackTimer = setTimeout(function() {
      _fallbackTimer = null, S._deadlineFallbackArmed = !1, DL("[DDL] \u515C\u5E95\u89E6\u53D1\uFF1A" + DEADLINE_LAZY_FALLBACK_MS / 1e3 + "s \u5185\u65E0\u4EA4\u4E92"), _onUserInterest("idle");
    }, DEADLINE_LAZY_FALLBACK_MS));
  }
  function _clearFallback() {
    _fallbackTimer && (clearTimeout(_fallbackTimer), _fallbackTimer = null), S._deadlineFallbackArmed = !1;
  }
  function _onUserInterest(reason) {
    S._deadlineCheckedOnce || S._deadlineCheckInFlight || (S._deadlineCheckTrigger === null && (S._deadlineCheckTrigger = reason), _clearFallback(), checkUpcomingDeadlines());
  }
  function getDeadlineState() {
    return {
      checkedOnce: !!S._deadlineCheckedOnce,
      trigger: S._deadlineCheckTrigger,
      inFlight: !!S._deadlineCheckInFlight,
      fallbackArmed: !!S._deadlineFallbackArmed,
      fallbackMs: DEADLINE_LAZY_FALLBACK_MS,
      starts: _checkStarts,
      polling: !!_deadlinePollTimer
    };
  }
  function _typeRank(name) {
    let i = TYPE_ORDER.indexOf(String(name || ""));
    return i < 0 ? TYPE_ORDER.length : i;
  }
  function _typeLabel(name) {
    let raw = String(name || "");
    return raw ? t(raw, raw) : "";
  }
  function classifyDeadlineTask(raw, ctx) {
    let c = ctx || {};
    if (!raw || !raw.endDate) return { verdict: "skip", reason: "no-deadline" };
    if (String(raw.type) !== DEADLINE_ASSIGNMENT_TYPE) return { verdict: "skip", reason: "not-assignment" };
    if (raw.status) return { verdict: "skip", reason: "submitted" };
    if (!raw.online && raw.score !== null && raw.score !== void 0) return { verdict: "skip", reason: "already-graded" };
    let typeName = String(c.typeName || raw.typeName || "");
    return typeName && DEADLINE_RECORD_ONLY_TYPES.indexOf(typeName) >= 0 ? { verdict: "skip", reason: "record-only" } : raw.online ? { verdict: "detected", reason: "online-unsubmitted" } : c.isIgnored && !c.isMarked ? { verdict: "ignored", reason: "ignored-by-user" } : { verdict: "inferred", reason: typeName ? "offline-assignment" : "offline-assignment-unknown-type" };
  }
  function _buildTaskTypeMap(gradeData) {
    let map = /* @__PURE__ */ new Map(), items = gradeData && gradeData.gradeBookItems || [];
    for (let it of items)
      for (let ts of it.taskScores || []) {
        let raw = ts.taskStudentId !== void 0 ? ts.taskStudentId : ts.entityId !== void 0 ? ts.entityId : ts.id, id = parseInt(raw, 10);
        id && map.set(String(id), { typeName: ts.taskTypeName || "", topScore: ts.topScore });
      }
    return map;
  }
  function renderTooltipContent() {
    if (!_deadlineFloatBox) {
      console.warn("[DDL] renderTooltipContent: \u5361\u7247\u8282\u70B9\u4E0D\u5B58\u5728");
      return;
    }
    if (!S._deadlineCheckedOnce || S._deadlineCheckInFlight) {
      let unloaded = !S._deadlineCheckedOnce;
      _deadlineFloatBox.dataset.intsState = unloaded ? "unloaded" : "loading", _deadlineFloatBox.dataset.hasTasks = "0", _deadlineFloatBox.innerHTML = '<div style="padding:6px;font-size:13px;color:#666;">' + escapeHtml(unloaded ? t("\u5C1A\u672A\u68C0\u67E5\u672A\u5B8C\u6210\u4EFB\u52A1 \u2014 \u628A\u9F20\u6807\u505C\u5728\u6309\u94AE\u4E0A\u5373\u53EF\u5F00\u59CB", "Not checked yet \u2014 hover the button to start") : t("\u6B63\u5728\u68C0\u67E5\u672A\u5B8C\u6210\u7684\u4EFB\u52A1\u2026", "Checking pending tasks...")) + "</div>";
      return;
    }
    _deadlineFloatBox.dataset.intsState = "ready";
    try {
      let nowTs = Date.now(), allFutureTasks = (S._deadlineAllTasks || []).filter((t4) => _taskVisible(t4, nowTs)), grouped = {};
      for (let w of allFutureTasks)
        grouped[w.courseName] || (grouped[w.courseName] = []), grouped[w.courseName].push(w);
      let sortedCourses = Object.keys(grouped).sort(), html = "", rowCount = 0, inferredCount = 0;
      for (let w of allFutureTasks)
        w.inferred && inferredCount++;
      inferredCount > 0 && (html += '<div data-ints-note="inferred" style="padding:5px 6px;font-size:11px;color:#8c8c8c;background:#fafafa;border-bottom:1px solid #f0f0f0;">' + escapeHtml(t(
        "\u68C0\u6D4B\u5230 " + inferredCount + " \u9879\u7EBF\u4E0B\u4EFB\u52A1 \xB7 \u62D6\u5230\u4E0B\u65B9\u5373\u53EF\u5FFD\u7565",
        inferredCount + " offline task(s) \xB7 drag below to dismiss"
      )) + "</div>");
      for (let courseName of sortedCourses) {
        let tasks = grouped[courseName];
        tasks.sort((a, b) => _typeRank(a.typeName) - _typeRank(b.typeName) || a.endDate - b.endDate), html += '<div class="task-dash-course" data-course="' + escapeHtml(courseName) + '" style="font-size:12px;color:#555;font-weight:600;padding:6px 6px 2px;border-bottom:1px solid #f0f0f0;">' + escapeHtml(courseName) + "</div>";
        for (let task of tasks) {
          rowCount++;
          let taskDate = new Date(task.endDate), ds = taskDate.getFullYear() + "." + (taskDate.getMonth() + 1) + "." + taskDate.getDate(), shown = isTaskShown(task.entityId), href = taskHref(task.entityId), taskNameHtml = href ? '<a href="' + escapeHtml(href) + '" draggable="true" title="' + t("\u6253\u5F00\u4EFB\u52A1\u9875\uFF08\u53EF\u62D6\u5230\u4E0B\u65B9\u4EFB\u52A1\u5217\u8868\u6807\u8BB0 / \u62D6\u5230\u522B\u5904\u53D6\u6D88\u6807\u8BB0\uFF09", "Open task page (drag onto the task list to mark, drag elsewhere to unmark)") + '" style="color:#1890ff;text-decoration:underline;cursor:grab;">' + escapeHtml(task.taskName) + "</a>" : '<span draggable="true" style="cursor:grab;">' + escapeHtml(task.taskName) + "</span>", typeLabel = _typeLabel(task.typeName), source = task.inferred ? "inferred" : "detected";
          html += '<div class="task-dash-row" data-entity="' + task.entityId + '" data-name="' + escapeHtml(task.taskName) + '" data-type="' + escapeHtml(String(task.typeName || "")) + '" data-source="' + source + '" style="padding:3px 6px;border-bottom:1px solid #f5f5f5;font-size:13px;">', html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">', html += '<span style="flex:1;white-space:nowrap;">' + (typeLabel ? '<span style="color:#bfbfbf;font-size:11px;margin-right:6px;">' + escapeHtml(typeLabel) + "</span>" : "") + taskNameHtml + "\uFF08" + ds + "\uFF09" + (task.inferred ? '<span class="task-src-tag" title="' + t("\u7AD9\u70B9\u6CA1\u6709\u5F00\u5728\u7EBF\u63D0\u4EA4\u5165\u53E3\uFF0C\u6309\u7EBF\u4E0B\u4EFB\u52A1\u5904\u7406\uFF1B\u62D6\u5230\u4E0B\u65B9\u5373\u53EF\u4E0D\u518D\u63D0\u9192", "No online submission \u2014 treated as offline work; drag below to stop reminding") + '" style="margin-left:6px;padding:0 4px;border:1px solid #d9d9d9;border-radius:3px;color:#8c8c8c;font-size:10px;">' + t("\u7EBF\u4E0B", "Offline") + "</span>" : "") + (task.marked ? '<span title="' + t("\u624B\u52A8\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Manually marked as pending") + '" style="margin-left:6px;padding:0 4px;border:1px solid #ffa39e;border-radius:3px;color:#cf1322;font-size:10px;">' + t("\u6807\u8BB0", "Marked") + "</span>" : "") + "</span>", html += '<label class="task-toggle-label" title="' + t("\u5F00\u542F\u540E\u8BE5\u4EFB\u52A1\u5C06\u8BA1\u5165\u63D0\u9192", "Show this task in reminders") + '" style="display:flex;align-items:center;gap:6px;font-size:11px;color:#666;cursor:pointer;flex-shrink:0;">', html += "<span>" + (shown ? t("\u5DF2\u5F00\u542F", "On") : t("\u5DF2\u5173\u95ED", "Off")) + '</span><input type="checkbox" class="task-toggle-switch" data-entity="' + task.entityId + '"' + (shown ? " checked" : "") + "></label></div></div>";
        }
      }
      let ignoreCount = getTaskIgnoreCount();
      ignoreCount > 0 && (html += '<div data-ints-note="ignored" title="' + t("\u88AB\u5FFD\u7565\u7684\u4EFB\u52A1\u4E0D\u518D\u51FA\u73B0\u5728\u63D0\u9192\u91CC", "Ignored tasks are not reminded") + '" style="padding:5px 6px;font-size:11px;color:#8c8c8c;border-top:1px solid #f0f0f0;cursor:pointer;text-decoration:underline;">' + escapeHtml(t("\u5DF2\u5FFD\u7565 " + ignoreCount + " \u9879 \xB7 \u70B9\u6B64\u6062\u590D", "Ignored " + ignoreCount + " \xB7 click to restore")) + "</div>"), _deadlineFloatBox.innerHTML = html, _deadlineFloatBox.dataset.hasTasks = rowCount > 0 || ignoreCount > 0 ? "1" : "0", _deadlineFloatBox.querySelectorAll(".task-toggle-switch").forEach((cb) => {
        cb.addEventListener("change", function() {
          let entityId = parseInt(this.dataset.entity, 10);
          isNaN(entityId) || setTaskShown(entityId, this.checked);
        });
      });
      let restoreEl = _deadlineFloatBox.querySelector('[data-ints-note="ignored"]');
      restoreEl && restoreEl.addEventListener("click", function(e) {
        e.stopPropagation(), clearTaskIgnore();
      }), DL("[DDL] renderTooltipContent: courses=" + sortedCourses.length + " rows=" + rowCount + " inferred=" + inferredCount + " \u5FFD\u7565=" + ignoreCount + " htmlLen=" + html.length + " (\u542B\u5DF2\u5173\u95ED\u63D0\u9192\u7684\u4EFB\u52A1)");
    } catch (e) {
      console.error("[DDL] renderTooltipContent \u5F02\u5E38:", e);
    }
  }
  function _setGetGradeBookData(fn) {
    _getGradeBookDataFn = fn;
  }
  function loadTaskToggles() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY_TASK_TOGGLES);
      if (raw) {
        let parsed = JSON.parse(raw);
        S._taskToggles = {};
        for (let [k, v] of Object.entries(parsed))
          typeof v == "object" && v !== null ? S._taskToggles[k] = v.alert !== !1 && v.tooltip !== !1 : S._taskToggles[k] = !!v;
      }
    } catch (e) {
      S._taskToggles = {};
    }
  }
  function saveTaskToggles() {
    try {
      localStorage.setItem(STORAGE_KEY_TASK_TOGGLES, JSON.stringify(S._taskToggles));
    } catch (e) {
    }
  }
  function isTaskShown(entityId) {
    return S._taskToggles[String(entityId)] !== !1;
  }
  function setTaskShown(entityId, shown) {
    let key = String(entityId);
    shown ? delete S._taskToggles[key] : S._taskToggles[key] = !1, saveTaskToggles(), recomputeDeadlineWarnings(), updateDeadlineIcon();
  }
  function loadTaskMarks() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY_TASK_MARKS);
      if (S._taskMarks = {}, raw) {
        let parsed = JSON.parse(raw);
        if (parsed && typeof parsed == "object")
          for (let [k, v] of Object.entries(parsed))
            v && (S._taskMarks[k] = !0);
      }
    } catch (e) {
      S._taskMarks = {};
    }
  }
  function saveTaskMarks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASK_MARKS, JSON.stringify(S._taskMarks));
    } catch (e) {
    }
  }
  function isTaskMarked(entityId) {
    return S._taskMarks[String(entityId)] === !0;
  }
  function setTaskMark(entityId, marked) {
    let key = String(entityId);
    marked ? S._taskMarks[key] = !0 : delete S._taskMarks[key], saveTaskMarks();
    let entries = S._deadlineAllTasks.filter((t4) => String(t4.entityId) === key);
    if (entries.length) {
      for (let t4 of entries) t4.marked = marked;
      marked || (S._deadlineAllTasks = S._deadlineAllTasks.filter((t4) => String(t4.entityId) !== key || t4.detected || t4.inferred)), recomputeDeadlineWarnings(), updateDeadlineIcon();
    } else marked && (S._deadlineCache.ts = 0, checkUpcomingDeadlines());
    DL("[\u6807\u8BB0] \u4EFB\u52A1 " + key + (marked ? " \u5DF2\u6807\u8BB0\uFF08\u89C6\u4E3A\u672A\u5B8C\u6210\uFF09" : " \u5DF2\u79FB\u9664\u6807\u8BB0") + "\uFF0C\u5DF2\u5728\u5217\u8868\u5185=" + entries.length + "\uFF0C\u5269\u4F59\u5217\u8868=" + S._deadlineAllTasks.length);
  }
  function loadTaskIgnore() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY_TASK_IGNORE);
      if (S._taskIgnore = {}, raw) {
        let parsed = JSON.parse(raw);
        if (parsed && typeof parsed == "object")
          for (let [k, v] of Object.entries(parsed)) {
            let ts = Number(v);
            S._taskIgnore[k] = isFinite(ts) && ts > 0 ? ts : 0;
          }
      }
    } catch (e) {
      S._taskIgnore = {};
    }
  }
  function saveTaskIgnore() {
    try {
      localStorage.setItem(STORAGE_KEY_TASK_IGNORE, JSON.stringify(S._taskIgnore));
    } catch (e) {
    }
  }
  function isTaskIgnored(entityId) {
    return S._taskIgnore[String(entityId)] !== void 0;
  }
  function getTaskIgnoreCount() {
    return Object.keys(S._taskIgnore).length;
  }
  function setTaskIgnored(entityId, endDateTs) {
    let key = String(entityId);
    S._taskIgnore[key] = Number(endDateTs) > 0 ? Number(endDateTs) : 0, saveTaskIgnore();
    for (let t4 of S._deadlineAllTasks)
      String(t4.entityId) === key && (t4.ignored = !0);
    recomputeDeadlineWarnings(), updateDeadlineIcon(), DL("[DDL] \u4EFB\u52A1 " + key + " \u5DF2\u5FFD\u7565\uFF08\u4E0D\u518D\u5F53\u4F5C\u5F85\u529E\uFF09\uFF0C\u5FFD\u7565\u8868 " + getTaskIgnoreCount() + " \u6761");
  }
  function clearTaskIgnore() {
    let n = getTaskIgnoreCount();
    S._taskIgnore = {}, saveTaskIgnore();
    for (let t4 of S._deadlineAllTasks) t4.ignored = !1;
    recomputeDeadlineWarnings(), updateDeadlineIcon(), DL("[DDL] \u5FFD\u7565\u8868\u5DF2\u6E05\u7A7A\uFF08" + n + " \u6761\uFF09\uFF0C\u6062\u590D\u663E\u793A");
  }
  function _pruneTaskIgnore(nowTs) {
    let removed = 0;
    for (let [k, ts] of Object.entries(S._taskIgnore))
      ts > 0 && ts < nowTs && (delete S._taskIgnore[k], removed++);
    removed && (saveTaskIgnore(), DL("[DDL] \u5FFD\u7565\u8FC7\u671F\u8BB0\u5F55 " + removed + " \u6761\uFF0C\u5269 " + getTaskIgnoreCount() + " \u6761"));
  }
  function _taskVisible(t4, nowTs) {
    return t4.marked ? !0 : t4.ignored ? !1 : !!(t4.detected || t4.inferred) && t4.endDate > nowTs;
  }
  function recomputeDeadlineWarnings() {
    let now = Date.now(), warnings = [];
    for (let t4 of S._deadlineAllTasks)
      _taskVisible(t4, now) && isTaskShown(t4.entityId) && warnings.push({ courseName: t4.courseName, taskName: t4.taskName, endDate: new Date(t4.endDate), entityId: t4.entityId, marked: !!t4.marked, inferred: !!t4.inferred });
    return S._deadlineCache.data = warnings, warnings;
  }
  function _detailEntityId() {
    let m = location.pathname.match(/\/teaching\/assignmentDetail\/(\d+)/i);
    if (m) return parseInt(m[1], 10);
    let m2 = location.hash.match(/\/teaching\/assignmentDetail\/(\d+)/i);
    return m2 ? parseInt(m2[1], 10) : null;
  }
  function _detailAnchor() {
    for (let sel of DETAIL_TITLE_SELECTORS) {
      let el = document.querySelector(sel);
      if (el) return { el, sel, inTitle: !0 };
    }
    for (let sel of DETAIL_BTN_SELECTORS) {
      let el = document.querySelector(sel);
      if (el) return { el, sel, inTitle: !1 };
    }
    return null;
  }
  function _applyMarkBtnState(btn, marked, ring) {
    let color = marked ? MARK_COLOR_ON : MARK_COLOR_OFF, icon = iconMark(color);
    ring ? btn.innerHTML = '<span class="ints-mark-ring" style="display:inline-flex;align-items:center;justify-content:center;border:1.5px solid ' + color + ';border-radius:4px;padding:2px 3px;box-sizing:border-box;line-height:1;">' + icon + "</span>" : btn.innerHTML = icon, btn.style.color = color, btn.style.fontSize = ring ? "15px" : "18px", btn.style.lineHeight = "1", btn.style.padding = ring ? "2px 4px" : "0 4px", btn.style.verticalAlign = "middle", btn.style.marginLeft = ring ? "8px" : "0";
    let label = marked ? t("\u8BE5\u4EFB\u52A1\u5DF2\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210\uFF0C\u70B9\u51FB\u79FB\u9664\u6807\u8BB0", "Marked as pending \u2014 click to remove the mark") : t("\u6807\u8BB0\u540E\u8BE5\u4EFB\u52A1\u89C6\u4E3A\u672A\u5B8C\u6210\uFF0C\u51FA\u73B0\u5728\u672A\u5B8C\u6210\u4EFB\u52A1\u5217\u8868\u4E2D", "Marked tasks count as pending and appear in the pending list");
    btn.title = label, btn.setAttribute("aria-label", label);
  }
  function syncTaskMarkButton() {
    let entityId = _detailEntityId(), existing = document.getElementById(MARK_BTN_ID);
    if (!entityId) {
      existing && existing.remove();
      return;
    }
    loadTaskMarks();
    let marked = isTaskMarked(entityId), btn = existing;
    if (!btn) {
      btn = document.createElement("button"), btn.id = MARK_BTN_ID, btn.type = "button", btn.className = "ant-btn ant-btn-link", btn.style.cursor = "pointer", btn.addEventListener("click", (e) => {
        e.preventDefault(), e.stopImmediatePropagation();
        let id = _detailEntityId();
        if (!id) return;
        let next = !isTaskMarked(id);
        setTaskMark(id, next), _applyMarkBtnState(btn, next, btn.dataset.ring === "1"), btn.dataset.marked = String(next);
      }), btn.addEventListener("contextmenu", (e) => {
        let id = _detailEntityId();
        if (!id) return;
        e.preventDefault(), e.stopImmediatePropagation();
        let next = !isTaskMarked(id);
        setTaskMark(id, next), _applyMarkBtnState(btn, next, btn.dataset.ring === "1"), btn.dataset.marked = String(next);
      });
      let anchor = _detailAnchor();
      btn.dataset.ring = anchor && anchor.inTitle ? "1" : "0", anchor ? (anchor.el.insertAdjacentElement("beforeend", btn), DL("[\u6807\u8BB0] \u8BE6\u60C5\u9875\u6309\u94AE\u63D2\u5165\u951A\u70B9: " + anchor.sel + "\uFF08\u6807\u9898\u5185=" + anchor.inTitle + "\uFF09")) : (btn.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:20000;background:#fff;border:1px solid #d9d9d9;border-radius:16px;padding:6px 14px;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;", document.body.appendChild(btn), DL("[\u6807\u8BB0] \u8BE6\u60C5\u9875\u672A\u627E\u5230\u951A\u70B9\uFF0C\u6309\u94AE\u6D6E\u52A8\u663E\u793A\uFF08\u53F3\u4E0B\u89D2\uFF09")), btn.dataset.marked = String(marked), _applyMarkBtnState(btn, marked, btn.dataset.ring === "1");
      return;
    }
    let wantRing = !!document.querySelector(".detail-header .title #" + MARK_BTN_ID);
    if (btn.dataset.ring !== String(wantRing ? 1 : 0)) {
      btn.dataset.ring = wantRing ? "1" : "0", _applyMarkBtnState(btn, marked, wantRing);
      return;
    }
    btn.dataset.marked !== String(marked) && (btn.dataset.marked = String(marked), _applyMarkBtnState(btn, marked, wantRing));
  }
  function checkDeadlinesAfterNav() {
    let path = typeof location != "undefined" ? location.pathname : "", prev = _lastNavPath;
    if (path === prev || (_lastNavPath = path, !/\/teaching\/assignmentDetail\//i.test(prev))) return !1;
    let now = Date.now();
    return now - _lastNavRefreshTs < DEADLINE_NAV_MIN_INTERVAL ? (DL("[DDL] checkDeadlinesAfterNav: \u8DDD\u4E0A\u6B21\u5BFC\u822A\u8865\u67E5\u4E0D\u8DB3 " + DEADLINE_NAV_MIN_INTERVAL / 1e3 + "s\uFF0C\u8DF3\u8FC7"), !1) : (_lastNavRefreshTs = now, log("[DDL] \u68C0\u6D4B\u5230\u79BB\u5F00\u4EFB\u52A1\u8BE6\u60C5\u9875\uFF08" + prev + " \u2192 " + path + "\uFF09\uFF0C\u8865\u67E5\u672A\u5B8C\u6210\u4EFB\u52A1"), checkUpcomingDeadlines(!0), !0);
  }
  function _setNavPathForTest(p) {
    _lastNavPath = p;
  }
  async function _resolveDeadlineCourses() {
    let yearList = await fetchSchoolYearList(), sel = document.querySelector(".ant-select-selection-selected-value, .ant-select-single .ant-select-selection-item"), currentYearText = sel ? sel.textContent.trim() : null, currentYearEntry = yearList.find((y) => y.value === currentYearText);
    if (!currentYearEntry) {
      let sorted = [...yearList].sort((a, b) => String(a.value).localeCompare(String(b.value)));
      currentYearEntry = sorted[sorted.length - 1] || null, currentYearEntry && DL("[DDL] \u65E0\u5B66\u5E74\u4E0B\u62C9\uFF0C\u56DE\u9000\u6700\u65B0\u5B66\u5E74 " + currentYearEntry.value);
    }
    if (DL("[DDL] \u5B66\u5E74\u5217\u8868=" + yearList.length + " \u4E0B\u62C9\u6587\u672C=" + JSON.stringify(currentYearText) + " \u547D\u4E2D=" + (currentYearEntry ? currentYearEntry.key : "\u65E0")), !currentYearEntry) return null;
    let gradeData = await _getGradeBookDataFn(currentYearEntry.key), courses = (gradeData.gradeBookItems || []).filter((item) => item.inClass !== !1 && item.courseId).map((item) => ({ courseId: item.courseId, courseName: item.courseName }));
    return { year: currentYearEntry, courses, gradeData };
  }
  async function _fetchCourseTasksRaw(course, schoolYearKey) {
    let pageCurrent = 1, total = 0, fetched = 0, items = [];
    do {
      let url = `${BASE_URL}/task/mergeList?pageSize=30&pageCurrent=${pageCurrent}&courseId=${course.courseId}&schoolYearId=${schoolYearKey}&name=`, data = await apiRequest(url), page = data.items || [];
      if (fetched += page.length, total = data.totalItem || 0, items.push(...page), page.length === 0 || page.length < 30 || pageCurrent >= 10) break;
      pageCurrent++;
    } while (fetched < total);
    return items;
  }
  async function dumpTaskFields() {
    let resolved = await _resolveDeadlineCourses();
    if (!resolved)
      return DL("[DDL] \u53D6\u8BC1\uFF1A\u62FF\u4E0D\u5230\u5F53\u524D\u5B66\u5E74"), { at: Date.now(), error: "no-year", courses: [] };
    let out = [];
    for (let i = 0; i < resolved.courses.length; i += DEADLINE_BATCH_SIZE) {
      let batch = resolved.courses.slice(i, i + DEADLINE_BATCH_SIZE), results = await Promise.all(batch.map(async function(c) {
        try {
          let items = await _fetchCourseTasksRaw(c, resolved.year.key);
          return { courseId: c.courseId, courseName: c.courseName || "Course#" + c.courseId, items };
        } catch (e) {
          return { courseId: c.courseId, courseName: c.courseName, items: [], error: e.message };
        }
      }));
      out.push(...results);
    }
    let tally = {}, rows = 0;
    return out.forEach(function(c) {
      (c.items || []).forEach(function(it) {
        rows++;
        let key = "type=" + String(it.type) + " | typeName=" + String(it.typeName || "(\u7A7A)") + " | online=" + !!it.online + " | status=" + !!it.status + " | score=" + (it.score === null || it.score === void 0 ? "\u7A7A" : "\u6709");
        tally[key] = (tally[key] || 0) + 1;
      });
    }), DL("[DDL] \u53D6\u8BC1\u6837\u672C\uFF1A\u8BFE\u7A0B=" + out.length + " \u6761\u76EE=" + rows + " \u5B57\u6BB5\u7EC4\u5408=" + Object.keys(tally).length), Object.keys(tally).sort().forEach(function(k) {
      DL("[DDL]   " + tally[k] + " \xD7 " + k);
    }), { at: Date.now(), year: resolved.year.key, courses: out };
  }
  async function checkUpcomingDeadlines(force) {
    if (loadTaskToggles(), loadTaskMarks(), loadTaskIgnore(), DL("[DDL] checkUpcomingDeadlines: \u89E6\u53D1 (force=" + !!force + " cacheTs=" + S._deadlineCache.ts + " inFlight=" + S._deadlineCheckInFlight + ")"), !force && Date.now() - S._deadlineCache.ts < DEADLINE_CACHE_TTL) {
      DL("[DDL] checkUpcomingDeadlines: \u7F13\u5B58\u547D\u4E2D"), updateDeadlineIcon();
      return;
    }
    if (S._deadlineCheckInFlight) {
      DL("[DDL] checkUpcomingDeadlines: \u5DF2\u6709\u8BF7\u6C42\u8FDB\u884C\u4E2D");
      return;
    }
    S._deadlineCheckTrigger === null && (S._deadlineCheckTrigger = "direct"), S._deadlineCheckedOnce = !0, _checkStarts++, _clearFallback(), S._deadlineCheckInFlight = !0, _lastCheckTs = Date.now(), updateDeadlineIcon();
    let allTasks = [], nowTs = Date.now();
    try {
      let resolved = await _resolveDeadlineCourses();
      if (!resolved) {
        S._deadlineCache = { ts: Date.now(), data: [] }, S._deadlineAllTasks = allTasks, S._deadlineCheckInFlight = !1, updateDeadlineIcon();
        return;
      }
      let courses = resolved.courses, typeMap = _buildTaskTypeMap(resolved.gradeData), verdictCount = { detected: 0, inferred: 0, ignored: 0, skip: 0 };
      async function checkCourseDeadline(course) {
        let courseId = course.courseId, courseName = course.courseName || "Course#" + courseId;
        if (!courseId) return { allTasks: [], checked: 0, tasks: 0, online: 0, unsub: 0, future: 0 };
        try {
          let items = await _fetchCourseTasksRaw(course, resolved.year.key), onlineCountLocal = 0, unsubmittedCountLocal = 0, futureCountLocal = 0, markedCountLocal = 0, courseAllTasks = [];
          for (let task of items) {
            let entityId = parseInt(task.entityId, 10);
            if (!entityId) continue;
            let isOnline = !!task.online, isUnsubmitted = !task.status, isMarked = isTaskMarked(entityId);
            isOnline && onlineCountLocal++, isUnsubmitted && unsubmittedCountLocal++, isMarked && markedCountLocal++;
            let meta = typeMap.get(String(entityId)) || null, verdict = classifyDeadlineTask(task, {
              typeName: meta ? meta.typeName : "",
              isMarked,
              isIgnored: isTaskIgnored(entityId)
            });
            if (verdictCount[verdict.verdict]++, !isMarked && verdict.verdict !== "detected" && verdict.verdict !== "inferred" && verdict.verdict !== "ignored" || !task.endDate) continue;
            let endDate = new Date(task.endDate);
            if (isNaN(endDate.getTime())) continue;
            let isInferred = verdict.verdict === "inferred" || verdict.verdict === "ignored";
            courseAllTasks.push({
              courseId,
              courseName,
              entityId,
              taskName: task.name || "Unnamed",
              endDate: endDate.getTime(),
              typeName: meta && meta.typeName || task.typeName || "",
              marked: isMarked,
              detected: verdict.verdict === "detected",
              inferred: isInferred,
              ignored: verdict.verdict === "ignored",
              reason: verdict.reason
            }), endDate.getTime() > nowTs && futureCountLocal++;
          }
          return { allTasks: courseAllTasks, checked: 1, tasks: items.length, online: onlineCountLocal, unsub: unsubmittedCountLocal, future: futureCountLocal, marked: markedCountLocal };
        } catch (e) {
          return console.warn("[\u63D0\u9192] \u8BFE\u7A0B\u4EFB\u52A1\u83B7\u53D6\u5931\u8D25\uFF1A" + courseName + " - " + e.message), { allTasks: [], checked: 0, tasks: 0, online: 0, unsub: 0, future: 0, marked: 0 };
        }
      }
      for (let i = 0; i < courses.length; i += DEADLINE_BATCH_SIZE) {
        let batch = courses.slice(i, i + DEADLINE_BATCH_SIZE), results = await Promise.all(batch.map((c) => checkCourseDeadline(c)));
        for (let r of results)
          allTasks.push(...r.allTasks);
      }
      DL("[DDL] checkUpcomingDeadlines: courses=" + courses.length + " allTasks=" + allTasks.length + " \u672A\u8FC7\u622A\u6B62=" + allTasks.filter((t4) => t4.endDate > nowTs).length + " \u5224\u5B9A=" + JSON.stringify(verdictCount) + " \u7C7B\u578B\u8868=" + typeMap.size + " \u6761");
    } catch (e) {
      console.error("[\u63D0\u9192] \u68C0\u67E5\u5931\u8D25\uFF1A" + e.message), S._deadlineCheckInFlight = !1;
    }
    S._deadlineAllTasks = allTasks, _pruneTaskIgnore(nowTs);
    let warnings = recomputeDeadlineWarnings();
    S._deadlineCache.ts = Date.now(), S._deadlineCheckInFlight = !1, DL("[DDL] checkUpcomingDeadlines \u5B8C\u6210: allTasks=" + allTasks.length + " marked=" + allTasks.filter((t4) => t4.marked).length + " inferred=" + allTasks.filter((t4) => t4.inferred).length + " \u5FFD\u7565=" + getTaskIgnoreCount() + " warnings=" + warnings.length), _pollingStarted || (_pollingStarted = !0, startDeadlinePolling()), updateDeadlineIcon();
  }
  function updateDeadlineIcon() {
    let anchor = document.querySelector(".filter-info.filter-container") || document.querySelector(".grade .filter-container") || document.querySelector(".filter-container");
    if (!anchor) {
      console.warn("[DDL] updateDeadlineIcon: \u627E\u4E0D\u5230\u63D2\u5165\u951A\u70B9");
      return;
    }
    let insertPos = "beforeend", warnings = S._deadlineCache.data || [];
    DL("[DDL] updateDeadlineIcon: anchor=" + (anchor.id || anchor.className) + " warnings=" + warnings.length + "\uFF08\u5176\u4E2D\u63A8\u65AD " + warnings.filter((w) => w.inferred).length + "\uFF09");
    let wrap = document.getElementById("intschool-deadline-wrap");
    if (!wrap) {
      DL("[DDL] updateDeadlineIcon: \u521B\u5EFA\u6309\u94AEwrap"), wrap = document.createElement("span"), wrap.id = "intschool-deadline-wrap", wrap.style.cssText = "position:relative;display:inline-flex;vertical-align:middle;", wrap.addEventListener("click", (e) => e.stopImmediatePropagation());
      let btn2 = document.createElement("button");
      btn2.type = "button", btn2.className = "ant-btn ant-btn-link", btn2.style.cssText = "margin-left:16px;color:#faad14;", btn2.id = "intschool-deadline-btn", btn2.addEventListener("click", (e) => {
        e.stopPropagation(), e.preventDefault(), _positionFloatTip();
      }), wrap.appendChild(btn2), _ensureFloatTip(), _bindFloatTipEvents(wrap), anchor.insertAdjacentElement(insertPos, wrap);
    }
    let btn = document.getElementById("intschool-deadline-btn");
    if (btn) {
      let count = warnings.length;
      if (!S._deadlineCheckedOnce)
        btn.innerHTML = "<span>&#9888;</span> <span>" + t("\u672A\u52A0\u8F7D", "Not checked") + "</span>", btn.style.color = "#1890ff";
      else if (S._deadlineCheckInFlight)
        btn.innerHTML = "<span>&#9888;</span> <span>" + t("\u68C0\u67E5\u4E2D\u2026", "Checking...") + "</span>", btn.style.color = "#1890ff";
      else {
        let inferredN = warnings.filter((w) => w.inferred).length, detectedN = count - inferredN, countText = inferredN > 0 && detectedN > 0 ? detectedN + "+" + inferredN : String(count);
        btn.innerHTML = count > 0 ? "<span>&#9888;</span> <span>" + t("\u672A\u5B8C\u6210\u4EFB\u52A1", "Pending Tasks") + " (" + countText + ")</span>" : "<span>&#9888;</span> <span>" + t("\u65E0\u672A\u5B8C\u6210\u4EFB\u52A1", "No Pending Tasks") + "</span>", btn.style.color = count > 0 ? "#faad14" : "#999";
      }
      btn.getAttribute("title") && btn.removeAttribute("title");
    }
    _ensureFloatTip(), renderTooltipContent();
  }
  function startDeadlinePolling() {
    stopDeadlinePolling(), _deadlinePollTimer = setInterval(() => {
      document.visibilityState === "visible" && checkUpcomingDeadlines();
    }, DEADLINE_POLL_INTERVAL), _deadlineVisibilityHandler = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - _lastCheckTs < DEADLINE_VISIBILITY_MIN_INTERVAL) {
          DL("[DDL] \u53EF\u89C1\u6027\u8865\u67E5\u8DF3\u8FC7\uFF08\u8DDD\u4E0A\u6B21\u68C0\u67E5\u4E0D\u8DB3\u6700\u5C0F\u95F4\u9694\uFF09");
          return;
        }
        checkUpcomingDeadlines();
      }
    }, document.addEventListener("visibilitychange", _deadlineVisibilityHandler);
  }
  function stopDeadlinePolling() {
    _deadlinePollTimer && (clearInterval(_deadlinePollTimer), _deadlinePollTimer = null), _deadlineVisibilityHandler && (document.removeEventListener("visibilitychange", _deadlineVisibilityHandler), _deadlineVisibilityHandler = null), _clearFallback(), _pollingStarted = !1;
  }
  async function fetchGradeReportsForYear(schoolYearId) {
    let url = `${BASE_URL}/grade/grade-report/by-student?schoolYearId=${schoolYearId}`;
    return await apiRequest(url);
  }
  async function fetchReportContent(studentId, requestUrl, gradePeriodId) {
    let url = `${BASE_URL}/${requestUrl}?studentId=${studentId}&gradePeriodId=${gradePeriodId}`;
    return await apiRequest(url);
  }
  var DEADLINE_POLL_INTERVAL, DEADLINE_VISIBILITY_MIN_INTERVAL, DEADLINE_BATCH_SIZE, DEADLINE_LAZY_FALLBACK_MS, _fallbackTimer, _pollingStarted, _checkStarts, _lastCheckTs, ZONE_PAD, _deadlineFloatTip, _deadlineFloatBox, _deadlineFloatTimer, _floatTipBoundWrap, _TASK_HREF_PATTERN, TYPE_ORDER, DEADLINE_ASSIGNMENT_TYPE, DEADLINE_RECORD_ONLY_TYPES, _getGradeBookDataFn, MARK_BTN_ID, DETAIL_TITLE_SELECTORS, DETAIL_BTN_SELECTORS, DEADLINE_NAV_MIN_INTERVAL, _lastNavPath, _lastNavRefreshTs, _deadlinePollTimer, _deadlineVisibilityHandler, init_deadline = __esm({
    "v8.30/deadline.js"() {
      init_state();
      init_utils();
      init_api();
      init_log();
      DEADLINE_POLL_INTERVAL = 900 * 1e3, DEADLINE_VISIBILITY_MIN_INTERVAL = 120 * 1e3, DEADLINE_BATCH_SIZE = 4, DEADLINE_LAZY_FALLBACK_MS = 30 * 1e3, _fallbackTimer = null, _pollingStarted = !1, _checkStarts = 0;
      _lastCheckTs = 0, ZONE_PAD = 0, _deadlineFloatTip = null, _deadlineFloatBox = null, _deadlineFloatTimer = null, _floatTipBoundWrap = null, _TASK_HREF_PATTERN = "https://shc.intschool.cn/teaching/assignmentDetail/{id}?assignType=subjectClass";
      TYPE_ORDER = [
        "Homework",
        "In-Class Assignments/Classwork",
        "In-Class/Classwork",
        "Projects",
        "Projects and Labs",
        "Essays",
        "Tests",
        "Tests and Cumulative Assignments",
        "Quizzes",
        "Engagement"
      ];
      DEADLINE_ASSIGNMENT_TYPE = "1001", DEADLINE_RECORD_ONLY_TYPES = ["Engagement"];
      _getGradeBookDataFn = null;
      MARK_BTN_ID = "intschool-task-mark-btn", DETAIL_TITLE_SELECTORS = [
        ".detail-header .header-content > .title",
        ".assignment-detail .header-content > .title",
        ".detail-header .title",
        ".assignment-detail .title"
      ], DETAIL_BTN_SELECTORS = [
        ".detail-header .header-content",
        ".detail-header",
        ".assignment-detail",
        ".ant-page-header-heading-left",
        ".ant-page-header-heading",
        ".page-header .title",
        ".assignment-detail-header",
        ".ant-card-head-title",
        ".filter-info.filter-container",
        ".filter-container"
      ];
      DEADLINE_NAV_MIN_INTERVAL = 15 * 1e3, _lastNavPath = typeof location != "undefined" ? location.pathname : "", _lastNavRefreshTs = 0;
      _deadlinePollTimer = null, _deadlineVisibilityHandler = null;
    }
  });

  // v8.30/courses.js
  async function getStudentId() {
    if (S.studentIdCache) return S.studentIdCache;
    let data = await apiRequest(BASE_URL + "/student/userInfo");
    return S.studentIdCache = data.studentId, S.studentIdCache;
  }
  function resolveCredit(rawCredit, courseId) {
    let credit = parseFloat(rawCredit);
    if (!isNaN(credit)) return credit > 0 ? credit : 0;
    let mapped = S.creditMap.get(courseId);
    return mapped !== void 0 && mapped > 0 ? mapped : 1;
  }
  function parseYearlyReport(content) {
    let customCols = content.customColumns || [], eoyColumnId = null;
    for (let col of customCols)
      if (col && col.customColumnName && String(col.customColumnName).trim().toUpperCase() === "EOY") {
        eoyColumnId = col.customColumnId;
        break;
      }
    if (eoyColumnId === null && customCols.length > 0) {
      let lastCol = customCols[customCols.length - 1], lastName = lastCol && lastCol.customColumnName ? String(lastCol.customColumnName).trim().toUpperCase() : "";
      lastCol && lastCol.customColumnId && !TERM_COLUMN_NAMES[lastName] && (eoyColumnId = lastCol.customColumnId);
    }
    let colMap = /* @__PURE__ */ new Map();
    for (let col of customCols)
      col && col.customColumnId && col.customColumnName && colMap.set(col.customColumnId, col.customColumnName);
    let courses = [], reportItems = content.reportItems || [];
    for (let item of reportItems) {
      let courseName = item.courseName, grades = item.customColumnGrades || {}, courseData = { name: courseName, courseId: item.courseId, credit: resolveCredit(item.credits, item.courseId), s1p: null, s1e: null, s1f: null, s2p: null, s2e: null, s2f: null, eoy: null };
      for (let [colId, gradeObj] of Object.entries(grades)) {
        let colIdNum = parseInt(colId), score = gradeObj && gradeObj.score !== void 0 ? parseFloat(gradeObj.score) : null;
        if (score === null || isNaN(score)) continue;
        if (eoyColumnId !== null && colIdNum === eoyColumnId) {
          courseData.eoy = score;
          continue;
        }
        let colName = colMap.get(colIdNum);
        if (!colName) continue;
        switch (colName.trim()) {
          case "S1P":
            courseData.s1p = score;
            break;
          case "S1E":
            courseData.s1e = score;
            break;
          case "S1F":
            courseData.s1f = score;
            break;
          case "S2P":
            courseData.s2p = score;
            break;
          case "S2E":
            courseData.s2e = score;
            break;
          case "S2F":
            courseData.s2f = score;
            break;
        }
      }
      courseData.s1f === null && (courseData.s1p !== null || courseData.s1e !== null) && (courseData.s1f = calcF(courseData.s1p, courseData.s1e)), courseData.s2f === null && (courseData.s2p !== null || courseData.s2e !== null) && (courseData.s2f = calcF(courseData.s2p, courseData.s2e)), courseData.s2f === null && courseData.eoy !== null && (courseData.s2f = courseData.eoy), courseData.s1f === null && courseData.eoy !== null && (courseData.s1f = courseData.eoy), courses.push(courseData);
    }
    return courses;
  }
  function parseSemesterReport(content, term) {
    let courses = [], reports = content.courseReports || [];
    for (let cr of reports) {
      let courseName = cr.course;
      if (!courseName) continue;
      let periodMap = cr.percentageMap || {}, examScore = null;
      if (content.gradePeriods && content.gradePeriods.length) {
        let periodId = content.gradePeriods[0].gradePeriodId;
        periodMap[periodId] !== void 0 && (examScore = parseFloat(periodMap[periodId]));
      }
      if (examScore === null && Object.keys(periodMap).length > 0) {
        let firstKey = Object.keys(periodMap)[0];
        examScore = parseFloat(periodMap[firstKey]);
      }
      isNaN(examScore) && cr.score !== void 0 && (examScore = parseFloat(cr.score)), examScore !== null && !isNaN(examScore) && courses.push({ name: courseName, courseId: cr.courseId, credit: resolveCredit(null, cr.courseId), [term === "S1" ? "s1e" : "s2e"]: examScore, s1p: null, s2p: null, s1f: null, s2f: null });
    }
    return courses;
  }
  async function buildCoursesFromReports(yearKey) {
    let studentId = await getStudentId(), reports = await fetchGradeReportsForYear(yearKey);
    if (!reports.length) return { courses: [], sectionName: null, annualGPA: null, cumulativeGPA: null };
    let yearlyReport = reports.find((r) => {
      var _a;
      return r.gradePeriodType === "fullSchoolYear" || r.reportName && (r.reportName.includes("\u5E74\u5EA6") || ((_a = r.reportEnName) == null ? void 0 : _a.includes("Yearly")));
    }), sectionName = null, apiAnnualGPA = null, apiCumulativeGPA = null;
    if (yearlyReport)
      try {
        let content = await fetchReportContent(studentId, yearlyReport.requestUrl, yearlyReport.gradePeriodId);
        if (content && (sectionName = content.sectionName || null, apiAnnualGPA = typeof content.annualGPA == "number" ? content.annualGPA : null, apiCumulativeGPA = typeof content.cumulativeGPA == "number" ? content.cumulativeGPA : null), content && content.reportItems) {
          let coursesFromYearly = parseYearlyReport(content);
          if (coursesFromYearly.length)
            return { courses: coursesFromYearly.map((c) => ({ name: c.name, courseId: c.courseId, credit: c.credit, originalGrades: { s1p: c.s1p, s1e: c.s1e, s1f: c.s1f, s2p: c.s2p, s2e: c.s2e, s2f: c.s2f, eoy: c.eoy }, tasks: [], weightBonus: getWeightBonus(c.name), showStar: { s1: !1, s2: !1 } })), sectionName, annualGPA: apiAnnualGPA, cumulativeGPA: apiCumulativeGPA };
        }
      } catch (e) {
        console.warn(`[\u5F80\u5E74] \u89E3\u6790\u5E74\u5EA6\u62A5\u544A\u5931\u8D25: ${e.message}\uFF0C\u5C1D\u8BD5\u5B66\u671F\u62A5\u544A`);
      }
    let s1CoursesMap = /* @__PURE__ */ new Map(), s2CoursesMap = /* @__PURE__ */ new Map();
    for (let report of reports) {
      if (report.gradePeriodType !== "midTerm" && report.gradePeriodType !== "endTerm") continue;
      let name = report.reportName || "", isS1 = name.includes("\u7B2C\u4E00\u5B66\u671F") || name.includes("Semester 1") || name.includes("S1"), isS2 = name.includes("\u7B2C\u4E8C\u5B66\u671F") || name.includes("Semester 2") || name.includes("S2");
      if (!isS1 && !isS2) continue;
      let content = await fetchReportContent(studentId, report.requestUrl, report.gradePeriodId), term = isS1 ? "S1" : "S2", parsed = parseSemesterReport(content, term), targetMap = term === "S1" ? s1CoursesMap : s2CoursesMap;
      for (let c of parsed)
        targetMap.has(c.name) || targetMap.set(c.name, { name: c.name, courseId: c.courseId, credit: c.credit, s1e: null, s2e: null }), term === "S1" ? targetMap.get(c.name).s1e = c.s1e : targetMap.get(c.name).s2e = c.s2e;
    }
    let allNames = /* @__PURE__ */ new Set([...s1CoursesMap.keys(), ...s2CoursesMap.keys()]), courses = [];
    for (let name of allNames) {
      let s1 = s1CoursesMap.get(name) || {}, s2 = s2CoursesMap.get(name) || {}, credit = s1.credit > 0 ? s1.credit : s2.credit > 0 ? s2.credit : 1, s1e = s1.s1e || null, s2e = s2.s2e || null, s1f = calcF(null, s1e), s2f = calcF(null, s2e);
      courses.push({ name, courseId: s1.courseId || s2.courseId, credit, originalGrades: { s1p: null, s1e, s1f, s2p: null, s2e, s2f, eoy: null }, tasks: [], weightBonus: getWeightBonus(name), showStar: { s1: !1, s2: !1 } });
    }
    return { courses, sectionName, annualGPA: null, cumulativeGPA: null };
  }
  function getScoreFromCustomColumns(item, colMap, targetField) {
    if (!item || !colMap) return null;
    let targetKey = colMap.get(targetField);
    if (targetKey === void 0 && (targetKey = colMap.get(String(targetField).toUpperCase())), targetKey == null) return null;
    let customCols = item.customColumnScores;
    if (!customCols) return null;
    if (typeof customCols == "object" && !Array.isArray(customCols)) {
      let entry = customCols[targetKey];
      if (entry && typeof entry == "object" && "score" in entry) {
        let val = parseFloat(entry.score);
        return isNaN(val) ? null : val;
      }
      return null;
    }
    if (Array.isArray(customCols)) {
      let found = customCols.find((col) => col && (String(col.label) === String(targetKey) || String(col.customColumnId) === String(targetKey)));
      if (found && typeof found == "object" && "score" in found) {
        let val = parseFloat(found.score);
        return isNaN(val) ? null : val;
      }
      return null;
    }
    return null;
  }
  async function getGradeBookData(yearKey) {
    let url = `${BASE_URL}/task-grade/grade-book/?schoolYearId=${yearKey}`;
    return await apiRequest(url);
  }
  function buildColumnMap(gradeData, yearValue) {
    let colMap = /* @__PURE__ */ new Map();
    for (let col of gradeData.customColumns || [])
      col && col.customColumnId !== void 0 && col.customColumnName && colMap.set(String(col.customColumnName).trim(), String(col.customColumnId));
    let fallback = COLUMN_KEY_MAPPING[String(yearValue)];
    if (fallback)
      for (let [field, colId] of Object.entries(fallback))
        colId && !colMap.has(field) && !colMap.has(field.toUpperCase()) && colMap.set(field, String(colId));
    return colMap;
  }
  async function buildCurrentYearCourses(yearKey, yearValue) {
    let gradeData = await getGradeBookData(yearKey), colMap = buildColumnMap(gradeData, yearValue), items = gradeData.gradeBookItems || [];
    S.creditMap || (S.creditMap = /* @__PURE__ */ new Map());
    let creditMapEmpty = S.creditMap.size === 0;
    if (log(`[\u5F53\u524D\u5B66\u5E74] grade-book \u8FD4\u56DE: items=${items.length} customColumns=${(gradeData.customColumns || []).length} creditMap=${S.creditMap.size} \u6761`), creditMapEmpty && items.length && console.warn("[\u5F53\u524D\u5B66\u5E74] creditMap \u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u533A\u5206\u96F6\u5B66\u5206\u8BFE\u7A0B\uFF1B\u7F3A\u7701\u5B66\u5206\u6682\u6309 1 \u5904\u7406\uFF08\u51C6\u786E\u5B66\u5206\u4F9D\u8D56 schedule \u6570\u636E\uFF09"), items.length) {
      let s0 = items[0];
      log("[\u5F53\u524D\u5B66\u5E74] \u6837\u4F8B\u6761\u76EE: " + JSON.stringify({ courseId: s0.courseId, courseName: s0.courseName, subject: s0.subject, creditFromMap: S.creditMap.get(s0.courseId) }));
    }
    let allCourses = [];
    for (let item of items) {
      let credit = S.creditMap.get(item.courseId);
      credit === void 0 && (credit = creditMapEmpty ? 1 : 0);
      let rawGrades = { s1p: null, s1e: null, s1f: null, s2p: null, s2e: null, s2f: null }, mappedS1P = getScoreFromCustomColumns(item, colMap, "s1p"), mappedS1E = getScoreFromCustomColumns(item, colMap, "s1e"), mappedS1F = getScoreFromCustomColumns(item, colMap, "s1f"), mappedS2P = getScoreFromCustomColumns(item, colMap, "s2p"), mappedS2E = getScoreFromCustomColumns(item, colMap, "s2e"), mappedS2F = getScoreFromCustomColumns(item, colMap, "s2f");
      rawGrades.s1p = mappedS1P !== null ? mappedS1P : item.s1p !== void 0 && item.s1p !== null ? Number(item.s1p) : null, rawGrades.s1e = mappedS1E !== null ? mappedS1E : item.s1e !== void 0 && item.s1e !== null ? Number(item.s1e) : null, rawGrades.s1f = mappedS1F !== null ? mappedS1F : item.s1f !== void 0 && item.s1f !== null ? Number(item.s1f) : null, rawGrades.s2p = mappedS2P !== null ? mappedS2P : item.s2p !== void 0 && item.s2p !== null ? Number(item.s2p) : null, rawGrades.s2e = mappedS2E !== null ? mappedS2E : item.s2e !== void 0 && item.s2e !== null ? Number(item.s2e) : null, rawGrades.s2f = mappedS2F !== null ? mappedS2F : item.s2f !== void 0 && item.s2f !== null ? Number(item.s2f) : null;
      let tasks = (item.taskScores || []).filter((t4) => !t4.endDate || getTermFromDate(t4.endDate, t4.term || t4.schoolYearTerm) !== null);
      tasks = tasks.map((t4) => {
        let entityId = parseInt(t4.entityId || t4.taskStudentId || t4.id, 10);
        return { entityId, taskStudentId: entityId, id: t4.id || entityId || Math.random(), name: t4.taskName || "\u672A\u547D\u540D", typeName: t4.taskTypeName || "\u5176\u4ED6", score: t4.score != null ? Number(t4.score) : null, topScore: t4.topScore != null ? Number(t4.topScore) : null, endDate: t4.endDate, termRaw: t4.term || t4.schoolYearTerm || null, originalScore: t4.score != null ? Number(t4.score) : null, simulatedScore: t4.score != null ? Number(t4.score) : null, isVirtual: !1 };
      }), tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
      for (let t4 of tasks)
        calibrationExcluded(yearKey, t4.entityId) && (t4.excluded = !0);
      let origS1P = calculateTermAverageByCategory(tasks, item.subject || item.courseName, "S1"), origS2P = calculateTermAverageByCategory(tasks, item.subject || item.courseName, "S2"), showStar = { s1: !1, s2: !1 };
      origS1P !== null && rawGrades.s1p !== null && differsFromSchool(origS1P, rawGrades.s1p) ? showStar.s1 = !0 : origS1P !== null && (rawGrades.s1p = origS1P), origS2P !== null && rawGrades.s2p !== null && differsFromSchool(origS2P, rawGrades.s2p) ? showStar.s2 = !0 : origS2P !== null && (rawGrades.s2p = origS2P), rawGrades.s1f === null && (rawGrades.s1f = calcF(rawGrades.s1p, rawGrades.s1e)), rawGrades.s2f === null && (rawGrades.s2f = calcF(rawGrades.s2p, rawGrades.s2e)), allCourses.push({ name: item.courseName, courseId: item.courseId, credit, subject: item.subject || null, originalGrades: rawGrades, tasks, weightBonus: getWeightBonus(item.courseName), showStar });
    }
    let zeroCreditCourses = allCourses.filter((c) => c.credit <= 0), validCourses = allCourses.filter((c) => c.credit > 0);
    zeroCreditCourses.length && log(`[\u5F53\u524D\u5B66\u5E74] \u96F6\u5B66\u5206\u8BFE\u7A0B ${zeroCreditCourses.length} \u95E8\uFF08\u9000\u73ED/\u975E\u5B66\u5206\uFF0C\u7528\u4E8E\u8865\u5168\u5339\u914D\uFF09\uFF0C\u6B63\u5B66\u5206 ${validCourses.length} \u95E8`);
    function findBestMatchIndexExclusive(targetCourseName, term, usedSet) {
      let key = extractSubjectKey(targetCourseName);
      if (!key) return -1;
      let candidates = [];
      for (let i = 0; i < zeroCreditCourses.length; i++) {
        if (usedSet.has(i)) continue;
        let c = zeroCreditCourses[i];
        extractSubjectKey(c.name) === key && candidates.push(i);
      }
      if (candidates.length === 0) return -1;
      let hasExam = candidates.filter((i) => term === "S1" ? zeroCreditCourses[i].originalGrades.s1e !== null : zeroCreditCourses[i].originalGrades.s2e !== null);
      if (hasExam.length > 0) {
        hasExam.length > 1 && hasExam.sort((a, b) => countUngradedTasks(zeroCreditCourses[a].tasks, term) - countUngradedTasks(zeroCreditCourses[b].tasks, term));
        let chosen2 = hasExam[0];
        return usedSet.add(chosen2), chosen2;
      }
      candidates.sort((a, b) => countUngradedTasks(zeroCreditCourses[a].tasks, term) - countUngradedTasks(zeroCreditCourses[b].tasks, term));
      let chosen = candidates[0];
      return usedSet.add(chosen), chosen;
    }
    let usedZeroCredit = /* @__PURE__ */ new Set();
    for (let course of validCourses) {
      if (course.originalGrades.s1p === null && course.originalGrades.s1e === null) {
        course.tasks = course.tasks.filter((t4) => getTermFromDate(t4.endDate, t4.termRaw) !== "S1");
        let bestIdx = findBestMatchIndexExclusive(course.name, "S1", usedZeroCredit);
        if (bestIdx >= 0) {
          let bestMatch = zeroCreditCourses[bestIdx];
          mergeTasksForTerm(course, bestMatch, "S1");
          let newS1P = calculateTermAverageByCategory(course.tasks, course.subject || course.name, "S1");
          newS1P !== null && (course.originalGrades.s1p = newS1P), bestMatch.originalGrades.s1e !== null && (course.originalGrades.s1e = bestMatch.originalGrades.s1e), course.originalGrades.s1f = calcF(course.originalGrades.s1p, course.originalGrades.s1e);
        }
      }
      if (course.originalGrades.s2p === null && course.originalGrades.s2e === null) {
        course.tasks = course.tasks.filter((t4) => getTermFromDate(t4.endDate, t4.termRaw) !== "S2");
        let bestIdx = findBestMatchIndexExclusive(course.name, "S2", usedZeroCredit);
        if (bestIdx >= 0) {
          let bestMatch = zeroCreditCourses[bestIdx];
          mergeTasksForTerm(course, bestMatch, "S2");
          let newS2P = calculateTermAverageByCategory(course.tasks, course.subject || course.name, "S2");
          newS2P !== null && (course.originalGrades.s2p = newS2P), bestMatch.originalGrades.s2e !== null && (course.originalGrades.s2e = bestMatch.originalGrades.s2e), course.originalGrades.s2f = calcF(course.originalGrades.s2p, course.originalGrades.s2e);
        }
      }
    }
    for (let course of validCourses) {
      if (course.originalGrades.s1e === null) {
        let bestIdx = findBestMatchIndexExclusive(course.name, "S1", usedZeroCredit);
        bestIdx >= 0 && zeroCreditCourses[bestIdx].originalGrades.s1e !== null && (course.originalGrades.s1e = zeroCreditCourses[bestIdx].originalGrades.s1e, course.originalGrades.s1f = calcF(course.originalGrades.s1p, course.originalGrades.s1e));
      }
      if (course.originalGrades.s2e === null) {
        let bestIdx = findBestMatchIndexExclusive(course.name, "S2", usedZeroCredit);
        bestIdx >= 0 && zeroCreditCourses[bestIdx].originalGrades.s2e !== null && (course.originalGrades.s2e = zeroCreditCourses[bestIdx].originalGrades.s2e, course.originalGrades.s2f = calcF(course.originalGrades.s2p, course.originalGrades.s2e));
      }
    }
    return validCourses;
  }
  var TERM_COLUMN_NAMES, init_courses = __esm({
    "v8.30/courses.js"() {
      init_state();
      init_utils();
      init_api();
      init_deadline();
      init_log();
      TERM_COLUMN_NAMES = { S1P: 1, S1E: 1, S1F: 1, S2P: 1, S2E: 1, S2F: 1 };
    }
  });

  // v8.30/gpa-target.js
  function _targetCacheKey(course, term) {
    return course.name + "|" + course.simGrades.s1p + "|" + course.simGrades.s2p + "|" + course.simGrades.s1e + "|" + course.simGrades.s2e + "|" + term;
  }
  function invalidateTargetGapCache() {
    _targetGapCache.clear(), _examDisplayCache.computed = !1;
  }
  function calcMaxPFromTasks(course, term) {
    let tasks = course.tasks.filter((t4) => getTermFromDate(t4.endDate, t4.termRaw) === term);
    if (!tasks.length) return null;
    let catData = Array(5).fill().map(() => ({ score: 0, max: 0 }));
    for (let t4 of tasks) {
      let idx = TYPE_PATTERNS.findIndex((p) => p.test(t4.typeName));
      if (idx >= 0 && idx < 5) {
        let scoreVal;
        if (t4.simulatedScore === -1) continue;
        t4.simulatedScore !== void 0 && t4.simulatedScore !== null ? scoreVal = t4.simulatedScore : scoreVal = t4.topScore || 0, t4.topScore != null && t4.topScore > 0 && (catData[idx].score += scoreVal, catData[idx].max += t4.topScore);
      }
    }
    return calcPFromCategoryData(catData, course.subject || course.name);
  }
  function getMinScoreForGPA(targetGPA) {
    if (targetGPA == null) return null;
    let sortedBands = [...GRADE_BANDS].sort((a, b) => a.min - b.min);
    for (let band of sortedBands) {
      let gpa = LETTER_TO_GPA.get(band.letter);
      if (gpa !== void 0 && gpa >= targetGPA) return band.min;
    }
    return 97;
  }
  function computeTargetGap(course, term) {
    let cacheKey = _targetCacheKey(course, term) + "|" + S.targetGPAMode + "|" + S.targetUWGPA + "|" + S.targetWGPA, cached = _targetGapCache.get(cacheKey);
    if (cached) return cached;
    let result = _computeTargetGapRaw(course, term);
    return _targetGapCache.set(cacheKey, result), result;
  }
  function _computeTargetGapRaw(course, term) {
    let isS1 = term === "S1" || term === "s1", currentP = isS1 ? course.simGrades.s1p : course.simGrades.s2p, examScore = isS1 ? course.simGrades.s1e : course.simGrades.s2e, wb = course.weightBonus;
    if (currentP === null) return { locked: !1, atMax: !1, uw: null, w: null };
    let currentF = calcF(currentP, examScore), currentUW = getUnweightedGPA(currentF), currentW = currentUW !== null ? currentUW + wb : null;
    if (examScore !== null)
      return {
        locked: !0,
        atMax: !1,
        currentP,
        currentF,
        currentUW,
        currentW,
        examScore,
        uwGap: null,
        wGap: null,
        uwNeededP: null,
        wNeededP: null
      };
    let atMax = currentP >= 93;
    function getMinScoreForTarget(targetGPA, isWeighted) {
      if (targetGPA === null) return null;
      let targetUW = isWeighted ? targetGPA - wb : targetGPA;
      return getMinScoreForGPA(Math.max(targetUW, 0));
    }
    if (S.targetGPAMode === "exam") {
      let uwMin2 = S.targetUWGPA !== null ? getMinScoreForTarget(S.targetUWGPA, !1) : null, wMin2 = S.targetWGPA !== null ? getMinScoreForTarget(S.targetWGPA, !0) : null, baseF = currentP * 0.8, uwNeeded2 = null, wNeeded2 = null;
      return uwMin2 !== null && (baseF >= uwMin2 ? uwNeeded2 = 0 : uwNeeded2 = Math.min((uwMin2 - baseF) / 0.2, 100)), wMin2 !== null && (baseF >= wMin2 ? wNeeded2 = 0 : wNeeded2 = Math.min((wMin2 - baseF) / 0.2, 100)), {
        locked: !1,
        atMax,
        currentP,
        currentF,
        currentUW,
        currentW,
        examScore: null,
        uwGap: uwNeeded2,
        wGap: wNeeded2,
        uwNeededP: uwNeeded2,
        wNeededP: wNeeded2,
        mode: "exam"
      };
    }
    let uwMin = S.targetUWGPA !== null ? getMinScoreForTarget(S.targetUWGPA, !1) : null, wMin = S.targetWGPA !== null ? getMinScoreForTarget(S.targetWGPA, !0) : null, maxP = calcMaxPFromTasks(course, isS1 ? "S1" : "S2"), capP = maxP !== null ? Math.max(currentP, maxP) : 100, uwNeeded = null, wNeeded = null;
    return uwMin !== null && (uwMin <= currentP ? uwNeeded = currentP : uwNeeded = Math.min(uwMin, capP)), wMin !== null && (wMin <= currentP ? wNeeded = currentP : wNeeded = Math.min(wMin, capP)), {
      locked: !1,
      atMax,
      currentP,
      currentF,
      currentUW,
      currentW,
      examScore: null,
      uwGap: uwNeeded !== null ? Math.max(0, uwNeeded - currentP) : null,
      wGap: wNeeded !== null ? Math.max(0, wNeeded - currentP) : null,
      uwNeededP: uwNeeded,
      wNeededP: wNeeded,
      mode: "subject"
    };
  }
  function getExamDisplayGap(course, term) {
    let gap = computeTargetGap(course, term);
    if (S.targetGPAMode !== "exam" || gap.locked || gap.uw === null) return gap;
    if (!_examDisplayCache.computed) {
      let focusSem2 = getExamFocusSemester();
      if (!focusSem2)
        return _examDisplayCache.computed = !0, gap;
      let otherSem = focusSem2 === "S1" ? "S2" : "S1";
      _examDisplayCache.focusSem = focusSem2, _examDisplayCache.lockedGPA = computeSemesterCreditGPA(otherSem), _examDisplayCache.curFocusGPA = computeSemesterCreditGPA(focusSem2), _examDisplayCache.computed = !0;
    }
    let focusSem = _examDisplayCache.focusSem;
    if (!focusSem || !(term === "s1" && focusSem === "S1" || term === "s2" && focusSem === "S2")) return gap;
    let lockedGPA = _examDisplayCache.lockedGPA, curFocusGPA = _examDisplayCache.curFocusGPA;
    if (!lockedGPA || !curFocusGPA) return gap;
    let wb = course.weightBonus, neededUW = null, neededW = null, targetCourseUW = null, targetCourseW = null;
    if (S.targetUWGPA !== null) {
      let uwGap = Math.max(0, 2 * S.targetUWGPA - lockedGPA.uw) - curFocusGPA.uw;
      targetCourseUW = Math.min(gap.currentUW + uwGap, 4);
      let minF = getMinScoreForGPA(targetCourseUW);
      if (minF !== null) {
        let raw = (minF - gap.currentP * 0.8) / 0.2;
        neededUW = Math.max(0, Math.min(raw, 100));
      }
    }
    if (S.targetWGPA !== null) {
      let wGap = Math.max(0, 2 * S.targetWGPA - lockedGPA.w) - curFocusGPA.w;
      targetCourseW = Math.min(gap.currentW + wGap, 4 + wb);
      let minF = getMinScoreForGPA(targetCourseW - wb);
      if (minF !== null) {
        let raw = (minF - gap.currentP * 0.8) / 0.2;
        neededW = Math.max(0, Math.min(raw, 100));
      }
    }
    return __spreadProps(__spreadValues({}, gap), {
      uwNeededP: neededUW,
      wNeededP: neededW,
      uwGap: neededUW,
      wGap: neededW,
      targetCourseUW,
      targetCourseW
    });
  }
  function computeMaxTermGPA(course, term) {
    let isS1 = term === "S1" || term === "s1", currentP = isS1 ? course.simGrades.s1p : course.simGrades.s2p, examScore = isS1 ? course.simGrades.s1e : course.simGrades.s2e, wb = course.weightBonus;
    if (currentP === null) return null;
    let maxF;
    return examScore !== null ? maxF = calcF(currentP, examScore) : S.targetGPAMode === "exam" ? maxF = calcF(currentP, 100) : maxF = 100, getGPAForScore(maxF, wb);
  }
  function computeOverallMaxGPA() {
    let s1UW = 0, s1W = 0, s1Cr = 0, s2UW = 0, s2W = 0, s2Cr = 0;
    for (let course of S.simCourses) {
      let cr = course.credit;
      if (!(cr <= 0))
        for (let term of ["S1", "S2"]) {
          let isS1 = term === "S1", gpa = computeMaxTermGPA(course, term);
          gpa && (isS1 ? (s1UW += gpa.uw * cr, s1W += gpa.w * cr, s1Cr += cr) : (s2UW += gpa.uw * cr, s2W += gpa.w * cr, s2Cr += cr));
        }
    }
    let sg1 = s1Cr > 0 ? { uw: s1UW / s1Cr, w: s1W / s1Cr } : null, sg2 = s2Cr > 0 ? { uw: s2UW / s2Cr, w: s2W / s2Cr } : null;
    return !sg1 && !sg2 ? null : sg1 ? sg2 ? { uw: (sg1.uw + sg2.uw) / 2, w: (sg1.w + sg2.w) / 2 } : sg1 : sg2;
  }
  function getExamFocusSemester() {
    let hasS1 = !1, hasS2 = !1;
    for (let course of S.simCourses)
      course.simGrades.s1p !== null && course.simGrades.s1e === null && (hasS1 = !0), course.simGrades.s2p !== null && course.simGrades.s2e === null && (hasS2 = !0);
    return hasS1 ? "S1" : hasS2 ? "S2" : null;
  }
  function hasAnyPData() {
    for (let course of S.simCourses)
      if (course.simGrades.s1p !== null || course.simGrades.s2p !== null) return !0;
    return !1;
  }
  function maxGPAHintText() {
    let m = computeOverallMaxGPA();
    return m ? t("\u6700\u9AD8\u53EF\u8FBE", "Maximum") + " UW " + m.uw.toFixed(2) + " W " + m.w.toFixed(2) : null;
  }
  function buildTargetGPAControlsHTML(rowStyle) {
    let html = '<div style="' + (rowStyle || "display:flex;align-items:center;flex-wrap:wrap;gap:6px;") + '">';
    html += '<select id="target-mode-select" style="padding:2px 4px;border:1px solid #d9d9d9;border-radius:4px;font-size:12px;">', html += '<option value="subject"' + (S.targetGPAMode === "subject" ? " selected" : "") + ">" + t("\u79D1\u76EE\u8BA1\u7B97", "Subject Calculation") + "</option>", html += '<option value="exam"' + (S.targetGPAMode === "exam" ? " selected" : "") + ">" + t("\u671F\u672B\u8BA1\u7B97", "Exam Calculation") + "</option>", html += "</select>", html += '<span style="font-weight:500;color:#555;">' + t("\u76EE\u6807GPA", "Target GPA") + ":</span>", html += '<span>UW</span><input id="target-uw-input" type="number" step="0.01" min="0" max="4.0" style="width:55px;padding:2px 4px;border:1px solid #d9d9d9;border-radius:4px;font-size:12px;" value="' + (S.targetUWGPA !== null ? S.targetUWGPA.toFixed(2) : "") + '" placeholder="\u2014">', html += '<span>W</span><input id="target-w-input" type="number" step="0.01" min="0" max="5.0" style="width:55px;padding:2px 4px;border:1px solid #d9d9d9;border-radius:4px;font-size:12px;" value="' + (S.targetWGPA !== null ? S.targetWGPA.toFixed(2) : "") + '" placeholder="\u2014">';
    let hint = maxGPAHintText();
    return hint && (html += '<span id="target-max-hint" style="color:#888;margin-left:4px;">' + hint + "</span>"), (S.targetUWGPA !== null || S.targetWGPA !== null) && (html += '<button id="clear-target-btn" class="ant-btn ant-btn-link" style="font-size:11px;padding:0 4px;">' + t("\u6E05\u9664", "Clear") + "</button>"), html += "</div>", html;
  }
  function computeSemesterCreditGPA(term) {
    let uw = 0, w = 0, cr = 0;
    for (let course of S.simCourses) {
      if (course.credit <= 0) continue;
      let isS1 = term === "S1" || term === "s1", p = isS1 ? course.simGrades.s1p : course.simGrades.s2p;
      if (p === null) continue;
      let e = isS1 ? course.simGrades.s1e : course.simGrades.s2e, f = calcF(p, e), g = getGPAForScore(f, course.weightBonus);
      g && (uw += g.uw * course.credit, w += g.w * course.credit, cr += course.credit);
    }
    return cr === 0 ? null : { uw: uw / cr, w: w / cr };
  }
  function buildTargetDetailTable() {
    if (S.targetUWGPA === null && S.targetWGPA === null) return "";
    let rows = [];
    if (S.targetGPAMode === "exam") {
      let focusSem = getExamFocusSemester();
      if (focusSem === null)
        return hasAnyPData() ? '<div style="color:#d4380d;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u671F\u672B\u8003\u8BD5\u5747\u5DF2\u7ED3\u675F\uFF0C\u65E0\u6CD5\u8FDB\u884C\u671F\u672B\u6A21\u62DF", "All final exams completed \u2014 exam simulation unavailable") + "</div>" : '<div style="color:#888;font-size:11px;margin-top:4px;">' + t("\u6682\u65E0\u671F\u672B\u6210\u7EE9\uFF0C\u65E0\u6CD5\u63A8\u7B97", "No final exam data \u2014 cannot calculate") + "</div>";
      for (let course of S.simCourses) {
        let dg = getExamDisplayGap(course, focusSem === "S1" ? "s1" : "s2");
        dg.locked || dg.uwNeededP === null && dg.wNeededP === null && (dg.currentUW === null && dg.currentW === null || !(S.targetUWGPA !== null && dg.currentUW !== null || S.targetWGPA !== null && dg.currentW !== null)) || rows.push({
          course,
          term: focusSem,
          gap: dg,
          neededUW: dg.uwNeededP,
          neededW: dg.wNeededP,
          atMax: dg.atMax,
          targetCourseUW: dg.targetCourseUW,
          targetCourseW: dg.targetCourseW
        });
      }
      if (!rows.length)
        return '<div style="color:#888;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u79D1\u76EE" + focusSem + "\u5B66\u671F\u5747\u5DF2\u8003\u5B8C\u6216\u8FBE\u6807", "All courses " + focusSem + " term are done or at target") + "</div>";
      let html2 = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
      for (let { course, term, gap, neededUW, neededW, atMax, targetCourseUW, targetCourseW } of rows) {
        html2 += "<tr>";
        let cellHtml = '<span style="font-weight:500;">' + escapeHtml(course.name) + '</span> <span style="color:#888;">' + term + "</span>";
        {
          let parts = [];
          S.targetUWGPA !== null && neededUW !== null && (neededUW < 0.01 ? parts.push('UW <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>") : parts.push("UW " + t("\u76EE\u6807", "target") + " " + targetCourseUW.toFixed(2) + " " + t("\u9700\u8003\u2265", "need E\u2265") + '<span style="color:#fa8c16;font-weight:600;">' + neededUW.toFixed(2) + "</span>")), S.targetWGPA !== null && neededW !== null && (neededW < 0.01 ? parts.push('W <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>") : parts.push("W " + t("\u76EE\u6807", "target") + " " + targetCourseW.toFixed(2) + " " + t("\u9700\u8003\u2265", "need E\u2265") + '<span style="color:#fa8c16;font-weight:600;">' + neededW.toFixed(2) + "</span>")), parts.length ? (cellHtml += " \u2014 " + parts.join(" | "), atMax && (cellHtml += ' <span style="color:#888;">(P\u226593)</span>')) : atMax && (cellHtml += ' \u2014 <span style="color:#888;">' + t("P\u5DF2\u8FBEA\u7EA7", "P at A-level") + "</span>");
        }
        html2 += '<td style="padding:4px 6px;border:1px solid #eee;">' + cellHtml + "</td>", html2 += "</tr>";
      }
      return html2 += "</table>", html2;
    }
    for (let course of S.simCourses)
      for (let term of ["S1", "S2"]) {
        let gap = computeTargetGap(course, term === "S1" ? "s1" : "s2");
        if (gap.uw === null && gap.w === null || gap.locked) continue;
        let maxTermGPA = computeMaxTermGPA(course, term);
        rows.push({ course, term, gap, maxTermGPA });
      }
    if (!rows.length)
      return (() => {
        for (let course of S.simCourses)
          for (let term of ["S1", "S2"]) {
            let g = computeTargetGap(course, term === "S1" ? "s1" : "s2");
            if ((g.uw !== null || g.w !== null) && !g.locked)
              return !1;
          }
        return !0;
      })() ? '<div style="color:#d4380d;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u5B66\u671F\u671F\u672B\u8003\u8BD5\u5747\u5DF2\u7ED3\u675F\uFF0C\u6210\u7EE9\u4E0D\u53EF\u66F4\u6539", "All semester exams completed \u2014 grades cannot be changed") + "</div>" : '<div style="color:#52c41a;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u79D1\u76EE\u5747\u5DF2\u8FBE\u6807", "All courses meet target") + "</div>";
    let html = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    for (let { course, term, gap, maxTermGPA } of rows) {
      html += "<tr>";
      let cellHtml = '<span style="font-weight:500;">' + escapeHtml(course.name) + '</span> <span style="color:#888;">' + term + "</span>";
      {
        let gapParts = [];
        S.targetUWGPA !== null && gap.uwGap !== null && (gap.uwGap < 5e-3 ? gapParts.push('UW <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>") : gap.atMax ? gapParts.push('UW <span style="color:#fa8c16;">' + t("P\u5DF2\u8FBEA\u7EA7\u4E0A\u9650\uFF0C\u8DDD\u76EE\u6807\u5DEE", "P at A-level max, gap ") + gap.uwGap.toFixed(2) + "</span>") : gapParts.push('UW <span style="color:#fa8c16;">' + t("\u76EE\u6807\u9700\u5E73\u65F6\u6210\u7EE9 +", "target need P +") + gap.uwGap.toFixed(2) + "</span>")), S.targetWGPA !== null && gap.wGap !== null && (gap.wGap < 5e-3 ? gapParts.push('W <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>") : gap.atMax ? gapParts.push('W <span style="color:#fa8c16;">' + t("P\u5DF2\u8FBEA\u7EA7\u4E0A\u9650\uFF0C\u8DDD\u76EE\u6807\u5DEE", "P at A-level max, gap ") + gap.wGap.toFixed(2) + "</span>") : gapParts.push('W <span style="color:#fa8c16;">' + t("\u76EE\u6807\u9700\u5E73\u65F6\u6210\u7EE9 +", "target need P +") + gap.wGap.toFixed(2) + "</span>")), gapParts.length ? (cellHtml += " \u2014 " + gapParts.join(", "), gap.atMax && (cellHtml += ' <span style="color:#d4380d;font-size:10px;">' + t("(P\u5DF2\u8FBEA\u7EA7\u4E0A\u9650)", "(P at A-level max)") + "</span>")) : gap.atMax ? cellHtml += ' \u2014 <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6700\u5927GPA\u4E14\u8FBE\u6807", "Max GPA reached & target met") + "</span>" : cellHtml += ' \u2014 <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>";
      }
      html += '<td style="padding:4px 6px;border:1px solid #eee;">' + cellHtml + "</td>", html += "</tr>";
    }
    return html += "</table>", html;
  }
  function renderTargetGapSummary(root) {
    let scope = root || document, summaryDiv = scope.querySelector("#target-gap-summary");
    if (!summaryDiv) return;
    if (S.targetUWGPA === null && S.targetWGPA === null) {
      summaryDiv.innerHTML = "";
      return;
    }
    if (S.targetGPAMode === "exam") {
      let focusSem = getExamFocusSemester();
      if (focusSem === null)
        summaryDiv.innerHTML = hasAnyPData() ? '<span style="color:#d4380d;">' + t("\u6240\u6709\u671F\u672B\u8003\u8BD5\u5747\u5DF2\u7ED3\u675F\uFF0C\u65E0\u6CD5\u8FDB\u884C\u671F\u672B\u6A21\u62DF", "All final exams completed \u2014 exam simulation unavailable") + "</span>" : '<span style="color:#888;">' + t("\u6682\u65E0\u671F\u672B\u6210\u7EE9\uFF0C\u65E0\u6CD5\u63A8\u7B97", "No final exam data \u2014 cannot calculate") + "</span>";
      else {
        let lockedGPA = computeSemesterCreditGPA(focusSem === "S1" ? "S2" : "S1"), curFocusGPA = computeSemesterCreditGPA(focusSem), belowC = 0;
        for (let course of S.simCourses) {
          let gap = computeTargetGap(course, focusSem === "S1" ? "s1" : "s2");
          if (gap.uw === null && gap.w === null || gap.locked) continue;
          let needsImprovement = !1;
          if (S.targetUWGPA !== null && lockedGPA && curFocusGPA && gap.currentUW !== null) {
            let uwGap = Math.max(0, 2 * S.targetUWGPA - lockedGPA.uw) - curFocusGPA.uw, targetCourseUW = Math.min(gap.currentUW + uwGap, 4), minF = getMinScoreForGPA(targetCourseUW);
            minF !== null && (minF - gap.currentP * 0.8) / 0.2 > 5e-3 && (needsImprovement = !0);
          }
          if (!needsImprovement && S.targetWGPA !== null && lockedGPA && curFocusGPA && gap.currentW !== null) {
            let wGap = Math.max(0, 2 * S.targetWGPA - lockedGPA.w) - curFocusGPA.w, targetCourseW = Math.min(gap.currentW + wGap, 4 + course.weightBonus), minF = getMinScoreForGPA(targetCourseW - course.weightBonus);
            minF !== null && (minF - gap.currentP * 0.8) / 0.2 > 5e-3 && (needsImprovement = !0);
          }
          needsImprovement && belowC++;
        }
        let label = focusSem === "S1" ? t("\u7B2C\u4E00\u5B66\u671F", "Semester 1") : t("\u7B2C\u4E8C\u5B66\u671F", "Semester 2");
        belowC > 0 ? summaryDiv.innerHTML = '<span style="color:#fa8c16;">' + t("\u671F\u672B\u6A21\u62DF \u2014 " + label + "\uFF1A", "Exam Simulation \u2014 " + label + ": ") + belowC + " " + t("\u79D1\u9700\u63D0\u5347\u4EE5\u8FBE\u5230\u5E73\u5747\u76EE\u6807", " courses need improvement for avg target") + "</span>" : summaryDiv.innerHTML = '<span style="color:#52c41a;">' + t("\u671F\u672B\u6A21\u62DF \u2014 " + label + "\uFF1A\u6240\u6709\u79D1\u76EE\u5DF2\u8FBE\u6807", "Exam Simulation \u2014 " + label + ": all courses met") + "</span>";
      }
      let detailDiv2 = scope.querySelector("#target-detail-table");
      detailDiv2 && (detailDiv2.innerHTML = buildTargetDetailTable());
      return;
    }
    let s1Below = 0, s1Gap = 0, s2Below = 0, s2Gap = 0, lockedCount = 0, maxCount = 0, totalTerms = 0;
    for (let course of S.simCourses)
      for (let term of ["S1", "S2"]) {
        let gap = computeTargetGap(course, term === "S1" ? "s1" : "s2");
        if (gap.uw === null && gap.w === null) continue;
        if (totalTerms++, gap.locked) {
          lockedCount++;
          continue;
        }
        gap.atMax && maxCount++;
        let maxGap = Math.max(gap.uwGap || 0, gap.wGap || 0);
        maxGap > 5e-3 && (term === "S1" ? (s1Below++, s1Gap += maxGap) : (s2Below++, s2Gap += maxGap));
      }
    let activeTerms = totalTerms - lockedCount;
    if (lockedCount === totalTerms)
      summaryDiv.innerHTML = '<span style="color:#d4380d;">' + t("\u6240\u6709\u5B66\u671F\u5747\u5DF2\u8003\u5B8C\u671F\u672B\uFF0C\u6210\u7EE9\u4E0D\u53EF\u66F4\u6539", "All semesters completed \u2014 grades cannot be changed") + "</span>";
    else if (s1Below === 0 && s2Below === 0)
      summaryDiv.innerHTML = '<span style="color:#52c41a;">' + t("\u6240\u6709\u79D1\u76EE\u5747\u5DF2\u8FBE\u6807", "All courses meet target") + "</span>";
    else if (s1Below > 0 || s2Below > 0) {
      let parts = [];
      if (s1Below > 0) {
        let avg = (s1Gap / s1Below).toFixed(2);
        parts.push("S1 " + s1Below + " " + t("\u79D1\u672A\u8FBE\u6807\uFF0C\u5E73\u5747\u9700\u63D0\u5347", " below, avg need") + " " + avg + " " + t("\u5E73\u65F6\u5206", " P pts"));
      }
      if (s2Below > 0) {
        let avg = (s2Gap / s2Below).toFixed(2);
        parts.push("S2 " + s2Below + " " + t("\u79D1\u672A\u8FBE\u6807\uFF0C\u5E73\u5747\u9700\u63D0\u5347", " below, avg need") + " " + avg + " " + t("\u5E73\u65F6\u5206", " P pts"));
      }
      summaryDiv.innerHTML = parts.join("\uFF1B");
    } else
      summaryDiv.innerHTML = '<span style="color:#52c41a;">' + t("\u6240\u6709\u79D1\u76EE\u5747\u5DF2\u8FBE\u6807", "All courses meet target") + "</span>";
    let detailDiv = scope.querySelector("#target-detail-table");
    detailDiv && (detailDiv.innerHTML = buildTargetDetailTable());
  }
  function attachTargetGPAEvents(root, after) {
    let scope = root || document, refresh = typeof after == "function" ? after : refreshAllViews, uwInput = scope.querySelector("#target-uw-input"), wInput = scope.querySelector("#target-w-input"), clearBtn = scope.querySelector("#clear-target-btn"), modeSelect = scope.querySelector("#target-mode-select");
    if (!uwInput || !wInput) return;
    function applyTargets() {
      let uwVal = uwInput.value.trim(), wVal = wInput.value.trim();
      S.targetUWGPA = uwVal !== "" ? parseFloat(uwVal) : null, S.targetWGPA = wVal !== "" ? parseFloat(wVal) : null, S.targetUWGPA !== null && isNaN(S.targetUWGPA) && (S.targetUWGPA = null), S.targetWGPA !== null && isNaN(S.targetWGPA) && (S.targetWGPA = null);
      let maxGPA = computeOverallMaxGPA();
      S.targetUWGPA !== null && (S.targetUWGPA < 0 && (S.targetUWGPA = 0), maxGPA && S.targetUWGPA > maxGPA.uw && (S.targetUWGPA = maxGPA.uw)), S.targetWGPA !== null && (S.targetWGPA < 0 && (S.targetWGPA = 0), maxGPA && S.targetWGPA > maxGPA.w && (S.targetWGPA = maxGPA.w)), markDirty(), refresh();
    }
    function applyMode() {
      if (modeSelect) {
        S.targetGPAMode = modeSelect.value === "exam" ? "exam" : "subject";
        let maxGPA = computeOverallMaxGPA();
        S.targetUWGPA !== null && maxGPA && S.targetUWGPA > maxGPA.uw && (S.targetUWGPA = maxGPA.uw), S.targetWGPA !== null && maxGPA && S.targetWGPA > maxGPA.w && (S.targetWGPA = maxGPA.w), markDirty(), refresh();
      }
    }
    uwInput.addEventListener("blur", applyTargets), wInput.addEventListener("blur", applyTargets), uwInput.addEventListener("keypress", (e) => {
      e.key === "Enter" && (e.preventDefault(), applyTargets());
    }), wInput.addEventListener("keypress", (e) => {
      e.key === "Enter" && (e.preventDefault(), applyTargets());
    }), modeSelect && modeSelect.addEventListener("change", applyMode), clearBtn && clearBtn.addEventListener("click", () => {
      S.targetUWGPA = null, S.targetWGPA = null, uwInput.value = "", wInput.value = "", markDirty(), refresh();
    }), setTimeout(() => renderTargetGapSummary(scope), 100);
  }
  var _targetGapCache, _examDisplayCache, init_gpa_target = __esm({
    "v8.30/gpa-target.js"() {
      init_state();
      init_utils();
      init_ui();
      _targetGapCache = /* @__PURE__ */ new Map();
      _examDisplayCache = { focusSem: null, lockedGPA: null, curFocusGPA: null, computed: !1 };
    }
  });

  // v8.30/diagnose.js
  function recordError(label, err) {
    try {
      let msg = String(err && err.message || err).slice(0, 300);
      S._errors.push({ ts: Date.now(), label, msg }), S._errors.length > MAX_ERRORS && S._errors.shift();
    } catch (e) {
    }
  }
  function safe(label, fn, fallback) {
    try {
      return fn();
    } catch (e) {
      return recordError(label, e), console.error("[Better Intschool] " + label + " \u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF0C\u4E0D\u5F71\u54CD\u9875\u9762\uFF09:", e), fallback;
    }
  }
  async function safeAsync(label, fn, fallback) {
    try {
      return await fn();
    } catch (e) {
      return recordError(label, e), console.error("[Better Intschool] " + label + " \u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e), fallback;
    }
  }
  function guardListener(label, handler, capture) {
    return function(e) {
      try {
        return handler(e);
      } catch (err) {
        recordError(label, err), console.error("[Better Intschool] " + label + " \u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", err);
      }
    };
  }
  function _fmtTs(ts) {
    if (!ts) return "\u65E0";
    try {
      return new Date(ts).toLocaleString();
    } catch (e) {
      return String(ts);
    }
  }
  function _dataSnapshot() {
    let credits = [];
    try {
      for (let [k, v] of S.creditMap) credits.push(k + "=" + v);
    } catch (e) {
    }
    let starred = (S.originalCourses || []).filter((c) => c && c.showStar && (c.showStar.s1 || c.showStar.s2)).map((c) => c.name), zeroCredit = (S.originalCourses || []).filter((c) => c && !(c.credit > 0)).length, marks = Object.keys(S._taskMarks || {}), dt2 = S._deadlineAllTasks || [];
    return {
      creditMapSize: S.creditMap ? S.creditMap.size : 0,
      creditSample: credits.slice(0, 12).join(", ") + (credits.length > 12 ? " \u2026" : ""),
      courses: (S.originalCourses || []).length,
      zeroCredit,
      starred: starred.length + (starred.length ? " [" + starred.join(" | ") + "]" : ""),
      marks: marks.length,
      markIds: marks.slice(0, 12).join(","),
      ddlAll: dt2.length,
      ddlDetected: dt2.filter((x) => x.detected).length,
      ddlInferred: dt2.filter((x) => x.inferred && !x.ignored).length,
      ddlIgnored: dt2.filter((x) => x.ignored).length,
      ddlIgnoreStore: getTaskIgnoreCount(),
      ddlMarked: dt2.filter((x) => x.marked).length,
      ddlCacheAge: S._deadlineCache && S._deadlineCache.ts ? Math.round((Date.now() - S._deadlineCache.ts) / 1e3) + "s" : "\u65E0",
      yearCache: S.yearDataCache ? S.yearDataCache.size : 0,
      simCourses: (S.simCourses || []).length
    };
  }
  function _inlineSnapshot() {
    let absent = { colsExpanded: "\u672A\u68C0\u6D4B", synthCols: "-" };
    try {
      let fn = window.__INTS_DEBUG && window.__INTS_DEBUG.getInlineStats, st = typeof fn == "function" ? fn() : null;
      return !st || typeof st != "object" ? absent : {
        colsExpanded: typeof st.colsExpanded == "boolean" ? st.colsExpanded ? "\u5C55\u5F00" : "\u6536\u8D77" : absent.colsExpanded,
        synthCols: typeof st.synthCols == "number" && isFinite(st.synthCols) ? st.synthCols : absent.synthCols
      };
    } catch (e) {
      return absent;
    }
  }
  function _weightsSnapshot() {
    try {
      let courses = (S.simCourses && S.simCourses.length ? S.simCourses : S.originalCourses) || [];
      if (!courses.length) return ["  \uFF08\u8BFE\u7A0B\u6570\u636E\u8FD8\u6CA1\u52A0\u8F7D\uFF09"];
      let pct = (w) => w.map((x) => Math.round(x * 100) + "%").join("/"), bySubject = /* @__PURE__ */ new Map();
      for (let c of courses) {
        let raw = String(c.subject || c.name || ""), subject = c.subject || "(\u65E0\u5B66\u79D1\u540D\uFF0C\u6309\u8BFE\u7A0B\u540D\u5339\u914D)", rule = SUBJECT_WEIGHT_RULES.find((r) => {
          let s = raw.toLowerCase();
          return r.keywords.every((k) => s.includes(k));
        }), entry = bySubject.get(subject);
        entry || (entry = { subject, rule: rule ? rule.keywords.join("+") : "\u9ED8\u8BA4", w: getCourseWeights(raw), count: 0, starred: 0 }, bySubject.set(subject, entry)), entry.count++, c.showStar && (c.showStar.s1 || c.showStar.s2) && entry.starred++;
      }
      let out = [];
      for (let e of [...bySubject.values()].sort((a, b) => a.subject.localeCompare(b.subject)))
        out.push("  " + e.subject + " \u2192 " + e.rule + " [" + pct(e.w) + "]  \u8BFE\u7A0B " + e.count + (e.starred ? "  \u661F\u6807 " + e.starred : ""));
      return out.push("  \u89C4\u5219\u8868\u987A\u5E8F: " + SUBJECT_WEIGHT_RULES.map((r) => r.keywords.join("+")).join(" > ") + " > \u9ED8\u8BA4 [" + pct(DEFAULT_WEIGHTS) + "]"), out;
    } catch (e) {
      return ["  \u6743\u91CD\u5FEB\u7167\u5931\u8D25: " + (e && e.message || e)];
    }
  }
  async function _apiSnapshot() {
    let out = { gradeBook: "\u672A\u68C0\u6D4B", customColumns: "\u2014", columns: "\u2014", yearList: "\u672A\u68C0\u6D4B" };
    try {
      let years = await fetchSchoolYearList();
      out.yearList = years.length + " \u6761 [" + years.map((y) => y.value).join(", ") + "]";
    } catch (e) {
      out.yearList = "\u83B7\u53D6\u5931\u8D25: " + e.message;
    }
    try {
      let gb = await getGradeBookData(S.currentYearKey), items = gb && gb.gradeBookItems || [];
      out.gradeBook = items.length + " \u6761\u8BFE\u7A0B";
      let cols = gb && gb.customColumns || [];
      out.customColumns = cols.length + " \u5217", out.columns = cols.map((c) => c.customColumnName).join("/") || "\u2014", out.firstCourse = items[0] ? items[0].courseName + " (subject=" + (items[0].subject || "\u7A7A") + ", courseId=" + items[0].courseId + ")" : "\u2014";
    } catch (e) {
      out.gradeBook = "\u83B7\u53D6\u5931\u8D25: " + e.message;
    }
    return out;
  }
  async function buildDiagnosticReport() {
    let env = {
      version: typeof GM_info != "undefined" && GM_info.script && GM_info.script.version || "\u672A\u77E5",
      locale: getLocale(),
      url: location.pathname + location.search,
      ua: navigator.userAgent,
      viewport: window.innerWidth + "x" + window.innerHeight,
      token: getToken() ? "\u6709" : "\u65E0",
      schoolId: getSchoolId() ? "\u6709" : "\u65E0",
      markIcon: (function() {
        try {
          return localStorage.getItem("ints_mark_icon") || "\u9ED8\u8BA4(tag)";
        } catch (e) {
          return "?";
        }
      })(),
      autoCalibrate: (function() {
        try {
          return localStorage.getItem("ints_auto_calibrate") === "0" ? "\u5173\u95ED" : "\u5F00\u542F";
        } catch (e) {
          return "?";
        }
      })(),
      diagLog: isLogOn() ? "\u5F00\u542F" : "\u5173\u95ED",
      build: getBuildChannel() === "dev" ? "\u5F00\u53D1\u4EF6" : "\u53D1\u5E03\u4EF6"
    }, data = _dataSnapshot(), inline = _inlineSnapshot(), api = await _apiSnapshot(), errors = S._errors.slice(-5).map((e) => "  \xB7 [" + _fmtTs(e.ts) + "] " + e.label + ": " + e.msg), lines = [];
    lines.push("===== Better Intschool \u81EA\u68C0\u62A5\u544A ====="), lines.push("\u751F\u6210\u65F6\u95F4: " + _fmtTs(Date.now())), lines.push(""), lines.push("[\u73AF\u5883]"), lines.push("  \u7248\u672C: " + env.version + "\uFF08" + env.build + "\uFF09    \u754C\u9762\u8BED\u8A00: " + env.locale + "    \u6807\u8BB0\u56FE\u6807: " + env.markIcon), lines.push("  \u9875\u9762: " + env.url + "    \u89C6\u53E3: " + env.viewport), lines.push("  \u767B\u5F55\u6001: token=" + env.token + "  schoolId=" + env.schoolId), lines.push("  \u81EA\u52A8\u6821\u51C6: " + env.autoCalibrate + "    \u8BCA\u65AD\u65E5\u5FD7: " + env.diagLog + "\uFF08__INTS_LOG(1) \u53EF\u5F00\uFF09"), lines.push("  \u6D4F\u89C8\u5668: " + env.ua), lines.push(""), lines.push("[\u63A5\u53E3]"), lines.push("  \u5B66\u5E74\u5217\u8868: " + api.yearList), lines.push("  \u5F53\u524D\u5B66\u5E74: key=" + S.currentYearKey + " value=" + S.currentYearValue + " isCurrentYear=" + S.isCurrentYear), lines.push("  grade-book: " + api.gradeBook + "    customColumns: " + api.customColumns + " [" + api.columns + "]"), api.firstCourse && lines.push("  \u9996\u95E8\u8BFE\u7A0B: " + api.firstCourse), lines.push(""), lines.push("[\u6570\u636E]"), lines.push("  \u5B66\u5206\u6620\u5C04: " + data.creditMapSize + " \u6761    " + (data.creditSample || "\uFF08\u7A7A\uFF09")), lines.push("  \u8BFE\u7A0B: " + data.courses + " \u95E8\uFF08\u96F6\u5B66\u5206 " + data.zeroCredit + "\uFF09    \u661F\u6807\u79D1\u76EE: " + data.starred), lines.push("  \u624B\u52A8\u6807\u8BB0: " + data.marks + (data.markIds ? " [" + data.markIds + "]" : "")), lines.push("  DDL: \u5168\u90E8 " + data.ddlAll + " / \u68C0\u6D4B\u5230 " + data.ddlDetected + " / \u7EBF\u4E0B " + data.ddlInferred + " / \u6807\u8BB0 " + data.ddlMarked + " / \u5DF2\u5FFD\u7565 " + data.ddlIgnoreStore + "    \u7F13\u5B58\u5E74\u9F84: " + data.ddlCacheAge), lines.push("    \u5224\u5B9A: type=" + DEADLINE_ASSIGNMENT_TYPE + " \u4E14\u672A\u63D0\u4EA4\uFF1B\u7EBF\u4E0A\u21D2\u68C0\u6D4B\u5230\uFF0C\u7EBF\u4E0B\u4E14\u672A\u8BB0\u5206\u21D2\u7EBF\u4E0B\u4EFB\u52A1\uFF1B\u8BB0\u5206\u578B\uFF08\u4E0D\u7B97\u5F85\u529E\uFF09: " + DEADLINE_RECORD_ONLY_TYPES.join("/"));
    let typed = dt.filter((x) => x.inferred || x.detected).map((x) => x.typeName).filter(Boolean);
    return lines.push("    \u53D6\u5230\u7C7B\u578B\u7684\u5F85\u529E: " + typed.length + " \u6761" + (typed.length ? "\uFF08" + Array.from(new Set(typed)).join(" / ") + "\uFF09" : "\uFF08\u4E00\u6761\u90FD\u6CA1\u6709 \u21D2 \u53EF\u80FD grade-book \u91CC\u6CA1\u6709\u8FD9\u4E9B\u4EFB\u52A1\uFF09")), lines.push("  \u7F13\u5B58: \u5B66\u5E74 " + data.yearCache + " \u6761    \u6A21\u62DF\u8BFE\u7A0B " + data.simCourses + " \u95E8"), lines.push("  /points \u5185\u8054: \u8BE6\u60C5\uFF1A" + inline.colsExpanded + "    \u5408\u6210\u5217\u6570\uFF1A" + inline.synthCols), lines.push(""), lines.push("[\u6743\u91CD] \u5B66\u79D1 \u2192 \u547D\u4E2D\u89C4\u5219 [Homework/In-Class/Projects/Tests/Quizzes]"), _weightsSnapshot().forEach((l) => lines.push(l)), lines.push(""), lines.push("[\u5F02\u5E38\u8BB0\u5F55] " + S._errors.length + " \u6761" + (errors.length ? `
` + errors.join(`
`) : "\uFF08\u65E0\uFF09")), lines.push(""), lines.push('\u63D0\u793A: \u62A5\u544A\u4E0D\u542B token/schoolId \u660E\u6587\uFF1B\u5982\u67D0\u9879\u663E\u793A"\u83B7\u53D6\u5931\u8D25"\uFF0C\u591A\u534A\u662F\u767B\u5F55\u6001\u8FC7\u671F\u6216\u7F51\u7EDC\u95EE\u9898\u3002'), lines.join(`
`);
  }
  async function showDiagnostics() {
    let modalId = "ints-diag-modal", stale = document.getElementById(modalId);
    stale && stale.remove();
    let wrap = document.createElement("div");
    wrap.id = modalId, wrap.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:20100;display:flex;align-items:center;justify-content:center;";
    let panel = document.createElement("div");
    panel.style.cssText = "width:min(760px,92vw);max-height:86vh;background:#fff;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;", panel.innerHTML = '<div style="padding:12px 18px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;"><strong>' + t("\u81EA\u68C0\u8BCA\u65AD", "Diagnostics") + '</strong><button id="ints-diag-close" style="background:none;border:none;font-size:22px;cursor:pointer;">&times;</button></div><div style="padding:14px 18px;overflow:auto;flex:1;"><div id="ints-diag-body" style="font-size:13px;color:#555;">' + t("\u6B63\u5728\u68C0\u6D4B\u2026", "Checking\u2026") + '</div></div><div style="padding:10px 18px;border-top:1px solid #eee;display:flex;justify-content:flex-end;gap:10px;"><button id="ints-diag-copy" class="ant-btn ant-btn-primary" style="padding:5px 16px;">' + t("\u590D\u5236\u62A5\u544A", "Copy report") + "</button></div>", wrap.appendChild(panel), document.body.appendChild(wrap);
    let close = () => wrap.remove();
    panel.querySelector("#ints-diag-close").addEventListener("click", close), wrap.addEventListener("click", (e) => {
      e.target === wrap && close();
    });
    let report = await safeAsync("\u8BCA\u65AD\u62A5\u544A\u751F\u6210", buildDiagnosticReport, "\u62A5\u544A\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u63A7\u5236\u53F0"), body = panel.querySelector("#ints-diag-body");
    body.innerHTML = '<textarea id="ints-diag-text" readonly style="width:100%;height:52vh;font-family:Consolas,Menlo,monospace;font-size:12px;line-height:1.5;border:1px solid #e0e0e0;border-radius:6px;padding:10px;box-sizing:border-box;white-space:pre;overflow:auto;"></textarea>', body.querySelector("#ints-diag-text").value = report, panel.querySelector("#ints-diag-copy").addEventListener("click", () => {
      let ta = panel.querySelector("#ints-diag-text");
      ta.select();
      let ok = !1;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = !1;
      }
      !ok && navigator.clipboard && navigator.clipboard.writeText(ta.value).catch(() => {
      });
      let btn = panel.querySelector("#ints-diag-copy");
      btn.textContent = t("\u5DF2\u590D\u5236", "Copied"), setTimeout(() => {
        btn.textContent = t("\u590D\u5236\u62A5\u544A", "Copy report");
      }, 1500);
    });
  }
  var MAX_ERRORS, init_diagnose = __esm({
    "v8.30/diagnose.js"() {
      init_state();
      init_utils();
      init_log();
      init_deadline();
      init_api();
      init_courses();
      MAX_ERRORS = 20;
    }
  });

  // v8.30/win-shell.js
  function _isInteractive(node) {
    return !!(node && node.closest && node.closest('input,textarea,select,button,a,[contenteditable="true"]'));
  }
  function _container() {
    let el = document.querySelector(CONTAINER_SEL);
    if (!el) return null;
    try {
      getComputedStyle(el).position === "static" && (el.style.position = "relative");
    } catch (e) {
    }
    return el;
  }
  function _containerBox(win) {
    let c = win.container;
    return !c || !c.isConnected ? null : { visLeft: c.scrollLeft, visTop: c.scrollTop, clientW: c.clientWidth, clientH: c.clientHeight };
  }
  function _anchorBox(win) {
    let a = win.anchorEl, box = _containerBox(win);
    if (!a || !a.isConnected || !box) return null;
    let ar = a.getBoundingClientRect(), cr = win.container.getBoundingClientRect();
    return {
      left: ar.left - cr.left + box.visLeft,
      top: ar.top - cr.top + box.visTop,
      width: ar.width,
      visLeft: box.visLeft,
      visTop: box.visTop,
      clientW: box.clientW,
      clientH: box.clientH
    };
  }
  function _ensureHome(win) {
    win.container && !win.container.isConnected && (win.container = _container());
    let target = win.container || document.body;
    win.el.parentNode !== target && (win.el.style.position = win.container ? "absolute" : "fixed", target.appendChild(win.el));
  }
  function _place(win) {
    _ensureHome(win);
    let p = _anchorBox(win);
    return p ? (win.el.style.left = Math.round(p.left + win.dx) + "px", win.el.style.top = Math.round(p.top + win.dy) + "px", !0) : !1;
  }
  function _clamp(win, box, left, top) {
    let w = win.el.offsetWidth || 0, h = win.el.offsetHeight || 0;
    if (!box) return { left, top };
    let minL = box.visLeft + EDGE, maxL = Math.max(minL, box.visLeft + box.clientW - w - EDGE), minT = box.visTop + EDGE, maxT = Math.max(minT, box.visTop + box.clientH - Math.min(h, box.clientH) - EDGE);
    return {
      left: Math.min(Math.max(left, minL), maxL),
      top: Math.min(Math.max(top, minT), maxT)
    };
  }
  function _clampViewport(left, top, w, h) {
    return {
      left: Math.min(Math.max(left, EDGE), Math.max(EDGE, window.innerWidth - Math.min(w, window.innerWidth) - EDGE)),
      top: Math.min(Math.max(top, EDGE), Math.max(EDGE, window.innerHeight - Math.min(h, window.innerHeight) - EDGE))
    };
  }
  function _syncNow() {
    _syncCount++;
    for (let w of _wins) _place(w);
  }
  function getWindow(key) {
    return _wins.find((w) => w.key === key) || null;
  }
  function listWindows() {
    return _wins.slice();
  }
  function countWindows() {
    return _wins.length;
  }
  function openWindow(opts) {
    installShell();
    let key = String(opts.key), old = getWindow(key);
    if (old)
      return raiseWindow(key), opts.anchorEl && setWindowAnchor(key, opts.anchorEl), old.handle;
    let el = document.createElement("div");
    el.className = "ints-win" + (opts.className ? " " + opts.className : ""), el.setAttribute(WIN_ATTR, key), el.setAttribute("data-win-kind", opts.kind || "win"), opts.domId && (el.id = opts.domId), el.style.width = (opts.width || 340) + "px", el.style.zIndex = String(++_z > Z_WIN_MAX ? _z = Z_WIN_BASE + 1 : _z), el.innerHTML = '<div class="ints-win-head" title="' + escapeHtml(t("\u6309\u4F4F\u6807\u9898\u680F\u53EF\u76F4\u63A5\u62D6\u52A8\uFF1B\u6B63\u6587\u5904\u957F\u6309\u4E5F\u80FD\u62D6\uFF1B\u4E0D\u62D6\u65F6\u968F\u8868\u683C\u6EDA\u52A8", "Drag by the title bar, or long-press anywhere in the body")) + '"><div class="ints-win-title"></div><button type="button" class="ints-win-close" data-win-close="1" title="' + escapeHtml(t("\u5173\u95ED\uFF08Esc\uFF09", "Close (Esc)")) + '">&times;</button></div><div class="ints-win-body"></div>' + (opts.footerHTML ? '<div class="ints-win-foot"></div>' : "");
    let body = el.querySelector(".ints-win-body"), foot = el.querySelector(".ints-win-foot");
    el.querySelector(".ints-win-title").innerHTML = opts.titleHTML || "", body.innerHTML = opts.bodyHTML || "", foot && (foot.innerHTML = opts.footerHTML), opts.maxBodyHeight && (body.style.maxHeight = opts.maxBodyHeight);
    let win = {
      key,
      kind: opts.kind || "win",
      el,
      body,
      foot,
      anchorEl: opts.anchorEl || null,
      container: _container(),
      dx: 0,
      dy: 0,
      onClose: opts.onClose || null
    };
    win.container = win.container || null, el.style.position = win.container ? "absolute" : "fixed", (win.container || document.body).appendChild(el);
    let p = _anchorBox(win);
    if (p) {
      let w = el.offsetWidth, left = p.left + p.width + EDGE, top = p.top;
      left + w > p.visLeft + p.clientW - EDGE && (left = p.left - w - EDGE);
      let cl = _clamp(win, p, left, top);
      win.dx = Math.round(cl.left - p.left), win.dy = Math.round(cl.top - p.top), _place(win);
    } else if (win.anchorEl && win.anchorEl.isConnected) {
      let r = win.anchorEl.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, left = r.right + EDGE;
      left + w > window.innerWidth - EDGE && (left = Math.max(EDGE, r.left - w - EDGE));
      let cl = _clampViewport(left, r.top, w, h);
      el.style.left = Math.round(cl.left) + "px", el.style.top = Math.round(cl.top) + "px";
    } else
      el.style.left = EDGE + "px", el.style.top = EDGE + "px";
    let handle = {
      key,
      el,
      body,
      foot,
      setBody(html) {
        return body.innerHTML = html, body;
      },
      close() {
        closeWindow(key);
      }
    };
    return win.handle = handle, el.addEventListener("mousedown", guardListener("\u7A97\u53E3\u6309\u4E0B", (e) => {
      if (raiseWindow(key), e.target && e.target.closest && e.target.closest("[data-win-close]")) return;
      if (!!(e.target && e.target.closest && e.target.closest(".ints-win-head"))) {
        _armDrag(win, e, HEAD_TOL, 0);
        return;
      }
      _isInteractive(e.target) || _armDrag(win, e, MOVE_TOL, LONG_PRESS_MS);
    })), el.querySelector("[data-win-close]").addEventListener("click", guardListener("\u7A97\u53E3\u5173\u95ED", (e) => {
      e.preventDefault(), closeWindow(key);
    })), _wins.push(win), handle;
  }
  function closeWindow(key) {
    let i = _wins.findIndex((w) => w.key === String(key));
    if (i < 0) return !1;
    let win = _wins[i];
    _wins.splice(i, 1), _drag && _drag.key === win.key && _endDrag(!0), win.el.remove();
    try {
      win.onClose && win.onClose();
    } catch (e) {
    }
    return !0;
  }
  function closeTopWindow() {
    return _wins.length ? closeWindow(_wins[_wins.length - 1].key) : !1;
  }
  function closeAllWindows() {
    for (; _wins.length; ) closeWindow(_wins[_wins.length - 1].key);
  }
  function raiseWindow(key) {
    let i = _wins.findIndex((w) => w.key === String(key));
    if (i < 0) return;
    let win = _wins.splice(i, 1)[0];
    _wins.push(win);
    let zOfWin = (w) => parseInt(w.el.style.zIndex, 10) || 0, next = Math.max.apply(null, [Z_WIN_BASE].concat(_wins.map(zOfWin))) + 1;
    next > Z_WIN_MAX && (_wins.slice().sort((a, b) => zOfWin(a) - zOfWin(b)).forEach((w, k) => {
      w.el.style.zIndex = String(Z_WIN_BASE + 1 + k);
    }), next = Math.max.apply(null, [Z_WIN_BASE].concat(_wins.map(zOfWin))) + 1), win.el.style.zIndex = String(next), _z = next;
  }
  function setWindowAnchor(key, anchorEl) {
    let win = getWindow(key);
    !win || !anchorEl || (win.anchorEl = anchorEl, !(_drag && _drag.key === win.key) && _place(win));
  }
  function isInAnyWindow(node) {
    return !node || !node.closest ? !1 : !!node.closest("[" + WIN_ATTR + "]");
  }
  function getShellStats() {
    return {
      wins: _wins.length,
      syncs: _syncCount,
      moves: _moveCount,
      lastMove: _lastMove,
      dragging: !!_drag,
      dragMoved: !!(_drag && _drag.moved),
      installed: _installed
    };
  }
  function syncWindows() {
    _syncNow();
  }
  function getShellBounds() {
    let c = _container();
    return c ? { width: c.clientWidth, height: c.clientHeight } : { width: window.innerWidth, height: window.innerHeight };
  }
  function _winAlive(win) {
    return !!(win && win.el && win.el.isConnected && getWindow(win.key) === win);
  }
  function _armDrag(win, e, tol, holdMs) {
    if (e.button !== 0) return;
    _armCancel && _armCancel();
    let sx = e.clientX, sy = e.clientY, armed = holdMs === 0, finished = !1, timer = null;
    holdMs > 0 && (timer = setTimeout(() => {
      armed = !0;
    }, holdMs));
    let onMove = (ev) => {
      if (finished) return;
      let dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!armed) {
        if (Math.abs(dx) > tol || Math.abs(dy) > tol) {
          cleanup();
          return;
        }
        return;
      }
      if (Math.abs(dx) > tol || Math.abs(dy) > tol) {
        if (!_winAlive(win)) {
          cleanup();
          return;
        }
        _startDrag(win, sx, sy), _onDragMove(ev), cleanup();
      }
    }, onUp = () => cleanup();
    function cleanup() {
      finished || (finished = !0, clearTimeout(timer), document.removeEventListener("mousemove", onMove, !0), document.removeEventListener("mouseup", onUp, !0), _armCancel === cleanup && (_armCancel = null));
    }
    _armCancel = cleanup, document.addEventListener("mousemove", onMove, !0), document.addEventListener("mouseup", onUp, !0);
  }
  function _startDrag(win, sx, sy) {
    if (_drag || !_winAlive(win)) return;
    let el = win.el, r = el.getBoundingClientRect();
    _drag = { key: win.key, win, el, offX: sx - r.left, offY: sy - r.top, moved: !1 }, el.classList.add("ints-win-dragging"), log("[\u7A97\u53E3] \u5F00\u59CB\u62D6\u52A8 " + win.key), document.addEventListener("mousemove", _onDragMove, !0), document.addEventListener("mouseup", _onDragUp, !0);
  }
  function _onDragMove(e) {
    if (!_drag) return;
    _moveCount++;
    let { el, win, offX, offY } = _drag, w = el.offsetWidth, h = el.offsetHeight, left = e.clientX - offX, top = e.clientY - offY, box = _containerBox(win);
    if (box) {
      let cr = win.container.getBoundingClientRect();
      left = left - cr.left + box.visLeft, top = top - cr.top + box.visTop;
      let cl = _clamp(win, box, left, top);
      left = cl.left, top = cl.top;
    } else {
      let cl = _clampViewport(left, top, w, h);
      left = cl.left, top = cl.top;
    }
    el.style.left = Math.round(left) + "px", el.style.top = Math.round(top) + "px", _lastMove = Math.round(left) + "," + Math.round(top) + " (from " + Math.round(e.clientX) + "," + Math.round(e.clientY) + ")", _drag.moved = !0, e.cancelable && e.preventDefault();
  }
  function _endDrag(silent) {
    if (!_drag) return;
    let { el, win, moved } = _drag;
    if (document.removeEventListener("mousemove", _onDragMove, !0), document.removeEventListener("mouseup", _onDragUp, !0), el.classList.remove("ints-win-dragging"), _drag = null, !moved || silent) return;
    let p = _anchorBox(win);
    p && (win.dx = Math.round((parseFloat(el.style.left || "0") || 0) - p.left), win.dy = Math.round((parseFloat(el.style.top || "0") || 0) - p.top));
    let swallow = (ev) => {
      ev.stopPropagation(), ev.preventDefault(), document.removeEventListener("click", swallow, !0);
    };
    document.addEventListener("click", swallow, !0), setTimeout(() => document.removeEventListener("click", swallow, !0), 0);
  }
  function _onDragUp() {
    _endDrag(!1);
  }
  function installShell() {
    _installed || (_installed = !0, document.addEventListener("mousedown", guardListener("\u7A97\u53E3\u5916\u70B9\u5173\u95ED", (e) => {
      if (!_wins.length) return;
      let target = e.target;
      isInAnyWindow(target) || target && target.closest && target.closest(EXCLUDE_SEL) || closeTopWindow();
    }), !0), document.addEventListener("keydown", guardListener("\u7A97\u53E3 Esc \u5173\u95ED", (e) => {
      e.key !== "Escape" || !_wins.length || closeTopWindow();
    }), !0), window.addEventListener("resize", () => {
      try {
        _syncNow();
      } catch (e) {
      }
    }));
  }
  var WIN_ATTR, CONTAINER_SEL, LONG_PRESS_MS, MOVE_TOL, HEAD_TOL, Z_WIN_BASE, Z_WIN_MAX, EDGE, _z, _installed, _syncCount, _moveCount, _lastMove, _drag, _wins, EXCLUDE_SEL, _armCancel, init_win_shell = __esm({
    "v8.30/win-shell.js"() {
      init_utils();
      init_diagnose();
      init_log();
      WIN_ATTR = "data-ints-window", CONTAINER_SEL = ".ant-table-body", LONG_PRESS_MS = 250, MOVE_TOL = 10, HEAD_TOL = 3, Z_WIN_BASE = 30, Z_WIN_MAX = 39, EDGE = 6, _z = Z_WIN_BASE, _installed = !1, _syncCount = 0, _moveCount = 0, _lastMove = "", _drag = null, _wins = [], EXCLUDE_SEL = [
        "[data-ints-window]",
        "[data-ints-clickable]",
        "[data-ints-task]",
        "[data-ints-vtask-id]",
        '[id^="ints-inline-"]',
        ".virtual-task-modal",
        '[id^="ints-vt-"]',
        '[id^="intschool-deadline"]',
        ".intschool-deadline-tooltip-fixed",
        "#ints-help-float",
        ".ints-help-wrap",
        "#ints-overview-view"
      ].join(",");
      _armCancel = null;
    }
  });

  // v8.30/ui.js
  function getEffectiveMultiYearGPA(grade, semester, computedGPA) {
    let key = grade + "_" + semester, override = S.multiYearGPAOverrides[key];
    if (!override) return computedGPA;
    if (computedGPA) {
      let changed = !1;
      if (override.uw !== null && override.uw !== void 0 && to3SigFigs(override.uw) === to3SigFigs(computedGPA.uw) && (override.uw = null, changed = !0), override.w !== null && override.w !== void 0 && to3SigFigs(override.w) === to3SigFigs(computedGPA.w) && (override.w = null, changed = !0), changed && override.uw === null && override.w === null)
        return delete S.multiYearGPAOverrides[key], computedGPA;
    }
    let result = { uw: computedGPA ? computedGPA.uw : null, w: computedGPA ? computedGPA.w : null };
    return override.uw !== null && override.uw !== void 0 && (result.uw = override.uw), override.w !== null && override.w !== void 0 && (result.w = override.w), result;
  }
  function _anchorAnnualComponent(value, reportVal, computedOrigVal) {
    return value == null || reportVal == null || computedOrigVal == null ? value : reportVal + (value - computedOrigVal);
  }
  function multiYearAnnualOf(entry) {
    let computedOrig = computeAnnualGPA(entry.originalCourses, (c) => c.originalGrades.s1f, (c) => c.originalGrades.s2f), report = entry.annualGPA !== null && entry.annualGPA !== void 0 && entry.cumulativeGPA !== null && entry.cumulativeGPA !== void 0 ? { uw: entry.cumulativeGPA, w: entry.annualGPA } : null, simS1F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f), simS2F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f), effS1F = getEffectiveMultiYearGPA(entry.grade, "S1F", simS1F), effS2F = getEffectiveMultiYearGPA(entry.grade, "S2F", simS2F), simAnnual = computeAnnualFromSemesters(effS1F, effS2F), value = getEffectiveMultiYearGPA(entry.grade, "Annual", simAnnual);
    if (value && report && computedOrig) {
      let ov = S.multiYearGPAOverrides[entry.grade + "_Annual"] || {}, uwOverridden = ov.uw !== null && ov.uw !== void 0, wOverridden = ov.w !== null && ov.w !== void 0;
      value = {
        uw: uwOverridden ? value.uw : _anchorAnnualComponent(value.uw, report.uw, computedOrig.uw),
        w: wOverridden ? value.w : _anchorAnnualComponent(value.w, report.w, computedOrig.w)
      };
    }
    return { value, base: report || computedOrig, computedOrig, report };
  }
  function buildMultiYearGradeTable() {
    if (!S.multiYearEntries.length) return `<div style="padding:20px;text-align:center;">${t("\u6682\u65E0\u591A\u5E74\u7EA7\u6570\u636E", "No multi-year data")}</div>`;
    function formatEditableGPA(effective, orig, grade, semester) {
      let key = grade + "_" + semester, override = S.multiYearGPAOverrides[key] || {};
      function fmtVal(val, origVal, type, color) {
        let isOverride = override[type] !== null && override[type] !== void 0, diff = orig && origVal !== null && origVal !== void 0 && val !== null ? val - origVal : 0, diffStr = orig && origVal !== null && origVal !== void 0 && val !== null && Math.abs(diff) > 5e-3 ? " (" + formatDiff(diff) + ")" : "", style = isOverride ? "color:" + color + ";font-weight:bold;cursor:pointer;background:#fff3e0;padding:1px 4px;border-radius:3px;" : "cursor:pointer;", title = isOverride ? t("\u5DF2\u8986\u76D6(\u70B9\u51FB\u7F16\u8F91)", "Overridden (click to edit)") : val !== null ? t("\u70B9\u51FB\u7F16\u8F91GPA", "Click to edit GPA") : t("\u70B9\u51FB\u8BBE\u7F6EGPA", "Click to set GPA"), displayVal = val !== null ? val.toFixed(2) : "\u2014";
        return '<span class="my-gpa-editable" data-grade="' + grade + '" data-sem="' + semester + '" data-type="' + type + '" style="' + style + '" title="' + title + '">' + displayVal + "</span>" + diffStr;
      }
      let uw = effective ? effective.uw : override.uw !== null && override.uw !== void 0 ? override.uw : null, w = effective ? effective.w : override.w !== null && override.w !== void 0 ? override.w : null, origUW = orig ? orig.uw : null, origW = orig ? orig.w : null;
      return "UW: " + fmtVal(uw, origUW, "uw", "#1890ff") + " W: " + fmtVal(w, origW, "w", "#cf1322");
    }
    let html = '<div style="overflow-x:auto;max-width:100%;"><table style="border-collapse:collapse;font-size:13px;min-width:700px;">';
    html += '<thead><tr style="background:#fafafa;">', html += `<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;">${t("\u5E74\u7EA7", "Grade")}</th>`, html += '<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;">S1F GPA</th>', html += '<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;">S2F GPA</th>', html += `<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f9f9ff;">${t("\u5B66\u5E74GPA", "Annual GPA")}</th>`, html += "</tr></thead><tbody>";
    for (let entry of S.multiYearEntries) {
      let grade = entry.grade, origS1F = computeColumnGPASummary(entry.originalCourses, (c) => c.originalGrades.s1f), origS2F = computeColumnGPASummary(entry.originalCourses, (c) => c.originalGrades.s2f), ann = multiYearAnnualOf(entry), origAnnual = ann.base, simS1F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f), simS2F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f), effS1F = getEffectiveMultiYearGPA(grade, "S1F", simS1F), effS2F = getEffectiveMultiYearGPA(grade, "S2F", simS2F);
      html += "<tr>", html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;font-weight:600;">${grade}</td>`, html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f0f8ff;">${formatEditableGPA(effS1F, origS1F, grade, "S1F")}</td>`, html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f0f8ff;">${formatEditableGPA(effS2F, origS2F, grade, "S2F")}</td>`, html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f9f9ff;">${formatEditableGPA(ann.value, origAnnual, grade, "Annual")}</td>`, html += "</tr>";
    }
    html += "</tbody></table>";
    let allAnnuals = [];
    for (let entry of S.multiYearEntries) {
      let g = multiYearAnnualOf(entry).value;
      g && allAnnuals.push(g);
    }
    if (allAnnuals.length > 0) {
      let uwList = allAnnuals.map((g) => g.uw).filter((v) => v != null && !isNaN(v)), wList = allAnnuals.map((g) => g.w).filter((v) => v != null && !isNaN(v)), avgUW = uwList.length ? (uwList.reduce((s, v) => s + v, 0) / uwList.length).toFixed(2) : "\u2014", avgW = wList.length ? (wList.reduce((s, v) => s + v, 0) / wList.length).toFixed(2) : "\u2014";
      html += `<div id="multi-year-avg-gpa" style="margin-top:12px;font-size:13px;"><strong>${t("\u5E73\u5747GPA", "Average GPA")}:</strong> UW: ${avgUW} W: ${avgW}</div>`;
    }
    return html += "</div>", html;
  }
  function buildMultiYearChart() {
    let html = '<div style="padding:8px;text-align:center;position:relative;"><svg id="gpa-trend-svg" viewBox="0 0 500 400" style="max-width:100%;height:auto;background:#fff;"></svg></div>';
    return setTimeout(() => drawMultiYearChart(), 50), html;
  }
  function drawMultiYearChart() {
    let svg = document.getElementById("gpa-trend-svg");
    if (!svg) return;
    let dataHash = "";
    for (let entry of S.multiYearEntries) {
      let effective = multiYearAnnualOf(entry).value;
      dataHash += entry.grade + "|" + (effective ? effective.uw + "," + effective.w : "null") + ";";
    }
    if (svg.dataset.hash === dataHash) return;
    svg.dataset.hash = dataHash;
    let W = 500, H = 400, margin = { top: 25, right: 30, bottom: 40, left: 55 }, pw = W - margin.left - margin.right, ph = H - margin.top - margin.bottom, dataPoints = [];
    for (let entry of S.multiYearEntries) {
      let effective = multiYearAnnualOf(entry).value;
      effective ? dataPoints.push({ grade: entry.grade, uw: effective.uw, w: effective.w }) : dataPoints.push({ grade: entry.grade, uw: null, w: null });
    }
    let validPoints = dataPoints.filter((p) => p.uw !== null || p.w !== null), allNull = validPoints.length === 0, svgNS = "http://www.w3.org/2000/svg";
    if (svg.innerHTML = "", allNull) {
      let txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", W / 2), txt.setAttribute("y", H / 2), txt.setAttribute("text-anchor", "middle"), txt.setAttribute("fill", "#999"), txt.setAttribute("font-size", "14"), txt.textContent = t("\u6682\u65E0\u6210\u7EE9\u6570\u636E", "No grade data"), svg.appendChild(txt);
      return;
    }
    let allUWVals = validPoints.map((p) => p.uw).filter((v) => v !== null), allWVals = validPoints.map((p) => p.w).filter((v) => v !== null), allVals = [...allUWVals, ...allWVals], maxGPA = Math.max(...allVals, 4), yMax = Math.ceil(maxGPA * 1.15 / 0.5) * 0.5;
    yMax < 4.5 && (yMax = 4.5);
    let avgUW = allUWVals.length > 0 ? allUWVals.reduce((s, v) => s + v, 0) / allUWVals.length : null, avgW = allWVals.length > 0 ? allWVals.reduce((s, v) => s + v, 0) / allWVals.length : null;
    function xPos(i) {
      return margin.left + i / (dataPoints.length - 1 || 1) * pw;
    }
    function yPos(v) {
      return margin.top + ph - v / yMax * ph;
    }
    for (let v = 0; v <= yMax; v += 0.5) {
      let y = yPos(v), line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", margin.left), line.setAttribute("x2", W - margin.right), line.setAttribute("y1", y), line.setAttribute("y2", y), line.setAttribute("stroke", "#e8e8e8"), line.setAttribute("stroke-width", "0.5"), svg.appendChild(line);
      let txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", margin.left - 8), txt.setAttribute("y", y + 4), txt.setAttribute("text-anchor", "end"), txt.setAttribute("fill", "#666"), txt.setAttribute("font-size", "11"), txt.textContent = v.toFixed(1), svg.appendChild(txt);
    }
    for (let i = 0; i < dataPoints.length; i++) {
      let x = xPos(i), txt = document.createElementNS(svgNS, "text");
      if (txt.setAttribute("x", x), txt.setAttribute("y", H - margin.bottom + 18), txt.setAttribute("text-anchor", "middle"), txt.setAttribute("fill", "#333"), txt.setAttribute("font-size", "12"), txt.textContent = dataPoints[i].grade, svg.appendChild(txt), i > 0) {
        let tickLine = document.createElementNS(svgNS, "line");
        tickLine.setAttribute("x1", x), tickLine.setAttribute("x2", x);
        let baseY = margin.top + ph;
        tickLine.setAttribute("y1", baseY), tickLine.setAttribute("y2", baseY + 5), tickLine.setAttribute("stroke", "#ccc"), tickLine.setAttribute("stroke-width", "0.5"), svg.appendChild(tickLine);
      }
    }
    let baseLine = document.createElementNS(svgNS, "line");
    baseLine.setAttribute("x1", margin.left), baseLine.setAttribute("x2", W - margin.right), baseLine.setAttribute("y1", margin.top + ph), baseLine.setAttribute("y2", margin.top + ph), baseLine.setAttribute("stroke", "#999"), baseLine.setAttribute("stroke-width", "1"), svg.appendChild(baseLine);
    function drawAvgLine(val, color, label) {
      let y = yPos(val), line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", margin.left), line.setAttribute("x2", W - margin.right), line.setAttribute("y1", y), line.setAttribute("y2", y), line.setAttribute("stroke", color), line.setAttribute("stroke-width", "1"), line.setAttribute("stroke-dasharray", "5,4"), svg.appendChild(line);
      let txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", W - margin.right - 8), txt.setAttribute("y", y - 6), txt.setAttribute("text-anchor", "end"), txt.setAttribute("fill", color), txt.setAttribute("font-size", "10"), txt.textContent = `${label} avg ${val.toFixed(2)}`, svg.appendChild(txt);
    }
    avgUW !== null && drawAvgLine(avgUW, "#1890ff", "UW"), avgW !== null && drawAvgLine(avgW, "#cf1322", "W");
    let svgContainer = svg.parentNode, tooltip = svgContainer.querySelector(".chart-custom-tooltip");
    tooltip || (tooltip = document.createElement("div"), tooltip.className = "chart-custom-tooltip", tooltip.style.cssText = "display:none;position:absolute;z-index:10;pointer-events:none;background:rgba(0,0,0,0.8);color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;line-height:1.5;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);", svgContainer.appendChild(tooltip));
    function drawDataLine(getY, color, label) {
      let pts = [];
      for (let i = 0; i < dataPoints.length; i++) {
        let val = getY(dataPoints[i]);
        val !== null && pts.push(`${xPos(i).toFixed(1)},${yPos(val).toFixed(1)}`);
      }
      if (pts.length === 0) return;
      let polyline = document.createElementNS(svgNS, "polyline");
      polyline.setAttribute("points", pts.join(" ")), polyline.setAttribute("fill", "none"), polyline.setAttribute("stroke", color), polyline.setAttribute("stroke-width", "2"), polyline.setAttribute("stroke-linejoin", "round"), svg.appendChild(polyline);
      for (let i = 0; i < dataPoints.length; i++) {
        let val = getY(dataPoints[i]);
        if (val === null) continue;
        let cx = xPos(i), cy = yPos(val), grade = dataPoints[i].grade, dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", cx), dot.setAttribute("cy", cy), dot.setAttribute("r", "5"), dot.setAttribute("fill", color), dot.style.cursor = "pointer", dot.addEventListener("mouseenter", (e) => {
          let containerRect = svgContainer.getBoundingClientRect();
          tooltip.innerHTML = `<strong>${grade}</strong> ${label}: ${val.toFixed(2)}`, tooltip.style.display = "block";
          let tx = e.clientX - containerRect.left + 14, ty = e.clientY - containerRect.top - 30;
          tx + 120 > containerRect.width && (tx = e.clientX - containerRect.left - 120), ty < 0 && (ty = e.clientY - containerRect.top + 14), tooltip.style.left = tx + "px", tooltip.style.top = ty + "px";
        }), dot.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        }), svg.appendChild(dot);
        let inner = document.createElementNS(svgNS, "circle");
        inner.setAttribute("cx", cx), inner.setAttribute("cy", cy), inner.setAttribute("r", "2"), inner.setAttribute("fill", "#fff"), inner.style.pointerEvents = "none", svg.appendChild(inner);
      }
    }
    drawDataLine((p) => p.uw, "#1890ff", "UW"), drawDataLine((p) => p.w, "#cf1322", "W");
    let lg = document.createElementNS(svgNS, "g");
    lg.setAttribute("transform", `translate(${margin.left + 10}, ${margin.top})`);
    let r1 = document.createElementNS(svgNS, "rect");
    r1.setAttribute("x", 0), r1.setAttribute("y", 0), r1.setAttribute("width", 14), r1.setAttribute("height", 3), r1.setAttribute("fill", "#1890ff"), lg.appendChild(r1);
    let t1 = document.createElementNS(svgNS, "text");
    t1.setAttribute("x", 18), t1.setAttribute("y", 5), t1.setAttribute("fill", "#333"), t1.setAttribute("font-size", "11"), t1.textContent = "UW", lg.appendChild(t1);
    let r2 = document.createElementNS(svgNS, "rect");
    r2.setAttribute("x", 40), r2.setAttribute("y", 0), r2.setAttribute("width", 14), r2.setAttribute("height", 3), r2.setAttribute("fill", "#cf1322"), lg.appendChild(r2);
    let t22 = document.createElementNS(svgNS, "text");
    t22.setAttribute("x", 58), t22.setAttribute("y", 5), t22.setAttribute("fill", "#333"), t22.setAttribute("font-size", "11"), t22.textContent = "W", lg.appendChild(t22), svg.appendChild(lg);
  }
  function registerMultiYearHost(el) {
    el && _multiYearHosts.add(el);
  }
  function unregisterMultiYearHost(host) {
    host && _multiYearHosts.delete(host);
  }
  function renderMultiYearPanel(root) {
    let host = root;
    if (!host) return;
    let mainContainer = host.querySelector("#main-table-container"), taskContainer = host.querySelector("#task-panel-container");
    mainContainer && (mainContainer.innerHTML = buildMultiYearGradeTable()), taskContainer && (taskContainer.innerHTML = buildMultiYearChart()), attachMultiYearGPAEvents();
  }
  function attachMultiYearGPAEvents() {
    document.querySelectorAll(".my-gpa-editable").forEach((el) => {
      el.dataset.listenerMyGPA || (el.dataset.listenerMyGPA = "true", el.addEventListener("click", (e) => {
        e.stopPropagation();
        let grade = el.dataset.grade, sem = el.dataset.sem, type = el.dataset.type, currentVal = parseFloat(el.textContent);
        isNaN(currentVal) && (currentVal = "");
        let input = document.createElement("input");
        input.type = "number", input.value = currentVal, input.step = "0.01", input.style.cssText = "width:60px;padding:2px;text-align:center;font-size:12px;", el.innerHTML = "", el.appendChild(input), input.focus();
        let save = () => {
          let newVal = input.value.trim(), num = null;
          newVal !== "" && (num = parseFloat(newVal), (isNaN(num) || num < 0 || num > 5) && (num = null)), onMultiYearGPAChange(grade, sem, type, num);
        };
        input.addEventListener("blur", save), input.addEventListener("keypress", (ev) => {
          ev.key === "Enter" && save();
        });
      }));
    });
  }
  function onMultiYearGPAChange(grade, semester, type, newVal) {
    let key = grade + "_" + semester, override = S.multiYearGPAOverrides[key];
    override || (override = { uw: null, w: null }, S.multiYearGPAOverrides[key] = override);
    let entry = S.multiYearEntries.find((e) => e.grade === grade), simGPA = null;
    if (entry) {
      if (semester === "S1F") simGPA = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f);
      else if (semester === "S2F") simGPA = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f);
      else if (semester === "Annual") {
        let s1f = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f), s2f = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f), effS1F = getEffectiveMultiYearGPA(grade, "S1F", s1f), effS2F = getEffectiveMultiYearGPA(grade, "S2F", s2f);
        simGPA = computeAnnualFromSemesters(effS1F, effS2F);
      }
    }
    let simVal = simGPA && type === "uw" ? simGPA.uw : simGPA && type === "w" ? simGPA.w : null;
    newVal !== null && simVal !== null && to3SigFigs(newVal) === to3SigFigs(simVal) ? (override[type] = null, override.uw === null && override.w === null && delete S.multiYearGPAOverrides[key]) : override[type] = newVal, renderAllMultiYearHosts(), markDirty();
    let gradeLabel = grade || "";
    showOverrideWarning(t("\u5DF2\u66F4\u65B0 " + gradeLabel + " " + semester + " " + type.toUpperCase() + " GPA\u8986\u76D6", "Updated " + gradeLabel + " " + semester + " " + type.toUpperCase() + " GPA override"));
  }
  function setCourseChangeListener(fn) {
    _courseChangeListener = fn;
  }
  function notifyCourseChanged(courseIdx) {
    if (_courseChangeListener)
      try {
        _courseChangeListener(courseIdx);
      } catch (e) {
        console.error("[\u6E32\u67D3] \u8BFE\u7A0B\u53D8\u5316\u76D1\u542C\u5668\u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
      }
  }
  function notifyAllCoursesChanged() {
    if (_courseChangeListener)
      try {
        _courseChangeListener(-1);
      } catch (e) {
        console.error("[\u6E32\u67D3] \u8BFE\u7A0B\u53D8\u5316\u76D1\u542C\u5668\u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
      }
  }
  function refreshAllViews() {
    invalidateTargetGapCache(), notifyAllCoursesChanged(), renderAllMultiYearHosts();
  }
  function safeRenderMultiYear(h) {
    try {
      renderMultiYearPanel(h);
    } catch (e) {
      console.error("[\u6E32\u67D3] \u591A\u5E74\u7EA7\u89C6\u56FE\u5237\u65B0\u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
    }
  }
  function renderAllMultiYearHosts() {
    _multiYearHosts.forEach((h) => {
      document.contains(h) && safeRenderMultiYear(h);
    });
  }
  function onTaskScoreChange(courseIdx, taskIdx, newScore) {
    if (!S.isCurrentYear) return;
    let course = S.simCourses[courseIdx];
    if (!course || !course.tasks[taskIdx]) return;
    let task = course.tasks[taskIdx], taskTerm = getTermFromDate(task.endDate, task.termRaw);
    if (taskTerm === "S1" && course.showStar.s1 || taskTerm === "S2" && course.showStar.s2) {
      showOverrideWarning(t("\u8BE5\u79D1\u76EE\u5DF2\u6807\u8BB0\u661F\u6807\uFF0C\u7981\u6B62\u7F16\u8F91\u4EFB\u52A1\u5F97\u5206\u3002\u8BF7\u76F4\u63A5\u4FEE\u6539P\u6216E\u6210\u7EE9\u3002", "Starred subject, task editing disabled. Edit P/E directly."));
      return;
    }
    if (newScore === null || newScore === "") task.simulatedScore = null;
    else {
      let num = parseFloat(newScore);
      if (isNaN(num)) return;
      if (num === -1) task.simulatedScore = -1;
      else if (num >= 0)
        task.topScore !== null && num > task.topScore && (num = task.topScore), task.simulatedScore = num;
      else return;
    }
    taskTerm === "S1" && course.overrideP.s1 !== null ? course.overrideP.s1 = null : taskTerm === "S2" && course.overrideP.s2 !== null && (course.overrideP.s2 = null), recalcCourseTerm(course, "s1"), recalcCourseTerm(course, "s2"), markDirty(), notifyCourseChanged(courseIdx);
  }
  function onExamScoreChange(courseIdx, term, newScore) {
    if (!S.isCurrentYear) return;
    let course = S.simCourses[courseIdx];
    if (!course) return;
    let num = null;
    if (newScore !== null && newScore !== "") {
      if (num = parseFloat(newScore), isNaN(num)) return;
      num > 100 && (num = 100), num < 0 && (num = 0);
    }
    term === "S1" ? course.simGrades.s1e = num : course.simGrades.s2e = num, recalcCourseTerm(course, term === "S1" ? "s1" : "s2"), markDirty(), notifyCourseChanged(courseIdx);
  }
  function onPStarChange(courseIdx, term, newScore) {
    if (!S.isCurrentYear) return;
    let course = S.simCourses[courseIdx];
    if (!course) return;
    let num = null;
    if (newScore !== null && newScore !== "") {
      if (num = parseFloat(newScore), isNaN(num)) return;
      num > 100 && (num = 100), num < 0 && (num = 0);
    }
    term === "S1" ? (course.overrideP.s1 = num, recalcCourseTerm(course, "s1"), showOverrideWarning(t(
      course.name + " S1\u5E73\u65F6\u6210\u7EE9\u5DF2\u624B\u52A8\u8BBE\u7F6E\u4E3A " + (num !== null ? formatScorePrecision(num) : "\u2014") + "\uFF0C\u5C06\u5FFD\u7565\u8BE5\u5B66\u671F\u4EFB\u52A1\u8BA1\u7B97",
      course.name + " S1 manual override set to " + (num !== null ? formatScorePrecision(num) : "\u2014")
    ))) : (course.overrideP.s2 = num, recalcCourseTerm(course, "s2"), showOverrideWarning(t(
      course.name + " S2\u5E73\u65F6\u6210\u7EE9\u5DF2\u624B\u52A8\u8BBE\u7F6E\u4E3A " + (num !== null ? formatScorePrecision(num) : "\u2014") + "\uFF0C\u5C06\u5FFD\u7565\u8BE5\u5B66\u671F\u4EFB\u52A1\u8BA1\u7B97",
      course.name + " S2 manual override set to " + (num !== null ? formatScorePrecision(num) : "\u2014")
    ))), markDirty(), notifyCourseChanged(courseIdx);
  }
  function showOverrideWarning(msg) {
    console.log("[\u63D0\u793A] " + msg);
  }
  function resetMultiYearSim() {
    if (!S.multiYearEntries || !S.multiYearEntries.length) return !1;
    S.multiYearGPAOverrides = {};
    for (let entry of S.multiYearEntries)
      entry.yearKey !== null && entry.yearKey !== void 0 && String(entry.yearKey) === String(S.currentYearKey) && S.simCourses && S.simCourses.length || (entry.simCourses = initMultiYearSimCourses(entry.originalCourses));
    for (let [, mc] of S.multiYearCourseMap)
      for (let [grade, yd] of Object.entries(mc.years)) {
        let entry = S.multiYearEntries[yd.entryIdx], course = entry && entry.simCourses ? entry.simCourses[yd.courseIdx] : null;
        !course || !course.simGrades || (yd.s1fSim = course.simGrades.s1f, yd.s2fSim = course.simGrades.s2f);
      }
    return _multiYearHosts.forEach((h) => {
      document.contains(h) && safeRenderMultiYear(h);
    }), !0;
  }
  function resetSimulations() {
    let calibCounts = S._autoCalibrateCounts, snapStars = (arr) => (arr || []).map((c) => c && c.showStar ? { s1: !!c.showStar.s1, s2: !!c.showStar.s2 } : null), simStars = snapStars(S.simCourses), origStars = snapStars(S.originalCourses), clearedMultiYear = resetMultiYearSim();
    if (S.isCurrentYear) {
      S.virtualTaskIdCounter = -1, initSimCourses();
      let keyStr = String(S.currentYearKey), existingCache = S.yearDataCache.get(keyStr) || {};
      existingCache.originalCourses = S.originalCourses, existingCache.simCourses = S.simCourses, existingCache.virtualTaskIdCounter = S.virtualTaskIdCounter, S.yearDataCache.set(keyStr, existingCache);
      for (let i = 0; i < S.simCourses.length; i++) {
        let orig = S.originalCourses[i];
        syncBaselineToSim(S.simCourses[i], orig);
      }
    } else if (!clearedMultiYear)
      return;
    calibCounts && (S._autoCalibrateCounts = calibCounts);
    let putStars = (arr, snap) => (arr || []).forEach((c, i) => {
      c && c.showStar && snap[i] && (c.showStar.s1 = snap[i].s1, c.showStar.s2 = snap[i].s2);
    });
    putStars(S.simCourses, simStars), putStars(S.originalCourses, origStars), S.warningTimeout && clearTimeout(S.warningTimeout), flushSave(!0), notifyAllCoursesChanged();
  }
  function refreshSubjectDetailWindows() {
    for (let win of listWindows()) {
      if (win.kind !== DETAIL_KIND) continue;
      let fn = _detailRenders.get(win.key);
      if (fn)
        try {
          fn();
        } catch (e) {
          console.error("[\u660E\u7EC6] \u91CD\u753B\u5931\u8D25\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
        }
    }
  }
  function _detailTitleHTML(course, filterText) {
    return "<div>" + t("\u79D1\u76EE\u660E\u7EC6\u6A21\u62DF", "Subject Detail Simulation") + helpIcon(
      `\u7F16\u8F91\u5404\u7C7B\u578B\u7D2F\u8BA1\u5F97\u5206\u6A21\u62DF\u5E73\u65F6\u6210\u7EE9\u53D8\u5316\u3002
\u70B9\u51FB"\u5173\u95ED\u5E76\u5E94\u7528"\u65F6\u5C06\u5DEE\u503C\u5199\u5165\u4E3B\u8868\u683C\u7684P\u5217\u8986\u76D6\u3002
\u5B66\u671F\u7B5B\u9009\u4E0E\u6210\u7EE9\u518C\u9875\u9762\u4E00\u81F4\u3002`,
      `Edit category totals to simulate P score changes. 
 Click "Close & Apply" to write differences to the main table P column. 
 The semester filter matches the one on the grade book page.`,
      !0
    ) + '</div><div style="color:rgba(0,0,0,0.55);font-size:11px;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(course.name) + '<span style="margin-left:8px;">' + t("\u5B66\u671F\u7B5B\u9009: ", "Semester filter: ") + escapeHtml(filterText) + "</span></div>";
  }
  function showSubjectDetailModal(courseIdx, anchorEl) {
    if (!S.isCurrentYear) return;
    let course0 = S.simCourses[courseIdx];
    if (!course0) {
      console.warn("[\u660E\u7EC6] \u8BFE\u7A0B\u4E0B\u6807 " + courseIdx + " \u4E0D\u5B58\u5728");
      return;
    }
    let ident = courseIdent(course0), key = DETAIL_KIND + ":" + ident, filter = S.currentFilter;
    if (getWindow(key)) {
      raiseWindow(key), anchorEl && setWindowAnchor(key, anchorEl), refreshSubjectDetailWindows();
      return;
    }
    let editorWin = getWindow("editor:" + ident), anchor = anchorEl || editorWin && editorWin.anchorEl || null, filterText = filter === "s1" ? t("\u4EC5S1", "S1 only") : filter === "s2" ? t("\u4EC5S2", "S2 only") : t("\u5168\u90E8\u5B66\u671F", "All semesters"), handle = openWindow({
      key,
      kind: DETAIL_KIND,
      domId: "ints-subject-detail-" + courseIdx,
      anchorEl: anchor,
      width: 560,
      // 卡片可能很高：内容区按表格滚动容器的高度限高（超出在窗口内滚动，免得窗口高过容器被裁掉）
      maxBodyHeight: Math.max(160, Math.round(getShellBounds().height - 72)) + "px",
      titleHTML: _detailTitleHTML(course0, filterText),
      // 保留老类名 subject-detail-modal：styles.js / darkmode.js 里有对应规则
      className: "subject-detail-modal",
      bodyHTML: '<div class="iw-note">' + t("\u6B63\u5728\u8BA1\u7B97\u2026", "Computing\u2026") + "</div>",
      footerHTML: '<button type="button" data-detail-act="apply" class="ant-btn ant-btn-link" style="color:#1890ff;">' + iconCheck() + "<span>" + t("\u5173\u95ED\u5E76\u5E94\u7528\u6A21\u62DF", "Close & Apply") + "</span></button>",
      onClose: () => {
        _detailRenders.delete(key);
      }
    });
    handle.el.setAttribute("data-ie-ident", ident), handle.el.setAttribute("data-ie-ci", String(courseIdx)), safe("\u5E2E\u52A9\u6D6E\u5C42\u5B89\u88C5", () => setupHelpTooltip());
    let st = { course: null, ci: courseIdx, termData: null, edits: { S1: {}, S2: {} } };
    function syncState() {
      let i = S.simCourses.findIndex((c) => courseIdent(c) === ident);
      if (i < 0) return !1;
      st.ci = i, st.course = S.simCourses[i];
      let course = st.course, termData = {
        S1: { origScores: Array(5).fill(0), simScores: Array(5).fill(0), maxScores: Array(5).fill(0), origP: course.originalGrades.s1p, overridden: (course.overrideP || {}).s1 !== null && (course.overrideP || {}).s1 !== void 0 },
        S2: { origScores: Array(5).fill(0), simScores: Array(5).fill(0), maxScores: Array(5).fill(0), origP: course.originalGrades.s2p, overridden: (course.overrideP || {}).s2 !== null && (course.overrideP || {}).s2 !== void 0 }
      };
      for (let term of ["S1", "S2"]) {
        let origAgg = aggregateCategoriesFromTasks(course.tasks, term, !1), simAgg = aggregateCategoriesFromTasks(course.tasks, term, !0);
        for (let i2 = 0; i2 < 5; i2++)
          termData[term].origScores[i2] = origAgg[i2].score, termData[term].simScores[i2] = simAgg[i2].score, termData[term].maxScores[i2] = Math.max(origAgg[i2].max, simAgg[i2].max);
        let mine = st.edits[term];
        for (let k in mine) {
          let idx = parseInt(k, 10);
          !isNaN(idx) && termData[term].simScores[idx] !== void 0 && (termData[term].simScores[idx] = mine[k]);
        }
      }
      return st.termData = termData, !0;
    }
    function computePStar(term) {
      let catData = [];
      for (let i = 0; i < 5; i++) catData.push({ score: st.termData[term].simScores[i], max: st.termData[term].maxScores[i] });
      return calcPFromCategoryData(catData, st.course.subject || st.course.name);
    }
    function render() {
      if (!syncState()) {
        handle.setBody('<div class="iw-err">' + escapeHtml(t("\u8BE5\u8BFE\u7A0B\u5DF2\u4E0D\u5728\u5F53\u524D\u5B66\u5E74\uFF0C\u7A97\u53E3\u4E0D\u518D\u53EF\u7528\u3002", "This course is no longer in the current year.")) + "</div>");
        return;
      }
      let course = st.course, termData = st.termData, weights = getCourseWeights(course.subject || course.name), showStar = course.showStar || { s1: !1, s2: !1 }, termsToShow = filter === "all" ? ["S1", "S2"] : filter === "s1" ? ["S1"] : ["S2"], html = "";
      for (let term of termsToShow) {
        let tData = termData[term];
        if (!(tData.maxScores.some((s) => s > 0) || tData.origP !== null)) continue;
        let pStar = computePStar(term), origP = tData.origP, pDiff = pStar !== null && origP !== null ? pStar - origP : null, pGPA = getGPAForScore(pStar, course.weightBonus), origPGPA = getGPAForScore(origP, course.weightBonus), isOverridden = tData.overridden, isStarred = term === "S1" && showStar.s1 || term === "S2" && showStar.s2, canEdit = !isOverridden && !isStarred;
        html += '<div class="iw-card"><div class="iw-card-head">' + term + " " + t("\u5B66\u671F", "Semester") + helpIcon(
          `\u663E\u793A\u8BE5\u5B66\u671F\u5404\u4EFB\u52A1\u7C7B\u578B\u5F53\u524D\u7684\u7D2F\u8BA1\u5F97\u5206\u4E0E\u603B\u5206\u3002
\u6709\u6A21\u62DF\u65F6\u6309\u65B9\u5411\u7740\u8272\u5E76\u5728\u62EC\u53F7\u91CC\u7ED9\u51FA\u53D8\u5316\u91CF\uFF0C\u9F20\u6807\u60AC\u505C\u53EF\u770B\u539F\u59CB\u503C\u3002
\u70B9\u51FB\u6570\u503C\u53EF\u7F16\u8F91\u5BF9\u5E94\u7C7B\u578B\u7684\u7D2F\u8BA1\u5F97\u5206\uFF0C\u5173\u95ED\u672C\u7A97\u53E3\u65F6\u5C06\u5DEE\u503C\u5199\u5165\u4E3B\u8868\u683CP\u5217\u8986\u76D6\u3002`,
          `Shows the current cumulative scores and totals for each task type in this semester. 
 Simulated values are colored by direction with the change in brackets; hover to see the original. 
 Click a value to edit that category total; closing this dialog writes the difference to the main table P column override.`,
          !0
        ) + (isStarred ? ' <span style="color:#d4380d;">\u26A0\uFE0F ' + t("\u661F\u6807\u79D1\u76EE\uFF0C\u660E\u7EC6\u6A21\u62DF\u5DF2\u7981\u7528", "Starred subject, detail simulation disabled") + "</span>" : "") + '</div><table class="iw-table"><thead><tr><th>' + t("\u4EFB\u52A1\u7C7B\u578B", "Task Type") + "</th><th>" + t("\u7D2F\u8BA1/\u603B\u5206 (\u767E\u5206\u6BD4)", "Total/Max (Percent)") + "</th></tr></thead><tbody>";
        for (let i = 0; i < TYPE_NAMES.length; i++) {
          if (weights[i] <= 0) continue;
          let maxScore = tData.maxScores[i], origScore = tData.origScores[i], simScore = tData.simScores[i], label = escapeHtml(TYPE_NAMES[i]);
          if (!(maxScore > 0)) {
            html += "<tr><td>" + label + '</td><td class="iw-num"><span class="iw-locked">' + t("\u65E0\u6570\u636E", "No data") + "</span></td></tr>";
            continue;
          }
          let d = typeof simScore == "number" && typeof origScore == "number" ? simScore - origScore : 0, changed = Math.abs(d) >= DETAIL_DELTA_EPS, pct = (simScore / maxScore * 100).toFixed(2), origPct = (origScore / maxScore * 100).toFixed(2), valueHtml = escapeHtml(simScore + "/" + maxScore) + (changed ? ' <span style="font-size:11px;">(' + (d > 0 ? "+" : "") + d.toFixed(2) + ")</span>" : ""), styleAttr = changed ? ' style="color:' + (d > 0 ? DETAIL_COLOR_UP : DETAIL_COLOR_DOWN) + ';"' : "", titleAttr = ' title="' + escapeHtml(t("\u539F\u59CB ", "was ") + origScore + "/" + maxScore + " (" + origPct + "%)") + '"';
          html += "<tr><td>" + label + '</td><td class="iw-num">' + (canEdit ? '<span class="iw-sim-cell"' + styleAttr + titleAttr + ' data-detail-edit="' + i + '" data-detail-term="' + term + '" data-detail-max="' + maxScore + '">' + valueHtml + "</span>" : '<span class="iw-locked"' + titleAttr + ">" + valueHtml + "</span>") + ' <span class="iw-note">' + pct + "%</span></td></tr>";
        }
        let pStarGPAstr = pGPA ? formatGPA(pGPA) : "\u2014", origPGPAstr = origPGPA ? formatGPA(origPGPA) : "\u2014", deltaStr = "";
        pDiff !== null && pGPA && origPGPA && (deltaStr = "\u0394 UW: " + formatDiff(pGPA.uw - origPGPA.uw) + "  \u0394 W: " + formatDiff(pGPA.w - origPGPA.w));
        let pShown = pStar !== null ? pStar : origP, pChanged = pDiff !== null && Math.abs(pDiff) >= DETAIL_DELTA_EPS, pValHtml = (pShown === null ? "\u2014" : pShown.toFixed(2)) + (pChanged ? ' <span style="font-size:11px;">(' + (pDiff > 0 ? "+" : "") + pDiff.toFixed(2) + ")</span>" : ""), pTitle = escapeHtml(t("\u539F\u59CB ", "was ") + (origP === null ? "\u2014" : origP.toFixed(2)) + " \xB7 " + origPGPAstr);
        html += '<tr class="iw-prow"><td>' + t("\u5E73\u65F6\u6210\u7EE9 (P)", "Performance (P)") + '</td><td class="iw-num"><span' + (pChanged ? ' style="color:' + (pDiff > 0 ? DETAIL_COLOR_UP : DETAIL_COLOR_DOWN) + ';"' : "") + ' title="' + pTitle + '">' + pValHtml + '</span><br><span class="iw-note">' + escapeHtml(pStarGPAstr) + "</span>" + (deltaStr ? '<div class="iw-note" style="font-size:11px;">' + deltaStr + "</div>" : "") + "</td></tr>", html += "</tbody></table>", isOverridden && (html += '<div class="iw-warn">' + t("\u26A0\uFE0F \u8BE5\u5B66\u671F\u5DF2\u5728\u4E3B\u8868\u683C\u624B\u52A8\u8BBE\u7F6E\u5E73\u65F6\u6210\u7EE9\uFF0C\u672C\u5904\u7F16\u8F91\u5DF2\u7981\u7528\u3002", "\u26A0\uFE0F Manual override exists for this semester, editing disabled.") + "</div>"), isStarred && !isOverridden && (html += '<div class="iw-warn">' + t("\u26A0\uFE0F \u8BE5\u79D1\u76EE\u5DF2\u6807\u8BB0\u661F\u6807\uFF0C\u660E\u7EC6\u6A21\u62DF\u7F16\u8F91\u5DF2\u7981\u7528\u3002\u8BF7\u76F4\u63A5\u5728\u4E3B\u8868\u683C\u7F16\u8F91P/E\u3002", "\u26A0\uFE0F Starred subject, detail simulation disabled. Edit P/E in main table.") + "</div>"), html += "</div>";
      }
      html || (html = '<div class="iw-note">' + t("\u8BE5\u7B5B\u9009\u4E0B\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6570\u636E\u3002", "No data to show for this filter.") + "</div>"), handle.setBody(html);
    }
    function closeAndApply() {
      if (!syncState()) {
        closeWindow(key);
        return;
      }
      let course = st.course, termData = st.termData, showStar = course.showStar || { s1: !1, s2: !1 };
      for (let term of ["S1", "S2"]) {
        let tData = termData[term];
        if (tData.overridden || term === "S1" && showStar.s1 || term === "S2" && showStar.s2) continue;
        let newPStar = computePStar(term), origP = tData.origP, shouldSet = !1;
        newPStar !== null ? (origP === null || Math.abs(newPStar - origP) > 1e-3) && (shouldSet = !0) : origP !== null && (shouldSet = !0), shouldSet ? term === "S1" ? course.overrideP.s1 !== newPStar && (course.overrideP.s1 = newPStar) : course.overrideP.s2 !== newPStar && (course.overrideP.s2 = newPStar) : (term === "S1" && course.overrideP.s1 !== null && (course.overrideP.s1 = null), term === "S2" && course.overrideP.s2 !== null && (course.overrideP.s2 = null));
      }
      recalcCourseTerm(course, "s1"), recalcCourseTerm(course, "s2"), markDirty(), notifyCourseChanged(st.ci), showOverrideWarning(t(`\u5DF2\u5E94\u7528\u79D1\u76EE"${course.name}"\u7684\u5B50\u9762\u677F\u6A21\u62DF\uFF08\u5E73\u65F6\u6210\u7EE9\u8986\u76D6\uFF09`, `Applied subject "${course.name}" simulation from detail panel`)), closeWindow(key);
    }
    let applyBtn = handle.foot && handle.foot.querySelector('[data-detail-act="apply"]');
    applyBtn && applyBtn.addEventListener("click", guardListener("\u660E\u7EC6\u5173\u95ED\u5E76\u5E94\u7528", () => safe("\u660E\u7EC6\u5E94\u7528", closeAndApply))), handle.body.addEventListener("click", guardListener("\u660E\u7EC6\u6539\u6A21\u62DF\u503C", (e) => {
      let cell = e.target && e.target.closest ? e.target.closest("[data-detail-edit]") : null;
      if (!cell || !st.termData) return;
      e.stopPropagation();
      let term = cell.getAttribute("data-detail-term"), catIdx = parseInt(cell.getAttribute("data-detail-edit"), 10), maxScore = parseFloat(cell.getAttribute("data-detail-max"));
      if (!(maxScore > 0) || isNaN(catIdx)) return;
      let tData = st.termData[term];
      if (!tData || tData.overridden) return;
      let showStar = st.course && st.course.showStar || { s1: !1, s2: !1 };
      if (term === "S1" && showStar.s1 || term === "S2" && showStar.s2) return;
      let cur = tData.simScores[catIdx];
      cell.innerHTML = "";
      let input = document.createElement("input");
      input.type = "number", input.className = "iw-input", input.value = cur == null ? "" : String(cur), cell.appendChild(input);
      try {
        input.focus(), input.select();
      } catch (err) {
      }
      let done = !1, save = () => {
        if (done) return;
        done = !0;
        let num = parseFloat(input.value);
        if (!isNaN(num)) {
          let v = Math.min(Math.max(num, 0), maxScore);
          tData.simScores[catIdx] = v, st.edits[term][catIdx] = v;
        }
        render();
      };
      input.addEventListener("blur", guardListener("\u660E\u7EC6\u6A21\u62DF\u63D0\u4EA4", save)), input.addEventListener("keydown", guardListener("\u660E\u7EC6\u6A21\u62DF\u952E\u76D8", (ev) => {
        ev.key === "Enter" ? (ev.preventDefault(), save()) : ev.key === "Escape" && (done = !0, render());
      }));
    })), _detailRenders.set(key, render);
    try {
      render();
    } catch (e) {
      let msg = t("\u6E32\u67D3\u5931\u8D25\uFF1A", "Render failed: ") + (e && e.message || e);
      handle.setBody('<div class="iw-err">' + escapeHtml(msg) + "</div>"), console.error("[\u660E\u7EC6] \u6E32\u67D3\u5931\u8D25:", e), recordError("\u79D1\u76EE\u660E\u7EC6\u6E32\u67D3", e);
    }
  }
  var _multiYearHosts, _courseChangeListener, DETAIL_KIND, _detailRenders, DETAIL_COLOR_UP, DETAIL_COLOR_DOWN, DETAIL_DELTA_EPS, init_ui = __esm({
    "v8.30/ui.js"() {
      init_state();
      init_utils();
      init_gpa_target();
      init_simulation();
      init_diagnose();
      init_win_shell();
      _multiYearHosts = /* @__PURE__ */ new Set();
      _courseChangeListener = null;
      DETAIL_KIND = "detail", _detailRenders = /* @__PURE__ */ new Map(), DETAIL_COLOR_UP = "#52c41a", DETAIL_COLOR_DOWN = "#d4380d", DETAIL_DELTA_EPS = 5e-3;
    }
  });

  // v8.30/simulation.js
  function recalcPFromTasks(course, term) {
    let tasksForCalc = course.tasks.map((t4) => ({
      score: t4.simulatedScore !== void 0 ? t4.simulatedScore : t4.originalScore,
      topScore: t4.topScore,
      typeName: t4.typeName,
      endDate: t4.endDate,
      termRaw: t4.termRaw
    }));
    return calculateTermAverageByCategory(tasksForCalc, course.subject || course.name, term);
  }
  function initSimCourses() {
    S.virtualTaskIdCounter = -1, S._simGen = (S._simGen || 0) + 1, S.simCourses.length = 0, S.simCourses.push(...S.originalCourses.map((course) => ({
      name: course.name,
      courseId: course.courseId,
      credit: course.credit,
      weightBonus: course.weightBonus,
      subject: course.subject || null,
      // ⚠ originalGrades 必须是**同一份对象**（不能拷贝）：校准改它、成绩格的 Δ 读它，拷贝就会出现伪 Δ
      originalGrades: course.originalGrades,
      showStar: __spreadValues({}, course.showStar),
      overrideP: { s1: null, s2: null },
      simGrades: {
        s1p: course.originalGrades.s1p,
        s1e: course.originalGrades.s1e,
        s1f: course.originalGrades.s1f,
        s2p: course.originalGrades.s2p,
        s2e: course.originalGrades.s2e,
        s2f: course.originalGrades.s2f
      },
      tasks: course.tasks.map((t4) => __spreadProps(__spreadValues({}, t4), { originalScore: t4.score, simulatedScore: t4.excluded ? -1 : t4.score }))
    })));
    for (let c of S.simCourses)
      c.showStar.s1 ? c.simGrades.s1p = c.overrideP.s1 !== null ? c.overrideP.s1 : c.originalGrades.s1p : c.simGrades.s1p = c.overrideP.s1 !== null ? c.overrideP.s1 : recalcPFromTasks(c, "S1"), c.showStar.s2 ? c.simGrades.s2p = c.overrideP.s2 !== null ? c.overrideP.s2 : c.originalGrades.s2p : c.simGrades.s2p = c.overrideP.s2 !== null ? c.overrideP.s2 : recalcPFromTasks(c, "S2"), c.simGrades.s1f = calcF(c.simGrades.s1p, c.simGrades.s1e), c.simGrades.s2f = calcF(c.simGrades.s2p, c.simGrades.s2e);
  }
  function initReadOnlyCourses() {
    S.virtualTaskIdCounter = -1, S._simGen = (S._simGen || 0) + 1, S.simCourses.length = 0, S.simCourses.push(...S.originalCourses.map((course) => ({
      name: course.name,
      courseId: course.courseId,
      credit: course.credit,
      weightBonus: course.weightBonus,
      subject: course.subject || null,
      originalGrades: course.originalGrades,
      showStar: { s1: !1, s2: !1 },
      overrideP: { s1: null, s2: null },
      simGrades: __spreadValues({}, course.originalGrades),
      tasks: []
    })));
  }
  function recalcCourseTerm(course, term) {
    let isOverride = term === "s1" && course.overrideP.s1 !== null || term === "s2" && course.overrideP.s2 !== null, isStar = term === "s1" && course.showStar.s1 || term === "s2" && course.showStar.s2;
    term === "s1" ? (isOverride ? course.simGrades.s1p = course.overrideP.s1 : isStar ? course.simGrades.s1p = course.originalGrades.s1p : course.simGrades.s1p = recalcPFromTasks(course, "S1"), course.simGrades.s1f = calcF(course.simGrades.s1p, course.simGrades.s1e)) : (isOverride ? course.simGrades.s2p = course.overrideP.s2 : isStar ? course.simGrades.s2p = course.originalGrades.s2p : course.simGrades.s2p = recalcPFromTasks(course, "S2"), course.simGrades.s2f = calcF(course.simGrades.s2p, course.simGrades.s2e));
  }
  function syncOriginalToSim(course, origCourse) {
    origCourse.originalGrades.s1p = course.simGrades.s1p, origCourse.originalGrades.s1f = course.simGrades.s1f, origCourse.originalGrades.s2p = course.simGrades.s2p, origCourse.originalGrades.s2f = course.simGrades.s2f;
  }
  function syncBaselineToSim(course, origCourse) {
    !course || !origCourse || (course.simGrades = __spreadValues({}, origCourse.originalGrades));
  }
  function applyUserLayer(yearKey) {
    let layer = S.userSimCache.get(String(yearKey));
    if (!layer || !Array.isArray(layer.c) || !layer.c.length || !S.simCourses || !S.simCourses.length) return 0;
    let applied = 0;
    for (let uc of layer.c) {
      let idx = -1;
      if (uc.ci !== void 0 && uc.ci !== null && (idx = S.simCourses.findIndex((c) => c.courseId !== void 0 && c.courseId !== null && String(c.courseId) === String(uc.ci))), idx < 0 && uc.n && (idx = S.simCourses.findIndex((c) => c.name === uc.n)), idx < 0) continue;
      let course = S.simCourses[idx], orig = S.originalCourses[idx];
      uc.e && course.simGrades && (uc.e.s1e !== void 0 && (course.simGrades.s1e = uc.e.s1e), uc.e.s2e !== void 0 && (course.simGrades.s2e = uc.e.s2e)), uc.op && (course.overrideP = { s1: uc.op.s1 === void 0 ? null : uc.op.s1, s2: uc.op.s2 === void 0 ? null : uc.op.s2 });
      for (let te of uc.te || []) {
        let task = course.tasks.find((t4) => String(t4.entityId) === String(te.e));
        if (task && (task.simulatedScore = te.m), te.m === -1 && orig) {
          let oTask = (orig.tasks || []).find((t4) => String(t4.entityId) === String(te.e));
          oTask && (oTask.excluded = !0);
        }
      }
      for (let vt of uc.vt || []) {
        let entityId = parseInt(vt.e, 10);
        entityId && (course.tasks.some((t4) => t4.entityId === entityId) || course.tasks.push(_deserTask(vt)));
      }
      course.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0)), recalcCourseTerm(course, "s1"), recalcCourseTerm(course, "s2"), applied++;
    }
    if (applied) {
      let minId = -1;
      for (let c of S.simCourses)
        for (let t4 of c.tasks || [])
          t4.isVirtual && t4.entityId < minId && (minId = t4.entityId);
      let saved = layer.vt === void 0 || layer.vt === null ? -1 : layer.vt;
      S.virtualTaskIdCounter = Math.min(saved, minId - 1), markDirty(), log(`[\u6301\u4E45\u5316] \u5DF2\u628A\u7528\u6237\u5C42\u8D34\u56DE ${applied} \u95E8\u8BFE\u7A0B\uFF08\u865A\u62DF\u4EFB\u52A1 / \u6539\u5206 / \u624B\u52A8 P\xB7E / \u661F\u6807\uFF09`);
    }
    return applied;
  }
  function initMultiYearSimCourses(origCourses) {
    return origCourses.map((course) => ({
      name: course.name,
      courseId: course.courseId,
      credit: course.credit,
      weightBonus: course.weightBonus,
      originalGrades: __spreadValues({}, course.originalGrades),
      simGrades: { s1f: course.originalGrades.s1f, s2f: course.originalGrades.s2f }
    }));
  }
  function _simGenChanged(gen) {
    return (S._simGen || 0) !== gen;
  }
  async function runCalibrationCore(courseIdx, signal) {
    let gen = S._simGen || 0, course = S.simCourses[courseIdx];
    if (!course) return { changed: !1, failCount: 0, addedCount: 0, stale: !0 };
    let calibYearKey = S.simYearKey !== null ? S.simYearKey : S.currentYearKey, fullTasks = await fetchAllTasksForCourse(course.courseId, calibYearKey, signal);
    if (_simGenChanged(gen)) return { changed: !1, failCount: 0, addedCount: 0, stale: !0 };
    if (course = S.simCourses[courseIdx], !course) return { changed: !1, failCount: 0, addedCount: 0, stale: !0 };
    let existingTaskMap = new Map(course.tasks.map((t4) => [t4.entityId, t4])), origCourse = S.originalCourses[courseIdx];
    origCourse && (origCourse.tasks = origCourse.tasks || []);
    let addedCount = 0;
    for (let newTask of fullTasks) {
      let entityId = parseInt(newTask.entityId, 10);
      if (entityId && String(newTask.type) === "1001" && !existingTaskMap.has(entityId)) {
        let taskObj = {
          entityId,
          taskStudentId: entityId,
          id: newTask.entityId,
          name: newTask.name || "\u672A\u547D\u540D",
          typeName: newTask.typeName || "\u5176\u4ED6",
          score: newTask.score != null ? Number(newTask.score) : null,
          topScore: newTask.topScore != null ? Number(newTask.topScore) : null,
          endDate: newTask.endDate,
          termRaw: newTask.term || null,
          originalScore: newTask.score != null ? Number(newTask.score) : null,
          simulatedScore: newTask.score != null ? Number(newTask.score) : null,
          isVirtual: !1
        };
        course.tasks.push(taskObj), origCourse && origCourse.tasks.push(__spreadProps(__spreadValues({}, taskObj), { excluded: !1 })), addedCount++;
      }
    }
    course.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
    let realTaskIndices = [], realEntityIds = [];
    for (let i = 0; i < course.tasks.length; i++)
      course.tasks[i].isVirtual || (realTaskIndices.push(i), realEntityIds.push(course.tasks[i].entityId));
    let failCount = 0, changed = !1;
    if (realEntityIds.length > 0) {
      let inTotals = await promiseLimit(
        realEntityIds.map((id) => fetchTaskDetail(id, signal).catch((e) => (console.warn(`[\u6821\u51C6] \u83B7\u53D6\u4EFB\u52A1\u8BE6\u60C5\u5931\u8D25 entityId=${id}: ${e.message}`), null))),
        5
      );
      if (_simGenChanged(gen)) return { changed: !1, failCount: 0, addedCount: 0, stale: !0 };
      if (course = S.simCourses[courseIdx], !course) return { changed: !1, failCount: 0, addedCount: 0, stale: !0 };
      for (let j = 0; j < realTaskIndices.length; j++) {
        let ti = realTaskIndices[j];
        if (course.tasks[ti]) {
          if (inTotals[j] === null) {
            failCount++;
            continue;
          }
          if (inTotals[j] === !1) {
            let entityId = course.tasks[ti].entityId;
            if (markCalibrationExcluded(calibYearKey, entityId), course.tasks[ti].simulatedScore !== -1) {
              course.tasks[ti].simulatedScore = -1, changed = !0;
              let oc = S.originalCourses[courseIdx];
              if (oc) {
                let origTask = (oc.tasks || []).find((t4) => t4.entityId === entityId);
                origTask && (origTask.excluded = !0);
              }
            }
          }
        }
      }
    }
    return { changed, failCount, addedCount };
  }
  function _autoCalibrateEnabled() {
    try {
      return localStorage.getItem("ints_auto_calibrate") !== "0";
    } catch (e) {
      return !0;
    }
  }
  async function autoCalibrateStarredCourses() {
    if (!S.isCurrentYear) return;
    if (S.isCalibrating) {
      log("[\u81EA\u52A8\u6821\u51C6] \u624B\u52A8\u6821\u51C6\u8FDB\u884C\u4E2D\uFF0C\u8DF3\u8FC7\u672C\u6B21\u81EA\u52A8\u6821\u51C6");
      return;
    }
    if (_autoCalibrateRunning) {
      log("[\u81EA\u52A8\u6821\u51C6] \u4E0A\u4E00\u8F6E\u5C1A\u672A\u7ED3\u675F\uFF0C\u8DF3\u8FC7\u672C\u6B21");
      return;
    }
    if (!_autoCalibrateEnabled()) {
      log("[\u81EA\u52A8\u6821\u51C6] \u5DF2\u6309\u8BBE\u7F6E\u5173\u95ED\uFF08ints_auto_calibrate=0\uFF09");
      return;
    }
    let candidates = [];
    for (let i = 0; i < S.simCourses.length; i++) {
      let c = S.simCourses[i];
      if (!c || !(c.showStar && c.showStar.s1 || c.showStar && c.showStar.s2) || !c.courseId) continue;
      let key = String(c.courseId), used = S._autoCalibrateCounts.get(key) || 0;
      used >= AUTO_CALIBRATE_PER_COURSE_MAX || (S._autoCalibrateCounts.set(key, used + 1), candidates.push(i));
    }
    if (!candidates.length) return;
    let targets = candidates.slice(0, AUTO_CALIBRATE_MAX), deferred = candidates.length - targets.length;
    if (log(`[\u81EA\u52A8\u6821\u51C6] \u661F\u6807\u8BFE\u7A0B ${candidates.length} \u95E8\uFF0C\u672C\u6B21\u6821\u51C6 ${targets.length} \u95E8` + (deferred ? `\uFF08${deferred} \u95E8\u7559\u5F85\u624B\u52A8\u6821\u51C6\uFF09` : "") + ": " + targets.map((i) => S.simCourses[i].name).join(" | ")), _autoCalibrateRunning = !0, await new Promise((r) => setTimeout(r, AUTO_CALIBRATE_DELAY_MS)), !_autoCalibrateEnabled()) {
      _autoCalibrateRunning = !1, log("[\u81EA\u52A8\u6821\u51C6] \u5DF2\u6309\u8BBE\u7F6E\u5173\u95ED\uFF0C\u653E\u5F03\u672C\u8F6E");
      return;
    }
    let navGen = S._navGeneration, simGen = S._simGen || 0;
    S.isCalibrating = !0;
    let ac = new AbortController();
    S.calibrateAbortController = ac;
    let signal = ac.signal, okCount = 0, failCount = 0, starCleared = 0, starKept = 0;
    try {
      for (let ci of targets) {
        if (S._navGeneration !== navGen) {
          log("[\u81EA\u52A8\u6821\u51C6] \u5B66\u5E74\u5DF2\u5207\u6362\uFF0C\u4E2D\u65AD");
          break;
        }
        if (_simGenChanged(simGen)) {
          log("[\u81EA\u52A8\u6821\u51C6] \u6A21\u62DF\u6570\u636E\u5DF2\u91CD\u7F6E\uFF0C\u4E2D\u65AD\u672C\u8F6E");
          break;
        }
        let course = S.simCourses[ci], orig = S.originalCourses[ci];
        try {
          if ((await runCalibrationCore(ci, signal)).stale || _simGenChanged(simGen)) {
            log("[\u81EA\u52A8\u6821\u51C6] \u6A21\u62DF\u6570\u636E\u5DF2\u91CD\u7F6E\uFF0C\u653E\u5F03\u672C\u8F6E\u6821\u51C6\u7ED3\u679C");
            break;
          }
          if (course = S.simCourses[ci], orig = S.originalCourses[ci], !course) break;
          if (okCount++, course.showStar && orig) {
            orig.showStar = orig.showStar || { s1: !1, s2: !1 };
            for (let term of ["S1", "S2"]) {
              let starKey = term === "S1" ? "s1" : "s2", pKey = term === "S1" ? "s1p" : "s2p";
              if (!course.showStar[starKey]) continue;
              let mapped = course.tasks.map((t4) => ({
                score: t4.simulatedScore !== void 0 ? t4.simulatedScore : t4.originalScore,
                topScore: t4.topScore,
                typeName: t4.typeName,
                endDate: t4.endDate,
                termRaw: t4.termRaw
              })), newP = calculateTermAverageByCategory(mapped, course.subject || course.name, term), apiP = orig.originalGrades[pKey];
              newP !== null && apiP !== null && !differsFromSchool(newP, apiP) ? (course.showStar[starKey] = !1, orig.showStar[starKey] = !1, orig.originalGrades[pKey] = newP, starCleared++, log(`[\u81EA\u52A8\u6821\u51C6] ${course.name} ${term} \u661F\u6807\u89E3\u9664: \u8BA1\u7B97\u503C=${newP.toFixed(2)} \u7CFB\u7EDF\u503C=${apiP}`)) : (starKept++, log(`[\u81EA\u52A8\u6821\u51C6] ${course.name} ${term} \u661F\u6807\u4FDD\u7559: \u8BA1\u7B97\u503C=${newP === null ? "null" : newP.toFixed(2)} \u7CFB\u7EDF\u503C=${apiP}`));
            }
          }
          recalcCourseTerm(course, "s1"), recalcCourseTerm(course, "s2"), orig && syncOriginalToSim(course, orig);
        } catch (e) {
          if (e && e.name === "AbortError") {
            log("[\u81EA\u52A8\u6821\u51C6] \u8BF7\u6C42\u5DF2\u4E2D\u65AD");
            break;
          }
          console.error(`[\u81EA\u52A8\u6821\u51C6] ${course.name} \u6821\u51C6\u5931\u8D25: ${e.message}`, e), failCount++;
        }
      }
    } finally {
      S.isCalibrating = !1, S.calibrateAbortController = null, _autoCalibrateRunning = !1;
    }
    if (S._navGeneration !== navGen) return;
    refreshAllViews(), markDirty();
    let parts = [];
    okCount && parts.push(t(`${okCount} \u95E8\u5DF2\u6821\u51C6`, `${okCount} calibrated`)), starCleared && parts.push(t(`${starCleared} \u5904\u661F\u6807\u5DF2\u89E3\u9664`, `${starCleared} star(s) cleared`)), starKept && parts.push(t(`${starKept} \u5904\u661F\u6807\u4FDD\u7559`, `${starKept} star(s) kept`)), failCount && parts.push(t(`${failCount} \u95E8\u5931\u8D25`, `${failCount} failed`)), deferred && parts.push(t(`\u53E6\u6709 ${deferred} \u95E8\u7559\u5F85\u4E0B\u6B21\uFF08\u672C\u6B21\u4F1A\u8BDD\u5DF2\u8FBE\u4E0A\u9650\uFF09`, `${deferred} more deferred to next session`)), parts.length && log("[\u81EA\u52A8\u6821\u51C6] " + parts.join("\uFF0C"));
  }
  function showVirtualTaskModal2(preselectedCourseIdx, onAdded) {
    if (!S.isCurrentYear || S.activeSubModal) return;
    S.activeSubModal = !0;
    let TYPE_KEYS = ["homework", "inclass", "project", "test", "quiz"];
    function getDefaultSemester() {
      return S.currentFilter === "s1" ? "S1" : S.currentFilter === "s2" ? "S2" : "S1";
    }
    function getDefaultDateForSemester(semester) {
      let yearMatch = S.currentYearValue ? S.currentYearValue.match(/(\d{4})/) : null, firstYear = yearMatch ? parseInt(yearMatch[1]) : (/* @__PURE__ */ new Date()).getFullYear();
      return semester === "S1" ? `${firstYear}-10-15` : `${firstYear + 1}-04-15`;
    }
    let modalDiv = document.createElement("div");
    modalDiv.className = "virtual-task-modal", modalDiv.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:20020;display:flex;align-items:center;justify-content:center;";
    let courses = S.isCurrentYear ? S.simCourses : S.originalCourses, subjectOptions = "";
    for (let i = 0; i < courses.length; i++) {
      let sel = preselectedCourseIdx !== null && i === preselectedCourseIdx ? " selected" : "", label = courses[i].subject ? courses[i].subject + " \xB7 " + courses[i].name : courses[i].name;
      subjectOptions += `<option value="${i}"${sel}>${escapeHtml(label)}</option>`;
    }
    function _vtWeights(course) {
      return getCourseWeights(course && (course.subject || course.name) || "");
    }
    function _vtTypeOptionHtml(course) {
      let w = _vtWeights(course), html = "";
      for (let i = 0; i < TYPE_NAMES.length; i++) {
        let pct = Math.round((typeof w[i] == "number" ? w[i] : 0) * 100);
        html += `<option value="${i}">${escapeHtml(t(TYPE_NAMES[i], TYPE_NAMES[i]))} (${pct}%)</option>`;
      }
      return html;
    }
    function _vtWeightsNote(course) {
      let w = _vtWeights(course), src = course ? course.subject || course.name : "", parts = [];
      for (let i = 0; i < TYPE_NAMES.length; i++)
        parts.push(TYPE_NAMES[i] + " " + Math.round((typeof w[i] == "number" ? w[i] : 0) * 100) + "%");
      return t("\u6743\u91CD\u6765\u6E90\uFF1A", "Weights from ") + (src || t("\u9ED8\u8BA4\u89C4\u5219", "default rule")) + "\uFF08" + parts.join(" / ") + "\uFF09";
    }
    let defaultSem = getDefaultSemester(), semOptions = `<option value="S1"${defaultSem === "S1" ? " selected" : ""}>${t("\u7B2C\u4E00\u5B66\u671F (S1)", "Semester 1 (S1)")}</option><option value="S2"${defaultSem === "S2" ? " selected" : ""}>${t("\u7B2C\u4E8C\u5B66\u671F (S2)", "Semester 2 (S2)")}</option>`, initCourse = courses[preselectedCourseIdx !== null ? preselectedCourseIdx : 0], labelStyle = "display:block;text-align:left;line-height:1.5;padding:0 0 6px;", itemStyle = "margin-bottom:16px;", controlCell = (inner) => '<div class="ant-form-item-control-wrapper"><div class="ant-form-item-control">' + inner + "</div></div>", panel = document.createElement("div");
    panel.className = "ant-modal", panel.style.cssText = "width:480px;max-width:95%;top:0;padding-bottom:0;", panel.innerHTML = '<div class="ant-modal-content"><button type="button" id="close-virtual-task-modal" class="ant-modal-close" aria-label="Close"><span class="ant-modal-close-x">&times;</span></button><div class="ant-modal-header"><div class="ant-modal-title">' + t("\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", "Add Virtual Task") + '</div></div><div class="ant-modal-body"><div class="ant-form-item" style="' + itemStyle + '"><div class="ant-form-item-label" style="' + labelStyle + '"><label for="vt-subject">' + t("\u79D1\u76EE", "Subject") + "</label></div>" + controlCell('<select id="vt-subject" class="ant-input">' + subjectOptions + "</select>") + '</div><div class="ant-form-item" style="' + itemStyle + '"><div class="ant-form-item-label" style="' + labelStyle + '"><label for="vt-semester">' + t("\u5B66\u671F", "Semester") + "</label></div>" + controlCell('<select id="vt-semester" class="ant-input">' + semOptions + "</select>") + '</div><div class="ant-form-item" style="' + itemStyle + '"><div class="ant-form-item-label" style="' + labelStyle + '"><label for="vt-type">' + t("\u4EFB\u52A1\u7C7B\u578B", "Task Type") + "</label></div>" + controlCell('<select id="vt-type" class="ant-input">' + _vtTypeOptionHtml(initCourse) + "</select>") + '<div id="vt-weights-note" class="ant-form-item-explain" style="color:rgba(0,0,0,0.45);font-size:12px;line-height:1.6;padding-top:4px;">' + escapeHtml(_vtWeightsNote(initCourse)) + '</div></div><div class="ant-form-item" style="' + itemStyle + 'display:flex;gap:16px;"><div style="flex:1;"><div class="ant-form-item-label" style="' + labelStyle + '"><label for="vt-topscore">' + t("\u603B\u5206", "Total Score") + "</label></div>" + controlCell('<input id="vt-topscore" class="ant-input" type="number" min="0.01" step="any" value="">') + '</div><div style="flex:1;"><div class="ant-form-item-label" style="' + labelStyle + '"><label for="vt-score">' + t("\u5F97\u5206", "Score") + "</label></div>" + controlCell('<input id="vt-score" class="ant-input" type="number" min="0" step="any" value="">') + '</div></div></div><div id="ints-vt-msg" style="display:none;padding:0 24px 8px;color:#cf1322;font-size:12px;"></div><div class="ant-modal-footer"><button type="button" id="cancel-virtual-task" class="ant-btn">' + t("\u53D6\u6D88", "Cancel") + '</button><button type="button" id="confirm-virtual-task" class="ant-btn ant-btn-primary">' + t("\u6DFB\u52A0", "Add") + "</button></div></div>";
    let subjectSel = panel.querySelector("#vt-subject");
    subjectSel && subjectSel.addEventListener("change", function() {
      let idx = parseInt(subjectSel.value, 10), course = courses[idx], typeSel = panel.querySelector("#vt-type");
      if (typeSel) {
        let keep = typeSel.value;
        typeSel.innerHTML = _vtTypeOptionHtml(course), typeSel.value = keep;
      }
      let note = panel.querySelector("#vt-weights-note");
      note && (note.textContent = _vtWeightsNote(course));
    }), modalDiv.appendChild(panel), document.body.appendChild(modalDiv);
    function closeModal() {
      modalDiv.parentNode && modalDiv.remove(), S.activeSubModal = !1;
    }
    function showModalError(msg) {
      let el = panel.querySelector("#ints-vt-msg");
      el && (el.textContent = msg, el.style.display = "block");
    }
    function doAdd() {
      let courseIdx = parseInt(document.getElementById("vt-subject").value), semester = document.getElementById("vt-semester").value, typeIdx = parseInt(document.getElementById("vt-type").value), topScoreVal = document.getElementById("vt-topscore").value.trim(), scoreVal = document.getElementById("vt-score").value.trim();
      if (isNaN(courseIdx) || !courses[courseIdx]) {
        showModalError(t("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u79D1\u76EE", "Please select a valid subject"));
        return;
      }
      let topScore = parseFloat(topScoreVal);
      if (isNaN(topScore) || topScore <= 0) {
        showModalError(t("\u603B\u5206\u5FC5\u987B\u5927\u4E8E 0", "Total score must be greater than 0"));
        return;
      }
      let score = null;
      if (scoreVal !== "") {
        if (score = parseFloat(scoreVal), isNaN(score)) {
          showModalError(t("\u5F97\u5206\u683C\u5F0F\u65E0\u6548", "Invalid score format"));
          return;
        }
        score < 0 && (score = 0), score > topScore && (score = topScore);
      }
      let virtualId = S.virtualTaskIdCounter--, virtualTask = {
        entityId: virtualId,
        taskStudentId: virtualId,
        id: virtualId,
        // 名字**派生、不可编辑**：`虚拟任务3 (作业)`。没有名称输入框，
        // "把虚拟任务命名成期中考试再截图"这条路就堵住了（反序列化那侧还会再统一改写一次）。
        name: virtualTaskName(virtualId, TYPE_KEYS[typeIdx]),
        typeName: TYPE_KEYS[typeIdx],
        score,
        topScore,
        endDate: getDefaultDateForSemester(semester),
        termRaw: semester,
        originalScore: score,
        simulatedScore: score,
        isVirtual: !0
      }, course = S.simCourses[courseIdx];
      course.tasks.push(virtualTask), course.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0)), semester === "S1" ? course.overrideP.s1 = null : course.overrideP.s2 = null, recalcCourseTerm(course, "s1"), recalcCourseTerm(course, "s2"), markDirty(), notifyCourseChanged(courseIdx), log(`[\u5185\u8054] \u5DF2\u4E3A ${course.name} \u6DFB\u52A0${virtualTask.name}\uFF08\u5DF2\u8BA1\u5165\u5E73\u65F6\u6210\u7EE9\uFF09`), closeModal();
      try {
        typeof onAdded == "function" && onAdded(courseIdx);
      } catch (e) {
        console.error("[\u865A\u62DF\u4EFB\u52A1] onAdded \u56DE\u8C03\u5F02\u5E38", e);
      }
    }
    panel.querySelector("#close-virtual-task-modal").addEventListener("click", closeModal), panel.querySelector("#cancel-virtual-task").addEventListener("click", closeModal), panel.querySelector("#confirm-virtual-task").addEventListener("click", doAdd), modalDiv.addEventListener("click", (e) => {
      e.target === modalDiv && closeModal();
    }), panel.addEventListener("keypress", (e) => {
      e.key === "Enter" && e.target.tagName !== "TEXTAREA" && (e.preventDefault(), doAdd());
    });
  }
  var AUTO_CALIBRATE_MAX, AUTO_CALIBRATE_PER_COURSE_MAX, AUTO_CALIBRATE_DELAY_MS, _autoCalibrateRunning, init_simulation = __esm({
    "v8.30/simulation.js"() {
      init_state();
      init_utils();
      init_api();
      init_ui();
      init_log();
      AUTO_CALIBRATE_MAX = 20, AUTO_CALIBRATE_PER_COURSE_MAX = 2, AUTO_CALIBRATE_DELAY_MS = 1800, _autoCalibrateRunning = !1;
    }
  });

  // v8.30/year-data.js
  function incLoadingCount() {
    return S.loadingRequestCount++, S.loadingRequestCount;
  }
  function readPageYearText() {
    let sel = document.querySelector(".ant-select-selection-selected-value, .ant-select-single .ant-select-selection-item");
    return sel ? sel.textContent.trim() : null;
  }
  async function resolvePageYear() {
    (!S.yearList || !S.yearList.length) && (S.yearList = await fetchSchoolYearList(), log("[\u542F\u52A8] \u5B66\u5E74\u5217\u8868: " + S.yearList.length + " \u6761"));
    let pageText = readPageYearText(), entry = S.yearList.find((y) => y.value === pageText);
    return !entry && S.yearList.length && (entry = S.yearList[0]), { entry, pageText };
  }
  async function loadPageYearData(opts) {
    let force = !!(opts && opts.force), navGen = ++S._navGeneration;
    S.currentAbortController && S.currentAbortController.abort(), S.currentAbortController = new AbortController();
    let { entry } = await resolvePageYear();
    return entry ? (S.schoolYearKey === null && (S.schoolYearKey = entry.key, log(`[\u52A0\u8F7D] \u5728\u8BFB\u5B66\u5E74: ${entry.value}\uFF08\u8FDB\u9875\u9762\u65F6\u7AD9\u70B9\u9009\u4E2D\u7684\u5C31\u662F\u5B83 \u21D2 \u53EF\u6A21\u62DF\uFF09`)), (!S.creditMap || !S.creditMap.size) && (S.creditMap = await loadCreditMap()), S._navGeneration !== navGen ? !1 : (S.currentYearKey = entry.key, S.currentYearValue = entry.value, S.isCurrentYear = String(entry.key) === String(S.schoolYearKey), S.isCurrentYear || log(`[\u52A0\u8F7D] ${entry.value} \u662F\u5F80\u671F\u5B66\u5E74\uFF08\u5728\u8BFB\u7684\u662F ${S.schoolYearKey} \u90A3\u5E74\uFF09\u21D2 \u53EA\u8BFB\uFF1A\u4E0D\u6A21\u62DF\u3001\u4E0D\u6821\u51C6\u3001\u4E0D\u5199\u7528\u6237\u6570\u636E`), S.isMultiYearMode = !1, await loadYearData(S.currentYearKey, S.currentYearValue, S.isCurrentYear, { force }), S._navGeneration === navGen && !!(S.simCourses && S.simCourses.length))) : (console.warn("[\u52A0\u8F7D] \u65E0\u6CD5\u5B9A\u4F4D\u7AD9\u70B9\u9875\u9762\u7684\u5B66\u5E74"), !1);
  }
  function _detachLiveSims() {
    let key = S.simYearKey !== null && S.simYearKey !== void 0 ? String(S.simYearKey) : S.currentYearKey !== null && S.currentYearKey !== void 0 ? String(S.currentYearKey) : null;
    if (key === null) return;
    let entry = S.yearDataCache.get(key);
    entry && entry.simCourses === S.simCourses && (!S.simCourses || !S.simCourses.length || (entry.simCourses = S.simCourses.slice(), log(`[\u7F13\u5B58] \u5DF2\u628A ${key} \u7684\u6A21\u62DF\u5C42\u4ECE\u6D3B\u5F15\u7528\u4E0A\u6458\u4E0B\u6765\uFF08${entry.simCourses.length} \u95E8\uFF09\uFF0C\u514D\u5F97\u8FD9\u6B21\u5207\u5B66\u5E74\u628A\u5B83\u4E00\u8D77\u6362\u6210\u53E6\u4E00\u5E74\u7684`)));
  }
  async function loadYearData(yearKey, yearValue, isCurr, opts) {
    let force = !!(opts && opts.force), navGen = S._navGeneration;
    S.activeSubModal = !1, S.loadingRequestCount = 0, S.expectedRequestCount = 3;
    let keyStr = String(yearKey);
    if (_detachLiveSims(), S.yearDataCache.has(keyStr)) {
      let cached = S.yearDataCache.get(keyStr);
      if (!!cached.originalCourses && (!isCurr || !force && isYearCacheFresh(keyStr) && cached.simCourses && cached.simCourses.length)) {
        S.originalCourses = cached.originalCourses, isCurr ? (S.simCourses = cached.simCourses, S.currentYearAnnualGPA = null, S.currentYearCumulativeGPA = null, S.virtualTaskIdCounter = cached.virtualTaskIdCounter || cached.simCourses.reduce((min, c) => {
          for (let t4 of c.tasks || []) t4.isVirtual && t4.entityId < min && (min = t4.entityId);
          return min;
        }, -1)) : (initReadOnlyCourses(), S.currentYearAnnualGPA = cached.annualGPA || null, S.currentYearCumulativeGPA = cached.cumulativeGPA || null), S.simYearKey = keyStr, refreshAllViews(), log(isCurr ? `[\u7F13\u5B58] \u4F7F\u7528\u7F13\u5B58\u7684\u5F53\u524D\u5B66\u5E74\u6A21\u62DF\u6570\u636E: ${yearValue}` : `[\u7F13\u5B58] \u4F7F\u7528\u7F13\u5B58\u7684\u5F80\u671F\u6570\u636E\uFF08\u53EA\u8BFB\uFF09: ${yearValue}`), isCurr && safeAsync("\u661F\u6807\u81EA\u52A8\u6821\u51C6", autoCalibrateStarredCourses);
        return;
      }
      isCurr && log(`[\u7F13\u5B58] ${yearValue} \u7684\u6210\u7EE9\u518C\u7F13\u5B58\u5DF2\u8FC7\u671F\uFF08\u6216\u6CA1\u6709\u6A21\u62DF\u6570\u636E\uFF09` + (force ? "\uFF08\u672C\u6B21\u4E3A\u5BF9\u8D26\u5F3A\u5236\u91CD\u62C9\uFF09" : "") + "\uFF0C\u91CD\u65B0\u62C9\u53D6\uFF1B\u7528\u6237\u6570\u636E\u7A0D\u540E\u56DE\u8D34");
    }
    log(`[\u52A0\u8F7D] \u5F00\u59CB\u52A0\u8F7D\u5B66\u5E74 ${yearValue}\uFF0C\u5F53\u524D\u5B66\u5E74=${isCurr}`);
    try {
      log(`[\u52A0\u8F7D] \u83B7\u53D6 ${yearValue} \u6210\u7EE9\u6570\u636E`), incLoadingCount();
      let courses = await buildCurrentYearCourses(yearKey, yearValue);
      if (S._navGeneration !== navGen) return;
      S.originalCourses = courses, isCurr ? initSimCourses() : initReadOnlyCourses(), S.simYearKey = keyStr, isCurr && applyUserLayer(keyStr);
      let sectionName = null, apiAnnualGPA = null, apiCumulativeGPA = null;
      try {
        let studentId = await getStudentId(), yearlyReport = (await fetchGradeReportsForYear(yearKey)).find((r) => {
          var _a;
          return r.gradePeriodType === "fullSchoolYear" || r.reportName && (r.reportName.includes("\u5E74\u5EA6") || ((_a = r.reportEnName) == null ? void 0 : _a.includes("Yearly")));
        });
        if (yearlyReport) {
          let content = await fetchReportContent(studentId, yearlyReport.requestUrl, yearlyReport.gradePeriodId);
          content && (sectionName = content.sectionName || null, apiAnnualGPA = typeof content.annualGPA == "number" ? content.annualGPA : null, apiCumulativeGPA = typeof content.cumulativeGPA == "number" ? content.cumulativeGPA : null);
        }
      } catch (e) {
        console.warn(`[\u52A0\u8F7D] \u83B7\u53D6 ${yearValue} \u5E74\u7EA7\u4FE1\u606F\u5931\u8D25: ${e.message}`);
      }
      if (S.currentYearAnnualGPA = apiAnnualGPA, S.currentYearCumulativeGPA = apiCumulativeGPA, S.yearDataCache.set(keyStr, {
        originalCourses: courses,
        simCourses: isCurr ? S.simCourses : null,
        virtualTaskIdCounter: isCurr ? S.virtualTaskIdCounter : null,
        sectionName,
        annualGPA: apiAnnualGPA,
        cumulativeGPA: apiCumulativeGPA,
        dataTs: Date.now()
      }), markDirty(), S._navGeneration !== navGen) return;
      refreshAllViews(), S.expectedRequestCount = 0, log(`[\u52A0\u8F7D] \u5B8C\u6210\uFF0C\u5171 ${S.originalCourses.length} \u95E8\u8BFE\u7A0B`), isCurr && safeAsync("\u661F\u6807\u81EA\u52A8\u6821\u51C6", autoCalibrateStarredCourses);
    } catch (err) {
      if (S.expectedRequestCount = 0, err.name === "AbortError") {
        log("[\u52A0\u8F7D] \u8BF7\u6C42\u5DF2\u88AB\u4E2D\u65AD");
        return;
      }
      console.error(`[\u52A0\u8F7D] \u5931\u8D25: ${err.message}`, err);
    }
  }
  function _gradeIndexOf(label) {
    if (!label) return null;
    let m = /^G\s*(\d{1,2})$/.exec(String(label).trim());
    if (!m) return null;
    let n = parseInt(m[1], 10);
    return n >= 1 && n <= 12 ? n : null;
  }
  function _yearStart(value) {
    let m = /(\d{4})/.exec(String(value || ""));
    return m ? parseInt(m[1], 10) : null;
  }
  function _yearPositions(sortedYears) {
    let starts = /* @__PURE__ */ new Map(), allNumeric = !0;
    sortedYears.forEach((y, i) => {
      let s = _yearStart(y.value);
      s === null && (allNumeric = !1), starts.set(String(y.key), s === null ? i : s);
    });
    let idx = /* @__PURE__ */ new Map();
    return sortedYears.forEach((y, i) => idx.set(String(y.key), i)), (keyStr) => allNumeric ? starts.get(String(keyStr)) : idx.get(String(keyStr));
  }
  function _putGrade(gradeDataMap, grade, d, chained) {
    gradeDataMap.set(grade, {
      yearKey: d.y.key,
      yearValue: d.y.value,
      courses: d.courses,
      isCurr: d.isCurr,
      annualGPA: d.apiAnnualGPA,
      cumulativeGPA: d.apiCumulativeGPA,
      chained: !!chained
    });
  }
  async function loadMultiYearData() {
    let navGen = S._navGeneration;
    S.multiYearEntries = [], S.multiYearCourseMap = /* @__PURE__ */ new Map(), S.loadingRequestCount = 0, S.expectedRequestCount = 8;
    let sortedYears = [...S.yearList].sort((a, b) => a.value.localeCompare(b.value)), inProgressKey = S.schoolYearKey !== null && S.schoolYearKey !== void 0 ? String(S.schoolYearKey) : null, inProgressEntry = inProgressKey ? sortedYears.find((y) => String(y.key) === inProgressKey) : null, inProgressStart = inProgressEntry ? _yearStart(inProgressEntry.value) : null;
    if (inProgressStart !== null) {
      let kept = sortedYears.filter((y) => {
        let s = _yearStart(y.value);
        return s === null || s <= inProgressStart;
      });
      kept.length !== sortedYears.length && (log(`[\u591A\u5E74\u7EA7] \u5B66\u5E74\u5217\u8868\u91CC\u6709 ${sortedYears.length - kept.length} \u4E2A\u665A\u4E8E\u5728\u8BFB\u5B66\u5E74\uFF08${inProgressEntry.value}\uFF09\u7684\u6761\u76EE\uFF0C\u5DF2\u6392\u9664\u51FA\u7A97\u53E3\uFF08\u5B83\u4EEC\u4E0D\u53EF\u80FD\u6709\u6210\u7EE9\uFF09`), sortedYears = kept);
    }
    sortedYears.length > 4 && (sortedYears = sortedYears.slice(-4));
    let allGrades = ["G9", "G10", "G11", "G12"], gradeDataMap = /* @__PURE__ */ new Map(), studentId = await getStudentId();
    (!S.creditMap || !S.creditMap.size) && (S.creditMap = await loadCreditMap());
    let expectedReqs = 0;
    for (let i = 0; i < sortedYears.length; i++) {
      let keyStr = String(sortedYears[i].key), cached = S.yearDataCache.get(keyStr);
      (!cached || !cached.sectionName) && (expectedReqs += 2), (!cached || !cached.originalCourses) && (expectedReqs += 1);
    }
    S.expectedRequestCount = expectedReqs;
    let yearLoadPromises = sortedYears.map(async (y) => {
      let keyStr = String(y.key), isCurr = String(y.key) === String(S.schoolYearKey !== null ? S.schoolYearKey : S.currentYearKey), sectionName = null, courses = null, apiAnnualGPA = null, apiCumulativeGPA = null, cachedMeta = S.yearDataCache.get(keyStr);
      if (cachedMeta && cachedMeta.sectionName)
        sectionName = cachedMeta.sectionName, apiAnnualGPA = cachedMeta.annualGPA, apiCumulativeGPA = cachedMeta.cumulativeGPA;
      else
        try {
          incLoadingCount();
          let yearlyReport = (await fetchGradeReportsForYear(y.key)).find((r) => {
            var _a;
            return r.gradePeriodType === "fullSchoolYear" || r.reportName && (r.reportName.includes("\u5E74\u5EA6") || ((_a = r.reportEnName) == null ? void 0 : _a.includes("Yearly")));
          });
          if (yearlyReport) {
            incLoadingCount();
            let content = await fetchReportContent(studentId, yearlyReport.requestUrl, yearlyReport.gradePeriodId);
            content && (sectionName = content.sectionName || null, apiAnnualGPA = typeof content.annualGPA == "number" ? content.annualGPA : null, apiCumulativeGPA = typeof content.cumulativeGPA == "number" ? content.cumulativeGPA : null);
          } else
            S.expectedRequestCount = Math.max(S.loadingRequestCount, S.expectedRequestCount - 1);
        } catch (e) {
          console.warn(`[\u591A\u5E74\u7EA7] \u83B7\u53D6 ${y.value} \u5E74\u7EA7\u4FE1\u606F\u5931\u8D25: ${e.message}`);
        }
      if (cachedMeta && cachedMeta.originalCourses)
        courses = cachedMeta.originalCourses, sectionName || (sectionName = cachedMeta.sectionName || null), apiAnnualGPA === null && (apiAnnualGPA = cachedMeta.annualGPA || null), apiCumulativeGPA === null && (apiCumulativeGPA = cachedMeta.cumulativeGPA || null);
      else {
        if (incLoadingCount(), isCurr)
          courses = await buildCurrentYearCourses(y.key, y.value);
        else {
          let result = await buildCoursesFromReports(y.key);
          courses = result.courses, sectionName || (sectionName = result.sectionName), apiAnnualGPA === null && (apiAnnualGPA = result.annualGPA || null), apiCumulativeGPA === null && (apiCumulativeGPA = result.cumulativeGPA || null);
        }
        let existingCache = S.yearDataCache.get(keyStr) || {};
        S.yearDataCache.set(keyStr, {
          originalCourses: courses,
          sectionName,
          annualGPA: apiAnnualGPA,
          cumulativeGPA: apiCumulativeGPA,
          // dataTs 要跟着走，别把保鲜期抹成每次都过期
          dataTs: existingCache.dataTs || Date.now(),
          simCourses: existingCache.simCourses || null,
          virtualTaskIdCounter: existingCache.virtualTaskIdCounter || null
        });
      }
      return { y, keyStr, isCurr, sectionName, apiAnnualGPA, apiCumulativeGPA, courses };
    }), allYearData = await Promise.all(yearLoadPromises);
    if (S._navGeneration !== navGen) return;
    let labeled = /* @__PURE__ */ new Map();
    for (let d of allYearData) {
      let idx = _gradeIndexOf(d.sectionName);
      if (idx === null) {
        d.sectionName && console.warn(`[\u591A\u5E74\u7EA7] \u672A\u77E5\u5E74\u7EA7\u6807\u7B7E: ${d.sectionName}\uFF0C\u5DF2\u6392\u9664`);
        continue;
      }
      if (labeled.set(d.keyStr, { gradeIdx: idx, data: d }), idx < GRADE_MIN || idx > GRADE_MAX) {
        log(`[\u591A\u5E74\u7EA7] ${d.y.value} \u7684\u5E74\u7EA7\u662F G${idx}\uFF08\u4E0D\u5728 G9\u2013G12\uFF09\u21D2 \u4E0D\u8FDB\u8868\uFF0C\u4EC5\u4F5C\u63A8\u7B97\u951A\u70B9`);
        continue;
      }
      _putGrade(gradeDataMap, "G" + idx, d, !1);
    }
    let posOf = _yearPositions(sortedYears);
    for (let d of allYearData) {
      if (_gradeIndexOf(d.sectionName) !== null) continue;
      let best = null;
      for (let [aKey, a] of labeled) {
        let delta = posOf(d.keyStr) - posOf(aKey);
        delta === null || isNaN(delta) || (!best || Math.abs(delta) < Math.abs(best.delta)) && (best = { delta, aKey, a });
      }
      if (!best) {
        console.warn(`[\u591A\u5E74\u7EA7] ${d.y.value} \u6CA1\u6709\u5E74\u5EA6\u62A5\u544A\u3001\u4E5F\u6CA1\u6709\u4EFB\u4F55\u5E74\u7EA7\u951A\u70B9 \u21D2 \u4E0D\u8FDB\u8868`);
        continue;
      }
      let cand = best.a.gradeIdx + best.delta;
      if (cand < GRADE_MIN || cand > GRADE_MAX) {
        log(`[\u591A\u5E74\u7EA7] ${d.y.value} \u65E0\u5E74\u5EA6\u62A5\u544A \u21D2 \u7531 ${best.a.data.y.value} \u7684 G${best.a.gradeIdx} \u63A8\u7B97\u51FA G${cand}\uFF08\u4E0D\u5728 G9\u2013G12\uFF09\u21D2 \u4E0D\u8FDB\u8868`);
        continue;
      }
      let grade = "G" + cand;
      if (gradeDataMap.has(grade)) {
        console.warn(`[\u591A\u5E74\u7EA7] ${d.y.value} \u63A8\u7B97\u4E3A ${grade}\uFF0C\u4E0E\u5DF2\u786E\u8BA4\u7684 ${gradeDataMap.get(grade).yearValue} \u51B2\u7A81 \u21D2 \u4E0D\u8986\u76D6\uFF0C\u672C\u5E74\u4E0D\u8FDB\u8868`);
        continue;
      }
      _putGrade(gradeDataMap, grade, d, !0), log(`[\u591A\u5E74\u7EA7] ${d.y.value} \u6CA1\u6709\u5E74\u5EA6\u62A5\u544A \u21D2 \u7531 ${best.a.data.y.value} \u7684 G${best.a.gradeIdx} \u63A8\u7B97\u4E3A ${grade}`);
    }
    if (S._navGeneration === navGen) {
      for (let grade of allGrades)
        if (gradeDataMap.has(grade)) {
          let data = gradeDataMap.get(grade), simCopy;
          if (data.isCurr) {
            let keyStr = String(data.yearKey), cached = S.yearDataCache.get(keyStr);
            S.simCourses && S.simCourses.length && String(S.simYearKey) === keyStr ? (simCopy = S.simCourses, cached && cached.simCourses !== simCopy && (cached.simCourses = simCopy)) : cached && cached.simCourses && cached.simCourses.length ? (simCopy = cached.simCourses, log(`[\u591A\u5E74\u7EA7] ${grade} \u4F7F\u7528\u7F13\u5B58\u7684\u6A21\u62DF\u6570\u636E`)) : simCopy = initMultiYearSimCourses(data.courses);
          } else
            simCopy = initMultiYearSimCourses(data.courses);
          S.multiYearEntries.push({
            grade,
            yearKey: data.yearKey,
            yearValue: data.yearValue,
            originalCourses: data.courses,
            simCourses: simCopy,
            annualGPA: data.annualGPA || null,
            cumulativeGPA: data.cumulativeGPA || null,
            // 年级是推算来的（该年没有年度报告），只作诊断用
            chained: !!data.chained
          });
        } else
          S.multiYearEntries.push({
            grade,
            yearKey: null,
            yearValue: null,
            originalCourses: [],
            simCourses: [],
            annualGPA: null,
            cumulativeGPA: null
          }), log(`[\u591A\u5E74\u7EA7] ${grade}: \u65E0\u6570\u636E`);
      for (let entry of S.multiYearEntries)
        if (entry.originalCourses.length)
          for (let i = 0; i < entry.simCourses.length; i++) {
            let course = entry.simCourses[i], name = course.name;
            S.multiYearCourseMap.has(name) || S.multiYearCourseMap.set(name, { name, credit: course.credit, weightBonus: course.weightBonus, years: {} });
            let mc = S.multiYearCourseMap.get(name);
            mc.years[entry.grade] = {
              entryIdx: S.multiYearEntries.indexOf(entry),
              courseIdx: i,
              s1fOrig: course.originalGrades.s1f,
              s2fOrig: course.originalGrades.s2f,
              s1fSim: course.simGrades.s1f,
              s2fSim: course.simGrades.s2f
            };
          }
      S.expectedRequestCount = 0, markDirty();
    }
  }
  var GRADE_MIN, GRADE_MAX, init_year_data = __esm({
    "v8.30/year-data.js"() {
      init_state();
      init_api();
      init_courses();
      init_deadline();
      init_simulation();
      init_ui();
      init_diagnose();
      init_log();
      GRADE_MIN = 9, GRADE_MAX = 12;
    }
  });

  // v8.30/inline-points.js
  function _inlineEnabled() {
    try {
      return localStorage.getItem("ints_inline") !== "0";
    } catch (e) {
      return !0;
    }
  }
  function _isPointsPage() {
    let p = location.pathname.toLowerCase();
    return p === "/points" || p.startsWith("/points/") || p.startsWith("/points?");
  }
  function _rows() {
    return document.querySelectorAll(".ant-table-tbody > tr.ant-table-row");
  }
  function _cellText(td) {
    if (!td) return null;
    let e = td.querySelector(".ellipsis");
    return (e ? e.textContent : td.textContent).trim();
  }
  function _rowInfo(tr) {
    let tds = tr.children, scoreTd = _scoreTdOf(tr);
    return {
      key: tr.getAttribute("data-row-key"),
      subject: _cellText(tds[0]),
      course: _cellText(tds[1]),
      score: _cellText(scoreTd),
      scoreTd
    };
  }
  function _norm(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim().toLowerCase();
  }
  function _matchCourseIndex(info, used) {
    let subj = _norm(info.subject), course = _norm(info.course);
    for (let i = 0; i < S.simCourses.length; i++) {
      if (used.has(i)) continue;
      let c = S.simCourses[i];
      if (_norm(c.subject) === subj && _norm(c.name) === course) return i;
    }
    for (let i = 0; i < S.simCourses.length; i++)
      if (!used.has(i) && _norm(S.simCourses[i].name) === course)
        return i;
    if (course.length >= 6) {
      let hits = [];
      for (let i = 0; i < S.simCourses.length; i++) {
        if (used.has(i)) continue;
        let n = _norm(S.simCourses[i].name);
        n && (n.indexOf(course) >= 0 || course.indexOf(n) >= 0) && hits.push(i);
      }
      if (hits.length === 1) return hits[0];
    }
    return -1;
  }
  function _annualScore(s1f, s2f) {
    let vals = [];
    return typeof s1f == "number" && !isNaN(s1f) && vals.push(s1f), typeof s2f == "number" && !isNaN(s2f) && vals.push(s2f), vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  function _courseAnnual(course, which) {
    if (!course) return null;
    let g = which === "sim" && course.simGrades || course.originalGrades;
    return g ? _annualScore(g.s1f, g.s2f) : null;
  }
  function _gpaSummary() {
    if (!S.originalCourses || !S.originalCourses.length) return null;
    let origAnnual = computeAnnualGPA(S.originalCourses, (c) => c.originalGrades.s1f, (c) => c.originalGrades.s2f);
    !origAnnual && S.currentYearAnnualGPA !== null && S.currentYearCumulativeGPA !== null && (origAnnual = { uw: S.currentYearCumulativeGPA, w: S.currentYearAnnualGPA });
    let simAnnual = S.isCurrentYear ? computeAnnualGPA(S.simCourses, (c) => c.simGrades.s1f, (c) => c.simGrades.s2f) : null;
    return { orig: origAnnual, sim: simAnnual };
  }
  function _schoolAnnual() {
    return S.currentYearAnnualGPA === null || S.currentYearCumulativeGPA === null ? null : { uw: S.currentYearCumulativeGPA, w: S.currentYearAnnualGPA };
  }
  function _gpaHost() {
    return document.querySelector(".grade .section-title .title-text") || document.querySelector(".grade .section-title");
  }
  function _renderGpa() {
    let host = _gpaHost();
    if (!host) return !1;
    let el = document.getElementById(GPA_ID);
    el || (el = document.createElement("span"), el.id = GPA_ID, el.style.cssText = "margin-left:12px;font-size:12px;font-weight:normal;color:rgba(0,0,0,0.65);white-space:nowrap;vertical-align:baseline;", host.appendChild(el));
    let sum = _gpaSummary();
    if (!S.isCurrentYear) {
      let src = _schoolAnnual() || sum && sum.orig || null;
      return src ? (el.innerHTML = '<span style="color:rgba(0,0,0,0.45);">' + t("\u5B66\u5E74GPA", "Annual GPA") + "</span> UW " + _num(src.uw) + " / W " + _num(src.w), el.title = t(
        "\u5F80\u671F\u5B66\u5E74\uFF1A\u53EA\u8BFB\u5C55\u793A\uFF0C\u53D6\u5B66\u6821\u5E74\u5EA6\u62A5\u544A\u7684\u516C\u5E03\u503C\uFF08\u4E0D\u53C2\u4E0E\u6A21\u62DF\u4E0E \u0394\uFF09",
        "Past school year: read-only, values as published in the school annual report (no simulation, no delta)"
      ), !0) : (el.textContent = "", el.removeAttribute("title"), !0);
    }
    if (!sum || !sum.orig)
      return el.textContent = "", el.removeAttribute("title"), !0;
    let o = sum.orig, sim = sum.sim, html = '<span style="color:rgba(0,0,0,0.45);">' + t("\u5B66\u5E74GPA", "Annual GPA") + "</span> ";
    if (sim && (Math.abs(sim.uw - o.uw) > 1e-3 || Math.abs(sim.w - o.w) > 1e-3)) {
      let du = sim.uw - o.uw, dw = sim.w - o.w, gColor = (Math.abs(du) > 1e-3 ? du : dw) > 0 ? COLOR_UP : COLOR_DOWN;
      html += '<span>UW <b style="color:' + gColor + ';">' + _num(sim.uw) + " / W " + _num(sim.w) + '</b> <span style="font-size:11px;">(\u0394 UW: ' + _delta(du) + " \u0394 W: " + _delta(dw) + ")</span></span>";
    } else
      html += "<span>UW " + _num(o.uw) + " / W " + _num(o.w) + "</span>";
    let school = _schoolAnnual();
    return school && (Math.abs(school.uw - o.uw) > 1e-3 || Math.abs(school.w - o.w) > 1e-3) ? el.title = t(
      "\u5B66\u6821\u516C\u5E03\uFF1AUW " + school.uw.toFixed(2) + " / W " + school.w.toFixed(2),
      "School published: UW " + school.uw.toFixed(2) + " / W " + school.w.toFixed(2)
    ) : el.removeAttribute("title"), el.innerHTML !== html && (el.innerHTML = html), !0;
  }
  function td0Text(td) {
    return td ? String(td.textContent || "").replace(/\s+/g, "").slice(0, 20) : "(no-td)";
  }
  function _captureSiteColumns(vm) {
    let hs = vm && vm.dynamicHeaders || [];
    if (!hs.length) return;
    for (let h of hs)
      if ((h && h.customColumnId !== void 0 ? String(h.customColumnId) : "").indexOf(SYNTH_PREFIX) === 0) return;
    let ids = hs.map((h) => h && h.customColumnId !== void 0 ? String(h.customColumnId) : "").filter(Boolean);
    if (!ids.length) return;
    let sig = ids.slice().sort().join(",");
    _siteColSig !== sig && (_siteColSig && _colsExpanded || (_siteColSig = sig, _siteHeaderIds = hs.map((h) => ({
      id: h && h.customColumnId !== void 0 ? String(h.customColumnId) : "",
      field: _headerFieldOf(h)
    }))));
  }
  function _schoolColumnId() {
    for (let c of _siteHeaderIds)
      if (c.id && c.field !== "eoy") return c.id;
    return null;
  }
  function _scoreTdIndex() {
    let want = _schoolColumnId();
    if (want === null) return -1;
    let ths = _synthThs();
    for (let i = 0; i < ths.length; i++)
      if (String(ths[i].getAttribute("key") || "") === want) return i;
    let headers = _vm && _vm.dynamicHeaders || [];
    for (let i = 0; i < headers.length; i++)
      if (headers[i] && String(headers[i].customColumnId) === want) return i + 2;
    return -1;
  }
  function _scoreTdOf(tr) {
    let i = _scoreTdIndex();
    return i >= 0 && tr.children[i] || null;
  }
  function _markRowDone(tr) {
    tr.setAttribute(ROW_ATTR, "1");
  }
  function _siteScoreTextNode(inner) {
    let wrap = inner.querySelector("[" + SCORE_WRAP_ATTR + "]");
    if (wrap) return wrap.firstChild;
    for (let n = inner.firstChild; n; n = n.nextSibling)
      if (n.nodeType === 3 && String(n.nodeValue || "").trim()) return n;
    return null;
  }
  function _restoreScoreCell(td) {
    if (!td) return;
    let inner = td.firstElementChild || td, wrap = inner.querySelector("[" + SCORE_WRAP_ATTR + "]");
    if (wrap && wrap.parentNode) {
      for (; wrap.firstChild; ) wrap.parentNode.insertBefore(wrap.firstChild, wrap);
      wrap.remove();
    }
    let sim = inner.querySelector("[" + SCORE_SIM_ATTR + "]");
    sim && sim.remove();
  }
  function _scoreNum(v) {
    return typeof v == "number" && !isNaN(v) ? v.toFixed(2) : "\u2014";
  }
  function _levelSuffix(shownScore, siteText) {
    let s = String(siteText == null ? "" : siteText).trim(), i = s.lastIndexOf("/");
    if (i <= 0) return "";
    let before = Number(s.slice(0, i).trim());
    if (!s.slice(i + 1).trim() || isNaN(before)) return "";
    let letter = scoreToLetter(shownScore);
    return letter ? "/" + letter : "";
  }
  function _delta2(v) {
    return (v > 0 ? "+" : "") + v.toFixed(2);
  }
  function _siteScoreParts(siteText) {
    let s = String(siteText == null ? "" : siteText).replace(/\s+/g, " ").trim(), i = s.lastIndexOf("/");
    if (i <= 0) return { score: null, level: "", raw: "" };
    let raw = s.slice(0, i).trim(), before = Number(raw), after = s.slice(i + 1).trim();
    return { score: isNaN(before) ? null : before, level: after || "", raw };
  }
  function _pairLinesHtml(oldScoreText, oldLevelText, shown, delta, showDelta, deltaAttr) {
    let oldScore = oldScoreText == null || oldScoreText === "" ? "\u2014" : String(oldScoreText), oldLevel = oldLevelText == null || oldLevelText === "" ? "\u2014" : String(oldLevelText), blue = "color:" + SIM_BLUE + ";", dText = showDelta ? "<span " + deltaAttr + '="1" style="font-size:10px;color:' + (delta > 0 ? COLOR_UP : COLOR_DOWN) + ';"> (' + _delta2(delta) + ")</span>" : "";
    return '<div data-ints-line="score" style="white-space:nowrap;line-height:1.35;font-size:14px;"><span>' + escapeHtml(oldScore) + "</span>" + iconArrowRight() + '<span style="' + blue + '">' + escapeHtml(_scoreNum(shown)) + '</span></div><div data-ints-line="level" style="white-space:nowrap;line-height:1.3;font-size:11px;"><span>' + escapeHtml(oldLevel) + "</span>" + iconArrowRight() + '<span style="' + blue + '">' + escapeHtml(scoreToLetter(shown) || "\u2014") + "</span>" + dText + "</div>";
  }
  function _renderRow(tr, courseIdx) {
    let course = S.simCourses[courseIdx];
    if (!course) return;
    if (!S.isCurrentYear) {
      _clearTaskCells(tr);
      let scoreTdPast = _scoreTdOf(tr);
      if (scoreTdPast) {
        if (_restoreScoreCell(scoreTdPast), !_scoreColumnIsField()) {
          let staleBox = scoreTdPast.querySelector("[data-ints-sim]");
          staleBox && staleBox.remove();
        }
        scoreTdPast.setAttribute(INLINE_ATTR, "1"), scoreTdPast.getAttribute("data-ints-clickable") !== null && scoreTdPast.removeAttribute("data-ints-clickable"), scoreTdPast.style.cursor && (scoreTdPast.style.cursor = ""), scoreTdPast.getAttribute("title") && scoreTdPast.removeAttribute("title");
      }
      _markRowDone(tr), safe("\u5185\u8054\u5C55\u5F00\u5217 GPA", () => _decorateColumnCells(tr, courseIdx));
      return;
    }
    _renderTaskCells(tr, courseIdx, course), _renderVirtualCells(tr, courseIdx, course);
    let scoreTd = _scoreTdOf(tr);
    if (!scoreTd) {
      _markRowDone(tr), safe("\u5185\u8054\u5C55\u5F00\u5217 GPA", () => _decorateColumnCells(tr, courseIdx));
      return;
    }
    let simScore = _courseAnnual(course, "sim"), origScore = _courseAnnual(course, "orig"), delta = simScore !== null && origScore !== null ? simScore - origScore : null, showDelta = delta !== null && Math.abs(delta) >= SCORE_DELTA_EPS, simmed = valueIsSimulated(simScore, origScore), starred = !!(course.showStar && (course.showStar.s1 || course.showStar.s2)), gpaOrig = getGPAForScore(origScore, course.weightBonus), gpaSim = showDelta ? getGPAForScore(simScore, course.weightBonus) : null, inner = _cellInner(scoreTd), foreign = inner.innerHTML.indexOf("UW:") >= 0 && !inner.querySelector("[data-ints-sim]"), showGpa = !!gpaOrig && !foreign, box = scoreTd.querySelector("[data-ints-sim]"), shown = simScore !== null ? simScore : origScore, wrap0 = inner.querySelector("[" + SCORE_WRAP_ATTR + "]");
    if (shown !== null) {
      let wrap = wrap0;
      if (!wrap) {
        let node = _siteScoreTextNode(inner);
        node && (wrap = document.createElement("span"), wrap.setAttribute(SCORE_WRAP_ATTR, "1"), node.parentNode.insertBefore(wrap, node), wrap.appendChild(node));
      }
      let siteText = wrap ? String(wrap.textContent || "").replace(/\s+/g, " ").trim() : "";
      wrap && (wrap.style.display = "none");
      let simEl = inner.querySelector("[" + SCORE_SIM_ATTR + "]");
      simEl || (simEl = document.createElement("div"), simEl.setAttribute(SCORE_SIM_ATTR, "1"), wrap ? wrap.insertAdjacentElement("afterend", simEl) : inner.insertBefore(simEl, inner.firstChild)), simEl.style.color = "";
      let parts = _siteScoreParts(siteText), html2 = simmed ? _pairLinesHtml(parts.raw, parts.level, shown, delta, showDelta, SCORE_DELTA_ATTR) : escapeHtml(_scoreNum(shown) + _levelSuffix(shown, siteText));
      simEl.innerHTML !== html2 && (simEl.innerHTML = html2), simEl.title = t("\u6A21\u62DF\u503C", "Simulated") + " \xB7 " + t("\u539F\u59CB ", "was ") + siteText + (showDelta ? " \xB7 " + t("\u0394 ", "delta ") + _delta2(delta) : "");
    } else (wrap0 || inner.querySelector("[" + SCORE_SIM_ATTR + "]")) && _restoreScoreCell(scoreTd);
    if (safe("\u5185\u8054\u5C55\u5F00\u5217 GPA", () => _decorateColumnCells(tr, courseIdx)), !showGpa && !starred) {
      box && box.remove(), scoreTd.setAttribute(INLINE_ATTR, "1"), _markRowDone(tr);
      return;
    }
    box || (box = document.createElement("div"), box.setAttribute("data-ints-sim", "1"), box.style.cssText = "font-size:10px;line-height:1.35;margin-top:2px;white-space:nowrap;color:rgba(0,0,0,0.5);", inner.appendChild(box)), simmed ? box.classList.add("ints-gpa-strong") : box.classList.remove("ints-gpa-strong");
    let html = "";
    if (showGpa) {
      let g = gpaSim || gpaOrig, changed = gpaSim && (Math.abs(gpaSim.uw - gpaOrig.uw) > 1e-3 || Math.abs(gpaSim.w - gpaOrig.w) > 1e-3), gu = changed ? gpaSim.uw - gpaOrig.uw : 0, gw = changed ? gpaSim.w - gpaOrig.w : 0, gDir = Math.abs(gu) > 1e-3 ? gu : gw, gColor = changed ? gDir > 0 ? COLOR_UP : COLOR_DOWN : "", tip = changed ? t(
        "\u6A21\u62DF\u540E GPA\uFF08\u539F UW: " + _num(gpaOrig.uw) + ", W: " + _num(gpaOrig.w) + "\uFF09",
        "Simulated GPA (was UW: " + _num(gpaOrig.uw) + ", W: " + _num(gpaOrig.w) + ")"
      ) : t("\u672C\u8BFE\u7A0B GPA", "Course GPA");
      html += '<span style="' + (gColor ? "color:" + gColor + ";" : "") + '" title="' + escapeHtml(tip) + '">(UW: ' + _num(g.uw) + ", W: " + _num(g.w) + ")</span>";
    }
    starred && (html += '<span style="color:#f5222d;margin-left:4px;cursor:help;" title="' + escapeHtml(t(
      "\u5B66\u6821\u7ED9\u7684\u5206\u4E0E\u6309\u4EFB\u52A1\u660E\u7EC6\u7B97\u51FA\u7684\u5206\u4E0D\u4E00\u81F4\uFF08\u5DEE > 0.1\uFF09\uFF0C\u8BE5\u79D1\u76EE\u7684\u6A21\u62DF\u4EC5\u4F9B\u53C2\u8003\u3002",
      "School value differs from the task-based estimate by >0.1; this course is an estimate only."
    )) + '">*</span>'), box.innerHTML = html, scoreTd.setAttribute(INLINE_ATTR, "1"), _markRowDone(tr), scoreTd.getAttribute("data-ints-clickable") !== "1" && scoreTd.setAttribute("data-ints-clickable", "1"), scoreTd._intsClickBound || (scoreTd._intsClickBound = !0, scoreTd.style.cursor = "pointer", scoreTd.title = t("\u70B9\u51FB\u7F16\u8F91\u8BE5\u79D1\u76EE\u7684\u6A21\u62DF\u6210\u7EE9", "Click to edit this course simulation"), scoreTd.addEventListener("click", guardListener("\u5185\u8054\u7F16\u8F91\u7A97\u53E3", (e) => {
      e.stopPropagation();
      let now = _matchCourseIndex(_rowInfo(tr), /* @__PURE__ */ new Set());
      _openEditor(tr, now >= 0 ? now : courseIdx);
    })));
  }
  function _fieldCellWant(ci, f) {
    let v = _fieldValue(ci, f);
    return !v || v.score === null ? null : v.score + "/" + v.level;
  }
  function _findFieldCell(tr, idx, want) {
    let wantText = String(want).replace(/\s+/g, "");
    for (let off of FIELD_CELL_SEARCH) {
      let td = tr.children[idx + off];
      if (td && !(td.querySelector && td.querySelector(".task-title")) && String(td.textContent || "").replace(/\s+/g, "").indexOf(wantText) >= 0)
        return td;
    }
    return null;
  }
  function _isExamField(f) {
    return f === "s1e" || f === "s2e";
  }
  function _eFieldEditable(ci, field) {
    if (!_isExamField(field)) return !0;
    let c = S.simCourses && S.simCourses[ci], orig = c && c.originalGrades ? c.originalGrades[field] : null;
    return !(typeof orig == "number" && !isNaN(orig));
  }
  function _cellSiteTextNode(inner) {
    let wrap = inner.querySelector("[" + FIELD_WRAP_ATTR + "]");
    if (wrap) return wrap.firstChild;
    for (let n = inner.firstChild; n; n = n.nextSibling)
      if (n.nodeType === 3 && String(n.nodeValue || "").trim()) return n;
    return null;
  }
  function _hideFieldSiteText(inner, f) {
    let wrap = inner.querySelector("[" + FIELD_WRAP_ATTR + "]");
    if (!wrap) {
      let node = _cellSiteTextNode(inner);
      if (!node) return null;
      wrap = document.createElement("span"), wrap.setAttribute(FIELD_WRAP_ATTR, f), node.parentNode.insertBefore(wrap, node), wrap.appendChild(node);
    }
    return wrap.style.display = "none", wrap;
  }
  function _restoreFieldCell(cell) {
    if (!cell) return;
    let inner = _cellInner(cell), wrap = inner.querySelector("[" + FIELD_WRAP_ATTR + "]");
    if (wrap && wrap.parentNode) {
      for (; wrap.firstChild; ) wrap.parentNode.insertBefore(wrap.firstChild, wrap);
      wrap.remove();
    }
    let block = inner.querySelector("[" + FIELD_BLOCK_ATTR + "]");
    block && block.remove();
  }
  function _renderFieldGpa(cell, inner, course, shown, strong) {
    let box = cell.querySelector("[data-ints-sim]");
    if (box && box.parentElement !== inner && (box.remove(), box = null), shown == null || isNaN(shown)) {
      box && box.remove();
      return;
    }
    let g = getGPAForScore(shown, course.weightBonus);
    if (!g) {
      box && box.remove();
      return;
    }
    box || (box = document.createElement("div"), box.setAttribute("data-ints-sim", "1"), box.style.cssText = "font-size:10px;line-height:1.35;margin-top:2px;white-space:nowrap;color:rgba(0,0,0,0.5);", inner.appendChild(box)), strong ? box.classList.add("ints-gpa-strong") : box.classList.remove("ints-gpa-strong"), box.previousElementSibling !== null && inner.appendChild(box);
    let html = '<span title="' + escapeHtml(t("\u672C\u8BFE\u7A0B GPA", "Course GPA")) + '">(UW: ' + _num(g.uw) + ", W: " + _num(g.w) + ")</span>";
    box.innerHTML !== html && (box.innerHTML = html);
  }
  function _renderFieldCell(cell, course, f, isSynth) {
    var _a;
    if (!cell) return;
    let inner = _cellInner(cell), orig = (course.originalGrades || {})[f], sim = (course.simGrades || {})[f], hasVal = (v) => typeof v == "number" && !isNaN(v), shown = hasVal(sim) ? sim : hasVal(orig) ? orig : null;
    if (_isExamField(f)) {
      _restoreFieldCell(cell);
      let ours = isSynth || valueIsSimulated(sim, orig);
      cell.style.color = ours ? SIM_BLUE : "", _renderFieldGpa(cell, inner, course, shown, ours);
      return;
    }
    cell.style.color = "";
    let simmed = valueIsSimulated(sim, orig) && shown !== null, gpaFrom = !simmed && !isSynth && (_a = _cellScoreNum(cell)) != null ? _a : shown;
    if (simmed) {
      let wrap = _hideFieldSiteText(inner, f), siteText = wrap ? String(wrap.textContent || "").replace(/\s+/g, " ").trim() : "", parts = _siteScoreParts(siteText), oldScore = parts.raw || (hasVal(orig) ? _scoreNum(orig) : ""), oldLevel = parts.level || hasVal(orig) && scoreToLetter(orig) || "", delta = hasVal(sim) && hasVal(orig) ? sim - orig : null, showDelta = delta !== null && Math.abs(delta) >= SCORE_DELTA_EPS, block = inner.querySelector("[" + FIELD_BLOCK_ATTR + "]");
      if (!block) {
        block = document.createElement("div"), block.setAttribute(FIELD_BLOCK_ATTR, f);
        let old = inner.querySelector("[data-ints-sim]");
        old ? inner.insertBefore(block, old) : inner.appendChild(block);
      }
      let html = _pairLinesHtml(oldScore, oldLevel, shown, delta, showDelta, COL_DELTA_ATTR);
      block.innerHTML !== html && (block.innerHTML = html), block.title = t("\u6A21\u62DF\u503C", "Simulated") + " \xB7 " + t("\u539F\u59CB ", "was ") + (siteText || oldScore) + (showDelta ? " \xB7 " + t("\u0394 ", "delta ") + _delta2(delta) : "");
    } else
      _restoreFieldCell(cell);
    _renderFieldGpa(cell, inner, course, gpaFrom, simmed);
  }
  function _synthThs() {
    return _synthThCache && _synthThCache.length && _synthThCache[0].isConnected || (_synthThCache = Array.prototype.slice.call(
      document.querySelectorAll(".ant-table-header thead th, .ant-table-thead th")
    )), _synthThCache;
  }
  function _thTitle(th) {
    let el = th.querySelector ? th.querySelector(".ant-table-column-title") : null;
    return String((el ? el.textContent : th.textContent) || "").trim().toUpperCase();
  }
  function _thFieldOf(th) {
    let key = th.getAttribute("key") || "";
    if (key.indexOf(SYNTH_PREFIX) === 0) {
      let f = key.slice(SYNTH_PREFIX.length);
      return FIELD_LABEL[f] ? f : null;
    }
    return FIELD_BY_LABEL[_thTitle(th)] || null;
  }
  function _cellScoreNum(td) {
    if (!td) return null;
    let inner = td.firstElementChild || td;
    for (let n = inner.firstChild; n; n = n.nextSibling) {
      if (n.nodeType !== 3) continue;
      let m = /(\d+(?:\.\d+)?)/.exec(String(n.nodeValue || ""));
      if (m) return Number(m[1]);
    }
    return null;
  }
  function _decorateEoyCell(td, course) {
    if (!td || td.querySelector && td.querySelector(".task-title")) return;
    let inner = _cellInner(td), siteScore = _cellScoreNum(td), simAnnual = _courseAnnual(course, "sim"), origAnnual = _courseAnnual(course, "orig"), simmed = valueIsSimulated(simAnnual, origAnnual) && simAnnual !== null;
    if (simmed) {
      let wrap = _hideFieldSiteText(inner, "eoy"), siteText = wrap ? String(wrap.textContent || "").replace(/\s+/g, " ").trim() : "", parts = _siteScoreParts(siteText), delta = simAnnual !== null && origAnnual !== null ? simAnnual - origAnnual : null, showDelta = delta !== null && Math.abs(delta) >= SCORE_DELTA_EPS, block = inner.querySelector("[" + FIELD_BLOCK_ATTR + "]");
      if (!block) {
        block = document.createElement("div"), block.setAttribute(FIELD_BLOCK_ATTR, "eoy");
        let old = inner.querySelector("[data-ints-sim]");
        old ? inner.insertBefore(block, old) : inner.appendChild(block);
      }
      let html = _pairLinesHtml(parts.raw, parts.level, simAnnual, delta, showDelta, COL_DELTA_ATTR);
      block.innerHTML !== html && (block.innerHTML = html);
    } else
      _restoreFieldCell(td);
    _renderFieldGpa(td, inner, course, simmed ? simAnnual : siteScore, simmed);
  }
  function _scoreColumnIsField() {
    let ths = _synthThs(), i = _scoreTdIndex(), th = i >= 0 ? ths[i] : null;
    return !!(th && _thFieldOf(th));
  }
  function _cellInner(td) {
    for (let n = td.firstElementChild; n; n = n.nextElementSibling) {
      if (!n.hasAttribute) return n;
      if (!(n.hasAttribute("data-ints-sim") || n.hasAttribute(FIELD_BLOCK_ATTR) || n.hasAttribute(FIELD_WRAP_ATTR)))
        return n;
    }
    return td;
  }
  function _decorateColumnCells(tr, courseIdx) {
    let course = S.simCourses && S.simCourses[courseIdx];
    if (!course) {
      _colTrace = { stop: "no-course" };
      return;
    }
    let ths = _synthThs();
    if (!ths.length) {
      _colTrace = { stop: "no-ths" };
      return;
    }
    let scoreIdx = _scoreTdIndex(), _tr = { ths: ths.length, scoreIdx, items: [] };
    _colTrace = _tr;
    for (let i = 0; i < ths.length; i++) {
      let f = _thFieldOf(ths[i]);
      if (!f) continue;
      let isSynth = String(ths[i].getAttribute("key") || "").indexOf(SYNTH_PREFIX) === 0, td = tr.children[i];
      if (!td) continue;
      if (!isSynth) {
        if (i === scoreIdx && S.isCurrentYear) {
          _tr.items.push(i + ":skip-score");
          continue;
        }
        if (f === "eoy") {
          _decorateEoyCell(td, course), _tr.items.push(i + ":eoy");
          continue;
        }
        _renderFieldCell(td, course, f, !1), _tr.items.push(i + ":school:" + td0Text(td).slice(0, 12));
        continue;
      }
      let want = _fieldCellWant(courseIdx, f), cell = want ? _findFieldCell(tr, i, want) : null;
      if (!cell) {
        let stale = td.querySelector("[data-ints-sim]");
        stale && stale.remove(), _restoreFieldCell(td), _tr.items.push(i + ":" + f + (want ? ":nocell" : ":nowant"));
        continue;
      }
      cell !== td && cell.querySelector("[data-ints-sim]") || (_renderFieldCell(cell, course, f, !0), _tr.items.push(i + ":" + f + ":field" + (cell.isConnected ? "" : "!disc")));
    }
  }
  function _taskKey(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim().toLowerCase();
  }
  function _taskCellsOf(tr) {
    return Array.prototype.filter.call(tr.children, (td) => td.querySelector && td.querySelector(".task-title"));
  }
  function _taskIndexOf(course, name, vtIdAttr) {
    let tasks = course && Array.isArray(course.tasks) ? course.tasks : [];
    if (vtIdAttr != null && vtIdAttr !== "") {
      let id = parseInt(vtIdAttr, 10);
      if (!isNaN(id)) {
        for (let i = 0; i < tasks.length; i++)
          if (tasks[i] && tasks[i].entityId === id) return i;
        return -1;
      }
    }
    let key = _taskKey(name);
    if (!key) return -1;
    for (let i = 0; i < tasks.length; i++)
      if (_taskKey(tasks[i] && tasks[i].name) === key) return i;
    return -1;
  }
  function _siteScoreSpan(td) {
    let spans = td.querySelectorAll("span");
    for (let i = 0; i < spans.length; i++)
      if (!spans[i].closest(".task-title")) return spans[i];
    return null;
  }
  function _taskSimOf(task) {
    return task && typeof task.simulatedScore == "number" ? task.simulatedScore : null;
  }
  function _taskScoreDisplay(score, topScore) {
    return score === -1 ? t("\u5DF2\u6392\u9664", "Excluded") : typeof score == "number" && typeof topScore == "number" ? score + "/" + topScore : typeof score == "number" ? String(score) : t("\u672A\u8BC4\u5206", "Not graded");
  }
  function _renderTaskCells(tr, courseIdx, course) {
    tr && _taskCellsOf(tr).forEach((td) => {
      if (td === _taskEditing) return;
      let titleEl = td.querySelector(".task-title"), vtId = td.getAttribute(VTASK_ATTR), ti = _taskIndexOf(course, titleEl ? titleEl.textContent : "", vtId), siteSpan = _siteScoreSpan(td), mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
      if (ti < 0 || !siteSpan) {
        if (vtId !== null) {
          _clearVirtualCell(td);
          return;
        }
        td.removeAttribute("data-ints-task"), mine && mine.remove(), siteSpan && (siteSpan.style.display = "");
        return;
      }
      let task = course.tasks[ti], sim = _taskSimOf(task), orig = typeof task.originalScore == "number" ? task.originalScore : null;
      if (!(sim !== null && (sim === -1 || orig === null || Math.abs(sim - orig) > 1e-3)))
        mine && mine.remove(), siteSpan.style.display = "";
      else {
        siteSpan.style.display = "none";
        let el = mine;
        el || (el = document.createElement("span"), el.setAttribute(TASK_SCORE_ATTR, "1"), siteSpan.insertAdjacentElement("afterend", el));
        let color = sim === -1 || orig !== null && sim < orig ? COLOR_DOWN : COLOR_UP;
        el.style.cssText = "min-height:21px;display:block;color:" + color + ";", el.textContent = _taskScoreDisplay(sim, task.topScore), el.title = t("\u6A21\u62DF\u503C", "Simulated") + " \xB7 " + t("\u539F\u59CB ", "was ") + _taskScoreDisplay(orig, task.topScore) + (typeof task.topScore == "number" ? " \xB7 " + t("\u6EE1\u5206 ", "max ") + task.topScore : "");
      }
      td.setAttribute("data-ints-task", String(ti)), td.getAttribute("data-ints-taskbound") !== "1" && td.setAttribute("data-ints-taskbound", "1"), td._intsTaskClickBound || (td._intsTaskClickBound = !0, td.style.cursor = "pointer", td.title = t("\u70B9\u51FB\u7F16\u8F91\u8BE5\u4EFB\u52A1\u7684\u6A21\u62DF\u5F97\u5206\uFF08-1 = \u4E0D\u8BA1\u5165\uFF09", "Click to edit this task score (-1 = excluded)"), td.addEventListener("click", guardListener("\u5185\u8054\u4EFB\u52A1\u7F16\u8F91", (e) => {
        let idx = td.getAttribute("data-ints-task");
        idx !== null && (e.stopPropagation(), _beginTaskEdit(td, courseIdx, parseInt(idx, 10)));
      })));
    });
  }
  function _clearTaskCells(tr) {
    tr && Array.prototype.forEach.call(tr.children, (td) => {
      if (!td || !td.getAttribute) return;
      if (td.getAttribute(VTASK_ATTR) !== null) {
        _clearVirtualCell(td);
        return;
      }
      if (!td.querySelector || !td.querySelector(".task-title")) return;
      let mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
      mine && mine.remove();
      let siteSpan = _siteScoreSpan(td);
      siteSpan && siteSpan.style.display === "none" && (siteSpan.style.display = ""), td.removeAttribute("data-ints-task"), td.removeAttribute("data-ints-taskbound"), td.style.cursor && (td.style.cursor = ""), td.getAttribute("title") && td.removeAttribute("title");
    });
  }
  function _vtaskList(course) {
    let out = [], tasks = course && Array.isArray(course.tasks) ? course.tasks : [];
    for (let i = 0; i < tasks.length; i++)
      tasks[i] && tasks[i].isVirtual && out.push({ task: tasks[i], i });
    return out;
  }
  function _emptyTaskCells(tr) {
    return Array.prototype.filter.call(tr.children, (td) => !(!td || !td.classList || !td.classList.contains("ant-table-row-cell-break-word") || (td.getAttribute("style") || "").indexOf("padding: 0px") < 0 || td.querySelector(".task-title") || (td.textContent || "").trim()));
  }
  function _clearVirtualCell(td) {
    td && (td.removeAttribute(VTASK_ATTR), td.removeAttribute("data-ints-task"), td.innerHTML = "", td.style.cursor = "", td.removeAttribute("title"));
  }
  function _refTaskCell(tr) {
    let cells = _taskCellsOf(tr);
    for (let td of cells)
      if (td.getAttribute(VTASK_ATTR) === null && td.querySelector(".task-title")) return td;
    return null;
  }
  function _vtaskStyles(tr) {
    let ref = _refTaskCell(tr);
    if (!ref) return VTASK_FALLBACK;
    let box = ref.firstElementChild, title = ref.querySelector(".task-title"), scoreBar = title ? title.nextElementSibling : null, scoreSpan = scoreBar ? scoreBar.querySelector("span") : null, styleOf = (el, fb) => el && el.getAttribute("style") ? el.getAttribute("style") : fb;
    return {
      box: styleOf(box, VTASK_FALLBACK.box),
      title: styleOf(title, VTASK_FALLBACK.title),
      scoreBar: styleOf(scoreBar, VTASK_FALLBACK.scoreBar),
      score: styleOf(scoreSpan, VTASK_FALLBACK.score)
    };
  }
  function _vtaskTitleStyle(base) {
    let keep = String(base || "").replace(/background(-color)?\s*:[^;]*;?/gi, "").replace(/box-shadow\s*:[^;]*;?/gi, "").trim();
    return keep + (keep && !/;\s*$/.test(keep) ? ";" : "") + "background-color:#d9f7be;box-shadow:inset 0 0 0 1px " + COLOR_UP + ";";
  }
  function _paintVirtualCell(td, v, tr) {
    let scope = _siteScopeAttr(), attr = scope ? " " + scope + '=""' : "", task = v.task, st = _vtaskStyles(tr), score = typeof task.simulatedScore == "number" ? task.simulatedScore : typeof task.originalScore == "number" ? task.originalScore : null, text = _taskScoreDisplay(score, typeof task.topScore == "number" ? task.topScore : null), box = td.querySelector("[data-ints-vtask-box]");
    box || (td.innerHTML = '<div data-ints-vtask-box="1"' + attr + ' style="' + st.box + '"><div class="task-title" data-ints-vtask-title="1"' + attr + ' style="' + _vtaskTitleStyle(st.title) + '"><span' + attr + "></span></div><div" + attr + ' style="' + st.scoreBar + '"><span' + attr + ' style="' + st.score + '"></span></div></div>', box = td.querySelector("[data-ints-vtask-box]"));
    let nameEl = box.querySelector("[data-ints-vtask-title] span");
    nameEl && nameEl.textContent !== task.name && (nameEl.textContent = task.name);
    let scoreSpans = box.querySelectorAll("div > span"), scoreEl = scoreSpans[scoreSpans.length - 1];
    return scoreEl && scoreEl.textContent !== text && (scoreEl.textContent = text), td.style.cursor = "pointer", box;
  }
  function _renderVirtualCells(tr, courseIdx, course) {
    if (!tr || !course) return;
    let vts = _vtaskList(course);
    if (Array.prototype.forEach.call(tr.children, (td) => {
      let id = td.getAttribute ? td.getAttribute(VTASK_ATTR) : null;
      id != null && (vts.some((v) => String(v.task.entityId) === String(id)) || _clearVirtualCell(td));
    }), !vts.length) return;
    let rebuilt = !1;
    for (let v of vts) {
      let td = null;
      if (Array.prototype.forEach.call(tr.children, (el) => {
        !td && el.getAttribute && String(el.getAttribute(VTASK_ATTR)) === String(v.task.entityId) && (td = el);
      }), !td) {
        let cands = _emptyTaskCells(tr);
        td = cands.length ? cands[0] : null, td && (rebuilt = !0);
      }
      if (!td) {
        log("[\u5185\u8054] \u8BE5\u884C\u6CA1\u6709\u7A7A\u4EFB\u52A1\u683C\uFF0C\u865A\u62DF\u4EFB\u52A1\u300C" + v.task.name + "\u300D\u4E0D\u4E0A\u8868\u683C\uFF08\u4ECD\u8BA1\u5165\u5E73\u65F6\u6210\u7EE9\uFF09");
        continue;
      }
      td.setAttribute(VTASK_ATTR, String(v.task.entityId)), td !== _taskEditing && _paintVirtualCell(td, v, tr);
    }
    rebuilt && _renderTaskCells(tr, courseIdx, course);
  }
  function _closeTaskEditor() {
    let td = _taskEditing;
    if (_taskEditing = null, !td) return;
    let input = td.querySelector("[" + TASK_INPUT_ATTR + "]");
    input && (input._intsCancelled = !0, input.remove());
    let mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
    mine && mine.remove();
    let siteSpan = _siteScoreSpan(td);
    siteSpan && (siteSpan.style.display = "");
  }
  function _beginTaskEdit(td, courseIdx, taskIdx) {
    if (!S.isCurrentYear) return;
    let course = S.simCourses[courseIdx], task = course && course.tasks && course.tasks[taskIdx], siteSpan = _siteScoreSpan(td), host = siteSpan ? siteSpan.parentElement : null;
    if (!task || !siteSpan || !host) return;
    _taskEditing && _taskEditing !== td && _closeTaskEditor();
    let sim = _taskSimOf(task), currentScore = sim !== null ? sim : typeof task.originalScore == "number" ? task.originalScore : null, topScore = typeof task.topScore == "number" ? task.topScore : null, mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
    mine && (mine.style.display = "none"), siteSpan.style.display = "none";
    let input = document.createElement("input");
    input.type = "number", input.setAttribute(TASK_INPUT_ATTR, "1"), input.value = currentScore === null ? "" : String(currentScore), input.style.cssText = "width:80px;padding:2px;text-align:center;height:21px;box-sizing:border-box;", host.appendChild(input), _taskEditing = td;
    try {
      input.focus(), input.select();
    } catch (e) {
    }
    let done = !1, repaint = () => safe("\u5185\u8054\u4EFB\u52A1\u91CD\u753B", () => {
      let row = td.closest("tr");
      row && _renderTaskCells(row, courseIdx, S.simCourses[courseIdx]);
    }), finish = () => {
      if (done || input._intsCancelled) return;
      done = !0;
      let v = input.value.trim();
      if (v === "") v = null;
      else {
        let num = parseFloat(v);
        isNaN(num) ? num = null : num === -1 ? num = -1 : num < 0 ? num = currentScore : topScore !== null && num > topScore && (num = topScore), v = num;
      }
      _taskEditing = null, input.parentElement && input.remove(), onTaskScoreChange(courseIdx, taskIdx, v), repaint();
    };
    input.addEventListener("blur", guardListener("\u5185\u8054\u4EFB\u52A1\u63D0\u4EA4", finish)), input.addEventListener("keydown", guardListener("\u5185\u8054\u4EFB\u52A1\u952E\u76D8", (e) => {
      e.key === "Enter" ? finish() : e.key === "Escape" && (done = !0, _taskEditing = null, input.parentElement && input.remove(), repaint());
    }));
  }
  function _ciOfIdent(ident) {
    if (!ident || !S.simCourses) return -1;
    for (let i = 0; i < S.simCourses.length; i++)
      if (courseIdent(S.simCourses[i]) === ident) return i;
    return -1;
  }
  function _ciOfWindow(win) {
    let ident = win && win.el ? win.el.getAttribute("data-ie-ident") : null, byIdent = _ciOfIdent(ident);
    if (byIdent >= 0) return byIdent;
    let n = parseInt(win.el.getAttribute("data-ie-ci") || "", 10);
    return isNaN(n) ? -1 : n;
  }
  function _scoreVal(ci, field) {
    let c = S.simCourses[ci];
    if (!c) return null;
    let sim = c.simGrades ? c.simGrades[field] : null, orig = c.originalGrades ? c.originalGrades[field] : null;
    return { sim, orig, overridden: valueIsSimulated(sim, orig) };
  }
  function _deltaInfo(sim, orig) {
    if (typeof sim != "number" || typeof orig != "number" || isNaN(sim) || isNaN(orig)) return null;
    let d = sim - orig, dec = _dec();
    return Math.abs(d) < 0.5 * Math.pow(10, -dec) ? null : { text: " (" + (d > 0 ? "+" : "") + d.toFixed(dec) + ")", color: d > 0 ? COLOR_UP : COLOR_DOWN };
  }
  function _deltaSpanHtml(field, ci) {
    let v = _scoreVal(ci, field), info = v ? _deltaInfo(v.sim, v.orig) : null;
    return '<span data-ie-delta="' + field + '" style="font-size:10px;white-space:nowrap;' + (info ? "color:" + info.color + ";" : "display:none;") + '">' + (info ? escapeHtml(info.text) : "") + "</span>";
  }
  function _applyDeltaSpan(sp, info) {
    if (!sp) return;
    sp.style.display = info ? "" : "none", sp.style.color = info ? info.color : "";
    let txt = info ? info.text : "";
    sp.textContent !== txt && (sp.textContent = txt);
  }
  function _fieldHtml(ci, field, label) {
    let v = _scoreVal(ci, field);
    if (!_eFieldEditable(ci, field))
      return '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:8px;" title="' + escapeHtml(t("\u5B66\u6821\u5DF2\u53D1\u5E03\u8BE5\u8003\u8BD5\u6210\u7EE9\uFF0C\u4E0D\u5141\u8BB8\u518D\u6A21\u62DF", "Official exam score published \u2014 simulation disabled")) + '"><span style="color:rgba(0,0,0,0.55);font-size:11px;">' + label + '</span><span data-ie-locked="' + field + '" style="min-width:56px;padding:2px 4px;text-align:center;font-size:12px;border:1px solid #f0f0f0;border-radius:4px;background:#fafafa;color:rgba(0,0,0,0.75);">' + (v.sim === null ? "\u2014" : _num(v.sim)) + "</span>" + _deltaSpanHtml(field, ci) + "</span>";
    let shown = v.sim === null ? "" : _num(v.sim);
    return '<label style="display:inline-flex;align-items:center;gap:4px;margin-right:8px;"><span style="color:rgba(0,0,0,0.55);font-size:11px;">' + label + '</span><input data-ie-field="' + field + '" type="text" inputmode="decimal" value="' + escapeHtml(shown) + '" placeholder="\u2014" style="width:56px;padding:2px 4px;text-align:center;border:1px solid ' + (v.overridden ? "#1890ff" : "#d9d9d9") + ";border-radius:4px;font-size:12px;" + (v.overridden ? "background:#e6f7ff;" : "") + '">' + _deltaSpanHtml(field, ci) + "</label>";
  }
  function _readonlyHtml(ci, field, label, fKey) {
    let v = _scoreVal(ci, field);
    return '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:8px;"><span style="color:rgba(0,0,0,0.55);font-size:11px;">' + label + '</span><span data-ie-f="' + fKey + '" style="min-width:56px;text-align:center;font-size:12px;color:rgba(0,0,0,0.75);">' + (v.sim === null ? "\u2014" : _num(v.sim)) + "</span>" + _deltaSpanHtml(field, ci) + "</span>";
  }
  function _refreshEditorWindows() {
    for (let win of listWindows()) {
      if (win.kind !== IE_KIND) continue;
      let ci = _ciOfWindow(win), c = ci >= 0 ? S.simCourses[ci] : null;
      if (!c) {
        closeWindow(win.key);
        continue;
      }
      win.el.setAttribute("data-ie-ci", String(ci)), win.el.querySelectorAll("input[data-ie-field]").forEach((inp) => {
        if (document.activeElement === inp) return;
        let f = inp.getAttribute("data-ie-field"), v = _scoreVal(ci, f);
        inp.value = v.sim === null ? "" : _num(v.sim), inp.style.borderColor = v.overridden ? "#1890ff" : "#d9d9d9", inp.style.background = v.overridden ? "#e6f7ff" : "";
      });
      for (let term of ["s1", "s2"]) {
        let span = win.el.querySelector('[data-ie-f="' + IE_F_IDS[term] + '"]');
        if (!span) continue;
        let v = _scoreVal(ci, term + "f");
        span.textContent = v.sim === null ? "\u2014" : _num(v.sim);
      }
      win.el.querySelectorAll("[data-ie-locked]").forEach((sp) => {
        let v = _scoreVal(ci, sp.getAttribute("data-ie-locked")), txt = v && v.sim !== null ? _num(v.sim) : "\u2014";
        sp.textContent !== txt && (sp.textContent = txt);
      }), win.el.querySelectorAll("[data-ie-delta]").forEach((sp) => {
        let f = sp.getAttribute("data-ie-delta"), v = _scoreVal(ci, f);
        _applyDeltaSpan(sp, v ? _deltaInfo(v.sim, v.orig) : null);
      });
      let star = win.el.querySelector("[data-ie-star]");
      star && (star.style.display = c.showStar && (c.showStar.s1 || c.showStar.s2) ? "" : "none");
    }
  }
  function _commitField(ci, field, raw) {
    let m = /^(s[12])([pe])$/.exec(String(field || "").toLowerCase());
    if (!m) return;
    let term = m[1].toUpperCase(), isP = m[2] === "p";
    if (!isP && !_eFieldEditable(ci, field)) {
      log("[\u5185\u8054] \u5FFD\u7565\u5BF9\u5DF2\u53D1\u5E03\u6210\u7EE9\u7684 " + field + " \u7684\u6A21\u62DF\u5199\u5165\uFF08\u5B66\u6821\u5DF2\u7ED9\u6B63\u5F0F\u5206\uFF09");
      return;
    }
    let val = String(raw == null ? "" : raw).trim(), num = null;
    if (val !== "") {
      if (num = parseFloat(val), isNaN(num)) return;
      num > 100 && (num = 100), num < 0 && (num = 0);
    }
    safe("points \u5185\u8054\u6539\u5206", () => {
      isP ? onPStarChange(ci, term, num) : onExamScoreChange(ci, term, num);
    });
  }
  function _ieTitleHTML(course) {
    let starred = !!(course.showStar && (course.showStar.s1 || course.showStar.s2));
    return '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(course.subject || "") + '</div><div style="color:rgba(0,0,0,0.55);font-size:11px;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(course.name || "") + '<span data-ie-star style="color:#f5222d;cursor:help;' + (starred ? "" : "display:none;") + '" title="' + escapeHtml(t("\u5B66\u6821\u7ED9\u7684\u5206\u4E0E\u4EFB\u52A1\u660E\u7EC6\u7B97\u51FA\u7684\u5206\u4E0D\u4E00\u81F4\uFF08\u5DEE > 0.1\uFF09\uFF0C\u8BE5\u79D1\u6A21\u62DF\u4EC5\u4F9B\u53C2\u8003", "School value differs from the task-based estimate by more than 0.1")) + '"> *</span></div>';
  }
  function _ieBodyHTML(ci) {
    return '<div style="margin-bottom:6px;">' + _fieldHtml(ci, "s1p", "S1P") + _fieldHtml(ci, "s1e", "S1E") + _readonlyHtml(ci, "s1f", "S1F", "s1") + '</div><div style="margin-bottom:8px;">' + _fieldHtml(ci, "s2p", "S2P") + _fieldHtml(ci, "s2e", "S2E") + _readonlyHtml(ci, "s2f", "S2F", "s2") + '</div><div style="display:flex;gap:8px;align-items:center;border-top:1px solid #f0f0f0;padding-top:8px;"><button type="button" data-ie-act="detail" class="ant-btn ant-btn-link" style="padding:0;font-size:12px;">' + t("\u79D1\u76EE\u660E\u7EC6", "Breakdown") + '</button><span class="iw-note" style="margin-left:auto;font-size:11px;">' + t("P=\u5E73\u65F6\u5206 E=\u671F\u672B F=\u603B\u8BC4", "P=coursework E=exam F=final") + "</span></div>";
  }
  function _openEditor(tr, ci) {
    let course = S.simCourses[ci];
    if (!course || !S.isCurrentYear) return;
    let td = _scoreTdOf(tr);
    if (!td) return;
    let key = IE_KIND + ":" + courseIdent(course);
    if (getWindow(key)) {
      raiseWindow(key), setWindowAnchor(key, td);
      let w = getWindow(key);
      w && w.el.setAttribute("data-ie-ci", String(ci));
      return;
    }
    let handle = openWindow({
      key,
      kind: IE_KIND,
      domId: "ints-inline-editor-" + ci,
      // 三个字段全被改过时最宽，窄了会把变化量挤出窗口。
      anchorEl: td,
      width: 430,
      titleHTML: _ieTitleHTML(course),
      bodyHTML: _ieBodyHTML(ci)
    });
    handle.el.setAttribute("data-ie-ident", courseIdent(course)), handle.el.setAttribute("data-ie-ci", String(ci)), handle.body.addEventListener("change", guardListener("\u5185\u8054\u7A97\u53E3\u6539\u5206", (e) => {
      let inp = e.target && e.target.closest ? e.target.closest("input[data-ie-field]") : null;
      if (!inp) return;
      let idx = _ciOfWindow(getWindow(key) || { el: handle.el });
      idx < 0 || _commitField(idx, inp.getAttribute("data-ie-field"), inp.value);
    })), handle.body.addEventListener("keydown", guardListener("\u5185\u8054\u7A97\u53E3\u56DE\u8F66", (e) => {
      if (e.key !== "Enter") return;
      let inp = e.target && e.target.closest ? e.target.closest("input[data-ie-field]") : null;
      inp && (e.preventDefault(), inp.blur());
    })), handle.body.addEventListener("click", guardListener("\u5185\u8054\u7A97\u53E3\u6309\u94AE", (e) => {
      if (!(e.target && e.target.closest ? e.target.closest('[data-ie-act="detail"]') : null)) return;
      let idx = _ciOfWindow(getWindow(key) || { el: handle.el });
      idx < 0 || safe("points \u5185\u8054\u79D1\u76EE\u660E\u7EC6", () => {
        showSubjectDetailModal(idx, td);
      });
    }));
  }
  function _reanchorWindows() {
    for (let win of listWindows()) {
      if (win.kind !== IE_KIND && win.kind !== "detail") continue;
      let ident = win.el.getAttribute("data-ie-ident"), ci = _ciOfIdent(ident);
      if (ci < 0) {
        closeWindow(win.key);
        continue;
      }
      win.el.setAttribute("data-ie-ci", String(ci));
      let tr = _rowForCourse(ci), td = tr ? _scoreTdOf(tr) : null;
      td && setWindowAnchor(win.key, td);
    }
  }
  function _closeInlineWindows() {
    for (let win of listWindows())
      (win.kind === IE_KIND || win.kind === "detail") && closeWindow(win.key);
  }
  function _headerFieldOf(h) {
    return FIELD_BY_LABEL[String(h && h.customColumnName || "").trim().toUpperCase()] || null;
  }
  function _headerVisibleUnderFilter(h) {
    let f = _headerFieldOf(h);
    return f ? _activeFields().indexOf(f) >= 0 : !0;
  }
  function _sortFieldHeaders(list) {
    return list.map((h, i) => ({ h, i, o: FIELD_ORDER[String(h && h.customColumnName || "").trim().toUpperCase()] })).sort((a, b) => {
      let ao = a.o === void 0 ? -1 : a.o, bo = b.o === void 0 ? -1 : b.o;
      return ao !== bo ? ao - bo : a.i - b.i;
    }).map((x) => x.h);
  }
  function _activeFields() {
    let f = S.currentFilter;
    return f === "s1" ? ["s1p", "s1e", "s1f"] : f === "s2" ? ["s2p", "s2e", "s2f"] : ALL_FIELDS.concat(["eoy"]);
  }
  function _dec() {
    return _colsExpanded ? 2 : 1;
  }
  function _num(v) {
    return typeof v == "number" && !isNaN(v) ? v.toFixed(_dec()) : "\u2014";
  }
  function _delta(v) {
    return (v > 0 ? "+" : "") + v.toFixed(_dec());
  }
  function _findGradeVm() {
    if (_vm && _vm.$el && document.contains(_vm.$el)) return _vm;
    let el = document.querySelector(".grade") || document.querySelector(".section-content");
    if (!el) return null;
    let vm = null;
    for (let n = el; n && !vm; n = n.parentElement)
      n.__vue__ && (vm = n.__vue__);
    if (!vm) return null;
    let root = vm;
    for (; root.$parent; ) root = root.$parent;
    let queue = [root], seen = /* @__PURE__ */ new Set();
    for (; queue.length; ) {
      let cur = queue.shift();
      if (!(!cur || seen.has(cur))) {
        if (seen.add(cur), Array.isArray(cur.dynamicHeaders) && Array.isArray(cur.data) && "maxTaskNum" in cur)
          return _vm = cur, cur;
        for (let ch of cur.$children || []) queue.push(ch);
      }
    }
    return null;
  }
  function _fieldValue(ci, field) {
    let c = S.originalCourses && S.originalCourses[ci];
    if (!c) return { score: null, level: null };
    let v = (S.simCourses && S.simCourses[ci] && S.simCourses[ci].simGrades || c.originalGrades || {})[field];
    if (typeof v != "number" || isNaN(v)) return { score: null, level: null };
    let score = v.toFixed(_dec());
    return { score, level: scoreToLetter(Number(score)) };
  }
  function _applyColumns(vm) {
    let isCurrYearNow = !!S.isCurrentYear, keepAll = (_savedHeaders || []).filter((h) => h && h.customColumnId !== void 0 && String(h.customColumnId).indexOf(SYNTH_PREFIX) !== 0), scoreColId = _schoolColumnId(), keep = keepAll.filter((h) => scoreColId !== null && String(h.customColumnId) === scoreColId || _headerVisibleUnderFilter(h)), keptNames = new Set(keepAll.map((h) => String(h.customColumnName || "").trim().toUpperCase())), owned = ALL_FIELDS.filter((f) => !keptNames.has(FIELD_LABEL[f])), visible = _activeFields().filter((f) => owned.indexOf(f) >= 0), headers = _sortFieldHeaders(keep.concat(visible.map((f) => ({
      customColumnId: SYNTH_PREFIX + f,
      customColumnName: FIELD_LABEL[f]
    })))), sig = headers.map((h) => String(h.customColumnId)).join(","), rows = vm.data || [], keysMissing = !1;
    for (let row of rows) {
      if (!row) {
        sig += "|";
        continue;
      }
      let cs = row.customColumnScores || {}, ci = _rowIndexOf(row);
      sig += "|" + ci;
      for (let f of owned) {
        let v = ci >= 0 ? _fieldValue(ci, f) : { score: null };
        sig += ":" + (v.score === null ? "-" : v.score), SYNTH_PREFIX + f in cs || (keysMissing = !0);
      }
    }
    !keysMissing && sig === _colsSig || (_colsSig = sig, vm.dynamicHeaders = headers, _synthThCache = null, rows.forEach((row) => {
      row && (row.customColumnScores || vm.$set(row, "customColumnScores", {}), Object.keys(row.customColumnScores).forEach((k) => {
        k.indexOf(SYNTH_PREFIX) === 0 && owned.indexOf(k.slice(SYNTH_PREFIX.length)) < 0 && vm.$delete(row.customColumnScores, k);
      }), owned.forEach((f) => {
        vm.$set(row.customColumnScores, SYNTH_PREFIX + f, _fieldValue(_rowIndexOf(row), f));
      }));
    }), vm.$forceUpdate && vm.$forceUpdate());
  }
  function _rowIndexOf(row) {
    if (!row || !S.simCourses) return -1;
    let subject = row.subject, course = row.courseName;
    for (let i = 0; i < S.simCourses.length; i++) {
      let c = S.simCourses[i];
      if (_norm(c.subject) === _norm(subject) && _norm(c.name) === _norm(course)) return i;
    }
    for (let i = 0; i < S.simCourses.length; i++)
      if (_norm(S.simCourses[i].name) === _norm(course)) return i;
    return -1;
  }
  function _clearSyntheticColumns(vm) {
    (vm.data || []).forEach((row) => {
      !row || !row.customColumnScores || Object.keys(row.customColumnScores).forEach((k) => {
        k.indexOf(SYNTH_PREFIX) === 0 && vm.$delete(row.customColumnScores, k);
      });
    }), vm.$forceUpdate && vm.$forceUpdate();
  }
  function _hasSynthetic(vm) {
    return (vm.dynamicHeaders || []).some((h) => h && String(h.customColumnId).indexOf(SYNTH_PREFIX) === 0);
  }
  function _captureOriginalIfNeeded(vm) {
    let hs = vm && vm.dynamicHeaders || [];
    if (!hs.length || _hasSynthetic(vm) || !hs.some((h) => h && String(h.customColumnId === void 0 ? "" : h.customColumnId).indexOf(SYNTH_PREFIX) !== 0)) return;
    let sig = hs.map((h) => String(h.customColumnId === void 0 ? "" : h.customColumnId)).sort().join(",");
    _savedColSig !== sig && (_savedColSig && _colsExpanded || (_savedColSig = sig, _savedHeaders = hs.slice()));
  }
  function _persistColsExpanded(v) {
    S.colsExpanded = !!v, safe("\u5185\u8054\u5217\u5F00\u5173\u6301\u4E45\u5316", () => flushSave(!0));
  }
  function _afterSiteRender(vm) {
    if (_synthThCache = null, vm && typeof vm.$nextTick == "function")
      try {
        vm.$nextTick(() => decoratePointsRows());
      } catch (e) {
      }
    _schedule(DECORATE_DEBOUNCE_MS);
  }
  function _expandColumns(expand, opts) {
    let keepPref = !!(opts && opts.keepPref), vm = _findGradeVm();
    return vm ? (expand ? (_captureOriginalIfNeeded(vm), _captureSiteColumns(vm), _colsExpanded = !0, keepPref || _persistColsExpanded(!0), _applyColumns(vm), _afterSiteRender(vm), log("[\u5185\u8054] \u5DF2\u5C55\u5F00\u5168\u90E8\u6210\u7EE9\u5217: " + (vm.dynamicHeaders || []).map((h) => h.customColumnName).join(", "))) : (_colsExpanded = !1, keepPref || _persistColsExpanded(!1), _clearSyntheticColumns(vm), _savedHeaders !== null && (vm.dynamicHeaders = _savedHeaders.slice()), _savedHeaders = null, _savedColSig = "", _colsSig = null, _afterSiteRender(vm), log("[\u5185\u8054] \u5DF2\u8FD8\u539F\u4E3A\u7AD9\u70B9\u539F\u59CB\u6210\u7EE9\u5217")), _refreshEditorWindows(), !0) : (_colsExpanded = expand, keepPref || _persistColsExpanded(expand), safe("\u5185\u8054\u5217\u5F00\u5173\uFF08\u7EC4\u4EF6\u672A\u5C31\u7EEA\uFF09", () => {
      throw new Error("\u672A\u627E\u5230\u6210\u7EE9\u518C\u7EC4\u4EF6\uFF0C\u7A0D\u540E\u91CD\u8BD5");
    }), !1);
  }
  function _menuPanelOf(kind) {
    let wrap = document.getElementById(kind === "calc" ? MENU_CALC_ID : MENU_SHOW_ID);
    return wrap ? wrap.querySelector("[" + MENU_PANEL_ATTR + "]") : null;
  }
  function _menuHostFor(kind) {
    return _menuPanelOf(kind);
  }
  function _buildMenu(bar, kind, label) {
    let wrap = document.createElement("span");
    wrap.id = kind === "calc" ? MENU_CALC_ID : MENU_SHOW_ID, wrap.style.cssText = "position:relative;display:inline-block;";
    let trigger = document.createElement("button");
    trigger.type = "button", trigger.id = kind === "calc" ? MENU_CALC_TRIGGER_ID : MENU_SHOW_TRIGGER_ID, trigger.className = "ant-btn ant-btn-link", trigger.style.cssText = "margin-left:16px;", trigger.dataset.intsMenu = kind, trigger.addEventListener("click", guardListener("\u5185\u8054\u83DC\u5355\u5F00\u5173", (e) => {
      e.preventDefault(), e.stopPropagation(), safe("\u5185\u8054\u83DC\u5355\u5F00\u5173", () => _toggleMenu(kind));
    }));
    let panel = document.createElement("div");
    return panel.setAttribute(MENU_PANEL_ATTR, kind), panel.className = "ant-dropdown-menu", panel.style.cssText = "display:none;position:absolute;top:100%;left:16px;margin-top:4px;z-index:" + MENU_Z + ";min-width:150px;", wrap.appendChild(trigger), wrap.appendChild(panel), bar.appendChild(wrap), { wrap, trigger, panel };
  }
  function _menuItem(panel, id) {
    let row = document.createElement("div");
    row.className = "ant-dropdown-menu-item", row.style.cssText = "padding:0;";
    let btn = document.createElement("button");
    return btn.id = id, btn.type = "button", btn.className = "ant-btn ant-btn-link", btn.style.cssText = "margin:0;width:100%;text-align:left;", row.appendChild(btn), panel.appendChild(row), row.addEventListener("click", guardListener("\u5185\u8054\u83DC\u5355\u9879", () => {
      _closeMenus();
    })), btn;
  }
  function _closeMenus() {
    _openMenu = null, [MENU_CALC_ID, MENU_SHOW_ID].forEach((id) => {
      let wrap = document.getElementById(id), panel = wrap ? wrap.querySelector("[" + MENU_PANEL_ATTR + "]") : null;
      panel && (panel.style.display = "none");
    }), _menuOutside && (document.removeEventListener("mousedown", _menuOutside, !0), _menuOutside = null), _menuEsc && (document.removeEventListener("keydown", _menuEsc, !0), _menuEsc = null), _started && _renderMenuTriggers();
  }
  function _toggleMenu(kind) {
    if (kind === "calc" && !S.isCurrentYear) {
      log("[\u5185\u8054] \u5F80\u671F\u5B66\u5E74\u53EA\u8BFB\uFF1A\u8BA1\u7B97\u83DC\u5355\u5DF2\u7981\u7528");
      return;
    }
    if (_openMenu === kind) {
      _closeMenus();
      return;
    }
    _closeMenus();
    let panel = _menuPanelOf(kind);
    panel && (panel.style.display = "block", _openMenu = kind, _menuOutside = guardListener("\u5185\u8054\u83DC\u5355\u70B9\u5916\u5173\u95ED", (e) => {
      if (!_openMenu) return;
      let wrap = document.getElementById(_openMenu === "calc" ? MENU_CALC_ID : MENU_SHOW_ID);
      wrap && e.target && wrap.contains(e.target) || _closeMenus();
    }), _menuEsc = guardListener("\u5185\u8054\u83DC\u5355 Esc", (e) => {
      e.key === "Escape" && _closeMenus();
    }), document.addEventListener("mousedown", _menuOutside, !0), document.addEventListener("keydown", _menuEsc, !0), _renderMenuTriggers());
  }
  function _renderMenuTriggers() {
    let pairs = [
      ["calc", MENU_CALC_TRIGGER_ID, t("\u8BA1\u7B97", "Calculate"), !!_calcOpen],
      ["show", MENU_SHOW_TRIGGER_ID, t("\u663E\u793A", "View"), !!(_colsExpanded || _overviewOpen)]
    ];
    for (let [kind, id, label, active] of pairs) {
      let btn = document.getElementById(id);
      if (!btn) continue;
      let disabled = kind === "calc" && !S.isCurrentYear, html = iconChevron(_openMenu === kind) + "<span>" + escapeHtml(label) + "</span>";
      btn.innerHTML !== html && (btn.innerHTML = html);
      let color = disabled ? "rgba(0,0,0,0.25)" : active ? COLOR_ACTIVE : COLOR_IDLE;
      if (btn.style.color !== color && (btn.style.color = color), disabled) {
        btn.style.cursor !== "not-allowed" && (btn.style.cursor = "not-allowed");
        let tip = t("\u5F80\u671F\u5B66\u5E74\u53EA\u8BFB\uFF1A\u4E0D\u80FD\u6A21\u62DF", "Past school year is read-only");
        btn.getAttribute("title") !== tip && btn.setAttribute("title", tip);
      } else
        btn.style.cursor && (btn.style.cursor = ""), btn.getAttribute("title") && btn.removeAttribute("title");
    }
  }
  function _renderMenus(bar) {
    document.getElementById(MENU_CALC_ID) || _buildMenu(bar, "calc", t("\u8BA1\u7B97", "Calculate")), document.getElementById(MENU_SHOW_ID) || _buildMenu(bar, "show", t("\u663E\u793A", "View")), _orderToolbarNodes(bar);
  }
  function _orderToolbarNodes(bar) {
    let yearItem = bar.querySelector(".filter-item"), termSel = document.getElementById(TERM_ID), termItem = termSel && termSel.closest("[data-ints-term]") || bar.querySelector("[data-ints-term]");
    bar.querySelectorAll("[data-ints-term]").forEach((el) => {
      el.querySelector("#" + TERM_ID) || el.remove();
    });
    let ddlWrap = document.getElementById("intschool-deadline-wrap"), calc = document.getElementById(MENU_CALC_ID), show = document.getElementById(MENU_SHOW_ID), placeAfter = (node, prev) => {
      if (!(!node || !prev || node === prev)) {
        if (node.parentElement !== bar) {
          prev.insertAdjacentElement("afterend", node);
          return;
        }
        node.previousElementSibling !== prev && prev.insertAdjacentElement("afterend", node);
      }
    };
    placeAfter(termItem, yearItem), placeAfter(ddlWrap, termItem || yearItem), placeAfter(calc, ddlWrap || termItem || yearItem), placeAfter(show, calc || ddlWrap || termItem || yearItem);
  }
  function _renderToolbar() {
    let bar = document.querySelector(".grade .filter-container");
    return bar ? (!S.isCurrentYear && _openMenu === "calc" && _closeMenus(), _renderMenus(bar), _renderDetailButton(), _renderCalcOverview(), _renderCalcToggle(), _renderVirtualTaskButton(), _renderResetButton(), _renderClearCacheButton(), _renderTermSelect(bar), _renderCalcCard(), _renderMenuTriggers(), _orderToolbarNodes(bar), !0) : !1;
  }
  function _renderDetailButton() {
    let host = _menuHostFor("show");
    if (!host) return null;
    let btn = document.getElementById(TOGGLE_ID);
    btn || (btn = _menuItem(host, TOGGLE_ID), btn.addEventListener("click", guardListener("\u5185\u8054\u5217\u5F00\u5173", (e) => {
      e.preventDefault(), safe("\u5185\u8054\u5217\u5F00\u5173", () => {
        _expandColumns(!_colsExpanded) && _renderToolbar();
      });
    })));
    let html = iconTable() + "<span>" + t("\u8BE6\u60C5", "Details") + "</span>";
    btn.innerHTML !== html && (btn.innerHTML = html);
    let color = _colsExpanded ? COLOR_ACTIVE : COLOR_IDLE;
    return btn.style.color !== color && (btn.style.color = color), btn;
  }
  function _renderVirtualTaskButton() {
    let host = _menuHostFor("calc");
    if (!host) return null;
    let btn = document.getElementById(VTASK_BTN_ID);
    btn || (btn = _menuItem(host, VTASK_BTN_ID), btn.addEventListener("click", guardListener("\u5185\u8054\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", (e) => {
      e.preventDefault(), safe("\u5185\u8054\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", _addVirtualTask);
    })));
    let html = iconPlus() + "<span>" + t("\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", "Add Virtual Task") + "</span>";
    return btn.innerHTML !== html && (btn.innerHTML = html), btn.style.color = COLOR_ACTIVE, btn;
  }
  function _addVirtualTask() {
    if (!S.isCurrentYear || !S.simCourses || !S.simCourses.length) {
      log("[\u5185\u8054] \u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1\uFF1A\u5F53\u524D\u5B66\u5E74\u6570\u636E\u672A\u5C31\u7EEA\uFF0C\u5148\u7B49\u9875\u9762\u52A0\u8F7D\u5B8C\uFF08isCurrentYear=" + !!S.isCurrentYear + " courses=" + (S.simCourses && S.simCourses.length || 0) + "\uFF09");
      return;
    }
    showVirtualTaskModal2(null, () => {
      _renderToolbar(), decoratePointsRows();
    });
  }
  function _hasTargetGPA() {
    return typeof S.targetUWGPA == "number" || typeof S.targetWGPA == "number";
  }
  function _siteScopeAttr() {
    let el = document.querySelector(".grade .filter-container .filter-item");
    if (!el) return null;
    for (let i = 0; i < el.attributes.length; i++)
      if (el.attributes[i].name.indexOf("data-v-") === 0) return el.attributes[i].name;
    return null;
  }
  function _renderTermSelect(bar) {
    let sel = document.getElementById(TERM_ID);
    if (!sel) {
      let item = document.createElement("div");
      item.className = "filter-item", item.setAttribute("data-ints-term", "1");
      let label = document.createElement("span");
      label.className = "filter-text", label.textContent = t("\u5B66\u671F", "Term"), sel = document.createElement("select"), sel.id = TERM_ID, sel.className = "filter-input", sel.style.cssText = "height:32px;box-sizing:border-box;padding:0 8px;margin-left:8px;border:1px solid #d9d9d9;border-radius:4px;background:#fff;font-size:14px;color:rgba(0,0,0,0.65);", [["all", t("\u663E\u793A\u5168\u90E8", "Show All")], ["s1", t("\u4EC5 S1", "Only S1")], ["s2", t("\u4EC5 S2", "Only S2")]].forEach((pair) => {
        let o = document.createElement("option");
        o.value = pair[0], o.textContent = pair[1], sel.appendChild(o);
      }), sel.addEventListener("change", guardListener("\u5185\u8054\u5B66\u671F\u7B5B\u9009", (e) => {
        let v = e.target.value === "s1" || e.target.value === "s2" ? e.target.value : "all";
        if (S.currentFilter = v, S.lastSelectedFilter = v, safe("\u5185\u8054\u5B66\u671F\u7B5B\u9009\u6301\u4E45\u5316", () => flushSave(!0)), _colsExpanded) {
          let vm = _findGradeVm();
          vm && safe("\u5185\u8054\u5B66\u671F\u7B5B\u9009\u91CD\u5199\u5217", () => {
            _captureOriginalIfNeeded(vm), _applyColumns(vm), _afterSiteRender(vm);
          });
        } else
          _schedule(DECORATE_DEBOUNCE_MS);
        e.target.blur();
      }));
      let scopeAttr = _siteScopeAttr();
      scopeAttr ? (item.setAttribute(scopeAttr, ""), label.setAttribute(scopeAttr, ""), sel.setAttribute(scopeAttr, "")) : label.style.cssText = "font-size:14px;color:rgba(0,0,0,0.85);margin-right:8px;", item.appendChild(label), item.appendChild(sel), bar.appendChild(item);
    }
    let want = S.currentFilter === "s1" || S.currentFilter === "s2" ? S.currentFilter : "all";
    return sel.value !== want && (sel.value = want), sel;
  }
  function _onTargetChanged() {
    _renderToolbar(), decoratePointsRows();
  }
  function iconBarChart() {
    return '<i class="anticon anticon-bar-chart" style="margin-right:4px;"><svg viewBox="64 64 896 896" data-icon="bar-chart" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + ANTD_BAR_CHART_PATH + '"></path></svg></i>';
  }
  function _calcCard() {
    let bar = document.querySelector(".grade .filter-container");
    if (!bar) return null;
    let card = document.getElementById(CALC_CARD_ID);
    return card || (card = document.createElement("div"), card.id = CALC_CARD_ID, card.className = "ant-card ant-card-bordered", card.style.cssText = "margin:0 0 12px 0;", card.innerHTML = '<div class="ant-card-head" style="min-height:auto;padding:0 16px;"><div class="ant-card-head-wrapper"><div class="ant-card-head-title" style="padding:10px 0;">' + escapeHtml(t("\u76EE\u6807GPA\u8BA1\u7B97", "Target GPA")) + '</div></div></div><div class="ant-card-body" style="padding:12px 16px;"><div id="ints-calc-target"></div></div>'), card.previousElementSibling !== bar && bar.insertAdjacentElement("afterend", card), card;
  }
  function _renderCalcTarget(host) {
    host.getAttribute("data-ints-built") || (host.setAttribute("data-ints-built", "1"), host.innerHTML = '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><span style="color:#8c8c8c;min-width:66px;">' + escapeHtml(t("\u76EE\u6807 GPA", "Target GPA")) + '</span><span id="ints-calc-targetctl" style="display:inline-flex;align-items:center;font-size:12px;white-space:nowrap;"></span><button id="' + TARGET_TOGGLE_ID + '" type="button" class="ant-btn ant-btn-link" style="margin:0;padding:0;height:auto;font-size:12px;"></button></div><div id="target-gap-summary" style="font-size:11px;color:#666;margin-top:4px;"></div><div id="target-detail-table" style="margin-top:4px;"></div>', host.addEventListener("click", guardListener("\u5185\u8054\u76EE\u6807GPA\u660E\u7EC6\u5F00\u5173", (e) => {
      !e.target || !e.target.closest || !e.target.closest("#" + TARGET_TOGGLE_ID) || (e.preventDefault(), _targetStripOpen = !_targetStripOpen, _renderToolbar());
    })));
    let ctl = host.querySelector("#ints-calc-targetctl"), has = _hasTargetGPA();
    ctl && (!ctl.getAttribute("data-ints-built") || _targetHasState !== has) && (ctl.setAttribute("data-ints-built", "1"), ctl.innerHTML = buildTargetGPAControlsHTML("display:flex;align-items:center;gap:6px;"), _targetHasState = has, attachTargetGPAEvents(ctl, guardListener("\u5185\u8054\u76EE\u6807GPA", _onTargetChanged)));
    let hint = ctl && ctl.querySelector("#target-max-hint");
    if (hint) {
      let hintText = maxGPAHintText();
      hintText ? hint.textContent = hintText : hint.remove();
    }
    let btn = host.querySelector("#" + TARGET_TOGGLE_ID), open = _targetStripOpen && has;
    if (btn && (btn.style.display = has ? "" : "none", btn.innerHTML = iconChevron(open) + "<span>" + t("\u660E\u7EC6", "Detail") + "</span>", btn.style.color = open ? COLOR_ACTIVE : COLOR_IDLE), open) safe("\u5185\u8054\u76EE\u6807GPA\u660E\u7EC6", () => renderTargetGapSummary(host));
    else {
      let sum = host.querySelector("#target-gap-summary"), det = host.querySelector("#target-detail-table");
      sum && (sum.innerHTML = ""), det && (det.innerHTML = "");
    }
    return host;
  }
  function _renderCalcOverview() {
    let host = _menuHostFor("show"), btn = document.getElementById(OVERVIEW_TOGGLE_ID);
    if (host && !btn && (btn = _menuItem(host, OVERVIEW_TOGGLE_ID), btn.addEventListener("click", guardListener("\u5185\u8054\u591A\u5E74\u7EA7\u603B\u89C8\u5F00\u5173", (e) => {
      e.preventDefault(), _overviewOpen = !_overviewOpen, _renderToolbar(), _overviewOpen && !_overviewLoaded && (_overviewFailed = !1, safeAsync("\u5185\u8054\u591A\u5E74\u7EA7\u603B\u89C8", async () => {
        _renderOverviewLoading();
        let timer = setInterval(() => {
          safe("\u603B\u89C8\u52A0\u8F7D\u8FDB\u5EA6", _renderOverviewLoading);
        }, 200);
        try {
          await loadMultiYearData(), _overviewLoaded = !0, _setOverviewError("");
        } catch (err) {
          throw console.warn("[\u5185\u8054] \u591A\u5E74\u7EA7\u603B\u89C8\u52A0\u8F7D\u5931\u8D25: " + (err && err.message || err)), _overviewFailed = !0, _setOverviewError(t("\u52A0\u8F7D\u5931\u8D25", "Load failed")), _renderOverviewLoading(), err;
        } finally {
          clearInterval(timer);
        }
        _renderToolbar();
      }));
    }))), btn) {
      let html = iconBarChart() + "<span>" + t("G9-G12 \u603B\u89C8", "G9-G12 Overview") + "</span>";
      btn.innerHTML !== html && (btn.innerHTML = html);
      let color = _overviewOpen ? COLOR_ACTIVE : COLOR_IDLE;
      btn.style.color !== color && (btn.style.color = color);
    }
    return _renderOverviewView(), btn;
  }
  function _renderOverviewView() {
    let view = document.getElementById(OVERVIEW_VIEW_ID);
    if (!_overviewOpen)
      return view && view.remove(), _overviewOutside && (document.removeEventListener("mousedown", _overviewOutside, !0), _overviewOutside = null), _overviewSig = "", null;
    if (!view) {
      view = document.createElement("div"), view.id = OVERVIEW_VIEW_ID, view.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;z-index:60;background:#fff;overflow:auto;padding:16px 24px;box-sizing:border-box;border-radius:4px;", view.innerHTML = '<div style="display:flex;align-items:center;border-bottom:1px solid #f0f0f0;padding-bottom:10px;margin-bottom:12px;"><span style="font-size:16px;font-weight:600;">' + escapeHtml(t("G9-G12 \u591A\u5E74\u7EA7\u603B\u89C8", "G9-G12 Multi-year Overview")) + '</span><span id="ints-overview-hint" style="font-size:12px;color:#d4380d;margin-left:12px;"></span><button id="ints-overview-close" type="button" class="ant-btn ant-btn-link" style="margin-left:auto;">' + iconChevron(!1) + "<span>" + escapeHtml(t("\u8FD4\u56DE\u6210\u7EE9\u518C", "Back to gradebook")) + '</span></button></div><div id="ints-overview-loading" style="display:none;min-height:60vh;align-items:center;justify-content:center;"></div><div id="ints-overview-body" style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;"><div id="main-table-container" style="flex:1 1 560px;min-width:320px;"></div><div id="task-panel-container" style="flex:0 0 auto;width:520px;max-width:100%;"></div></div>';
      let grade = document.querySelector(".grade");
      if (grade) {
        try {
          getComputedStyle(grade).position === "static" && (grade.style.position = "relative");
        } catch (e) {
        }
        grade.appendChild(view);
      } else
        view.style.position = "fixed", document.body.appendChild(view);
      _overviewOutside = guardListener("\u603B\u89C8\u89C6\u56FE\u70B9\u5916\u5173\u95ED", (e) => {
        if (!_overviewOpen) return;
        let el = document.getElementById(OVERVIEW_VIEW_ID);
        if (!el) return;
        let t22 = e.target;
        t22 === el || el.contains && el.contains(t22) || t22 && t22.closest && t22.closest("#" + OVERVIEW_TOGGLE_ID) || (_overviewOpen = !1, _renderToolbar());
      }), document.addEventListener("mousedown", _overviewOutside, !0), view.addEventListener("click", guardListener("\u603B\u89C8\u89C6\u56FE\u5173\u95ED", (e) => {
        !e.target || !e.target.closest || !e.target.closest("#ints-overview-close") || (e.preventDefault(), _overviewOpen = !1, _renderToolbar());
      })), registerMultiYearHost(view);
    }
    if (_syncOverviewStage(view, _overviewLoaded), !_overviewLoaded) return view;
    let sig = _overviewSignature();
    return sig === _overviewSig || (safe("\u603B\u89C8\u89C6\u56FE\u6E32\u67D3", () => renderMultiYearPanel(view)), _overviewSig = sig), view;
  }
  function _syncOverviewStage(view, loaded) {
    if (!view) return;
    let box = view.querySelector("#ints-overview-loading"), body = view.querySelector("#ints-overview-body");
    box && (box.style.display = loaded ? "none" : "flex"), body && (body.style.display = loaded ? "flex" : "none"), loaded || _renderOverviewLoading();
  }
  function _renderOverviewLoading() {
    let box = document.getElementById("ints-overview-loading");
    if (!box) return;
    if (_overviewFailed) {
      box.getAttribute("data-ints-stage") !== "fail" && (box.setAttribute("data-ints-stage", "fail"), box.innerHTML = '<div style="font-size:14px;color:#8c8c8c;">' + escapeHtml(t("\u52A0\u8F7D\u5931\u8D25", "Load failed")) + "</div>");
      return;
    }
    let label = document.getElementById(OVERVIEW_COUNT_ID);
    if ((!label || box.getAttribute("data-ints-stage") !== "loading") && (box.setAttribute("data-ints-stage", "loading"), box.innerHTML = loadingBlockHtml('<span id="' + OVERVIEW_COUNT_ID + '"></span>', "0"), label = document.getElementById(OVERVIEW_COUNT_ID), !label))
      return;
    let text = t("\u52A0\u8F7D\u4E2D...", "Loading...") + loadingCountText(S.loadingRequestCount, S.expectedRequestCount);
    label.textContent !== text && (label.textContent = text);
  }
  function _overviewSignature() {
    let sig = (S.multiYearEntries || []).length + "|" + JSON.stringify(S.multiYearGPAOverrides || {});
    for (let e of S.multiYearEntries || []) {
      sig += "|" + e.grade + ":" + (e.yearValue || "-");
      let g = e.simCourses || [];
      for (let c of g)
        sig += "|" + (c && c.simGrades ? c.simGrades.s1f + "," + c.simGrades.s2f : "-");
    }
    return sig;
  }
  function _setOverviewError(text) {
    let el = document.getElementById("ints-overview-hint");
    el && (el.textContent = text || "");
  }
  function _renderCalcCard() {
    let usable = !!S.isCurrentYear && _calcOpen, card = document.getElementById(CALC_CARD_ID);
    if (!usable)
      return card && card.remove(), null;
    if (card = _calcCard(), !card) return null;
    safe("\u5E2E\u52A9\u6D6E\u5C42\u5B89\u88C5", () => setupHelpTooltip());
    let target = card.querySelector("#ints-calc-target");
    return target && safe("\u5185\u8054\u76EE\u6807GPA", () => _renderCalcTarget(target)), card;
  }
  function _renderResetButton() {
    let host = _menuHostFor("calc");
    if (!host) return null;
    let btn = document.getElementById(RESET_ID);
    return btn || (btn = _menuItem(host, RESET_ID), btn.innerHTML = iconSync() + "<span>" + t("\u6E05\u7A7A\u6A21\u62DF", "Reset Simulations") + "</span>", btn.style.color = "#f5222d", btn.addEventListener("click", guardListener("\u5185\u8054\u6E05\u7A7A\u6A21\u62DF", (e) => {
      e.preventDefault(), safe("\u5185\u8054\u6E05\u7A7A\u6A21\u62DF", () => resetSimulations()), log("[\u5185\u8054] \u5DF2\u6E05\u7A7A\u6A21\u62DF\u6570\u636E\uFF08\u6821\u51C6\u4FE1\u606F\u4E0E\u661F\u6807\u4FDD\u7559\uFF09"), decoratePointsRows();
    }))), btn;
  }
  function _renderClearCacheButton() {
    let host = _menuHostFor("calc");
    if (!host) return null;
    let btn = document.getElementById(CLEAR_CACHE_ID);
    return btn || (btn = _menuItem(host, CLEAR_CACHE_ID), btn.innerHTML = iconDelete() + "<span>" + t("\u6E05\u9664\u7F13\u5B58\uFF08\u4FDD\u7559\u6A21\u62DF\uFF09", "Clear cache (keep simulation)") + "</span>", btn.style.color = "#8c8c8c", btn.title = t(
      "\u6E05\u9664\u672C\u673A\u4FDD\u5B58\u7684\u6210\u7EE9\u6570\u636E\u7F13\u5B58\uFF08\u5B66\u6821\u6570\u636E\u4E0E\u6821\u51C6\u8BB0\u5F55\uFF09\uFF1B\u6A21\u62DF\u3001\u6807\u8BB0\u4E0E\u76EE\u6807 GPA \u4F1A\u4FDD\u7559\u3002\u516C\u7528\u7535\u8111\u4E0A\u8BF7\u53CA\u65F6\u6E05\u9664\u3002",
      "Clears the cached school data and calibration records stored on this computer. Simulations, marks and target GPA are kept. Please clear it regularly on a shared computer."
    ), btn.addEventListener("click", guardListener("\u5185\u8054\u6E05\u9664\u7F13\u5B58", (e) => {
      e.preventDefault(), safe("\u5185\u8054\u6E05\u9664\u7F13\u5B58", () => {
        clearServerCache() && (log("[\u5185\u8054] \u5DF2\u6E05\u9664\u672C\u5730\u7F13\u5B58\uFF08\u6210\u7EE9\u518C\u6570\u636E + \u6821\u51C6\u6392\u9664\u8868 + \u8BFE\u8868\u7F13\u5B58\uFF09\uFF0C\u5373\u5C06\u5237\u65B0\u9875\u9762"), location.reload());
      });
    }))), btn;
  }
  function _renderCalcToggle() {
    let host = _menuHostFor("calc");
    if (!host) return null;
    let btn = document.getElementById(CALC_TOGGLE_ID);
    btn || (btn = _menuItem(host, CALC_TOGGLE_ID), btn.addEventListener("click", guardListener("\u5185\u8054\u76EE\u6807GPA\u5F00\u5173", (e) => {
      e.preventDefault(), _calcOpen = !_calcOpen, _renderToolbar();
    })));
    let html = iconBarChart() + "<span>" + t("\u76EE\u6807GPA\u8BA1\u7B97", "Target GPA") + "</span>";
    btn.innerHTML !== html && (btn.innerHTML = html);
    let color = _calcOpen ? COLOR_ACTIVE : COLOR_IDLE;
    return btn.style.color !== color && (btn.style.color = color), btn;
  }
  function getInlineStats() {
    let headers = _vm && _vm.dynamicHeaders || [];
    return __spreadProps(__spreadValues({}, _stats), {
      // 诊断用：展开态决定小数位与列；合成列数与成绩格落点（自检报告里也读这几项）
      colsExpanded: !!_colsExpanded,
      synthCols: headers.filter((h) => h && String(h.customColumnId === void 0 ? "" : h.customColumnId).indexOf(SYNTH_PREFIX) === 0).length,
      schoolCol: _schoolColumnId(),
      scoreIdx: _scoreTdIndex(),
      colTrace: _colTrace,
      // 首屏就绪门：等了几毫秒、走的是 idle 还是兜底
      bootGate: _bootGateStats
    });
  }
  function _decorate() {
    if (!_isPointsPage() || !_inlineEnabled() || !S.simCourses || !S.simCourses.length) return;
    _renderGpa(), _renderToolbar(), _synthThCache = null, _structDirty = !1;
    let vm = _findGradeVm();
    vm && (_captureSiteColumns(vm), _colsExpanded && (_captureOriginalIfNeeded(vm), _applyColumns(vm)));
    let rows = _rows(), used = /* @__PURE__ */ new Set(), matched = 0, unmatched = 0;
    rows.forEach((tr) => {
      let info = _rowInfo(tr), idx = _matchCourseIndex(info, used);
      if (idx < 0) {
        unmatched++;
        let box = tr.querySelector("[data-ints-sim]");
        box && box.remove(), _restoreScoreCell(_scoreTdOf(tr)), Array.prototype.forEach.call(tr.children, (td) => {
          td.getAttribute && td.getAttribute(VTASK_ATTR) !== null && _clearVirtualCell(td);
        }), _markRowDone(tr);
        return;
      }
      used.add(idx), matched++, _renderRow(tr, idx);
    }), safe("\u7A97\u53E3\u91CD\u65B0\u951A\u5B9A", _reanchorWindows), safe("\u5B66\u6821\u6570\u636E\u5BF9\u8D26", _checkSchoolDataDrift), _stats = { rows: rows.length, matched, unmatched, ts: Date.now() };
  }
  function decoratePointsRows() {
    safe("points \u5185\u8054\u88C5\u9970", _decorate);
  }
  function _resetDriftCheckForTest() {
    _driftCheckedAt = 0, _driftRefreshing = !1;
  }
  function _siteCountableTasks(row) {
    let out = [];
    for (let t4 of row && row.taskScores || []) {
      if (!t4) continue;
      let id = parseInt(t4.entityId || t4.taskStudentId || t4.id, 10);
      if (!id) continue;
      let endDate = t4.endDate, termRaw = t4.term || t4.schoolYearTerm || null;
      endDate && getTermFromDate(endDate, termRaw) === null || out.push({
        id,
        score: t4.score === null || t4.score === void 0 ? null : Number(t4.score),
        topScore: t4.topScore === null || t4.topScore === void 0 ? null : Number(t4.topScore)
      });
    }
    return out;
  }
  function _checkSchoolDataDrift() {
    if (!S.isCurrentYear || !S.simCourses || !S.simCourses.length || _driftRefreshing || _driftRefreshes >= DRIFT_MAX_REFRESH) return !1;
    let now = Date.now();
    if (now - _driftCheckedAt < DRIFT_CHECK_MS) return !1;
    let vm = _findGradeVm();
    if (!vm || !Array.isArray(vm.data) || !vm.data.length) return !1;
    let compared = 0, drift = !1, why = "";
    for (let row of vm.data) {
      if (!row || !Array.isArray(row.taskScores) || !row.taskScores.length) continue;
      let ci = _rowIndexOf(row);
      if (ci < 0) continue;
      let course = S.simCourses[ci];
      if (!course) continue;
      compared++;
      let site = /* @__PURE__ */ new Map();
      for (let t4 of _siteCountableTasks(row)) site.set(String(t4.id), t4);
      let mine = /* @__PURE__ */ new Map();
      for (let t4 of course.tasks || []) {
        if (t4.isVirtual) continue;
        let id = parseInt(t4.entityId, 10);
        id && mine.set(String(id), {
          score: t4.originalScore === null || t4.originalScore === void 0 ? null : Number(t4.originalScore),
          topScore: t4.topScore === null || t4.topScore === void 0 ? null : Number(t4.topScore)
        });
      }
      for (let [id, sv] of site) {
        let mv = mine.get(id);
        if (!mv) {
          drift = !0, why = "\u7AD9\u70B9\u591A\u4E86\u4EFB\u52A1 " + id;
          break;
        }
        if (mv.score !== sv.score || mv.topScore !== sv.topScore) {
          drift = !0, why = "\u4EFB\u52A1 " + id + " \u5206\u6570 " + mv.score + "/" + mv.topScore + " \u2192 " + sv.score + "/" + sv.topScore;
          break;
        }
      }
      if (drift) break;
    }
    return !compared || (_driftCheckedAt = now, !drift) ? !1 : (_driftRefreshes++, log("[\u7F13\u5B58] \u7AD9\u70B9\u6210\u7EE9\u518C\u4E0E\u672C\u5730\u7684\u5F53\u524D\u5B66\u5E74\u6570\u636E\u4E0D\u4E00\u81F4\uFF08" + why + "\uFF09\uFF0C\u91CD\u65B0\u62C9\u53D6\u2026"), _driftRefreshing = !0, safeAsync("\u5B66\u6821\u6570\u636E\u5BF9\u8D26\u91CD\u62C9", async () => {
      try {
        await loadPageYearData({ force: !0 }) && decoratePointsRows();
      } catch (e) {
        console.warn("[\u7F13\u5B58] \u91CD\u65B0\u62C9\u53D6\u5931\u8D25\uFF0C\u7EE7\u7EED\u4F7F\u7528\u7F13\u5B58\u6570\u636E: " + (e && e.message || e));
      } finally {
        _driftRefreshing = !1;
      }
    }), !0);
  }
  function _startAutoCalibrate() {
    S.isCurrentYear && safeAsync("\u5185\u8054\u661F\u6807\u81EA\u52A8\u6821\u51C6", async () => {
      await autoCalibrateStarredCourses(), _decorate();
    });
  }
  async function _ensureData() {
    if (_loading) return !1;
    _loading = !0;
    try {
      let { entry } = await resolvePageYear();
      if (!entry)
        return console.warn("[\u5185\u8054] \u65E0\u6CD5\u5B9A\u4F4D\u7AD9\u70B9\u9875\u9762\u7684\u5B66\u5E74"), !1;
      if (String(S.currentYearKey) === String(entry.key) && S.isCurrentYear && S.simCourses && S.simCourses.length)
        return _startAutoCalibrate(), !0;
      log("[\u5185\u8054] \u52A0\u8F7D\u7AD9\u70B9\u9875\u9762\u9009\u4E2D\u7684\u5B66\u5E74: " + entry.value);
      let ok = await loadPageYearData();
      return ok && _startAutoCalibrate(), ok;
    } catch (e) {
      return console.warn("[\u5185\u8054] \u5B66\u5E74\u6570\u636E\u52A0\u8F7D\u5931\u8D25\uFF08\u5DF2\u9694\u79BB\uFF0C\u9875\u9762\u4FDD\u6301\u539F\u6837\uFF09: " + (e && e.message || e)), !1;
    } finally {
      _loading = !1;
    }
  }
  function _armBootGate() {
    let startedAt = Date.now(), wait = () => {
      if (_bootTimer = null, !_started) return;
      let rows = document.querySelectorAll(".ant-table-tbody tr[data-row-key]").length, visible = typeof document.visibilityState != "string" || document.visibilityState !== "hidden";
      if (rows > 0 && visible || Date.now() - startedAt >= BOOT_GATE_MAX_MS) {
        _bootGateStats = { waited: rows > 0 && visible, rowsAtBoot: rows, ms: Date.now() - startedAt, via: null }, log("[\u5185\u8054] \u9996\u5C4F\u5C31\u7EEA\u95E8\u653E\u884C: rows=" + rows + " visible=" + visible + " \u7B49\u5F85=" + (Date.now() - startedAt) + "ms"), _scheduleBootLoad();
        return;
      }
      _bootTimer = setTimeout(wait, BOOT_GATE_POLL_MS);
    };
    _bootTimer = setTimeout(wait, BOOT_GATE_POLL_MS);
  }
  function _scheduleBootLoad() {
    let done = !1, run = (via) => {
      done || !_started || (done = !0, _bootTimer && (clearTimeout(_bootTimer), _bootTimer = null), _bootGateStats && (_bootGateStats.via = via), safe("points \u5185\u8054\u9996\u6B21\u52A0\u8F7D", () => {
        _ensureData().then((ok) => {
          ok && decoratePointsRows();
        }).catch(() => {
        });
      }));
    };
    if (typeof requestIdleCallback == "function")
      try {
        requestIdleCallback(() => run("idle"), { timeout: BOOT_IDLE_TIMEOUT_MS });
      } catch (e) {
      }
    _bootTimer = setTimeout(() => run("fallback"), BOOT_IDLE_FALLBACK_MS);
  }
  function _pageYearText() {
    let el = document.querySelector(".grade .ant-select-selection-selected-value") || document.querySelector(".grade .ant-select-selection-item");
    return el ? el.textContent.trim() : null;
  }
  function _hasUndecoratedRows() {
    let rows = _rows();
    for (let tr of rows)
      if (tr.getAttribute(ROW_ATTR) !== "1") return !0;
    return !1;
  }
  function _markStructDirty(muts) {
    for (let m of muts || []) {
      let nodes = [].concat(
        Array.prototype.slice.call(m.addedNodes || []),
        Array.prototype.slice.call(m.removedNodes || [])
      );
      for (let n of nodes) {
        if (!n || n.nodeType !== 1) continue;
        let tag = n.nodeName;
        if (tag === "TD" || tag === "TH" || tag === "TR" || n.getAttribute && (n.hasAttribute("data-ints-sim") || n.hasAttribute("data-ints-simscore") || n.hasAttribute("data-ints-coldelta") || n.hasAttribute("data-ints-taskscore") || n.hasAttribute("data-ints-origwrap")) || n.querySelector && n.querySelector("td,th,tr")) return !0;
      }
    }
    return !1;
  }
  function _shouldSchedule(muts) {
    return !_isPointsPage() || !_inlineEnabled() || !S.simCourses || !S.simCourses.length ? !1 : _structDirty || _markStructDirty(muts) ? (_structDirty = !0, !0) : !document.getElementById(GPA_ID) || _hasUndecoratedRows() ? !0 : _pageYearText() !== _lastPageYearText;
  }
  function _schedule(delay) {
    _timer || (_timer = setTimeout(() => {
      _timer = null, safe("points \u5185\u8054\u8C03\u5EA6", () => {
        _checkYearChange(), decoratePointsRows();
      });
    }, delay));
  }
  function _checkYearChange() {
    let txt = _pageYearText();
    if (txt === null) return;
    if (_lastPageYearText === null) {
      _lastPageYearText = txt;
      return;
    }
    if (txt === _lastPageYearText) return;
    let known = (S.yearList || []).some((y) => String(y.value) === txt);
    if (_lastPageYearText = txt, !known) {
      log("[\u5185\u8054] \u5B66\u5E74\u6587\u672C\u53D8\u6210 " + txt + "\uFF08\u4E0D\u5728\u5B66\u5E74\u5217\u8868\u91CC\uFF09\uFF0C\u5FFD\u7565\u8FD9\u6B21\u53D8\u5316");
      return;
    }
    log("[\u5185\u8054] \u7AD9\u70B9\u5B66\u5E74\u5207\u6362\u4E3A " + txt + "\uFF0C\u91CD\u65B0\u52A0\u8F7D"), safe("points \u5185\u8054\u6362\u5E74", () => {
      _ensureData().then((ok) => {
        ok && _schedule(DECORATE_DEBOUNCE_MS);
      }).catch(() => {
      });
    });
  }
  function _start() {
    _started || (_started = !0, log("[\u5185\u8054] /points \u5185\u8054\u6A21\u62DF\u542F\u52A8"), ensureStorageLoaded(), (S.lastSelectedFilter === "all" || S.lastSelectedFilter === "s1" || S.lastSelectedFilter === "s2") && (S.currentFilter = S.lastSelectedFilter), _colsExpanded = !!S.colsExpanded, _savedHeaders = null, _savedColSig = "", setCourseChangeListener((courseIdx) => {
      if (!(!_isPointsPage() || !_inlineEnabled())) {
        if (courseIdx === -1) decoratePointsRows();
        else if (S.simCourses[courseIdx]) {
          let tr = _rowForCourse(courseIdx);
          tr && _renderRow(tr, courseIdx), _renderGpa();
        }
        _refreshEditorWindows(), safe("\u660E\u7EC6\u7A97\u53E3\u5237\u65B0", refreshSubjectDetailWindows);
      }
    }), _lastPageYearText = _pageYearText(), _bootGateStats = null, _armBootGate(), _observer = new MutationObserver(guardListener("points \u5185\u8054\u89C2\u5BDF", (muts) => {
      _shouldSchedule(muts) && _schedule(DECORATE_DEBOUNCE_MS);
    })), _observer.observe(document.documentElement, { childList: !0, subtree: !0 }), _popHandler = guardListener("points \u5185\u8054\u8FD4\u56DE", () => _schedule(400)), window.addEventListener("popstate", _popHandler));
  }
  function _rowForCourse(courseIdx) {
    let rows = _rows(), used = /* @__PURE__ */ new Set();
    for (let tr of rows) {
      let idx = _matchCourseIndex(_rowInfo(tr), used);
      if (!(idx < 0) && (used.add(idx), idx === courseIdx))
        return tr;
    }
    return null;
  }
  function stopPointsInline() {
    if (!_started) return;
    _observer && (_observer.disconnect(), _observer = null), _timer && (clearTimeout(_timer), _timer = null), _bootTimer && (clearTimeout(_bootTimer), _bootTimer = null), _popHandler && (window.removeEventListener("popstate", _popHandler), _popHandler = null), _closeInlineWindows(), _closeTaskEditor(), safe("\u5185\u8054\u5217\u8FD8\u539F", () => {
      let vm = _findGradeVm();
      vm && (_colsExpanded && (_clearSyntheticColumns(vm), _savedHeaders !== null && (vm.dynamicHeaders = _savedHeaders.slice())), _savedHeaders = null, _savedColSig = "", _colsSig = null, _structDirty = !1, _siteHeaderIds = [], _siteColSig = "", _synthThCache = null, _driftCheckedAt = 0, _driftRefreshing = !1);
    });
    let gpa = document.getElementById(GPA_ID);
    gpa && gpa.remove(), _closeMenus();
    let ovHost = document.getElementById(OVERVIEW_VIEW_ID);
    [
      TERM_ID,
      TARGET_TOGGLE_ID,
      CALC_TOGGLE_ID,
      CALC_CARD_ID,
      OVERVIEW_TOGGLE_ID,
      OVERVIEW_VIEW_ID,
      RESET_ID,
      VTASK_BTN_ID,
      CLEAR_CACHE_ID,
      MENU_CALC_ID,
      MENU_SHOW_ID
    ].forEach((id) => {
      let el = document.getElementById(id);
      el && el.remove();
    }), ovHost && safe("\u603B\u89C8\u5BBF\u4E3B\u53CD\u6CE8\u518C", () => unregisterMultiYearHost(ovHost)), document.querySelectorAll("[data-ints-term]").forEach((el) => el.remove()), _targetStripOpen = !1, _targetHasState = null, _calcOpen = !1, _overviewOpen = !1, _overviewLoaded = !1, _overviewFailed = !1, _overviewSig = "", document.querySelectorAll("[" + INLINE_ATTR + "]").forEach((el) => {
      el.removeAttribute(INLINE_ATTR), el.removeAttribute("data-ints-clickable"), el.style.cursor = "", el.removeAttribute("title"), _restoreScoreCell(el);
      let box = el.querySelector("[data-ints-sim]");
      box && box.remove();
    }), document.querySelectorAll("[" + ROW_ATTR + "]").forEach((tr) => tr.removeAttribute(ROW_ATTR)), document.querySelectorAll(".ant-table-tbody [data-ints-sim], .ant-table-tbody [data-ints-coldelta]").forEach((el) => el.remove()), document.querySelectorAll("[data-ints-task]").forEach((td) => {
      td.removeAttribute("data-ints-task"), td.removeAttribute("data-ints-taskbound"), td.style.cursor = "", td.removeAttribute("title");
      let b = td.querySelector("[" + TASK_SCORE_ATTR + "]");
      b && b.remove();
      let inp = td.querySelector("[" + TASK_INPUT_ATTR + "]");
      inp && (inp._intsCancelled = !0, inp.remove());
      let sp = _siteScoreSpan(td);
      sp && (sp.style.display = "");
    }), document.querySelectorAll("[" + VTASK_ATTR + "]").forEach((td) => {
      _clearVirtualCell(td), td.removeAttribute("data-ints-taskbound");
    }), safe("\u5185\u8054\u6A21\u6001\u6E05\u7406", () => {
      let vt = document.querySelector(".virtual-task-modal");
      vt && vt.remove(), S.activeSubModal = !1;
      let diag = document.getElementById("ints-diag-modal");
      diag && diag.remove();
    }), _started = !1, _vm = null, _structDirty = !1, _siteHeaderIds = [], _siteColSig = "", log("[\u5185\u8054] /points \u5185\u8054\u5DF2\u505C\u6B62\u5E76\u6E05\u7406\u6CE8\u5165");
  }
  function syncPointsInline() {
    if (!_inlineEnabled()) {
      stopPointsInline();
      return;
    }
    _isPointsPage() ? _start() : stopPointsInline();
  }
  var INLINE_ATTR, ROW_ATTR, GPA_ID, DECORATE_DEBOUNCE_MS, _siteHeaderIds, _siteColSig, _colTrace, SCORE_SIM_ATTR, SCORE_WRAP_ATTR, SCORE_DELTA_ATTR, SCORE_DELTA_EPS, FIELD_CELL_SEARCH, SIM_BLUE, COL_DELTA_ATTR, FIELD_WRAP_ATTR, FIELD_BLOCK_ATTR, _synthThCache, TASK_SCORE_ATTR, TASK_INPUT_ATTR, VTASK_ATTR, COLOR_UP, COLOR_DOWN, _taskEditing, VTASK_FALLBACK, IE_KIND, IE_F_IDS, ALL_FIELDS, FIELD_LABEL, FIELD_BY_LABEL, FIELD_ORDER, SYNTH_PREFIX, TOGGLE_ID, TERM_ID, TARGET_TOGGLE_ID, _targetStripOpen, _targetHasState, COLOR_IDLE, COLOR_ACTIVE, _vm, _savedHeaders, _colsExpanded, _colsSig, _savedColSig, MENU_CALC_ID, MENU_SHOW_ID, MENU_CALC_TRIGGER_ID, MENU_SHOW_TRIGGER_ID, MENU_PANEL_ATTR, VTASK_BTN_ID, MENU_Z, _openMenu, _menuOutside, _menuEsc, CALC_CARD_ID, OVERVIEW_TOGGLE_ID, OVERVIEW_VIEW_ID, CALC_TOGGLE_ID, RESET_ID, CLEAR_CACHE_ID, _calcOpen, _overviewSig, _overviewOutside, ANTD_BAR_CHART_PATH, _overviewOpen, _overviewLoaded, _overviewFailed, OVERVIEW_COUNT_ID, _stats, _loading, DRIFT_CHECK_MS, DRIFT_MAX_REFRESH, _driftCheckedAt, _driftRefreshing, _driftRefreshes, _started, _observer, _timer, _bootTimer, _popHandler, _lastPageYearText, _bootGateStats, BOOT_GATE_POLL_MS, BOOT_GATE_MAX_MS, BOOT_IDLE_FALLBACK_MS, BOOT_IDLE_TIMEOUT_MS, _structDirty, init_inline_points = __esm({
    "v8.30/inline-points.js"() {
      init_state();
      init_utils();
      init_year_data();
      init_ui();
      init_simulation();
      init_gpa_target();
      init_diagnose();
      init_win_shell();
      init_log();
      INLINE_ATTR = "data-ints-inline", ROW_ATTR = "data-ints-row", GPA_ID = "ints-inline-gpa", DECORATE_DEBOUNCE_MS = 300;
      _siteHeaderIds = [], _siteColSig = "", _colTrace = null;
      SCORE_SIM_ATTR = "data-ints-simscore", SCORE_WRAP_ATTR = "data-ints-origwrap", SCORE_DELTA_ATTR = "data-ints-scoredelta", SCORE_DELTA_EPS = 5e-3;
      FIELD_CELL_SEARCH = [0, -1, 1];
      SIM_BLUE = "#1890ff", COL_DELTA_ATTR = "data-ints-coldelta", FIELD_WRAP_ATTR = "data-ints-fwrap", FIELD_BLOCK_ATTR = "data-ints-fsim";
      _synthThCache = null;
      TASK_SCORE_ATTR = "data-ints-taskscore", TASK_INPUT_ATTR = "data-ints-taskinput", VTASK_ATTR = "data-ints-vtask-id", COLOR_UP = "#52c41a", COLOR_DOWN = "#d4380d";
      _taskEditing = null;
      VTASK_FALLBACK = {
        box: "width: 120px; display: flex; flex-direction: column;",
        title: "",
        scoreBar: "padding: 4px 0px; text-align: center;",
        score: "min-height: 21px;"
      };
      IE_KIND = "editor", IE_F_IDS = { s1: "s1", s2: "s2" };
      ALL_FIELDS = ["s1p", "s1e", "s1f", "s2p", "s2e", "s2f"], FIELD_LABEL = { s1p: "S1P", s1e: "S1E", s1f: "S1F", s2p: "S2P", s2e: "S2E", s2f: "S2F" }, FIELD_BY_LABEL = { S1P: "s1p", S1E: "s1e", S1F: "s1f", S2P: "s2p", S2E: "s2e", S2F: "s2f", EOY: "eoy" }, FIELD_ORDER = { S1P: 0, S1E: 1, S1F: 2, S2P: 3, S2E: 4, S2F: 5, EOY: 6 };
      SYNTH_PREFIX = "ints_", TOGGLE_ID = "ints-inline-cols-btn", TERM_ID = "ints-inline-term", TARGET_TOGGLE_ID = "ints-inline-target-btn", _targetStripOpen = !1, _targetHasState = null, COLOR_IDLE = "#1890ff", COLOR_ACTIVE = "#26b889";
      _vm = null, _savedHeaders = null, _colsExpanded = !1, _colsSig = null;
      _savedColSig = "";
      MENU_CALC_ID = "ints-inline-menu-calc", MENU_SHOW_ID = "ints-inline-menu-show", MENU_CALC_TRIGGER_ID = "ints-inline-calc-menu-btn", MENU_SHOW_TRIGGER_ID = "ints-inline-show-menu-btn", MENU_PANEL_ATTR = "data-ints-menupanel", VTASK_BTN_ID = "ints-inline-vtask-btn", MENU_Z = 50, _openMenu = null, _menuOutside = null, _menuEsc = null;
      CALC_CARD_ID = "ints-inline-calc", OVERVIEW_TOGGLE_ID = "ints-inline-overview-btn", OVERVIEW_VIEW_ID = "ints-overview-view", CALC_TOGGLE_ID = "ints-inline-calc-btn", RESET_ID = "ints-inline-reset-btn", CLEAR_CACHE_ID = "ints-inline-clear-cache-btn", _calcOpen = !1, _overviewSig = "", _overviewOutside = null, ANTD_BAR_CHART_PATH = "M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm-600-80h56c4.4 0 8-3.6 8-8V560c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v144c0 4.4 3.6 8 8 8zm152 0h56c4.4 0 8-3.6 8-8V384c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v320c0 4.4 3.6 8 8 8zm152 0h56c4.4 0 8-3.6 8-8V462c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v242c0 4.4 3.6 8 8 8zm152 0h56c4.4 0 8-3.6 8-8V304c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v400c0 4.4 3.6 8 8 8z";
      _overviewOpen = !1, _overviewLoaded = !1, _overviewFailed = !1;
      OVERVIEW_COUNT_ID = "ints-overview-loading-text";
      _stats = { rows: 0, matched: 0, unmatched: 0, ts: 0 };
      _loading = !1, DRIFT_CHECK_MS = 60 * 1e3, DRIFT_MAX_REFRESH = 2, _driftCheckedAt = 0, _driftRefreshing = !1, _driftRefreshes = 0;
      _started = !1, _observer = null, _timer = null, _bootTimer = null, _popHandler = null, _lastPageYearText = null, _bootGateStats = null, BOOT_GATE_POLL_MS = 120, BOOT_GATE_MAX_MS = 5e3, BOOT_IDLE_FALLBACK_MS = 200, BOOT_IDLE_TIMEOUT_MS = 1200;
      _structDirty = !1;
    }
  });

  // v8.30/dragmark.js
  function DL2(...a) {
    log(...a);
  }
  function _isTeachingListPage() {
    let p = location.pathname.toLowerCase();
    return p === "/teaching" || p === "/teaching/";
  }
  function _findTaskListVm() {
    let el = document.querySelector(".teaching") || document.querySelector(".ant-table");
    if (!el) return null;
    let vm = null;
    for (let n = el; n && !vm; n = n.parentElement)
      n.__vue__ && (vm = n.__vue__);
    if (!vm) return null;
    let root = vm;
    for (; root.$parent; ) root = root.$parent;
    let queue = [root], seen = /* @__PURE__ */ new Set();
    for (; queue.length; ) {
      let cur = queue.shift();
      if (!(!cur || seen.has(cur))) {
        if (seen.add(cur), Array.isArray(cur.data) && cur.data.length) {
          let first = cur.data[0];
          if (first && typeof first == "object" && first.entityId !== void 0 && first.name !== void 0) return cur;
        }
        for (let ch of cur.$children || []) queue.push(ch);
      }
    }
    return null;
  }
  function _pad(n) {
    return n < 10 ? "0" + n : String(n);
  }
  function _fmtDateTime(v) {
    let d = new Date(v);
    return isNaN(d.getTime()) ? "" : d.getFullYear() + "-" + _pad(d.getMonth() + 1) + "-" + _pad(d.getDate()) + " " + _pad(d.getHours()) + ":" + _pad(d.getMinutes());
  }
  function _rowNameEl(rowEl) {
    return rowEl.querySelector("a.task-name");
  }
  function _rowName(rowEl) {
    let a = _rowNameEl(rowEl);
    return a ? a.textContent.trim() : null;
  }
  function _rowDeadlineText(rowEl) {
    let td = rowEl.children[2];
    return td ? ((td.querySelector("span.ellipsis") || td).textContent || "").trim() : "";
  }
  function _resolveRowTask(rowEl, vm) {
    let name = _rowName(rowEl);
    if (!name) return null;
    let deadline = _rowDeadlineText(rowEl), listVm = vm || _findTaskListVm();
    if (listVm) {
      let rows = listVm.data || [], hit = rows.find((r) => r && r.name === name && _fmtDateTime(r.endDate) === deadline);
      if (!hit) {
        let sameName = rows.filter((r) => r && r.name === name);
        sameName.length === 1 && (hit = sameName[0]);
      }
      if (!hit) {
        let idx = parseInt(rowEl.getAttribute("data-row-key"), 10);
        !isNaN(idx) && rows[idx] && rows[idx].name === name && (hit = rows[idx]);
      }
      if (hit) return { entityId: parseInt(hit.entityId, 10), name: hit.name, type: hit.type };
    }
    let cand = (S._deadlineAllTasks || []).find((x) => x.taskName === name && _fmtDateTime(x.endDate) === deadline);
    return cand ? { entityId: cand.entityId, name: cand.taskName, type: "1001" } : null;
  }
  function _flagOf(holder) {
    for (let c of holder.children)
      if (c.classList && c.classList.contains(FLAG_CLASS)) return c;
    return null;
  }
  function _unmarkRow(rowEl, via) {
    if (!rowEl) return !1;
    let task = _resolveRowTask(rowEl, _findTaskListVm());
    if (!task || isNaN(task.entityId) || !isTaskMarked(task.entityId)) return !1;
    setTaskMark(task.entityId, !1);
    let nameEl = _rowNameEl(rowEl);
    return nameEl && _updateRowFlag(nameEl, !1), _showToast(t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ") + task.name, !0), DL2("[\u62D6\u62FD\u6807\u8BB0] " + via + " \u53D6\u6D88\u6807\u8BB0 entityId=" + task.entityId + " name=" + task.name), !0;
  }
  function _updateRowFlag(nameEl, marked) {
    let holder = nameEl.parentElement;
    if (!holder) return;
    let existing = _flagOf(holder);
    if (marked && !existing) {
      let flag = document.createElement("span");
      flag.className = FLAG_CLASS, flag.style.cssText = "position:relative;top:-1px;margin-left:6px;display:inline-flex;align-items:center;vertical-align:middle;line-height:1;cursor:pointer;", flag.title = t("\u5DF2\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210\uFF08\u70B9\u51FB\u6216\u53F3\u952E\u53D6\u6D88\u6807\u8BB0\uFF09", "Marked as pending (click or right-click to unmark)"), flag.innerHTML = iconMark(MARK_COLOR_ON, "13px"), flag.addEventListener("click", guardListener("\u5217\u8868\u65D7\u5E1C\u5DE6\u952E\u53D6\u6D88\u6807\u8BB0", (e) => {
        e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation(), _unmarkRow(flag.closest("tr"), "\u65D7\u5E1C\u5DE6\u952E");
      })), flag.addEventListener("contextmenu", guardListener("\u5217\u8868\u65D7\u5E1C\u53F3\u952E\u53D6\u6D88\u6807\u8BB0", (e) => {
        e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation(), _unmarkRow(flag.closest("tr"), "\u65D7\u5E1C\u53F3\u952E");
      })), nameEl.insertAdjacentElement("afterend", flag);
    } else !marked && existing && existing.remove();
  }
  function _ensureRowHitZone(rowEl) {
    rowEl.getAttribute(ROWZONE_ATTR) !== "1" && (rowEl.setAttribute(ROWZONE_ATTR, "1"), rowEl.addEventListener("contextmenu", guardListener("\u5217\u8868\u884C\u53F3\u952E\u53D6\u6D88\u6807\u8BB0", (e) => {
      let nameEl = _rowNameEl(rowEl), task = _resolveRowTask(rowEl, _findTaskListVm());
      !task || isNaN(task.entityId) || !isTaskMarked(task.entityId) || (e.preventDefault(), e.stopPropagation(), setTaskMark(task.entityId, !1), nameEl && _updateRowFlag(nameEl, !1), _showToast(t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ") + task.name, !0), DL2("[\u62D6\u62FD\u6807\u8BB0] \u884C\u5224\u5B9A\u533A\u53F3\u952E \u53D6\u6D88\u6807\u8BB0 entityId=" + task.entityId + " name=" + task.name));
    })));
  }
  function decorateTeachingRows() {
    safe("\u4EFB\u52A1\u5217\u8868\u88C5\u9970", _decorateTeachingRows);
  }
  function _decorateTeachingRows() {
    if (!_isTeachingListPage()) return;
    let rows = document.querySelectorAll(".ant-table-tbody > tr.ant-table-row");
    if (!rows.length) return;
    loadTaskMarks();
    let vm = _findTaskListVm(), resolved = 0, unresolved = 0, decorated = 0;
    rows.forEach((rowEl) => {
      let nameEl = _rowNameEl(rowEl);
      if (!nameEl) return;
      _ensureRowHitZone(rowEl);
      let task = _resolveRowTask(rowEl, vm);
      task && !isNaN(task.entityId) ? resolved++ : unresolved++, nameEl.getAttribute(DRAG_ATTR) !== "1" && (nameEl.setAttribute(DRAG_ATTR, "1"), nameEl.setAttribute("draggable", "true"), nameEl.style.cursor = "grab", nameEl.style.userSelect = "none", nameEl.addEventListener("dragstart", guardListener("\u5217\u8868\u884C\u5F00\u59CB\u62D6\u62FD", _onDragStart)), nameEl.addEventListener("dragend", guardListener("\u5217\u8868\u884C\u7ED3\u675F\u62D6\u62FD", _onDragEnd)), decorated++), nameEl.title = t("\u62D6\u5230\u4E0B\u65B9\u5217\u8868\u5373\u53EF\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Drag onto the list below to mark as pending"), _updateRowFlag(nameEl, task && !isNaN(task.entityId) ? isTaskMarked(task.entityId) : !1);
    }), (decorated || unresolved) && DL2("[\u62D6\u62FD\u6807\u8BB0] \u88C5\u9970\u4EFB\u52A1\u884C: \u65B0\u589E\u53EF\u62D6\u62FD " + decorated + " \u884C\uFF0C\u5DF2\u5B9A\u4F4DID " + resolved + " \u884C\uFF0C\u672A\u5B9A\u4F4D " + unresolved + " \u884C");
  }
  function _setDragState(task) {
    _dragTask = task, S._taskDragging = !0, clearTimeout(_dragWatchdog), _dragWatchdog = setTimeout(() => {
      console.warn("[\u62D6\u62FD\u6807\u8BB0] dragend \u672A\u89E6\u53D1\uFF0C\u5F3A\u5236\u6E05\u7406\u62D6\u62FD\u72B6\u6001"), safe("\u62D6\u62FD\u770B\u95E8\u72D7\u6536\u5C3E", _onDragEnd);
    }, 8e3);
  }
  function _makeGhost(name) {
    let ghost = document.createElement("div");
    return ghost.style.cssText = "position:fixed;top:-1000px;left:-1000px;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:#fff;border:1px solid #ffd591;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,0.18);font-size:13px;color:#262626;", ghost.innerHTML = iconMark(MARK_COLOR_ON, "14px") + "<span>" + escapeHtml(name) + "</span>", document.body.appendChild(ghost), _dragGhost = ghost, ghost;
  }
  function _onDragStart(e) {
    let nameEl = e.currentTarget, rowEl = nameEl.closest("tr"), task = _resolveRowTask(rowEl, _findTaskListVm()), entityId = task && !isNaN(task.entityId) ? task.entityId : null;
    _dragTask = { entityId, name: nameEl.textContent.trim(), marked: entityId ? isTaskMarked(entityId) : !1, rowEl, nameEl, fromTooltip: !1 };
    try {
      e.dataTransfer.effectAllowed = "copyMove", e.dataTransfer.setData("text/plain", _dragTask.name), e.dataTransfer.setDragImage(_makeGhost(_dragTask.name), 12, 14);
    } catch (err) {
    }
    rowEl && (rowEl.style.opacity = "0.45"), _setDragState(_dragTask), _prepareZone(), DL2("[\u62D6\u62FD\u6807\u8BB0] \u5F00\u59CB\u62D6\u52A8\u300C" + _dragTask.name + "\u300D entityId=" + entityId + " \u5DF2\u6807\u8BB0=" + _dragTask.marked + " \u65B9\u5411=\u4E0A\u62D6(\u9EC4\u8272\u6807\u8BB0\u533A)");
  }
  function _onTooltipDragStart(e) {
    let row = e.target && e.target.closest ? e.target.closest(".task-dash-row") : null;
    if (!row || _dragTask) return;
    let entityId = parseInt(row.getAttribute("data-entity"), 10);
    if (!entityId || isNaN(entityId)) return;
    let name = row.getAttribute("data-name") || (row.textContent || "").trim().slice(0, 40), inferred = row.getAttribute("data-source") === "inferred", entry = (S._deadlineAllTasks || []).filter((t4) => String(t4.entityId) === String(entityId))[0] || null;
    _dragTask = { entityId, name, marked: isTaskMarked(entityId), inferred, endDate: entry ? entry.endDate : 0, rowEl: null, nameEl: null, fromTooltip: !0 };
    try {
      e.dataTransfer.effectAllowed = "copyMove", e.dataTransfer.setData("text/plain", name), e.dataTransfer.setDragImage(_makeGhost(name), 12, 14);
    } catch (err) {
    }
    _setDragState(_dragTask), _prepareZone(), DL2("[\u62D6\u62FD\u6807\u8BB0] \u4ECE\u60AC\u6D6E\u7A97\u5F00\u59CB\u62D6\u52A8\u300C" + name + "\u300D entityId=" + entityId + " \u5DF2\u6807\u8BB0=" + _dragTask.marked + " \u6765\u6E90=" + (inferred ? "\u63A8\u65AD\u9879(\u4E0B\u62D6=\u4E0D\u518D\u63D0\u9192)" : "\u7AD9\u70B9\u68C0\u6D4B\u9879(\u4E0B\u62D6=\u53D6\u6D88\u6807\u8BB0)"));
  }
  function _onDragEnd() {
    _dragTask && _dragTask.rowEl && (_dragTask.rowEl.style.opacity = ""), _dragGhost && (_dragGhost.remove(), _dragGhost = null), _clearAllZones(), _dragTask = null, S._taskDragging = !1, clearTimeout(_dragWatchdog), _dragWatchdog = null;
  }
  function _filterHost() {
    return document.querySelector(".filter-info.filter-container") || document.querySelector(".filter-container") || document.querySelector(".ant-row.filter-group");
  }
  function _tableHost() {
    return document.querySelector(".ant-table-wrapper") || document.querySelector(".ant-table") || document.querySelector(".ant-table-tbody");
  }
  function _inMarkArea(x, y) {
    let cr = (document.getElementById("container") || document.body).getBoundingClientRect(), upper = _filterHost(), bottom = upper ? upper.getBoundingClientRect().bottom + 8 : cr.top + 140;
    return x >= cr.left && x <= cr.right && y >= cr.top - 60 && y <= bottom;
  }
  function _inUnmarkArea(x, y) {
    let cr = (document.getElementById("container") || document.body).getBoundingClientRect(), upper = _filterHost(), top = upper ? upper.getBoundingClientRect().bottom + 4 : cr.top;
    return x >= cr.left && x <= cr.right && y >= top && y <= window.innerHeight;
  }
  function _activeKind() {
    return _dragTask && _dragTask.fromTooltip ? "unmark" : "mark";
  }
  function _inActiveArea(kind, x, y) {
    return kind === "unmark" ? _inUnmarkArea(x, y) : _inMarkArea(x, y);
  }
  function _zoneEl(kind) {
    let id = kind === "unmark" ? ZONE_UNMARK_ID : ZONE_MARK_ID, zone = document.getElementById(id);
    if (zone && zone.isConnected) return zone;
    let host = kind === "unmark" ? _tableHost() : _filterHost();
    if (!host) return null;
    getComputedStyle(host).position === "static" && (host.style.position = "relative"), zone = document.createElement("div"), zone.id = id;
    let style = kind === "unmark" ? "solid" : "dashed";
    return zone.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;border-radius:6px;pointer-events:none;z-index:20;transition:background .12s,border-color .12s,color .12s;border:2px " + style + " transparent;box-sizing:border-box;", host.appendChild(zone), zone;
  }
  function _clearZone(kind) {
    let zone = document.getElementById(kind === "unmark" ? ZONE_UNMARK_ID : ZONE_MARK_ID);
    zone && (zone.textContent = "", zone.style.borderColor = "transparent", zone.style.background = "transparent", zone.style.color = "transparent");
  }
  function _styleZone(kind, hot) {
    let zone = _zoneEl(kind);
    if (zone)
      if (kind === "unmark") {
        let inferring = !!(_dragTask && _dragTask.inferred);
        zone.textContent = inferring ? hot ? t("\u677E\u5F00\u9F20\u6807\uFF1A\u4E0D\u518D\u63D0\u9192\u8FD9\u4E2A\u4EFB\u52A1", "Release: stop reminding me of this task") : t("\u62D6\u5230\u6B64\u5904\u4E0D\u518D\u63D0\u9192\u8FD9\u4E2A\u4EFB\u52A1", "Drop here to stop reminding") : hot ? t("\u677E\u5F00\u9F20\u6807\uFF1A\u53D6\u6D88\u6807\u8BB0", "Release to unmark") : t("\u62D6\u5230\u6B64\u5904\u53D6\u6D88\u6807\u8BB0", "Drop here to unmark"), zone.style.borderColor = hot ? "#ff4d4f" : "rgba(255,77,79,0.55)", zone.style.background = hot ? "rgba(255,77,79,0.13)" : "rgba(255,77,79,0.05)", zone.style.color = hot ? "#cf1322" : "#d46b6b";
      } else {
        let marked = _dragTask && isTaskMarked(_dragTask.entityId);
        zone.textContent = hot ? marked ? t("\u677E\u5F00\u9F20\u6807\uFF1A\u79FB\u9664\u6807\u8BB0", "Release to remove the mark") : t("\u677E\u5F00\u9F20\u6807\uFF1A\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Release to mark as pending") : marked ? t("\u62D6\u5230\u6B64\u5904\u79FB\u9664\u6807\u8BB0", "Drop here to remove the mark") : t("\u62D6\u5230\u6B64\u5904\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Drop here to mark as pending"), zone.style.borderColor = hot ? "#faad14" : "rgba(250,173,20,0.65)", zone.style.background = hot ? "rgba(250,173,20,0.16)" : "rgba(250,173,20,0.06)", zone.style.color = hot ? "#ad6800" : "#8c6b1f";
      }
  }
  function _prepareZone() {
    let kind = _activeKind();
    _hot = !1, _clearZone(kind === "mark" ? "unmark" : "mark"), _styleZone(kind, !1);
  }
  function _clearAllZones() {
    _clearZone("mark"), _clearZone("unmark"), _hot = !1;
  }
  function _onDocDragOver(e) {
    if (!_dragTask) return;
    e.preventDefault();
    let kind = _activeKind(), inside = _inActiveArea(kind, e.clientX, e.clientY);
    try {
      e.dataTransfer && (e.dataTransfer.dropEffect = inside ? "copy" : "move");
    } catch (err) {
    }
    inside !== _hot && (_hot = inside, _styleZone(kind, inside));
  }
  function _onDocDrop(e) {
    if (!_dragTask) return;
    e.preventDefault(), e.stopPropagation();
    let { entityId, name, nameEl, fromTooltip } = _dragTask, kind = _activeKind(), inside = _inActiveArea(kind, e.clientX, e.clientY);
    if (!entityId || isNaN(entityId)) {
      _showToast(t("\u65E0\u6CD5\u5B9A\u4F4D\u8BE5\u4EFB\u52A1\u7684 ID\uFF0C\u672A\u80FD\u6807\u8BB0", "Could not resolve this task ID"), !1), console.warn("[\u62D6\u62FD\u6807\u8BB0] \u672A\u80FD\u5B9A\u4F4D\u4EFB\u52A1 ID\uFF0C\u6765\u6E90=" + (fromTooltip ? "\u60AC\u6D6E\u7A97" : "\u5217\u8868\u884C") + " name=" + name), _onDragEnd();
      return;
    }
    let marked = isTaskMarked(entityId);
    if (inside && kind === "mark") {
      let next = !marked;
      setTaskMark(entityId, next), nameEl && _updateRowFlag(nameEl, next), _showToast((next ? t("\u5DF2\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210: ", "Marked as pending: ") : t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ")) + name, next), DL2("[\u62D6\u62FD\u6807\u8BB0] \u843D\u5165\u9EC4\u8272\u6807\u8BB0\u533A \u2192 " + (next ? "\u6807\u8BB0" : "\u53D6\u6D88\u6807\u8BB0") + " entityId=" + entityId + " name=" + name);
    } else inside && kind === "unmark" ? _dragTask.inferred ? (marked && (setTaskMark(entityId, !1), nameEl && _updateRowFlag(nameEl, !1)), setTaskIgnored(entityId, _dragTask.endDate), _showToast(t("\u4E0D\u518D\u63D0\u9192: ", "No longer reminded: ") + name, !0), DL2("[\u62D6\u62FD\u6807\u8BB0] \u843D\u5165\u7EA2\u8272\u533A\uFF08\u63A8\u65AD\u9879\uFF09\u2192 \u5FFD\u7565 entityId=" + entityId + " name=" + name)) : marked ? (setTaskMark(entityId, !1), nameEl && _updateRowFlag(nameEl, !1), _showToast(t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ") + name, !0), DL2("[\u62D6\u62FD\u6807\u8BB0] \u843D\u5165\u7EA2\u8272\u53D6\u6D88\u6807\u8BB0\u533A \u2192 \u53D6\u6D88\u6807\u8BB0 entityId=" + entityId + " name=" + name)) : DL2("[\u62D6\u62FD\u6807\u8BB0] \u843D\u5165\u7EA2\u8272\u53D6\u6D88\u6807\u8BB0\u533A\u4F46\u4EFB\u52A1\u672A\u88AB\u6807\u8BB0\uFF0C\u65E0\u64CD\u4F5C entityId=" + entityId + " name=" + name) : DL2("[\u62D6\u62FD\u6807\u8BB0] \u672A\u843D\u5165" + (kind === "mark" ? "\u9EC4\u8272\u6807\u8BB0\u533A" : "\u7EA2\u8272\u53D6\u6D88\u6807\u8BB0\u533A") + "\uFF0C\u65E0\u64CD\u4F5C entityId=" + entityId + " name=" + name);
    _onDragEnd(), fromTooltip && decorateTeachingRows();
  }
  function _showToast(msg, ok) {
    ok === !1 ? console.warn("[\u6807\u8BB0] " + msg) : console.log("[\u6807\u8BB0] " + msg);
  }
  function startTeachingDragMark() {
    if (_started2) return;
    _started2 = !0;
    let onDragLeaveDoc = (e) => {
      _dragTask && !e.relatedTarget && _onDragEnd();
    }, onBlurWin = () => {
      _dragTask && _onDragEnd();
    }, onVisibility = () => {
      _dragTask && document.visibilityState === "hidden" && _onDragEnd();
    }, onPopState = () => setTimeout(decorateTeachingRows, 400);
    _handlers = {
      dragover: guardListener("\u5168\u5C40 dragover", _onDocDragOver),
      drop: guardListener("\u5168\u5C40 drop", _onDocDrop),
      dragstart: guardListener("\u5168\u5C40 dragstart", _onTooltipDragStart),
      // dragend 全局兜底：悬浮窗拖拽不在列表行上结束，必须全局清理，否则拖拽状态残留
      dragend: guardListener("\u5168\u5C40 dragend", _onDragEnd),
      // 拖出窗口 / 页面失焦 / 切走标签页时收尾（这些场景 Chrome 可能不派发 dragend）
      dragleave: guardListener("\u5168\u5C40 dragleave", onDragLeaveDoc),
      blur: guardListener("\u7A97\u53E3\u5931\u7126\u6536\u5C3E", onBlurWin),
      visibilitychange: guardListener("\u6807\u7B7E\u9875\u9690\u85CF\u6536\u5C3E", onVisibility),
      popstate: guardListener("SPA \u8FD4\u56DE\u88C5\u9970", onPopState)
    }, document.addEventListener("dragover", _handlers.dragover, !0), document.addEventListener("drop", _handlers.drop, !0), document.addEventListener("dragstart", _handlers.dragstart, !0), document.addEventListener("dragend", _handlers.dragend, !0), document.addEventListener("dragleave", _handlers.dragleave, !0), window.addEventListener("blur", _handlers.blur), document.addEventListener("visibilitychange", _handlers.visibilitychange), _listObserver = new MutationObserver(guardListener("\u5217\u8868\u53D8\u66F4\u89C2\u5BDF", () => {
      clearTimeout(_decorateTimer), _decorateTimer = setTimeout(decorateTeachingRows, 300);
    })), _listObserver.observe(document.documentElement, { childList: !0, subtree: !0 }), window.addEventListener("popstate", _handlers.popstate), decorateTeachingRows();
  }
  function stopTeachingDragMark() {
    _started2 && (_listObserver && (_listObserver.disconnect(), _listObserver = null), _decorateTimer && (clearTimeout(_decorateTimer), _decorateTimer = null), _handlers && (document.removeEventListener("dragover", _handlers.dragover, !0), document.removeEventListener("drop", _handlers.drop, !0), document.removeEventListener("dragstart", _handlers.dragstart, !0), document.removeEventListener("dragend", _handlers.dragend, !0), document.removeEventListener("dragleave", _handlers.dragleave, !0), window.removeEventListener("blur", _handlers.blur), document.removeEventListener("visibilitychange", _handlers.visibilitychange), window.removeEventListener("popstate", _handlers.popstate), _handlers = null), _dragTask && _onDragEnd(), safe("\u62D6\u62FD\u6807\u8BB0\u6E05\u7406", () => _clearAllZones()), _started2 = !1);
  }
  function syncTeachingDragMark() {
    _isTeachingListPage() ? startTeachingDragMark() : stopTeachingDragMark();
  }
  function getDragMarkState() {
    return {
      started: _started2,
      observer: !!_listObserver,
      listeners: _handlers ? Object.keys(_handlers).length : 0,
      dragging: !!_dragTask
    };
  }
  var DRAG_ATTR, ROWZONE_ATTR, FLAG_CLASS, ZONE_MARK_ID, ZONE_UNMARK_ID, _dragTask, _dragGhost, _dragWatchdog, _hot, _started2, _decorateTimer, _listObserver, _handlers, init_dragmark = __esm({
    "v8.30/dragmark.js"() {
      init_state();
      init_utils();
      init_deadline();
      init_diagnose();
      init_log();
      DRAG_ATTR = "data-ints-draggable", ROWZONE_ATTR = "data-ints-rowzone", FLAG_CLASS = "ints-task-flag", ZONE_MARK_ID = "ints-mark-zone-mark", ZONE_UNMARK_ID = "ints-mark-zone-unmark";
      _dragTask = null, _dragGhost = null, _dragWatchdog = null, _hot = !1;
      _started2 = !1, _decorateTimer = null, _listObserver = null, _handlers = null;
    }
  });

  // v8.30/button.js
  function _isSupportedPage() {
    let p = location.pathname.toLowerCase();
    return p === "/points" || p.startsWith("/points/") || p.startsWith("/points?") || p === "/teaching" || p.startsWith("/teaching/") || p.startsWith("/teaching?");
  }
  function addButton() {
    if (!_isSupportedPage()) {
      removeButton();
      return;
    }
    updateDeadlineIcon(), armDeadlineFallback();
  }
  function removeButton() {
    let btn = document.getElementById(BUTTON_ID);
    btn && btn.remove();
    let wrap = document.getElementById("intschool-deadline-wrap");
    wrap && wrap.remove();
    let floatTip = document.querySelector(".intschool-deadline-tooltip-fixed");
    floatTip && floatTip.remove(), stopDeadlinePolling();
  }
  function _needsInjection() {
    return _isSupportedPage() ? !document.getElementById("intschool-deadline-wrap") : !1;
  }
  function _runCheck() {
    safe("\u6CE8\u5165\u68C0\u67E5", () => {
      syncTaskMarkButton(), syncPointsInline(), syncTeachingDragMark(), checkDeadlinesAfterNav(), _isSupportedPage() ? _needsInjection() && addButton() : removeButton();
    });
  }
  function _scheduleCheck(delay) {
    _btnCheckTimer || (_btnCheckTimer = setTimeout(() => {
      _btnCheckTimer = null, _runCheck();
    }, Math.max(0, delay)));
  }
  function _startPoll(durationMs) {
    if (_pollDeadline = Date.now() + durationMs, _pollTimer) return;
    let tick = () => {
      _pollTimer = null, _runCheck(), _needsInjection() && Date.now() < _pollDeadline && (_pollTimer = setTimeout(tick, POLL_INTERVAL_MS));
    };
    _pollTimer = setTimeout(tick, POLL_INTERVAL_MS);
  }
  function startButtonObserver() {
    if (_btnObserverStarted) return;
    _btnObserverStarted = !0, GPA_COMPAT_MS > 0 ? setTimeout(_runCheck, GPA_COMPAT_MS) : _runCheck(), _startPoll(POLL_MAX_MS), _btnObserver = new MutationObserver(() => {
      safe("DOM \u53D8\u66F4\u5904\u7406", () => {
        (_needsInjection() || !_isSupportedPage()) && _scheduleCheck(OBSERVER_THROTTLE_MS);
      });
    }), _btnObserver.observe(document, { childList: !0, subtree: !0 });
    let _pushState = history.pushState;
    history.pushState = function() {
      _pushState.apply(this, arguments), safe("pushState \u94A9\u5B50", () => {
        _scheduleCheck(0), _startPoll(1500);
      });
    };
    let _replaceState = history.replaceState;
    history.replaceState = function() {
      _replaceState.apply(this, arguments), safe("replaceState \u94A9\u5B50", () => {
        _scheduleCheck(0), _startPoll(1500);
      });
    }, window.addEventListener("popstate", () => safe("popstate \u94A9\u5B50", () => {
      _scheduleCheck(0), _startPoll(1500);
    }));
  }
  var _btnCheckTimer, _pollTimer, _pollDeadline, _btnObserver, _btnObserverStarted, GPA_COMPAT_MS, POLL_INTERVAL_MS, POLL_MAX_MS, OBSERVER_THROTTLE_MS, init_button = __esm({
    "v8.30/button.js"() {
      init_state();
      init_deadline();
      init_inline_points();
      init_dragmark();
      init_diagnose();
      _btnCheckTimer = null, _pollTimer = null, _pollDeadline = 0, _btnObserver = null, _btnObserverStarted = !1, GPA_COMPAT_MS = 0, POLL_INTERVAL_MS = 80, POLL_MAX_MS = 2500, OBSERVER_THROTTLE_MS = 120;
    }
  });

  // v8.30/entry.js
  var require_entry = __commonJS({
    "v8.30/entry.js"() {
      init_utils();
      var import_styles = __toESM(require_styles());
      init_state();
      init_utils();
      init_log();
      init_courses();
      init_deadline();
      init_button();
      init_dragmark();
      init_inline_points();
      init_year_data();
      init_simulation();
      init_ui();
      init_win_shell();
      init_diagnose();
      window.addEventListener("error", (e) => {
        try {
          let src = String(e.filename || "");
          (src.indexOf("userscript") >= 0 || src.indexOf("Better") >= 0) && recordError("\u672A\u6355\u83B7\u5F02\u5E38", e.message || e.error);
        } catch (err) {
        }
      });
      window.addEventListener("unhandledrejection", (e) => {
        try {
          recordError("\u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD", e.reason && e.reason.message || e.reason);
        } catch (err) {
        }
      });
      _setGetGradeBookData(getGradeBookData);
      safe("\u4FDD\u5B58\u65F6\u673A\u6CE8\u518C", () => {
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden")
            try {
              flushSave();
            } catch (e) {
            }
        }), window.addEventListener("pagehide", () => {
          try {
            flushSave();
          } catch (e) {
          }
        });
      });
      safe("\u8BFB\u53D6\u672C\u5730\u7F13\u5B58", () => ensureStorageLoaded());
      document.body ? safe("\u542F\u52A8\u6309\u94AE\u89C2\u5BDF\u5668", () => startButtonObserver()) : document.addEventListener("DOMContentLoaded", () => safe("\u542F\u52A8\u6309\u94AE\u89C2\u5BDF\u5668", () => startButtonObserver()));
      window.__INTS_DEBUG = {
        S,
        isTaskMarked,
        setTaskMark,
        loadTaskMarks,
        checkUpcomingDeadlines,
        updateDeadlineIcon,
        renderTooltipContent,
        decorateTeachingRows,
        checkDeadlinesAfterNav,
        _setNavPathForTest,
        dumpTaskFields,
        classifyDeadlineTask,
        setTaskIgnored,
        isTaskIgnored,
        clearTaskIgnore,
        getTaskIgnoreCount,
        getDeadlineState,
        getDragMarkState,
        isLogOn,
        setLogOn,
        getBuildChannel,
        getCourseWeights,
        differsFromSchool,
        clearServerCache,
        decoratePointsRows,
        syncPointsInline,
        stopPointsInline,
        getInlineStats,
        loadPointsData: _ensureData,
        _resetDriftCheckForTest,
        loadMultiYearData,
        flushSave,
        loadFromLocalStorage,
        isYearCacheFresh,
        onTaskScoreChange,
        onExamScoreChange,
        onPStarChange,
        initSimCourses,
        applyUserLayer,
        resetSimulations,
        autoCalibrateStarredCourses,
        showSubjectDetailModal,
        refreshSubjectDetailWindows,
        listWindows,
        countWindows,
        closeTopWindow,
        closeAllWindows,
        getShellStats,
        getShellBounds,
        syncWindows
      };
      window.__INTS_DIAG = () => safe("\u8BCA\u65AD\u62A5\u544A", () => showDiagnostics());
      window.__INTS_LOG = (on) => safe("\u65E5\u5FD7\u5F00\u5173", () => on === void 0 ? isLogOn() : setLogOn(on));
      try {
        let pageWindow = typeof unsafeWindow != "undefined" ? unsafeWindow : null;
        pageWindow && pageWindow !== window && (pageWindow.__INTS_DEBUG = window.__INTS_DEBUG, pageWindow.__INTS_DIAG = window.__INTS_DIAG, pageWindow.__INTS_LOG = window.__INTS_LOG);
      } catch (e) {
      }
    }
  });
  require_entry();
})();
