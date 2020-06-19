const colors = ["#17b978", "#fc85ae", "#3d5af1"];
const searchBar = document.getElementById("search-bar");
const clearInputBtn = document.querySelector(".clear-btn");
let alerted = false;
let lineChart,
  barCharts = [];
let statesData, casesTimeSeries;
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

//checking if window has loaded
window.addEventListener("load", () => {
  searchBar.value = "";
  searchBar.focus();
  let inputEvent = document.createEvent("Event");
  inputEvent.initEvent("input", true, true);
  searchBar.dispatchEvent(inputEvent);
});

// function to fetch data from the api
const fetchData = async () => {
  try {
    const URL = "https://api.covid19api.com/summary"; // URL to fetch data from
    const fetchedData = await fetch(URL); // using fetch with async/await to fetch data
    const fetchedDataJson = await fetchedData.json();
    if (fetchedData.status !== 200) fetchData();
    // console.log(fetchedDataJson);
    await fetchIndiaData();
    renderData(fetchedDataJson);
    addSearchFunctionality(fetchedDataJson);
    addDetailsFunctionality(fetchedDataJson);
    document.querySelector("main").classList.add("main-loaded");
  } catch (error) {
    // catch block to handle errors
    // console.log("Some error occurred\n" + error);
    // fetchData();
  }
};

//function to fetch data for India from the api
const fetchIndiaData = async () => {
  try {
    const URL = "https://api.covid19india.org/data.json";
    const response = await fetch(URL);
    const responseJson = await response.json();
    if (response.status !== 200) fetchIndiaData();
    statesData = responseJson.statewise;
    // console.log(statesData);
    // console.log(sortConfirmed(statesData));
    casesTimeSeries = responseJson.cases_time_series;
    // console.log(casesTimeSeries);
    barCharts.push(createBarChart(casesTimeSeries, "Confirmed"));
    barCharts.push(createBarChart(casesTimeSeries, "Active"));
    barCharts.push(createBarChart(casesTimeSeries, "Recovered"));
    barCharts.push(createBarChart(casesTimeSeries, "Deceased"));
  } catch (error) {
    // catch block to handle errors
    // console.log("Some error occurred\n" + error);
    fetchIndiaData();
  }
};

//calling the function that fetches data from the api
fetchData();

//function to fetch daily worldwide data from the api
const fetchDailyData = async () => {
  try {
    const URL = "https://covid19.mathdro.id/api/daily";
    const fetchedDailyData = await fetch(URL);
    const fetchedDailyDataJson = await fetchedDailyData.json();
    if (fetchedDailyData.status !== 200) fetchDailyData();
    const dailyDataSimplified = manipulateDailyData(fetchedDailyDataJson);
    // console.log(dailyDataSimplified);
    lineChart = createLineChart(dailyDataSimplified);
  } catch (error) {
    // catch block to handle errors
    // console.log("Some error occurred\n" + error);
    fetchDailyData();
  }
};

//calling function that fetches daily worldwide data from the api
fetchDailyData();

//function that fetches the daily data of a country from the api
const fetchDailyDataCountry = async (countryName) => {
  const url = `https://api.covid19api.com/total/dayone/country/${countryName}`;
  try {
    const fetchedDailyDataCountry = await fetch(url);
    const fetchedDailyDataCountryJson = await fetchedDailyDataCountry.json();
    // if (fetchedDailyDataCountry.status != 200) fetchDailyDataCountry();
    const dailyDataCountrySimplified = manipulateDailyDataCountry(
      fetchedDailyDataCountryJson
    );
    // console.log(fetchedDailyDataCountryJson, dailyDataCountrySimplified);
    if (dailyDataCountrySimplified.length === 0) return false;
    lineChart = createLineChart(dailyDataCountrySimplified, true);
    return true;
  } catch (error) {
    // catch block to handle errors
    // console.log("Some error occurred\n" + error);
    // fetchDailyDataCountry();
  }
};

//rendering the data in form of cards for each country
function renderData(data) {
  const updatedTime = document.getElementById("updated-time");
  updatedTime.textContent =
    new Date(data.Date).toDateString() +
    " " +
    new Date(data.Date).toLocaleTimeString();
  renderGlobalData(data);
  const countries = data.Countries;
  const cardsContainer = document.querySelector(".cards-wrapper");
  const categories = ["CONFIRMED", "RECOVERED", "DEATHS"];
  countries.forEach((country) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-slug", country.Slug);
    card.style.borderBottomColor = `${
      colors[parseInt(Math.random() * colors.length)]
    }`;
    const cardHead = document.createElement("h1");
    cardHead.innerHTML = country.Country;
    card.appendChild(cardHead);
    const stats = document.createElement("div");
    stats.classList.add("stats");
    for (let index = 0; index < 3; index++) {
      const statData = document.createElement("div");
      statData.classList.add("stat-data");
      const statHead = document.createElement("p");
      statHead.textContent = categories[index];
      statHead.classList.add("stat-head");
      statData.appendChild(statHead);
      const numbers = document.createElement("div");
      numbers.classList.add("numbers");
      const data1 = document.createElement("p");
      data1.classList.add(`${categories[index].toLowerCase()}`);
      data1.textContent =
        country.Country.toLowerCase() === "india"
          ? statesData[0][`${categories[index].toLowerCase()}`]
          : country[
              `Total${
                categories[index].substring(0, 1).toUpperCase() +
                categories[index].substring(1).toLowerCase()
              }`
            ];
      numbers.appendChild(data1);
      const data2 = document.createElement("p");
      data1.classList.add(`new-${categories[index].toLowerCase()}`);
      data2.textContent =
        country.Country.toLowerCase() === "india"
          ? parseInt(
              statesData[0][`delta${categories[index].toLowerCase()}`]
            ) >= 0
            ? "+" +
              Math.abs(
                parseInt(
                  statesData[0][`delta${categories[index].toLowerCase()}`]
                )
              )
            : "-" +
              Math.abs(
                parseInt(
                  statesData[0][`delta${categories[index].toLowerCase()}`]
                )
              )
          : "+" +
            country[
              `New${
                categories[index].substring(0, 1).toUpperCase() +
                categories[index].substring(1).toLowerCase()
              }`
            ] +
            " new";
      numbers.appendChild(data2);
      statData.appendChild(numbers);
      stats.appendChild(statData);
    }
    card.appendChild(stats);
    cardsContainer.appendChild(card);
  });
}

//function to display global data
function renderGlobalData(data) {
  const statsDivs = document.querySelectorAll(
    ".global .card .stats .stat-data"
  );
  const confirmed = {
    TotalConfirmed: data.Global.TotalConfirmed,
    NewConfirmed: data.Global.NewConfirmed,
  };
  const recovered = {
    TotalRecovered: data.Global.TotalRecovered,
    NewRecovered: data.Global.NewRecovered,
  };
  const deaths = {
    TotalDeaths: data.Global.TotalDeaths,
    NewDeaths: data.Global.NewDeaths,
  };
  statsDivs.forEach((statDiv) => {
    if (statDiv.classList.contains("confirmed-stat")) {
      document.querySelector(".confirmed").textContent =
        confirmed.TotalConfirmed;
      document.querySelector(".new-confirmed").textContent =
        "+" + confirmed.NewConfirmed + " new";
    } else if (statDiv.classList.contains("recovered-stat")) {
      document.querySelector(".recovered").textContent =
        recovered.TotalRecovered;
      document.querySelector(".new-recovered").textContent =
        "+" + recovered.NewRecovered + " new";
    } else if (statDiv.classList.contains("deaths-stat")) {
      document.querySelector(".deaths").textContent = deaths.TotalDeaths;
      document.querySelector(".new-deaths").textContent =
        "+" + deaths.NewDeaths + " new";
    }
  });
}

function addSearchFunctionality(data) {
  const searchBtn = document.querySelector(".search-icon");
  const allCards = document.querySelectorAll(".card");
  searchBar.addEventListener("input", () => {
    if (searchBar.value !== "") {
      clearInputBtn.style.display = "block";
      clearBtn();
      search(searchBar.value, data);
    } else {
      clearInputBtn.style.display = "none";
      allCards.forEach((card) => {
        card.style.display = "flex";
      });
    }
  });
  searchBtn.addEventListener("click", () => {
    if (searchBar.value === "") searchBar.focus();
    else search(searchBar.value, data);
  });
}

function search(value, data) {
  const alertMsg = document.querySelector(".alert-msg");
  if (alertMsg) {
    alertMsg.remove();
    alerted = false;
  }
  const countries = data.Countries;
  const cardsContainer = document.querySelector(".cards-wrapper");
  const allCards = document.querySelectorAll(".card");

  allCards.forEach((card) => {
    card.style.display = "none";
  });
  const cards = document.querySelectorAll(".cards-wrapper .card");
  let cardIndex;
  countries.forEach((country, index) => {
    if (country.Country.toUpperCase().startsWith(value.toUpperCase())) {
      cardIndex = index;
      cards[cardIndex].style.display = "flex";
    }
  });
  if (
    "GLOBAL".startsWith(value.toUpperCase()) ||
    "WORLDWIDE".startsWith(value.toUpperCase())
  ) {
    allCards[0].style.display = "flex";
    cardIndex = -1;
  }
  if (cardIndex === undefined) {
    if (!alerted) showAlertMsg("No search result found");
    alerted = true;
  }
}

function clearBtn() {
  clearInputBtn.addEventListener("click", () => {
    searchBar.value = "";
    searchBar.focus();
    let inputEvent = document.createEvent("Event");
    inputEvent.initEvent("input", true, true);
    searchBar.dispatchEvent(inputEvent);
  });
}

function showAlertMsg(msg) {
  const main = document.querySelector("main");
  const alertMsg = document.createElement("div");
  alertMsg.classList.add("alert-msg");
  alertMsg.innerHTML = `<svg aria-hidden="true" focusable="false" viewBox="0 0 512 512"><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg><h1>No Results Found</h1><p>Try a different search</p>`;
  main.appendChild(alertMsg);
  alerted = true;
}

function addDetailsFunctionality(data) {
  const allCards = document.querySelectorAll(".card");

  allCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      viewDetails(card, index, data);
    });
  });
}

//this function is fired when the user clicks on a card to view the corresponding country's details
async function viewDetails(card, index, data) {
  const overlayDiv = document.createElement("div");
  overlayDiv.classList.add("overlay-div");
  document.body.appendChild(overlayDiv);
  setTimeout(
    () => (document.querySelector(".container").style.display = "none"),
    500
  );
  let content;
  if (index !== 0) {
    content = data.Countries[index - 1];
  } else {
    content = data.Global;
  }

  overlayDiv.innerHTML = `<div class="details">
  <div class="header">
  <h1>COVID-19 Statistics</h1>
  <h3>Stay Home. Save Lives</h3>
  <div class="back-btn" onclick="goToHome()">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 512 512"><path d="M256 504C119 504 8 393 8 256S119 8 256 8s248 111 248 248-111 248-248 248zm28.9-143.6L209.4 288H392c13.3 0 24-10.7 24-24v-16c0-13.3-10.7-24-24-24H209.4l75.5-72.4c9.7-9.3 9.9-24.8.4-34.3l-11-10.9c-9.4-9.4-24.6-9.4-33.9 0L107.7 239c-9.4 9.4-9.4 24.6 0 33.9l132.7 132.7c9.4 9.4 24.6 9.4 33.9 0l11-10.9c9.5-9.5 9.3-25-.4-34.3z"></path></svg>
  </div>
  </div><div class="main-content">
  <div class="sec1-content">
    <h1 class="headline">${content.Country || "Worldwide"}</h1>
    <div class="content-stats">
      <div class="stat-row">
        <h3 class="left-head">
          Confirmed:
        </h3>
        <p class="right-number">${
          content.Country && content.Country.toLowerCase() === "india"
            ? statesData[0].confirmed
            : content.TotalConfirmed
        } <span>${
    content.Country && content.Country.toLowerCase() === "india"
      ? parseInt(statesData[0].deltaconfirmed) >= 0
        ? `+${Math.abs(parseInt(statesData[0].deltaconfirmed))}`
        : `-${Math.abs(parseInt(statesData[0].deltaconfirmed))}`
      : `+${content.NewConfirmed}`
  } new</span></p>
      </div>
      <div class="stat-row">
        <h3 class="left-head">
          Recovered:
        </h3>
        <p class="right-number">${
          content.Country && content.Country.toLowerCase() === "india"
            ? statesData[0].recovered
            : content.TotalRecovered
        } <span>+${
    content.Country && content.Country.toLowerCase() === "india"
      ? statesData[0].deltarecovered
      : content.NewRecovered
  } new</span></p>
      </div>
      <div class="stat-row">
        <h3 class="left-head">
          Deaths:
        </h3>
        <p class="right-number">${
          content.Country && content.Country.toLowerCase() === "india"
            ? statesData[0].deaths
            : content.TotalDeaths
        } <span>+${
    content.Country && content.Country.toLowerCase() === "india"
      ? statesData[0].deltadeaths
      : content.NewDeaths
  } new</span></p>
      </div>
    </div>
  </div>
  ${
    content.Country === "India"
      ? `<div class="sec2-content"><p class="last-updated" style="margin-bottom:20px;margin-left:17px">Last Updated <span id="updated-time">${
          statesData[0].lastupdatedtime
        }</span></p><div class="table-inner">
  <div class="table-head">
  <h3>State/UT</h3>
  <h3>Confirmed</h3>
  <h3>Active</h3>
  <h3>Recovered</h3>
  <h3>Deaths</h3>
  </div>
  ${statesData
    .map((stateData, idx) => {
      if (idx !== 0) {
        return `<div class="table-row ${
          stateData.statenotes ? `has-notes` : ``
        }">
       <p>${stateData.state} ${
          stateData.statenotes
            ? `<svg class="info-svg" aria-hidden="true" focusable="false" viewBox="0 0 512 512" class="svg-inline--fa fa-info-circle fa-w-16 fa-3x"><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"></path></svg>`
            : ""
        }</p>
       <p>${stateData.confirmed} ${
          parseInt(stateData.deltaconfirmed) !== 0 &&
          stateData.deltaconfirmed !== undefined &&
          stateData.deltaconfirmed !== null
            ? `<br><span class="delta-state-cases"> ${
                parseInt(stateData.deltaconfirmed) >= 0
                  ? `+${Math.abs(parseInt(stateData.deltaconfirmed))}`
                  : `-${Math.abs(parseInt(stateData.deltaconfirmed))}`
              }</span>`
            : ""
        }</p>
       <p>${stateData.active} ${
          parseInt(stateData.deltaconfirmed) -
            parseInt(stateData.deltarecovered) -
            parseInt(stateData.deltadeaths) !==
          0
            ? `<br><span class="delta-state-cases"> ${
                parseInt(stateData.deltaconfirmed) -
                  parseInt(stateData.deltarecovered) -
                  parseInt(stateData.deltadeaths) >=
                0
                  ? `+${Math.abs(
                      parseInt(stateData.deltaconfirmed) -
                        parseInt(stateData.deltarecovered) -
                        parseInt(stateData.deltadeaths)
                    )}`
                  : `-${Math.abs(
                      parseInt(stateData.deltaconfirmed) -
                        parseInt(stateData.deltarecovered) -
                        parseInt(stateData.deltadeaths)
                    )}`
              }<span>`
            : ""
        }</p>
       <p>${stateData.recovered} ${
          parseInt(stateData.deltarecovered) !== 0 &&
          stateData.deltarecovered !== undefined &&
          stateData.deltarecovered !== null
            ? `<br><span class="delta-state-cases"> ${
                parseInt(stateData.deltarecovered) >= 0
                  ? `+${Math.abs(parseInt(stateData.deltarecovered))}`
                  : `-${Math.abs(parseInt(stateData.deltarecovered))}`
              }</span>`
            : ""
        }</p>
       <p>${stateData.deaths} ${
          parseInt(stateData.deltadeaths) !== 0 &&
          stateData.deltadeaths !== undefined &&
          stateData.deltadeaths !== null
            ? `<br><span class="delta-state-cases"> ${
                parseInt(stateData.deltadeaths) >= 0
                  ? `+${Math.abs(parseInt(stateData.deltadeaths))}`
                  : `-${Math.abs(parseInt(stateData.deltadeaths))}`
              }</span>`
            : ""
        }</p>
       ${
         stateData.statenotes
           ? `<p class="state-notes"><span class="note-content"><span class="triangle"></span> <span class="note-text">${stateData.statenotes}</span></span></p>`
           : ""
       }       
      </div>`;
      }
    })
    .join("")}
  </div>`
      : ""
  }
  </div>
  </div>
  </div>`;
  if (content.Country === "India") createTabs();
  let dailyDataExists;
  if (content.Country === "India") dailyDataExists = true;
  appendLineChart(lineChart, content.Country);
  if (content.Country && content.Country !== "India")
    dailyDataExists = await fetchDailyDataCountry(card.dataset.slug);
  else if (content.Country === "India") {
    // console.log(manipulateIndianData(casesTimeSeries));
    lineChart = createLineChart(manipulateIndianData(casesTimeSeries), true);
  }
  if (dailyDataExists) appendCountryLineChart(lineChart, content.Country);
  if (content.Country === "India") {
    barCharts.forEach((barChart, index) => {
      appendBarChart(barChart, index);
    });
    document.querySelectorAll(".sec4-content").forEach((elem) => {
      elem.style.display = "none";
    });
  }
}

const createTabs = () => {
  const parentElem = document.querySelector(".main-content");
  const charts = document.createElement("div");
  charts.classList.add("chart-tabs");
  charts.innerHTML = `<div class='tabs-head'><h3 class='active-tab'>Cumulative</h3><h3>Daily</h3></div><div class='tabs'></div>`;
  parentElem.appendChild(charts);
  const tabSelectors = document.querySelectorAll(".tabs-head h3");
  tabSelectors.forEach((tabSelector, index) => {
    tabSelector.addEventListener("click", () => {
      if (index === 0) {
        tabSelector.classList.add("active-tab");
        tabSelectors[1].classList.remove("active-tab");
        document.querySelector(".sec3-content").style.display = "block";
        document.querySelectorAll(".sec4-content").forEach((elem) => {
          elem.style.display = "none";
        });
      } else {
        tabSelector.classList.add("active-tab");
        tabSelectors[0].classList.remove("active-tab");
        document.querySelector(".sec3-content").style.display = "none";
        document.querySelectorAll(".sec4-content").forEach((elem) => {
          elem.style.display = "block";
        });
      }
    });
  });
};

// this function is fired when user clicks on back-btn at the top of the page => to go back to the home page
function goToHome() {
  setTimeout(
    () => (document.querySelector(".container").style.display = "block"),
    100
  );
  setTimeout(() => document.querySelector(".overlay-div").remove(), 100);
}

function manipulateDailyData(dailyData) {
  return dailyData.map((data) => {
    return {
      confirmed: data.confirmed.total,
      deaths: data.deaths.total,
      date: data.reportDate,
    };
  });
}

function createLineChart(data, countryChart = false) {
  const config = {
    type: "line",
    data: {
      labels: countryChart
        ? data.map((elem) => elem.date)
        : getLineChartLabels(data),
      datasets: [
        {
          label: "Confirmed",
          data: data.map((elem) => elem.confirmed),
          backgroundColor: colors[2],
          borderColor: colors[2],
          fill: false,
        },
        {
          label: "Deaths",
          data: data.map((elem) => elem.deaths),
          backgroundColor: "#555555",
          borderColor: "#555555",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      tooltips: {
        mode: "index",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
      scales: {
        xAxes: [
          {
            display: true,
          },
        ],
        yAxes: [
          {
            display: true,
          },
        ],
      },
    },
  };
  if (countryChart) {
    const countryDatasets = [
      {
        label: "Recovered",
        data: data.map((elem) => elem.recovered),
        backgroundColor: "#d12762",
        borderColor: "#d12762",
        fill: false,
      },
      {
        label: "Active",
        data: data.map((elem) => elem.active),
        backgroundColor: "#148d5d",
        borderColor: "#148d5d",
        fill: false,
      },
    ];
    config.data.datasets.push(...countryDatasets);
  }
  return config;
}

const createBarChart = (data, label) => {
  return {
    type: "bar",
    data: {
      labels: data.map((elem) => elem.date),
      datasets: [
        {
          label: label,
          data: calculateDailyData(data, label),
          backgroundColor: data.map(
            (elem) =>
              `${
                label === "Confirmed"
                  ? `#007bff`
                  : label === "Active"
                  ? `#28a745`
                  : label === "Recovered"
                  ? `#ff073a`
                  : label === "Deaths"
                  ? `#6c757d`
                  : ""
              }`
          ),
          borderColor: data.map(
            (elem) =>
              `${
                label === "Confirmed"
                  ? `${colors[2]}`
                  : label === "Active"
                  ? `#148d5d`
                  : label === "Recovered"
                  ? `#d12762`
                  : label === "Deaths"
                  ? `#555555`
                  : ""
              }`
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  };
};

const getLineChartLabels = (data) => {
  const rawDates = data.map((elem) => elem.date);
  return rawDates.map((date) => {
    const parts = date.split("-");
    const day = parts[2];
    const month = months[parts[1] - 1];
    const year = parts[0].substring("2");
    const fullDate = `${day} ${month} '${year}`;
    return fullDate;
  });
};

const appendLineChart = (chart, country) => {
  if (country) return;
  let parentElem = document.querySelector(".chart-tabs");
  if (parentElem === null) parentElem = document.querySelector(".main-content");
  const sec3 = document.createElement("div");
  sec3.classList.add("sec3-content");
  parentElem.appendChild(sec3);
  sec3.innerHTML += `<canvas id="lineChart"></canvas>`;
  const canvas = document.getElementById("lineChart");
  const ctx = canvas.getContext("2d");
  window.myLine = new Chart(ctx, chart);
};

const appendBarChart = (chart, count) => {
  let parentElem = document.querySelector(".chart-tabs");
  if (parentElem === null) parentElem = document.querySelector(".main-content");
  const sec4 = document.createElement("div");
  sec4.classList.add("sec4-content");
  parentElem.appendChild(sec4);
  sec4.innerHTML += `<canvas class="barChart"></canvas>`;
  const collections = document.querySelectorAll(".barChart");
  collections.forEach((collection, index) => {
    if (count === index) collection.id = "barChart" + index;
  });
  const canvas = document.getElementById("barChart" + count);
  const ctx = canvas.getContext("2d");
  window.myLine = new Chart(ctx, chart);
};

const appendCountryLineChart = (chart, country) => {
  if (!country) return;
  const parentElem = document.querySelector(".main-content");
  const sec3 = document.createElement("div");
  sec3.classList.add("sec3-content");
  parentElem.appendChild(sec3);
  sec3.innerHTML += `<canvas id=${country.split(" ")[0]}></canvas>`;
  const canvas = document.getElementById(`${country.split(" ")[0]}`);
  const ctx = canvas.getContext("2d");
  window.myLine = new Chart(ctx, chart);
};

const manipulateDailyDataCountry = (data) => {
  return data.map((elem) => {
    return {
      confirmed: elem.Confirmed,
      active: elem.Active,
      recovered: elem.Recovered,
      deaths: elem.Deaths,
      date: manipulateDate(elem.Date),
    };
  });
};

// function to change the date from
const manipulateDate = (date) => {
  const day = new Date(date).getDate();
  const month = new Date(date).getMonth();
  const year = new Date(date).getFullYear();
  return `${day} ${months[month]}'${year % 100}`;
};

const manipulateIndianData = (casesTimeSeries) => {
  return casesTimeSeries.map((elem) => {
    return {
      date: elem.date + "'20",
      confirmed: parseInt(elem.totalconfirmed),
      recovered: parseInt(elem.totalrecovered),
      deaths: parseInt(elem.totaldeceased),
      active: elem.totalconfirmed - elem.totalrecovered - elem.totaldeceased,
    };
  });
};

const sortConfirmed = (array) => {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1; j++) {
      if (parseInt(array[j].confirmed) < parseInt(array[j + 1].confirmed)) {
        tmp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = tmp;
      }
    }
  }
  return array;
};

const calculateDailyData = (data, label) => {
  label = label.toLowerCase();
  return data.map((elem) => {
    if (label === "active") {
      return (
        parseInt(elem[`dailyconfirmed`]) -
        parseInt(elem[`dailyrecovered`]) -
        parseInt(elem[`dailydeceased`])
      );
    } else {
      return parseInt(elem[`daily${label}`]);
    }
  });
};
