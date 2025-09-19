import { DateTime } from 'luxon';

const INDIA_TIMEZONE = 'Asia/Kolkata';

/**
 *  Get today's date in IST in 'YYYY-MM-DD' format
 * → Use in frontend filters or API queries
 */
export function getTodayIST() {
  return DateTime.now().setZone(INDIA_TIMEZONE).toISODate();
}

/**
 *  Get full-day IST range from a given date (midnight to 11:59:59 PM)
 * → Use in backend MongoDB filtering
 */
export function getISTDateRange(dateStr) {
  const start = DateTime.fromISO(dateStr, { zone: INDIA_TIMEZONE }).startOf('day').toJSDate();
  const end = DateTime.fromISO(dateStr, { zone: INDIA_TIMEZONE }).endOf('day').toJSDate();
  return { start, end };
}

/**
 *  Convert any Date to readable IST format like "19 Jul 2025, 03:30 PM"
 * → Use to display timestamps in frontend
 */
export function formatISTReadable(date) {
  return DateTime.fromJSDate(date).setZone(INDIA_TIMEZONE).toFormat('dd LLL yyyy, hh:mm a');
}

















// Sure! Here's a **clean set of notes** (without code) explaining the **minimal and useful IST-specific date utilities** for your India-based project:

// ---

// ## 🇮🇳 IST-Specific Date Utility Notes for India-Based Projects

// ### ✅ Utility Functions You Need:

// 1. **Get Today's IST Date**

//    * Returns today's date in `YYYY-MM-DD` format.
//    * Used in frontend filters, API calls, and comparisons.
//    * Ensures consistent behavior across timezones.

// 2. **Get IST Day Range (Start & End)**

//    * Returns start and end timestamps of a given date in IST.
//    * Perfect for MongoDB filtering:

//      * Start → Midnight (00:00:00)
//      * End → 11:59:59 PM
//    * Handles day boundaries correctly, preventing cross-day mismatches due to UTC.

// 3. **Format Date in Readable IST Form**

//    * Converts any date into human-readable form like `"19 Jul 2025, 03:30 PM"`.
//    * Use it for displaying logs or timestamps to the user.
//    * Makes your UI locally relevant and easier to understand for Indian users.

// ---

// ### 🧠 Why These Are Enough for Local Projects:

// * These cover the **three core needs**: filter, query, and display — all in **IST**.
// * You avoid timezone-related bugs that occur due to default UTC behavior.
// * No extra weight from unnecessary date libraries or bloated functions.

// ---

// ### 🔁 Use Cases in Your App:

// | Scenario                               | Utility to Use         |
// | -------------------------------------- | ---------------------- |
// | Fetch today's audits                   | `Get Today's IST Date` |
// | Filter logs by a selected calendar day | `Get IST Day Range`    |
// | Show logs in human-friendly format     | `Format Readable IST`  |

// ---

// Let me know if you want a PDF or cheat sheet version for quick reference.
