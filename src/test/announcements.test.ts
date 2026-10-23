import { describe, expect, it } from "vitest";
import { visibleAnnouncements, type Announcement } from "../lib/announcements";
const a = (o: Partial<Announcement>): Announcement => ({ id: "1", message: "m", kind: "outage", starts_at: "2026-10-01T00:00:00Z", ends_at: null, dismissible: true, active: true, ...o });
const now = Date.parse("2026-10-22T00:00:00Z");
describe("system announcements", () => {
  it("shows active messages within their time window", () => { expect(visibleAnnouncements([a({})], now, [])).toHaveLength(1); });
  it("hides ended, not-yet-started and inactive messages", () => {
    expect(visibleAnnouncements([a({ ends_at: "2026-10-21T00:00:00Z" }), a({ id: "2", starts_at: "2026-10-23T00:00:00Z" }), a({ id: "3", active: false })], now, [])).toHaveLength(0);
  });
  it("dismissed only hides dismissible messages", () => {
    expect(visibleAnnouncements([a({}), a({ id: "2", dismissible: false })], now, ["1", "2"]).map((x) => x.id)).toEqual(["2"]);
  });
});
