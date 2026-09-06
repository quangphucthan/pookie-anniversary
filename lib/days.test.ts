import test from "node:test";
import assert from "node:assert/strict";
import { daysSince } from "./days.ts";

const d = (a: string, b: string) => daysSince(new Date(a), new Date(b));

test("counts calendar days, not 24h blocks", () => {
    assert.equal(d("2024-01-01T00:00", "2024-01-02T00:00"), 1);
    assert.equal(d("2024-01-01T23:59", "2024-01-02T00:01"), 1, "two minutes apart is still a day");
    assert.equal(d("2024-01-01T00:00", "2024-01-01T23:59"), 0, "same day is zero");
});

test("survives DST and leap years", () => {
    assert.equal(
        d("2024-03-09T12:00", "2024-03-11T12:00"),
        2,
        "spring forward: 47h is still 2 days",
    );
    assert.equal(d("2024-11-02T12:00", "2024-11-04T12:00"), 2, "fall back: 49h is still 2 days");
    assert.equal(d("2024-02-28T00:00", "2024-03-01T00:00"), 2, "leap day counts");
    assert.equal(d("2024-01-01T00:00", "2025-01-01T00:00"), 366, "2024 is a leap year");
});
