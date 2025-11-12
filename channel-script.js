const basePath = "./countries/";
const channelContainer = document.querySelector(".channel-list");
const countryContainer = document.querySelector(".categories");
const searchInput = document.querySelector("input[type='text']");

let countryIndex = {};
let filteredCountries = [];

async function loadCountryIndex() {
  try {
    const res = await fetch("./countryIndex.json");
    countryIndex = await res.json();

    filteredCountries = Object.keys(countryIndex)
      .filter(
        (name) =>
          !/movie|series|vod|netflix|disney|hbo|paramount|film|cinema|drama|kids|cartoon|anime|marvel|pixar|universal|documentary|(\b19\d{2}\b)|(\b20\d{2}\b)/i.test(
            name
          ) &&
          !/^(test|backup)$/i.test(name)
      )
      .sort();
    renderCountryList(filteredCountries);
  } catch (err) {
    console.error("Failed to load index:", err);
    countryContainer.innerHTML = "<p>❌ Could not load country index.</p>";
  }
}

function renderCountryList(countries) {
  countryContainer.innerHTML = "";
  countries.forEach((name) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "country-btn";
    btn.onclick = () => loadCountryChannels(name);
    countryContainer.appendChild(btn);
  });
}

async function loadCountryChannels(countryName) {
  const files = countryIndex[countryName];
  if (!files) return;

  channelContainer.innerHTML = `<h2>${countryName}</h2><p>Loading ${files.length} file(s)...</p>`;
  const allChannels = [];

  for (const file of files) {
    const url = `${basePath}${file}`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();

      const lines = text.split(/\r?\n/);
      let current = {};
      for (const line of lines) {
        if (line.startsWith("#EXTINF:")) {
          const name = line.split(",").pop().trim();

          // Detect the group-title (e.g., Live, Movies, Series)
          const match = line.match(/group-title="([^"]+)"/i);
          const group = match ? match[1].toLowerCase() : "";

          // Store metadata
          current = { name, group };
        } else if (line.startsWith("http")) {
          // Skip .mkv links
          if (line.trim().toLowerCase().endsWith(".mkv")) {
            current = {};
            continue;
          }

          const isLikelyLive =
            current.group.includes("live") ||
            current.group.includes("tv") ||
            current.group.includes("asia") ||
            current.group.includes("premium") ||
            current.group.includes("uhd") ||
            current.group.includes("4k") ||
            /^[A-Z]{2}\|/.test(current.group.toUpperCase()) ||
            (!current.group &&
              !line.toLowerCase().includes("movie") &&
              !line.toLowerCase().includes("series") &&
              !line.toLowerCase().includes("vod"));

          if (isLikelyLive) {
            current.url = line;
            allChannels.push(current);
          }

          current = {};
        }
      }
    } catch (e) {
      console.error("Error reading", file, e);
    }
  }

  // If all channels were .mkv or none remain, skip rendering this folder
  if (allChannels.length === 0) {
    console.log(`⏩ Skipped ${countryName} (only .mkv or empty)`);
    return;
  }

  renderChannelList(allChannels, countryName);
}

function renderChannelList(channels, country) {
  channelContainer.innerHTML = `<h2>${country}</h2>`;
  if (!channels.length) {
    channelContainer.innerHTML += "<p>No channels found.</p>";
    return;
  }

  const list = document.createElement("div");
  list.className = "channel-grid";
  channels.forEach((ch) => {
    const div = document.createElement("div");
    div.className = "channel-item";
    div.innerHTML = `
      <strong>${ch.name}</strong><br>
      <a href="${ch.url}" target="_blank">${ch.url}</a>
    `;
    list.appendChild(div);
  });
  channelContainer.appendChild(list);
}

// Search bar filters countries
searchInput.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const result = Object.keys(countryIndex).filter((c) =>
    c.toLowerCase().includes(term)
  );
  renderCountryList(result);
});

loadCountryIndex();