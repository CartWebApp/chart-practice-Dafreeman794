// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const titleSelect = document.getElementById("titleSelect");
const unitsSelect = document.getElementById("unitsSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))];
const titles = [...new Set(chartData.map(r => r.title))];

years.forEach(m => yearSelect.add(new Option(m, m)));
titles.forEach(h => titleSelect.add(new Option(h, h)));

yearSelect.value = years[0];
titleSelect.value = titles[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = Number(yearSelect.value);
  const title = titleSelect.value;
  const units = unitsSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, title, units });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, title, units }) {
  if (type === "bar") return barByGameTitle(year, units);
  if (type === "line") return lineOverTime(title, ["unitsM", "revenueUSD"]);
  if (type === "scatter") return scatterUnitsVsPrice(title);
  if (type === "doughnut") return doughnutUnitsByRegion(year, title);
  if (type === "radar") return radarCompareGametitles(year);
  return barByGameTitle(year, units);
}

// Task A: BAR — compare titles for a given year
function barByGameTitle(year, units) {
  const rows = chartData.filter(r => r.year === year);

  const labels = rows.map(r => r.title);
  const values = rows.map(r => r[units]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${units} in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Game title had (${year})` }
      },
      scales: {
        y: { title: { display: true, text: units } },
        x: { title: { display: true, text: "Game Titles" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one title (2 datasets)
function lineOverTime(title, units) {
  const rows = chartData.filter(r => r.title === title);

  const labels = rows.map(r => r.year);

  const datasets = units.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${title}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "year" } }
      }
    }
  };
}

// SCATTER — relationship between US prices and units
function scatterUnitsVsPrice(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.priceUSD, y: r.unitsM }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `units vs price (${title})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Price VS. Units (${title})` }
      },
      scales: {
        x: { title: { display: true, text: "Price (USD)" } },
        y: { title: { display: true, text: "Units" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one title + year
function doughnutUnitsByRegion(year, title) {

  console.log("Selected:", year, title);

  const row = chartData.filter(r => r.year === year && r.title === title);
  
  console.log("Matching rows:", row);


  if(!row) {
    alert("No data found for this title/year")
    return;
  }

  const regiontote = {};

   row.forEach(r => {
    if (!regiontote[r.region]) {
      regiontote[r.region] = 0;
    }
    regiontote[r.region] += r.unitsM;
  });

  const units = object.keys(regiontote);
  const region = object.values(regiontote);


  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ label: "Units (millions)", data: values }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Units by Region: ${title} (${year})` }
      }
    }
  };
}

// RADAR — compare titles that made a certain number of units for one year
function radarCompareGametitles(year) {
  const rows = chartData.filter(r => r.year === year);

  const units = ["unitsM", "revenueUSD", "priceUSD", "reviewScore"];
  const labels = units;

  const datasets = rows.map(r => ({
    label: r.title,
    data: units.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `units comparison (${year})` }
      }
    }
  };
}