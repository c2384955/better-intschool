Better Intschool
=========================================================================

Site: https://shc.intschool.cn
Version: 1.00

Features
-----------
  - Grade viewer & simulator: see each course's real grade plus its task breakdown,
    then change scores to try out "what if I get X on this one"
  - Target GPA planner: enter a target GPA and get the final-exam score each course
    needs, so you can plan your finals
  - Deadline reminders: a permanent warning button listing every unsubmitted online
    task and its due date
  - Task reminders & marking: tasks that have to be submitted online are detected
    automatically and pop up as a reminder; you can also mark tasks yourself for a
    permanent reminder
  - Past-year grades and a multi-year GPA trend: a G9-G12 GPA overview, pulled from
    the reports and computed automatically

All data is computed and stored in your own browser only; the script never uploads
anything and never acts beyond your own permissions.


Installation
------------
1. Install the Tampermonkey browser extension first. Use an official browser store:
   - Chrome / Edge (recommended - the official Chrome Web Store entry):
       https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Edge users may also use the official Microsoft Edge Add-ons listing:
       https://microsoftedge.microsoft.com/addons/detail/iikmkjmpaadaobahmlepeloendndfphd
   - Firefox:
       https://addons.mozilla.org/firefox/addon/tampermonkey/

2. Install the script (pick one):
   - Option A: open the link below; Tampermonkey shows an install page, click "Install".
       https://raw.githubusercontent.com/c2384955/better-intschool/main/better-intschool.user.js
   - Option B: drag better-intschool.user.js into the browser window, or use
     Tampermonkey's "Utilities -> Import" and pick the file.

3. Open https://shc.intschool.cn and log in. The features appear on the page.


Usage
-----

[Grade Book page] /points
 Following the school's formula (verified against the reports): the annual GPA is the
 credit-weighted average of S1F and S2F. Within each of them the final exam (S1E / S2E)
 counts for 20%, and the rest comes from S1P / S2P, where each course's syllabus decides
 how much weight each task type carries. The script gives you verified simulation and
 precise display: "edit" a task score to see how the grade would change in that scenario.

[Controls in the filter bar]
  Left to right: Year | Term | (!) Pending tasks | Calculate v | View v

    - Year: switch to a past year to see history and the multi-year GPA trend
    - Term: only affects the columns added by "Details" (the school's own columns are
      whole-year, so they cannot be filtered)
    - Calculate v:
        - Target GPA: enter a target GPA and get the final-exam score each course needs.
          Two modes: finals only, or distributed proportionally; the per-course details
          sit in an expandable strip
        - Reset Simulations: restore everything the school actually shows
        - Add Virtual Task: add a task of your own to the term-grade simulation
          (local only; the school's data is untouched)
    - View v:
        - Details: reveal grade columns the school has not published yet (this script's
          estimates - they look exactly like the school's own columns) and switch
          decimals to 2 places
        - G9-G12 Overview: multi-year GPA trend chart plus a per-year summary

[Deadline Reminders]
  A permanent warning button sits in the filter bar:
    - With no pending tasks it shows a grey "No Pending Tasks" and hovering pops nothing
    - With tasks, hovering opens a card grouped by course with names and due dates
    - The toggle on each row disables that task's reminder (remembered)
    - Click a task name to jump to its detail page

[Task Marking] (for "not submitted yet" / "need to double-check" items)
  A marked task is treated as pending unconditionally - even if it is submitted or past
  its due date - and shows up in the warning list with a red "marked" badge.
  Marks live only in your browser and are never synced to anyone.

  Three entry points:
    - Task detail page (/teaching/assignmentDetail/...): the small icon right of the
      title; left- or right-click toggles
    - Task list (/teaching): drag a task name UP into the yellow dashed box in the
      filter bar and release = toggle mark
    - Reminder card: drag a task name DOWN into the red solid box over the table and
      release = unmark

  Faster ways to unmark: click (left or right) the small yellow flag in the list row, or
  right-click anywhere on a marked row.

[What the red * means]
  When a course's term grade reported by the school differs from the one computed from
  its task breakdown (by more than 0.1), the course gets a red *, meaning "simulation
  for this course is an estimate only". The script tries to calibrate automatically when
  you open the grade book; if the numbers match afterwards, the * disappears. A starred
  course is retried automatically (up to 2 tries per course); if the * stays, the school's
  grade really does not match the task breakdown, and simulation for that course is an
  estimate only. There is no manual calibrate button - calibration is automatic.

[Past Years]
  Switch the Year dropdown in the filter bar to view historical grades and the GPA trend
  chart.


Troubleshooting
---------------
1. Refresh the page first. Injected controls live inside the current document, so a
   reload rebuilds them.
2. Or clear the cache: F12 > Application > Storage, then clear Local Storage and Session
   Storage. This also wipes the site's onboarding state and all simulation data, and may
   lose homework you have not submitted yet.
3. To build a report, open the browser console (F12 -> Console) and run:
     __INTS_DIAG()
   It builds a self-check report; hit "Copy report" and send me the text. It contains the
   version, browser, per-API status and recent errors - never your password or token.
   Send the report to chace.chen.stu@dipont-hc.com - you can mail it to me directly, or
   just describe what happened. Thank you.


Optional settings (advanced)
----------------------------
Run in the browser console, then refresh:

  Mark icon:        localStorage.setItem('ints_mark_icon','flag')
                    Options: tag (default) / pushpin / flag / highlight
  Auto-calibration: localStorage.setItem('ints_auto_calibrate','0')
                    Stops automatic calibration of starred courses when the grade book
                    loads (fewer requests)
                    Restore with localStorage.removeItem('ints_auto_calibrate')
  Verbose logs:     localStorage.removeItem('ints_diag')
                    Off by default; only needed when troubleshooting
  Inline off:       localStorage.setItem('ints_inline','0')
                    Stop injecting GPA / simulated values / Details / the toolbar into
                    the grade book page; only deadline reminders and task marks remain
                    Restore with localStorage.removeItem('ints_inline')


Uninstall
---------
1. Open the Tampermonkey dashboard, find "Better Intschool" and delete it (or switch it off).
2. To also clear local data, run in the console:
     Object.keys(localStorage).filter(k=>k.indexOf('ints')===0).forEach(k=>localStorage.removeItem(k));
   This removes simulations, task marks and target GPAs. Leaving it is harmless - the data
   only exists in your own browser.


FAQ
---
Q: The grade looks wrong / differs from my own calculation.
A: The script calibrates automatically. If the school's term grade still does not match
   the task breakdown, the course keeps a red *; in that case the school's number is
   authoritative.

Q: Why do some courses on the grade book not show my edited scores?
A: Only rows that match "subject + course name" are injected. Rows that do not count as
   grades (they would not enter the grade book anyway), such as self-study, conferences
   and student life, are never touched and stay exactly as the school renders them.

Q: No feature shows up after a refresh.
A: Refresh the page. If the school changed its page structure, the script may break
   temporarily; send me a diagnostics report (run __INTS_DIAG() in the console).

Q: Where are my edited scores, virtual tasks and marks stored?
A: In your own browser (localStorage). They are gone if you switch machine or browser or
   clear site data.

Q: Does simulating affect my real grades?
A: No. Simulations only touch local memory and localStorage. Nothing is uploaded and no
   write endpoint is ever called.

Q: Does it hammer the school's API?
A: No. Pending-task checks run every 15 minutes; switching back to the tab re-checks at
   most once every 2 minutes; auto-calibration handles at most 20 courses per session and
   at most 2 tries per course. All requests are same-origin read-only GETs.

Q: Does it use much data / will my teachers notice?
A: The script sends no data to any third party and never modifies server-side data; its
   requests look like normal page browsing. It is authorised by the IT teachers, so you
   can use it without worry.

Q: Does it work on mobile?
A: Not adapted. Desktop Chrome / Edge / Firefox only.

Q: How do updates work?
A: If you installed through the link above, Tampermonkey periodically checks for updates
   and prompts you; you can also run "Check for userscript updates" from its dashboard.


Notice
--------
  - Unofficial helper tool; not affiliated with the school or Intschool.
  - All scores are local estimates and may be inaccurate. The school system's numbers
    always take precedence.
  - Task marks, simulations and target GPAs are stored only in your browser's
    localStorage. They are visible on your machine only, never uploaded, and play no part
    in any assessment.
  - The script only reads school API data; it never modifies server-side content.
