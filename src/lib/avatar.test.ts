import { describe, expect, it } from "vitest";

import { avatarSrcOf } from "./avatar";

const API_BASE = "https://api.test";

describe("avatarSrcOf", () => {
  it("returns undefined without a photo", () => {
    expect(avatarSrcOf(undefined, API_BASE)).toBeUndefined();
    expect(avatarSrcOf(null, API_BASE)).toBeUndefined();
    expect(avatarSrcOf("", API_BASE)).toBeUndefined();
  });

  it("prefixes a relative URL with the API base", () => {
    expect(avatarSrcOf("/uploads/avatars/u1", API_BASE)).toBe(`${API_BASE}/uploads/avatars/u1`);
  });

  it("keeps an absolute URL untouched", () => {
    expect(avatarSrcOf("https://cdn.example/avatar.png", API_BASE)).toBe(
      "https://cdn.example/avatar.png",
    );
  });

  it("keeps a data URL untouched", () => {
    expect(avatarSrcOf("data:image/png;base64,AAAA", API_BASE)).toBe("data:image/png;base64,AAAA");
  });

  it("normalizes leading and trailing slashes", () => {
    expect(avatarSrcOf("/uploads/avatars/u1/", API_BASE)).toBe(`${API_BASE}/uploads/avatars/u1`);
  });

  it("anchors relative URLs at the API origin when the base carries a path prefix", () => {
    expect(avatarSrcOf("/uploads/avatars/u1", "https://api.test/api/v1")).toBe(
      "https://api.test/uploads/avatars/u1",
    );
  });

  it("anchors at the origin even with trailing slash and prefix", () => {
    expect(avatarSrcOf("uploads/avatars/u1", "https://api.test/api/v1/")).toBe(
      "https://api.test/uploads/avatars/u1",
    );
  });
});
