const repo = "EshaSha/zhiva-updates";
const list = document.getElementById("release-list");

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function render(releases) {
  if (!list) return;
  list.replaceChildren();
  if (!releases.length) {
    renderFallback("Пока нет опубликованных релизов.");
    return;
  }
  for (const release of releases) {
    const card = document.createElement("article");
    card.className = "release-card";

    const head = document.createElement("div");
    head.className = "release-head";

    const tag = document.createElement("span");
    tag.className = "release-tag";
    tag.textContent = release.tag_name || "Релиз";

    const date = document.createElement("span");
    date.className = "release-date";
    date.textContent = formatDate(release.published_at);

    head.append(tag, date);
    card.append(head);

    const notes = document.createElement("p");
    notes.className = "release-notes";
    notes.textContent = (release.body || "").trim() || "Обновление приложения.";
    card.append(notes);

    const asset = (release.assets || []).find((item) => String(item.name).toLowerCase().endsWith(".apk"));
    if (asset?.browser_download_url) {
      const actions = document.createElement("div");
      actions.className = "release-actions";
      const download = document.createElement("a");
      download.className = "btn btn-primary";
      download.href = asset.browser_download_url;
      download.textContent = "Скачать APK";
      actions.append(download);
      card.append(actions);
    }
    list.append(card);
  }
}

function renderFallback(message) {
  if (!list) return;
  list.replaceChildren();
  const card = document.createElement("article");
  card.className = "release-card release-fallback";
  const text = document.createElement("p");
  text.className = "release-notes";
  text.textContent = message;
  const link = document.createElement("a");
  link.className = "btn btn-ghost";
  link.href = `https://github.com/${repo}/releases`;
  link.textContent = "Открыть релизы";
  card.append(text, link);
  list.append(card);
}

async function load() {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=10`, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error("release list unavailable");
    const releases = await response.json();
    render(Array.isArray(releases) ? releases : []);
  } catch (error) {
    renderFallback("Не удалось загрузить новости. Откройте список релизов на GitHub.");
  }
}

if (list) load();
