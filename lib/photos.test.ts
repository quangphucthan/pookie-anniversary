// Pinned to where this album actually lives, so the date maths below is
// deterministic instead of a property of whoever ran the suite. Node picks a
// runtime TZ change up, and the test runner gives each file its own process.
process.env.TZ = "Asia/Ho_Chi_Minh"; // UTC+7

import test from "node:test";
import assert from "node:assert/strict";
import { groupByMonth, localDate, monthOf } from "./photos.ts";

const p = (taken_on: string | null) => ({ taken_on });
const keys = <T extends { taken_on: string | null }>(rows: T[]) =>
    groupByMonth(rows).map((g) => g.key);

test("month boundaries don't depend on the timezone", () => {
    // The bug this guards: new Date("2025-04-01") is UTC midnight, which is
    // March 31st in every timezone west of Greenwich.
    assert.equal(monthOf("2025-04-01").key, "2025-04", "first of the month stays put");
    assert.equal(monthOf("2025-04-30").key, "2025-04", "last of the month stays put");
    assert.equal(monthOf("2025-12-31").key, "2025-12", "new year's eve stays in December");
});

test("labels read as Vietnamese, without a leading zero", () => {
    assert.equal(monthOf("2025-04-26").label, "Tháng 4, 2025");
    assert.equal(monthOf("2025-11-02").label, "Tháng 11, 2025");
});

test("collects a month into one section and keeps the incoming order", () => {
    const groups = groupByMonth([p("2025-05-02"), p("2025-04-26"), p("2025-04-01")]);
    assert.deepEqual(
        groups.map((g) => g.key),
        ["2025-05", "2025-04"],
        "newest section first, matching the query's ordering",
    );
    assert.equal(groups[1].photos.length, 2, "both April photos land together");
});

test("a month split across the list still comes out as one section", () => {
    assert.deepEqual(keys([p("2025-04-26"), p("2025-05-02"), p("2025-04-01")]), [
        "2025-04",
        "2025-05",
    ]);
});

test("undated photos go last, however they arrive", () => {
    assert.deepEqual(keys([p(null), p("2025-04-26")]), ["2025-04", "undated"]);
    assert.deepEqual(keys([p("not a date"), p("2025-04-26")]), ["2025-04", "undated"]);
    assert.deepEqual(keys([p(null), p("")]), ["undated"], "one section, not two");
});

test("an empty album has no sections", () => {
    assert.deepEqual(groupByMonth([]), []);
});

test("taken_on is the date the uploader saw, not the UTC one", () => {
    // 2am on the 1st in UTC+7 is still the previous month in UTC. Storing the
    // UTC answer would file this photo one section too far back.
    assert.equal(localDate(new Date(2025, 4, 1, 2, 0).getTime()), "2025-05-01");
    assert.equal(monthOf(localDate(new Date(2025, 4, 1, 2, 0).getTime())).key, "2025-05");

    // ...and the other end of the day, which UTC gets right anyway.
    assert.equal(localDate(new Date(2025, 3, 26, 23, 30).getTime()), "2025-04-26");
});

test("taken_on pads to a shape Postgres accepts as a date", () => {
    assert.match(localDate(new Date(2025, 0, 5, 12).getTime()), /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(localDate(new Date(2025, 0, 5, 12).getTime()), "2025-01-05");
});
