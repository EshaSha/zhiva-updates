const versionNodes = document.querySelectorAll("[data-version]");
const fallbackVersion = versionNodes[0]?.textContent.trim() || "0.6.370";

function isVersion(value) {
  return /^\d+(?:\.\d+){1,3}$/.test(value);
}

async function fetchVersion(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) {
      return null;
    }

    const text = (await response.text()).trim().replace(/^\uFEFF/, "");
    return isVersion(text) ? text : null;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function updateVersion() {
  const sources = [
    "https://raw.githubusercontent.com/EshaSha/zhiva-updates/main/version.txt",
    "version.txt"
  ];

  for (const source of sources) {
    const version = await fetchVersion(source);
    if (version) {
      versionNodes.forEach((node) => {
        node.textContent = version;
      });
      return;
    }
  }

  versionNodes.forEach((node) => {
    node.textContent = fallbackVersion;
  });
}

if (versionNodes.length) {
  updateVersion();
}
