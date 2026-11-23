const repo = "EshaSha/zhiva-updates";
const releasesPage = `https://github.com/${repo}/releases/latest`;
const versionNodes = document.querySelectorAll("[data-version]");
const downloadNodes = document.querySelectorAll("[data-download]");
const fallbackVersion = versionNodes[0]?.textContent.trim() || "0.6.370";

function normalizeVersion(value) {
  return String(value || "").trim().replace(/^v/i, "");
}

function isVersion(value) {
  return /^\d+(?:\.\d+){1,3}$/.test(value);
}

async function request(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLatestRelease() {
  const response = await request(
    `https://api.github.com/repos/${repo}/releases/latest`,
    {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" }
    }
  );
  if (!response?.ok) return null;

  try {
    const release = await response.json();
    const version = normalizeVersion(release.tag_name);
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const apk =
      assets.find((asset) => asset.name === `zhiva-${version}.apk`) ||
      assets.find((asset) => asset.name === "zhiva.apk") ||
      assets.find((asset) => String(asset.name).toLowerCase().endsWith(".apk"));

    return {
      version: isVersion(version) ? version : fallbackVersion,
      url: apk?.browser_download_url || releasesPage
    };
  } catch (error) {
    return null;
  }
}

async function fetchVersionFile() {
  const sources = [
    `https://raw.githubusercontent.com/${repo}/main/version.txt`,
    "version.txt"
  ];

  for (const source of sources) {
    const response = await request(source, { cache: "no-store" });
    if (!response?.ok) continue;

    try {
      const version = normalizeVersion(await response.text());
      if (isVersion(version)) return version;
    } catch (error) {
      continue;
    }
  }

  return null;
}

function applyVersion(version, downloadUrl) {
  versionNodes.forEach((node) => {
    node.textContent = version;
  });
  downloadNodes.forEach((node) => {
    node.href = downloadUrl;
  });
}

async function updateVersionAndDownload() {
  const release = await fetchLatestRelease();
  if (release) {
    applyVersion(release.version, release.url);
    return;
  }

  const version = await fetchVersionFile();
  applyVersion(version || fallbackVersion, releasesPage);
}

if (versionNodes.length || downloadNodes.length) {
  updateVersionAndDownload();
}
