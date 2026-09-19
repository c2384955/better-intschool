// ==UserScript==
// @name         Better Intschool
// @namespace    https://github.com/c2384955/better-intschool
// @version      1.00
// @description  Visualization adaptor, grade  calculator, task manager for shc.intschool.cn · 显示优化 / 成绩计算 / 任务管理
// @match        https://shc.intschool.cn/*
// @icon         https://shc.intschool.cn/logo_icon.png
// @grant        GM_addStyle
// @run-at       document-end
// @author       Chace & D.C & D.H
// @license      MIT
// @homepageURL  https://github.com/c2384955/better-intschool
// @supportURL   https://github.com/c2384955/better-intschool/issues
// @updateURL    https://raw.githubusercontent.com/c2384955/better-intschool/main/better-intschool.user.js
// @downloadURL  https://raw.githubusercontent.com/c2384955/better-intschool/main/better-intschool.user.js
// ==/UserScript==

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // v8.30/utils.js
  function normalizeWeights(w, label) {
    if (!Array.isArray(w) || w.length !== 5 || w.some((x) => typeof x !== "number" || !isFinite(x) || x < 0)) {
      console.error("[\u6743\u91CD] " + label + " \u6743\u91CD\u6570\u7EC4\u975E\u6CD5\uFF0C\u56DE\u843D\u9ED8\u8BA4\u6743\u91CD", w);
      return [...DEFAULT_WEIGHTS];
    }
    const sum = w.reduce((a, b) => a + b, 0);
    if (sum <= 0) {
      console.error("[\u6743\u91CD] " + label + " \u6743\u91CD\u548C <= 0\uFF0C\u56DE\u843D\u9ED8\u8BA4\u6743\u91CD", w);
      return [...DEFAULT_WEIGHTS];
    }
    if (Math.abs(sum - 1) > 1e-3) {
      console.error("[\u6743\u91CD] " + label + " \u6743\u91CD\u548C=" + sum + "\uFF0C\u4E0D\u4E3A 1.0\uFF0C\u5DF2\u81EA\u52A8\u5F52\u4E00\u5316\uFF08\u811A\u672C\u7EE7\u7EED\u8FD0\u884C\uFF09", w);
      return w.map((x) => x / sum);
    }
    return [...w];
  }
  function validateWeights() {
    const problems = [];
    const ds = DEFAULT_WEIGHTS.reduce((a, b) => a + b, 0);
    if (Math.abs(ds - 1) > 1e-3) problems.push("\u9ED8\u8BA4\u6743\u91CD\u548C=" + ds);
    for (const rule of SUBJECT_WEIGHT_RULES) {
      const s = rule.weights.reduce((a, b) => a + b, 0);
      if (Math.abs(s - 1) > 1e-3) problems.push('\u89C4\u5219 "' + rule.keywords.join(" ") + '" \u6743\u91CD\u548C=' + s);
    }
    if (problems.length) console.error("[\u6743\u91CD] \u81EA\u68C0\u53D1\u73B0\u95EE\u9898\uFF08\u5DF2\u5F52\u4E00\u5316\u5904\u7406\uFF0C\u4E0D\u5F71\u54CD\u8FD0\u884C\uFF09: " + problems.join("; "));
    return problems;
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
    if (num === 0) return "0";
    return num.toPrecision(4).replace(/\.?0+$/, "");
  }
  function formatGPA(g) {
    if (!g) return "\u2014";
    return `UW: ${g.uw.toFixed(2)} / W: ${g.w.toFixed(2)}`;
  }
  function formatDiff(d) {
    if (d === null || d === void 0) return "";
    if (Math.abs(d) < 5e-3) return '<span style="color:#000;">0.00</span>';
    let sign = d > 0 ? "+" : "";
    let color = d > 0 ? "green" : "red";
    return `<span style="color:${color};">${sign}${d.toFixed(2)}</span>`;
  }
  function iconChevron(expanded, size) {
    const s = size || "12px";
    return '<i class="anticon anticon-' + (expanded ? "up" : "down") + '" style="display:inline-flex;align-items:center;' + (expanded ? "transform:rotate(180deg);" : "") + 'vertical-align:-0.125em;margin-right:4px;"><svg viewBox="64 64 896 896" data-icon="' + (expanded ? "up" : "down") + '" width="' + s + '" height="' + s + '" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + ANTD_DOWN_PATH + '"></path></svg></i>';
  }
  function iconTable(size) {
    const s = size || "12px";
    return '<i class="anticon anticon-table" style="display:inline-flex;align-items:center;vertical-align:-0.125em;margin-right:4px;"><svg viewBox="64 64 896 896" data-icon="table" width="' + s + '" height="' + s + '" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + ANTD_TABLE_PATH + '"></path></svg></i>';
  }
  function escapeHtml(str) {
    if (str === null || str === void 0) return "";
    return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] || m);
  }
  function calcF(p, e) {
    if (p === null && e === null) return null;
    if (p === null) return e;
    if (e === null) return p;
    return p * 0.8 + e * 0.2;
  }
  function courseIdent(course) {
    if (!course) return "";
    if (course.courseId !== void 0 && course.courseId !== null && course.courseId !== "") return "c" + course.courseId;
    return "n" + String(course.name || "").replace(/\s+/g, " ").trim().toLowerCase();
  }
  function to3SigFigs(num) {
    if (num === null || num === void 0 || num === 0) return 0;
    const d = Math.ceil(Math.log10(Math.abs(num)));
    const power = 3 - d;
    return Math.round(num * Math.pow(10, power)) / Math.pow(10, power);
  }
  function helpIcon(zhText, enText, down) {
    const tip = t(zhText, enText).replace(/"/g, "&quot;");
    return '<span class="ints-help-wrap" data-help-text="' + tip + '" data-help-down="' + (down ? "1" : "0") + '" style="display:inline-flex;align-items:center;margin-left:4px;vertical-align:middle;cursor:help;"><svg viewBox="64 64 896 896" width="14" height="14" fill="#999" style="flex-shrink:0;pointer-events:none;"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/><path d="M464 688a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"/></svg></span>';
  }
  function setupHelpTooltip() {
    if (_helpTooltipDone) return;
    _helpTooltipDone = true;
    var floatEl = document.createElement("div");
    floatEl.id = "ints-help-float";
    floatEl.style.display = "none";
    document.body.appendChild(floatEl);
    var hideTimer = null;
    function show(wrap) {
      clearTimeout(hideTimer);
      var text = wrap.getAttribute("data-help-text");
      if (!text) return;
      floatEl.innerHTML = text.replace(/\n/g, "<br>");
      floatEl.style.display = "block";
      floatEl.className = wrap.getAttribute("data-help-down") === "1" ? "ints-help-float-down" : "ints-help-float-up";
      var rect = wrap.getBoundingClientRect();
      floatEl.style.visibility = "hidden";
      floatEl.style.left = "0";
      floatEl.style.top = "0";
      var tw = floatEl.offsetWidth;
      var th = floatEl.offsetHeight;
      floatEl.style.visibility = "";
      var left = rect.left + rect.width / 2 - tw / 2;
      var top = wrap.getAttribute("data-help-down") === "1" ? rect.bottom + 8 : rect.top - th - 8;
      var margin = 8;
      if (left < margin) left = margin;
      if (left + tw > window.innerWidth - margin) left = window.innerWidth - tw - margin;
      if (top < margin) top = margin;
      if (top + th > window.innerHeight - margin) top = window.innerHeight - th - margin;
      floatEl.style.left = left + "px";
      floatEl.style.top = top + "px";
    }
    function hide() {
      hideTimer = setTimeout(function() {
        floatEl.style.display = "none";
      }, 150);
    }
    document.addEventListener("mouseover", function(e) {
      var wrap = e.target.closest(".ints-help-wrap");
      if (wrap) show(wrap);
    }, true);
    document.addEventListener("mouseout", function(e) {
      var wrap = e.target.closest(".ints-help-wrap");
      if (wrap) hide();
    }, true);
    floatEl.addEventListener("mouseenter", function() {
      clearTimeout(hideTimer);
    });
    floatEl.addEventListener("mouseleave", function() {
      hide();
    });
  }
  function loadingBlockHtml(label, pad) {
    return '<div style="padding:' + (pad || "40px") + ';text-align:center;font-size:14px;color:#555;">' + iconLoading() + (label || t("\u52A0\u8F7D\u4E2D...", "Loading...")) + "</div>";
  }
  function loadingCountText(n, m) {
    const done = n || 0;
    if (!done && !m) return "";
    return " (" + t("\u8BF7\u6C42", "Request") + " " + done + (m ? "/" + m : "") + ")";
  }
  function getMarkIconPath() {
    try {
      const v = localStorage.getItem("ints_mark_icon");
      if (v && MARK_ICONS[v]) return MARK_ICONS[v];
    } catch (e) {
    }
    return MARK_ICONS.tag;
  }
  function iconMark(color, size) {
    const style = size ? ' style="font-size:' + size + ';"' : "";
    return '<i aria-hidden="true" class="anticon ints-mark-icon"' + style + '><svg viewBox="64 64 896 896" data-icon="mark" width="1em" height="1em" fill="' + (color || "currentColor") + '" aria-hidden="true" focusable="false"><path d="' + getMarkIconPath() + '"></path></svg></i>';
  }
  function getTermFromDate(ts, raw) {
    if (raw) {
      let t2 = String(raw).toUpperCase();
      if (t2.includes("FIRST") || t2 === "1") return "S1";
      if (t2.includes("SECOND") || t2 === "2") return "S2";
    }
    if (!ts) return null;
    let d = new Date(ts), m = d.getMonth(), day = d.getDate();
    if (m === 1 && day >= 16 && day <= 29) return null;
    if (m >= 7 || m === 0 || m === 1 && day <= 15) return "S1";
    if (m === 2 && day >= 1 || m >= 3 && m <= 6) return "S2";
    return null;
  }
  function computeColumnGPASummary(courses, getScore) {
    let tu = 0, tw = 0, tc = 0;
    for (let c of courses) {
      let s = getScore(c);
      if (s !== null && !isNaN(s)) {
        let g = getGPAForScore(s, c.weightBonus);
        if (g && c.credit > 0) {
          tu += g.uw * c.credit;
          tw += g.w * c.credit;
          tc += c.credit;
        }
      }
    }
    return tc === 0 ? null : { uw: tu / tc, w: tw / tc };
  }
  function computeAnnualGPA(courses, getS1F, getS2F) {
    const s1g = computeColumnGPASummary(courses, getS1F);
    const s2g = computeColumnGPASummary(courses, getS2F);
    if (!s1g && !s2g) return null;
    if (!s1g) return s2g;
    if (!s2g) return s1g;
    return { uw: (s1g.uw + s2g.uw) / 2, w: (s1g.w + s2g.w) / 2 };
  }
  function computeAnnualFromSemesters(effS1F, effS2F) {
    if (!effS1F && !effS2F) return null;
    let uwVals = [], wVals = [];
    if (effS1F && effS1F.uw !== null) uwVals.push(effS1F.uw);
    if (effS2F && effS2F.uw !== null) uwVals.push(effS2F.uw);
    if (effS1F && effS1F.w !== null) wVals.push(effS1F.w);
    if (effS2F && effS2F.w !== null) wVals.push(effS2F.w);
    let uw = uwVals.length > 0 ? uwVals.reduce((a, b) => a + b, 0) / uwVals.length : null;
    let w = wVals.length > 0 ? wVals.reduce((a, b) => a + b, 0) / wVals.length : null;
    if (uw === null && w === null) return null;
    return { uw, w };
  }
  function getCourseWeights(subject) {
    if (subject) {
      const s = subject.toLowerCase();
      for (let rule of SUBJECT_WEIGHT_RULES) {
        if (rule.keywords.every((kw) => s.includes(kw))) {
          return normalizeWeights(rule.weights, '\u89C4\u5219 "' + rule.keywords.join(" ") + '"');
        }
      }
    }
    return normalizeWeights(DEFAULT_WEIGHTS, "\u9ED8\u8BA4\u6743\u91CD");
  }
  function calcPFromCategoryData(catData, subject) {
    let weights = getCourseWeights(subject);
    let wSum = 0, tWeight = 0;
    for (let i = 0; i < 5; i++) {
      let c = catData[i];
      if (c.max > 0 && weights[i] > 0) {
        wSum += c.score / c.max * weights[i];
        tWeight += weights[i];
      }
    }
    return tWeight > 0 ? wSum / tWeight * 100 : null;
  }
  function aggregateCategoriesFromTasks(tasks, term, useSimulated = true) {
    let filtered = tasks.filter((t2) => getTermFromDate(t2.endDate, t2.termRaw) === term);
    let catData = Array(5).fill().map(() => ({ score: 0, max: 0 }));
    for (let t2 of filtered) {
      let idx = TYPE_PATTERNS.findIndex((p) => p.test(t2.typeName));
      if (idx >= 0 && idx < 5) {
        let scoreVal = useSimulated ? t2.simulatedScore !== void 0 ? t2.simulatedScore : t2.originalScore : t2.originalScore;
        if (scoreVal === -1) continue;
        if (scoreVal != null && t2.topScore != null && t2.topScore > 0) {
          catData[idx].score += scoreVal;
          catData[idx].max += t2.topScore;
        }
      }
    }
    return catData;
  }
  function calculateTermAverageByCategory(tasks, subject, term) {
    let filtered = tasks.filter((t2) => t2.score != null && t2.score !== -1 && !t2.excluded && t2.topScore !== 0 && getTermFromDate(t2.endDate, t2.termRaw) === term);
    if (filtered.length === 0) return null;
    let catTotals = Array(5).fill().map(() => ({ score: 0, topScore: 0 }));
    for (let t2 of filtered) {
      let idx = TYPE_PATTERNS.findIndex((p) => p.test(t2.typeName));
      if (idx >= 0 && idx < 5) {
        catTotals[idx].score += t2.score;
        catTotals[idx].topScore += t2.topScore;
      }
    }
    let weights = getCourseWeights(subject);
    let wSum = 0, tWeight = 0;
    for (let i = 0; i < 5; i++) {
      let c = catTotals[i];
      if (c.topScore > 0 && weights[i] > 0) {
        wSum += c.score / c.topScore * weights[i];
        tWeight += weights[i];
      }
    }
    return tWeight > 0 ? wSum / tWeight * 100 : null;
  }
  function alignToSchoolPrecision(estimate, schoolValue) {
    if (typeof estimate !== "number" || isNaN(estimate)) return estimate;
    if (typeof schoolValue !== "number" || isNaN(schoolValue)) return estimate;
    const frac = String(schoolValue).split(".")[1];
    const dec = frac ? Math.min(frac.length, 6) : 0;
    return Number(estimate.toFixed(dec));
  }
  function extractSubjectKey(name) {
    const lowerName = name.toLowerCase();
    for (const kw of SUBJECT_KEYWORDS) if (lowerName.includes(kw.toLowerCase())) return kw;
    return null;
  }
  function countUngradedTasks(tasks, term) {
    const termTasks = tasks.filter((t2) => getTermFromDate(t2.endDate, t2.termRaw) === term);
    return termTasks.filter((t2) => t2.score === null).length;
  }
  var locale, t, GRADE_BANDS, LETTER_TO_GPA, DEFAULT_WEIGHTS, SUBJECT_WEIGHT_RULES, ANTD_DOWN_PATH, ANTD_TABLE_PATH, _helpTooltipDone, iconPlus, iconSync, iconCheck, iconLoading, MARK_ICONS, MARK_ICON_PATH, MARK_COLOR_OFF, MARK_COLOR_ON, TYPE_PATTERNS, TYPE_NAMES, SUBJECT_KEYWORDS;
  var init_utils = __esm({
    "v8.30/utils.js"() {
      locale = (() => {
        try {
          return localStorage.getItem("locale") === "en" ? "en" : "zh";
        } catch (e) {
          return "zh";
        }
      })();
      t = (zh, en) => locale === "zh" ? zh : en;
      GRADE_BANDS = [
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
      ];
      LETTER_TO_GPA = /* @__PURE__ */ new Map([
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
      ]);
      DEFAULT_WEIGHTS = [0.1, 0.15, 0.15, 0.4, 0.2];
      SUBJECT_WEIGHT_RULES = [
        { keywords: ["chinese", "humanities"], weights: [0.1, 0.15, 0.3, 0.2, 0.25] },
        { keywords: ["chinese", "language"], weights: [0.1, 0.2, 0.15, 0.4, 0.15] },
        { keywords: ["computer", "science"], weights: [0.1, 0.2, 0.4, 0.3, 0] },
        { keywords: ["design", "technology"], weights: [0.1, 0.2, 0.4, 0.3, 0] },
        { keywords: ["global", "humanities"], weights: [0, 0.5, 0, 0.3, 0.2] },
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
      for (const rule of SUBJECT_WEIGHT_RULES) rule.weights = normalizeWeights(rule.weights, '\u89C4\u5219 "' + rule.keywords.join(" ") + '"');
      ANTD_DOWN_PATH = "M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z";
      ANTD_TABLE_PATH = "M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 208H676V232h212v136zm0 224H676V432h212v160zM412 432h200v160H412V432zm200-64H412V232h200v136zm-476 64h212v160H136V432zm0-200h212v136H136V232zm0 424h212v136H136V656zm276 0h200v136H412V656zm476 136H676V656h212v136z";
      _helpTooltipDone = false;
      setupHelpTooltip();
      iconPlus = () => '<i aria-label="icon: plus" class="anticon anticon-plus"><svg viewBox="64 64 896 896" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg></i>';
      iconSync = () => '<i aria-label="icon: sync" class="anticon anticon-sync"><svg viewBox="64 64 896 896" data-icon="sync" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M168 504.2c1-43.7 10-86.1 26.9-126 17.3-41 42.1-77.7 73.7-109.4S337 212.3 378 195c42.4-17.9 87.4-27 133.9-27s91.5 9.1 133.8 27A341.5 341.5 0 0 1 755 268.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 0 0 3 14.1l175.7 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c0-6.7-7.7-10.5-12.9-6.3l-56.4 44.1C765.8 155.1 646.2 92 511.8 92 282.7 92 96.3 275.6 92 503.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8zm756 7.8h-60c-4.4 0-7.9 3.5-8 7.8-1 43.7-10 86.1-26.9 126-17.3 41-42.1 77.8-73.7 109.4A342.45 342.45 0 0 1 512.1 856a342.24 342.24 0 0 1-243.2-100.8c-9.9-9.9-19.2-20.4-27.8-31.4l60.2-47a8 8 0 0 0-3-14.1l-175.7-43c-5-1.2-9.9 2.6-9.9 7.7l-.7 181c0 6.7 7.7 10.5 12.9 6.3l56.4-44.1C258.2 868.9 377.8 932 512.2 932c229.2 0 415.5-183.7 419.8-411.8a8 8 0 0 0-8-8.2z"></path></svg></i>';
      iconCheck = () => '<i aria-label="icon: check" class="anticon anticon-check"><svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path></svg></i>';
      iconLoading = () => '<i aria-label="icon: loading" class="anticon anticon-loading anticon-spin"><svg viewBox="0 0 1024 1024" data-icon="loading" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg></i>';
      MARK_ICONS = {
        pushpin: "M878.3 392.1L631.9 145.7c-6.5-6.5-15-9.7-23.5-9.7s-17 3.2-23.5 9.7L423.8 306.9c-12.2-1.4-24.5-2-36.8-2-73.2 0-146.4 24.1-206.5 72.3-15.4 12.3-16.6 35.4-2.7 49.4l181.7 181.7-215.4 215.2a15.8 15.8 0 00-4.6 9.8l-3.4 37.2c-.9 9.4 6.6 17.4 15.9 17.4.5 0 1 0 1.5-.1l37.2-3.4c3.7-.3 7.2-2 9.8-4.6l215.4-215.4 181.7 181.7c6.5 6.5 15 9.7 23.5 9.7 9.7 0 19.3-4.2 25.9-12.4 56.3-70.3 79.7-158.3 70.2-243.4l161.1-161.1c12.9-12.8 12.9-33.8 0-46.8z",
        tag: "M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-3.2 0-5.7 1-7.6 2.9L88.9 557.2a9.96 9.96 0 000 14.1l363.8 363.8c1.9 1.9 4.4 2.9 7.1 2.9s5.2-1 7.1-2.9l468.3-468.3c2-2.1 3-5 2.8-8zM699 387c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z",
        flag: "M880 305H624V192c0-17.7-14.3-32-32-32H184v-40c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v784c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V640h248v113c0 17.7 14.3 32 32 32h416c17.7 0 32-14.3 32-32V337c0-17.7-14.3-32-32-32z",
        highlight: "M957.6 507.4L603.2 158.2a7.9 7.9 0 00-11.2 0L353.3 393.4a8.03 8.03 0 00-.1 11.3l.1.1 40 39.4-117.2 115.3a32.09 32.09 0 00-9.5 21.9l-1 46.6-31.1 29.5a33.4 33.4 0 00-2.3 2.6l-27.1 27.2a15.5 15.5 0 000 22l92.6 92.5c3 3 7.1 4.7 11.3 4.7s8.2-1.7 11.2-4.7l55.4-55.4a11.5 11.5 0 002.6-2.3l29.6-31 46.6-1c8.1-.2 15.9-3.4 21.8-9.3l115.4-115.2 39.5 40.1c3.1 3.1 8.2 3.1 11.3 0L957.5 518.6c3.1-3.1 3.1-8.2.1-11.2z"
      };
      MARK_ICON_PATH = MARK_ICONS.tag;
      MARK_COLOR_OFF = "#1f1f1f";
      MARK_COLOR_ON = "#faad14";
      TYPE_PATTERNS = [/homework/i, /in.?class|classwork/i, /project|lab/i, /test/i, /quiz/i];
      TYPE_NAMES = ["Homework", "In-Class/Classwork", "Projects/Labs", "Tests", "Quizzes"];
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
       #intschool-custom-grade-btn\u3001.editable-score/-exam/-pstar \u7B49\uFF09\u5DF2\u5220\uFF0C
       \u9700\u8981\u65F6\u89C1 archives/legacy-panel/ \u7684\u4E24\u4EFD\u6E90\u7801\u3002 */
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
  function _serTask(t2) {
    return { e: t2.entityId, n: t2.name, y: t2.typeName, s: t2.score, t: t2.topScore, d: t2.endDate, r: t2.termRaw, o: t2.originalScore, m: t2.simulatedScore, v: t2.isVirtual || false, x: t2.excluded === true };
  }
  function _deserTask(o) {
    return { entityId: o.e, taskStudentId: o.e, id: o.e, name: o.n, typeName: o.y, score: o.s, topScore: o.t, endDate: o.d, termRaw: o.r, originalScore: o.o, simulatedScore: o.m, isVirtual: o.v || false, excluded: o.x === true };
  }
  function _serCourse(c) {
    return { n: c.name, ci: c.courseId, cr: c.credit, wb: c.weightBonus, su: c.subject || null, og: { s1p: c.originalGrades.s1p, s1e: c.originalGrades.s1e, s1f: c.originalGrades.s1f, s2p: c.originalGrades.s2p, s2e: c.originalGrades.s2e, s2f: c.originalGrades.s2f }, sg: c.simGrades ? { s1p: c.simGrades.s1p, s1e: c.simGrades.s1e, s1f: c.simGrades.s1f, s2p: c.simGrades.s2p, s2e: c.simGrades.s2e, s2f: c.simGrades.s2f } : null, ss: c.showStar ? { s1: c.showStar.s1, s2: c.showStar.s2 } : null, op: c.overrideP ? { s1: c.overrideP.s1, s2: c.overrideP.s2 } : null, ts: (c.tasks || []).map((t2) => _serTask(t2)) };
  }
  function _deserCourse(o) {
    let c = { name: o.n, courseId: o.ci, credit: o.cr, weightBonus: o.wb, subject: o.su || null, originalGrades: o.og, simGrades: o.sg || { s1p: o.og.s1p, s1e: o.og.s1e, s1f: o.og.s1f, s2p: o.og.s2p, s2e: o.og.s2e, s2f: o.og.s2f }, showStar: o.ss || { s1: false, s2: false }, overrideP: o.op || { s1: null, s2: null }, tasks: (o.ts || []).map((t2) => _deserTask(t2)) };
    if (c.simGrades.s1p === void 0) c.simGrades.s1p = c.originalGrades.s1p;
    if (c.simGrades.s2p === void 0) c.simGrades.s2p = c.originalGrades.s2p;
    return c;
  }
  function _serUserCourse(c) {
    let e = null;
    if (c.simGrades && c.originalGrades && (c.simGrades.s1e !== c.originalGrades.s1e || c.simGrades.s2e !== c.originalGrades.s2e)) {
      e = { s1e: c.simGrades.s1e, s2e: c.simGrades.s2e };
    }
    const te = [];
    const vt = [];
    for (const t2 of c.tasks || []) {
      if (t2.isVirtual) {
        vt.push(_serTask(t2));
        continue;
      }
      if (t2.simulatedScore === t2.originalScore) continue;
      te.push({ e: t2.entityId, m: t2.simulatedScore });
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
    if (uc.te.length || uc.vt.length || uc.e) return true;
    if (uc.op && (uc.op.s1 !== null || uc.op.s2 !== null)) return true;
    return false;
  }
  function calibrationExcluded(yearKey, entityId) {
    const set = S.calibExcluded.get(String(yearKey));
    return !!(set && set.has(String(entityId)));
  }
  function markCalibrationExcluded(yearKey, entityId) {
    if (entityId === void 0 || entityId === null || entityId === "") return false;
    const k = String(yearKey);
    let set = S.calibExcluded.get(k);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      S.calibExcluded.set(k, set);
    }
    const id = String(entityId);
    if (set.has(id)) return false;
    set.add(id);
    markDirty();
    return true;
  }
  function _isSchoolYear(yearKey) {
    return S.schoolYearKey === null || String(yearKey) === String(S.schoolYearKey);
  }
  function _simsForSave(yearKey, entry) {
    if (String(yearKey) === String(S.simYearKey) && S.simCourses && S.simCourses.length) return S.simCourses;
    return entry.simCourses;
  }
  function _collectUserLayer() {
    let prev = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) prev = JSON.parse(raw) || {};
    } catch (e) {
      prev = {};
    }
    const out = __spreadValues({}, prev);
    for (let [k, v] of S.yearDataCache) {
      if (!_isSchoolYear(k)) continue;
      const sims = _simsForSave(k, v);
      if (!sims || !sims.length) continue;
      const cs = [];
      for (const c of sims) {
        const uc = _serUserCourse(c);
        if (_userLayerDirty(uc)) cs.push(uc);
      }
      if (cs.length) {
        out[k] = { vt: String(k) === String(S.simYearKey) ? S.virtualTaskIdCounter : v.virtualTaskIdCounter, c: cs };
      } else {
        delete out[k];
      }
    }
    return out;
  }
  function flushSave(force) {
    if (!force && !S._saveDirty) return;
    S._saveDirty = false;
    clearTimeout(S._saveTimer);
    S._saveTimer = null;
    try {
      const cacheObj = {};
      for (let [k, v] of S.yearDataCache) {
        const ser = { sectionName: v.sectionName, annualGPA: v.annualGPA, cumulativeGPA: v.cumulativeGPA, dataTs: v.dataTs || 0 };
        if (v.originalCourses) ser.oc = v.originalCourses.map((c) => _serCourse(c));
        if (_isSchoolYear(k)) {
          const sims = _simsForSave(k, v);
          if (sims && sims.length) ser.sc = sims.map((c) => _serCourse(c));
        }
        const vt = String(k) === String(S.simYearKey) ? S.virtualTaskIdCounter : v.virtualTaskIdCounter;
        if (vt !== void 0 && vt !== null) ser.vt = vt;
        cacheObj[k] = ser;
      }
      localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(cacheObj));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(_collectUserLayer()));
      const calib = {};
      for (const [k, set] of S.calibExcluded) {
        if (set && set.size) calib[k] = [...set];
      }
      localStorage.setItem(STORAGE_KEY_CALIB, JSON.stringify(calib));
      localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(S.multiYearGPAOverrides));
      localStorage.setItem(STORAGE_KEY_VTID, String(S.virtualTaskIdCounter));
      if (S.lastSelectedYearKey !== null) localStorage.setItem(STORAGE_KEY_LAST_YEAR, S.lastSelectedYearKey);
      localStorage.setItem(STORAGE_KEY_LAST_FILTER, S.lastSelectedFilter);
      if (S.targetUWGPA !== null) localStorage.setItem(STORAGE_KEY_TARGET_UW, String(S.targetUWGPA));
      else localStorage.removeItem(STORAGE_KEY_TARGET_UW);
      if (S.targetWGPA !== null) localStorage.setItem(STORAGE_KEY_TARGET_W, String(S.targetWGPA));
      else localStorage.removeItem(STORAGE_KEY_TARGET_W);
      localStorage.setItem(STORAGE_KEY_TARGET_MODE, S.targetGPAMode);
    } catch (e) {
      console.error("[\u4FDD\u5B58] flushSave \u5931\u8D25:", e.message);
    }
  }
  function markDirty() {
    S._saveDirty = true;
    if (!S._saveTimer) S._saveTimer = setTimeout(() => flushSave(), 2e3);
  }
  function isYearCacheFresh(yearKey) {
    const v = S.yearDataCache.get(String(yearKey));
    if (!v) return false;
    const ts = v.dataTs || 0;
    if (!ts) return false;
    return Date.now() - ts < CACHE_TTL;
  }
  function loadFromLocalStorage() {
    try {
      const cacheStr = localStorage.getItem(STORAGE_KEY_CACHE);
      if (cacheStr) {
        const cacheObj = JSON.parse(cacheStr);
        delete cacheObj._ts;
        for (let [k, v] of Object.entries(cacheObj)) {
          const restored = { sectionName: v.sectionName, annualGPA: v.annualGPA, cumulativeGPA: v.cumulativeGPA, dataTs: v.dataTs || 0 };
          if (v.oc) restored.originalCourses = v.oc.map((o) => _deserCourse(o));
          if (v.sc) restored.simCourses = v.sc.map((o) => _deserCourse(o));
          if (v.vt !== void 0) restored.virtualTaskIdCounter = v.vt;
          S.yearDataCache.set(k, restored);
        }
      }
      const userStr = localStorage.getItem(STORAGE_KEY_USER);
      if (userStr) {
        const userObj = JSON.parse(userStr);
        for (let [k, v] of Object.entries(userObj || {})) {
          if (v && Array.isArray(v.c)) S.userSimCache.set(k, v);
        }
      }
      const ovStr = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      if (ovStr) {
        S.multiYearGPAOverrides = JSON.parse(ovStr);
      }
      const calStr = localStorage.getItem(STORAGE_KEY_CALIB);
      if (calStr) {
        const calObj = JSON.parse(calStr) || {};
        S.calibExcluded = new Map(Object.entries(calObj).map(([k, v]) => [k, new Set((Array.isArray(v) ? v : []).map(String))]));
      }
      const vtidStr = localStorage.getItem(STORAGE_KEY_VTID);
      if (vtidStr) {
        S.virtualTaskIdCounter = parseInt(vtidStr) || -1;
      }
      const lyStr = localStorage.getItem(STORAGE_KEY_LAST_YEAR);
      if (lyStr) {
        S.lastSelectedYearKey = lyStr;
      }
      const lfStr = localStorage.getItem(STORAGE_KEY_LAST_FILTER);
      if (lfStr) {
        S.lastSelectedFilter = lfStr;
      }
      const tuwStr = localStorage.getItem(STORAGE_KEY_TARGET_UW);
      if (tuwStr) {
        S.targetUWGPA = parseFloat(tuwStr);
      }
      const twStr = localStorage.getItem(STORAGE_KEY_TARGET_W);
      if (twStr) {
        S.targetWGPA = parseFloat(twStr);
      }
      const modeStr = localStorage.getItem(STORAGE_KEY_TARGET_MODE);
      if (modeStr === "exam" || modeStr === "subject") {
        S.targetGPAMode = modeStr;
      }
    } catch (e) {
      console.error("[\u52A0\u8F7D] loadFromLocalStorage \u5931\u8D25:", e.message);
    }
  }
  function ensureStorageLoaded() {
    if (S._storageLoaded) return;
    S._storageLoaded = true;
    loadFromLocalStorage();
  }
  var BASE_URL, BUTTON_ID, DEADLINE_CACHE_TTL, CACHE_TTL, COLUMN_KEY_MAPPING, STORAGE_KEY_TASK_TOGGLES, STORAGE_KEY_TASK_MARKS, STORAGE_KEY_CACHE, STORAGE_KEY_USER, STORAGE_KEY_OVERRIDES, STORAGE_KEY_VTID, STORAGE_KEY_CALIB, STORAGE_KEY_LAST_YEAR, STORAGE_KEY_LAST_FILTER, STORAGE_KEY_TARGET_UW, STORAGE_KEY_TARGET_W, STORAGE_KEY_TARGET_MODE, S;
  var init_state = __esm({
    "v8.30/state.js"() {
      BASE_URL = "https://shc.intschool.cn/api";
      BUTTON_ID = "intschool-custom-grade-btn";
      DEADLINE_CACHE_TTL = 5 * 60 * 1e3;
      CACHE_TTL = 60 * 60 * 1e3;
      COLUMN_KEY_MAPPING = {
        "2025-2026": { s1p: "189", s1e: "191", s1f: null, s2p: "226", s2e: null, s2f: null }
      };
      STORAGE_KEY_TASK_TOGGLES = "ints_task_toggles";
      STORAGE_KEY_TASK_MARKS = "ints_task_marks";
      STORAGE_KEY_CACHE = "ints_gs_cache";
      STORAGE_KEY_USER = "ints_gs_user";
      STORAGE_KEY_OVERRIDES = "ints_gs_overrides";
      STORAGE_KEY_VTID = "ints_gs_vtid";
      STORAGE_KEY_CALIB = "ints_calib_excluded";
      STORAGE_KEY_LAST_YEAR = "ints_gs_lastYear";
      STORAGE_KEY_LAST_FILTER = "ints_gs_lastFilter";
      STORAGE_KEY_TARGET_UW = "ints_gs_targetUW";
      STORAGE_KEY_TARGET_W = "ints_gs_targetW";
      STORAGE_KEY_TARGET_MODE = "ints_gs_targetMode";
      S = {
        currentYearKey: null,
        currentYearValue: null,
        // **在读学年**（进 /points 时站点下拉自己选中的那一个，只认第一次）。
        // 站点页面上把学年切到往期之后 `currentYearKey` 会跟着变，但"这是不是在读学年"不能跟着变 ——
        // 能不能模拟、要不要写用户数据、跑不跑校准，全看这一个键。
        schoolYearKey: null,
        // **`originalCourses` / `simCourses` 属于哪一年**（数据来源标记）。
        // 切换学年时 `currentYearKey` 是"先改键、后换数据"（`loadPageYearData` 先赋值，`loadYearData`
        // 才去拉/读缓存，中间夹着网络请求、还可能被 abort 或失败）⇒ 落盘若拿 `currentYearKey` 当键，
        // 就会把 A 学年的课程写进 B 学年的槽位（往期页面于是显示别的年份的分数与校准排除）。
        simYearKey: null,
        isCurrentYear: true,
        yearList: [],
        originalCourses: [],
        simCourses: [],
        currentFilter: "all",
        activeSubModal: false,
        warningTimeout: null,
        isCalibrating: false,
        calibrateAbortController: null,
        taskDetailCache: /* @__PURE__ */ new Map(),
        yearDataCache: /* @__PURE__ */ new Map(),
        userSimCache: /* @__PURE__ */ new Map(),
        // yearKey → 用户层（无 TTL，见 STORAGE_KEY_USER）
        virtualTaskIdCounter: -1,
        creditMap: /* @__PURE__ */ new Map(),
        _creditMapCache: null,
        isMultiYearMode: false,
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
        targetUWGPA: null,
        targetWGPA: null,
        targetGPAMode: "subject",
        _targetGapCache: /* @__PURE__ */ new Map(),
        _deadlineCache: { ts: 0, data: [] },
        _deadlineAllTasks: [],
        _deadlineCheckInFlight: false,
        _taskToggles: {},
        _taskMarks: {},
        _taskDragging: false,
        _errors: [],
        _navGeneration: 0,
        _autoCalibrateCounts: /* @__PURE__ */ new Map(),
        // courseId → 本会话已自动校准次数（每科上限见 simulation.js）
        calibExcluded: /* @__PURE__ */ new Map(),
        // yearKey → Set(entityId)：校准确认不计分的任务（无 TTL，跨会话）
        _simGen: 0,
        // 模拟层代次（initSimCourses 每次重建 +1，校准据此放弃过期结果）
        _saveDirty: false,
        _saveTimer: null,
        _storageLoaded: false
      };
    }
  });

  // v8.30/api.js
  function getToken() {
    return sessionStorage.getItem("token") || (() => {
      try {
        let t2 = localStorage.getItem("token");
        if (t2) return JSON.parse(t2).token;
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
    const token = getToken(), schoolId = getSchoolId(), locale2 = getLocale();
    const headers = __spreadValues({
      "x-token": token,
      "x-schoolid": String(schoolId),
      "x-locale": locale2
    }, options.headers);
    const signal = options.signal || (S.currentAbortController ? S.currentAbortController.signal : null);
    const response = await fetch(url, __spreadProps(__spreadValues({}, options), { headers, credentials: "include", signal }));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  async function promiseLimit(promises, limit = 5) {
    const results = [];
    const executing = [];
    for (const promise of promises) {
      const p = Promise.resolve().then(() => promise);
      results.push(p);
      if (limit <= promises.length) {
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= limit) await Promise.race(executing);
      }
    }
    return Promise.all(results);
  }
  async function fetchSchoolYearList() {
    if (S.yearListCache) return S.yearListCache;
    console.log("[API] \u83B7\u53D6\u5B66\u5E74\u5217\u8868");
    const data = await apiRequest(BASE_URL + "/dropDown/schoolYearRuleList");
    if (!Array.isArray(data) || data.length === 0) {
      S.yearListCache = null;
      throw new Error("[API] \u5B66\u5E74\u5217\u8868\u54CD\u5E94\u65E0\u6548\u6216\u4E3A\u7A7A: " + (data === null ? "null" : Array.isArray(data) ? "\u7A7A\u6570\u7EC4" : typeof data));
    }
    S.yearListCache = data.map((item) => ({ key: item.key, value: item.value }));
    return S.yearListCache;
  }
  function parseScheduleToCreditMap(raw) {
    try {
      const sched = JSON.parse(raw);
      const scsResponses = sched.scsResponses;
      if (!Array.isArray(scsResponses)) {
        console.warn("[\u52A0\u8F7D] schedule \u6570\u636E\u7F3A\u5C11 scsResponses \u6570\u7EC4\uFF0C\u9876\u5C42 keys: " + Object.keys(sched).join(","));
        return null;
      }
      const map = /* @__PURE__ */ new Map();
      let totalCourses = 0, withCredit = 0;
      scsResponses.forEach((scs) => {
        const courses = [...scs.courses || [], ...scs.ongoingCourses || []];
        courses.forEach((c) => {
          totalCourses++;
          if (c.courseId && typeof c.effectiveCredit === "number") {
            map.set(c.courseId, c.effectiveCredit);
            withCredit++;
          } else if (totalCourses <= 3) {
            console.warn("[\u52A0\u8F7D] schedule \u8BFE\u7A0B\u7F3A\u5C11 courseId/effectiveCredit: " + JSON.stringify({ courseId: c.courseId, courseName: c.courseName, effectiveCredit: c.effectiveCredit }));
          }
        });
      });
      console.log(`[\u52A0\u8F7D] loadCreditMap: scsResponses=${scsResponses.length} \u8BFE\u7A0B=${totalCourses} \u5B66\u5206\u6761\u76EE=${withCredit}`);
      return map;
    } catch (e) {
      console.error("[\u8C03\u8BD5] loadCreditMap \u89E3\u6790 schedule \u5F02\u5E38", e);
      return null;
    }
  }
  async function loadCreditMap() {
    if (S._creditMapCache) return S._creditMapCache;
    try {
      const raw = localStorage.getItem("schedule");
      if (raw) {
        const map = parseScheduleToCreditMap(raw);
        if (map) {
          S._creditMapCache = map;
          return map;
        }
      }
    } catch (e) {
      console.error("[\u8C03\u8BD5] loadCreditMap \u8BFB\u53D6 schedule \u5F02\u5E38", e);
    }
    try {
      const data = await apiRequest(BASE_URL + "/schedule");
      const map = parseScheduleToCreditMap(JSON.stringify(data));
      if (map) {
        try {
          localStorage.setItem("schedule", JSON.stringify(data));
        } catch (e) {
        }
        S._creditMapCache = map;
        return map;
      }
    } catch (e) {
      console.warn("[\u52A0\u8F7D] /api/schedule \u8BF7\u6C42\u5931\u8D25: " + e.message + "\uFF0C\u7B49\u5F85 localStorage \u515C\u5E95");
    }
    const pollDeadline = Date.now() + 5e3;
    while (Date.now() < pollDeadline) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const raw = localStorage.getItem("schedule");
        if (raw) {
          const map = parseScheduleToCreditMap(raw);
          if (map) {
            S._creditMapCache = map;
            return map;
          }
        }
      } catch (e) {
        console.error("[\u8C03\u8BD5] loadCreditMap \u8F6E\u8BE2\u8BFB\u53D6 schedule \u5F02\u5E38", e);
      }
    }
    console.warn("[\u52A0\u8F7D] loadCreditMap \u672A\u53D6\u5230 schedule \u6570\u636E\uFF08localStorage \u4E0E /api/schedule \u5747\u5931\u8D25\uFF09\uFF0C\u5B66\u5206\u6620\u5C04\u4E3A\u7A7A");
    S._creditMapCache = /* @__PURE__ */ new Map();
    return S._creditMapCache;
  }
  function mergeTasksForTerm(targetCourse, sourceCourse, term) {
    const sourceTasks = sourceCourse.tasks.filter((t2) => getTermFromDate(t2.endDate, t2.termRaw) === term);
    const existingIds = new Set(targetCourse.tasks.map((t2) => t2.id));
    for (const task of sourceTasks) {
      if (!existingIds.has(task.id)) {
        const newTask = __spreadProps(__spreadValues({}, task), { originalScore: task.score, simulatedScore: task.score });
        targetCourse.tasks.push(newTask);
      }
    }
    targetCourse.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
  }
  async function fetchAllTasksForCourse(courseId, schoolYearId, signal) {
    console.log(`[\u6821\u51C6] \u83B7\u53D6\u8BFE\u7A0B ${courseId} \u5B8C\u6574\u4EFB\u52A1\u5217\u8868`);
    let allTasks = [];
    let pageCurrent = 1;
    const pageSize = 30;
    const maxPages = 20;
    let total = 0, fetched = 0;
    do {
      const url = `${BASE_URL}/task/mergeList?pageSize=${pageSize}&pageCurrent=${pageCurrent}&courseId=${courseId}&schoolYearId=${schoolYearId}&name=`;
      const data = await apiRequest(url, { signal });
      const items = data.items || [];
      allTasks.push(...items);
      fetched += items.length;
      total = data.totalItem || 0;
      if (items.length === 0 || items.length < pageSize || pageCurrent >= maxPages) break;
      pageCurrent++;
    } while (fetched < total);
    return allTasks;
  }
  async function fetchTaskDetail(taskStudentId, signal) {
    const id = parseInt(taskStudentId, 10);
    if (S.taskDetailCache.has(id)) return S.taskDetailCache.get(id);
    console.log(`[\u6821\u51C6] \u83B7\u53D6\u4EFB\u52A1\u8BE6\u60C5 taskStudentId=${id}`);
    const url = `${BASE_URL}/task/detail?taskStudentId=${id}`;
    const data = await apiRequest(url, { signal });
    const inTotal = data.inTotal === true;
    if (S.taskDetailCache.size >= TASK_CACHE_MAX) {
      const oldestKey = S.taskDetailCache.keys().next().value;
      S.taskDetailCache.delete(oldestKey);
    }
    S.taskDetailCache.set(id, inTotal);
    return inTotal;
  }
  var TASK_CACHE_MAX;
  var init_api = __esm({
    "v8.30/api.js"() {
      init_state();
      init_utils();
      TASK_CACHE_MAX = 300;
    }
  });

  // v8.30/deadline.js
  function DL(...a) {
    if (DDL_DIAG) console.log(...a);
  }
  function taskHref(entityId) {
    if (!_TASK_HREF_PATTERN) return null;
    return _TASK_HREF_PATTERN.replace("{id}", String(entityId));
  }
  function _ensureFloatTip() {
    if (_deadlineFloatTip && _deadlineFloatTip.isConnected) {
      DL("[DDL] _ensureFloatTip: \u590D\u7528\u5DF2\u8FDE\u63A5\u5224\u5B9A\u533A");
      return;
    }
    DL("[DDL] _ensureFloatTip: \u91CD\u5EFA\u5224\u5B9A\u533A (oldConnected=" + !!(_deadlineFloatTip && _deadlineFloatTip.isConnected) + ")");
    _deadlineFloatBox = document.createElement("div");
    _deadlineFloatBox.className = "intschool-deadline-tooltip-box";
    _deadlineFloatTip = document.createElement("div");
    _deadlineFloatTip.className = "intschool-deadline-tooltip-fixed";
    _deadlineFloatTip.style.display = "none";
    _deadlineFloatTip.appendChild(_deadlineFloatBox);
    document.body.appendChild(_deadlineFloatTip);
    _deadlineFloatTip.addEventListener("mouseenter", function() {
      clearTimeout(_deadlineFloatTimer);
    });
    _deadlineFloatTip.addEventListener("mouseleave", _hideFloatTip);
  }
  function _positionFloatTip() {
    clearTimeout(_deadlineFloatTimer);
    const btn = document.getElementById("intschool-deadline-btn");
    if (!btn) {
      console.warn("[DDL] _positionFloatTip: \u6309\u94AE\u4E0D\u5B58\u5728");
      return;
    }
    if (!_deadlineFloatTip || !_deadlineFloatTip.isConnected) {
      console.warn("[DDL] _positionFloatTip: \u5224\u5B9A\u533A\u672A\u8FDE\u63A5");
      return;
    }
    if (!_deadlineFloatBox || !_deadlineFloatBox.textContent.trim() || _deadlineFloatBox.dataset.hasTasks !== "1") {
      if (_deadlineFloatTip) _deadlineFloatTip.style.display = "none";
      DL("[DDL] _positionFloatTip: \u65E0\u4EFB\u52A1\uFF0C\u4E0D\u89E6\u53D1\u60AC\u6D6E\u7A97");
      return;
    }
    const rect = btn.getBoundingClientRect();
    _deadlineFloatTip.style.visibility = "hidden";
    _deadlineFloatTip.style.display = "block";
    _deadlineFloatTip.style.left = "0";
    _deadlineFloatTip.style.top = "0";
    const tw = _deadlineFloatBox.offsetWidth;
    const th = _deadlineFloatBox.offsetHeight;
    _deadlineFloatTip.style.visibility = "";
    const margin = 8;
    let left = rect.left + rect.width / 2 - tw / 2;
    let top = rect.bottom + 8;
    if (left < margin) left = margin;
    if (left + tw > window.innerWidth - margin) left = window.innerWidth - tw - margin;
    if (top + th > window.innerHeight - margin) top = rect.top - th - 8;
    _deadlineFloatTip.style.left = left - ZONE_PAD + "px";
    _deadlineFloatTip.style.top = top - ZONE_PAD + "px";
    DL("[DDL] _positionFloatTip: btn=" + btn.getBoundingClientRect().top.toFixed(0) + "," + btn.getBoundingClientRect().left.toFixed(0) + " box=" + tw + "x" + th + " zoneLeft=" + (left - ZONE_PAD) + " zoneTop=" + (top - ZONE_PAD));
  }
  function _hideFloatTip() {
    if (S._taskDragging) {
      DL("[DDL] _hideFloatTip: \u62D6\u62FD\u8FDB\u884C\u4E2D\uFF0C\u6682\u4E0D\u9690\u85CF");
      return;
    }
    _deadlineFloatTimer = setTimeout(function() {
      if (_deadlineFloatTip) _deadlineFloatTip.style.display = "none";
    }, 180);
  }
  function _bindFloatTipEvents(wrap) {
    if (_floatTipBoundWrap === wrap) {
      DL("[DDL] _bindFloatTipEvents: \u5DF2\u7ED1\u5B9A\uFF0C\u8DF3\u8FC7");
      return;
    }
    _floatTipBoundWrap = wrap;
    DL("[DDL] _bindFloatTipEvents: \u7ED1\u5B9A\u60AC\u505C\u4E8B\u4EF6\u5230\u65B0wrap");
    wrap.addEventListener("mouseenter", _positionFloatTip);
    wrap.addEventListener("mouseleave", _hideFloatTip);
  }
  function _typeRank(name) {
    const i = TYPE_ORDER.indexOf(String(name || ""));
    return i < 0 ? TYPE_ORDER.length : i;
  }
  function _typeLabel(name) {
    const raw = String(name || "");
    if (!raw) return "";
    return t(raw, raw);
  }
  function renderTooltipContent() {
    if (!_deadlineFloatBox) {
      console.warn("[DDL] renderTooltipContent: \u5361\u7247\u8282\u70B9\u4E0D\u5B58\u5728");
      return;
    }
    try {
      const today = /* @__PURE__ */ new Date();
      today.setHours(23, 59, 59, 999);
      const todayTs = today.getTime();
      const allFutureTasks = (S._deadlineAllTasks || []).filter((t2) => _taskVisible(t2, todayTs));
      const grouped = {};
      for (const w of allFutureTasks) {
        if (!grouped[w.courseName]) grouped[w.courseName] = [];
        grouped[w.courseName].push(w);
      }
      const sortedCourses = Object.keys(grouped).sort();
      let html = "";
      let rowCount = 0;
      for (const courseName of sortedCourses) {
        const tasks = grouped[courseName];
        tasks.sort((a, b) => _typeRank(a.typeName) - _typeRank(b.typeName) || a.endDate - b.endDate);
        html += '<div class="task-dash-course" data-course="' + escapeHtml(courseName) + '" style="font-size:12px;color:#555;font-weight:600;padding:6px 6px 2px;border-bottom:1px solid #f0f0f0;">' + escapeHtml(courseName) + "</div>";
        for (const task of tasks) {
          rowCount++;
          const taskDate = new Date(task.endDate);
          const ds = taskDate.getFullYear() + "." + (taskDate.getMonth() + 1) + "." + taskDate.getDate();
          const shown = isTaskShown(task.entityId);
          const href = taskHref(task.entityId);
          const taskNameHtml = href ? '<a href="' + escapeHtml(href) + '" draggable="true" title="' + t("\u6253\u5F00\u4EFB\u52A1\u9875\uFF08\u53EF\u62D6\u5230\u4E0B\u65B9\u4EFB\u52A1\u5217\u8868\u6807\u8BB0 / \u62D6\u5230\u522B\u5904\u53D6\u6D88\u6807\u8BB0\uFF09", "Open task page (drag onto the task list to mark, drag elsewhere to unmark)") + '" style="color:#1890ff;text-decoration:underline;cursor:grab;">' + escapeHtml(task.taskName) + "</a>" : '<span draggable="true" style="cursor:grab;">' + escapeHtml(task.taskName) + "</span>";
          const typeLabel = _typeLabel(task.typeName);
          html += '<div class="task-dash-row" data-entity="' + task.entityId + '" data-name="' + escapeHtml(task.taskName) + '" data-type="' + escapeHtml(String(task.typeName || "")) + '" style="padding:3px 6px;border-bottom:1px solid #f5f5f5;font-size:13px;">';
          html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">';
          html += '<span style="flex:1;white-space:nowrap;">' + (typeLabel ? '<span style="color:#bfbfbf;font-size:11px;margin-right:6px;">' + escapeHtml(typeLabel) + "</span>" : "") + taskNameHtml + "\uFF08" + ds + "\uFF09" + (task.marked ? '<span title="' + t("\u624B\u52A8\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Manually marked as pending") + '" style="margin-left:6px;padding:0 4px;border:1px solid #ffa39e;border-radius:3px;color:#cf1322;font-size:10px;">' + t("\u6807\u8BB0", "Marked") + "</span>" : "") + "</span>";
          html += '<label class="task-toggle-label" title="' + t("\u5F00\u542F\u540E\u8BE5\u4EFB\u52A1\u5C06\u8BA1\u5165\u63D0\u9192", "Show this task in reminders") + '" style="display:flex;align-items:center;gap:6px;font-size:11px;color:#666;cursor:pointer;flex-shrink:0;">';
          html += "<span>" + (shown ? t("\u5DF2\u5F00\u542F", "On") : t("\u5DF2\u5173\u95ED", "Off")) + '</span><input type="checkbox" class="task-toggle-switch" data-entity="' + task.entityId + '"' + (shown ? " checked" : "") + "></label></div></div>";
        }
      }
      _deadlineFloatBox.innerHTML = html;
      _deadlineFloatBox.dataset.hasTasks = rowCount > 0 ? "1" : "0";
      _deadlineFloatBox.querySelectorAll(".task-toggle-switch").forEach((cb) => {
        cb.addEventListener("change", function() {
          const entityId = parseInt(this.dataset.entity, 10);
          if (isNaN(entityId)) return;
          setTaskShown(entityId, this.checked);
        });
      });
      DL("[DDL] renderTooltipContent: courses=" + sortedCourses.length + " rows=" + rowCount + " htmlLen=" + html.length + " (\u542B\u5DF2\u5173\u95ED\u63D0\u9192\u7684\u4EFB\u52A1)");
    } catch (e) {
      console.error("[DDL] renderTooltipContent \u5F02\u5E38:", e);
    }
  }
  function _setGetGradeBookData(fn) {
    _getGradeBookDataFn = fn;
  }
  function loadTaskToggles() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASK_TOGGLES);
      if (raw) {
        const parsed = JSON.parse(raw);
        S._taskToggles = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === "object" && v !== null) S._taskToggles[k] = v.alert !== false && v.tooltip !== false;
          else S._taskToggles[k] = !!v;
        }
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
    return S._taskToggles[String(entityId)] !== false;
  }
  function setTaskShown(entityId, shown) {
    const key = String(entityId);
    if (shown) {
      delete S._taskToggles[key];
    } else {
      S._taskToggles[key] = false;
    }
    saveTaskToggles();
    recomputeDeadlineWarnings();
    updateDeadlineIcon();
  }
  function loadTaskMarks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASK_MARKS);
      S._taskMarks = {};
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          for (const [k, v] of Object.entries(parsed)) {
            if (v) S._taskMarks[k] = true;
          }
        }
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
    return S._taskMarks[String(entityId)] === true;
  }
  function setTaskMark(entityId, marked) {
    const key = String(entityId);
    if (marked) S._taskMarks[key] = true;
    else delete S._taskMarks[key];
    saveTaskMarks();
    const entries = S._deadlineAllTasks.filter((t2) => String(t2.entityId) === key);
    if (entries.length) {
      for (const t2 of entries) t2.marked = marked;
      if (!marked) {
        S._deadlineAllTasks = S._deadlineAllTasks.filter((t2) => String(t2.entityId) !== key || t2.detected);
      }
      recomputeDeadlineWarnings();
      updateDeadlineIcon();
    } else if (marked) {
      S._deadlineCache.ts = 0;
      checkUpcomingDeadlines();
    }
    DL("[\u6807\u8BB0] \u4EFB\u52A1 " + key + (marked ? " \u5DF2\u6807\u8BB0\uFF08\u89C6\u4E3A\u672A\u5B8C\u6210\uFF09" : " \u5DF2\u79FB\u9664\u6807\u8BB0") + "\uFF0C\u5DF2\u5728\u5217\u8868\u5185=" + entries.length + "\uFF0C\u5269\u4F59\u5217\u8868=" + S._deadlineAllTasks.length);
  }
  function _taskVisible(t2, nowTs) {
    if (t2.marked) return true;
    return !!t2.detected && t2.endDate > nowTs;
  }
  function recomputeDeadlineWarnings() {
    const now = Date.now();
    const warnings = [];
    for (const t2 of S._deadlineAllTasks) {
      if (_taskVisible(t2, now) && isTaskShown(t2.entityId)) {
        warnings.push({ courseName: t2.courseName, taskName: t2.taskName, endDate: new Date(t2.endDate), entityId: t2.entityId, marked: !!t2.marked });
      }
    }
    S._deadlineCache.data = warnings;
    return warnings;
  }
  function _detailEntityId() {
    const m = location.pathname.match(/\/teaching\/assignmentDetail\/(\d+)/i);
    if (m) return parseInt(m[1], 10);
    const m2 = location.hash.match(/\/teaching\/assignmentDetail\/(\d+)/i);
    return m2 ? parseInt(m2[1], 10) : null;
  }
  function _detailAnchor() {
    for (const sel of DETAIL_TITLE_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return { el, sel, inTitle: true };
    }
    for (const sel of DETAIL_BTN_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return { el, sel, inTitle: false };
    }
    return null;
  }
  function _applyMarkBtnState(btn, marked, ring) {
    const color = marked ? MARK_COLOR_ON : MARK_COLOR_OFF;
    const icon = iconMark(color);
    if (ring) {
      btn.innerHTML = '<span class="ints-mark-ring" style="display:inline-flex;align-items:center;justify-content:center;border:1.5px solid ' + color + ';border-radius:4px;padding:2px 3px;box-sizing:border-box;line-height:1;">' + icon + "</span>";
    } else {
      btn.innerHTML = icon;
    }
    btn.style.color = color;
    btn.style.fontSize = ring ? "15px" : "18px";
    btn.style.lineHeight = "1";
    btn.style.padding = ring ? "2px 4px" : "0 4px";
    btn.style.verticalAlign = "middle";
    btn.style.marginLeft = ring ? "8px" : "0";
    const label = marked ? t("\u8BE5\u4EFB\u52A1\u5DF2\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210\uFF0C\u70B9\u51FB\u79FB\u9664\u6807\u8BB0", "Marked as pending \u2014 click to remove the mark") : t("\u6807\u8BB0\u540E\u8BE5\u4EFB\u52A1\u89C6\u4E3A\u672A\u5B8C\u6210\uFF0C\u51FA\u73B0\u5728\u672A\u5B8C\u6210\u4EFB\u52A1\u5217\u8868\u4E2D", "Marked tasks count as pending and appear in the pending list");
    btn.title = label;
    btn.setAttribute("aria-label", label);
  }
  function syncTaskMarkButton() {
    const entityId = _detailEntityId();
    const existing = document.getElementById(MARK_BTN_ID);
    if (!entityId) {
      if (existing) existing.remove();
      return;
    }
    loadTaskMarks();
    const marked = isTaskMarked(entityId);
    let btn = existing;
    if (!btn) {
      btn = document.createElement("button");
      btn.id = MARK_BTN_ID;
      btn.type = "button";
      btn.className = "ant-btn ant-btn-link";
      btn.style.cursor = "pointer";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const id = _detailEntityId();
        if (!id) return;
        const next = !isTaskMarked(id);
        setTaskMark(id, next);
        _applyMarkBtnState(btn, next, btn.dataset.ring === "1");
        btn.dataset.marked = String(next);
      });
      btn.addEventListener("contextmenu", (e) => {
        const id = _detailEntityId();
        if (!id) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const next = !isTaskMarked(id);
        setTaskMark(id, next);
        _applyMarkBtnState(btn, next, btn.dataset.ring === "1");
        btn.dataset.marked = String(next);
      });
      const anchor = _detailAnchor();
      btn.dataset.ring = anchor && anchor.inTitle ? "1" : "0";
      if (anchor) {
        anchor.el.insertAdjacentElement("beforeend", btn);
        DL("[\u6807\u8BB0] \u8BE6\u60C5\u9875\u6309\u94AE\u63D2\u5165\u951A\u70B9: " + anchor.sel + "\uFF08\u6807\u9898\u5185=" + anchor.inTitle + "\uFF09");
      } else {
        btn.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:20000;background:#fff;border:1px solid #d9d9d9;border-radius:16px;padding:6px 14px;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;";
        document.body.appendChild(btn);
        DL("[\u6807\u8BB0] \u8BE6\u60C5\u9875\u672A\u627E\u5230\u951A\u70B9\uFF0C\u6309\u94AE\u6D6E\u52A8\u663E\u793A\uFF08\u53F3\u4E0B\u89D2\uFF09");
      }
      btn.dataset.marked = String(marked);
      _applyMarkBtnState(btn, marked, btn.dataset.ring === "1");
      return;
    }
    const wantRing = !!document.querySelector(".detail-header .title #" + MARK_BTN_ID);
    if (btn.dataset.ring !== String(wantRing ? 1 : 0)) {
      btn.dataset.ring = wantRing ? "1" : "0";
      _applyMarkBtnState(btn, marked, wantRing);
      return;
    }
    if (btn.dataset.marked !== String(marked)) {
      btn.dataset.marked = String(marked);
      _applyMarkBtnState(btn, marked, wantRing);
    }
  }
  function checkDeadlinesAfterNav() {
    const path = typeof location !== "undefined" ? location.pathname : "";
    const prev = _lastNavPath;
    if (path === prev) return false;
    _lastNavPath = path;
    const wasDetail = /\/teaching\/assignmentDetail\//i.test(prev);
    if (!wasDetail) return false;
    const now = Date.now();
    if (now - _lastNavRefreshTs < DEADLINE_NAV_MIN_INTERVAL) {
      DL("[DDL] checkDeadlinesAfterNav: \u8DDD\u4E0A\u6B21\u5BFC\u822A\u8865\u67E5\u4E0D\u8DB3 " + DEADLINE_NAV_MIN_INTERVAL / 1e3 + "s\uFF0C\u8DF3\u8FC7");
      return false;
    }
    _lastNavRefreshTs = now;
    console.log("[DDL] \u68C0\u6D4B\u5230\u79BB\u5F00\u4EFB\u52A1\u8BE6\u60C5\u9875\uFF08" + prev + " \u2192 " + path + "\uFF09\uFF0C\u8865\u67E5\u672A\u5B8C\u6210\u4EFB\u52A1");
    checkUpcomingDeadlines(true);
    return true;
  }
  function _setNavPathForTest(p) {
    _lastNavPath = p;
  }
  async function checkUpcomingDeadlines(force) {
    loadTaskToggles();
    loadTaskMarks();
    DL("[DDL] checkUpcomingDeadlines: \u89E6\u53D1 (force=" + !!force + " cacheTs=" + S._deadlineCache.ts + " inFlight=" + S._deadlineCheckInFlight + ")");
    if (!force && Date.now() - S._deadlineCache.ts < DEADLINE_CACHE_TTL) {
      DL("[DDL] checkUpcomingDeadlines: \u7F13\u5B58\u547D\u4E2D");
      updateDeadlineIcon();
      return;
    }
    if (S._deadlineCheckInFlight) {
      DL("[DDL] checkUpcomingDeadlines: \u5DF2\u6709\u8BF7\u6C42\u8FDB\u884C\u4E2D");
      return;
    }
    S._deadlineCheckInFlight = true;
    _lastCheckTs = Date.now();
    const allTasks = [];
    try {
      const yearList = await fetchSchoolYearList();
      const sel = document.querySelector(".ant-select-selection-selected-value, .ant-select-single .ant-select-selection-item");
      const currentYearText = sel ? sel.textContent.trim() : null;
      let currentYearEntry = yearList.find((y) => y.value === currentYearText);
      if (!currentYearEntry) {
        const sorted = [...yearList].sort((a, b) => String(a.value).localeCompare(String(b.value)));
        currentYearEntry = sorted[sorted.length - 1] || null;
        if (currentYearEntry) DL("[DDL] checkUpcomingDeadlines: \u65E0\u5B66\u5E74\u4E0B\u62C9\uFF0C\u56DE\u9000\u6700\u65B0\u5B66\u5E74 " + currentYearEntry.value);
      }
      DL("[DDL] checkUpcomingDeadlines: yearList=" + yearList.length + " selText=" + JSON.stringify(currentYearText) + " matchedKey=" + (currentYearEntry ? currentYearEntry.key : "\u65E0"));
      if (!currentYearEntry) {
        S._deadlineCache = { ts: Date.now(), data: [] };
        S._deadlineAllTasks = allTasks;
        S._deadlineCheckInFlight = false;
        updateDeadlineIcon();
        return;
      }
      const gradeData = await _getGradeBookDataFn(currentYearEntry.key);
      const gradeItems = gradeData.gradeBookItems || [];
      const courses = gradeItems.filter((item) => item.inClass !== false && item.courseId).map((item) => ({ courseId: item.courseId, courseName: item.courseName }));
      const today = /* @__PURE__ */ new Date();
      today.setHours(23, 59, 59, 999);
      const todayTs = today.getTime();
      async function checkCourseDeadline(course) {
        const courseId = course.courseId;
        const courseName = course.courseName || "Course#" + courseId;
        if (!courseId) return { allTasks: [], checked: 0, tasks: 0, online: 0, unsub: 0, future: 0 };
        try {
          const pageSize = 30, maxPages = 10;
          let pageCurrent = 1, total = 0, fetched = 0;
          let onlineCountLocal = 0, unsubmittedCountLocal = 0, futureCountLocal = 0, markedCountLocal = 0;
          const courseAllTasks = [];
          do {
            const url = `${BASE_URL}/task/mergeList?pageSize=${pageSize}&pageCurrent=${pageCurrent}&courseId=${courseId}&schoolYearId=${currentYearEntry.key}&name=`;
            const data = await apiRequest(url);
            const items = data.items || [];
            fetched += items.length;
            total = data.totalItem || 0;
            for (const task of items) {
              const isOnline = !!task.online;
              const isUnsubmitted = !task.status;
              const entityId = parseInt(task.entityId, 10);
              if (!entityId) continue;
              const isMarked = isTaskMarked(entityId);
              if (isOnline) onlineCountLocal++;
              if (isUnsubmitted) unsubmittedCountLocal++;
              if (isMarked) markedCountLocal++;
              const isDetected = isOnline && isUnsubmitted;
              if ((isMarked || isDetected) && task.endDate) {
                const endDate = new Date(task.endDate);
                if (!isNaN(endDate.getTime())) {
                  courseAllTasks.push({ courseId, courseName, entityId, taskName: task.name || "Unnamed", endDate: endDate.getTime(), typeName: task.typeName || "", marked: isMarked, detected: isDetected });
                  if (endDate.getTime() > todayTs) futureCountLocal++;
                }
              }
            }
            if (items.length === 0 || items.length < pageSize || pageCurrent >= maxPages) break;
            pageCurrent++;
          } while (fetched < total);
          return { allTasks: courseAllTasks, checked: 1, tasks: fetched, online: onlineCountLocal, unsub: unsubmittedCountLocal, future: futureCountLocal, marked: markedCountLocal };
        } catch (e) {
          console.warn("[\u63D0\u9192] \u8BFE\u7A0B\u4EFB\u52A1\u83B7\u53D6\u5931\u8D25\uFF1A" + courseName + " - " + e.message);
          return { allTasks: [], checked: 0, tasks: 0, online: 0, unsub: 0, future: 0, marked: 0 };
        }
      }
      for (let i = 0; i < courses.length; i += DEADLINE_BATCH_SIZE) {
        const batch = courses.slice(i, i + DEADLINE_BATCH_SIZE);
        const results = await Promise.all(batch.map((c) => checkCourseDeadline(c)));
        for (const r of results) {
          allTasks.push(...r.allTasks);
        }
      }
      DL("[DDL] checkUpcomingDeadlines: courses=" + courses.length + " allTasks=" + allTasks.length + " future=" + allTasks.filter((t2) => t2.endDate > todayTs).length);
    } catch (e) {
      console.error("[\u63D0\u9192] \u68C0\u67E5\u5931\u8D25\uFF1A" + e.message);
      S._deadlineCheckInFlight = false;
    }
    S._deadlineAllTasks = allTasks;
    const warnings = recomputeDeadlineWarnings();
    S._deadlineCache.ts = Date.now();
    S._deadlineCheckInFlight = false;
    DL("[DDL] checkUpcomingDeadlines \u5B8C\u6210: allTasks=" + allTasks.length + " marked=" + allTasks.filter((t2) => t2.marked).length + " warnings=" + warnings.length);
    updateDeadlineIcon();
  }
  function updateDeadlineIcon() {
    let anchor = document.querySelector(".filter-info.filter-container") || document.querySelector(".grade .filter-container") || document.querySelector(".filter-container");
    if (!anchor) {
      console.warn("[DDL] updateDeadlineIcon: \u627E\u4E0D\u5230\u63D2\u5165\u951A\u70B9");
      return;
    }
    const insertPos = "beforeend";
    const warnings = S._deadlineCache.data || [];
    const today = /* @__PURE__ */ new Date();
    today.setHours(23, 59, 59, 999);
    const todayTs = today.getTime();
    const futureTaskCount = S._deadlineAllTasks.filter((t2) => _taskVisible(t2, todayTs)).length;
    DL("[DDL] updateDeadlineIcon: anchor=" + (anchor.id || anchor.className) + " futureTaskCount=" + futureTaskCount + " warnings=" + warnings.length);
    let wrap = document.getElementById("intschool-deadline-wrap");
    if (!wrap) {
      DL("[DDL] updateDeadlineIcon: \u521B\u5EFA\u6309\u94AEwrap");
      wrap = document.createElement("span");
      wrap.id = "intschool-deadline-wrap";
      wrap.style.cssText = "position:relative;display:inline-flex;vertical-align:middle;";
      wrap.addEventListener("click", (e) => e.stopImmediatePropagation());
      const btn2 = document.createElement("button");
      btn2.type = "button";
      btn2.className = "ant-btn ant-btn-link";
      btn2.style.cssText = "margin-left:16px;color:#faad14;";
      btn2.id = "intschool-deadline-btn";
      btn2.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        _positionFloatTip();
      });
      wrap.appendChild(btn2);
      _ensureFloatTip();
      _bindFloatTipEvents(wrap);
      anchor.insertAdjacentElement(insertPos, wrap);
    }
    const btn = document.getElementById("intschool-deadline-btn");
    if (btn) {
      const count = warnings.length;
      btn.innerHTML = count > 0 ? "<span>&#9888;</span> <span>" + t("\u672A\u5B8C\u6210\u4EFB\u52A1", "Pending Tasks") + " (" + count + ")</span>" : "<span>&#9888;</span> <span>" + t("\u65E0\u672A\u5B8C\u6210\u4EFB\u52A1", "No Pending Tasks") + "</span>";
      btn.style.color = count > 0 ? "#faad14" : "#999";
    }
    _ensureFloatTip();
    renderTooltipContent();
  }
  function startDeadlinePolling() {
    stopDeadlinePolling();
    _deadlinePollTimer = setInterval(() => {
      if (document.visibilityState === "visible") checkUpcomingDeadlines();
    }, DEADLINE_POLL_INTERVAL);
    _deadlineVisibilityHandler = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - _lastCheckTs < DEADLINE_VISIBILITY_MIN_INTERVAL) {
        DL("[DDL] \u53EF\u89C1\u6027\u8865\u67E5\u8DF3\u8FC7\uFF08\u8DDD\u4E0A\u6B21\u68C0\u67E5\u4E0D\u8DB3\u6700\u5C0F\u95F4\u9694\uFF09");
        return;
      }
      checkUpcomingDeadlines();
    };
    document.addEventListener("visibilitychange", _deadlineVisibilityHandler);
  }
  function stopDeadlinePolling() {
    if (_deadlinePollTimer) {
      clearInterval(_deadlinePollTimer);
      _deadlinePollTimer = null;
    }
    if (_deadlineVisibilityHandler) {
      document.removeEventListener("visibilitychange", _deadlineVisibilityHandler);
      _deadlineVisibilityHandler = null;
    }
  }
  async function fetchGradeReportsForYear(schoolYearId) {
    const url = `${BASE_URL}/grade/grade-report/by-student?schoolYearId=${schoolYearId}`;
    return await apiRequest(url);
  }
  async function fetchReportContent(studentId, requestUrl, gradePeriodId) {
    const url = `${BASE_URL}/${requestUrl}?studentId=${studentId}&gradePeriodId=${gradePeriodId}`;
    return await apiRequest(url);
  }
  var DEADLINE_POLL_INTERVAL, DEADLINE_VISIBILITY_MIN_INTERVAL, DEADLINE_BATCH_SIZE, DDL_DIAG, _lastCheckTs, ZONE_PAD, _deadlineFloatTip, _deadlineFloatBox, _deadlineFloatTimer, _floatTipBoundWrap, _TASK_HREF_PATTERN, TYPE_ORDER, _getGradeBookDataFn, MARK_BTN_ID, DETAIL_TITLE_SELECTORS, DETAIL_BTN_SELECTORS, DEADLINE_NAV_MIN_INTERVAL, _lastNavPath, _lastNavRefreshTs, _deadlinePollTimer, _deadlineVisibilityHandler;
  var init_deadline = __esm({
    "v8.30/deadline.js"() {
      init_state();
      init_utils();
      init_api();
      DEADLINE_POLL_INTERVAL = 15 * 60 * 1e3;
      DEADLINE_VISIBILITY_MIN_INTERVAL = 2 * 60 * 1e3;
      DEADLINE_BATCH_SIZE = 4;
      DDL_DIAG = (function() {
        try {
          return localStorage.getItem("ints_diag") === "1";
        } catch (e) {
          return false;
        }
      })();
      _lastCheckTs = 0;
      DL("[DDL] deadline.js \u5DF2\u52A0\u8F7D, DDL_DIAG=" + DDL_DIAG);
      ZONE_PAD = 0;
      _deadlineFloatTip = null;
      _deadlineFloatBox = null;
      _deadlineFloatTimer = null;
      _floatTipBoundWrap = null;
      _TASK_HREF_PATTERN = "https://shc.intschool.cn/teaching/assignmentDetail/{id}?assignType=subjectClass";
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
      _getGradeBookDataFn = null;
      MARK_BTN_ID = "intschool-task-mark-btn";
      DETAIL_TITLE_SELECTORS = [
        ".detail-header .header-content > .title",
        ".assignment-detail .header-content > .title",
        ".detail-header .title",
        ".assignment-detail .title"
      ];
      DETAIL_BTN_SELECTORS = [
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
      DEADLINE_NAV_MIN_INTERVAL = 15 * 1e3;
      _lastNavPath = typeof location !== "undefined" ? location.pathname : "";
      _lastNavRefreshTs = 0;
      _deadlinePollTimer = null;
      _deadlineVisibilityHandler = null;
    }
  });

  // v8.30/courses.js
  async function getStudentId() {
    if (S.studentIdCache) return S.studentIdCache;
    const data = await apiRequest(BASE_URL + "/student/userInfo");
    S.studentIdCache = data.studentId;
    return S.studentIdCache;
  }
  function resolveCredit(rawCredit, courseId) {
    let credit = parseFloat(rawCredit);
    if (!isNaN(credit)) return credit > 0 ? credit : 0;
    const mapped = S.creditMap.get(courseId);
    if (mapped !== void 0 && mapped > 0) return mapped;
    return 1;
  }
  function parseYearlyReport(content) {
    const customCols = content.customColumns || [];
    let eoyColumnId = null;
    if (customCols.length > 0) {
      const lastCol = customCols[customCols.length - 1];
      if (lastCol && lastCol.customColumnId) eoyColumnId = lastCol.customColumnId;
    }
    if (eoyColumnId === null) {
      for (let col of customCols) {
        if (col && col.customColumnName && col.customColumnName.trim() === "EOY") {
          eoyColumnId = col.customColumnId;
          break;
        }
      }
    }
    const colMap = /* @__PURE__ */ new Map();
    for (let col of customCols) {
      if (col && col.customColumnId && col.customColumnName) colMap.set(col.customColumnId, col.customColumnName);
    }
    const courses = [];
    const reportItems = content.reportItems || [];
    for (let item of reportItems) {
      const courseName = item.courseName;
      const grades = item.customColumnGrades || {};
      const courseData = { name: courseName, courseId: item.courseId, credit: resolveCredit(item.credits, item.courseId), s1p: null, s1e: null, s1f: null, s2p: null, s2e: null, s2f: null, eoy: null };
      for (let [colId, gradeObj] of Object.entries(grades)) {
        const colIdNum = parseInt(colId);
        const score = gradeObj && gradeObj.score !== void 0 ? parseFloat(gradeObj.score) : null;
        if (score === null || isNaN(score)) continue;
        if (eoyColumnId !== null && colIdNum === eoyColumnId) {
          courseData.eoy = score;
          continue;
        }
        const colName = colMap.get(colIdNum);
        if (!colName) continue;
        const trimmed = colName.trim();
        switch (trimmed) {
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
      if (courseData.s1f === null && (courseData.s1p !== null || courseData.s1e !== null)) courseData.s1f = calcF(courseData.s1p, courseData.s1e);
      if (courseData.s2f === null && (courseData.s2p !== null || courseData.s2e !== null)) courseData.s2f = calcF(courseData.s2p, courseData.s2e);
      if (courseData.s2f === null && courseData.eoy !== null) courseData.s2f = courseData.eoy;
      if (courseData.s1f === null && courseData.eoy !== null) courseData.s1f = courseData.eoy;
      courses.push(courseData);
    }
    return courses;
  }
  function parseSemesterReport(content, term) {
    const courses = [];
    const reports = content.courseReports || [];
    for (let cr of reports) {
      const courseName = cr.course;
      if (!courseName) continue;
      const periodMap = cr.percentageMap || {};
      let examScore = null;
      if (content.gradePeriods && content.gradePeriods.length) {
        const periodId = content.gradePeriods[0].gradePeriodId;
        if (periodMap[periodId] !== void 0) examScore = parseFloat(periodMap[periodId]);
      }
      if (examScore === null && Object.keys(periodMap).length > 0) {
        const firstKey = Object.keys(periodMap)[0];
        examScore = parseFloat(periodMap[firstKey]);
      }
      if (isNaN(examScore) && cr.score !== void 0) examScore = parseFloat(cr.score);
      if (examScore !== null && !isNaN(examScore)) {
        courses.push({ name: courseName, courseId: cr.courseId, credit: resolveCredit(null, cr.courseId), [term === "S1" ? "s1e" : "s2e"]: examScore, s1p: null, s2p: null, s1f: null, s2f: null });
      }
    }
    return courses;
  }
  async function buildCoursesFromReports(yearKey) {
    const studentId = await getStudentId();
    const reports = await fetchGradeReportsForYear(yearKey);
    if (!reports.length) return { courses: [], sectionName: null, annualGPA: null, cumulativeGPA: null };
    let yearlyReport = reports.find((r) => {
      var _a;
      return r.gradePeriodType === "fullSchoolYear" || r.reportName && (r.reportName.includes("\u5E74\u5EA6") || ((_a = r.reportEnName) == null ? void 0 : _a.includes("Yearly")));
    });
    let sectionName = null, apiAnnualGPA = null, apiCumulativeGPA = null;
    if (yearlyReport) {
      try {
        const content = await fetchReportContent(studentId, yearlyReport.requestUrl, yearlyReport.gradePeriodId);
        if (content) {
          sectionName = content.sectionName || null;
          apiAnnualGPA = typeof content.annualGPA === "number" ? content.annualGPA : null;
          apiCumulativeGPA = typeof content.cumulativeGPA === "number" ? content.cumulativeGPA : null;
        }
        if (content && content.reportItems) {
          const coursesFromYearly = parseYearlyReport(content);
          if (coursesFromYearly.length) {
            return { courses: coursesFromYearly.map((c) => ({ name: c.name, courseId: c.courseId, credit: c.credit, originalGrades: { s1p: c.s1p, s1e: c.s1e, s1f: c.s1f, s2p: c.s2p, s2e: c.s2e, s2f: c.s2f, eoy: c.eoy }, tasks: [], weightBonus: getWeightBonus(c.name), showStar: { s1: false, s2: false } })), sectionName, annualGPA: apiAnnualGPA, cumulativeGPA: apiCumulativeGPA };
          }
        }
      } catch (e) {
        console.warn(`[\u5F80\u5E74] \u89E3\u6790\u5E74\u5EA6\u62A5\u544A\u5931\u8D25: ${e.message}\uFF0C\u5C1D\u8BD5\u5B66\u671F\u62A5\u544A`);
      }
    }
    let s1CoursesMap = /* @__PURE__ */ new Map(), s2CoursesMap = /* @__PURE__ */ new Map();
    for (let report of reports) {
      if (report.gradePeriodType !== "midTerm" && report.gradePeriodType !== "endTerm") continue;
      const name = report.reportName || "";
      const isS1 = name.includes("\u7B2C\u4E00\u5B66\u671F") || name.includes("Semester 1") || name.includes("S1");
      const isS2 = name.includes("\u7B2C\u4E8C\u5B66\u671F") || name.includes("Semester 2") || name.includes("S2");
      if (!isS1 && !isS2) continue;
      const content = await fetchReportContent(studentId, report.requestUrl, report.gradePeriodId);
      const term = isS1 ? "S1" : "S2";
      const parsed = parseSemesterReport(content, term);
      const targetMap = term === "S1" ? s1CoursesMap : s2CoursesMap;
      for (let c of parsed) {
        if (!targetMap.has(c.name)) targetMap.set(c.name, { name: c.name, courseId: c.courseId, credit: c.credit, s1e: null, s2e: null });
        if (term === "S1") targetMap.get(c.name).s1e = c.s1e;
        else targetMap.get(c.name).s2e = c.s2e;
      }
    }
    const allNames = /* @__PURE__ */ new Set([...s1CoursesMap.keys(), ...s2CoursesMap.keys()]);
    const courses = [];
    for (let name of allNames) {
      const s1 = s1CoursesMap.get(name) || {};
      const s2 = s2CoursesMap.get(name) || {};
      const credit = s1.credit > 0 ? s1.credit : s2.credit > 0 ? s2.credit : 1;
      const s1e = s1.s1e || null;
      const s2e = s2.s2e || null;
      const s1f = calcF(null, s1e);
      const s2f = calcF(null, s2e);
      courses.push({ name, courseId: s1.courseId || s2.courseId, credit, originalGrades: { s1p: null, s1e, s1f, s2p: null, s2e, s2f, eoy: null }, tasks: [], weightBonus: getWeightBonus(name), showStar: { s1: false, s2: false } });
    }
    return { courses, sectionName, annualGPA: null, cumulativeGPA: null };
  }
  function getScoreFromCustomColumns(item, colMap, targetField) {
    if (!item || !colMap) return null;
    let targetKey = colMap.get(targetField);
    if (targetKey === void 0) targetKey = colMap.get(String(targetField).toUpperCase());
    if (targetKey === void 0 || targetKey === null) return null;
    const customCols = item.customColumnScores;
    if (!customCols) return null;
    if (typeof customCols === "object" && !Array.isArray(customCols)) {
      const entry = customCols[targetKey];
      if (entry && typeof entry === "object" && "score" in entry) {
        const val = parseFloat(entry.score);
        return isNaN(val) ? null : val;
      }
      return null;
    }
    if (Array.isArray(customCols)) {
      const found = customCols.find((col) => col && (String(col.label) === String(targetKey) || String(col.customColumnId) === String(targetKey)));
      if (found && typeof found === "object" && "score" in found) {
        const val = parseFloat(found.score);
        return isNaN(val) ? null : val;
      }
      return null;
    }
    return null;
  }
  async function getGradeBookData(yearKey) {
    const url = `${BASE_URL}/task-grade/grade-book/?schoolYearId=${yearKey}`;
    return await apiRequest(url);
  }
  function buildColumnMap(gradeData, yearValue) {
    const colMap = /* @__PURE__ */ new Map();
    for (const col of gradeData.customColumns || []) {
      if (col && col.customColumnId !== void 0 && col.customColumnName) {
        colMap.set(String(col.customColumnName).trim(), String(col.customColumnId));
      }
    }
    const fallback = COLUMN_KEY_MAPPING[String(yearValue)];
    if (fallback) {
      for (const [field, colId] of Object.entries(fallback)) {
        if (colId && !colMap.has(field) && !colMap.has(field.toUpperCase())) {
          colMap.set(field, String(colId));
        }
      }
    }
    return colMap;
  }
  async function buildCurrentYearCourses(yearKey, yearValue) {
    const gradeData = await getGradeBookData(yearKey);
    const colMap = buildColumnMap(gradeData, yearValue);
    const items = gradeData.gradeBookItems || [];
    const creditMapEmpty = S.creditMap.size === 0;
    console.log(`[\u5F53\u524D\u5B66\u5E74] grade-book \u8FD4\u56DE: items=${items.length} customColumns=${(gradeData.customColumns || []).length} creditMap=${S.creditMap.size} \u6761`);
    if (creditMapEmpty && items.length) console.warn("[\u5F53\u524D\u5B66\u5E74] creditMap \u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u533A\u5206\u96F6\u5B66\u5206\u8BFE\u7A0B\uFF1B\u7F3A\u7701\u5B66\u5206\u6682\u6309 1 \u5904\u7406\uFF08\u51C6\u786E\u5B66\u5206\u4F9D\u8D56 schedule \u6570\u636E\uFF09");
    if (items.length) {
      const s0 = items[0];
      console.log("[\u5F53\u524D\u5B66\u5E74] \u6837\u4F8B\u6761\u76EE: " + JSON.stringify({ courseId: s0.courseId, courseName: s0.courseName, subject: s0.subject, creditFromMap: S.creditMap.get(s0.courseId) }));
    }
    const allCourses = [];
    for (let item of items) {
      let credit = S.creditMap.get(item.courseId);
      if (credit === void 0) credit = creditMapEmpty ? 1 : 0;
      let rawGrades = { s1p: null, s1e: null, s1f: null, s2p: null, s2e: null, s2f: null };
      const mappedS1P = getScoreFromCustomColumns(item, colMap, "s1p");
      const mappedS1E = getScoreFromCustomColumns(item, colMap, "s1e");
      const mappedS1F = getScoreFromCustomColumns(item, colMap, "s1f");
      const mappedS2P = getScoreFromCustomColumns(item, colMap, "s2p");
      const mappedS2E = getScoreFromCustomColumns(item, colMap, "s2e");
      const mappedS2F = getScoreFromCustomColumns(item, colMap, "s2f");
      rawGrades.s1p = mappedS1P !== null ? mappedS1P : item.s1p !== void 0 ? item.s1p !== null ? Number(item.s1p) : null : null;
      rawGrades.s1e = mappedS1E !== null ? mappedS1E : item.s1e !== void 0 ? item.s1e !== null ? Number(item.s1e) : null : null;
      rawGrades.s1f = mappedS1F !== null ? mappedS1F : item.s1f !== void 0 ? item.s1f !== null ? Number(item.s1f) : null : null;
      rawGrades.s2p = mappedS2P !== null ? mappedS2P : item.s2p !== void 0 ? item.s2p !== null ? Number(item.s2p) : null : null;
      rawGrades.s2e = mappedS2E !== null ? mappedS2E : item.s2e !== void 0 ? item.s2e !== null ? Number(item.s2e) : null : null;
      rawGrades.s2f = mappedS2F !== null ? mappedS2F : item.s2f !== void 0 ? item.s2f !== null ? Number(item.s2f) : null : null;
      let tasks = (item.taskScores || []).filter((t2) => !t2.endDate || getTermFromDate(t2.endDate, t2.term || t2.schoolYearTerm) !== null);
      tasks = tasks.map((t2) => {
        const entityId = parseInt(t2.entityId || t2.taskStudentId || t2.id, 10);
        return { entityId, taskStudentId: entityId, id: t2.id || entityId || Math.random(), name: t2.taskName || "\u672A\u547D\u540D", typeName: t2.taskTypeName || "\u5176\u4ED6", score: t2.score != null ? Number(t2.score) : null, topScore: t2.topScore != null ? Number(t2.topScore) : null, endDate: t2.endDate, termRaw: t2.term || t2.schoolYearTerm || null, originalScore: t2.score != null ? Number(t2.score) : null, simulatedScore: t2.score != null ? Number(t2.score) : null, isVirtual: false };
      });
      tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
      for (const t2 of tasks) {
        if (calibrationExcluded(yearKey, t2.entityId)) t2.excluded = true;
      }
      let origS1P = calculateTermAverageByCategory(tasks, item.subject || item.courseName, "S1");
      let origS2P = calculateTermAverageByCategory(tasks, item.subject || item.courseName, "S2");
      let showStar = { s1: false, s2: false };
      if (origS1P !== null && rawGrades.s1p !== null && Math.abs(alignToSchoolPrecision(origS1P, rawGrades.s1p) - rawGrades.s1p) > 0.1) {
        showStar.s1 = true;
      } else if (origS1P !== null) rawGrades.s1p = origS1P;
      if (origS2P !== null && rawGrades.s2p !== null && Math.abs(alignToSchoolPrecision(origS2P, rawGrades.s2p) - rawGrades.s2p) > 0.1) {
        showStar.s2 = true;
      } else if (origS2P !== null) rawGrades.s2p = origS2P;
      if (rawGrades.s1f === null) rawGrades.s1f = calcF(rawGrades.s1p, rawGrades.s1e);
      if (rawGrades.s2f === null) rawGrades.s2f = calcF(rawGrades.s2p, rawGrades.s2e);
      allCourses.push({ name: item.courseName, courseId: item.courseId, credit, subject: item.subject || null, originalGrades: rawGrades, tasks, weightBonus: getWeightBonus(item.courseName), showStar });
    }
    const zeroCreditCourses = allCourses.filter((c) => c.credit <= 0);
    const validCourses = allCourses.filter((c) => c.credit > 0);
    if (zeroCreditCourses.length) console.log(`[\u5F53\u524D\u5B66\u5E74] \u96F6\u5B66\u5206\u8BFE\u7A0B ${zeroCreditCourses.length} \u95E8\uFF08\u9000\u73ED/\u975E\u5B66\u5206\uFF0C\u7528\u4E8E\u8865\u5168\u5339\u914D\uFF09\uFF0C\u6B63\u5B66\u5206 ${validCourses.length} \u95E8`);
    function findBestMatchIndexExclusive(targetCourseName, term, usedSet) {
      const key = extractSubjectKey(targetCourseName);
      if (!key) return -1;
      const candidates = [];
      for (let i = 0; i < zeroCreditCourses.length; i++) {
        if (usedSet.has(i)) continue;
        const c = zeroCreditCourses[i];
        if (extractSubjectKey(c.name) === key) candidates.push(i);
      }
      if (candidates.length === 0) return -1;
      const hasExam = candidates.filter((i) => term === "S1" ? zeroCreditCourses[i].originalGrades.s1e !== null : zeroCreditCourses[i].originalGrades.s2e !== null);
      if (hasExam.length > 0) {
        if (hasExam.length > 1) hasExam.sort((a, b) => countUngradedTasks(zeroCreditCourses[a].tasks, term) - countUngradedTasks(zeroCreditCourses[b].tasks, term));
        const chosen2 = hasExam[0];
        usedSet.add(chosen2);
        return chosen2;
      }
      candidates.sort((a, b) => countUngradedTasks(zeroCreditCourses[a].tasks, term) - countUngradedTasks(zeroCreditCourses[b].tasks, term));
      const chosen = candidates[0];
      usedSet.add(chosen);
      return chosen;
    }
    const usedZeroCredit = /* @__PURE__ */ new Set();
    for (const course of validCourses) {
      const s1Missing = course.originalGrades.s1p === null && course.originalGrades.s1e === null;
      if (s1Missing) {
        course.tasks = course.tasks.filter((t2) => getTermFromDate(t2.endDate, t2.termRaw) !== "S1");
        const bestIdx = findBestMatchIndexExclusive(course.name, "S1", usedZeroCredit);
        if (bestIdx >= 0) {
          const bestMatch = zeroCreditCourses[bestIdx];
          mergeTasksForTerm(course, bestMatch, "S1");
          const newS1P = calculateTermAverageByCategory(course.tasks, course.subject || course.name, "S1");
          if (newS1P !== null) course.originalGrades.s1p = newS1P;
          if (bestMatch.originalGrades.s1e !== null) course.originalGrades.s1e = bestMatch.originalGrades.s1e;
          course.originalGrades.s1f = calcF(course.originalGrades.s1p, course.originalGrades.s1e);
        }
      }
      const s2Missing = course.originalGrades.s2p === null && course.originalGrades.s2e === null;
      if (s2Missing) {
        course.tasks = course.tasks.filter((t2) => getTermFromDate(t2.endDate, t2.termRaw) !== "S2");
        const bestIdx = findBestMatchIndexExclusive(course.name, "S2", usedZeroCredit);
        if (bestIdx >= 0) {
          const bestMatch = zeroCreditCourses[bestIdx];
          mergeTasksForTerm(course, bestMatch, "S2");
          const newS2P = calculateTermAverageByCategory(course.tasks, course.subject || course.name, "S2");
          if (newS2P !== null) course.originalGrades.s2p = newS2P;
          if (bestMatch.originalGrades.s2e !== null) course.originalGrades.s2e = bestMatch.originalGrades.s2e;
          course.originalGrades.s2f = calcF(course.originalGrades.s2p, course.originalGrades.s2e);
        }
      }
    }
    for (const course of validCourses) {
      if (course.originalGrades.s1e === null) {
        const bestIdx = findBestMatchIndexExclusive(course.name, "S1", usedZeroCredit);
        if (bestIdx >= 0 && zeroCreditCourses[bestIdx].originalGrades.s1e !== null) {
          course.originalGrades.s1e = zeroCreditCourses[bestIdx].originalGrades.s1e;
          course.originalGrades.s1f = calcF(course.originalGrades.s1p, course.originalGrades.s1e);
        }
      }
      if (course.originalGrades.s2e === null) {
        const bestIdx = findBestMatchIndexExclusive(course.name, "S2", usedZeroCredit);
        if (bestIdx >= 0 && zeroCreditCourses[bestIdx].originalGrades.s2e !== null) {
          course.originalGrades.s2e = zeroCreditCourses[bestIdx].originalGrades.s2e;
          course.originalGrades.s2f = calcF(course.originalGrades.s2p, course.originalGrades.s2e);
        }
      }
    }
    return validCourses;
  }
  var init_courses = __esm({
    "v8.30/courses.js"() {
      init_state();
      init_utils();
      init_api();
      init_deadline();
    }
  });

  // v8.30/gpa-target.js
  function _targetCacheKey(course, term) {
    return course.name + "|" + course.simGrades.s1p + "|" + course.simGrades.s2p + "|" + course.simGrades.s1e + "|" + course.simGrades.s2e + "|" + term;
  }
  function invalidateTargetGapCache() {
    _targetGapCache.clear();
    _examDisplayCache.computed = false;
  }
  function calcMaxPFromTasks(course, term) {
    const tasks = course.tasks.filter((t2) => getTermFromDate(t2.endDate, t2.termRaw) === term);
    if (!tasks.length) return null;
    let catData = Array(5).fill().map(() => ({ score: 0, max: 0 }));
    for (let t2 of tasks) {
      let idx = TYPE_PATTERNS.findIndex((p) => p.test(t2.typeName));
      if (idx >= 0 && idx < 5) {
        let scoreVal;
        if (t2.simulatedScore === -1) continue;
        if (t2.simulatedScore !== void 0 && t2.simulatedScore !== null) scoreVal = t2.simulatedScore;
        else scoreVal = t2.topScore || 0;
        if (t2.topScore != null && t2.topScore > 0) {
          catData[idx].score += scoreVal;
          catData[idx].max += t2.topScore;
        }
      }
    }
    return calcPFromCategoryData(catData, course.subject || course.name);
  }
  function getMinScoreForGPA(targetGPA) {
    if (targetGPA === null || targetGPA === void 0) return null;
    const sortedBands = [...GRADE_BANDS].sort((a, b) => a.min - b.min);
    for (let band of sortedBands) {
      const gpa = LETTER_TO_GPA.get(band.letter);
      if (gpa !== void 0 && gpa >= targetGPA) return band.min;
    }
    return 97;
  }
  function computeTargetGap(course, term) {
    const cacheKey = _targetCacheKey(course, term) + "|" + S.targetGPAMode + "|" + S.targetUWGPA + "|" + S.targetWGPA;
    const cached = _targetGapCache.get(cacheKey);
    if (cached) return cached;
    const result = _computeTargetGapRaw(course, term);
    _targetGapCache.set(cacheKey, result);
    return result;
  }
  function _computeTargetGapRaw(course, term) {
    const isS1 = term === "S1" || term === "s1";
    const currentP = isS1 ? course.simGrades.s1p : course.simGrades.s2p;
    const examScore = isS1 ? course.simGrades.s1e : course.simGrades.s2e;
    const wb = course.weightBonus;
    if (currentP === null) return { locked: false, atMax: false, uw: null, w: null };
    const currentF = calcF(currentP, examScore);
    const currentUW = getUnweightedGPA(currentF);
    const currentW = currentUW !== null ? currentUW + wb : null;
    if (examScore !== null) {
      return {
        locked: true,
        atMax: false,
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
    }
    const atMax = currentP >= 93;
    function getMinScoreForTarget(targetGPA, isWeighted) {
      if (targetGPA === null) return null;
      const targetUW = isWeighted ? targetGPA - wb : targetGPA;
      return getMinScoreForGPA(Math.max(targetUW, 0));
    }
    if (S.targetGPAMode === "exam") {
      const uwMin2 = S.targetUWGPA !== null ? getMinScoreForTarget(S.targetUWGPA, false) : null;
      const wMin2 = S.targetWGPA !== null ? getMinScoreForTarget(S.targetWGPA, true) : null;
      const baseF = currentP * 0.8;
      let uwNeeded2 = null, wNeeded2 = null;
      if (uwMin2 !== null) {
        if (baseF >= uwMin2) uwNeeded2 = 0;
        else uwNeeded2 = Math.min((uwMin2 - baseF) / 0.2, 100);
      }
      if (wMin2 !== null) {
        if (baseF >= wMin2) wNeeded2 = 0;
        else wNeeded2 = Math.min((wMin2 - baseF) / 0.2, 100);
      }
      return {
        locked: false,
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
    const uwMin = S.targetUWGPA !== null ? getMinScoreForTarget(S.targetUWGPA, false) : null;
    const wMin = S.targetWGPA !== null ? getMinScoreForTarget(S.targetWGPA, true) : null;
    const maxP = calcMaxPFromTasks(course, isS1 ? "S1" : "S2");
    const capP = maxP !== null ? Math.max(currentP, maxP) : 100;
    let uwNeeded = null, wNeeded = null;
    if (uwMin !== null) {
      if (uwMin <= currentP) uwNeeded = currentP;
      else uwNeeded = Math.min(uwMin, capP);
    }
    if (wMin !== null) {
      if (wMin <= currentP) wNeeded = currentP;
      else wNeeded = Math.min(wMin, capP);
    }
    return {
      locked: false,
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
    const gap = computeTargetGap(course, term);
    if (S.targetGPAMode !== "exam") return gap;
    if (gap.locked || gap.uw === null) return gap;
    if (!_examDisplayCache.computed) {
      const focusSem2 = getExamFocusSemester();
      if (!focusSem2) {
        _examDisplayCache.computed = true;
        return gap;
      }
      const otherSem = focusSem2 === "S1" ? "S2" : "S1";
      _examDisplayCache.focusSem = focusSem2;
      _examDisplayCache.lockedGPA = computeSemesterCreditGPA(otherSem);
      _examDisplayCache.curFocusGPA = computeSemesterCreditGPA(focusSem2);
      _examDisplayCache.computed = true;
    }
    const focusSem = _examDisplayCache.focusSem;
    if (!focusSem) return gap;
    const isFocus = term === "s1" && focusSem === "S1" || term === "s2" && focusSem === "S2";
    if (!isFocus) return gap;
    const lockedGPA = _examDisplayCache.lockedGPA;
    const curFocusGPA = _examDisplayCache.curFocusGPA;
    if (!lockedGPA || !curFocusGPA) return gap;
    const wb = course.weightBonus;
    let neededUW = null, neededW = null;
    let targetCourseUW = null, targetCourseW = null;
    if (S.targetUWGPA !== null) {
      const targetFocusUW = Math.max(0, 2 * S.targetUWGPA - lockedGPA.uw);
      const uwGap = targetFocusUW - curFocusGPA.uw;
      targetCourseUW = Math.min(gap.currentUW + uwGap, 4);
      const minF = getMinScoreForGPA(targetCourseUW);
      if (minF !== null) {
        const raw = (minF - gap.currentP * 0.8) / 0.2;
        neededUW = Math.max(0, Math.min(raw, 100));
      }
    }
    if (S.targetWGPA !== null) {
      const targetFocusW = Math.max(0, 2 * S.targetWGPA - lockedGPA.w);
      const wGap = targetFocusW - curFocusGPA.w;
      targetCourseW = Math.min(gap.currentW + wGap, 4 + wb);
      const minF = getMinScoreForGPA(targetCourseW - wb);
      if (minF !== null) {
        const raw = (minF - gap.currentP * 0.8) / 0.2;
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
    const isS1 = term === "S1" || term === "s1";
    const currentP = isS1 ? course.simGrades.s1p : course.simGrades.s2p;
    const examScore = isS1 ? course.simGrades.s1e : course.simGrades.s2e;
    const wb = course.weightBonus;
    if (currentP === null) return null;
    let maxF;
    if (examScore !== null) {
      maxF = calcF(currentP, examScore);
    } else if (S.targetGPAMode === "exam") {
      maxF = calcF(currentP, 100);
    } else {
      maxF = 100;
    }
    return getGPAForScore(maxF, wb);
  }
  function computeOverallMaxGPA() {
    let s1UW = 0, s1W = 0, s1Cr = 0, s2UW = 0, s2W = 0, s2Cr = 0;
    for (let course of S.simCourses) {
      const cr = course.credit;
      if (cr <= 0) continue;
      for (let term of ["S1", "S2"]) {
        const isS1 = term === "S1";
        const gpa = computeMaxTermGPA(course, term);
        if (!gpa) continue;
        if (isS1) {
          s1UW += gpa.uw * cr;
          s1W += gpa.w * cr;
          s1Cr += cr;
        } else {
          s2UW += gpa.uw * cr;
          s2W += gpa.w * cr;
          s2Cr += cr;
        }
      }
    }
    const sg1 = s1Cr > 0 ? { uw: s1UW / s1Cr, w: s1W / s1Cr } : null;
    const sg2 = s2Cr > 0 ? { uw: s2UW / s2Cr, w: s2W / s2Cr } : null;
    if (!sg1 && !sg2) return null;
    if (!sg1) return sg2;
    if (!sg2) return sg1;
    return { uw: (sg1.uw + sg2.uw) / 2, w: (sg1.w + sg2.w) / 2 };
  }
  function getExamFocusSemester() {
    let hasS1 = false, hasS2 = false;
    for (let course of S.simCourses) {
      if (course.simGrades.s1p !== null && course.simGrades.s1e === null) hasS1 = true;
      if (course.simGrades.s2p !== null && course.simGrades.s2e === null) hasS2 = true;
    }
    if (hasS1) return "S1";
    if (hasS2) return "S2";
    return null;
  }
  function maxGPAHintText() {
    const m = computeOverallMaxGPA();
    return m ? t("\u6700\u9AD8\u53EF\u8FBE", "Maximum") + " UW " + m.uw.toFixed(2) + " W " + m.w.toFixed(2) : "";
  }
  function buildTargetGPAControlsHTML(rowStyle) {
    let html = '<div style="' + (rowStyle || "display:flex;align-items:center;flex-wrap:wrap;gap:6px;") + '">';
    html += '<select id="target-mode-select" style="padding:2px 4px;border:1px solid #d9d9d9;border-radius:4px;font-size:12px;">';
    html += '<option value="subject"' + (S.targetGPAMode === "subject" ? " selected" : "") + ">" + t("\u79D1\u76EE\u8BA1\u7B97", "Subject Calculation") + "</option>";
    html += '<option value="exam"' + (S.targetGPAMode === "exam" ? " selected" : "") + ">" + t("\u671F\u672B\u8BA1\u7B97", "Exam Calculation") + "</option>";
    html += "</select>";
    html += '<span style="font-weight:500;color:#555;">' + t("\u76EE\u6807GPA", "Target GPA") + ":</span>";
    html += '<span>UW</span><input id="target-uw-input" type="number" step="0.01" min="0" max="4.0" style="width:55px;padding:2px 4px;border:1px solid #d9d9d9;border-radius:4px;font-size:12px;" value="' + (S.targetUWGPA !== null ? S.targetUWGPA.toFixed(2) : "") + '" placeholder="\u2014">';
    html += '<span>W</span><input id="target-w-input" type="number" step="0.01" min="0" max="5.0" style="width:55px;padding:2px 4px;border:1px solid #d9d9d9;border-radius:4px;font-size:12px;" value="' + (S.targetWGPA !== null ? S.targetWGPA.toFixed(2) : "") + '" placeholder="\u2014">';
    const hint = maxGPAHintText();
    if (hint) html += '<span id="target-max-hint" style="color:#888;margin-left:4px;">' + hint + "</span>";
    if (S.targetUWGPA !== null || S.targetWGPA !== null) {
      html += '<button id="clear-target-btn" class="ant-btn ant-btn-link" style="font-size:11px;padding:0 4px;">' + t("\u6E05\u9664", "Clear") + "</button>";
    }
    html += "</div>";
    return html;
  }
  function computeSemesterCreditGPA(term) {
    let uw = 0, w = 0, cr = 0;
    for (let course of S.simCourses) {
      if (course.credit <= 0) continue;
      const isS1 = term === "S1" || term === "s1";
      const p = isS1 ? course.simGrades.s1p : course.simGrades.s2p;
      if (p === null) continue;
      const e = isS1 ? course.simGrades.s1e : course.simGrades.s2e;
      const f = calcF(p, e);
      const g = getGPAForScore(f, course.weightBonus);
      if (!g) continue;
      uw += g.uw * course.credit;
      w += g.w * course.credit;
      cr += course.credit;
    }
    if (cr === 0) return null;
    return { uw: uw / cr, w: w / cr };
  }
  function buildTargetDetailTable() {
    if (S.targetUWGPA === null && S.targetWGPA === null) return "";
    const rows = [];
    if (S.targetGPAMode === "exam") {
      const focusSem = getExamFocusSemester();
      if (focusSem === null) {
        return '<div style="color:#d4380d;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u671F\u672B\u8003\u8BD5\u5747\u5DF2\u7ED3\u675F\uFF0C\u65E0\u6CD5\u8FDB\u884C\u671F\u672B\u6A21\u62DF", "All final exams completed \u2014 exam simulation unavailable") + "</div>";
      }
      for (let course of S.simCourses) {
        const dg = getExamDisplayGap(course, focusSem === "S1" ? "s1" : "s2");
        if (dg.locked) continue;
        if (dg.uwNeededP === null && dg.wNeededP === null) {
          if (dg.currentUW === null && dg.currentW === null) continue;
          const hasTarget = S.targetUWGPA !== null && dg.currentUW !== null || S.targetWGPA !== null && dg.currentW !== null;
          if (!hasTarget) continue;
        }
        rows.push({
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
      if (!rows.length) {
        return '<div style="color:#888;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u79D1\u76EE" + focusSem + "\u5B66\u671F\u5747\u5DF2\u8003\u5B8C\u6216\u8FBE\u6807", "All courses " + focusSem + " term are done or at target") + "</div>";
      }
      let html2 = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
      for (let { course, term, gap, neededUW, neededW, atMax, targetCourseUW, targetCourseW } of rows) {
        html2 += "<tr>";
        let cellHtml = '<span style="font-weight:500;">' + escapeHtml(course.name) + '</span> <span style="color:#888;">' + term + "</span>";
        {
          let parts = [];
          if (S.targetUWGPA !== null && neededUW !== null) {
            if (neededUW < 0.01) parts.push('UW <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>");
            else parts.push("UW " + t("\u76EE\u6807", "target") + " " + targetCourseUW.toFixed(2) + " " + t("\u9700\u8003\u2265", "need E\u2265") + '<span style="color:#fa8c16;font-weight:600;">' + neededUW.toFixed(2) + "</span>");
          }
          if (S.targetWGPA !== null && neededW !== null) {
            if (neededW < 0.01) parts.push('W <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>");
            else parts.push("W " + t("\u76EE\u6807", "target") + " " + targetCourseW.toFixed(2) + " " + t("\u9700\u8003\u2265", "need E\u2265") + '<span style="color:#fa8c16;font-weight:600;">' + neededW.toFixed(2) + "</span>");
          }
          if (parts.length) {
            cellHtml += " \u2014 " + parts.join(" | ");
            if (atMax) cellHtml += ' <span style="color:#888;">(P\u226593)</span>';
          } else if (atMax) {
            cellHtml += ' \u2014 <span style="color:#888;">' + t("P\u5DF2\u8FBEA\u7EA7", "P at A-level") + "</span>";
          }
        }
        html2 += '<td style="padding:4px 6px;border:1px solid #eee;">' + cellHtml + "</td>";
        html2 += "</tr>";
      }
      html2 += "</table>";
      return html2;
    }
    for (let course of S.simCourses) {
      for (let term of ["S1", "S2"]) {
        const gap = computeTargetGap(course, term === "S1" ? "s1" : "s2");
        if (gap.uw === null && gap.w === null) continue;
        if (gap.locked) continue;
        const maxTermGPA = computeMaxTermGPA(course, term);
        rows.push({ course, term, gap, maxTermGPA });
      }
    }
    if (!rows.length) {
      const allLocked = (() => {
        for (let course of S.simCourses) {
          for (let term of ["S1", "S2"]) {
            const g = computeTargetGap(course, term === "S1" ? "s1" : "s2");
            if (g.uw !== null || g.w !== null) {
              if (!g.locked) return false;
            }
          }
        }
        return true;
      })();
      if (allLocked) {
        return '<div style="color:#d4380d;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u5B66\u671F\u671F\u672B\u8003\u8BD5\u5747\u5DF2\u7ED3\u675F\uFF0C\u6210\u7EE9\u4E0D\u53EF\u66F4\u6539", "All semester exams completed \u2014 grades cannot be changed") + "</div>";
      }
      return '<div style="color:#52c41a;font-size:11px;margin-top:4px;">' + t("\u6240\u6709\u79D1\u76EE\u5747\u5DF2\u8FBE\u6807", "All courses meet target") + "</div>";
    }
    let html = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    for (let { course, term, gap, maxTermGPA } of rows) {
      html += "<tr>";
      let cellHtml = '<span style="font-weight:500;">' + escapeHtml(course.name) + '</span> <span style="color:#888;">' + term + "</span>";
      {
        let gapParts = [];
        if (S.targetUWGPA !== null && gap.uwGap !== null) {
          if (gap.uwGap < 5e-3) gapParts.push('UW <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>");
          else if (gap.atMax) gapParts.push('UW <span style="color:#fa8c16;">' + t("P\u5DF2\u8FBEA\u7EA7\u4E0A\u9650\uFF0C\u8DDD\u76EE\u6807\u5DEE", "P at A-level max, gap ") + gap.uwGap.toFixed(2) + "</span>");
          else gapParts.push('UW <span style="color:#fa8c16;">' + t("\u76EE\u6807\u9700\u5E73\u65F6\u6210\u7EE9 +", "target need P +") + gap.uwGap.toFixed(2) + "</span>");
        }
        if (S.targetWGPA !== null && gap.wGap !== null) {
          if (gap.wGap < 5e-3) gapParts.push('W <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>");
          else if (gap.atMax) gapParts.push('W <span style="color:#fa8c16;">' + t("P\u5DF2\u8FBEA\u7EA7\u4E0A\u9650\uFF0C\u8DDD\u76EE\u6807\u5DEE", "P at A-level max, gap ") + gap.wGap.toFixed(2) + "</span>");
          else gapParts.push('W <span style="color:#fa8c16;">' + t("\u76EE\u6807\u9700\u5E73\u65F6\u6210\u7EE9 +", "target need P +") + gap.wGap.toFixed(2) + "</span>");
        }
        if (gapParts.length) {
          cellHtml += " \u2014 " + gapParts.join(", ");
          if (gap.atMax) cellHtml += ' <span style="color:#d4380d;font-size:10px;">' + t("(P\u5DF2\u8FBEA\u7EA7\u4E0A\u9650)", "(P at A-level max)") + "</span>";
        } else if (gap.atMax) {
          cellHtml += ' \u2014 <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6700\u5927GPA\u4E14\u8FBE\u6807", "Max GPA reached & target met") + "</span>";
        } else {
          cellHtml += ' \u2014 <span style="color:#52c41a;">' + t("\u5DF2\u8FBE\u6807", "met") + "</span>";
        }
      }
      html += '<td style="padding:4px 6px;border:1px solid #eee;">' + cellHtml + "</td>";
      html += "</tr>";
    }
    html += "</table>";
    return html;
  }
  function renderTargetGapSummary(root) {
    const scope = root || document;
    const summaryDiv = scope.querySelector("#target-gap-summary");
    if (!summaryDiv) return;
    if (S.targetUWGPA === null && S.targetWGPA === null) {
      summaryDiv.innerHTML = "";
      return;
    }
    if (S.targetGPAMode === "exam") {
      const focusSem = getExamFocusSemester();
      if (focusSem === null) {
        summaryDiv.innerHTML = '<span style="color:#d4380d;">' + t("\u6240\u6709\u671F\u672B\u8003\u8BD5\u5747\u5DF2\u7ED3\u675F\uFF0C\u65E0\u6CD5\u8FDB\u884C\u671F\u672B\u6A21\u62DF", "All final exams completed \u2014 exam simulation unavailable") + "</span>";
      } else {
        const otherSem = focusSem === "S1" ? "S2" : "S1";
        const lockedGPA = computeSemesterCreditGPA(otherSem);
        const curFocusGPA = computeSemesterCreditGPA(focusSem);
        let belowC = 0;
        for (let course of S.simCourses) {
          const gap = computeTargetGap(course, focusSem === "S1" ? "s1" : "s2");
          if (gap.uw === null && gap.w === null) continue;
          if (gap.locked) continue;
          let needsImprovement = false;
          if (S.targetUWGPA !== null && lockedGPA && curFocusGPA && gap.currentUW !== null) {
            const targetFocusUW = Math.max(0, 2 * S.targetUWGPA - lockedGPA.uw);
            const uwGap = targetFocusUW - curFocusGPA.uw;
            const targetCourseUW = Math.min(gap.currentUW + uwGap, 4);
            const minF = getMinScoreForGPA(targetCourseUW);
            if (minF !== null) {
              const raw = (minF - gap.currentP * 0.8) / 0.2;
              if (raw > 5e-3) needsImprovement = true;
            }
          }
          if (!needsImprovement && S.targetWGPA !== null && lockedGPA && curFocusGPA && gap.currentW !== null) {
            const targetFocusW = Math.max(0, 2 * S.targetWGPA - lockedGPA.w);
            const wGap = targetFocusW - curFocusGPA.w;
            const targetCourseW = Math.min(gap.currentW + wGap, 4 + course.weightBonus);
            const minF = getMinScoreForGPA(targetCourseW - course.weightBonus);
            if (minF !== null) {
              const raw = (minF - gap.currentP * 0.8) / 0.2;
              if (raw > 5e-3) needsImprovement = true;
            }
          }
          if (needsImprovement) belowC++;
        }
        const label = focusSem === "S1" ? t("\u7B2C\u4E00\u5B66\u671F", "Semester 1") : t("\u7B2C\u4E8C\u5B66\u671F", "Semester 2");
        if (belowC > 0) {
          summaryDiv.innerHTML = '<span style="color:#fa8c16;">' + t("\u671F\u672B\u6A21\u62DF \u2014 " + label + "\uFF1A", "Exam Simulation \u2014 " + label + ": ") + belowC + " " + t("\u79D1\u9700\u63D0\u5347\u4EE5\u8FBE\u5230\u5E73\u5747\u76EE\u6807", " courses need improvement for avg target") + "</span>";
        } else {
          summaryDiv.innerHTML = '<span style="color:#52c41a;">' + t("\u671F\u672B\u6A21\u62DF \u2014 " + label + "\uFF1A\u6240\u6709\u79D1\u76EE\u5DF2\u8FBE\u6807", "Exam Simulation \u2014 " + label + ": all courses met") + "</span>";
        }
      }
      const detailDiv2 = scope.querySelector("#target-detail-table");
      if (detailDiv2) detailDiv2.innerHTML = buildTargetDetailTable();
      return;
    }
    let s1Below = 0, s1Gap = 0, s2Below = 0, s2Gap = 0;
    let lockedCount = 0, maxCount = 0, totalTerms = 0;
    for (let course of S.simCourses) {
      for (let term of ["S1", "S2"]) {
        const gap = computeTargetGap(course, term === "S1" ? "s1" : "s2");
        if (gap.uw === null && gap.w === null) continue;
        totalTerms++;
        if (gap.locked) {
          lockedCount++;
          continue;
        }
        if (gap.atMax) maxCount++;
        const maxGap = Math.max(gap.uwGap || 0, gap.wGap || 0);
        if (maxGap > 5e-3) {
          if (term === "S1") {
            s1Below++;
            s1Gap += maxGap;
          } else {
            s2Below++;
            s2Gap += maxGap;
          }
        }
      }
    }
    const activeTerms = totalTerms - lockedCount;
    if (lockedCount === totalTerms) {
      summaryDiv.innerHTML = '<span style="color:#d4380d;">' + t("\u6240\u6709\u5B66\u671F\u5747\u5DF2\u8003\u5B8C\u671F\u672B\uFF0C\u6210\u7EE9\u4E0D\u53EF\u66F4\u6539", "All semesters completed \u2014 grades cannot be changed") + "</span>";
    } else if (s1Below === 0 && s2Below === 0) {
      summaryDiv.innerHTML = '<span style="color:#52c41a;">' + t("\u6240\u6709\u79D1\u76EE\u5747\u5DF2\u8FBE\u6807", "All courses meet target") + "</span>";
    } else {
      if (s1Below > 0 || s2Below > 0) {
        let parts = [];
        if (s1Below > 0) {
          const avg = (s1Gap / s1Below).toFixed(2);
          parts.push("S1 " + s1Below + " " + t("\u79D1\u672A\u8FBE\u6807\uFF0C\u5E73\u5747\u9700\u63D0\u5347", " below, avg need") + " " + avg + " " + t("\u5E73\u65F6\u5206", " P pts"));
        }
        if (s2Below > 0) {
          const avg = (s2Gap / s2Below).toFixed(2);
          parts.push("S2 " + s2Below + " " + t("\u79D1\u672A\u8FBE\u6807\uFF0C\u5E73\u5747\u9700\u63D0\u5347", " below, avg need") + " " + avg + " " + t("\u5E73\u65F6\u5206", " P pts"));
        }
        summaryDiv.innerHTML = parts.join("\uFF1B");
      } else {
        summaryDiv.innerHTML = '<span style="color:#52c41a;">' + t("\u6240\u6709\u79D1\u76EE\u5747\u5DF2\u8FBE\u6807", "All courses meet target") + "</span>";
      }
    }
    const detailDiv = scope.querySelector("#target-detail-table");
    if (detailDiv) detailDiv.innerHTML = buildTargetDetailTable();
  }
  function attachTargetGPAEvents(root, after) {
    const scope = root || document;
    const refresh = typeof after === "function" ? after : refreshAllViews;
    const uwInput = scope.querySelector("#target-uw-input");
    const wInput = scope.querySelector("#target-w-input");
    const clearBtn = scope.querySelector("#clear-target-btn");
    const modeSelect = scope.querySelector("#target-mode-select");
    if (!uwInput || !wInput) return;
    function applyTargets() {
      let uwVal = uwInput.value.trim();
      let wVal = wInput.value.trim();
      S.targetUWGPA = uwVal !== "" ? parseFloat(uwVal) : null;
      S.targetWGPA = wVal !== "" ? parseFloat(wVal) : null;
      if (S.targetUWGPA !== null && isNaN(S.targetUWGPA)) S.targetUWGPA = null;
      if (S.targetWGPA !== null && isNaN(S.targetWGPA)) S.targetWGPA = null;
      const maxGPA = computeOverallMaxGPA();
      if (S.targetUWGPA !== null) {
        if (S.targetUWGPA < 0) S.targetUWGPA = 0;
        if (maxGPA && S.targetUWGPA > maxGPA.uw) S.targetUWGPA = maxGPA.uw;
      }
      if (S.targetWGPA !== null) {
        if (S.targetWGPA < 0) S.targetWGPA = 0;
        if (maxGPA && S.targetWGPA > maxGPA.w) S.targetWGPA = maxGPA.w;
      }
      markDirty();
      refresh();
    }
    function applyMode() {
      if (modeSelect) {
        S.targetGPAMode = modeSelect.value === "exam" ? "exam" : "subject";
        const maxGPA = computeOverallMaxGPA();
        if (S.targetUWGPA !== null && maxGPA && S.targetUWGPA > maxGPA.uw) S.targetUWGPA = maxGPA.uw;
        if (S.targetWGPA !== null && maxGPA && S.targetWGPA > maxGPA.w) S.targetWGPA = maxGPA.w;
        markDirty();
        refresh();
      }
    }
    uwInput.addEventListener("blur", applyTargets);
    wInput.addEventListener("blur", applyTargets);
    uwInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyTargets();
      }
    });
    wInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyTargets();
      }
    });
    if (modeSelect) modeSelect.addEventListener("change", applyMode);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        S.targetUWGPA = null;
        S.targetWGPA = null;
        uwInput.value = "";
        wInput.value = "";
        markDirty();
        refresh();
      });
    }
    setTimeout(() => renderTargetGapSummary(scope), 100);
  }
  var _targetGapCache, _examDisplayCache;
  var init_gpa_target = __esm({
    "v8.30/gpa-target.js"() {
      init_state();
      init_utils();
      init_ui();
      _targetGapCache = /* @__PURE__ */ new Map();
      _examDisplayCache = { focusSem: null, lockedGPA: null, curFocusGPA: null, computed: false };
    }
  });

  // v8.30/diagnose.js
  function recordError(label, err) {
    try {
      const msg = String(err && err.message || err).slice(0, 300);
      S._errors.push({ ts: Date.now(), label, msg });
      if (S._errors.length > MAX_ERRORS) S._errors.shift();
    } catch (e) {
    }
  }
  function safe(label, fn, fallback) {
    try {
      return fn();
    } catch (e) {
      recordError(label, e);
      console.error("[Better Intschool] " + label + " \u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF0C\u4E0D\u5F71\u54CD\u9875\u9762\uFF09:", e);
      return fallback;
    }
  }
  async function safeAsync(label, fn, fallback) {
    try {
      return await fn();
    } catch (e) {
      recordError(label, e);
      console.error("[Better Intschool] " + label + " \u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
      return fallback;
    }
  }
  function guardListener(label, handler, capture) {
    return function(e) {
      try {
        return handler(e);
      } catch (err) {
        recordError(label, err);
        console.error("[Better Intschool] " + label + " \u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", err);
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
    const credits = [];
    try {
      for (const [k, v] of S.creditMap) credits.push(k + "=" + v);
    } catch (e) {
    }
    const starred = (S.originalCourses || []).filter((c) => c && c.showStar && (c.showStar.s1 || c.showStar.s2)).map((c) => c.name);
    const zeroCredit = (S.originalCourses || []).filter((c) => c && !(c.credit > 0)).length;
    const marks = Object.keys(S._taskMarks || {});
    const dt = S._deadlineAllTasks || [];
    return {
      creditMapSize: S.creditMap ? S.creditMap.size : 0,
      creditSample: credits.slice(0, 12).join(", ") + (credits.length > 12 ? " \u2026" : ""),
      courses: (S.originalCourses || []).length,
      zeroCredit,
      starred: starred.length + (starred.length ? " [" + starred.join(" | ") + "]" : ""),
      marks: marks.length,
      markIds: marks.slice(0, 12).join(","),
      ddlAll: dt.length,
      ddlDetected: dt.filter((x) => x.detected).length,
      ddlMarked: dt.filter((x) => x.marked).length,
      ddlCacheAge: S._deadlineCache && S._deadlineCache.ts ? Math.round((Date.now() - S._deadlineCache.ts) / 1e3) + "s" : "\u65E0",
      yearCache: S.yearDataCache ? S.yearDataCache.size : 0,
      simCourses: (S.simCourses || []).length
    };
  }
  async function _apiSnapshot() {
    const out = { gradeBook: "\u672A\u68C0\u6D4B", customColumns: "\u2014", columns: "\u2014", yearList: "\u672A\u68C0\u6D4B", schedule: "\u672A\u68C0\u6D4B" };
    try {
      const years = await fetchSchoolYearList();
      out.yearList = years.length + " \u6761 [" + years.map((y) => y.value).join(", ") + "]";
    } catch (e) {
      out.yearList = "\u83B7\u53D6\u5931\u8D25: " + e.message;
    }
    try {
      const gb = await getGradeBookData(S.currentYearKey);
      const items = gb && gb.gradeBookItems || [];
      out.gradeBook = items.length + " \u6761\u8BFE\u7A0B";
      const cols = gb && gb.customColumns || [];
      out.customColumns = cols.length + " \u5217";
      out.columns = cols.map((c) => c.customColumnName).join("/") || "\u2014";
      out.firstCourse = items[0] ? items[0].courseName + " (subject=" + (items[0].subject || "\u7A7A") + ", courseId=" + items[0].courseId + ")" : "\u2014";
    } catch (e) {
      out.gradeBook = "\u83B7\u53D6\u5931\u8D25: " + e.message;
    }
    return out;
  }
  async function buildDiagnosticReport() {
    const env = {
      version: typeof GM_info !== "undefined" && GM_info.script && GM_info.script.version || "\u672A\u77E5",
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
      diagLog: (function() {
        try {
          return localStorage.getItem("ints_diag") === "1" ? "\u5F00\u542F" : "\u5173\u95ED";
        } catch (e) {
          return "?";
        }
      })()
    };
    const data = _dataSnapshot();
    const api = await _apiSnapshot();
    const errors = S._errors.slice(-5).map((e) => "  \xB7 [" + _fmtTs(e.ts) + "] " + e.label + ": " + e.msg);
    const lines = [];
    lines.push("===== Better Intschool \u81EA\u68C0\u62A5\u544A =====");
    lines.push("\u751F\u6210\u65F6\u95F4: " + _fmtTs(Date.now()));
    lines.push("");
    lines.push("[\u73AF\u5883]");
    lines.push("  \u7248\u672C: " + env.version + "    \u754C\u9762\u8BED\u8A00: " + env.locale + "    \u6807\u8BB0\u56FE\u6807: " + env.markIcon);
    lines.push("  \u9875\u9762: " + env.url + "    \u89C6\u53E3: " + env.viewport);
    lines.push("  \u767B\u5F55\u6001: token=" + env.token + "  schoolId=" + env.schoolId);
    lines.push("  \u81EA\u52A8\u6821\u51C6: " + env.autoCalibrate + "    \u8BCA\u65AD\u65E5\u5FD7: " + env.diagLog);
    lines.push("  \u6D4F\u89C8\u5668: " + env.ua);
    lines.push("");
    lines.push("[\u63A5\u53E3]");
    lines.push("  \u5B66\u5E74\u5217\u8868: " + api.yearList);
    lines.push("  \u5F53\u524D\u5B66\u5E74: key=" + S.currentYearKey + " value=" + S.currentYearValue + " isCurrentYear=" + S.isCurrentYear);
    lines.push("  grade-book: " + api.gradeBook + "    customColumns: " + api.customColumns + " [" + api.columns + "]");
    if (api.firstCourse) lines.push("  \u9996\u95E8\u8BFE\u7A0B: " + api.firstCourse);
    lines.push("");
    lines.push("[\u6570\u636E]");
    lines.push("  \u5B66\u5206\u6620\u5C04: " + data.creditMapSize + " \u6761    " + (data.creditSample || "\uFF08\u7A7A\uFF09"));
    lines.push("  \u8BFE\u7A0B: " + data.courses + " \u95E8\uFF08\u96F6\u5B66\u5206 " + data.zeroCredit + "\uFF09    \u661F\u6807\u79D1\u76EE: " + data.starred);
    lines.push("  \u624B\u52A8\u6807\u8BB0: " + data.marks + (data.markIds ? " [" + data.markIds + "]" : ""));
    lines.push("  DDL: \u5168\u90E8 " + data.ddlAll + " / \u68C0\u6D4B\u5230 " + data.ddlDetected + " / \u6807\u8BB0 " + data.ddlMarked + "    \u7F13\u5B58\u5E74\u9F84: " + data.ddlCacheAge);
    lines.push("  \u7F13\u5B58: \u5B66\u5E74 " + data.yearCache + " \u6761    \u6A21\u62DF\u8BFE\u7A0B " + data.simCourses + " \u95E8");
    lines.push("");
    lines.push("[\u5F02\u5E38\u8BB0\u5F55] " + S._errors.length + " \u6761" + (errors.length ? "\n" + errors.join("\n") : "\uFF08\u65E0\uFF09"));
    lines.push("");
    lines.push('\u63D0\u793A: \u62A5\u544A\u4E0D\u542B token/schoolId \u660E\u6587\uFF1B\u5982\u67D0\u9879\u663E\u793A"\u83B7\u53D6\u5931\u8D25"\uFF0C\u591A\u534A\u662F\u767B\u5F55\u6001\u8FC7\u671F\u6216\u7F51\u7EDC\u95EE\u9898\u3002');
    return lines.join("\n");
  }
  async function showDiagnostics() {
    const modalId = "ints-diag-modal";
    const stale = document.getElementById(modalId);
    if (stale) stale.remove();
    const wrap = document.createElement("div");
    wrap.id = modalId;
    wrap.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:20100;display:flex;align-items:center;justify-content:center;";
    const panel = document.createElement("div");
    panel.style.cssText = "width:min(760px,92vw);max-height:86vh;background:#fff;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;";
    panel.innerHTML = '<div style="padding:12px 18px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;"><strong>' + t("\u81EA\u68C0\u8BCA\u65AD", "Diagnostics") + '</strong><button id="ints-diag-close" style="background:none;border:none;font-size:22px;cursor:pointer;">&times;</button></div><div style="padding:14px 18px;overflow:auto;flex:1;"><div id="ints-diag-body" style="font-size:13px;color:#555;">' + t("\u6B63\u5728\u68C0\u6D4B\u2026", "Checking\u2026") + '</div></div><div style="padding:10px 18px;border-top:1px solid #eee;display:flex;justify-content:flex-end;gap:10px;"><button id="ints-diag-copy" class="ant-btn ant-btn-primary" style="padding:5px 16px;">' + t("\u590D\u5236\u62A5\u544A", "Copy report") + "</button></div>";
    wrap.appendChild(panel);
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    panel.querySelector("#ints-diag-close").addEventListener("click", close);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close();
    });
    const report = await safeAsync("\u8BCA\u65AD\u62A5\u544A\u751F\u6210", buildDiagnosticReport, "\u62A5\u544A\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u63A7\u5236\u53F0");
    const body = panel.querySelector("#ints-diag-body");
    body.innerHTML = '<textarea id="ints-diag-text" readonly style="width:100%;height:52vh;font-family:Consolas,Menlo,monospace;font-size:12px;line-height:1.5;border:1px solid #e0e0e0;border-radius:6px;padding:10px;box-sizing:border-box;white-space:pre;overflow:auto;"></textarea>';
    body.querySelector("#ints-diag-text").value = report;
    panel.querySelector("#ints-diag-copy").addEventListener("click", () => {
      const ta = panel.querySelector("#ints-diag-text");
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      if (!ok && navigator.clipboard) {
        navigator.clipboard.writeText(ta.value).catch(() => {
        });
      }
      const btn = panel.querySelector("#ints-diag-copy");
      btn.textContent = t("\u5DF2\u590D\u5236", "Copied");
      setTimeout(() => {
        btn.textContent = t("\u590D\u5236\u62A5\u544A", "Copy report");
      }, 1500);
    });
  }
  var MAX_ERRORS;
  var init_diagnose = __esm({
    "v8.30/diagnose.js"() {
      init_state();
      init_utils();
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
    const el = document.querySelector(CONTAINER_SEL);
    if (!el) return null;
    try {
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
    } catch (e) {
    }
    return el;
  }
  function _containerBox(win) {
    const c = win.container;
    if (!c || !c.isConnected) return null;
    return { visLeft: c.scrollLeft, visTop: c.scrollTop, clientW: c.clientWidth, clientH: c.clientHeight };
  }
  function _anchorBox(win) {
    const a = win.anchorEl;
    const box = _containerBox(win);
    if (!a || !a.isConnected || !box) return null;
    const ar = a.getBoundingClientRect();
    const cr = win.container.getBoundingClientRect();
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
    if (win.container && !win.container.isConnected) win.container = _container();
    const target = win.container || document.body;
    if (win.el.parentNode !== target) {
      win.el.style.position = win.container ? "absolute" : "fixed";
      target.appendChild(win.el);
    }
  }
  function _place(win) {
    _ensureHome(win);
    const p = _anchorBox(win);
    if (!p) return false;
    win.el.style.left = Math.round(p.left + win.dx) + "px";
    win.el.style.top = Math.round(p.top + win.dy) + "px";
    return true;
  }
  function _clamp(win, box, left, top) {
    const w = win.el.offsetWidth || 0, h = win.el.offsetHeight || 0;
    if (!box) return { left, top };
    const minL = box.visLeft + EDGE, maxL = Math.max(minL, box.visLeft + box.clientW - w - EDGE);
    const minT = box.visTop + EDGE, maxT = Math.max(minT, box.visTop + box.clientH - Math.min(h, box.clientH) - EDGE);
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
    for (const w of _wins) _place(w);
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
    const key = String(opts.key);
    const old = getWindow(key);
    if (old) {
      raiseWindow(key);
      if (opts.anchorEl) setWindowAnchor(key, opts.anchorEl);
      return old.handle;
    }
    const el = document.createElement("div");
    el.className = "ints-win" + (opts.className ? " " + opts.className : "");
    el.setAttribute(WIN_ATTR, key);
    el.setAttribute("data-win-kind", opts.kind || "win");
    if (opts.domId) el.id = opts.domId;
    el.style.width = (opts.width || 340) + "px";
    el.style.zIndex = String(++_z > Z_WIN_MAX ? _z = Z_WIN_BASE + 1 : _z);
    el.innerHTML = '<div class="ints-win-head" title="' + escapeHtml(t("\u6309\u4F4F\u6807\u9898\u680F\u53EF\u76F4\u63A5\u62D6\u52A8\uFF1B\u6B63\u6587\u5904\u957F\u6309\u4E5F\u80FD\u62D6\uFF1B\u4E0D\u62D6\u65F6\u968F\u8868\u683C\u6EDA\u52A8", "Drag by the title bar, or long-press anywhere in the body")) + '"><div class="ints-win-title"></div><button type="button" class="ints-win-close" data-win-close="1" title="' + escapeHtml(t("\u5173\u95ED\uFF08Esc\uFF09", "Close (Esc)")) + '">&times;</button></div><div class="ints-win-body"></div>' + (opts.footerHTML ? '<div class="ints-win-foot"></div>' : "");
    const body = el.querySelector(".ints-win-body");
    const foot = el.querySelector(".ints-win-foot");
    el.querySelector(".ints-win-title").innerHTML = opts.titleHTML || "";
    body.innerHTML = opts.bodyHTML || "";
    if (foot) foot.innerHTML = opts.footerHTML;
    if (opts.maxBodyHeight) body.style.maxHeight = opts.maxBodyHeight;
    const win = {
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
    win.container = win.container || null;
    el.style.position = win.container ? "absolute" : "fixed";
    (win.container || document.body).appendChild(el);
    const p = _anchorBox(win);
    if (p) {
      const w = el.offsetWidth;
      let left = p.left + p.width + EDGE;
      let top = p.top;
      if (left + w > p.visLeft + p.clientW - EDGE) left = p.left - w - EDGE;
      const cl = _clamp(win, p, left, top);
      win.dx = Math.round(cl.left - p.left);
      win.dy = Math.round(cl.top - p.top);
      _place(win);
    } else if (win.anchorEl && win.anchorEl.isConnected) {
      const r = win.anchorEl.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      let left = r.right + EDGE;
      if (left + w > window.innerWidth - EDGE) left = Math.max(EDGE, r.left - w - EDGE);
      const cl = _clampViewport(left, r.top, w, h);
      el.style.left = Math.round(cl.left) + "px";
      el.style.top = Math.round(cl.top) + "px";
    } else {
      el.style.left = EDGE + "px";
      el.style.top = EDGE + "px";
    }
    const handle = {
      key,
      el,
      body,
      foot,
      setBody(html) {
        body.innerHTML = html;
        return body;
      },
      close() {
        closeWindow(key);
      }
    };
    win.handle = handle;
    el.addEventListener("mousedown", guardListener("\u7A97\u53E3\u6309\u4E0B", (e) => {
      raiseWindow(key);
      if (e.target && e.target.closest && e.target.closest("[data-win-close]")) return;
      const onHead = !!(e.target && e.target.closest && e.target.closest(".ints-win-head"));
      if (onHead) {
        _armDrag(win, e, HEAD_TOL, 0);
        return;
      }
      if (_isInteractive(e.target)) return;
      _armDrag(win, e, MOVE_TOL, LONG_PRESS_MS);
    }));
    el.querySelector("[data-win-close]").addEventListener("click", guardListener("\u7A97\u53E3\u5173\u95ED", (e) => {
      e.preventDefault();
      closeWindow(key);
    }));
    _wins.push(win);
    return handle;
  }
  function closeWindow(key) {
    const i = _wins.findIndex((w) => w.key === String(key));
    if (i < 0) return false;
    const win = _wins[i];
    _wins.splice(i, 1);
    if (_drag && _drag.key === win.key) _endDrag(true);
    win.el.remove();
    try {
      if (win.onClose) win.onClose();
    } catch (e) {
    }
    return true;
  }
  function closeTopWindow() {
    if (!_wins.length) return false;
    return closeWindow(_wins[_wins.length - 1].key);
  }
  function closeAllWindows() {
    while (_wins.length) closeWindow(_wins[_wins.length - 1].key);
  }
  function raiseWindow(key) {
    const i = _wins.findIndex((w) => w.key === String(key));
    if (i < 0) return;
    const win = _wins.splice(i, 1)[0];
    _wins.push(win);
    win.el.style.zIndex = String(++_z > Z_WIN_MAX ? _z = Z_WIN_BASE + 1 : _z);
  }
  function setWindowAnchor(key, anchorEl) {
    const win = getWindow(key);
    if (!win || !anchorEl) return;
    win.anchorEl = anchorEl;
    if (_drag && _drag.key === win.key) return;
    _place(win);
  }
  function isInAnyWindow(node) {
    if (!node || !node.closest) return false;
    return !!node.closest("[" + WIN_ATTR + "]");
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
    const c = _container();
    if (c) return { width: c.clientWidth, height: c.clientHeight };
    return { width: window.innerWidth, height: window.innerHeight };
  }
  function _winAlive(win) {
    return !!(win && win.el && win.el.isConnected && getWindow(win.key) === win);
  }
  function _armDrag(win, e, tol, holdMs) {
    if (e.button !== 0) return;
    if (_armCancel) {
      _armCancel();
    }
    const sx = e.clientX, sy = e.clientY;
    let armed = holdMs === 0;
    let finished = false;
    let timer = null;
    if (holdMs > 0) {
      timer = setTimeout(() => {
        armed = true;
      }, holdMs);
    }
    const onMove = (ev) => {
      if (finished) return;
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
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
        _startDrag(win, sx, sy);
        _onDragMove(ev);
        cleanup();
      }
    };
    const onUp = () => cleanup();
    function cleanup() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("mouseup", onUp, true);
      if (_armCancel === cleanup) _armCancel = null;
    }
    _armCancel = cleanup;
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseup", onUp, true);
  }
  function _startDrag(win, sx, sy) {
    if (_drag || !_winAlive(win)) return;
    const el = win.el;
    const r = el.getBoundingClientRect();
    _drag = { key: win.key, win, el, offX: sx - r.left, offY: sy - r.top, moved: false };
    el.classList.add("ints-win-dragging");
    console.log("[\u7A97\u53E3] \u5F00\u59CB\u62D6\u52A8 " + win.key);
    document.addEventListener("mousemove", _onDragMove, true);
    document.addEventListener("mouseup", _onDragUp, true);
  }
  function _onDragMove(e) {
    if (!_drag) return;
    _moveCount++;
    const { el, win, offX, offY } = _drag;
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = e.clientX - offX;
    let top = e.clientY - offY;
    const box = _containerBox(win);
    if (box) {
      const cr = win.container.getBoundingClientRect();
      left = left - cr.left + box.visLeft;
      top = top - cr.top + box.visTop;
      const cl = _clamp(win, box, left, top);
      left = cl.left;
      top = cl.top;
    } else {
      const cl = _clampViewport(left, top, w, h);
      left = cl.left;
      top = cl.top;
    }
    el.style.left = Math.round(left) + "px";
    el.style.top = Math.round(top) + "px";
    _lastMove = Math.round(left) + "," + Math.round(top) + " (from " + Math.round(e.clientX) + "," + Math.round(e.clientY) + ")";
    _drag.moved = true;
    if (e.cancelable) e.preventDefault();
  }
  function _endDrag(silent) {
    if (!_drag) return;
    const { el, win, moved } = _drag;
    document.removeEventListener("mousemove", _onDragMove, true);
    document.removeEventListener("mouseup", _onDragUp, true);
    el.classList.remove("ints-win-dragging");
    _drag = null;
    if (!moved || silent) return;
    const p = _anchorBox(win);
    if (p) {
      win.dx = Math.round((parseFloat(el.style.left || "0") || 0) - p.left);
      win.dy = Math.round((parseFloat(el.style.top || "0") || 0) - p.top);
    }
    const swallow = (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      document.removeEventListener("click", swallow, true);
    };
    document.addEventListener("click", swallow, true);
    setTimeout(() => document.removeEventListener("click", swallow, true), 0);
  }
  function _onDragUp() {
    _endDrag(false);
  }
  function installShell() {
    if (_installed) return;
    _installed = true;
    document.addEventListener("mousedown", guardListener("\u7A97\u53E3\u5916\u70B9\u5173\u95ED", (e) => {
      if (!_wins.length) return;
      const target = e.target;
      if (isInAnyWindow(target)) return;
      if (target && target.closest && target.closest(EXCLUDE_SEL)) return;
      closeTopWindow();
    }), true);
    document.addEventListener("keydown", guardListener("\u7A97\u53E3 Esc \u5173\u95ED", (e) => {
      if (e.key !== "Escape" || !_wins.length) return;
      closeTopWindow();
    }), true);
    window.addEventListener("resize", () => {
      try {
        _syncNow();
      } catch (e) {
      }
    });
  }
  var WIN_ATTR, CONTAINER_SEL, LONG_PRESS_MS, MOVE_TOL, HEAD_TOL, Z_WIN_BASE, Z_WIN_MAX, EDGE, _z, _installed, _syncCount, _moveCount, _lastMove, _drag, _wins, EXCLUDE_SEL, _armCancel;
  var init_win_shell = __esm({
    "v8.30/win-shell.js"() {
      init_utils();
      init_diagnose();
      WIN_ATTR = "data-ints-window";
      CONTAINER_SEL = ".ant-table-body";
      LONG_PRESS_MS = 250;
      MOVE_TOL = 10;
      HEAD_TOL = 3;
      Z_WIN_BASE = 30;
      Z_WIN_MAX = 39;
      EDGE = 6;
      _z = Z_WIN_BASE;
      _installed = false;
      _syncCount = 0;
      _moveCount = 0;
      _lastMove = "";
      _drag = null;
      _wins = [];
      EXCLUDE_SEL = [
        "[data-ints-window]",
        // 任一窗口内部
        "[data-ints-clickable]",
        // 点开窗口的成绩格
        "[data-ints-task]",
        // 任务格（含虚拟任务格）
        "[data-ints-vtask-id]",
        '[id^="ints-inline-"]',
        // 工具栏 / 下拉菜单 / 学年 GPA / 学期筛选
        ".virtual-task-modal",
        '[id^="ints-vt-"]',
        // 虚拟任务弹窗（simulation.js，不参与本规则）
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
    const key = grade + "_" + semester;
    const override = S.multiYearGPAOverrides[key];
    if (!override) return computedGPA;
    if (computedGPA) {
      let changed = false;
      if (override.uw !== null && override.uw !== void 0 && to3SigFigs(override.uw) === to3SigFigs(computedGPA.uw)) {
        override.uw = null;
        changed = true;
      }
      if (override.w !== null && override.w !== void 0 && to3SigFigs(override.w) === to3SigFigs(computedGPA.w)) {
        override.w = null;
        changed = true;
      }
      if (changed && override.uw === null && override.w === null) {
        delete S.multiYearGPAOverrides[key];
        return computedGPA;
      }
    }
    const result = { uw: computedGPA ? computedGPA.uw : null, w: computedGPA ? computedGPA.w : null };
    if (override.uw !== null && override.uw !== void 0) result.uw = override.uw;
    if (override.w !== null && override.w !== void 0) result.w = override.w;
    return result;
  }
  function _anchorAnnualComponent(value, reportVal, computedOrigVal) {
    if (value === null || value === void 0) return value;
    if (reportVal === null || reportVal === void 0) return value;
    if (computedOrigVal === null || computedOrigVal === void 0) return value;
    return reportVal + (value - computedOrigVal);
  }
  function multiYearAnnualOf(entry) {
    const computedOrig = computeAnnualGPA(entry.originalCourses, (c) => c.originalGrades.s1f, (c) => c.originalGrades.s2f);
    const report = entry.annualGPA !== null && entry.annualGPA !== void 0 && entry.cumulativeGPA !== null && entry.cumulativeGPA !== void 0 ? { uw: entry.cumulativeGPA, w: entry.annualGPA } : null;
    const simS1F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f);
    const simS2F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f);
    const effS1F = getEffectiveMultiYearGPA(entry.grade, "S1F", simS1F);
    const effS2F = getEffectiveMultiYearGPA(entry.grade, "S2F", simS2F);
    const simAnnual = computeAnnualFromSemesters(effS1F, effS2F);
    let value = getEffectiveMultiYearGPA(entry.grade, "Annual", simAnnual);
    if (value && report && computedOrig) {
      const ov = S.multiYearGPAOverrides[entry.grade + "_Annual"] || {};
      const uwOverridden = ov.uw !== null && ov.uw !== void 0;
      const wOverridden = ov.w !== null && ov.w !== void 0;
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
      const key = grade + "_" + semester;
      const override = S.multiYearGPAOverrides[key] || {};
      function fmtVal(val, origVal, type, color) {
        const isOverride = override[type] !== null && override[type] !== void 0;
        const diff = orig && origVal !== null && origVal !== void 0 && val !== null ? val - origVal : 0;
        const hasDiff = orig && origVal !== null && origVal !== void 0 && val !== null && Math.abs(diff) > 5e-3;
        const diffStr = hasDiff ? " (" + formatDiff(diff) + ")" : "";
        const style = isOverride ? "color:" + color + ";font-weight:bold;cursor:pointer;background:#fff3e0;padding:1px 4px;border-radius:3px;" : "cursor:pointer;";
        const title = isOverride ? t("\u5DF2\u8986\u76D6(\u70B9\u51FB\u7F16\u8F91)", "Overridden (click to edit)") : val !== null ? t("\u70B9\u51FB\u7F16\u8F91GPA", "Click to edit GPA") : t("\u70B9\u51FB\u8BBE\u7F6EGPA", "Click to set GPA");
        const displayVal = val !== null ? val.toFixed(2) : "\u2014";
        return '<span class="my-gpa-editable" data-grade="' + grade + '" data-sem="' + semester + '" data-type="' + type + '" style="' + style + '" title="' + title + '">' + displayVal + "</span>" + diffStr;
      }
      const uw = effective ? effective.uw : override.uw !== null && override.uw !== void 0 ? override.uw : null;
      const w = effective ? effective.w : override.w !== null && override.w !== void 0 ? override.w : null;
      const origUW = orig ? orig.uw : null;
      const origW = orig ? orig.w : null;
      return "UW: " + fmtVal(uw, origUW, "uw", "#1890ff") + " W: " + fmtVal(w, origW, "w", "#cf1322");
    }
    let html = `<div style="overflow-x:auto;max-width:100%;"><table style="border-collapse:collapse;font-size:13px;min-width:700px;">`;
    html += `<thead><tr style="background:#fafafa;">`;
    html += `<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;">${t("\u5E74\u7EA7", "Grade")}</th>`;
    html += `<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;">S1F GPA</th>`;
    html += `<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;">S2F GPA</th>`;
    html += `<th style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f9f9ff;">${t("\u5B66\u5E74GPA", "Annual GPA")}</th>`;
    html += `</tr></thead><tbody>`;
    for (let entry of S.multiYearEntries) {
      let grade = entry.grade;
      let origS1F = computeColumnGPASummary(entry.originalCourses, (c) => c.originalGrades.s1f);
      let origS2F = computeColumnGPASummary(entry.originalCourses, (c) => c.originalGrades.s2f);
      const ann = multiYearAnnualOf(entry);
      let origAnnual = ann.base;
      let simS1F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f);
      let simS2F = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f);
      let effS1F = getEffectiveMultiYearGPA(grade, "S1F", simS1F);
      let effS2F = getEffectiveMultiYearGPA(grade, "S2F", simS2F);
      html += `<tr>`;
      html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;font-weight:600;">${grade}</td>`;
      html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f0f8ff;">${formatEditableGPA(effS1F, origS1F, grade, "S1F")}</td>`;
      html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f0f8ff;">${formatEditableGPA(effS2F, origS2F, grade, "S2F")}</td>`;
      html += `<td style="border:1px solid #e8e8e8;padding:8px 10px;text-align:center;background:#f9f9ff;">${formatEditableGPA(ann.value, origAnnual, grade, "Annual")}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table>`;
    let allAnnuals = [];
    for (let entry of S.multiYearEntries) {
      const g = multiYearAnnualOf(entry).value;
      if (g) allAnnuals.push(g);
    }
    if (allAnnuals.length > 0) {
      let avgUW = allAnnuals.reduce((s, g) => s + g.uw, 0) / allAnnuals.length;
      let avgW = allAnnuals.reduce((s, g) => s + g.w, 0) / allAnnuals.length;
      html += `<div id="multi-year-avg-gpa" style="margin-top:12px;font-size:13px;"><strong>${t("\u5E73\u5747GPA", "Average GPA")}:</strong> UW: ${avgUW.toFixed(2)} W: ${avgW.toFixed(2)}</div>`;
    }
    html += `</div>`;
    return html;
  }
  function buildMultiYearChart() {
    let svgId = "gpa-trend-svg";
    let html = `<div style="padding:8px;text-align:center;position:relative;"><svg id="${svgId}" viewBox="0 0 500 400" style="max-width:100%;height:auto;background:#fff;"></svg></div>`;
    setTimeout(() => drawMultiYearChart(), 50);
    return html;
  }
  function drawMultiYearChart() {
    let svg = document.getElementById("gpa-trend-svg");
    if (!svg) return;
    let dataHash = "";
    for (let entry of S.multiYearEntries) {
      const effective = multiYearAnnualOf(entry).value;
      dataHash += entry.grade + "|" + (effective ? effective.uw + "," + effective.w : "null") + ";";
    }
    if (svg.dataset.hash === dataHash) return;
    svg.dataset.hash = dataHash;
    let W = 500, H = 400;
    let margin = { top: 25, right: 30, bottom: 40, left: 55 };
    let pw = W - margin.left - margin.right;
    let ph = H - margin.top - margin.bottom;
    let dataPoints = [];
    for (let entry of S.multiYearEntries) {
      const effective = multiYearAnnualOf(entry).value;
      if (effective) {
        dataPoints.push({ grade: entry.grade, uw: effective.uw, w: effective.w });
      } else {
        dataPoints.push({ grade: entry.grade, uw: null, w: null });
      }
    }
    let validPoints = dataPoints.filter((p) => p.uw !== null || p.w !== null);
    let allNull = validPoints.length === 0;
    let svgNS = "http://www.w3.org/2000/svg";
    svg.innerHTML = "";
    if (allNull) {
      let txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", W / 2);
      txt.setAttribute("y", H / 2);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("fill", "#999");
      txt.setAttribute("font-size", "14");
      txt.textContent = t("\u6682\u65E0\u6210\u7EE9\u6570\u636E", "No grade data");
      svg.appendChild(txt);
      return;
    }
    let allUWVals = validPoints.map((p) => p.uw).filter((v) => v !== null);
    let allWVals = validPoints.map((p) => p.w).filter((v) => v !== null);
    let allVals = [...allUWVals, ...allWVals];
    let maxGPA = Math.max(...allVals, 4);
    let yMax = Math.ceil(maxGPA * 1.15 / 0.5) * 0.5;
    if (yMax < 4.5) yMax = 4.5;
    let avgUW = allUWVals.length > 0 ? allUWVals.reduce((s, v) => s + v, 0) / allUWVals.length : null;
    let avgW = allWVals.length > 0 ? allWVals.reduce((s, v) => s + v, 0) / allWVals.length : null;
    function xPos(i) {
      return margin.left + i / (dataPoints.length - 1 || 1) * pw;
    }
    function yPos(v) {
      return margin.top + ph - v / yMax * ph;
    }
    for (let v = 0; v <= yMax; v += 0.5) {
      let y = yPos(v);
      let line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", margin.left);
      line.setAttribute("x2", W - margin.right);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#e8e8e8");
      line.setAttribute("stroke-width", "0.5");
      svg.appendChild(line);
      let txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", margin.left - 8);
      txt.setAttribute("y", y + 4);
      txt.setAttribute("text-anchor", "end");
      txt.setAttribute("fill", "#666");
      txt.setAttribute("font-size", "11");
      txt.textContent = v.toFixed(1);
      svg.appendChild(txt);
    }
    for (let i = 0; i < dataPoints.length; i++) {
      let x = xPos(i);
      let txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", x);
      txt.setAttribute("y", H - margin.bottom + 18);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("fill", "#333");
      txt.setAttribute("font-size", "12");
      txt.textContent = dataPoints[i].grade;
      svg.appendChild(txt);
      if (i > 0) {
        let tickLine = document.createElementNS(svgNS, "line");
        tickLine.setAttribute("x1", x);
        tickLine.setAttribute("x2", x);
        let baseY = margin.top + ph;
        tickLine.setAttribute("y1", baseY);
        tickLine.setAttribute("y2", baseY + 5);
        tickLine.setAttribute("stroke", "#ccc");
        tickLine.setAttribute("stroke-width", "0.5");
        svg.appendChild(tickLine);
      }
    }
    let baseLine = document.createElementNS(svgNS, "line");
    baseLine.setAttribute("x1", margin.left);
    baseLine.setAttribute("x2", W - margin.right);
    baseLine.setAttribute("y1", margin.top + ph);
    baseLine.setAttribute("y2", margin.top + ph);
    baseLine.setAttribute("stroke", "#999");
    baseLine.setAttribute("stroke-width", "1");
    svg.appendChild(baseLine);
    function drawAvgLine(val, color, label) {
      let y = yPos(val);
      let line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", margin.left);
      line.setAttribute("x2", W - margin.right);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "1");
      line.setAttribute("stroke-dasharray", "5,4");
      svg.appendChild(line);
      let txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", W - margin.right - 8);
      txt.setAttribute("y", y - 6);
      txt.setAttribute("text-anchor", "end");
      txt.setAttribute("fill", color);
      txt.setAttribute("font-size", "10");
      txt.textContent = `${label} avg ${val.toFixed(2)}`;
      svg.appendChild(txt);
    }
    if (avgUW !== null) drawAvgLine(avgUW, "#1890ff", "UW");
    if (avgW !== null) drawAvgLine(avgW, "#cf1322", "W");
    let svgContainer = svg.parentNode;
    let tooltip = svgContainer.querySelector(".chart-custom-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "chart-custom-tooltip";
      tooltip.style.cssText = "display:none;position:absolute;z-index:10;pointer-events:none;background:rgba(0,0,0,0.8);color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;line-height:1.5;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);";
      svgContainer.appendChild(tooltip);
    }
    function drawDataLine(getY, color, label) {
      let pts = [];
      for (let i = 0; i < dataPoints.length; i++) {
        let val = getY(dataPoints[i]);
        if (val === null) continue;
        pts.push(`${xPos(i).toFixed(1)},${yPos(val).toFixed(1)}`);
      }
      if (pts.length === 0) return;
      let polyline = document.createElementNS(svgNS, "polyline");
      polyline.setAttribute("points", pts.join(" "));
      polyline.setAttribute("fill", "none");
      polyline.setAttribute("stroke", color);
      polyline.setAttribute("stroke-width", "2");
      polyline.setAttribute("stroke-linejoin", "round");
      svg.appendChild(polyline);
      for (let i = 0; i < dataPoints.length; i++) {
        let val = getY(dataPoints[i]);
        if (val === null) continue;
        let cx = xPos(i), cy = yPos(val);
        let grade = dataPoints[i].grade;
        let dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", cx);
        dot.setAttribute("cy", cy);
        dot.setAttribute("r", "5");
        dot.setAttribute("fill", color);
        dot.style.cursor = "pointer";
        dot.addEventListener("mouseenter", (e) => {
          let containerRect = svgContainer.getBoundingClientRect();
          tooltip.innerHTML = `<strong>${grade}</strong> ${label}: ${val.toFixed(2)}`;
          tooltip.style.display = "block";
          let tx = e.clientX - containerRect.left + 14;
          let ty = e.clientY - containerRect.top - 30;
          if (tx + 120 > containerRect.width) tx = e.clientX - containerRect.left - 120;
          if (ty < 0) ty = e.clientY - containerRect.top + 14;
          tooltip.style.left = tx + "px";
          tooltip.style.top = ty + "px";
        });
        dot.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });
        svg.appendChild(dot);
        let inner = document.createElementNS(svgNS, "circle");
        inner.setAttribute("cx", cx);
        inner.setAttribute("cy", cy);
        inner.setAttribute("r", "2");
        inner.setAttribute("fill", "#fff");
        inner.style.pointerEvents = "none";
        svg.appendChild(inner);
      }
    }
    drawDataLine((p) => p.uw, "#1890ff", "UW");
    drawDataLine((p) => p.w, "#cf1322", "W");
    let lg = document.createElementNS(svgNS, "g");
    lg.setAttribute("transform", `translate(${margin.left + 10}, ${margin.top})`);
    let r1 = document.createElementNS(svgNS, "rect");
    r1.setAttribute("x", 0);
    r1.setAttribute("y", 0);
    r1.setAttribute("width", 14);
    r1.setAttribute("height", 3);
    r1.setAttribute("fill", "#1890ff");
    lg.appendChild(r1);
    let t1 = document.createElementNS(svgNS, "text");
    t1.setAttribute("x", 18);
    t1.setAttribute("y", 5);
    t1.setAttribute("fill", "#333");
    t1.setAttribute("font-size", "11");
    t1.textContent = "UW";
    lg.appendChild(t1);
    let r2 = document.createElementNS(svgNS, "rect");
    r2.setAttribute("x", 40);
    r2.setAttribute("y", 0);
    r2.setAttribute("width", 14);
    r2.setAttribute("height", 3);
    r2.setAttribute("fill", "#cf1322");
    lg.appendChild(r2);
    let t2 = document.createElementNS(svgNS, "text");
    t2.setAttribute("x", 58);
    t2.setAttribute("y", 5);
    t2.setAttribute("fill", "#333");
    t2.setAttribute("font-size", "11");
    t2.textContent = "W";
    lg.appendChild(t2);
    svg.appendChild(lg);
  }
  function registerMultiYearHost(el) {
    if (el) _multiYearHosts.add(el);
  }
  function renderMultiYearPanel(root) {
    const host = root;
    if (!host) return;
    let mainContainer = host.querySelector("#main-table-container");
    let taskContainer = host.querySelector("#task-panel-container");
    if (mainContainer) mainContainer.innerHTML = buildMultiYearGradeTable();
    if (taskContainer) taskContainer.innerHTML = buildMultiYearChart();
    attachMultiYearGPAEvents();
  }
  function attachMultiYearGPAEvents() {
    document.querySelectorAll(".my-gpa-editable").forEach((el) => {
      if (el.dataset.listenerMyGPA) return;
      el.dataset.listenerMyGPA = "true";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        let grade = el.dataset.grade, sem = el.dataset.sem, type = el.dataset.type;
        let currentVal = parseFloat(el.textContent);
        if (isNaN(currentVal)) currentVal = "";
        let input = document.createElement("input");
        input.type = "number";
        input.value = currentVal;
        input.step = "0.01";
        input.style.cssText = "width:60px;padding:2px;text-align:center;font-size:12px;";
        el.innerHTML = "";
        el.appendChild(input);
        input.focus();
        let save = () => {
          let newVal = input.value.trim();
          let num = null;
          if (newVal !== "") {
            num = parseFloat(newVal);
            if (isNaN(num) || num < 0 || num > 5) num = null;
          }
          onMultiYearGPAChange(grade, sem, type, num);
        };
        input.addEventListener("blur", save);
        input.addEventListener("keypress", (ev) => {
          if (ev.key === "Enter") save();
        });
      });
    });
  }
  function onMultiYearGPAChange(grade, semester, type, newVal) {
    const key = grade + "_" + semester;
    let override = S.multiYearGPAOverrides[key];
    if (!override) {
      override = { uw: null, w: null };
      S.multiYearGPAOverrides[key] = override;
    }
    let entry = S.multiYearEntries.find((e) => e.grade === grade);
    let simGPA = null;
    if (entry) {
      if (semester === "S1F") simGPA = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f);
      else if (semester === "S2F") simGPA = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f);
      else if (semester === "Annual") {
        let s1f = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s1f);
        let s2f = computeColumnGPASummary(entry.simCourses, (c) => c.simGrades.s2f);
        let effS1F = getEffectiveMultiYearGPA(grade, "S1F", s1f);
        let effS2F = getEffectiveMultiYearGPA(grade, "S2F", s2f);
        simGPA = computeAnnualFromSemesters(effS1F, effS2F);
      }
    }
    let simVal = simGPA && type === "uw" ? simGPA.uw : simGPA && type === "w" ? simGPA.w : null;
    if (newVal !== null && simVal !== null && to3SigFigs(newVal) === to3SigFigs(simVal)) {
      override[type] = null;
      if (override.uw === null && override.w === null) delete S.multiYearGPAOverrides[key];
    } else {
      override[type] = newVal;
    }
    renderMultiYearPanel();
    markDirty();
    let gradeLabel = grade || "";
    showOverrideWarning(t("\u5DF2\u66F4\u65B0 " + gradeLabel + " " + semester + " " + type.toUpperCase() + " GPA\u8986\u76D6", "Updated " + gradeLabel + " " + semester + " " + type.toUpperCase() + " GPA override"));
  }
  function setCourseChangeListener(fn) {
    _courseChangeListener = fn;
  }
  function notifyCourseChanged(courseIdx) {
    if (!_courseChangeListener) return;
    try {
      _courseChangeListener(courseIdx);
    } catch (e) {
      console.error("[\u6E32\u67D3] \u8BFE\u7A0B\u53D8\u5316\u76D1\u542C\u5668\u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
    }
  }
  function notifyAllCoursesChanged() {
    if (!_courseChangeListener) return;
    try {
      _courseChangeListener(-1);
    } catch (e) {
      console.error("[\u6E32\u67D3] \u8BFE\u7A0B\u53D8\u5316\u76D1\u542C\u5668\u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
    }
  }
  function refreshAllViews() {
    invalidateTargetGapCache();
    notifyAllCoursesChanged();
    _multiYearHosts.forEach((h) => {
      if (document.contains(h)) safeRenderMultiYear(h);
    });
  }
  function safeRenderMultiYear(h) {
    try {
      renderMultiYearPanel(h);
    } catch (e) {
      console.error("[\u6E32\u67D3] \u591A\u5E74\u7EA7\u89C6\u56FE\u5237\u65B0\u5F02\u5E38\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
    }
  }
  function onTaskScoreChange(courseIdx, taskIdx, newScore) {
    if (!S.isCurrentYear) return;
    let course = S.simCourses[courseIdx];
    if (!course || !course.tasks[taskIdx]) return;
    let task = course.tasks[taskIdx];
    let taskTerm = getTermFromDate(task.endDate, task.termRaw);
    if (taskTerm === "S1" && course.showStar.s1 || taskTerm === "S2" && course.showStar.s2) {
      showOverrideWarning(t("\u8BE5\u79D1\u76EE\u5DF2\u6807\u8BB0\u661F\u6807\uFF0C\u7981\u6B62\u7F16\u8F91\u4EFB\u52A1\u5F97\u5206\u3002\u8BF7\u76F4\u63A5\u4FEE\u6539P\u6216E\u6210\u7EE9\u3002", "Starred subject, task editing disabled. Edit P/E directly."));
      return;
    }
    if (newScore === null || newScore === "") task.simulatedScore = null;
    else {
      let num = parseFloat(newScore);
      if (isNaN(num)) return;
      if (num === -1) task.simulatedScore = -1;
      else if (num >= 0) {
        if (task.topScore !== null && num > task.topScore) num = task.topScore;
        task.simulatedScore = num;
      } else return;
    }
    if (taskTerm === "S1" && course.overrideP.s1 !== null) course.overrideP.s1 = null;
    else if (taskTerm === "S2" && course.overrideP.s2 !== null) course.overrideP.s2 = null;
    recalcCourseTerm(course, "s1");
    recalcCourseTerm(course, "s2");
    markDirty();
    notifyCourseChanged(courseIdx);
  }
  function onExamScoreChange(courseIdx, term, newScore) {
    if (!S.isCurrentYear) return;
    let course = S.simCourses[courseIdx];
    if (!course) return;
    let num = null;
    if (newScore !== null && newScore !== "") {
      num = parseFloat(newScore);
      if (isNaN(num)) return;
      if (num > 100) num = 100;
      if (num < 0) num = 0;
    }
    if (term === "S1") course.simGrades.s1e = num;
    else course.simGrades.s2e = num;
    recalcCourseTerm(course, term === "S1" ? "s1" : "s2");
    markDirty();
    notifyCourseChanged(courseIdx);
  }
  function onPStarChange(courseIdx, term, newScore) {
    if (!S.isCurrentYear) return;
    let course = S.simCourses[courseIdx];
    if (!course) return;
    let num = null;
    if (newScore !== null && newScore !== "") {
      num = parseFloat(newScore);
      if (isNaN(num)) return;
      if (num > 100) num = 100;
      if (num < 0) num = 0;
    }
    if (term === "S1") {
      course.overrideP.s1 = num;
      recalcCourseTerm(course, "s1");
      showOverrideWarning(t(
        course.name + " S1\u5E73\u65F6\u6210\u7EE9\u5DF2\u624B\u52A8\u8BBE\u7F6E\u4E3A " + (num !== null ? formatScorePrecision(num) : "\u2014") + "\uFF0C\u5C06\u5FFD\u7565\u8BE5\u5B66\u671F\u4EFB\u52A1\u8BA1\u7B97",
        course.name + " S1 manual override set to " + (num !== null ? formatScorePrecision(num) : "\u2014")
      ));
    } else {
      course.overrideP.s2 = num;
      recalcCourseTerm(course, "s2");
      showOverrideWarning(t(
        course.name + " S2\u5E73\u65F6\u6210\u7EE9\u5DF2\u624B\u52A8\u8BBE\u7F6E\u4E3A " + (num !== null ? formatScorePrecision(num) : "\u2014") + "\uFF0C\u5C06\u5FFD\u7565\u8BE5\u5B66\u671F\u4EFB\u52A1\u8BA1\u7B97",
        course.name + " S2 manual override set to " + (num !== null ? formatScorePrecision(num) : "\u2014")
      ));
    }
    markDirty();
    notifyCourseChanged(courseIdx);
  }
  function showOverrideWarning(msg) {
    console.log("[\u63D0\u793A] " + msg);
  }
  function resetMultiYearSim() {
    if (!S.multiYearEntries || !S.multiYearEntries.length) return false;
    S.multiYearGPAOverrides = {};
    for (const entry of S.multiYearEntries) {
      const isCurrEntry = entry.yearKey !== null && entry.yearKey !== void 0 && String(entry.yearKey) === String(S.currentYearKey);
      if (isCurrEntry && S.simCourses && S.simCourses.length) continue;
      entry.simCourses = initMultiYearSimCourses(entry.originalCourses);
    }
    for (const [, mc] of S.multiYearCourseMap) {
      for (const [grade, yd] of Object.entries(mc.years)) {
        const entry = S.multiYearEntries[yd.entryIdx];
        const course = entry && entry.simCourses ? entry.simCourses[yd.courseIdx] : null;
        if (!course || !course.simGrades) continue;
        yd.s1fSim = course.simGrades.s1f;
        yd.s2fSim = course.simGrades.s2f;
      }
    }
    _multiYearHosts.forEach((h) => {
      if (document.contains(h)) safeRenderMultiYear(h);
    });
    return true;
  }
  function resetSimulations() {
    const calibCounts = S._autoCalibrateCounts;
    const snapStars = (arr) => (arr || []).map((c) => c && c.showStar ? { s1: !!c.showStar.s1, s2: !!c.showStar.s2 } : null);
    const simStars = snapStars(S.simCourses);
    const origStars = snapStars(S.originalCourses);
    const clearedMultiYear = resetMultiYearSim();
    if (S.isCurrentYear) {
      S.virtualTaskIdCounter = -1;
      initSimCourses();
      const keyStr = String(S.currentYearKey);
      const existingCache = S.yearDataCache.get(keyStr) || {};
      existingCache.originalCourses = S.originalCourses;
      existingCache.simCourses = S.simCourses;
      existingCache.virtualTaskIdCounter = S.virtualTaskIdCounter;
      S.yearDataCache.set(keyStr, existingCache);
      for (let i = 0; i < S.simCourses.length; i++) {
        const orig = S.originalCourses[i];
        syncBaselineToSim(S.simCourses[i], orig);
      }
    } else if (!clearedMultiYear) {
      return;
    }
    if (calibCounts) S._autoCalibrateCounts = calibCounts;
    const putStars = (arr, snap) => (arr || []).forEach((c, i) => {
      if (c && c.showStar && snap[i]) {
        c.showStar.s1 = snap[i].s1;
        c.showStar.s2 = snap[i].s2;
      }
    });
    putStars(S.simCourses, simStars);
    putStars(S.originalCourses, origStars);
    if (S.warningTimeout) clearTimeout(S.warningTimeout);
    flushSave(true);
    notifyAllCoursesChanged();
  }
  function refreshSubjectDetailWindows() {
    for (const win of listWindows()) {
      if (win.kind !== DETAIL_KIND) continue;
      const fn = _detailRenders.get(win.key);
      if (!fn) continue;
      try {
        fn();
      } catch (e) {
        console.error("[\u660E\u7EC6] \u91CD\u753B\u5931\u8D25\uFF08\u5DF2\u9694\u79BB\uFF09:", e);
      }
    }
  }
  function _detailTitleHTML(course, filterText) {
    return "<div>" + t("\u79D1\u76EE\u660E\u7EC6\u6A21\u62DF", "Subject Detail Simulation") + helpIcon(
      '\u7F16\u8F91\u5404\u7C7B\u578B\u7D2F\u8BA1\u5F97\u5206\u6A21\u62DF\u5E73\u65F6\u6210\u7EE9\u53D8\u5316\u3002\n\u70B9\u51FB"\u5173\u95ED\u5E76\u5E94\u7528"\u65F6\u5C06\u5DEE\u503C\u5199\u5165\u4E3B\u8868\u683C\u7684P\u5217\u8986\u76D6\u3002\n\u5B66\u671F\u7B5B\u9009\u4E0E\u6210\u7EE9\u518C\u9875\u9762\u4E00\u81F4\u3002',
      'Edit category totals to simulate P score changes. \n Click "Close & Apply" to write differences to the main table P column. \n The semester filter matches the one on the grade book page.',
      true
    ) + '</div><div style="color:rgba(0,0,0,0.55);font-size:11px;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(course.name) + '<span style="margin-left:8px;">' + t("\u5B66\u671F\u7B5B\u9009: ", "Semester filter: ") + escapeHtml(filterText) + "</span></div>";
  }
  function showSubjectDetailModal(courseIdx, anchorEl) {
    if (!S.isCurrentYear) return;
    const course0 = S.simCourses[courseIdx];
    if (!course0) {
      console.warn("[\u660E\u7EC6] \u8BFE\u7A0B\u4E0B\u6807 " + courseIdx + " \u4E0D\u5B58\u5728");
      return;
    }
    const ident = courseIdent(course0);
    const key = DETAIL_KIND + ":" + ident;
    const filter = S.currentFilter;
    if (getWindow(key)) {
      raiseWindow(key);
      if (anchorEl) setWindowAnchor(key, anchorEl);
      refreshSubjectDetailWindows();
      return;
    }
    const editorWin = getWindow("editor:" + ident);
    const anchor = anchorEl || editorWin && editorWin.anchorEl || null;
    const filterText = filter === "s1" ? t("\u4EC5S1", "S1 only") : filter === "s2" ? t("\u4EC5S2", "S2 only") : t("\u5168\u90E8\u5B66\u671F", "All semesters");
    const handle = openWindow({
      key,
      kind: DETAIL_KIND,
      domId: "ints-subject-detail-" + courseIdx,
      anchorEl: anchor,
      width: 560,
      // 两个学期的卡片叠起来可能很高：内容区按**表格滚动容器的高度**限高（超出就在窗口内滚动），
      // 免得窗口高过容器、被裁掉一截看不到页脚
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
    handle.el.setAttribute("data-ie-ident", ident);
    handle.el.setAttribute("data-ie-ci", String(courseIdx));
    const st = { course: null, ci: courseIdx, termData: null, edits: { S1: {}, S2: {} } };
    function syncState() {
      const i = S.simCourses.findIndex((c) => courseIdent(c) === ident);
      if (i < 0) return false;
      st.ci = i;
      st.course = S.simCourses[i];
      const course = st.course;
      const termData = {
        S1: { origScores: Array(5).fill(0), simScores: Array(5).fill(0), maxScores: Array(5).fill(0), origP: course.originalGrades.s1p, overridden: (course.overrideP || {}).s1 !== null && (course.overrideP || {}).s1 !== void 0 },
        S2: { origScores: Array(5).fill(0), simScores: Array(5).fill(0), maxScores: Array(5).fill(0), origP: course.originalGrades.s2p, overridden: (course.overrideP || {}).s2 !== null && (course.overrideP || {}).s2 !== void 0 }
      };
      for (const term of ["S1", "S2"]) {
        const origAgg = aggregateCategoriesFromTasks(course.tasks, term, false);
        const simAgg = aggregateCategoriesFromTasks(course.tasks, term, true);
        for (let i2 = 0; i2 < 5; i2++) {
          termData[term].origScores[i2] = origAgg[i2].score;
          termData[term].simScores[i2] = simAgg[i2].score;
          termData[term].maxScores[i2] = Math.max(origAgg[i2].max, simAgg[i2].max);
        }
        const mine = st.edits[term];
        for (const k in mine) {
          const idx = parseInt(k, 10);
          if (!isNaN(idx) && termData[term].simScores[idx] !== void 0) termData[term].simScores[idx] = mine[k];
        }
      }
      st.termData = termData;
      return true;
    }
    function computePStar(term) {
      const catData = [];
      for (let i = 0; i < 5; i++) catData.push({ score: st.termData[term].simScores[i], max: st.termData[term].maxScores[i] });
      return calcPFromCategoryData(catData, st.course.subject || st.course.name);
    }
    function render() {
      if (!syncState()) {
        handle.setBody('<div class="iw-err">' + escapeHtml(t("\u8BE5\u8BFE\u7A0B\u5DF2\u4E0D\u5728\u5F53\u524D\u5B66\u5E74\uFF0C\u7A97\u53E3\u4E0D\u518D\u53EF\u7528\u3002", "This course is no longer in the current year.")) + "</div>");
        return;
      }
      const course = st.course;
      const termData = st.termData;
      const weights = getCourseWeights(course.subject || course.name);
      const showStar = course.showStar || { s1: false, s2: false };
      const termsToShow = filter === "all" ? ["S1", "S2"] : filter === "s1" ? ["S1"] : ["S2"];
      let html = "";
      for (const term of termsToShow) {
        const tData = termData[term];
        const hasAnyData = tData.maxScores.some((s) => s > 0) || tData.origP !== null;
        if (!hasAnyData) continue;
        const pStar = computePStar(term);
        const origP = tData.origP;
        const pDiff = pStar !== null && origP !== null ? pStar - origP : null;
        const pGPA = getGPAForScore(pStar, course.weightBonus);
        const origPGPA = getGPAForScore(origP, course.weightBonus);
        const isOverridden = tData.overridden;
        const isStarred = term === "S1" && showStar.s1 || term === "S2" && showStar.s2;
        const canEdit = !isOverridden && !isStarred;
        html += '<div class="iw-card"><div class="iw-card-head">' + term + " " + t("\u5B66\u671F", "Semester") + helpIcon(
          "\u663E\u793A\u8BE5\u5B66\u671F\u5404\u4EFB\u52A1\u7C7B\u578B\u5F53\u524D\u7684\u7D2F\u8BA1\u5F97\u5206\u4E0E\u603B\u5206\u3002\n\u6709\u6A21\u62DF\u65F6\u6309\u65B9\u5411\u7740\u8272\u5E76\u5728\u62EC\u53F7\u91CC\u7ED9\u51FA\u53D8\u5316\u91CF\uFF0C\u9F20\u6807\u60AC\u505C\u53EF\u770B\u539F\u59CB\u503C\u3002\n\u70B9\u51FB\u6570\u503C\u53EF\u7F16\u8F91\u5BF9\u5E94\u7C7B\u578B\u7684\u7D2F\u8BA1\u5F97\u5206\uFF0C\u5173\u95ED\u672C\u7A97\u53E3\u65F6\u5C06\u5DEE\u503C\u5199\u5165\u4E3B\u8868\u683CP\u5217\u8986\u76D6\u3002",
          "Shows the current cumulative scores and totals for each task type in this semester. \n Simulated values are colored by direction with the change in brackets; hover to see the original. \n Click a value to edit that category total; closing this dialog writes the difference to the main table P column override.",
          true
        ) + (isStarred ? ' <span style="color:#d4380d;">\u26A0\uFE0F ' + t("\u661F\u6807\u79D1\u76EE\uFF0C\u660E\u7EC6\u6A21\u62DF\u5DF2\u7981\u7528", "Starred subject, detail simulation disabled") + "</span>" : "") + '</div><table class="iw-table"><thead><tr><th>' + t("\u4EFB\u52A1\u7C7B\u578B", "Task Type") + "</th><th>" + t("\u7D2F\u8BA1/\u603B\u5206 (\u767E\u5206\u6BD4)", "Total/Max (Percent)") + "</th></tr></thead><tbody>";
        for (let i = 0; i < TYPE_NAMES.length; i++) {
          if (weights[i] <= 0) continue;
          const maxScore = tData.maxScores[i];
          const origScore = tData.origScores[i];
          const simScore = tData.simScores[i];
          const label = escapeHtml(TYPE_NAMES[i]);
          if (!(maxScore > 0)) {
            html += "<tr><td>" + label + '</td><td class="iw-num"><span class="iw-locked">' + t("\u65E0\u6570\u636E", "No data") + "</span></td></tr>";
            continue;
          }
          const d = typeof simScore === "number" && typeof origScore === "number" ? simScore - origScore : 0;
          const changed = Math.abs(d) >= DETAIL_DELTA_EPS;
          const pct = (simScore / maxScore * 100).toFixed(2);
          const origPct = (origScore / maxScore * 100).toFixed(2);
          const valueHtml = escapeHtml(simScore + "/" + maxScore) + (changed ? ' <span style="font-size:11px;">(' + (d > 0 ? "+" : "") + d.toFixed(2) + ")</span>" : "");
          const styleAttr = changed ? ' style="color:' + (d > 0 ? DETAIL_COLOR_UP : DETAIL_COLOR_DOWN) + ';"' : "";
          const titleAttr = ' title="' + escapeHtml(t("\u539F\u59CB ", "was ") + origScore + "/" + maxScore + " (" + origPct + "%)") + '"';
          html += "<tr><td>" + label + '</td><td class="iw-num">' + (canEdit ? '<span class="iw-sim-cell"' + styleAttr + titleAttr + ' data-detail-edit="' + i + '" data-detail-term="' + term + '" data-detail-max="' + maxScore + '">' + valueHtml + "</span>" : '<span class="iw-locked"' + titleAttr + ">" + valueHtml + "</span>") + ' <span class="iw-note">' + pct + "%</span></td></tr>";
        }
        const pStarGPAstr = pGPA ? formatGPA(pGPA) : "\u2014";
        const origPGPAstr = origPGPA ? formatGPA(origPGPA) : "\u2014";
        let deltaStr = "";
        if (pDiff !== null && pGPA && origPGPA) {
          deltaStr = "\u0394 UW: " + formatDiff(pGPA.uw - origPGPA.uw) + "  \u0394 W: " + formatDiff(pGPA.w - origPGPA.w);
        }
        const pShown = pStar !== null ? pStar : origP;
        const pChanged = pDiff !== null && Math.abs(pDiff) >= DETAIL_DELTA_EPS;
        const pValHtml = (pShown === null ? "\u2014" : pShown.toFixed(2)) + (pChanged ? ' <span style="font-size:11px;">(' + (pDiff > 0 ? "+" : "") + pDiff.toFixed(2) + ")</span>" : "");
        const pTitle = escapeHtml(t("\u539F\u59CB ", "was ") + (origP === null ? "\u2014" : origP.toFixed(2)) + " \xB7 " + origPGPAstr);
        html += '<tr class="iw-prow"><td>' + t("\u5E73\u65F6\u6210\u7EE9 (P)", "Performance (P)") + '</td><td class="iw-num"><span' + (pChanged ? ' style="color:' + (pDiff > 0 ? DETAIL_COLOR_UP : DETAIL_COLOR_DOWN) + ';"' : "") + ' title="' + pTitle + '">' + pValHtml + '</span><br><span class="iw-note">' + escapeHtml(pStarGPAstr) + "</span>" + (deltaStr ? '<div class="iw-note" style="font-size:11px;">' + deltaStr + "</div>" : "") + "</td></tr>";
        html += "</tbody></table>";
        if (isOverridden) html += '<div class="iw-warn">' + t("\u26A0\uFE0F \u8BE5\u5B66\u671F\u5DF2\u5728\u4E3B\u8868\u683C\u624B\u52A8\u8BBE\u7F6E\u5E73\u65F6\u6210\u7EE9\uFF0C\u672C\u5904\u7F16\u8F91\u5DF2\u7981\u7528\u3002", "\u26A0\uFE0F Manual override exists for this semester, editing disabled.") + "</div>";
        if (isStarred && !isOverridden) html += '<div class="iw-warn">' + t("\u26A0\uFE0F \u8BE5\u79D1\u76EE\u5DF2\u6807\u8BB0\u661F\u6807\uFF0C\u660E\u7EC6\u6A21\u62DF\u7F16\u8F91\u5DF2\u7981\u7528\u3002\u8BF7\u76F4\u63A5\u5728\u4E3B\u8868\u683C\u7F16\u8F91P/E\u3002", "\u26A0\uFE0F Starred subject, detail simulation disabled. Edit P/E in main table.") + "</div>";
        html += "</div>";
      }
      if (!html) html = '<div class="iw-note">' + t("\u8BE5\u7B5B\u9009\u4E0B\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6570\u636E\u3002", "No data to show for this filter.") + "</div>";
      handle.setBody(html);
    }
    function closeAndApply() {
      if (!syncState()) {
        closeWindow(key);
        return;
      }
      const course = st.course;
      const termData = st.termData;
      const showStar = course.showStar || { s1: false, s2: false };
      for (const term of ["S1", "S2"]) {
        const tData = termData[term];
        if (tData.overridden) continue;
        const isStarred = term === "S1" && showStar.s1 || term === "S2" && showStar.s2;
        if (isStarred) continue;
        const newPStar = computePStar(term);
        const origP = tData.origP;
        let shouldSet = false;
        if (newPStar !== null) {
          if (origP === null || Math.abs(newPStar - origP) > 1e-3) shouldSet = true;
        } else if (origP !== null) shouldSet = true;
        if (shouldSet) {
          if (term === "S1") {
            if (course.overrideP.s1 !== newPStar) course.overrideP.s1 = newPStar;
          } else {
            if (course.overrideP.s2 !== newPStar) course.overrideP.s2 = newPStar;
          }
        } else {
          if (term === "S1" && course.overrideP.s1 !== null) course.overrideP.s1 = null;
          if (term === "S2" && course.overrideP.s2 !== null) course.overrideP.s2 = null;
        }
      }
      recalcCourseTerm(course, "s1");
      recalcCourseTerm(course, "s2");
      markDirty();
      notifyCourseChanged(st.ci);
      showOverrideWarning(t(`\u5DF2\u5E94\u7528\u79D1\u76EE"${course.name}"\u7684\u5B50\u9762\u677F\u6A21\u62DF\uFF08\u5E73\u65F6\u6210\u7EE9\u8986\u76D6\uFF09`, `Applied subject "${course.name}" simulation from detail panel`));
      closeWindow(key);
    }
    const applyBtn = handle.foot && handle.foot.querySelector('[data-detail-act="apply"]');
    if (applyBtn) applyBtn.addEventListener("click", guardListener("\u660E\u7EC6\u5173\u95ED\u5E76\u5E94\u7528", () => safe("\u660E\u7EC6\u5E94\u7528", closeAndApply)));
    handle.body.addEventListener("click", guardListener("\u660E\u7EC6\u6539\u6A21\u62DF\u503C", (e) => {
      const cell = e.target && e.target.closest ? e.target.closest("[data-detail-edit]") : null;
      if (!cell || !st.termData) return;
      e.stopPropagation();
      const term = cell.getAttribute("data-detail-term");
      const catIdx = parseInt(cell.getAttribute("data-detail-edit"), 10);
      const maxScore = parseFloat(cell.getAttribute("data-detail-max"));
      if (!(maxScore > 0) || isNaN(catIdx)) return;
      const tData = st.termData[term];
      if (!tData || tData.overridden) return;
      const showStar = st.course && st.course.showStar || { s1: false, s2: false };
      if (term === "S1" && showStar.s1 || term === "S2" && showStar.s2) return;
      const cur = tData.simScores[catIdx];
      cell.innerHTML = "";
      const input = document.createElement("input");
      input.type = "number";
      input.className = "iw-input";
      input.value = cur === null || cur === void 0 ? "" : String(cur);
      cell.appendChild(input);
      try {
        input.focus();
        input.select();
      } catch (err) {
      }
      let done = false;
      const save = () => {
        if (done) return;
        done = true;
        const num = parseFloat(input.value);
        if (!isNaN(num)) {
          const v = Math.min(Math.max(num, 0), maxScore);
          tData.simScores[catIdx] = v;
          st.edits[term][catIdx] = v;
        }
        render();
      };
      input.addEventListener("blur", guardListener("\u660E\u7EC6\u6A21\u62DF\u63D0\u4EA4", save));
      input.addEventListener("keydown", guardListener("\u660E\u7EC6\u6A21\u62DF\u952E\u76D8", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          save();
        } else if (ev.key === "Escape") {
          done = true;
          render();
        }
      }));
    }));
    _detailRenders.set(key, render);
    try {
      render();
    } catch (e) {
      const msg = t("\u6E32\u67D3\u5931\u8D25\uFF1A", "Render failed: ") + (e && e.message || e);
      handle.setBody('<div class="iw-err">' + escapeHtml(msg) + "</div>");
      console.error("[\u660E\u7EC6] \u6E32\u67D3\u5931\u8D25:", e);
      recordError("\u79D1\u76EE\u660E\u7EC6\u6E32\u67D3", e);
    }
  }
  var _multiYearHosts, _courseChangeListener, DETAIL_KIND, _detailRenders, DETAIL_COLOR_UP, DETAIL_COLOR_DOWN, DETAIL_DELTA_EPS;
  var init_ui = __esm({
    "v8.30/ui.js"() {
      init_state();
      init_utils();
      init_gpa_target();
      init_simulation();
      init_diagnose();
      init_win_shell();
      _multiYearHosts = /* @__PURE__ */ new Set();
      _courseChangeListener = null;
      DETAIL_KIND = "detail";
      _detailRenders = /* @__PURE__ */ new Map();
      DETAIL_COLOR_UP = "#52c41a";
      DETAIL_COLOR_DOWN = "#d4380d";
      DETAIL_DELTA_EPS = 5e-3;
    }
  });

  // v8.30/simulation.js
  function recalcPFromTasks(course, term) {
    let tasksForCalc = course.tasks.map((t2) => ({
      score: t2.simulatedScore !== void 0 ? t2.simulatedScore : t2.originalScore,
      topScore: t2.topScore,
      typeName: t2.typeName,
      endDate: t2.endDate,
      termRaw: t2.termRaw
    }));
    return calculateTermAverageByCategory(tasksForCalc, course.subject || course.name, term);
  }
  function initSimCourses() {
    S.virtualTaskIdCounter = -1;
    S._simGen = (S._simGen || 0) + 1;
    S.simCourses.length = 0;
    S.simCourses.push(...S.originalCourses.map((course) => ({
      name: course.name,
      courseId: course.courseId,
      credit: course.credit,
      weightBonus: course.weightBonus,
      subject: course.subject || null,
      // ⚠ `originalGrades` 必须是**同一份对象**，不能是快照拷贝：校准会把基线改写成新值
      //    （`syncOriginalToSim` 与"星标解除"那一步写的都是 `S.originalCourses[i].originalGrades`），
      //    而成绩格的 Δ 基线读的是**模拟课程上的这一份**。拷贝一份的话，校准改了权威基线、
      //    成绩格却还在跟旧值比 ⇒ 什么都没模拟也会多出一个伪 Δ（学年 GPA 那处读的是
      //    `S.originalCourses`；两份口径不一致时，同一页上会出现"科目有 Δ 而年鉴没有"）。
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
      tasks: course.tasks.map((t2) => __spreadProps(__spreadValues({}, t2), { originalScore: t2.score, simulatedScore: t2.excluded ? -1 : t2.score }))
    })));
    for (let c of S.simCourses) {
      if (!c.showStar.s1) c.simGrades.s1p = c.overrideP.s1 !== null ? c.overrideP.s1 : recalcPFromTasks(c, "S1");
      else c.simGrades.s1p = c.overrideP.s1 !== null ? c.overrideP.s1 : c.originalGrades.s1p;
      if (!c.showStar.s2) c.simGrades.s2p = c.overrideP.s2 !== null ? c.overrideP.s2 : recalcPFromTasks(c, "S2");
      else c.simGrades.s2p = c.overrideP.s2 !== null ? c.overrideP.s2 : c.originalGrades.s2p;
      c.simGrades.s1f = calcF(c.simGrades.s1p, c.simGrades.s1e);
      c.simGrades.s2f = calcF(c.simGrades.s2p, c.simGrades.s2e);
    }
  }
  function initReadOnlyCourses() {
    S.virtualTaskIdCounter = -1;
    S._simGen = (S._simGen || 0) + 1;
    S.simCourses.length = 0;
    S.simCourses.push(...S.originalCourses.map((course) => ({
      name: course.name,
      courseId: course.courseId,
      credit: course.credit,
      weightBonus: course.weightBonus,
      subject: course.subject || null,
      originalGrades: course.originalGrades,
      showStar: { s1: false, s2: false },
      overrideP: { s1: null, s2: null },
      simGrades: __spreadValues({}, course.originalGrades),
      tasks: []
    })));
  }
  function recalcCourseTerm(course, term) {
    let isOverride = term === "s1" && course.overrideP.s1 !== null || term === "s2" && course.overrideP.s2 !== null;
    let isStar = term === "s1" && course.showStar.s1 || term === "s2" && course.showStar.s2;
    if (term === "s1") {
      if (isOverride) course.simGrades.s1p = course.overrideP.s1;
      else if (isStar) course.simGrades.s1p = course.originalGrades.s1p;
      else course.simGrades.s1p = recalcPFromTasks(course, "S1");
      course.simGrades.s1f = calcF(course.simGrades.s1p, course.simGrades.s1e);
    } else {
      if (isOverride) course.simGrades.s2p = course.overrideP.s2;
      else if (isStar) course.simGrades.s2p = course.originalGrades.s2p;
      else course.simGrades.s2p = recalcPFromTasks(course, "S2");
      course.simGrades.s2f = calcF(course.simGrades.s2p, course.simGrades.s2e);
    }
  }
  function syncOriginalToSim(course, origCourse) {
    origCourse.originalGrades.s1p = course.simGrades.s1p;
    origCourse.originalGrades.s1f = course.simGrades.s1f;
    origCourse.originalGrades.s2p = course.simGrades.s2p;
    origCourse.originalGrades.s2f = course.simGrades.s2f;
  }
  function syncBaselineToSim(course, origCourse) {
    if (!course || !origCourse) return;
    course.simGrades = __spreadValues({}, origCourse.originalGrades);
  }
  function applyUserLayer(yearKey) {
    const layer = S.userSimCache.get(String(yearKey));
    if (!layer || !Array.isArray(layer.c) || !layer.c.length) return 0;
    if (!S.simCourses || !S.simCourses.length) return 0;
    let applied = 0;
    for (const uc of layer.c) {
      let idx = -1;
      if (uc.ci !== void 0 && uc.ci !== null) {
        idx = S.simCourses.findIndex((c) => c.courseId !== void 0 && c.courseId !== null && String(c.courseId) === String(uc.ci));
      }
      if (idx < 0 && uc.n) idx = S.simCourses.findIndex((c) => c.name === uc.n);
      if (idx < 0) continue;
      const course = S.simCourses[idx];
      const orig = S.originalCourses[idx];
      if (uc.e && course.simGrades) {
        if (uc.e.s1e !== void 0) course.simGrades.s1e = uc.e.s1e;
        if (uc.e.s2e !== void 0) course.simGrades.s2e = uc.e.s2e;
      }
      if (uc.op) {
        course.overrideP = { s1: uc.op.s1 === void 0 ? null : uc.op.s1, s2: uc.op.s2 === void 0 ? null : uc.op.s2 };
      }
      for (const te of uc.te || []) {
        const task = course.tasks.find((t2) => String(t2.entityId) === String(te.e));
        if (task) task.simulatedScore = te.m;
        if (te.m === -1 && orig) {
          const oTask = (orig.tasks || []).find((t2) => String(t2.entityId) === String(te.e));
          if (oTask) oTask.excluded = true;
        }
      }
      for (const vt of uc.vt || []) {
        const entityId = parseInt(vt.e, 10);
        if (!entityId) continue;
        if (course.tasks.some((t2) => t2.entityId === entityId)) continue;
        course.tasks.push(_deserTask(vt));
      }
      course.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
      recalcCourseTerm(course, "s1");
      recalcCourseTerm(course, "s2");
      applied++;
    }
    if (applied) {
      let minId = -1;
      for (const c of S.simCourses) {
        for (const t2 of c.tasks || []) {
          if (t2.isVirtual && t2.entityId < minId) minId = t2.entityId;
        }
      }
      const saved = layer.vt === void 0 || layer.vt === null ? -1 : layer.vt;
      S.virtualTaskIdCounter = Math.min(saved, minId - 1);
      markDirty();
      console.log(`[\u6301\u4E45\u5316] \u5DF2\u628A\u7528\u6237\u5C42\u8D34\u56DE ${applied} \u95E8\u8BFE\u7A0B\uFF08\u865A\u62DF\u4EFB\u52A1 / \u6539\u5206 / \u624B\u52A8 P\xB7E / \u661F\u6807\uFF09`);
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
    const gen = S._simGen || 0;
    let course = S.simCourses[courseIdx];
    if (!course) return { changed: false, failCount: 0, addedCount: 0, stale: true };
    const calibYearKey = S.simYearKey !== null ? S.simYearKey : S.currentYearKey;
    const fullTasks = await fetchAllTasksForCourse(course.courseId, calibYearKey, signal);
    if (_simGenChanged(gen)) return { changed: false, failCount: 0, addedCount: 0, stale: true };
    course = S.simCourses[courseIdx];
    if (!course) return { changed: false, failCount: 0, addedCount: 0, stale: true };
    const existingTaskMap = new Map(course.tasks.map((t2) => [t2.entityId, t2]));
    const origCourse = S.originalCourses[courseIdx];
    if (origCourse) {
      origCourse.tasks = origCourse.tasks || [];
    }
    let addedCount = 0;
    for (let newTask of fullTasks) {
      const entityId = parseInt(newTask.entityId, 10);
      if (!entityId) continue;
      if (String(newTask.type) !== "1001") continue;
      if (!existingTaskMap.has(entityId)) {
        const taskObj = {
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
          isVirtual: false
        };
        course.tasks.push(taskObj);
        if (origCourse) {
          origCourse.tasks.push(__spreadProps(__spreadValues({}, taskObj), { excluded: false }));
        }
        addedCount++;
      }
    }
    course.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
    const realTaskIndices = [], realEntityIds = [];
    for (let i = 0; i < course.tasks.length; i++) {
      if (!course.tasks[i].isVirtual) {
        realTaskIndices.push(i);
        realEntityIds.push(course.tasks[i].entityId);
      }
    }
    let failCount = 0, changed = false;
    if (realEntityIds.length > 0) {
      const inTotals = await promiseLimit(
        realEntityIds.map((id) => fetchTaskDetail(id, signal).catch((e) => {
          console.warn(`[\u6821\u51C6] \u83B7\u53D6\u4EFB\u52A1\u8BE6\u60C5\u5931\u8D25 entityId=${id}: ${e.message}`);
          return null;
        })),
        5
      );
      if (_simGenChanged(gen)) return { changed: false, failCount: 0, addedCount: 0, stale: true };
      course = S.simCourses[courseIdx];
      if (!course) return { changed: false, failCount: 0, addedCount: 0, stale: true };
      for (let j = 0; j < realTaskIndices.length; j++) {
        const ti = realTaskIndices[j];
        if (!course.tasks[ti]) continue;
        if (inTotals[j] === null) {
          failCount++;
          continue;
        }
        if (inTotals[j] === false) {
          const entityId = course.tasks[ti].entityId;
          markCalibrationExcluded(calibYearKey, entityId);
          if (course.tasks[ti].simulatedScore !== -1) {
            course.tasks[ti].simulatedScore = -1;
            changed = true;
            const oc = S.originalCourses[courseIdx];
            if (oc) {
              const origTask = (oc.tasks || []).find((t2) => t2.entityId === entityId);
              if (origTask) origTask.excluded = true;
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
      return true;
    }
  }
  async function autoCalibrateStarredCourses() {
    if (!S.isCurrentYear || S.isMultiYearMode) return;
    if (S.isCalibrating) {
      console.log("[\u81EA\u52A8\u6821\u51C6] \u624B\u52A8\u6821\u51C6\u8FDB\u884C\u4E2D\uFF0C\u8DF3\u8FC7\u672C\u6B21\u81EA\u52A8\u6821\u51C6");
      return;
    }
    if (_autoCalibrateRunning) {
      console.log("[\u81EA\u52A8\u6821\u51C6] \u4E0A\u4E00\u8F6E\u5C1A\u672A\u7ED3\u675F\uFF0C\u8DF3\u8FC7\u672C\u6B21");
      return;
    }
    if (!_autoCalibrateEnabled()) {
      console.log("[\u81EA\u52A8\u6821\u51C6] \u5DF2\u6309\u8BBE\u7F6E\u5173\u95ED\uFF08ints_auto_calibrate=0\uFF09");
      return;
    }
    const candidates = [];
    for (let i = 0; i < S.simCourses.length; i++) {
      const c = S.simCourses[i];
      if (!c || !(c.showStar && c.showStar.s1 || c.showStar && c.showStar.s2)) continue;
      if (!c.courseId) continue;
      const key = String(c.courseId);
      const used = S._autoCalibrateCounts.get(key) || 0;
      if (used >= AUTO_CALIBRATE_PER_COURSE_MAX) continue;
      S._autoCalibrateCounts.set(key, used + 1);
      candidates.push(i);
    }
    if (!candidates.length) return;
    const targets = candidates.slice(0, AUTO_CALIBRATE_MAX);
    const deferred = candidates.length - targets.length;
    console.log(`[\u81EA\u52A8\u6821\u51C6] \u661F\u6807\u8BFE\u7A0B ${candidates.length} \u95E8\uFF0C\u672C\u6B21\u6821\u51C6 ${targets.length} \u95E8` + (deferred ? `\uFF08${deferred} \u95E8\u7559\u5F85\u624B\u52A8\u6821\u51C6\uFF09` : "") + ": " + targets.map((i) => S.simCourses[i].name).join(" | "));
    _autoCalibrateRunning = true;
    await new Promise((r) => setTimeout(r, AUTO_CALIBRATE_DELAY_MS));
    if (!_autoCalibrateEnabled()) {
      _autoCalibrateRunning = false;
      console.log("[\u81EA\u52A8\u6821\u51C6] \u5DF2\u6309\u8BBE\u7F6E\u5173\u95ED\uFF0C\u653E\u5F03\u672C\u8F6E");
      return;
    }
    const navGen = S._navGeneration;
    const simGen = S._simGen || 0;
    S.isCalibrating = true;
    const ac = new AbortController();
    S.calibrateAbortController = ac;
    const signal = ac.signal;
    let okCount = 0, failCount = 0, starCleared = 0, starKept = 0;
    try {
      for (const ci of targets) {
        if (S._navGeneration !== navGen) {
          console.log("[\u81EA\u52A8\u6821\u51C6] \u5B66\u5E74\u5DF2\u5207\u6362\uFF0C\u4E2D\u65AD");
          break;
        }
        if (_simGenChanged(simGen)) {
          console.log("[\u81EA\u52A8\u6821\u51C6] \u6A21\u62DF\u6570\u636E\u5DF2\u91CD\u7F6E\uFF0C\u4E2D\u65AD\u672C\u8F6E");
          break;
        }
        let course = S.simCourses[ci];
        let orig = S.originalCourses[ci];
        try {
          const res = await runCalibrationCore(ci, signal);
          if (res.stale || _simGenChanged(simGen)) {
            console.log("[\u81EA\u52A8\u6821\u51C6] \u6A21\u62DF\u6570\u636E\u5DF2\u91CD\u7F6E\uFF0C\u653E\u5F03\u672C\u8F6E\u6821\u51C6\u7ED3\u679C");
            break;
          }
          course = S.simCourses[ci];
          orig = S.originalCourses[ci];
          if (!course) break;
          okCount++;
          if (course.showStar && orig) {
            orig.showStar = orig.showStar || { s1: false, s2: false };
            for (const term of ["S1", "S2"]) {
              const starKey = term === "S1" ? "s1" : "s2";
              const pKey = term === "S1" ? "s1p" : "s2p";
              if (!course.showStar[starKey]) continue;
              const mapped = course.tasks.map((t2) => ({
                score: t2.simulatedScore !== void 0 ? t2.simulatedScore : t2.originalScore,
                topScore: t2.topScore,
                typeName: t2.typeName,
                endDate: t2.endDate,
                termRaw: t2.termRaw
              }));
              const newP = calculateTermAverageByCategory(mapped, course.subject || course.name, term);
              const apiP = orig.originalGrades[pKey];
              if (newP !== null && apiP !== null && Math.abs(alignToSchoolPrecision(newP, apiP) - apiP) <= 0.1) {
                course.showStar[starKey] = false;
                orig.showStar[starKey] = false;
                orig.originalGrades[pKey] = newP;
                starCleared++;
                console.log(`[\u81EA\u52A8\u6821\u51C6] ${course.name} ${term} \u661F\u6807\u89E3\u9664: \u8BA1\u7B97\u503C=${newP.toFixed(2)} \u7CFB\u7EDF\u503C=${apiP}`);
              } else {
                starKept++;
                console.warn(`[\u81EA\u52A8\u6821\u51C6] ${course.name} ${term} \u661F\u6807\u4FDD\u7559: \u8BA1\u7B97\u503C=${newP === null ? "null" : newP.toFixed(2)} \u7CFB\u7EDF\u503C=${apiP}`);
              }
            }
          }
          recalcCourseTerm(course, "s1");
          recalcCourseTerm(course, "s2");
          if (orig) syncOriginalToSim(course, orig);
        } catch (e) {
          if (e && e.name === "AbortError") {
            console.log("[\u81EA\u52A8\u6821\u51C6] \u8BF7\u6C42\u5DF2\u4E2D\u65AD");
            break;
          }
          console.error(`[\u81EA\u52A8\u6821\u51C6] ${course.name} \u6821\u51C6\u5931\u8D25: ${e.message}`, e);
          failCount++;
        }
      }
    } finally {
      S.isCalibrating = false;
      S.calibrateAbortController = null;
      _autoCalibrateRunning = false;
    }
    if (S._navGeneration !== navGen) return;
    refreshAllViews();
    markDirty();
    const parts = [];
    if (okCount) parts.push(t(`${okCount} \u95E8\u5DF2\u6821\u51C6`, `${okCount} calibrated`));
    if (starCleared) parts.push(t(`${starCleared} \u5904\u661F\u6807\u5DF2\u89E3\u9664`, `${starCleared} star(s) cleared`));
    if (starKept) parts.push(t(`${starKept} \u5904\u661F\u6807\u4FDD\u7559`, `${starKept} star(s) kept`));
    if (failCount) parts.push(t(`${failCount} \u95E8\u5931\u8D25`, `${failCount} failed`));
    if (deferred) parts.push(t(`\u53E6\u6709 ${deferred} \u95E8\u7559\u5F85\u4E0B\u6B21\uFF08\u672C\u6B21\u4F1A\u8BDD\u5DF2\u8FBE\u4E0A\u9650\uFF09`, `${deferred} more deferred to next session`));
    if (parts.length) console.log("[\u81EA\u52A8\u6821\u51C6] " + parts.join("\uFF0C"));
  }
  function showVirtualTaskModal(preselectedCourseIdx, onAdded) {
    if (!S.isCurrentYear || S.activeSubModal) return;
    S.activeSubModal = true;
    const TYPE_KEYS = ["homework", "inclass", "project", "test", "quiz"];
    function getDefaultSemester() {
      if (S.currentFilter === "s1") return "S1";
      if (S.currentFilter === "s2") return "S2";
      return "S1";
    }
    function getDefaultDateForSemester(semester) {
      const yearMatch = S.currentYearValue ? S.currentYearValue.match(/(\d{4})/) : null;
      const firstYear = yearMatch ? parseInt(yearMatch[1]) : (/* @__PURE__ */ new Date()).getFullYear();
      if (semester === "S1") return `${firstYear}-10-15`;
      else return `${firstYear + 1}-04-15`;
    }
    let modalDiv = document.createElement("div");
    modalDiv.className = "virtual-task-modal";
    modalDiv.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:20020;display:flex;align-items:center;justify-content:center;";
    const courses = S.isCurrentYear ? S.simCourses : S.originalCourses;
    let subjectOptions = "";
    for (let i = 0; i < courses.length; i++) {
      const sel = preselectedCourseIdx !== null && i === preselectedCourseIdx ? " selected" : "";
      subjectOptions += `<option value="${i}"${sel}>${escapeHtml(courses[i].name)}</option>`;
    }
    let typeOptions = "";
    for (let i = 0; i < TYPE_NAMES.length; i++) {
      typeOptions += `<option value="${i}">${t(TYPE_NAMES[i], TYPE_NAMES[i])}</option>`;
    }
    let defaultSem = getDefaultSemester();
    let semOptions = `<option value="S1"${defaultSem === "S1" ? " selected" : ""}>${t("\u7B2C\u4E00\u5B66\u671F (S1)", "Semester 1 (S1)")}</option><option value="S2"${defaultSem === "S2" ? " selected" : ""}>${t("\u7B2C\u4E8C\u5B66\u671F (S2)", "Semester 2 (S2)")}</option>`;
    let panel = document.createElement("div");
    panel.style.cssText = "width:480px;max-width:95%;max-height:85%;background:#fff;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;";
    panel.innerHTML = `<div style="padding:12px 20px;border-bottom:1px solid #e0e0e0;background:#f5f5f5;display:flex;justify-content:space-between;align-items:center;"><strong>${t("\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", "Add Virtual Task")}</strong><button id="close-virtual-task-modal" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button></div><div style="flex:1;overflow-y:auto;padding:20px;"><div style="display:flex;flex-direction:column;gap:16px;"><div><label style="display:block;margin-bottom:4px;font-weight:500;">${t("\u79D1\u76EE", "Subject")}</label><select id="vt-subject" style="width:100%;padding:8px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;">${subjectOptions}</select></div><div><label style="display:block;margin-bottom:4px;font-weight:500;">${t("\u5B66\u671F", "Semester")}</label><select id="vt-semester" style="width:100%;padding:8px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;">${semOptions}</select></div><div><label style="display:block;margin-bottom:4px;font-weight:500;">${t("\u4EFB\u52A1\u7C7B\u578B", "Task Type")}</label><select id="vt-type" style="width:100%;padding:8px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;">${typeOptions}</select></div><div><label style="display:block;margin-bottom:4px;font-weight:500;">${t("\u4EFB\u52A1\u540D\u79F0", "Task Name")}</label><input id="vt-name" type="text" style="width:100%;padding:8px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;box-sizing:border-box;" placeholder="${t("\u865A\u62DF\u4EFB\u52A1", "Virtual Task")}" value="${t("\u865A\u62DF\u4EFB\u52A1", "Virtual Task")}"></div><div style="display:flex;gap:16px;"><div style="flex:1;"><label style="display:block;margin-bottom:4px;font-weight:500;">${t("\u603B\u5206", "Total Score")}</label><input id="vt-topscore" type="number" style="width:100%;padding:8px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;box-sizing:border-box;" placeholder="" value="" min="0.01" step="any"></div><div style="flex:1;"><label style="display:block;margin-bottom:4px;font-weight:500;">${t("\u5F97\u5206", "Score")}</label><input id="vt-score" type="number" style="width:100%;padding:8px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;box-sizing:border-box;" placeholder="" value="" min="0" step="any"></div></div></div></div><div id="ints-vt-msg" style="display:none;padding:0 20px 8px;color:#cf1322;font-size:12px;"></div><div style="padding:10px 20px;border-top:1px solid #eee;display:flex;justify-content:flex-end;gap:12px;"><button id="cancel-virtual-task" style="background:#f5f5f5;border:1px solid #d9d9d9;padding:6px 20px;border-radius:4px;cursor:pointer;font-size:14px;">${t("\u53D6\u6D88", "Cancel")}</button><button id="confirm-virtual-task" style="background:#1890ff;border:none;padding:6px 20px;border-radius:4px;color:white;cursor:pointer;font-size:14px;">${t("\u6DFB\u52A0", "Add")}</button></div>`;
    modalDiv.appendChild(panel);
    document.body.appendChild(modalDiv);
    function closeModal() {
      if (modalDiv.parentNode) modalDiv.remove();
      S.activeSubModal = false;
    }
    function showModalError(msg) {
      const el = panel.querySelector("#ints-vt-msg");
      if (!el) return;
      el.textContent = msg;
      el.style.display = "block";
    }
    function doAdd() {
      const courseIdx = parseInt(document.getElementById("vt-subject").value);
      const semester = document.getElementById("vt-semester").value;
      const typeIdx = parseInt(document.getElementById("vt-type").value);
      const taskName = document.getElementById("vt-name").value.trim() || t("\u865A\u62DF\u4EFB\u52A1", "Virtual Task");
      const topScoreVal = document.getElementById("vt-topscore").value.trim();
      const scoreVal = document.getElementById("vt-score").value.trim();
      if (isNaN(courseIdx) || !courses[courseIdx]) {
        showModalError(t("\u8BF7\u9009\u62E9\u6709\u6548\u7684\u79D1\u76EE", "Please select a valid subject"));
        return;
      }
      const topScore = parseFloat(topScoreVal);
      if (isNaN(topScore) || topScore <= 0) {
        showModalError(t("\u603B\u5206\u5FC5\u987B\u5927\u4E8E 0", "Total score must be greater than 0"));
        return;
      }
      let score = null;
      if (scoreVal !== "") {
        score = parseFloat(scoreVal);
        if (isNaN(score)) {
          showModalError(t("\u5F97\u5206\u683C\u5F0F\u65E0\u6548", "Invalid score format"));
          return;
        }
        if (score < 0) score = 0;
        if (score > topScore) score = topScore;
      }
      const virtualId = S.virtualTaskIdCounter--;
      const virtualTask = {
        entityId: virtualId,
        taskStudentId: virtualId,
        id: virtualId,
        name: taskName,
        typeName: TYPE_KEYS[typeIdx],
        score,
        topScore,
        endDate: getDefaultDateForSemester(semester),
        termRaw: semester,
        originalScore: score,
        simulatedScore: score,
        isVirtual: true
      };
      const course = S.simCourses[courseIdx];
      course.tasks.push(virtualTask);
      course.tasks.sort((a, b) => (a.endDate || 0) - (b.endDate || 0));
      if (semester === "S1") course.overrideP.s1 = null;
      else course.overrideP.s2 = null;
      recalcCourseTerm(course, "s1");
      recalcCourseTerm(course, "s2");
      markDirty();
      notifyCourseChanged(courseIdx);
      console.log(`[\u5185\u8054] \u5DF2\u4E3A ${course.name} \u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1"${taskName}"\uFF08\u5DF2\u8BA1\u5165\u5E73\u65F6\u6210\u7EE9\uFF09`);
      closeModal();
      try {
        if (typeof onAdded === "function") onAdded(courseIdx);
      } catch (e) {
        console.error("[\u865A\u62DF\u4EFB\u52A1] onAdded \u56DE\u8C03\u5F02\u5E38", e);
      }
    }
    panel.querySelector("#close-virtual-task-modal").addEventListener("click", closeModal);
    panel.querySelector("#cancel-virtual-task").addEventListener("click", closeModal);
    panel.querySelector("#confirm-virtual-task").addEventListener("click", doAdd);
    modalDiv.addEventListener("click", (e) => {
      if (e.target === modalDiv) closeModal();
    });
    panel.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        doAdd();
      }
    });
  }
  var AUTO_CALIBRATE_MAX, AUTO_CALIBRATE_PER_COURSE_MAX, AUTO_CALIBRATE_DELAY_MS, _autoCalibrateRunning;
  var init_simulation = __esm({
    "v8.30/simulation.js"() {
      init_state();
      init_utils();
      init_api();
      init_ui();
      AUTO_CALIBRATE_MAX = 20;
      AUTO_CALIBRATE_PER_COURSE_MAX = 2;
      AUTO_CALIBRATE_DELAY_MS = 1800;
      _autoCalibrateRunning = false;
    }
  });

  // v8.30/year-data.js
  function incLoadingCount() {
    S.loadingRequestCount++;
    return S.loadingRequestCount;
  }
  function readPageYearText() {
    const sel = document.querySelector(".ant-select-selection-selected-value, .ant-select-single .ant-select-selection-item");
    return sel ? sel.textContent.trim() : null;
  }
  async function resolvePageYear() {
    if (!S.yearList || !S.yearList.length) {
      S.yearList = await fetchSchoolYearList();
      console.log("[\u542F\u52A8] \u5B66\u5E74\u5217\u8868: " + S.yearList.length + " \u6761");
    }
    const pageText = readPageYearText();
    let entry = S.yearList.find((y) => y.value === pageText);
    if (!entry && S.yearList.length) entry = S.yearList[0];
    return { entry, pageText };
  }
  async function loadPageYearData(opts) {
    const force = !!(opts && opts.force);
    const navGen = ++S._navGeneration;
    if (S.currentAbortController) S.currentAbortController.abort();
    S.currentAbortController = new AbortController();
    const { entry } = await resolvePageYear();
    if (!entry) {
      console.warn("[\u52A0\u8F7D] \u65E0\u6CD5\u5B9A\u4F4D\u7AD9\u70B9\u9875\u9762\u7684\u5B66\u5E74");
      return false;
    }
    if (S.schoolYearKey === null) {
      S.schoolYearKey = entry.key;
      console.log(`[\u52A0\u8F7D] \u5728\u8BFB\u5B66\u5E74: ${entry.value}\uFF08\u8FDB\u9875\u9762\u65F6\u7AD9\u70B9\u9009\u4E2D\u7684\u5C31\u662F\u5B83 \u21D2 \u53EF\u6A21\u62DF\uFF09`);
    }
    if (!S.creditMap || !S.creditMap.size) S.creditMap = await loadCreditMap();
    if (S._navGeneration !== navGen) return false;
    S.currentYearKey = entry.key;
    S.currentYearValue = entry.value;
    S.isCurrentYear = String(entry.key) === String(S.schoolYearKey);
    if (!S.isCurrentYear) {
      console.log(`[\u52A0\u8F7D] ${entry.value} \u662F\u5F80\u671F\u5B66\u5E74\uFF08\u5728\u8BFB\u7684\u662F ${S.schoolYearKey} \u90A3\u5E74\uFF09\u21D2 \u53EA\u8BFB\uFF1A\u4E0D\u6A21\u62DF\u3001\u4E0D\u6821\u51C6\u3001\u4E0D\u5199\u7528\u6237\u6570\u636E`);
    }
    S.isMultiYearMode = false;
    await loadYearData(S.currentYearKey, S.currentYearValue, S.isCurrentYear, { force });
    return S._navGeneration === navGen && !!(S.simCourses && S.simCourses.length);
  }
  function _detachLiveSims() {
    const key = S.simYearKey !== null && S.simYearKey !== void 0 ? String(S.simYearKey) : S.currentYearKey !== null && S.currentYearKey !== void 0 ? String(S.currentYearKey) : null;
    if (key === null) return;
    const entry = S.yearDataCache.get(key);
    if (!entry) return;
    if (entry.simCourses !== S.simCourses) return;
    if (!S.simCourses || !S.simCourses.length) return;
    entry.simCourses = S.simCourses.slice();
    console.log(`[\u7F13\u5B58] \u5DF2\u628A ${key} \u7684\u6A21\u62DF\u5C42\u4ECE\u6D3B\u5F15\u7528\u4E0A\u6458\u4E0B\u6765\uFF08${entry.simCourses.length} \u95E8\uFF09\uFF0C\u514D\u5F97\u8FD9\u6B21\u5207\u5B66\u5E74\u628A\u5B83\u4E00\u8D77\u6362\u6210\u53E6\u4E00\u5E74\u7684`);
  }
  async function loadYearData(yearKey, yearValue, isCurr, opts) {
    const force = !!(opts && opts.force);
    const navGen = S._navGeneration;
    S.activeSubModal = false;
    S.loadingRequestCount = 0;
    S.expectedRequestCount = 3;
    const keyStr = String(yearKey);
    _detachLiveSims();
    if (S.yearDataCache.has(keyStr)) {
      const cached = S.yearDataCache.get(keyStr);
      const usable = !!cached.originalCourses && (!isCurr || !force && isYearCacheFresh(keyStr) && cached.simCourses && cached.simCourses.length);
      if (usable) {
        S.originalCourses = cached.originalCourses;
        if (isCurr) {
          S.simCourses = cached.simCourses;
          S.currentYearAnnualGPA = null;
          S.currentYearCumulativeGPA = null;
          S.virtualTaskIdCounter = cached.virtualTaskIdCounter || cached.simCourses.reduce((min, c) => {
            for (let t2 of c.tasks || []) if (t2.isVirtual && t2.entityId < min) min = t2.entityId;
            return min;
          }, -1);
        } else {
          initReadOnlyCourses();
          S.currentYearAnnualGPA = cached.annualGPA || null;
          S.currentYearCumulativeGPA = cached.cumulativeGPA || null;
        }
        S.simYearKey = keyStr;
        refreshAllViews();
        console.log(isCurr ? `[\u7F13\u5B58] \u4F7F\u7528\u7F13\u5B58\u7684\u5F53\u524D\u5B66\u5E74\u6A21\u62DF\u6570\u636E: ${yearValue}` : `[\u7F13\u5B58] \u4F7F\u7528\u7F13\u5B58\u7684\u5F80\u671F\u6570\u636E\uFF08\u53EA\u8BFB\uFF09: ${yearValue}`);
        if (isCurr) safeAsync("\u661F\u6807\u81EA\u52A8\u6821\u51C6", autoCalibrateStarredCourses);
        return;
      }
      if (isCurr) {
        console.log(`[\u7F13\u5B58] ${yearValue} \u7684\u6210\u7EE9\u518C\u7F13\u5B58\u5DF2\u8FC7\u671F\uFF08\u6216\u6CA1\u6709\u6A21\u62DF\u6570\u636E\uFF09` + (force ? "\uFF08\u672C\u6B21\u4E3A\u5BF9\u8D26\u5F3A\u5236\u91CD\u62C9\uFF09" : "") + "\uFF0C\u91CD\u65B0\u62C9\u53D6\uFF1B\u7528\u6237\u6570\u636E\u7A0D\u540E\u56DE\u8D34");
      }
    }
    console.log(`[\u52A0\u8F7D] \u5F00\u59CB\u52A0\u8F7D\u5B66\u5E74 ${yearValue}\uFF0C\u5F53\u524D\u5B66\u5E74=${isCurr}`);
    try {
      console.log(`[\u52A0\u8F7D] \u83B7\u53D6 ${yearValue} \u6210\u7EE9\u6570\u636E`);
      incLoadingCount();
      const courses = await buildCurrentYearCourses(yearKey, yearValue);
      if (S._navGeneration !== navGen) return;
      S.originalCourses = courses;
      if (isCurr) initSimCourses();
      else initReadOnlyCourses();
      S.simYearKey = keyStr;
      if (isCurr) applyUserLayer(keyStr);
      let sectionName = null, apiAnnualGPA = null, apiCumulativeGPA = null;
      try {
        const studentId = await getStudentId();
        const reports = await fetchGradeReportsForYear(yearKey);
        const yearlyReport = reports.find((r) => {
          var _a;
          return r.gradePeriodType === "fullSchoolYear" || r.reportName && (r.reportName.includes("\u5E74\u5EA6") || ((_a = r.reportEnName) == null ? void 0 : _a.includes("Yearly")));
        });
        if (yearlyReport) {
          const content = await fetchReportContent(studentId, yearlyReport.requestUrl, yearlyReport.gradePeriodId);
          if (content) {
            sectionName = content.sectionName || null;
            apiAnnualGPA = typeof content.annualGPA === "number" ? content.annualGPA : null;
            apiCumulativeGPA = typeof content.cumulativeGPA === "number" ? content.cumulativeGPA : null;
          }
        }
      } catch (e) {
        console.warn(`[\u52A0\u8F7D] \u83B7\u53D6 ${yearValue} \u5E74\u7EA7\u4FE1\u606F\u5931\u8D25: ${e.message}`);
      }
      S.currentYearAnnualGPA = apiAnnualGPA;
      S.currentYearCumulativeGPA = apiCumulativeGPA;
      S.yearDataCache.set(keyStr, {
        originalCourses: courses,
        simCourses: isCurr ? S.simCourses : null,
        virtualTaskIdCounter: isCurr ? S.virtualTaskIdCounter : null,
        sectionName,
        annualGPA: apiAnnualGPA,
        cumulativeGPA: apiCumulativeGPA,
        dataTs: Date.now()
      });
      markDirty();
      if (S._navGeneration !== navGen) return;
      refreshAllViews();
      S.expectedRequestCount = 0;
      console.log(`[\u52A0\u8F7D] \u5B8C\u6210\uFF0C\u5171 ${S.originalCourses.length} \u95E8\u8BFE\u7A0B`);
      if (isCurr) safeAsync("\u661F\u6807\u81EA\u52A8\u6821\u51C6", autoCalibrateStarredCourses);
    } catch (err) {
      S.expectedRequestCount = 0;
      if (err.name === "AbortError") {
        console.log("[\u52A0\u8F7D] \u8BF7\u6C42\u5DF2\u88AB\u4E2D\u65AD");
        return;
      }
      console.error(`[\u52A0\u8F7D] \u5931\u8D25: ${err.message}`, err);
    }
  }
  async function loadMultiYearData() {
    const navGen = S._navGeneration;
    S.multiYearEntries = [];
    S.multiYearCourseMap = /* @__PURE__ */ new Map();
    S.loadingRequestCount = 0;
    S.expectedRequestCount = 8;
    let sortedYears = [...S.yearList].sort((a, b) => a.value.localeCompare(b.value));
    if (sortedYears.length > 4) sortedYears = sortedYears.slice(-4);
    const allGrades = ["G9", "G10", "G11", "G12"];
    let gradeDataMap = /* @__PURE__ */ new Map();
    let excludedYearKeys = /* @__PURE__ */ new Set();
    const studentId = await getStudentId();
    let expectedReqs = 0;
    for (let i = 0; i < sortedYears.length; i++) {
      const keyStr = String(sortedYears[i].key);
      const cached = S.yearDataCache.get(keyStr);
      if (!cached || !cached.sectionName) expectedReqs += 2;
      if (!cached || !cached.originalCourses) expectedReqs += 1;
    }
    S.expectedRequestCount = expectedReqs;
    const yearLoadPromises = sortedYears.map(async (y) => {
      const keyStr = String(y.key);
      const isCurr = String(y.key) === String(S.schoolYearKey !== null ? S.schoolYearKey : S.currentYearKey);
      let sectionName = null, courses = null;
      let apiAnnualGPA = null, apiCumulativeGPA = null;
      const cachedMeta = S.yearDataCache.get(keyStr);
      const hasSectionCache = cachedMeta && cachedMeta.sectionName;
      if (hasSectionCache) {
        sectionName = cachedMeta.sectionName;
        apiAnnualGPA = cachedMeta.annualGPA;
        apiCumulativeGPA = cachedMeta.cumulativeGPA;
      } else {
        try {
          incLoadingCount();
          const reports = await fetchGradeReportsForYear(y.key);
          let yearlyReport = reports.find((r) => {
            var _a;
            return r.gradePeriodType === "fullSchoolYear" || r.reportName && (r.reportName.includes("\u5E74\u5EA6") || ((_a = r.reportEnName) == null ? void 0 : _a.includes("Yearly")));
          });
          if (yearlyReport) {
            incLoadingCount();
            const content = await fetchReportContent(studentId, yearlyReport.requestUrl, yearlyReport.gradePeriodId);
            if (content) {
              sectionName = content.sectionName || null;
              apiAnnualGPA = typeof content.annualGPA === "number" ? content.annualGPA : null;
              apiCumulativeGPA = typeof content.cumulativeGPA === "number" ? content.cumulativeGPA : null;
            }
          } else {
            S.expectedRequestCount = Math.max(S.loadingRequestCount, S.expectedRequestCount - 1);
          }
        } catch (e) {
          console.warn(`[\u591A\u5E74\u7EA7] \u83B7\u53D6 ${y.value} \u5E74\u7EA7\u4FE1\u606F\u5931\u8D25: ${e.message}`);
        }
      }
      if (cachedMeta && cachedMeta.originalCourses) {
        courses = cachedMeta.originalCourses;
        if (!sectionName) sectionName = cachedMeta.sectionName || null;
        if (apiAnnualGPA === null) apiAnnualGPA = cachedMeta.annualGPA || null;
        if (apiCumulativeGPA === null) apiCumulativeGPA = cachedMeta.cumulativeGPA || null;
      } else {
        incLoadingCount();
        if (isCurr) {
          courses = await buildCurrentYearCourses(y.key, y.value);
        } else {
          const result = await buildCoursesFromReports(y.key);
          courses = result.courses;
          if (!sectionName) sectionName = result.sectionName;
          if (apiAnnualGPA === null) apiAnnualGPA = result.annualGPA || null;
          if (apiCumulativeGPA === null) apiCumulativeGPA = result.cumulativeGPA || null;
        }
        const existingCache = S.yearDataCache.get(keyStr) || {};
        S.yearDataCache.set(keyStr, {
          originalCourses: courses,
          sectionName,
          annualGPA: apiAnnualGPA,
          cumulativeGPA: apiCumulativeGPA,
          // dataTs 要跟着走，否则这里一次覆盖就把保鲜期抹成"永远过期"（每次进总览都重拉）
          dataTs: existingCache.dataTs || Date.now(),
          simCourses: existingCache.simCourses || null,
          virtualTaskIdCounter: existingCache.virtualTaskIdCounter || null
        });
      }
      return { y, keyStr, isCurr, sectionName, apiAnnualGPA, apiCumulativeGPA, courses };
    });
    const allYearData = await Promise.all(yearLoadPromises);
    if (S._navGeneration !== navGen) return;
    for (let { y, keyStr, isCurr, sectionName, apiAnnualGPA, apiCumulativeGPA, courses } of allYearData) {
      if (sectionName && allGrades.includes(sectionName)) {
        gradeDataMap.set(sectionName, {
          yearKey: y.key,
          yearValue: y.value,
          courses,
          isCurr,
          annualGPA: apiAnnualGPA,
          cumulativeGPA: apiCumulativeGPA
        });
      } else if (sectionName) {
        console.warn(`[\u591A\u5E74\u7EA7] \u672A\u77E5\u5E74\u7EA7\u6807\u7B7E: ${sectionName}\uFF0C\u5DF2\u6392\u9664`);
        excludedYearKeys.add(keyStr);
      }
    }
    let unmappedYears = [];
    for (let i = 0; i < sortedYears.length; i++) {
      const y = sortedYears[i];
      const keyStr = String(y.key);
      const isCurr = String(y.key) === String(S.schoolYearKey !== null ? S.schoolYearKey : S.currentYearKey);
      if (excludedYearKeys.has(keyStr)) continue;
      let alreadyMapped = false;
      for (let [grade, data] of gradeDataMap) {
        if (data.yearKey === y.key) {
          alreadyMapped = true;
          break;
        }
      }
      if (!alreadyMapped) unmappedYears.push({ y, keyStr, isCurr });
    }
    if (unmappedYears.length > 0) {
      let availableGrades = allGrades.filter((g) => !gradeDataMap.has(g));
      for (let i = 0; i < Math.min(unmappedYears.length, availableGrades.length); i++) {
        const uy = unmappedYears[i];
        const grade = availableGrades[i];
        let courses;
        if (S.yearDataCache.has(uy.keyStr)) {
          courses = S.yearDataCache.get(uy.keyStr).originalCourses;
        } else if (uy.isCurr) {
          incLoadingCount();
          courses = await buildCurrentYearCourses(uy.y.key, uy.y.value);
        } else {
          incLoadingCount();
          const result = await buildCoursesFromReports(uy.y.key);
          courses = result.courses;
        }
        const existingCache = S.yearDataCache.get(uy.keyStr) || {};
        S.yearDataCache.set(uy.keyStr, {
          originalCourses: courses,
          sectionName: grade,
          simCourses: existingCache.simCourses || null,
          virtualTaskIdCounter: existingCache.virtualTaskIdCounter || null,
          annualGPA: existingCache.annualGPA || null,
          cumulativeGPA: existingCache.cumulativeGPA || null,
          dataTs: existingCache.dataTs || Date.now()
        });
        gradeDataMap.set(grade, {
          yearKey: uy.y.key,
          yearValue: uy.y.value,
          courses,
          isCurr: uy.isCurr,
          annualGPA: existingCache.annualGPA || null,
          cumulativeGPA: existingCache.cumulativeGPA || null
        });
        console.log(`[\u591A\u5E74\u7EA7] \u63A8\u65AD ${uy.y.value} \u2192 ${grade}`);
      }
    }
    if (S._navGeneration !== navGen) return;
    for (let grade of allGrades) {
      if (gradeDataMap.has(grade)) {
        const data = gradeDataMap.get(grade);
        let simCopy;
        if (data.isCurr) {
          const keyStr = String(data.yearKey);
          const cached = S.yearDataCache.get(keyStr);
          if (cached && cached.simCourses && cached.simCourses.length) {
            simCopy = cached.simCourses;
            console.log(`[\u591A\u5E74\u7EA7] ${grade} \u4F7F\u7528\u7F13\u5B58\u7684\u6A21\u62DF\u6570\u636E`);
          } else {
            simCopy = initMultiYearSimCourses(data.courses);
          }
        } else {
          simCopy = initMultiYearSimCourses(data.courses);
        }
        S.multiYearEntries.push({
          grade,
          yearKey: data.yearKey,
          yearValue: data.yearValue,
          originalCourses: data.courses,
          simCourses: simCopy,
          annualGPA: data.annualGPA || null,
          cumulativeGPA: data.cumulativeGPA || null
        });
      } else {
        S.multiYearEntries.push({
          grade,
          yearKey: null,
          yearValue: null,
          originalCourses: [],
          simCourses: [],
          annualGPA: null,
          cumulativeGPA: null
        });
        console.log(`[\u591A\u5E74\u7EA7] ${grade}: \u65E0\u6570\u636E`);
      }
    }
    for (let entry of S.multiYearEntries) {
      if (!entry.originalCourses.length) continue;
      for (let i = 0; i < entry.simCourses.length; i++) {
        const course = entry.simCourses[i];
        const name = course.name;
        if (!S.multiYearCourseMap.has(name)) {
          S.multiYearCourseMap.set(name, { name, credit: course.credit, weightBonus: course.weightBonus, years: {} });
        }
        const mc = S.multiYearCourseMap.get(name);
        mc.years[entry.grade] = {
          entryIdx: S.multiYearEntries.indexOf(entry),
          courseIdx: i,
          s1fOrig: course.originalGrades.s1f,
          s2fOrig: course.originalGrades.s2f,
          s1fSim: course.simGrades.s1f,
          s2fSim: course.simGrades.s2f
        };
      }
    }
    S.expectedRequestCount = 0;
    markDirty();
  }
  var init_year_data = __esm({
    "v8.30/year-data.js"() {
      init_state();
      init_api();
      init_courses();
      init_deadline();
      init_simulation();
      init_ui();
      init_diagnose();
    }
  });

  // v8.30/inline-points.js
  function _inlineEnabled() {
    try {
      return localStorage.getItem("ints_inline") !== "0";
    } catch (e) {
      return true;
    }
  }
  function _isPointsPage() {
    const p = location.pathname.toLowerCase();
    return p === "/points" || p.startsWith("/points/") || p.startsWith("/points?");
  }
  function _rows() {
    return document.querySelectorAll(".ant-table-tbody > tr.ant-table-row");
  }
  function _cellText(td) {
    if (!td) return null;
    const e = td.querySelector(".ellipsis");
    return (e ? e.textContent : td.textContent).trim();
  }
  function _rowInfo(tr) {
    const tds = tr.children;
    return {
      key: tr.getAttribute("data-row-key"),
      subject: _cellText(tds[0]),
      course: _cellText(tds[1]),
      score: _cellText(tds[2]),
      scoreTd: tds[2] || null
    };
  }
  function _norm(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim().toLowerCase();
  }
  function _matchCourseIndex(info, used) {
    const subj = _norm(info.subject), course = _norm(info.course);
    for (let i = 0; i < S.simCourses.length; i++) {
      if (used.has(i)) continue;
      const c = S.simCourses[i];
      if (_norm(c.subject) === subj && _norm(c.name) === course) return i;
    }
    for (let i = 0; i < S.simCourses.length; i++) {
      if (used.has(i)) continue;
      if (_norm(S.simCourses[i].name) === course) return i;
    }
    if (course.length >= 6) {
      const hits = [];
      for (let i = 0; i < S.simCourses.length; i++) {
        if (used.has(i)) continue;
        const n = _norm(S.simCourses[i].name);
        if (n && (n.indexOf(course) >= 0 || course.indexOf(n) >= 0)) hits.push(i);
      }
      if (hits.length === 1) return hits[0];
    }
    return -1;
  }
  function _annualScore(s1f, s2f) {
    const vals = [];
    if (typeof s1f === "number" && !isNaN(s1f)) vals.push(s1f);
    if (typeof s2f === "number" && !isNaN(s2f)) vals.push(s2f);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  function _courseAnnual(course, which) {
    if (!course) return null;
    const g = which === "sim" ? course.simGrades || course.originalGrades : course.originalGrades;
    if (!g) return null;
    return _annualScore(g.s1f, g.s2f);
  }
  function _gpaSummary() {
    if (!S.originalCourses || !S.originalCourses.length) return null;
    let origAnnual = computeAnnualGPA(S.originalCourses, (c) => c.originalGrades.s1f, (c) => c.originalGrades.s2f);
    if (!origAnnual && S.currentYearAnnualGPA !== null && S.currentYearCumulativeGPA !== null) {
      origAnnual = { uw: S.currentYearCumulativeGPA, w: S.currentYearAnnualGPA };
    }
    const simAnnual = S.isCurrentYear ? computeAnnualGPA(S.simCourses, (c) => c.simGrades.s1f, (c) => c.simGrades.s2f) : null;
    return { orig: origAnnual, sim: simAnnual };
  }
  function _schoolAnnual() {
    if (S.currentYearAnnualGPA === null || S.currentYearCumulativeGPA === null) return null;
    return { uw: S.currentYearCumulativeGPA, w: S.currentYearAnnualGPA };
  }
  function _gpaHost() {
    return document.querySelector(".grade .section-title .title-text") || document.querySelector(".grade .section-title");
  }
  function _renderGpa() {
    const host = _gpaHost();
    if (!host) return false;
    let el = document.getElementById(GPA_ID);
    if (!el) {
      el = document.createElement("span");
      el.id = GPA_ID;
      el.style.cssText = "margin-left:12px;font-size:12px;font-weight:normal;color:rgba(0,0,0,0.65);white-space:nowrap;vertical-align:baseline;";
      host.appendChild(el);
    }
    const sum = _gpaSummary();
    if (!S.isCurrentYear) {
      const school2 = _schoolAnnual();
      const src = school2 || sum && sum.orig || null;
      if (!src) {
        el.textContent = "";
        el.removeAttribute("title");
        return true;
      }
      el.innerHTML = '<span style="color:rgba(0,0,0,0.45);">' + t("\u5B66\u5E74GPA", "Annual GPA") + "</span> UW " + _num(src.uw) + " / W " + _num(src.w);
      el.title = t(
        "\u5F80\u671F\u5B66\u5E74\uFF1A\u53EA\u8BFB\u5C55\u793A\uFF0C\u53D6\u5B66\u6821\u5E74\u5EA6\u62A5\u544A\u7684\u516C\u5E03\u503C\uFF08\u4E0D\u53C2\u4E0E\u6A21\u62DF\u4E0E \u0394\uFF09",
        "Past school year: read-only, values as published in the school annual report (no simulation, no delta)"
      );
      return true;
    }
    if (!sum || !sum.orig) {
      el.textContent = "";
      el.removeAttribute("title");
      return true;
    }
    const o = sum.orig, sim = sum.sim;
    let html = '<span style="color:rgba(0,0,0,0.45);">' + t("\u5B66\u5E74GPA", "Annual GPA") + "</span> ";
    if (sim && (Math.abs(sim.uw - o.uw) > 1e-3 || Math.abs(sim.w - o.w) > 1e-3)) {
      const du = sim.uw - o.uw, dw = sim.w - o.w;
      const gColor = (Math.abs(du) > 1e-3 ? du : dw) > 0 ? COLOR_UP : COLOR_DOWN;
      html += 'UW <b style="color:' + gColor + ';">' + _num(sim.uw) + " / W " + _num(sim.w) + '</b> <span style="font-size:11px;">(\u0394 UW: ' + _delta(du) + " \u0394 W: " + _delta(dw) + ")</span>";
    } else {
      html += "UW " + _num(o.uw) + " / W " + _num(o.w);
    }
    const school = _schoolAnnual();
    if (school && (Math.abs(school.uw - o.uw) > 1e-3 || Math.abs(school.w - o.w) > 1e-3)) {
      el.title = t(
        "\u5B66\u6821\u516C\u5E03\uFF1AUW " + school.uw.toFixed(2) + " / W " + school.w.toFixed(2),
        "School published: UW " + school.uw.toFixed(2) + " / W " + school.w.toFixed(2)
      );
    } else {
      el.removeAttribute("title");
    }
    if (el.innerHTML !== html) el.innerHTML = html;
    return true;
  }
  function _siteScoreTextNode(inner) {
    const wrap = inner.querySelector("[" + SCORE_WRAP_ATTR + "]");
    if (wrap) return wrap.firstChild;
    for (let n = inner.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && String(n.nodeValue || "").trim()) return n;
    }
    return null;
  }
  function _restoreScoreCell(td) {
    if (!td) return;
    const inner = td.firstElementChild || td;
    const wrap = inner.querySelector("[" + SCORE_WRAP_ATTR + "]");
    if (wrap && wrap.parentNode) {
      while (wrap.firstChild) wrap.parentNode.insertBefore(wrap.firstChild, wrap);
      wrap.remove();
    }
    const sim = inner.querySelector("[" + SCORE_SIM_ATTR + "]");
    if (sim) sim.remove();
  }
  function _scoreNum(v) {
    return typeof v === "number" && !isNaN(v) ? v.toFixed(2) : "\u2014";
  }
  function _siteLevelSuffix(siteText) {
    const s = String(siteText == null ? "" : siteText).trim();
    const i = s.lastIndexOf("/");
    if (i <= 0) return "";
    const before = Number(s.slice(0, i).trim());
    const after = s.slice(i + 1).trim();
    if (!after || isNaN(before)) return "";
    return "/" + after;
  }
  function _delta2(v) {
    return (v > 0 ? "+" : "") + v.toFixed(2);
  }
  function _renderRow(tr, courseIdx) {
    const tds = tr.children;
    const scoreTd = tds[2];
    if (!scoreTd) return;
    const course = S.simCourses[courseIdx];
    if (!course) return;
    if (!S.isCurrentYear) {
      _clearTaskCells(tr);
      _restoreScoreCell(scoreTd);
      if (!_scoreColumnIsField()) {
        const staleBox = scoreTd.querySelector("[data-ints-sim]");
        if (staleBox) staleBox.remove();
      }
      scoreTd.setAttribute(INLINE_ATTR, "1");
      if (scoreTd.getAttribute("data-ints-clickable") !== null) scoreTd.removeAttribute("data-ints-clickable");
      if (scoreTd.style.cursor) scoreTd.style.cursor = "";
      if (scoreTd.getAttribute("title")) scoreTd.removeAttribute("title");
      safe("\u5185\u8054\u5C55\u5F00\u5217 GPA", () => _decorateColumnCells(tr, courseIdx));
      return;
    }
    _renderTaskCells(tr, courseIdx, course);
    _renderVirtualCells(tr, courseIdx, course);
    const simScore = _courseAnnual(course, "sim");
    const origScore = _courseAnnual(course, "orig");
    const delta = simScore !== null && origScore !== null ? simScore - origScore : null;
    const showDelta = delta !== null && Math.abs(delta) >= SCORE_DELTA_EPS;
    const starred = !!(course.showStar && (course.showStar.s1 || course.showStar.s2));
    const gpaOrig = getGPAForScore(origScore, course.weightBonus);
    const gpaSim = showDelta ? getGPAForScore(simScore, course.weightBonus) : null;
    const inner = scoreTd.firstElementChild || scoreTd;
    const foreign = inner.innerHTML.indexOf("UW:") >= 0 && !inner.querySelector("[data-ints-sim]");
    const showGpa = !!gpaOrig && !foreign;
    let box = scoreTd.querySelector("[data-ints-sim]");
    const shown = simScore !== null ? simScore : origScore;
    const wrap0 = inner.querySelector("[" + SCORE_WRAP_ATTR + "]");
    if (shown !== null) {
      let wrap = wrap0;
      if (!wrap) {
        const node = _siteScoreTextNode(inner);
        if (node) {
          wrap = document.createElement("span");
          wrap.setAttribute(SCORE_WRAP_ATTR, "1");
          node.parentNode.insertBefore(wrap, node);
          wrap.appendChild(node);
        }
      }
      const siteText = wrap ? String(wrap.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (wrap) wrap.style.display = "none";
      let simEl = inner.querySelector("[" + SCORE_SIM_ATTR + "]");
      if (!simEl) {
        simEl = document.createElement("span");
        simEl.setAttribute(SCORE_SIM_ATTR, "1");
        if (wrap) wrap.insertAdjacentElement("afterend", simEl);
        else inner.insertBefore(simEl, inner.firstChild);
      }
      simEl.style.color = showDelta ? delta > 0 ? COLOR_UP : COLOR_DOWN : "";
      const valText = _scoreNum(shown) + _siteLevelSuffix(siteText);
      if (simEl.firstChild && simEl.firstChild.nodeType === 3) {
        if (simEl.firstChild.nodeValue !== valText) simEl.firstChild.nodeValue = valText;
      } else {
        simEl.insertBefore(document.createTextNode(valText), simEl.firstChild);
      }
      const dText = showDelta ? " (" + _delta2(delta) + ")" : "";
      let dEl = simEl.querySelector("[" + SCORE_DELTA_ATTR + "]");
      if (!dText) {
        if (dEl) dEl.remove();
      } else if (!dEl) {
        dEl = document.createElement("span");
        dEl.setAttribute(SCORE_DELTA_ATTR, "1");
        dEl.style.fontSize = "10px";
        dEl.textContent = dText;
        simEl.appendChild(dEl);
      } else if (dEl.textContent !== dText) {
        dEl.textContent = dText;
      }
      simEl.title = t("\u6A21\u62DF\u503C", "Simulated") + " \xB7 " + t("\u539F\u59CB ", "was ") + siteText + (showDelta ? " \xB7 " + t("\u0394 ", "delta ") + _delta2(delta) : "");
    } else if (wrap0 || inner.querySelector("[" + SCORE_SIM_ATTR + "]")) {
      _restoreScoreCell(scoreTd);
    }
    safe("\u5185\u8054\u5C55\u5F00\u5217 GPA", () => _decorateColumnCells(tr, courseIdx));
    if (!showGpa && !starred) {
      if (box) box.remove();
      scoreTd.setAttribute(INLINE_ATTR, "1");
      return;
    }
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("data-ints-sim", "1");
      box.style.cssText = "font-size:11px;line-height:1.35;margin-top:2px;white-space:nowrap;color:rgba(0,0,0,0.5);";
      inner.appendChild(box);
    }
    let html = "";
    if (showGpa) {
      const g = gpaSim || gpaOrig;
      const changed = gpaSim && (Math.abs(gpaSim.uw - gpaOrig.uw) > 1e-3 || Math.abs(gpaSim.w - gpaOrig.w) > 1e-3);
      const gu = changed ? gpaSim.uw - gpaOrig.uw : 0, gw = changed ? gpaSim.w - gpaOrig.w : 0;
      const gDir = Math.abs(gu) > 1e-3 ? gu : gw;
      const gColor = changed ? gDir > 0 ? COLOR_UP : COLOR_DOWN : "";
      const tip = changed ? t(
        "\u6A21\u62DF\u540E GPA\uFF08\u539F UW: " + _num(gpaOrig.uw) + ", W: " + _num(gpaOrig.w) + "\uFF09",
        "Simulated GPA (was UW: " + _num(gpaOrig.uw) + ", W: " + _num(gpaOrig.w) + ")"
      ) : t("\u672C\u8BFE\u7A0B GPA", "Course GPA");
      html += '<span style="' + (gColor ? "color:" + gColor + ";" : "") + '" title="' + escapeHtml(tip) + '">(UW: ' + _num(g.uw) + ", W: " + _num(g.w) + ")</span>";
    }
    if (starred) {
      html += '<span style="color:#f5222d;margin-left:4px;cursor:help;" title="' + escapeHtml(t(
        "\u5B66\u6821\u7ED9\u7684\u5206\u4E0E\u6309\u4EFB\u52A1\u660E\u7EC6\u7B97\u51FA\u7684\u5206\u4E0D\u4E00\u81F4\uFF08\u5DEE > 0.1\uFF09\uFF0C\u8BE5\u79D1\u76EE\u7684\u6A21\u62DF\u4EC5\u4F9B\u53C2\u8003\u3002",
        "School value differs from the task-based estimate by >0.1; this course is an estimate only."
      )) + '">*</span>';
    }
    box.innerHTML = html;
    scoreTd.setAttribute(INLINE_ATTR, "1");
    if (scoreTd.getAttribute("data-ints-clickable") !== "1") {
      scoreTd.setAttribute("data-ints-clickable", "1");
    }
    if (!scoreTd._intsClickBound) {
      scoreTd._intsClickBound = true;
      scoreTd.style.cursor = "pointer";
      scoreTd.title = t("\u70B9\u51FB\u7F16\u8F91\u8BE5\u79D1\u76EE\u7684\u6A21\u62DF\u6210\u7EE9", "Click to edit this course simulation");
      scoreTd.addEventListener("click", guardListener("\u5185\u8054\u7F16\u8F91\u7A97\u53E3", (e) => {
        e.stopPropagation();
        _openEditor(tr, courseIdx);
      }));
    }
  }
  function _fieldCellWant(ci, f) {
    const v = _fieldValue(ci, f);
    if (!v || v.score === null) return null;
    return v.score + "/" + v.level;
  }
  function _findFieldCell(tr, idx, want) {
    const wantText = String(want).replace(/\s+/g, "");
    for (const off of FIELD_CELL_SEARCH) {
      const td = tr.children[idx + off];
      if (!td) continue;
      if (td.querySelector && td.querySelector(".task-title")) continue;
      if (String(td.textContent || "").replace(/\s+/g, "").indexOf(wantText) >= 0) return td;
    }
    return null;
  }
  function _renderColumnDelta(cell, inner, box, course, f) {
    const sim = course.simGrades ? course.simGrades[f] : null;
    const orig = course.originalGrades ? course.originalGrades[f] : null;
    const info = _deltaInfo(sim, orig);
    let sp = cell.querySelector("[data-ints-coldelta]");
    if (!info) {
      if (sp) sp.remove();
      return;
    }
    if (!sp) {
      sp = document.createElement("span");
      sp.setAttribute("data-ints-coldelta", "1");
      sp.style.cssText = "font-size:11px;white-space:nowrap;";
      if (box && box.parentElement === inner) inner.insertBefore(sp, box);
      else inner.appendChild(sp);
    }
    sp.style.color = info.color;
    if (sp.textContent !== info.text) sp.textContent = info.text;
  }
  function _synthThs() {
    if (_synthThCache && _synthThCache.length && _synthThCache[0].isConnected) return _synthThCache;
    _synthThCache = Array.prototype.slice.call(
      document.querySelectorAll(".ant-table-header thead th, .ant-table-thead th")
    );
    return _synthThCache;
  }
  function _thTitle(th) {
    const el = th.querySelector ? th.querySelector(".ant-table-column-title") : null;
    return String((el ? el.textContent : th.textContent) || "").trim().toUpperCase();
  }
  function _thFieldOf(th) {
    const key = th.getAttribute("key") || "";
    if (key.indexOf(SYNTH_PREFIX) === 0) {
      const f = key.slice(SYNTH_PREFIX.length);
      return FIELD_LABEL[f] ? f : null;
    }
    return FIELD_BY_LABEL[_thTitle(th)] || null;
  }
  function _cellScoreNum(td) {
    if (!td) return null;
    const inner = td.firstElementChild || td;
    for (let n = inner.firstChild; n; n = n.nextSibling) {
      if (n.nodeType !== 3) continue;
      const m = /(\d+(?:\.\d+)?)/.exec(String(n.nodeValue || ""));
      if (m) return Number(m[1]);
    }
    return null;
  }
  function _decorateSchoolFieldCell(tr, idx, course) {
    const td = tr.children[idx];
    if (!td || td.querySelector && td.querySelector(".task-title")) return;
    let box = td.querySelector("[data-ints-sim]");
    const score = _cellScoreNum(td);
    if (score === null) {
      if (box) box.remove();
      return;
    }
    const inner = td.firstElementChild || td;
    if (box && box.parentElement !== inner) {
      box.remove();
      box = null;
    }
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("data-ints-sim", "1");
      box.style.cssText = "font-size:11px;line-height:1.35;margin-top:2px;white-space:nowrap;color:rgba(0,0,0,0.5);";
      inner.appendChild(box);
    }
    const g = getGPAForScore(score, course.weightBonus);
    if (!g) {
      box.remove();
      return;
    }
    const html = '<span title="' + escapeHtml(t("\u672C\u8BFE\u7A0B GPA", "Course GPA")) + '">(UW: ' + _num(g.uw) + ", W: " + _num(g.w) + ")</span>";
    if (box.innerHTML !== html) box.innerHTML = html;
  }
  function _scoreColumnIsField() {
    const ths = _synthThs();
    const th = ths && ths[2];
    return !!(th && _thFieldOf(th));
  }
  function _decorateColumnCells(tr, courseIdx) {
    const course = S.simCourses && S.simCourses[courseIdx];
    if (!course) return;
    const ths = _synthThs();
    if (!ths.length) return;
    for (let i = 0; i < ths.length; i++) {
      const f = _thFieldOf(ths[i]);
      if (!f) continue;
      const isSynth = String(ths[i].getAttribute("key") || "").indexOf(SYNTH_PREFIX) === 0;
      if (!isSynth) {
        if (i === 2 && S.isCurrentYear) continue;
        _decorateSchoolFieldCell(tr, i, course);
        continue;
      }
      const td = tr.children[i];
      if (!td) continue;
      const want = _fieldCellWant(courseIdx, f);
      let box = td.querySelector("[data-ints-sim]");
      if (!want) {
        if (box) box.remove();
        continue;
      }
      const cell = _findFieldCell(tr, i, want);
      if (!cell) continue;
      if (cell !== td && cell.querySelector("[data-ints-sim]")) continue;
      box = cell.querySelector("[data-ints-sim]");
      const inner = cell.firstElementChild || cell;
      if (box && box.parentElement !== inner) {
        box.remove();
        box = null;
      }
      if (!box) {
        box = document.createElement("div");
        box.setAttribute("data-ints-sim", "1");
        box.style.cssText = "font-size:11px;line-height:1.35;margin-top:2px;white-space:nowrap;color:rgba(0,0,0,0.5);";
        inner.appendChild(box);
      }
      _renderColumnDelta(cell, inner, box, course, f);
      const g = getGPAForScore(Number(String(want).split("/")[0]), course.weightBonus);
      if (!g) {
        box.remove();
        continue;
      }
      const html = '<span title="' + escapeHtml(t("\u672C\u8BFE\u7A0B GPA", "Course GPA")) + '">(UW: ' + _num(g.uw) + ", W: " + _num(g.w) + ")</span>";
      if (box.innerHTML !== html) box.innerHTML = html;
    }
  }
  function _taskKey(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim().toLowerCase();
  }
  function _taskCellsOf(tr) {
    return Array.prototype.filter.call(tr.children, (td) => td.querySelector && td.querySelector(".task-title"));
  }
  function _taskIndexOf(course, name, vtIdAttr) {
    const tasks = course && Array.isArray(course.tasks) ? course.tasks : [];
    if (vtIdAttr !== void 0 && vtIdAttr !== null && vtIdAttr !== "") {
      const id = parseInt(vtIdAttr, 10);
      if (!isNaN(id)) {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i] && tasks[i].entityId === id) return i;
        }
        return -1;
      }
    }
    const key = _taskKey(name);
    if (!key) return -1;
    for (let i = 0; i < tasks.length; i++) {
      if (_taskKey(tasks[i] && tasks[i].name) === key) return i;
    }
    return -1;
  }
  function _siteScoreSpan(td) {
    const spans = td.querySelectorAll("span");
    for (let i = 0; i < spans.length; i++) {
      if (!spans[i].closest(".task-title")) return spans[i];
    }
    return null;
  }
  function _taskSimOf(task) {
    return task && typeof task.simulatedScore === "number" ? task.simulatedScore : null;
  }
  function _taskScoreDisplay(score, topScore) {
    if (score === -1) return t("\u5DF2\u6392\u9664", "Excluded");
    if (typeof score === "number" && typeof topScore === "number") return score + "/" + topScore;
    if (typeof score === "number") return String(score);
    return t("\u672A\u8BC4\u5206", "Not graded");
  }
  function _renderTaskCells(tr, courseIdx, course) {
    if (!tr) return;
    _taskCellsOf(tr).forEach((td) => {
      if (td === _taskEditing) return;
      const titleEl = td.querySelector(".task-title");
      const vtId = td.getAttribute(VTASK_ATTR);
      const ti = _taskIndexOf(course, titleEl ? titleEl.textContent : "", vtId);
      const siteSpan = _siteScoreSpan(td);
      const mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
      if (ti < 0 || !siteSpan) {
        if (vtId !== null) {
          _clearVirtualCell(td);
          return;
        }
        td.removeAttribute("data-ints-task");
        if (mine) mine.remove();
        if (siteSpan) siteSpan.style.display = "";
        return;
      }
      const task = course.tasks[ti];
      const sim = _taskSimOf(task);
      const orig = typeof task.originalScore === "number" ? task.originalScore : null;
      const differs = sim !== null && (sim === -1 || orig === null || Math.abs(sim - orig) > 1e-3);
      if (!differs) {
        if (mine) mine.remove();
        siteSpan.style.display = "";
      } else {
        siteSpan.style.display = "none";
        let el = mine;
        if (!el) {
          el = document.createElement("span");
          el.setAttribute(TASK_SCORE_ATTR, "1");
          siteSpan.insertAdjacentElement("afterend", el);
        }
        const color = sim === -1 || orig !== null && sim < orig ? COLOR_DOWN : COLOR_UP;
        el.style.cssText = "min-height:21px;display:block;color:" + color + ";";
        el.textContent = _taskScoreDisplay(sim, task.topScore);
        el.title = t("\u6A21\u62DF\u503C", "Simulated") + " \xB7 " + t("\u539F\u59CB ", "was ") + _taskScoreDisplay(orig, task.topScore) + (typeof task.topScore === "number" ? " \xB7 " + t("\u6EE1\u5206 ", "max ") + task.topScore : "");
      }
      td.setAttribute("data-ints-task", String(ti));
      if (td.getAttribute("data-ints-taskbound") !== "1") td.setAttribute("data-ints-taskbound", "1");
      if (!td._intsTaskClickBound) {
        td._intsTaskClickBound = true;
        td.style.cursor = "pointer";
        td.title = t("\u70B9\u51FB\u7F16\u8F91\u8BE5\u4EFB\u52A1\u7684\u6A21\u62DF\u5F97\u5206\uFF08-1 = \u4E0D\u8BA1\u5165\uFF09", "Click to edit this task score (-1 = excluded)");
        td.addEventListener("click", guardListener("\u5185\u8054\u4EFB\u52A1\u7F16\u8F91", (e) => {
          const idx = td.getAttribute("data-ints-task");
          if (idx === null) return;
          e.stopPropagation();
          _beginTaskEdit(td, courseIdx, parseInt(idx, 10));
        }));
      }
    });
  }
  function _clearTaskCells(tr) {
    if (!tr) return;
    Array.prototype.forEach.call(tr.children, (td) => {
      if (!td || !td.getAttribute) return;
      if (td.getAttribute(VTASK_ATTR) !== null) {
        _clearVirtualCell(td);
        return;
      }
      if (!td.querySelector || !td.querySelector(".task-title")) return;
      const mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
      if (mine) mine.remove();
      const siteSpan = _siteScoreSpan(td);
      if (siteSpan && siteSpan.style.display === "none") siteSpan.style.display = "";
      td.removeAttribute("data-ints-task");
      td.removeAttribute("data-ints-taskbound");
      if (td.style.cursor) td.style.cursor = "";
      if (td.getAttribute("title")) td.removeAttribute("title");
    });
  }
  function _vtaskList(course) {
    const out = [];
    const tasks = course && Array.isArray(course.tasks) ? course.tasks : [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i] && tasks[i].isVirtual) out.push({ task: tasks[i], i });
    }
    return out;
  }
  function _emptyTaskCells(tr) {
    return Array.prototype.filter.call(tr.children, (td) => {
      if (!td || !td.classList || !td.classList.contains("ant-table-row-cell-break-word")) return false;
      if ((td.getAttribute("style") || "").indexOf("padding: 0px") < 0) return false;
      if (td.querySelector(".task-title")) return false;
      if ((td.textContent || "").trim()) return false;
      return true;
    });
  }
  function _clearVirtualCell(td) {
    if (!td) return;
    td.removeAttribute(VTASK_ATTR);
    td.removeAttribute("data-ints-task");
    td.innerHTML = "";
    td.style.cursor = "";
    td.removeAttribute("title");
  }
  function _refTaskCell(tr) {
    const cells = _taskCellsOf(tr);
    for (const td of cells) {
      if (td.getAttribute(VTASK_ATTR) === null && td.querySelector(".task-title")) return td;
    }
    return null;
  }
  function _vtaskStyles(tr) {
    const ref = _refTaskCell(tr);
    if (!ref) return VTASK_FALLBACK;
    const box = ref.firstElementChild;
    const title = ref.querySelector(".task-title");
    const scoreBar = title ? title.nextElementSibling : null;
    const scoreSpan = scoreBar ? scoreBar.querySelector("span") : null;
    const styleOf = (el, fb) => el && el.getAttribute("style") ? el.getAttribute("style") : fb;
    return {
      box: styleOf(box, VTASK_FALLBACK.box),
      title: styleOf(title, VTASK_FALLBACK.title),
      scoreBar: styleOf(scoreBar, VTASK_FALLBACK.scoreBar),
      score: styleOf(scoreSpan, VTASK_FALLBACK.score)
    };
  }
  function _vtaskTitleStyle(base) {
    const keep = String(base || "").replace(/background(-color)?\s*:[^;]*;?/gi, "").replace(/box-shadow\s*:[^;]*;?/gi, "").trim();
    return keep + (keep && !/;\s*$/.test(keep) ? ";" : "") + "background-color:#d9f7be;box-shadow:inset 0 0 0 1px " + COLOR_UP + ";";
  }
  function _paintVirtualCell(td, v, tr) {
    const scope = _siteScopeAttr();
    const attr = scope ? " " + scope + '=""' : "";
    const task = v.task;
    const st = _vtaskStyles(tr);
    const score = typeof task.simulatedScore === "number" ? task.simulatedScore : typeof task.originalScore === "number" ? task.originalScore : null;
    const text = _taskScoreDisplay(score, typeof task.topScore === "number" ? task.topScore : null);
    let box = td.querySelector("[data-ints-vtask-box]");
    if (!box) {
      td.innerHTML = '<div data-ints-vtask-box="1"' + attr + ' style="' + st.box + '"><div class="task-title" data-ints-vtask-title="1"' + attr + ' style="' + _vtaskTitleStyle(st.title) + '"><span' + attr + "></span></div><div" + attr + ' style="' + st.scoreBar + '"><span' + attr + ' style="' + st.score + '"></span></div></div>';
      box = td.querySelector("[data-ints-vtask-box]");
    }
    const nameEl = box.querySelector("[data-ints-vtask-title] span");
    if (nameEl && nameEl.textContent !== task.name) nameEl.textContent = task.name;
    const scoreSpans = box.querySelectorAll("div > span");
    const scoreEl = scoreSpans[scoreSpans.length - 1];
    if (scoreEl && scoreEl.textContent !== text) scoreEl.textContent = text;
    td.style.cursor = "pointer";
    return box;
  }
  function _renderVirtualCells(tr, courseIdx, course) {
    if (!tr || !course) return;
    const vts = _vtaskList(course);
    Array.prototype.forEach.call(tr.children, (td) => {
      const id = td.getAttribute ? td.getAttribute(VTASK_ATTR) : null;
      if (id === null || id === void 0) return;
      if (!vts.some((v) => String(v.task.entityId) === String(id))) _clearVirtualCell(td);
    });
    if (!vts.length) return;
    let rebuilt = false;
    for (const v of vts) {
      let td = null;
      Array.prototype.forEach.call(tr.children, (el) => {
        if (!td && el.getAttribute && String(el.getAttribute(VTASK_ATTR)) === String(v.task.entityId)) td = el;
      });
      if (!td) {
        const cands = _emptyTaskCells(tr);
        td = cands.length ? cands[0] : null;
        if (td) rebuilt = true;
      }
      if (!td) {
        console.info("[\u5185\u8054] \u8BE5\u884C\u6CA1\u6709\u7A7A\u4EFB\u52A1\u683C\uFF0C\u865A\u62DF\u4EFB\u52A1\u300C" + v.task.name + "\u300D\u4E0D\u4E0A\u8868\u683C\uFF08\u4ECD\u8BA1\u5165\u5E73\u65F6\u6210\u7EE9\uFF09");
        continue;
      }
      td.setAttribute(VTASK_ATTR, String(v.task.entityId));
      if (td === _taskEditing) continue;
      _paintVirtualCell(td, v, tr);
    }
    if (rebuilt) _renderTaskCells(tr, courseIdx, course);
  }
  function _closeTaskEditor() {
    const td = _taskEditing;
    _taskEditing = null;
    if (!td) return;
    const input = td.querySelector("[" + TASK_INPUT_ATTR + "]");
    if (input) {
      input._intsCancelled = true;
      input.remove();
    }
    const mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
    if (mine) mine.remove();
    const siteSpan = _siteScoreSpan(td);
    if (siteSpan) siteSpan.style.display = "";
  }
  function _beginTaskEdit(td, courseIdx, taskIdx) {
    if (!S.isCurrentYear) return;
    const course = S.simCourses[courseIdx];
    const task = course && course.tasks && course.tasks[taskIdx];
    const siteSpan = _siteScoreSpan(td);
    const host = siteSpan ? siteSpan.parentElement : null;
    if (!task || !siteSpan || !host) return;
    if (_taskEditing && _taskEditing !== td) _closeTaskEditor();
    const sim = _taskSimOf(task);
    const currentScore = sim !== null ? sim : typeof task.originalScore === "number" ? task.originalScore : null;
    const topScore = typeof task.topScore === "number" ? task.topScore : null;
    const mine = td.querySelector("[" + TASK_SCORE_ATTR + "]");
    if (mine) mine.style.display = "none";
    siteSpan.style.display = "none";
    const input = document.createElement("input");
    input.type = "number";
    input.setAttribute(TASK_INPUT_ATTR, "1");
    input.value = currentScore === null ? "" : String(currentScore);
    input.style.cssText = "width:80px;padding:2px;text-align:center;height:21px;box-sizing:border-box;";
    host.appendChild(input);
    _taskEditing = td;
    try {
      input.focus();
      input.select();
    } catch (e) {
    }
    let done = false;
    const repaint = () => safe("\u5185\u8054\u4EFB\u52A1\u91CD\u753B", () => {
      const row = td.closest("tr");
      if (row) _renderTaskCells(row, courseIdx, S.simCourses[courseIdx]);
    });
    const finish = () => {
      if (done || input._intsCancelled) return;
      done = true;
      let v = input.value.trim();
      if (v === "") v = null;
      else {
        let num = parseFloat(v);
        if (isNaN(num)) num = null;
        else if (num === -1) num = -1;
        else if (num < 0) num = currentScore;
        else if (topScore !== null && num > topScore) num = topScore;
        v = num;
      }
      _taskEditing = null;
      if (input.parentElement) input.remove();
      onTaskScoreChange(courseIdx, taskIdx, v);
      repaint();
    };
    input.addEventListener("blur", guardListener("\u5185\u8054\u4EFB\u52A1\u63D0\u4EA4", finish));
    input.addEventListener("keydown", guardListener("\u5185\u8054\u4EFB\u52A1\u952E\u76D8", (e) => {
      if (e.key === "Enter") finish();
      else if (e.key === "Escape") {
        done = true;
        _taskEditing = null;
        if (input.parentElement) input.remove();
        repaint();
      }
    }));
  }
  function _ciOfIdent(ident) {
    if (!ident || !S.simCourses) return -1;
    for (let i = 0; i < S.simCourses.length; i++) {
      if (courseIdent(S.simCourses[i]) === ident) return i;
    }
    return -1;
  }
  function _ciOfWindow(win) {
    const ident = win && win.el ? win.el.getAttribute("data-ie-ident") : null;
    const byIdent = _ciOfIdent(ident);
    if (byIdent >= 0) return byIdent;
    const n = parseInt(win.el.getAttribute("data-ie-ci") || "", 10);
    return isNaN(n) ? -1 : n;
  }
  function _scoreVal(ci, field) {
    const c = S.simCourses[ci];
    if (!c) return null;
    const sim = c.simGrades ? c.simGrades[field] : null;
    const orig = c.originalGrades ? c.originalGrades[field] : null;
    return { sim, orig, overridden: Math.abs((sim === null ? -999 : sim) - (orig === null ? -999 : orig)) > 1e-3 };
  }
  function _deltaInfo(sim, orig) {
    if (typeof sim !== "number" || typeof orig !== "number" || isNaN(sim) || isNaN(orig)) return null;
    const d = sim - orig;
    const dec = _dec();
    if (Math.abs(d) < 0.5 * Math.pow(10, -dec)) return null;
    return { text: " (" + (d > 0 ? "+" : "") + d.toFixed(dec) + ")", color: d > 0 ? COLOR_UP : COLOR_DOWN };
  }
  function _deltaSpanHtml(field, ci) {
    const v = _scoreVal(ci, field);
    const info = v ? _deltaInfo(v.sim, v.orig) : null;
    return '<span data-ie-delta="' + field + '" style="font-size:10px;white-space:nowrap;' + (info ? "color:" + info.color + ";" : "display:none;") + '">' + (info ? escapeHtml(info.text) : "") + "</span>";
  }
  function _applyDeltaSpan(sp, info) {
    if (!sp) return;
    sp.style.display = info ? "" : "none";
    sp.style.color = info ? info.color : "";
    const txt = info ? info.text : "";
    if (sp.textContent !== txt) sp.textContent = txt;
  }
  function _fieldHtml(ci, field, label) {
    const v = _scoreVal(ci, field);
    const shown = v.sim === null ? "" : _num(v.sim);
    return '<label style="display:inline-flex;align-items:center;gap:4px;margin-right:8px;"><span style="color:rgba(0,0,0,0.55);font-size:11px;">' + label + '</span><input data-ie-field="' + field + '" type="text" inputmode="decimal" value="' + escapeHtml(shown) + '" placeholder="\u2014" style="width:56px;padding:2px 4px;text-align:center;border:1px solid ' + (v.overridden ? "#1890ff" : "#d9d9d9") + ";border-radius:4px;font-size:12px;" + (v.overridden ? "background:#e6f7ff;" : "") + '">' + _deltaSpanHtml(field, ci) + "</label>";
  }
  function _readonlyHtml(ci, field, label, fKey) {
    const v = _scoreVal(ci, field);
    return '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:8px;"><span style="color:rgba(0,0,0,0.55);font-size:11px;">' + label + '</span><span data-ie-f="' + fKey + '" style="min-width:56px;text-align:center;font-size:12px;color:rgba(0,0,0,0.75);">' + (v.sim === null ? "\u2014" : _num(v.sim)) + "</span>" + _deltaSpanHtml(field, ci) + "</span>";
  }
  function _refreshEditorWindows() {
    for (const win of listWindows()) {
      if (win.kind !== IE_KIND) continue;
      const ci = _ciOfWindow(win);
      const c = ci >= 0 ? S.simCourses[ci] : null;
      if (!c) {
        closeWindow(win.key);
        continue;
      }
      win.el.setAttribute("data-ie-ci", String(ci));
      win.el.querySelectorAll("input[data-ie-field]").forEach((inp) => {
        if (document.activeElement === inp) return;
        const f = inp.getAttribute("data-ie-field");
        const v = _scoreVal(ci, f);
        inp.value = v.sim === null ? "" : _num(v.sim);
        inp.style.borderColor = v.overridden ? "#1890ff" : "#d9d9d9";
        inp.style.background = v.overridden ? "#e6f7ff" : "";
      });
      for (const term of ["s1", "s2"]) {
        const span = win.el.querySelector('[data-ie-f="' + IE_F_IDS[term] + '"]');
        if (!span) continue;
        const v = _scoreVal(ci, term + "f");
        span.textContent = v.sim === null ? "\u2014" : _num(v.sim);
      }
      win.el.querySelectorAll("[data-ie-delta]").forEach((sp) => {
        const f = sp.getAttribute("data-ie-delta");
        const v = _scoreVal(ci, f);
        _applyDeltaSpan(sp, v ? _deltaInfo(v.sim, v.orig) : null);
      });
      const star = win.el.querySelector("[data-ie-star]");
      if (star) star.style.display = c.showStar && (c.showStar.s1 || c.showStar.s2) ? "" : "none";
    }
  }
  function _commitField(ci, field, raw) {
    const m = /^(s[12])([pe])$/.exec(String(field || "").toLowerCase());
    if (!m) return;
    const term = m[1].toUpperCase();
    const isP = m[2] === "p";
    const val = String(raw == null ? "" : raw).trim();
    let num = null;
    if (val !== "") {
      num = parseFloat(val);
      if (isNaN(num)) return;
      if (num > 100) num = 100;
      if (num < 0) num = 0;
    }
    safe("points \u5185\u8054\u6539\u5206", () => {
      if (isP) onPStarChange(ci, term, num);
      else onExamScoreChange(ci, term, num);
    });
  }
  function _ieTitleHTML(course) {
    const starred = !!(course.showStar && (course.showStar.s1 || course.showStar.s2));
    return '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(course.subject || "") + '</div><div style="color:rgba(0,0,0,0.55);font-size:11px;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(course.name || "") + '<span data-ie-star style="color:#f5222d;cursor:help;' + (starred ? "" : "display:none;") + '" title="' + escapeHtml(t("\u5B66\u6821\u7ED9\u7684\u5206\u4E0E\u4EFB\u52A1\u660E\u7EC6\u7B97\u51FA\u7684\u5206\u4E0D\u4E00\u81F4\uFF08\u5DEE > 0.1\uFF09\uFF0C\u8BE5\u79D1\u6A21\u62DF\u4EC5\u4F9B\u53C2\u8003", "School value differs from the task-based estimate by more than 0.1")) + '"> *</span></div>';
  }
  function _ieBodyHTML(ci) {
    return '<div style="margin-bottom:6px;">' + _fieldHtml(ci, "s1p", "S1P") + _fieldHtml(ci, "s1e", "S1E") + _readonlyHtml(ci, "s1f", "S1F", "s1") + '</div><div style="margin-bottom:8px;">' + _fieldHtml(ci, "s2p", "S2P") + _fieldHtml(ci, "s2e", "S2E") + _readonlyHtml(ci, "s2f", "S2F", "s2") + '</div><div style="display:flex;gap:8px;align-items:center;border-top:1px solid #f0f0f0;padding-top:8px;"><button type="button" data-ie-act="detail" class="ant-btn ant-btn-link" style="padding:0;font-size:12px;">' + t("\u79D1\u76EE\u660E\u7EC6", "Breakdown") + '</button><span class="iw-note" style="margin-left:auto;font-size:11px;">' + t("P=\u5E73\u65F6\u5206 E=\u671F\u672B F=\u603B\u8BC4", "P=coursework E=exam F=final") + "</span></div>";
  }
  function _openEditor(tr, ci) {
    const course = S.simCourses[ci];
    if (!course) return;
    if (!S.isCurrentYear) return;
    const td = tr.children[2];
    if (!td) return;
    const key = IE_KIND + ":" + courseIdent(course);
    if (getWindow(key)) {
      raiseWindow(key);
      setWindowAnchor(key, td);
      const w = getWindow(key);
      if (w) w.el.setAttribute("data-ie-ci", String(ci));
      return;
    }
    const handle = openWindow({
      key,
      kind: IE_KIND,
      domId: "ints-inline-editor-" + ci,
      // 宽度要放得下"一行三个字段 + 各自的变化量"（S1P/S1E/S1F 一组）：
      // 三个字段全被改过时最宽，窄了会把变化量挤出窗口。
      anchorEl: td,
      width: 430,
      titleHTML: _ieTitleHTML(course),
      bodyHTML: _ieBodyHTML(ci)
    });
    handle.el.setAttribute("data-ie-ident", courseIdent(course));
    handle.el.setAttribute("data-ie-ci", String(ci));
    handle.body.addEventListener("change", guardListener("\u5185\u8054\u7A97\u53E3\u6539\u5206", (e) => {
      const inp = e.target && e.target.closest ? e.target.closest("input[data-ie-field]") : null;
      if (!inp) return;
      const idx = _ciOfWindow(getWindow(key) || { el: handle.el });
      if (idx < 0) return;
      _commitField(idx, inp.getAttribute("data-ie-field"), inp.value);
    }));
    handle.body.addEventListener("keydown", guardListener("\u5185\u8054\u7A97\u53E3\u56DE\u8F66", (e) => {
      if (e.key !== "Enter") return;
      const inp = e.target && e.target.closest ? e.target.closest("input[data-ie-field]") : null;
      if (inp) {
        e.preventDefault();
        inp.blur();
      }
    }));
    handle.body.addEventListener("click", guardListener("\u5185\u8054\u7A97\u53E3\u6309\u94AE", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-ie-act="detail"]') : null;
      if (!btn) return;
      const idx = _ciOfWindow(getWindow(key) || { el: handle.el });
      if (idx < 0) return;
      safe("points \u5185\u8054\u79D1\u76EE\u660E\u7EC6", () => {
        showSubjectDetailModal(idx, td);
      });
    }));
  }
  function _reanchorWindows() {
    for (const win of listWindows()) {
      if (win.kind !== IE_KIND && win.kind !== "detail") continue;
      const ident = win.el.getAttribute("data-ie-ident");
      const ci = _ciOfIdent(ident);
      if (ci < 0) {
        closeWindow(win.key);
        continue;
      }
      win.el.setAttribute("data-ie-ci", String(ci));
      const tr = _rowForCourse(ci);
      const td = tr ? tr.children[2] : null;
      if (td) setWindowAnchor(win.key, td);
    }
  }
  function _closeInlineWindows() {
    for (const win of listWindows()) {
      if (win.kind === IE_KIND || win.kind === "detail") closeWindow(win.key);
    }
  }
  function _headerFieldOf(h) {
    return FIELD_BY_LABEL[String(h && h.customColumnName || "").trim().toUpperCase()] || null;
  }
  function _headerVisibleUnderFilter(h) {
    const f = _headerFieldOf(h);
    if (!f) return true;
    return _activeFields().indexOf(f) >= 0;
  }
  function _sortFieldHeaders(list) {
    return list.map((h, i) => ({ h, i, o: FIELD_ORDER[String(h && h.customColumnName || "").trim().toUpperCase()] })).sort((a, b) => {
      const ao = a.o === void 0 ? -1 : a.o, bo = b.o === void 0 ? -1 : b.o;
      if (ao !== bo) return ao - bo;
      return a.i - b.i;
    }).map((x) => x.h);
  }
  function _activeFields() {
    const f = S.currentFilter;
    if (f === "s1") return ["s1p", "s1e", "s1f"];
    if (f === "s2") return ["s2p", "s2e", "s2f"];
    return ALL_FIELDS;
  }
  function _dec() {
    return _colsExpanded ? 2 : 1;
  }
  function _num(v) {
    return typeof v === "number" && !isNaN(v) ? v.toFixed(_dec()) : "\u2014";
  }
  function _delta(v) {
    return (v > 0 ? "+" : "") + v.toFixed(_dec());
  }
  function _findGradeVm() {
    if (_vm && _vm.$el && document.contains(_vm.$el)) return _vm;
    let el = document.querySelector(".grade") || document.querySelector(".section-content");
    if (!el) return null;
    let vm = null;
    for (let n = el; n && !vm; n = n.parentElement) {
      if (n.__vue__) vm = n.__vue__;
    }
    if (!vm) return null;
    let root = vm;
    while (root.$parent) root = root.$parent;
    const queue = [root], seen = /* @__PURE__ */ new Set();
    while (queue.length) {
      const cur = queue.shift();
      if (!cur || seen.has(cur)) continue;
      seen.add(cur);
      if (Array.isArray(cur.dynamicHeaders) && Array.isArray(cur.data) && "maxTaskNum" in cur) {
        _vm = cur;
        return cur;
      }
      for (const ch of cur.$children || []) queue.push(ch);
    }
    return null;
  }
  function _fieldValue(ci, field) {
    const c = S.originalCourses && S.originalCourses[ci];
    if (!c) return { score: null, level: null };
    const g = S.simCourses && S.simCourses[ci] && S.simCourses[ci].simGrades || c.originalGrades || {};
    const v = g[field];
    if (typeof v !== "number" || isNaN(v)) return { score: null, level: null };
    const score = v.toFixed(_dec());
    return { score, level: scoreToLetter(Number(score)) };
  }
  function _applyColumns(vm) {
    const isCurrYearNow = !!S.isCurrentYear;
    const keepAll = (_savedHeaders || []).filter((h) => h && h.customColumnId !== void 0 && String(h.customColumnId).indexOf(SYNTH_PREFIX) !== 0);
    const keep = keepAll.filter((h, i) => i === 0 && isCurrYearNow || _headerVisibleUnderFilter(h));
    const keptNames = new Set(keepAll.map((h) => String(h.customColumnName || "").trim().toUpperCase()));
    const owned = ALL_FIELDS.filter((f) => !keptNames.has(FIELD_LABEL[f]));
    const visible = _activeFields().filter((f) => owned.indexOf(f) >= 0);
    const headers = _sortFieldHeaders(keep.concat(visible.map((f) => ({
      customColumnId: SYNTH_PREFIX + f,
      customColumnName: FIELD_LABEL[f]
    }))));
    let sig = headers.map((h) => String(h.customColumnId)).join(",");
    const rows = vm.data || [];
    let keysMissing = false;
    for (const row of rows) {
      if (!row) {
        sig += "|";
        continue;
      }
      const cs = row.customColumnScores || {};
      const ci = _rowIndexOf(row);
      sig += "|" + ci;
      for (const f of owned) {
        const v = ci >= 0 ? _fieldValue(ci, f) : { score: null };
        sig += ":" + (v.score === null ? "-" : v.score);
        if (!(SYNTH_PREFIX + f in cs)) keysMissing = true;
      }
    }
    if (!keysMissing && sig === _colsSig) return;
    _colsSig = sig;
    vm.dynamicHeaders = headers;
    rows.forEach((row) => {
      if (!row) return;
      if (!row.customColumnScores) vm.$set(row, "customColumnScores", {});
      Object.keys(row.customColumnScores).forEach((k) => {
        if (k.indexOf(SYNTH_PREFIX) === 0 && owned.indexOf(k.slice(SYNTH_PREFIX.length)) < 0) {
          vm.$delete(row.customColumnScores, k);
        }
      });
      owned.forEach((f) => {
        vm.$set(row.customColumnScores, SYNTH_PREFIX + f, _fieldValue(_rowIndexOf(row), f));
      });
    });
    if (vm.$forceUpdate) vm.$forceUpdate();
  }
  function _rowIndexOf(row) {
    if (!row || !S.simCourses) return -1;
    const subject = row.subject, course = row.courseName;
    for (let i = 0; i < S.simCourses.length; i++) {
      const c = S.simCourses[i];
      if (_norm(c.subject) === _norm(subject) && _norm(c.name) === _norm(course)) return i;
    }
    for (let i = 0; i < S.simCourses.length; i++) {
      if (_norm(S.simCourses[i].name) === _norm(course)) return i;
    }
    return -1;
  }
  function _clearSyntheticColumns(vm) {
    (vm.data || []).forEach((row) => {
      if (!row || !row.customColumnScores) return;
      Object.keys(row.customColumnScores).forEach((k) => {
        if (k.indexOf(SYNTH_PREFIX) === 0) vm.$delete(row.customColumnScores, k);
      });
    });
    if (vm.$forceUpdate) vm.$forceUpdate();
  }
  function _hasSynthetic(vm) {
    return (vm.dynamicHeaders || []).some((h) => h && String(h.customColumnId).indexOf(SYNTH_PREFIX) === 0);
  }
  function _captureOriginalIfNeeded(vm) {
    if (!_hasSynthetic(vm)) _savedHeaders = (vm.dynamicHeaders || []).slice();
  }
  function _expandColumns(expand) {
    const vm = _findGradeVm();
    if (!vm) {
      console.warn("[\u5185\u8054] \u672A\u627E\u5230\u6210\u7EE9\u518C\u7EC4\u4EF6\uFF0C\u65E0\u6CD5\u5C55\u5F00\u5217\uFF08\u5B66\u6821\u9875\u9762\u7ED3\u6784\u53EF\u80FD\u5DF2\u53D8\uFF09");
      return false;
    }
    if (expand) {
      _captureOriginalIfNeeded(vm);
      _colsExpanded = true;
      _applyColumns(vm);
      console.log("[\u5185\u8054] \u5DF2\u5C55\u5F00\u5168\u90E8\u6210\u7EE9\u5217: " + (vm.dynamicHeaders || []).map((h) => h.customColumnName).join(", "));
    } else {
      _colsExpanded = false;
      _clearSyntheticColumns(vm);
      if (_savedHeaders !== null) vm.dynamicHeaders = _savedHeaders.slice();
      _savedHeaders = null;
      _colsSig = null;
      console.log("[\u5185\u8054] \u5DF2\u8FD8\u539F\u4E3A\u7AD9\u70B9\u539F\u59CB\u6210\u7EE9\u5217");
    }
    _refreshEditorWindows();
    return true;
  }
  function _menuPanelOf(kind) {
    const wrap = document.getElementById(kind === "calc" ? MENU_CALC_ID : MENU_SHOW_ID);
    return wrap ? wrap.querySelector("[" + MENU_PANEL_ATTR + "]") : null;
  }
  function _menuHostFor(kind) {
    return _menuPanelOf(kind);
  }
  function _buildMenu(bar, kind, label) {
    const wrap = document.createElement("span");
    wrap.id = kind === "calc" ? MENU_CALC_ID : MENU_SHOW_ID;
    wrap.style.cssText = "position:relative;display:inline-block;";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = kind === "calc" ? MENU_CALC_TRIGGER_ID : MENU_SHOW_TRIGGER_ID;
    trigger.className = "ant-btn ant-btn-link";
    trigger.style.cssText = "margin-left:16px;";
    trigger.dataset.intsMenu = kind;
    trigger.addEventListener("click", guardListener("\u5185\u8054\u83DC\u5355\u5F00\u5173", (e) => {
      e.preventDefault();
      e.stopPropagation();
      safe("\u5185\u8054\u83DC\u5355\u5F00\u5173", () => _toggleMenu(kind));
    }));
    const panel = document.createElement("div");
    panel.setAttribute(MENU_PANEL_ATTR, kind);
    panel.className = "ant-dropdown-menu";
    panel.style.cssText = "display:none;position:absolute;top:100%;left:16px;margin-top:4px;z-index:" + MENU_Z + ";min-width:150px;";
    wrap.appendChild(trigger);
    wrap.appendChild(panel);
    bar.appendChild(wrap);
    return { wrap, trigger, panel };
  }
  function _menuItem(panel, id) {
    const row = document.createElement("div");
    row.className = "ant-dropdown-menu-item";
    row.style.cssText = "padding:0;";
    const btn = document.createElement("button");
    btn.id = id;
    btn.type = "button";
    btn.className = "ant-btn ant-btn-link";
    btn.style.cssText = "margin:0;width:100%;text-align:left;";
    row.appendChild(btn);
    panel.appendChild(row);
    row.addEventListener("click", guardListener("\u5185\u8054\u83DC\u5355\u9879", () => {
      _closeMenus();
    }));
    return btn;
  }
  function _closeMenus() {
    _openMenu = null;
    [MENU_CALC_ID, MENU_SHOW_ID].forEach((id) => {
      const wrap = document.getElementById(id);
      const panel = wrap ? wrap.querySelector("[" + MENU_PANEL_ATTR + "]") : null;
      if (panel) panel.style.display = "none";
    });
    if (_menuOutside) {
      document.removeEventListener("mousedown", _menuOutside, true);
      _menuOutside = null;
    }
    if (_menuEsc) {
      document.removeEventListener("keydown", _menuEsc, true);
      _menuEsc = null;
    }
    if (_started) _renderMenuTriggers();
  }
  function _toggleMenu(kind) {
    if (kind === "calc" && !S.isCurrentYear) {
      console.log("[\u5185\u8054] \u5F80\u671F\u5B66\u5E74\u53EA\u8BFB\uFF1A\u8BA1\u7B97\u83DC\u5355\u5DF2\u7981\u7528");
      return;
    }
    if (_openMenu === kind) {
      _closeMenus();
      return;
    }
    _closeMenus();
    const panel = _menuPanelOf(kind);
    if (!panel) return;
    panel.style.display = "block";
    _openMenu = kind;
    _menuOutside = guardListener("\u5185\u8054\u83DC\u5355\u70B9\u5916\u5173\u95ED", (e) => {
      if (!_openMenu) return;
      const wrap = document.getElementById(_openMenu === "calc" ? MENU_CALC_ID : MENU_SHOW_ID);
      if (wrap && e.target && wrap.contains(e.target)) return;
      _closeMenus();
    });
    _menuEsc = guardListener("\u5185\u8054\u83DC\u5355 Esc", (e) => {
      if (e.key === "Escape") _closeMenus();
    });
    document.addEventListener("mousedown", _menuOutside, true);
    document.addEventListener("keydown", _menuEsc, true);
    _renderMenuTriggers();
  }
  function _renderMenuTriggers() {
    const pairs = [
      ["calc", MENU_CALC_TRIGGER_ID, t("\u8BA1\u7B97", "Calculate"), !!_calcOpen],
      ["show", MENU_SHOW_TRIGGER_ID, t("\u663E\u793A", "View"), !!(_colsExpanded || _overviewOpen)]
    ];
    for (const [kind, id, label, active] of pairs) {
      const btn = document.getElementById(id);
      if (!btn) continue;
      const disabled = kind === "calc" && !S.isCurrentYear;
      const html = iconChevron(_openMenu === kind) + "<span>" + escapeHtml(label) + "</span>";
      if (btn.innerHTML !== html) btn.innerHTML = html;
      const color = disabled ? "rgba(0,0,0,0.25)" : active ? COLOR_ACTIVE : COLOR_IDLE;
      if (btn.style.color !== color) btn.style.color = color;
      if (disabled) {
        if (btn.style.cursor !== "not-allowed") btn.style.cursor = "not-allowed";
        const tip = t("\u5F80\u671F\u5B66\u5E74\u53EA\u8BFB\uFF1A\u4E0D\u80FD\u6A21\u62DF", "Past school year is read-only");
        if (btn.getAttribute("title") !== tip) btn.setAttribute("title", tip);
      } else {
        if (btn.style.cursor) btn.style.cursor = "";
        if (btn.getAttribute("title")) btn.removeAttribute("title");
      }
    }
  }
  function _renderMenus(bar) {
    if (!document.getElementById(MENU_CALC_ID)) _buildMenu(bar, "calc", t("\u8BA1\u7B97", "Calculate"));
    if (!document.getElementById(MENU_SHOW_ID)) _buildMenu(bar, "show", t("\u663E\u793A", "View"));
    _orderToolbarNodes(bar);
  }
  function _orderToolbarNodes(bar) {
    const yearItem = bar.querySelector(".filter-item");
    const termSel = document.getElementById(TERM_ID);
    const termItem = termSel && termSel.closest("[data-ints-term]") || bar.querySelector("[data-ints-term]");
    bar.querySelectorAll("[data-ints-term]").forEach((el) => {
      if (!el.querySelector("#" + TERM_ID)) el.remove();
    });
    const ddlWrap = document.getElementById("intschool-deadline-wrap");
    const calc = document.getElementById(MENU_CALC_ID);
    const show = document.getElementById(MENU_SHOW_ID);
    const placeAfter = (node, prev) => {
      if (!node || !prev || node === prev) return;
      if (node.parentElement !== bar) {
        prev.insertAdjacentElement("afterend", node);
        return;
      }
      if (node.previousElementSibling === prev) return;
      prev.insertAdjacentElement("afterend", node);
    };
    placeAfter(termItem, yearItem);
    placeAfter(ddlWrap, termItem || yearItem);
    placeAfter(calc, ddlWrap || termItem || yearItem);
    placeAfter(show, calc || ddlWrap || termItem || yearItem);
  }
  function _renderToolbar() {
    const bar = document.querySelector(".grade .filter-container");
    if (!bar) return false;
    if (!S.isCurrentYear && _openMenu === "calc") _closeMenus();
    _renderMenus(bar);
    _renderDetailButton();
    _renderCalcOverview();
    _renderCalcToggle();
    _renderVirtualTaskButton();
    _renderResetButton();
    _renderTermSelect(bar);
    _renderCalcCard();
    _renderMenuTriggers();
    _orderToolbarNodes(bar);
    return true;
  }
  function _renderDetailButton() {
    const host = _menuHostFor("show");
    if (!host) return null;
    let btn = document.getElementById(TOGGLE_ID);
    if (!btn) {
      btn = _menuItem(host, TOGGLE_ID);
      btn.addEventListener("click", guardListener("\u5185\u8054\u5217\u5F00\u5173", (e) => {
        e.preventDefault();
        safe("\u5185\u8054\u5217\u5F00\u5173", () => {
          if (_expandColumns(!_colsExpanded)) {
            _renderToolbar();
            decoratePointsRows();
          }
        });
      }));
    }
    const html = iconTable() + "<span>" + t("\u8BE6\u60C5", "Details") + "</span>";
    if (btn.innerHTML !== html) btn.innerHTML = html;
    const color = _colsExpanded ? COLOR_ACTIVE : COLOR_IDLE;
    if (btn.style.color !== color) btn.style.color = color;
    return btn;
  }
  function _renderVirtualTaskButton() {
    const host = _menuHostFor("calc");
    if (!host) return null;
    let btn = document.getElementById(VTASK_BTN_ID);
    if (!btn) {
      btn = _menuItem(host, VTASK_BTN_ID);
      btn.addEventListener("click", guardListener("\u5185\u8054\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", (e) => {
        e.preventDefault();
        safe("\u5185\u8054\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", _addVirtualTask);
      }));
    }
    const html = iconPlus() + "<span>" + t("\u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1", "Add Virtual Task") + "</span>";
    if (btn.innerHTML !== html) btn.innerHTML = html;
    btn.style.color = COLOR_ACTIVE;
    return btn;
  }
  function _addVirtualTask() {
    if (!S.isCurrentYear || !S.simCourses || !S.simCourses.length) {
      console.info("[\u5185\u8054] \u6DFB\u52A0\u865A\u62DF\u4EFB\u52A1\uFF1A\u5F53\u524D\u5B66\u5E74\u6570\u636E\u672A\u5C31\u7EEA\uFF0C\u5148\u7B49\u9875\u9762\u52A0\u8F7D\u5B8C\uFF08isCurrentYear=" + !!S.isCurrentYear + " courses=" + (S.simCourses && S.simCourses.length || 0) + "\uFF09");
      return;
    }
    showVirtualTaskModal(null, () => {
      _renderToolbar();
      decoratePointsRows();
    });
  }
  function _hasTargetGPA() {
    return typeof S.targetUWGPA === "number" || typeof S.targetWGPA === "number";
  }
  function _siteScopeAttr() {
    const el = document.querySelector(".grade .filter-container .filter-item");
    if (!el) return null;
    for (let i = 0; i < el.attributes.length; i++) {
      if (el.attributes[i].name.indexOf("data-v-") === 0) return el.attributes[i].name;
    }
    return null;
  }
  function _renderTermSelect(bar) {
    let sel = document.getElementById(TERM_ID);
    if (!sel) {
      const item = document.createElement("div");
      item.className = "filter-item";
      item.setAttribute("data-ints-term", "1");
      const label = document.createElement("span");
      label.className = "filter-text";
      label.textContent = t("\u5B66\u671F", "Term");
      sel = document.createElement("select");
      sel.id = TERM_ID;
      sel.className = "filter-input";
      sel.style.cssText = "height:32px;box-sizing:border-box;padding:0 8px;margin-left:8px;border:1px solid #d9d9d9;border-radius:4px;background:#fff;font-size:14px;color:rgba(0,0,0,0.65);";
      [["all", t("\u663E\u793A\u5168\u90E8", "Show All")], ["s1", t("\u4EC5 S1", "Only S1")], ["s2", t("\u4EC5 S2", "Only S2")]].forEach((pair) => {
        const o = document.createElement("option");
        o.value = pair[0];
        o.textContent = pair[1];
        sel.appendChild(o);
      });
      sel.addEventListener("change", guardListener("\u5185\u8054\u5B66\u671F\u7B5B\u9009", (e) => {
        const v = e.target.value === "s1" || e.target.value === "s2" ? e.target.value : "all";
        S.currentFilter = v;
        S.lastSelectedFilter = v;
        safe("\u5185\u8054\u5B66\u671F\u7B5B\u9009\u6301\u4E45\u5316", () => flushSave(true));
        if (_colsExpanded) {
          const vm = _findGradeVm();
          if (vm) safe("\u5185\u8054\u5B66\u671F\u7B5B\u9009\u91CD\u5199\u5217", () => {
            _captureOriginalIfNeeded(vm);
            _applyColumns(vm);
          });
        }
        decoratePointsRows();
        e.target.blur();
      }));
      const scopeAttr = _siteScopeAttr();
      if (scopeAttr) {
        item.setAttribute(scopeAttr, "");
        label.setAttribute(scopeAttr, "");
        sel.setAttribute(scopeAttr, "");
      } else {
        label.style.cssText = "font-size:14px;color:rgba(0,0,0,0.85);margin-right:8px;";
      }
      item.appendChild(label);
      item.appendChild(sel);
      bar.appendChild(item);
    }
    const want = S.currentFilter === "s1" || S.currentFilter === "s2" ? S.currentFilter : "all";
    if (sel.value !== want) sel.value = want;
    return sel;
  }
  function _onTargetChanged() {
    _renderToolbar();
    decoratePointsRows();
  }
  function iconBarChart() {
    return '<i class="anticon anticon-bar-chart" style="margin-right:4px;"><svg viewBox="64 64 896 896" data-icon="bar-chart" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + ANTD_BAR_CHART_PATH + '"></path></svg></i>';
  }
  function _calcCard() {
    const bar = document.querySelector(".grade .filter-container");
    if (!bar) return null;
    let card = document.getElementById(CALC_CARD_ID);
    if (!card) {
      card = document.createElement("div");
      card.id = CALC_CARD_ID;
      card.className = "ant-card ant-card-bordered";
      card.style.cssText = "margin:0 0 12px 0;";
      card.innerHTML = '<div class="ant-card-head" style="min-height:auto;padding:0 16px;"><div class="ant-card-head-wrapper"><div class="ant-card-head-title" style="padding:10px 0;">' + escapeHtml(t("\u76EE\u6807GPA\u8BA1\u7B97", "Target GPA")) + '</div></div></div><div class="ant-card-body" style="padding:12px 16px;"><div id="ints-calc-target"></div></div>';
    }
    if (card.previousElementSibling !== bar) bar.insertAdjacentElement("afterend", card);
    return card;
  }
  function _renderCalcTarget(host) {
    if (!host.getAttribute("data-ints-built")) {
      host.setAttribute("data-ints-built", "1");
      host.innerHTML = '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><span style="color:#8c8c8c;min-width:66px;">' + escapeHtml(t("\u76EE\u6807 GPA", "Target GPA")) + '</span><span id="ints-calc-targetctl" style="display:inline-flex;align-items:center;font-size:12px;white-space:nowrap;"></span><button id="' + TARGET_TOGGLE_ID + '" type="button" class="ant-btn ant-btn-link" style="margin:0;padding:0;height:auto;font-size:12px;"></button></div><div id="target-gap-summary" style="font-size:11px;color:#666;margin-top:4px;"></div><div id="target-detail-table" style="margin-top:4px;"></div>';
      host.addEventListener("click", guardListener("\u5185\u8054\u76EE\u6807GPA\u660E\u7EC6\u5F00\u5173", (e) => {
        if (!e.target || !e.target.closest || !e.target.closest("#" + TARGET_TOGGLE_ID)) return;
        e.preventDefault();
        _targetStripOpen = !_targetStripOpen;
        _renderToolbar();
      }));
    }
    const ctl = host.querySelector("#ints-calc-targetctl");
    const has = _hasTargetGPA();
    if (ctl && (!ctl.getAttribute("data-ints-built") || _targetHasState !== has)) {
      ctl.setAttribute("data-ints-built", "1");
      ctl.innerHTML = buildTargetGPAControlsHTML("display:flex;align-items:center;gap:6px;");
      _targetHasState = has;
      attachTargetGPAEvents(ctl, guardListener("\u5185\u8054\u76EE\u6807GPA", _onTargetChanged));
    }
    const hint = ctl && ctl.querySelector("#target-max-hint");
    if (hint) hint.textContent = maxGPAHintText();
    const btn = host.querySelector("#" + TARGET_TOGGLE_ID);
    const open = _targetStripOpen && has;
    if (btn) {
      btn.style.display = has ? "" : "none";
      btn.innerHTML = iconChevron(open) + "<span>" + t("\u660E\u7EC6", "Detail") + "</span>";
      btn.style.color = open ? COLOR_ACTIVE : COLOR_IDLE;
    }
    if (open) safe("\u5185\u8054\u76EE\u6807GPA\u660E\u7EC6", () => renderTargetGapSummary(host));
    else {
      const sum = host.querySelector("#target-gap-summary");
      const det = host.querySelector("#target-detail-table");
      if (sum) sum.innerHTML = "";
      if (det) det.innerHTML = "";
    }
    return host;
  }
  function _renderCalcOverview() {
    const host = _menuHostFor("show");
    let btn = document.getElementById(OVERVIEW_TOGGLE_ID);
    if (host && !btn) {
      btn = _menuItem(host, OVERVIEW_TOGGLE_ID);
      btn.addEventListener("click", guardListener("\u5185\u8054\u591A\u5E74\u7EA7\u603B\u89C8\u5F00\u5173", (e) => {
        e.preventDefault();
        _overviewOpen = !_overviewOpen;
        _renderToolbar();
        if (_overviewOpen && !_overviewLoaded) {
          _overviewFailed = false;
          safeAsync("\u5185\u8054\u591A\u5E74\u7EA7\u603B\u89C8", async () => {
            _renderOverviewLoading();
            const timer = setInterval(() => {
              safe("\u603B\u89C8\u52A0\u8F7D\u8FDB\u5EA6", _renderOverviewLoading);
            }, 200);
            try {
              await loadMultiYearData();
              _overviewLoaded = true;
              _setOverviewError("");
            } catch (err) {
              console.warn("[\u5185\u8054] \u591A\u5E74\u7EA7\u603B\u89C8\u52A0\u8F7D\u5931\u8D25: " + (err && err.message || err));
              _overviewFailed = true;
              _setOverviewError(t("\u52A0\u8F7D\u5931\u8D25", "Load failed"));
              _renderOverviewLoading();
              throw err;
            } finally {
              clearInterval(timer);
            }
            _renderToolbar();
          });
        }
      }));
    }
    if (btn) {
      const html = iconBarChart() + "<span>" + t("G9-G12 \u603B\u89C8", "G9-G12 Overview") + "</span>";
      if (btn.innerHTML !== html) btn.innerHTML = html;
      const color = _overviewOpen ? COLOR_ACTIVE : COLOR_IDLE;
      if (btn.style.color !== color) btn.style.color = color;
    }
    _renderOverviewView();
    return btn;
  }
  function _renderOverviewView() {
    let view = document.getElementById(OVERVIEW_VIEW_ID);
    if (!_overviewOpen) {
      if (view) view.remove();
      if (_overviewOutside) {
        document.removeEventListener("mousedown", _overviewOutside, true);
        _overviewOutside = null;
      }
      _overviewSig = "";
      return null;
    }
    if (!view) {
      view = document.createElement("div");
      view.id = OVERVIEW_VIEW_ID;
      view.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;z-index:60;background:#fff;overflow:auto;padding:16px 24px;box-sizing:border-box;border-radius:4px;";
      view.innerHTML = '<div style="display:flex;align-items:center;border-bottom:1px solid #f0f0f0;padding-bottom:10px;margin-bottom:12px;"><span style="font-size:16px;font-weight:600;">' + escapeHtml(t("G9-G12 \u591A\u5E74\u7EA7\u603B\u89C8", "G9-G12 Multi-year Overview")) + '</span><span id="ints-overview-hint" style="font-size:12px;color:#d4380d;margin-left:12px;"></span><button id="ints-overview-close" type="button" class="ant-btn ant-btn-link" style="margin-left:auto;">' + iconChevron(false) + "<span>" + escapeHtml(t("\u8FD4\u56DE\u6210\u7EE9\u518C", "Back to gradebook")) + '</span></button></div><div id="ints-overview-loading" style="display:none;min-height:60vh;align-items:center;justify-content:center;"></div><div id="ints-overview-body" style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;"><div id="main-table-container" style="flex:1 1 560px;min-width:320px;"></div><div id="task-panel-container" style="flex:0 0 auto;width:520px;max-width:100%;"></div></div>';
      const grade = document.querySelector(".grade");
      if (grade) {
        try {
          if (getComputedStyle(grade).position === "static") grade.style.position = "relative";
        } catch (e) {
        }
        grade.appendChild(view);
      } else {
        view.style.position = "fixed";
        document.body.appendChild(view);
      }
      _overviewOutside = guardListener("\u603B\u89C8\u89C6\u56FE\u70B9\u5916\u5173\u95ED", (e) => {
        if (!_overviewOpen) return;
        const el = document.getElementById(OVERVIEW_VIEW_ID);
        if (!el) return;
        const t2 = e.target;
        if (t2 === el || el.contains && el.contains(t2)) return;
        if (t2 && t2.closest && t2.closest("#" + OVERVIEW_TOGGLE_ID)) return;
        _overviewOpen = false;
        _renderToolbar();
      });
      document.addEventListener("mousedown", _overviewOutside, true);
      view.addEventListener("click", guardListener("\u603B\u89C8\u89C6\u56FE\u5173\u95ED", (e) => {
        if (!e.target || !e.target.closest || !e.target.closest("#ints-overview-close")) return;
        e.preventDefault();
        _overviewOpen = false;
        _renderToolbar();
      }));
      registerMultiYearHost(view);
    }
    _syncOverviewStage(view, _overviewLoaded);
    if (!_overviewLoaded) return view;
    const sig = _overviewSignature();
    if (sig === _overviewSig) return view;
    safe("\u603B\u89C8\u89C6\u56FE\u6E32\u67D3", () => renderMultiYearPanel(view));
    _overviewSig = sig;
    return view;
  }
  function _syncOverviewStage(view, loaded) {
    if (!view) return;
    const box = view.querySelector("#ints-overview-loading");
    const body = view.querySelector("#ints-overview-body");
    if (box) box.style.display = loaded ? "none" : "flex";
    if (body) body.style.display = loaded ? "flex" : "none";
    if (!loaded) _renderOverviewLoading();
  }
  function _renderOverviewLoading() {
    const box = document.getElementById("ints-overview-loading");
    if (!box) return;
    if (_overviewFailed) {
      if (box.getAttribute("data-ints-stage") !== "fail") {
        box.setAttribute("data-ints-stage", "fail");
        box.innerHTML = '<div style="font-size:14px;color:#8c8c8c;">' + escapeHtml(t("\u52A0\u8F7D\u5931\u8D25", "Load failed")) + "</div>";
      }
      return;
    }
    let label = document.getElementById(OVERVIEW_COUNT_ID);
    if (!label || box.getAttribute("data-ints-stage") !== "loading") {
      box.setAttribute("data-ints-stage", "loading");
      box.innerHTML = loadingBlockHtml('<span id="' + OVERVIEW_COUNT_ID + '"></span>', "0");
      label = document.getElementById(OVERVIEW_COUNT_ID);
      if (!label) return;
    }
    const text = t("\u52A0\u8F7D\u4E2D...", "Loading...") + loadingCountText(S.loadingRequestCount, S.expectedRequestCount);
    if (label.textContent !== text) label.textContent = text;
  }
  function _overviewSignature() {
    let sig = (S.multiYearEntries || []).length + "|" + JSON.stringify(S.multiYearGPAOverrides || {});
    for (const e of S.multiYearEntries || []) {
      const g = e.simCourses || [];
      for (const c of g) {
        sig += "|" + (c && c.simGrades ? c.simGrades.s1f + "," + c.simGrades.s2f : "-");
      }
    }
    return sig;
  }
  function _setOverviewError(text) {
    const el = document.getElementById("ints-overview-hint");
    if (el) el.textContent = text || "";
  }
  function _renderCalcCard() {
    const usable = !!S.isCurrentYear && !S.isMultiYearMode && _calcOpen;
    let card = document.getElementById(CALC_CARD_ID);
    if (!usable) {
      if (card) card.remove();
      return null;
    }
    card = _calcCard();
    if (!card) return null;
    const target = card.querySelector("#ints-calc-target");
    if (target) safe("\u5185\u8054\u76EE\u6807GPA", () => _renderCalcTarget(target));
    return card;
  }
  function _renderResetButton() {
    const host = _menuHostFor("calc");
    if (!host) return null;
    let btn = document.getElementById(RESET_ID);
    if (!btn) {
      btn = _menuItem(host, RESET_ID);
      btn.innerHTML = iconSync() + "<span>" + t("\u6E05\u7A7A\u6A21\u62DF", "Reset Simulations") + "</span>";
      btn.style.color = "#f5222d";
      btn.addEventListener("click", guardListener("\u5185\u8054\u6E05\u7A7A\u6A21\u62DF", (e) => {
        e.preventDefault();
        safe("\u5185\u8054\u6E05\u7A7A\u6A21\u62DF", () => resetSimulations());
        console.log("[\u5185\u8054] \u5DF2\u6E05\u7A7A\u6A21\u62DF\u6570\u636E\uFF08\u6821\u51C6\u4FE1\u606F\u4E0E\u661F\u6807\u4FDD\u7559\uFF09");
        decoratePointsRows();
      }));
    }
    return btn;
  }
  function _renderCalcToggle() {
    const host = _menuHostFor("calc");
    if (!host) return null;
    let btn = document.getElementById(CALC_TOGGLE_ID);
    if (!btn) {
      btn = _menuItem(host, CALC_TOGGLE_ID);
      btn.addEventListener("click", guardListener("\u5185\u8054\u76EE\u6807GPA\u5F00\u5173", (e) => {
        e.preventDefault();
        _calcOpen = !_calcOpen;
        _renderToolbar();
      }));
    }
    const html = iconBarChart() + "<span>" + t("\u76EE\u6807GPA\u8BA1\u7B97", "Target GPA") + "</span>";
    if (btn.innerHTML !== html) btn.innerHTML = html;
    const color = _calcOpen ? COLOR_ACTIVE : COLOR_IDLE;
    if (btn.style.color !== color) btn.style.color = color;
    return btn;
  }
  function getInlineStats() {
    return __spreadValues({}, _stats);
  }
  function _decorate() {
    if (!_isPointsPage() || !_inlineEnabled()) return;
    if (!S.simCourses || !S.simCourses.length) return;
    if (S.isMultiYearMode) return;
    _renderGpa();
    _renderToolbar();
    _synthThCache = null;
    if (_colsExpanded) {
      const vm = _findGradeVm();
      if (vm) {
        _captureOriginalIfNeeded(vm);
        _applyColumns(vm);
      }
    }
    const rows = _rows();
    const used = /* @__PURE__ */ new Set();
    let matched = 0, unmatched = 0;
    rows.forEach((tr) => {
      const info = _rowInfo(tr);
      const idx = _matchCourseIndex(info, used);
      if (idx < 0) {
        unmatched++;
        const box = tr.querySelector("[data-ints-sim]");
        if (box) box.remove();
        _restoreScoreCell(tr.children[2]);
        Array.prototype.forEach.call(tr.children, (td) => {
          if (td.getAttribute && td.getAttribute(VTASK_ATTR) !== null) _clearVirtualCell(td);
        });
        if (tr.children[2]) tr.children[2].setAttribute(INLINE_ATTR, "1");
        return;
      }
      used.add(idx);
      matched++;
      _renderRow(tr, idx);
    });
    safe("\u7A97\u53E3\u91CD\u65B0\u951A\u5B9A", _reanchorWindows);
    safe("\u5B66\u6821\u6570\u636E\u5BF9\u8D26", _checkSchoolDataDrift);
    _stats = { rows: rows.length, matched, unmatched, ts: Date.now() };
  }
  function decoratePointsRows() {
    safe("points \u5185\u8054\u88C5\u9970", _decorate);
  }
  function _resetDriftCheckForTest() {
    _driftCheckedAt = 0;
    _driftRefreshing = false;
  }
  function _siteCountableTasks(row) {
    const out = [];
    for (const t2 of row && row.taskScores || []) {
      if (!t2) continue;
      const id = parseInt(t2.entityId || t2.taskStudentId || t2.id, 10);
      if (!id) continue;
      const endDate = t2.endDate;
      const termRaw = t2.term || t2.schoolYearTerm || null;
      if (endDate && getTermFromDate(endDate, termRaw) === null) continue;
      out.push({
        id,
        score: t2.score === null || t2.score === void 0 ? null : Number(t2.score),
        topScore: t2.topScore === null || t2.topScore === void 0 ? null : Number(t2.topScore)
      });
    }
    return out;
  }
  function _checkSchoolDataDrift() {
    if (!S.isCurrentYear || !S.simCourses || !S.simCourses.length) return false;
    if (_driftRefreshing || _driftRefreshes >= DRIFT_MAX_REFRESH) return false;
    const now = Date.now();
    if (now - _driftCheckedAt < DRIFT_CHECK_MS) return false;
    const vm = _findGradeVm();
    if (!vm || !Array.isArray(vm.data) || !vm.data.length) return false;
    let compared = 0, drift = false, why = "";
    for (const row of vm.data) {
      if (!row || !Array.isArray(row.taskScores) || !row.taskScores.length) continue;
      const ci = _rowIndexOf(row);
      if (ci < 0) continue;
      const course = S.simCourses[ci];
      if (!course) continue;
      compared++;
      const site = /* @__PURE__ */ new Map();
      for (const t2 of _siteCountableTasks(row)) site.set(String(t2.id), t2);
      const mine = /* @__PURE__ */ new Map();
      for (const t2 of course.tasks || []) {
        if (t2.isVirtual) continue;
        const id = parseInt(t2.entityId, 10);
        if (!id) continue;
        mine.set(String(id), {
          score: t2.originalScore === null || t2.originalScore === void 0 ? null : Number(t2.originalScore),
          topScore: t2.topScore === null || t2.topScore === void 0 ? null : Number(t2.topScore)
        });
      }
      for (const [id, sv] of site) {
        const mv = mine.get(id);
        if (!mv) {
          drift = true;
          why = "\u7AD9\u70B9\u591A\u4E86\u4EFB\u52A1 " + id;
          break;
        }
        if (mv.score !== sv.score || mv.topScore !== sv.topScore) {
          drift = true;
          why = "\u4EFB\u52A1 " + id + " \u5206\u6570 " + mv.score + "/" + mv.topScore + " \u2192 " + sv.score + "/" + sv.topScore;
          break;
        }
      }
      if (drift) break;
    }
    if (!compared) return false;
    _driftCheckedAt = now;
    if (!drift) return false;
    _driftRefreshes++;
    console.log("[\u7F13\u5B58] \u7AD9\u70B9\u6210\u7EE9\u518C\u4E0E\u672C\u5730\u7684\u5F53\u524D\u5B66\u5E74\u6570\u636E\u4E0D\u4E00\u81F4\uFF08" + why + "\uFF09\uFF0C\u91CD\u65B0\u62C9\u53D6\u2026");
    _driftRefreshing = true;
    safeAsync("\u5B66\u6821\u6570\u636E\u5BF9\u8D26\u91CD\u62C9", async () => {
      try {
        const ok = await loadPageYearData({ force: true });
        if (ok) decoratePointsRows();
      } catch (e) {
        console.warn("[\u7F13\u5B58] \u91CD\u65B0\u62C9\u53D6\u5931\u8D25\uFF0C\u7EE7\u7EED\u4F7F\u7528\u7F13\u5B58\u6570\u636E: " + (e && e.message || e));
      } finally {
        _driftRefreshing = false;
      }
    });
    return true;
  }
  function _startAutoCalibrate() {
    if (!S.isCurrentYear) return;
    safeAsync("\u5185\u8054\u661F\u6807\u81EA\u52A8\u6821\u51C6", async () => {
      await autoCalibrateStarredCourses();
      _decorate();
    });
  }
  async function _ensureData() {
    if (_loading) return false;
    _loading = true;
    try {
      const { entry } = await resolvePageYear();
      if (!entry) {
        console.warn("[\u5185\u8054] \u65E0\u6CD5\u5B9A\u4F4D\u7AD9\u70B9\u9875\u9762\u7684\u5B66\u5E74");
        return false;
      }
      const sameYear = String(S.currentYearKey) === String(entry.key);
      if (sameYear && S.isCurrentYear && S.simCourses && S.simCourses.length) {
        _startAutoCalibrate();
        return true;
      }
      console.log("[\u5185\u8054] \u52A0\u8F7D\u7AD9\u70B9\u9875\u9762\u9009\u4E2D\u7684\u5B66\u5E74: " + entry.value);
      const ok = await loadPageYearData();
      if (ok) _startAutoCalibrate();
      return ok;
    } catch (e) {
      console.warn("[\u5185\u8054] \u5B66\u5E74\u6570\u636E\u52A0\u8F7D\u5931\u8D25\uFF08\u5DF2\u9694\u79BB\uFF0C\u9875\u9762\u4FDD\u6301\u539F\u6837\uFF09: " + (e && e.message || e));
      return false;
    } finally {
      _loading = false;
    }
  }
  function _pageYearText() {
    const el = document.querySelector(".grade .ant-select-selection-selected-value") || document.querySelector(".grade .ant-select-selection-item");
    return el ? el.textContent.trim() : null;
  }
  function _hasUndecoratedRows() {
    const rows = _rows();
    for (const tr of rows) {
      const scoreTd = tr.children[2];
      if (scoreTd && scoreTd.getAttribute(INLINE_ATTR) !== "1") return true;
    }
    return false;
  }
  function _shouldSchedule() {
    if (!_isPointsPage() || !_inlineEnabled()) return false;
    if (!S.simCourses || !S.simCourses.length) return false;
    if (!document.getElementById(GPA_ID)) return true;
    if (_hasUndecoratedRows()) return true;
    return _pageYearText() !== _lastPageYearText;
  }
  function _schedule(delay) {
    if (_timer) return;
    _timer = setTimeout(() => {
      _timer = null;
      safe("points \u5185\u8054\u8C03\u5EA6", () => {
        _checkYearChange();
        decoratePointsRows();
      });
    }, delay);
  }
  function _checkYearChange() {
    const txt = _pageYearText();
    if (txt === null) return;
    if (_lastPageYearText === null) {
      _lastPageYearText = txt;
      return;
    }
    if (txt === _lastPageYearText) return;
    const known = (S.yearList || []).some((y) => String(y.value) === txt);
    _lastPageYearText = txt;
    if (!known) {
      console.log("[\u5185\u8054] \u5B66\u5E74\u6587\u672C\u53D8\u6210 " + txt + "\uFF08\u4E0D\u5728\u5B66\u5E74\u5217\u8868\u91CC\uFF09\uFF0C\u5FFD\u7565\u8FD9\u6B21\u53D8\u5316");
      return;
    }
    console.log("[\u5185\u8054] \u7AD9\u70B9\u5B66\u5E74\u5207\u6362\u4E3A " + txt + "\uFF0C\u91CD\u65B0\u52A0\u8F7D");
    safe("points \u5185\u8054\u6362\u5E74", () => {
      _ensureData().then((ok) => {
        if (ok) decoratePointsRows();
      }).catch(() => {
      });
    });
  }
  function _start() {
    if (_started) return;
    _started = true;
    console.log("[\u5185\u8054] /points \u5185\u8054\u6A21\u62DF\u542F\u52A8");
    if (S.lastSelectedFilter === "all" || S.lastSelectedFilter === "s1" || S.lastSelectedFilter === "s2") {
      S.currentFilter = S.lastSelectedFilter;
    }
    setCourseChangeListener((courseIdx) => {
      if (!_isPointsPage() || !_inlineEnabled()) return;
      if (courseIdx === -1) decoratePointsRows();
      else if (S.simCourses[courseIdx]) {
        const tr = _rowForCourse(courseIdx);
        if (tr) _renderRow(tr, courseIdx);
        _renderGpa();
      }
      _refreshEditorWindows();
      safe("\u660E\u7EC6\u7A97\u53E3\u5237\u65B0", refreshSubjectDetailWindows);
    });
    _lastPageYearText = _pageYearText();
    setTimeout(() => {
      safe("points \u5185\u8054\u9996\u6B21\u52A0\u8F7D", () => {
        _ensureData().then((ok) => {
          if (ok) decoratePointsRows();
        }).catch(() => {
        });
      });
    }, 600);
    _observer = new MutationObserver(guardListener("points \u5185\u8054\u89C2\u5BDF", () => {
      if (_shouldSchedule()) _schedule(DECORATE_DEBOUNCE_MS);
    }));
    _observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("popstate", guardListener("points \u5185\u8054\u8FD4\u56DE", () => _schedule(400)));
  }
  function _rowForCourse(courseIdx) {
    const rows = _rows();
    const used = /* @__PURE__ */ new Set();
    for (const tr of rows) {
      const idx = _matchCourseIndex(_rowInfo(tr), used);
      if (idx < 0) continue;
      used.add(idx);
      if (idx === courseIdx) return tr;
    }
    return null;
  }
  function stopPointsInline() {
    if (!_started) return;
    if (_observer) {
      _observer.disconnect();
      _observer = null;
    }
    if (_timer) {
      clearTimeout(_timer);
      _timer = null;
    }
    _closeInlineWindows();
    _closeTaskEditor();
    safe("\u5185\u8054\u5217\u8FD8\u539F", () => {
      if (_colsExpanded) _expandColumns(false);
    });
    const gpa = document.getElementById(GPA_ID);
    if (gpa) gpa.remove();
    _closeMenus();
    [
      TERM_ID,
      TARGET_TOGGLE_ID,
      CALC_TOGGLE_ID,
      CALC_CARD_ID,
      OVERVIEW_TOGGLE_ID,
      OVERVIEW_VIEW_ID,
      RESET_ID,
      VTASK_BTN_ID,
      MENU_CALC_ID,
      MENU_SHOW_ID
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    document.querySelectorAll("[data-ints-term]").forEach((el) => el.remove());
    _targetStripOpen = false;
    _targetHasState = null;
    _calcOpen = false;
    _overviewOpen = false;
    _overviewLoaded = false;
    _overviewFailed = false;
    _overviewSig = "";
    document.querySelectorAll("[" + INLINE_ATTR + "]").forEach((el) => {
      el.removeAttribute(INLINE_ATTR);
      el.removeAttribute("data-ints-clickable");
      delete el._intsClickBound;
      el.style.cursor = "";
      el.removeAttribute("title");
      _restoreScoreCell(el);
      const box = el.querySelector("[data-ints-sim]");
      if (box) box.remove();
    });
    document.querySelectorAll("[data-ints-task]").forEach((td) => {
      td.removeAttribute("data-ints-task");
      td.removeAttribute("data-ints-taskbound");
      delete td._intsTaskClickBound;
      td.style.cursor = "";
      td.removeAttribute("title");
      const b = td.querySelector("[" + TASK_SCORE_ATTR + "]");
      if (b) b.remove();
      const inp = td.querySelector("[" + TASK_INPUT_ATTR + "]");
      if (inp) {
        inp._intsCancelled = true;
        inp.remove();
      }
      const sp = _siteScoreSpan(td);
      if (sp) sp.style.display = "";
    });
    document.querySelectorAll("[" + VTASK_ATTR + "]").forEach((td) => {
      _clearVirtualCell(td);
      td.removeAttribute("data-ints-taskbound");
      delete td._intsTaskClickBound;
    });
    _started = false;
    _vm = null;
    console.log("[\u5185\u8054] /points \u5185\u8054\u5DF2\u505C\u6B62\u5E76\u6E05\u7406\u6CE8\u5165");
  }
  function syncPointsInline() {
    if (!_inlineEnabled()) {
      stopPointsInline();
      return;
    }
    if (_isPointsPage()) _start();
    else stopPointsInline();
  }
  var INLINE_ATTR, GPA_ID, DECORATE_DEBOUNCE_MS, SCORE_SIM_ATTR, SCORE_WRAP_ATTR, SCORE_DELTA_ATTR, SCORE_DELTA_EPS, FIELD_CELL_SEARCH, _synthThCache, TASK_SCORE_ATTR, TASK_INPUT_ATTR, VTASK_ATTR, COLOR_UP, COLOR_DOWN, _taskEditing, VTASK_FALLBACK, IE_KIND, IE_F_IDS, ALL_FIELDS, FIELD_LABEL, FIELD_BY_LABEL, FIELD_ORDER, SYNTH_PREFIX, TOGGLE_ID, TERM_ID, TARGET_TOGGLE_ID, _targetStripOpen, _targetHasState, COLOR_IDLE, COLOR_ACTIVE, _vm, _savedHeaders, _colsExpanded, _colsSig, MENU_CALC_ID, MENU_SHOW_ID, MENU_CALC_TRIGGER_ID, MENU_SHOW_TRIGGER_ID, MENU_PANEL_ATTR, VTASK_BTN_ID, MENU_Z, _openMenu, _menuOutside, _menuEsc, CALC_CARD_ID, OVERVIEW_TOGGLE_ID, OVERVIEW_VIEW_ID, CALC_TOGGLE_ID, RESET_ID, _calcOpen, _overviewSig, _overviewOutside, ANTD_BAR_CHART_PATH, _overviewOpen, _overviewLoaded, _overviewFailed, OVERVIEW_COUNT_ID, _stats, _loading, DRIFT_CHECK_MS, DRIFT_MAX_REFRESH, _driftCheckedAt, _driftRefreshing, _driftRefreshes, _started, _observer, _timer, _lastPageYearText;
  var init_inline_points = __esm({
    "v8.30/inline-points.js"() {
      init_state();
      init_utils();
      init_year_data();
      init_ui();
      init_simulation();
      init_gpa_target();
      init_diagnose();
      init_win_shell();
      INLINE_ATTR = "data-ints-inline";
      GPA_ID = "ints-inline-gpa";
      DECORATE_DEBOUNCE_MS = 300;
      SCORE_SIM_ATTR = "data-ints-simscore";
      SCORE_WRAP_ATTR = "data-ints-origwrap";
      SCORE_DELTA_ATTR = "data-ints-scoredelta";
      SCORE_DELTA_EPS = 5e-3;
      FIELD_CELL_SEARCH = [0, -1, 1];
      _synthThCache = null;
      TASK_SCORE_ATTR = "data-ints-taskscore";
      TASK_INPUT_ATTR = "data-ints-taskinput";
      VTASK_ATTR = "data-ints-vtask-id";
      COLOR_UP = "#52c41a";
      COLOR_DOWN = "#d4380d";
      _taskEditing = null;
      VTASK_FALLBACK = {
        box: "width: 120px; display: flex; flex-direction: column;",
        title: "",
        scoreBar: "padding: 4px 0px; text-align: center;",
        score: "min-height: 21px;"
      };
      IE_KIND = "editor";
      IE_F_IDS = { s1: "s1", s2: "s2" };
      ALL_FIELDS = ["s1p", "s1e", "s1f", "s2p", "s2e", "s2f"];
      FIELD_LABEL = { s1p: "S1P", s1e: "S1E", s1f: "S1F", s2p: "S2P", s2e: "S2E", s2f: "S2F" };
      FIELD_BY_LABEL = { S1P: "s1p", S1E: "s1e", S1F: "s1f", S2P: "s2p", S2E: "s2e", S2F: "s2f" };
      FIELD_ORDER = { S1P: 0, S1E: 1, S1F: 2, S2P: 3, S2E: 4, S2F: 5 };
      SYNTH_PREFIX = "ints_";
      TOGGLE_ID = "ints-inline-cols-btn";
      TERM_ID = "ints-inline-term";
      TARGET_TOGGLE_ID = "ints-inline-target-btn";
      _targetStripOpen = false;
      _targetHasState = null;
      COLOR_IDLE = "#1890ff";
      COLOR_ACTIVE = "#26b889";
      _vm = null;
      _savedHeaders = null;
      _colsExpanded = false;
      _colsSig = null;
      MENU_CALC_ID = "ints-inline-menu-calc";
      MENU_SHOW_ID = "ints-inline-menu-show";
      MENU_CALC_TRIGGER_ID = "ints-inline-calc-menu-btn";
      MENU_SHOW_TRIGGER_ID = "ints-inline-show-menu-btn";
      MENU_PANEL_ATTR = "data-ints-menupanel";
      VTASK_BTN_ID = "ints-inline-vtask-btn";
      MENU_Z = 50;
      _openMenu = null;
      _menuOutside = null;
      _menuEsc = null;
      CALC_CARD_ID = "ints-inline-calc";
      OVERVIEW_TOGGLE_ID = "ints-inline-overview-btn";
      OVERVIEW_VIEW_ID = "ints-overview-view";
      CALC_TOGGLE_ID = "ints-inline-calc-btn";
      RESET_ID = "ints-inline-reset-btn";
      _calcOpen = false;
      _overviewSig = "";
      _overviewOutside = null;
      ANTD_BAR_CHART_PATH = "M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm-600-80h56c4.4 0 8-3.6 8-8V560c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v144c0 4.4 3.6 8 8 8zm152 0h56c4.4 0 8-3.6 8-8V384c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v320c0 4.4 3.6 8 8 8zm152 0h56c4.4 0 8-3.6 8-8V462c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v242c0 4.4 3.6 8 8 8zm152 0h56c4.4 0 8-3.6 8-8V304c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v400c0 4.4 3.6 8 8 8z";
      _overviewOpen = false;
      _overviewLoaded = false;
      _overviewFailed = false;
      OVERVIEW_COUNT_ID = "ints-overview-loading-text";
      _stats = { rows: 0, matched: 0, unmatched: 0, ts: 0 };
      _loading = false;
      DRIFT_CHECK_MS = 60 * 1e3;
      DRIFT_MAX_REFRESH = 2;
      _driftCheckedAt = 0;
      _driftRefreshing = false;
      _driftRefreshes = 0;
      _started = false;
      _observer = null;
      _timer = null;
      _lastPageYearText = null;
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
    checkUpcomingDeadlines();
    startDeadlinePolling();
  }
  function removeButton() {
    let btn = document.getElementById(BUTTON_ID);
    if (btn) btn.remove();
    let wrap = document.getElementById("intschool-deadline-wrap");
    if (wrap) wrap.remove();
    let floatTip = document.querySelector(".intschool-deadline-tooltip-fixed");
    if (floatTip) floatTip.remove();
    stopDeadlinePolling();
  }
  function _needsInjection() {
    if (!_isSupportedPage()) return false;
    return !document.getElementById("intschool-deadline-wrap");
  }
  function _runCheck() {
    safe("\u6CE8\u5165\u68C0\u67E5", () => {
      syncTaskMarkButton();
      syncPointsInline();
      checkDeadlinesAfterNav();
      if (_isSupportedPage()) {
        if (_needsInjection()) addButton();
      } else {
        removeButton();
      }
    });
  }
  function _scheduleCheck(delay) {
    if (_btnCheckTimer) return;
    _btnCheckTimer = setTimeout(() => {
      _btnCheckTimer = null;
      _runCheck();
    }, Math.max(0, delay));
  }
  function _startPoll(durationMs) {
    _pollDeadline = Date.now() + durationMs;
    if (_pollTimer) return;
    const tick = () => {
      _pollTimer = null;
      _runCheck();
      if (_needsInjection() && Date.now() < _pollDeadline) _pollTimer = setTimeout(tick, POLL_INTERVAL_MS);
    };
    _pollTimer = setTimeout(tick, POLL_INTERVAL_MS);
  }
  function startButtonObserver() {
    if (_btnObserverStarted) return;
    _btnObserverStarted = true;
    if (GPA_COMPAT_MS > 0) setTimeout(_runCheck, GPA_COMPAT_MS);
    else _runCheck();
    _startPoll(POLL_MAX_MS);
    _btnObserver = new MutationObserver(() => {
      safe("DOM \u53D8\u66F4\u5904\u7406", () => {
        if (_needsInjection() || !_isSupportedPage()) _scheduleCheck(OBSERVER_THROTTLE_MS);
      });
    });
    _btnObserver.observe(document, { childList: true, subtree: true });
    const _pushState = history.pushState;
    history.pushState = function() {
      _pushState.apply(this, arguments);
      safe("pushState \u94A9\u5B50", () => {
        _scheduleCheck(0);
        _startPoll(1500);
      });
    };
    const _replaceState = history.replaceState;
    history.replaceState = function() {
      _replaceState.apply(this, arguments);
      safe("replaceState \u94A9\u5B50", () => {
        _scheduleCheck(0);
        _startPoll(1500);
      });
    };
    window.addEventListener("popstate", () => safe("popstate \u94A9\u5B50", () => {
      _scheduleCheck(0);
      _startPoll(1500);
    }));
  }
  var _btnCheckTimer, _pollTimer, _pollDeadline, _btnObserver, _btnObserverStarted, GPA_COMPAT_MS, POLL_INTERVAL_MS, POLL_MAX_MS, OBSERVER_THROTTLE_MS;
  var init_button = __esm({
    "v8.30/button.js"() {
      init_state();
      init_deadline();
      init_inline_points();
      init_diagnose();
      _btnCheckTimer = null;
      _pollTimer = null;
      _pollDeadline = 0;
      _btnObserver = null;
      _btnObserverStarted = false;
      GPA_COMPAT_MS = 0;
      POLL_INTERVAL_MS = 80;
      POLL_MAX_MS = 2500;
      OBSERVER_THROTTLE_MS = 120;
    }
  });

  // v8.30/dragmark.js
  function DL2(...a) {
    if (DND_DIAG) console.log(...a);
  }
  function _isTeachingListPage() {
    const p = location.pathname.toLowerCase();
    return p === "/teaching" || p === "/teaching/";
  }
  function _findTaskListVm() {
    let el = document.querySelector(".teaching") || document.querySelector(".ant-table");
    if (!el) return null;
    let vm = null;
    for (let n = el; n && !vm; n = n.parentElement) {
      if (n.__vue__) vm = n.__vue__;
    }
    if (!vm) return null;
    let root = vm;
    while (root.$parent) root = root.$parent;
    const queue = [root];
    const seen = /* @__PURE__ */ new Set();
    while (queue.length) {
      const cur = queue.shift();
      if (!cur || seen.has(cur)) continue;
      seen.add(cur);
      if (Array.isArray(cur.data) && cur.data.length) {
        const first = cur.data[0];
        if (first && typeof first === "object" && first.entityId !== void 0 && first.name !== void 0) return cur;
      }
      for (const ch of cur.$children || []) queue.push(ch);
    }
    return null;
  }
  function _pad(n) {
    return n < 10 ? "0" + n : String(n);
  }
  function _fmtDateTime(v) {
    const d = new Date(v);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + _pad(d.getMonth() + 1) + "-" + _pad(d.getDate()) + " " + _pad(d.getHours()) + ":" + _pad(d.getMinutes());
  }
  function _rowNameEl(rowEl) {
    return rowEl.querySelector("a.task-name");
  }
  function _rowName(rowEl) {
    const a = _rowNameEl(rowEl);
    return a ? a.textContent.trim() : null;
  }
  function _rowDeadlineText(rowEl) {
    const td = rowEl.children[2];
    if (!td) return "";
    const s = td.querySelector("span.ellipsis") || td;
    return (s.textContent || "").trim();
  }
  function _resolveRowTask(rowEl, vm) {
    const name = _rowName(rowEl);
    if (!name) return null;
    const deadline = _rowDeadlineText(rowEl);
    const listVm = vm || _findTaskListVm();
    if (listVm) {
      const rows = listVm.data || [];
      let hit = rows.find((r) => r && r.name === name && _fmtDateTime(r.endDate) === deadline);
      if (!hit) {
        const sameName = rows.filter((r) => r && r.name === name);
        if (sameName.length === 1) hit = sameName[0];
      }
      if (!hit) {
        const idx = parseInt(rowEl.getAttribute("data-row-key"), 10);
        if (!isNaN(idx) && rows[idx] && rows[idx].name === name) hit = rows[idx];
      }
      if (hit) return { entityId: parseInt(hit.entityId, 10), name: hit.name, type: hit.type };
    }
    const cand = (S._deadlineAllTasks || []).find((x) => x.taskName === name && _fmtDateTime(x.endDate) === deadline);
    if (cand) return { entityId: cand.entityId, name: cand.taskName, type: "1001" };
    return null;
  }
  function _flagOf(holder) {
    for (const c of holder.children) {
      if (c.classList && c.classList.contains(FLAG_CLASS)) return c;
    }
    return null;
  }
  function _unmarkRow(rowEl, via) {
    if (!rowEl) return false;
    const task = _resolveRowTask(rowEl, _findTaskListVm());
    if (!task || isNaN(task.entityId) || !isTaskMarked(task.entityId)) return false;
    setTaskMark(task.entityId, false);
    const nameEl = _rowNameEl(rowEl);
    if (nameEl) _updateRowFlag(nameEl, false);
    _showToast(t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ") + task.name, true);
    DL2("[\u62D6\u62FD\u6807\u8BB0] " + via + " \u53D6\u6D88\u6807\u8BB0 entityId=" + task.entityId + " name=" + task.name);
    return true;
  }
  function _updateRowFlag(nameEl, marked) {
    const holder = nameEl.parentElement;
    if (!holder) return;
    const existing = _flagOf(holder);
    if (marked && !existing) {
      const flag = document.createElement("span");
      flag.className = FLAG_CLASS;
      flag.style.cssText = "position:relative;top:-1px;margin-left:6px;display:inline-flex;align-items:center;vertical-align:middle;line-height:1;cursor:pointer;";
      flag.title = t("\u5DF2\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210\uFF08\u70B9\u51FB\u6216\u53F3\u952E\u53D6\u6D88\u6807\u8BB0\uFF09", "Marked as pending (click or right-click to unmark)");
      flag.innerHTML = iconMark(MARK_COLOR_ON, "13px");
      flag.addEventListener("click", guardListener("\u5217\u8868\u65D7\u5E1C\u5DE6\u952E\u53D6\u6D88\u6807\u8BB0", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        _unmarkRow(flag.closest("tr"), "\u65D7\u5E1C\u5DE6\u952E");
      }));
      flag.addEventListener("contextmenu", guardListener("\u5217\u8868\u65D7\u5E1C\u53F3\u952E\u53D6\u6D88\u6807\u8BB0", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        _unmarkRow(flag.closest("tr"), "\u65D7\u5E1C\u53F3\u952E");
      }));
      nameEl.insertAdjacentElement("afterend", flag);
    } else if (!marked && existing) {
      existing.remove();
    }
  }
  function _ensureRowHitZone(rowEl) {
    if (rowEl.getAttribute(ROWZONE_ATTR) === "1") return;
    rowEl.setAttribute(ROWZONE_ATTR, "1");
    rowEl.addEventListener("contextmenu", guardListener("\u5217\u8868\u884C\u53F3\u952E\u53D6\u6D88\u6807\u8BB0", (e) => {
      const nameEl = _rowNameEl(rowEl);
      const task = _resolveRowTask(rowEl, _findTaskListVm());
      if (!task || isNaN(task.entityId) || !isTaskMarked(task.entityId)) return;
      e.preventDefault();
      e.stopPropagation();
      setTaskMark(task.entityId, false);
      if (nameEl) _updateRowFlag(nameEl, false);
      _showToast(t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ") + task.name, true);
      DL2("[\u62D6\u62FD\u6807\u8BB0] \u884C\u5224\u5B9A\u533A\u53F3\u952E \u53D6\u6D88\u6807\u8BB0 entityId=" + task.entityId + " name=" + task.name);
    }));
  }
  function decorateTeachingRows() {
    safe("\u4EFB\u52A1\u5217\u8868\u88C5\u9970", _decorateTeachingRows);
  }
  function _decorateTeachingRows() {
    if (!_isTeachingListPage()) return;
    const rows = document.querySelectorAll(".ant-table-tbody > tr.ant-table-row");
    if (!rows.length) return;
    loadTaskMarks();
    const vm = _findTaskListVm();
    let resolved = 0, unresolved = 0, decorated = 0;
    rows.forEach((rowEl) => {
      const nameEl = _rowNameEl(rowEl);
      if (!nameEl) return;
      _ensureRowHitZone(rowEl);
      const task = _resolveRowTask(rowEl, vm);
      if (task && !isNaN(task.entityId)) resolved++;
      else unresolved++;
      if (nameEl.getAttribute(DRAG_ATTR) !== "1") {
        nameEl.setAttribute(DRAG_ATTR, "1");
        nameEl.setAttribute("draggable", "true");
        nameEl.style.cursor = "grab";
        nameEl.style.userSelect = "none";
        nameEl.addEventListener("dragstart", guardListener("\u5217\u8868\u884C\u5F00\u59CB\u62D6\u62FD", _onDragStart));
        nameEl.addEventListener("dragend", guardListener("\u5217\u8868\u884C\u7ED3\u675F\u62D6\u62FD", _onDragEnd));
        decorated++;
      }
      nameEl.title = t("\u62D6\u5230\u4E0B\u65B9\u5217\u8868\u5373\u53EF\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Drag onto the list below to mark as pending");
      _updateRowFlag(nameEl, task && !isNaN(task.entityId) ? isTaskMarked(task.entityId) : false);
    });
    if (decorated || unresolved) DL2("[\u62D6\u62FD\u6807\u8BB0] \u88C5\u9970\u4EFB\u52A1\u884C: \u65B0\u589E\u53EF\u62D6\u62FD " + decorated + " \u884C\uFF0C\u5DF2\u5B9A\u4F4DID " + resolved + " \u884C\uFF0C\u672A\u5B9A\u4F4D " + unresolved + " \u884C");
  }
  function _setDragState(task) {
    _dragTask = task;
    S._taskDragging = true;
    clearTimeout(_dragWatchdog);
    _dragWatchdog = setTimeout(() => {
      console.warn("[\u62D6\u62FD\u6807\u8BB0] dragend \u672A\u89E6\u53D1\uFF0C\u5F3A\u5236\u6E05\u7406\u62D6\u62FD\u72B6\u6001");
      safe("\u62D6\u62FD\u770B\u95E8\u72D7\u6536\u5C3E", _onDragEnd);
    }, 8e3);
  }
  function _makeGhost(name) {
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:fixed;top:-1000px;left:-1000px;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:#fff;border:1px solid #ffd591;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,0.18);font-size:13px;color:#262626;";
    ghost.innerHTML = iconMark(MARK_COLOR_ON, "14px") + "<span>" + escapeHtml(name) + "</span>";
    document.body.appendChild(ghost);
    _dragGhost = ghost;
    return ghost;
  }
  function _onDragStart(e) {
    const nameEl = e.currentTarget;
    const rowEl = nameEl.closest("tr");
    const task = _resolveRowTask(rowEl, _findTaskListVm());
    const entityId = task && !isNaN(task.entityId) ? task.entityId : null;
    _dragTask = { entityId, name: nameEl.textContent.trim(), marked: entityId ? isTaskMarked(entityId) : false, rowEl, nameEl, fromTooltip: false };
    try {
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("text/plain", _dragTask.name);
      e.dataTransfer.setDragImage(_makeGhost(_dragTask.name), 12, 14);
    } catch (err) {
    }
    if (rowEl) rowEl.style.opacity = "0.45";
    _setDragState(_dragTask);
    _prepareZone();
    DL2("[\u62D6\u62FD\u6807\u8BB0] \u5F00\u59CB\u62D6\u52A8\u300C" + _dragTask.name + "\u300D entityId=" + entityId + " \u5DF2\u6807\u8BB0=" + _dragTask.marked + " \u65B9\u5411=\u4E0A\u62D6(\u9EC4\u8272\u6807\u8BB0\u533A)");
  }
  function _onTooltipDragStart(e) {
    const row = e.target && e.target.closest ? e.target.closest(".task-dash-row") : null;
    if (!row || _dragTask) return;
    const entityId = parseInt(row.getAttribute("data-entity"), 10);
    if (!entityId || isNaN(entityId)) return;
    const name = row.getAttribute("data-name") || (row.textContent || "").trim().slice(0, 40);
    _dragTask = { entityId, name, marked: isTaskMarked(entityId), rowEl: null, nameEl: null, fromTooltip: true };
    try {
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("text/plain", name);
      e.dataTransfer.setDragImage(_makeGhost(name), 12, 14);
    } catch (err) {
    }
    _setDragState(_dragTask);
    _prepareZone();
    DL2("[\u62D6\u62FD\u6807\u8BB0] \u4ECE\u60AC\u6D6E\u7A97\u5F00\u59CB\u62D6\u52A8\u300C" + name + "\u300D entityId=" + entityId + " \u5DF2\u6807\u8BB0=" + _dragTask.marked + " \u65B9\u5411=\u4E0B\u62D6(\u7EA2\u8272\u53D6\u6D88\u6807\u8BB0\u533A)");
  }
  function _onDragEnd() {
    if (_dragTask && _dragTask.rowEl) _dragTask.rowEl.style.opacity = "";
    if (_dragGhost) {
      _dragGhost.remove();
      _dragGhost = null;
    }
    _clearAllZones();
    _dragTask = null;
    S._taskDragging = false;
    clearTimeout(_dragWatchdog);
    _dragWatchdog = null;
  }
  function _filterHost() {
    return document.querySelector(".filter-info.filter-container") || document.querySelector(".filter-container") || document.querySelector(".ant-row.filter-group");
  }
  function _tableHost() {
    return document.querySelector(".ant-table-wrapper") || document.querySelector(".ant-table") || document.querySelector(".ant-table-tbody");
  }
  function _inMarkArea(x, y) {
    const content = document.getElementById("container") || document.body;
    const cr = content.getBoundingClientRect();
    const upper = _filterHost();
    const bottom = upper ? upper.getBoundingClientRect().bottom + 8 : cr.top + 140;
    return x >= cr.left && x <= cr.right && y >= cr.top - 60 && y <= bottom;
  }
  function _inUnmarkArea(x, y) {
    const content = document.getElementById("container") || document.body;
    const cr = content.getBoundingClientRect();
    const upper = _filterHost();
    const top = upper ? upper.getBoundingClientRect().bottom + 4 : cr.top;
    return x >= cr.left && x <= cr.right && y >= top && y <= window.innerHeight;
  }
  function _activeKind() {
    return _dragTask && _dragTask.fromTooltip ? "unmark" : "mark";
  }
  function _inActiveArea(kind, x, y) {
    return kind === "unmark" ? _inUnmarkArea(x, y) : _inMarkArea(x, y);
  }
  function _zoneEl(kind) {
    const id = kind === "unmark" ? ZONE_UNMARK_ID : ZONE_MARK_ID;
    let zone = document.getElementById(id);
    if (zone && zone.isConnected) return zone;
    const host = kind === "unmark" ? _tableHost() : _filterHost();
    if (!host) return null;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    zone = document.createElement("div");
    zone.id = id;
    const style = kind === "unmark" ? "solid" : "dashed";
    zone.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;border-radius:6px;pointer-events:none;z-index:20;transition:background .12s,border-color .12s,color .12s;border:2px " + style + " transparent;box-sizing:border-box;";
    host.appendChild(zone);
    return zone;
  }
  function _clearZone(kind) {
    const zone = document.getElementById(kind === "unmark" ? ZONE_UNMARK_ID : ZONE_MARK_ID);
    if (!zone) return;
    zone.textContent = "";
    zone.style.borderColor = "transparent";
    zone.style.background = "transparent";
    zone.style.color = "transparent";
  }
  function _styleZone(kind, hot) {
    const zone = _zoneEl(kind);
    if (!zone) return;
    if (kind === "unmark") {
      zone.textContent = hot ? t("\u677E\u5F00\u9F20\u6807\uFF1A\u53D6\u6D88\u6807\u8BB0", "Release to unmark") : t("\u62D6\u5230\u6B64\u5904\u53D6\u6D88\u6807\u8BB0", "Drop here to unmark");
      zone.style.borderColor = hot ? "#ff4d4f" : "rgba(255,77,79,0.55)";
      zone.style.background = hot ? "rgba(255,77,79,0.13)" : "rgba(255,77,79,0.05)";
      zone.style.color = hot ? "#cf1322" : "#d46b6b";
    } else {
      const marked = _dragTask && isTaskMarked(_dragTask.entityId);
      zone.textContent = hot ? marked ? t("\u677E\u5F00\u9F20\u6807\uFF1A\u79FB\u9664\u6807\u8BB0", "Release to remove the mark") : t("\u677E\u5F00\u9F20\u6807\uFF1A\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Release to mark as pending") : marked ? t("\u62D6\u5230\u6B64\u5904\u79FB\u9664\u6807\u8BB0", "Drop here to remove the mark") : t("\u62D6\u5230\u6B64\u5904\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210", "Drop here to mark as pending");
      zone.style.borderColor = hot ? "#faad14" : "rgba(250,173,20,0.65)";
      zone.style.background = hot ? "rgba(250,173,20,0.16)" : "rgba(250,173,20,0.06)";
      zone.style.color = hot ? "#ad6800" : "#8c6b1f";
    }
  }
  function _prepareZone() {
    const kind = _activeKind();
    _hot = false;
    _clearZone(kind === "mark" ? "unmark" : "mark");
    _styleZone(kind, false);
  }
  function _clearAllZones() {
    _clearZone("mark");
    _clearZone("unmark");
    _hot = false;
  }
  function _onDocDragOver(e) {
    if (!_dragTask) return;
    e.preventDefault();
    const kind = _activeKind();
    const inside = _inActiveArea(kind, e.clientX, e.clientY);
    try {
      if (e.dataTransfer) e.dataTransfer.dropEffect = inside ? "copy" : "move";
    } catch (err) {
    }
    if (inside !== _hot) {
      _hot = inside;
      _styleZone(kind, inside);
    }
  }
  function _onDocDrop(e) {
    if (!_dragTask) return;
    e.preventDefault();
    e.stopPropagation();
    const { entityId, name, nameEl, fromTooltip } = _dragTask;
    const kind = _activeKind();
    const inside = _inActiveArea(kind, e.clientX, e.clientY);
    if (!entityId || isNaN(entityId)) {
      _showToast(t("\u65E0\u6CD5\u5B9A\u4F4D\u8BE5\u4EFB\u52A1\u7684 ID\uFF0C\u672A\u80FD\u6807\u8BB0", "Could not resolve this task ID"), false);
      console.warn("[\u62D6\u62FD\u6807\u8BB0] \u672A\u80FD\u5B9A\u4F4D\u4EFB\u52A1 ID\uFF0C\u6765\u6E90=" + (fromTooltip ? "\u60AC\u6D6E\u7A97" : "\u5217\u8868\u884C") + " name=" + name);
      _onDragEnd();
      return;
    }
    const marked = isTaskMarked(entityId);
    if (inside && kind === "mark") {
      const next = !marked;
      setTaskMark(entityId, next);
      if (nameEl) _updateRowFlag(nameEl, next);
      _showToast((next ? t("\u5DF2\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210: ", "Marked as pending: ") : t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ")) + name, next);
      DL2("[\u62D6\u62FD\u6807\u8BB0] \u843D\u5165\u9EC4\u8272\u6807\u8BB0\u533A \u2192 " + (next ? "\u6807\u8BB0" : "\u53D6\u6D88\u6807\u8BB0") + " entityId=" + entityId + " name=" + name);
    } else if (inside && kind === "unmark") {
      if (marked) {
        setTaskMark(entityId, false);
        if (nameEl) _updateRowFlag(nameEl, false);
        _showToast(t("\u5DF2\u79FB\u9664\u6807\u8BB0: ", "Mark removed: ") + name, true);
        DL2("[\u62D6\u62FD\u6807\u8BB0] \u843D\u5165\u7EA2\u8272\u53D6\u6D88\u6807\u8BB0\u533A \u2192 \u53D6\u6D88\u6807\u8BB0 entityId=" + entityId + " name=" + name);
      } else {
        DL2("[\u62D6\u62FD\u6807\u8BB0] \u843D\u5165\u7EA2\u8272\u53D6\u6D88\u6807\u8BB0\u533A\u4F46\u4EFB\u52A1\u672A\u88AB\u6807\u8BB0\uFF0C\u65E0\u64CD\u4F5C entityId=" + entityId + " name=" + name);
      }
    } else {
      DL2("[\u62D6\u62FD\u6807\u8BB0] \u672A\u843D\u5165" + (kind === "mark" ? "\u9EC4\u8272\u6807\u8BB0\u533A" : "\u7EA2\u8272\u53D6\u6D88\u6807\u8BB0\u533A") + "\uFF0C\u65E0\u64CD\u4F5C entityId=" + entityId + " name=" + name);
    }
    _onDragEnd();
    if (fromTooltip) decorateTeachingRows();
  }
  function _showToast(msg, ok) {
    if (ok === false) console.warn("[\u6807\u8BB0] " + msg);
    else console.log("[\u6807\u8BB0] " + msg);
  }
  function startTeachingDragMark() {
    if (_started2) return;
    _started2 = true;
    document.addEventListener("dragover", guardListener("\u5168\u5C40 dragover", _onDocDragOver), true);
    document.addEventListener("drop", guardListener("\u5168\u5C40 drop", _onDocDrop), true);
    document.addEventListener("dragstart", guardListener("\u5168\u5C40 dragstart", _onTooltipDragStart), true);
    document.addEventListener("dragend", guardListener("\u5168\u5C40 dragend", _onDragEnd), true);
    document.addEventListener("dragleave", guardListener("\u5168\u5C40 dragleave", (e) => {
      if (_dragTask && !e.relatedTarget) _onDragEnd();
    }), true);
    window.addEventListener("blur", guardListener("\u7A97\u53E3\u5931\u7126\u6536\u5C3E", () => {
      if (_dragTask) _onDragEnd();
    }));
    document.addEventListener("visibilitychange", guardListener("\u6807\u7B7E\u9875\u9690\u85CF\u6536\u5C3E", () => {
      if (_dragTask && document.visibilityState === "hidden") _onDragEnd();
    }));
    const obs = new MutationObserver(guardListener("\u5217\u8868\u53D8\u66F4\u89C2\u5BDF", () => {
      clearTimeout(_decorateTimer);
      _decorateTimer = setTimeout(decorateTeachingRows, 300);
    }));
    obs.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("popstate", guardListener("SPA \u8FD4\u56DE\u88C5\u9970", () => setTimeout(decorateTeachingRows, 400)));
    decorateTeachingRows();
  }
  var DRAG_ATTR, ROWZONE_ATTR, FLAG_CLASS, ZONE_MARK_ID, ZONE_UNMARK_ID, DND_DIAG, _dragTask, _dragGhost, _dragWatchdog, _hot, _started2, _decorateTimer;
  var init_dragmark = __esm({
    "v8.30/dragmark.js"() {
      init_state();
      init_utils();
      init_deadline();
      init_diagnose();
      DRAG_ATTR = "data-ints-draggable";
      ROWZONE_ATTR = "data-ints-rowzone";
      FLAG_CLASS = "ints-task-flag";
      ZONE_MARK_ID = "ints-mark-zone-mark";
      ZONE_UNMARK_ID = "ints-mark-zone-unmark";
      DND_DIAG = (function() {
        try {
          return localStorage.getItem("ints_diag") === "1";
        } catch (e) {
          return false;
        }
      })();
      _dragTask = null;
      _dragGhost = null;
      _dragWatchdog = null;
      _hot = false;
      _started2 = false;
      _decorateTimer = null;
    }
  });

  // v8.30/entry.js
  var require_entry = __commonJS({
    "v8.30/entry.js"() {
      init_utils();
      var import_styles = __toESM(require_styles());
      init_state();
      init_courses();
      init_deadline();
      init_button();
      init_dragmark();
      init_inline_points();
      init_simulation();
      init_ui();
      init_win_shell();
      init_diagnose();
      window.addEventListener("error", (e) => {
        try {
          const src = String(e.filename || "");
          if (src.indexOf("userscript") >= 0 || src.indexOf("Better") >= 0) recordError("\u672A\u6355\u83B7\u5F02\u5E38", e.message || e.error);
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
          if (document.visibilityState === "hidden") {
            try {
              flushSave();
            } catch (e) {
            }
          }
        });
        window.addEventListener("pagehide", () => {
          try {
            flushSave();
          } catch (e) {
          }
        });
      });
      safe("\u8BFB\u53D6\u672C\u5730\u7F13\u5B58", () => ensureStorageLoaded());
      if (document.body) {
        safe("\u542F\u52A8\u6309\u94AE\u89C2\u5BDF\u5668", () => startButtonObserver());
      } else {
        document.addEventListener("DOMContentLoaded", () => safe("\u542F\u52A8\u6309\u94AE\u89C2\u5BDF\u5668", () => startButtonObserver()));
      }
      safe("\u542F\u52A8\u62D6\u62FD\u6807\u8BB0", () => startTeachingDragMark());
      window.__INTS_DEBUG = {
        S,
        isTaskMarked,
        setTaskMark,
        loadTaskMarks,
        checkUpcomingDeadlines,
        updateDeadlineIcon,
        renderTooltipContent,
        decorateTeachingRows,
        // 导航后 DDL 补查：退出任务详情页的判定与节流
        checkDeadlinesAfterNav,
        _setNavPathForTest,
        // /points 内联模拟：直接驱动装饰流程与真实加载路径，不依赖网络
        decoratePointsRows,
        syncPointsInline,
        stopPointsInline,
        getInlineStats,
        loadPointsData: _ensureData,
        _resetDriftCheckForTest,
        // 持久化：驱动"改完 → 落盘 → 重开页面 → 还在吗"的全链路
        flushSave,
        loadFromLocalStorage,
        isYearCacheFresh,
        // 写入口与用户层回贴（直接调它们验"每个写入口都落盘"）
        onTaskScoreChange,
        onExamScoreChange,
        onPStarChange,
        initSimCourses,
        applyUserLayer,
        // 清空模拟 + 校准：验"清干净（含落盘）且不误伤校准数据"，以及"校准在飞的时候被清空模拟打断"这条竞态
        resetSimulations,
        autoCalibrateStarredCourses,
        // 窗口：科目明细窗口 + 窗口表（关最近一个 / 全关 / 数一下开着几个）
        showSubjectDetailModal,
        refreshSubjectDetailWindows,
        listWindows,
        countWindows,
        closeTopWindow,
        closeAllWindows,
        getShellStats,
        syncWindows
      };
      window.__INTS_DIAG = () => safe("\u8BCA\u65AD\u62A5\u544A", () => showDiagnostics());
    }
  });
  require_entry();
})();
