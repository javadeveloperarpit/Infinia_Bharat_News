// ======================================================
// GITHUB CONFIG
// ======================================================

export const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN;

export const GITHUB_OWNER =
  process.env.GITHUB_OWNER;

export const GITHUB_REPO =
  process.env.GITHUB_REPO;

export const GITHUB_BRANCH =
  process.env.GITHUB_BRANCH || "main";

export function validateGitHubConfig() {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is missing");
  }

  if (!GITHUB_OWNER) {
    throw new Error("GITHUB_OWNER is missing");
  }

  if (!GITHUB_REPO) {
    throw new Error("GITHUB_REPO is missing");
  }

  if (!GITHUB_BRANCH) {
    throw new Error("GITHUB_BRANCH is missing");
  }
}