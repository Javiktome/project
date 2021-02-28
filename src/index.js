import "./styles/style.scss";

const apiUrl =
  "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
let lang = "fi";
let videoDiv = document.getElementsByClassName("video-parallax")[0];
let parallaxImageDiv = document.getElementsByClassName("parallax")[0];
let parallax2 = document.getElementsByClassName("parallax-2")[0];
let parallaxGif = document.getElementsByClassName("gif-parallax")[0];
let mapContainer = document.getElementById("map");
console.log("--map--", mapContainer);
mapContainer.style.display = "none";
videoDiv.style.display = "none";
parallax2.style.background = "url(../assets/images/gif1.gif)";
parallax2.style.backgroundSize = "cover";
parallaxGif.style.backgroundColor = "rgba(0, 0, 0, 0)";

let navLinks = document.getElementsByClassName("nav-link");
let selectedMenu = "fazer";
let menu = document.getElementsByClassName("menu")[0];

let fazerMenuDataAll;
let fazerMenuDataAllEn;
let sodexoMenuDataAll;
let stopsAll;

let columnsData = document.getElementsByClassName("columns-work")[0];

const getfazerMenu = async () => {
  let date = new Date();
  let todayDate = `${date.getFullYear()}-0${
    date.getMonth() + 1
  }-${date.getDate()}`;
  let responseFi;
  let responseEn;
  let urlFi = `https://raw.githubusercontent.com/mattpe/wtmp/master/assets/fazer-week-example.json`;
  let urlEn =
    "https://raw.githubusercontent.com/mattpe/wtmp/master/assets/fazer-week-example-en.json";

  console.log("lang ->", lang, urlFi, urlEn);
  try {
    responseFi = await fetch(urlFi);
    responseEn = await fetch(urlEn);
    if (!responseFi.ok) {
      throw new Error(`HTTP ${responseFi.status} ${responseFi.statusText}`);
    }
  } catch (error) {
    console.error("getGithubReposOfUser error", error, error.response);
  }

  let data = await responseFi.json();
  let dataEn = await responseEn.json();
  console.log("data- fazer-->", data);
  return [data, dataEn];
};

getfazerMenu().then((res) => {
  console.log("--res---", res);
  if (res) {
    let today = new Date().getDay();
    let fazerData = res[0].LunchMenus[today];
    console.log("---data fazer---", fazerData);
    fazerMenuDataAll = fazerData;
    fazerMenuDataAllEn = res[1].LunchMenus[today];
    if (selectedMenu === "fazer") {
      menu.textContent = "Fazer Lunch Menu";
      navLinks[0].className = "nav-link active";
      let fazerMenuBox = ``;
      let container = document.getElementsByClassName("container")[0];
      for (let i = 0; i < fazerData.SetMenus.length; i++) {
        for (let j = 0; j < fazerData.SetMenus[i].Meals.length; j++) {
          fazerMenuBox += `<div class="col">
      <div class="card">
  <div class="card-header">
    <h5 class='card-title'>${fazerData.SetMenus[i].Meals[j].Name}</h5>
  </div>
  <div class="card-body">
  <p class="card-subtitle mb-2 text-muted">RecipeId : ${
    fazerData.SetMenus[i].Meals[j].RecipeId
  }</p>
   <p class="card-text">Diet : ${fazerData.SetMenus[i].Meals[j].Diets.join(
     ", "
   )}</p>
  </div>
</div>
    </div>`;
        }
        let row = document.createElement("div");
        row.className = "row";
        row.innerHTML = fazerMenuBox;
        container.appendChild(row);
        fazerMenuBox = "";
      }
    }
  }
});

const getSodexoMenu = async () => {
  let date = new Date();
  let todayDate = `${date.getFullYear()}-0${
    date.getMonth() + 1
  }-${date.getDate()}`;
  console.log(todayDate);
  let response;
  try {
    response = await fetch(
      `https://raw.githubusercontent.com/mattpe/wtmp/master/assets/sodexo-week-example.json`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("getGithubReposOfUser error", error.message);
  }
  let data = await response.json();
  console.log("data sodexo->", data);
  return data;
};
getSodexoMenu("en").then((res) => {
  console.log("--res--sodexo----", res);
  let sodexoData;
  if (res) {
    let today = new Date().getDay();
    if (today > 5) {
      let random = Math.floor(Math.random() * 5);
      sodexoData = res.mealdates[random];
      console.log("---data---", sodexoData);
    } else {
      sodexoData = res.mealdates[today];
      console.log("---data---", sodexoData);
    }
    sodexoMenuDataAll = sodexoData;
    if (selectedMenu === "sodexo") {
      menu.textContent = "Sodexo Lunch Menu";
      let container = document.getElementsByClassName("container")[0];
      let sodexoMenuBox = "";
      for (let key of Object.keys(sodexoData.courses)) {
        if (key !== 1 && key % 3 == 1) {
          let row = document.createElement("div");
          row.className = "row";
          row.innerHTML = sodexoMenuBox;
          container.appendChild(row);
          sodexoMenuBox = "";
        }
        sodexoMenuBox += `<div class="col">
      <div class="card">
  <div class="card-header">
    <h5 class='card-title'>${sodexoData.courses[key].title_en}</h5>
  </div>
  <div class="card-body">
  <p>Properites : ${sodexoData.courses[key].properties}</p>
      <h6 class="card-subtitle mb-2 text-muted">Category : ${sodexoData.courses[key].category}</h6>
   <p class="card-text">Price : ${sodexoData.courses[key].price}</p>
  </div>
</div>
    </div>`;
      }
    }
  }
});

const getStopsData = async () => {
  const queryDataByName = `
    {
  stops {
    gtfsId
    name
    lat
    lon
    zoneId
  }
}
`;

  const responseGraphQl = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/graphql",
    },
    body: queryDataByName,
  })
    .then((res) => res.json())
    .then((res) => {
      let data = res.data.stops.slice(0, 100);
      let uniqueStopsName = new Set();
      data.forEach((d) => {
        uniqueStopsName.add(d.name);
      });
      console.log(uniqueStopsName);
      stopsAll = [...uniqueStopsName];
    })
    .catch((err) => console.log(err, err.response));
};

getStopsData();

function changeMenu(me, navLink) {
  if (me !== "lang") {
    selectedMenu = me;
  }
  if (me === "lang") {
    console.log("language", lang, selectedMenu, me);
    lang = lang === "fi" ? "en" : "fi";
    navLinks[4].textContent = lang === "fi" ? "En" : "Fi";
  }
  mapContainer.style.display = "none";
  if (selectedMenu === "fazer") {
    videoDiv.style.display = "none";
    parallaxImageDiv.style.display = "block";
    menu.textContent = "Fazer Lunch Menu";
    columnsData.style.display = "block";
    navLinks[navLink].className = "nav-link active";
    navLinks[1].className = "nav-link";
    navLinks[2].className = "nav-link";
    navLinks[3].className = "nav-link";
    parallax2.style.background = "url(../assets/images/gif1.gif)";
    parallax2.style.backgroundSize = "cover";
    parallaxGif.style.backgroundColor = "rgba(0, 0, 0, 0)";
    uploadFazerData();
  } else if (selectedMenu === "sodexo") {
    videoDiv.style.display = "none";
    parallaxImageDiv.style.display = "block";
    menu.textContent = "Sodexo Lunch Menu";
    columnsData.style.display = "block";
    navLinks[navLink].className = "nav-link active";
    navLinks[0].className = "nav-link";
    navLinks[2].className = "nav-link";
    navLinks[3].className = "nav-link";
    parallax2.style.background = "url(../assets/images/gif2.gif)";
    parallax2.style.backgroundSize = "cover";
    parallaxGif.style.backgroundColor = "rgba(0, 0, 0, 0)";
    uploadSodexoData();
  } else if (selectedMenu === "stops") {
    videoDiv.style.display = "block";
    parallaxImageDiv.style.display = "none";
    columnsData.style.display = "none";
    menu.textContent = "Search Stops";
    navLinks[navLink].className = "nav-link active";
    navLinks[1].className = "nav-link";
    navLinks[0].className = "nav-link";
    navLinks[3].className = "nav-link";
    parallax2.style.background =
      "url(../assets/images/maps-directions_buildings.jpg)";
    parallax2.style.backgroundSize = "cover";
    parallaxGif.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    parallax2.style.backgroundAttachment = "fixed";
    uploadStopsData();
  } else if (selectedMenu === "map") {
    columnsData.style.display = "none";
    parallaxImageDiv.style.display = "none";
    videoDiv.style.display = "block";
    menu.textContent = "View Map";
    navLinks[navLink].className = "nav-link active";
    navLinks[1].className = "nav-link";
    navLinks[0].className = "nav-link";
    navLinks[2].className = "nav-link";
    parallax2.style.background =
      "url(../assets/images/maps-directions_buildings.jpg)";
    parallax2.style.backgroundSize = "cover";
    parallaxGif.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    parallax2.style.backgroundAttachment = "fixed";
    mapContainer.style.display = "block";
    uploadMapView();
  }
}

navLinks[0].addEventListener("click", () => changeMenu("fazer", 0));
navLinks[1].addEventListener("click", () => changeMenu("sodexo", 1));
navLinks[2].addEventListener("click", () => changeMenu("stops", 2));
navLinks[3].addEventListener("click", () => changeMenu("map", 3));
navLinks[4].addEventListener("click", () => changeMenu("lang", 4));
navLinks[4].textContent = lang === "fi" ? "En" : "Fi";

function uploadSodexoData() {
  let container = document.getElementsByClassName("container")[0];
  container.innerHTML = "";
  let sodexoMenuBox = "";
  console.log("language sodexo-->", lang);
  for (let key of Object.keys(sodexoMenuDataAll.courses)) {
    if (key !== 1 && key % 3 == 1) {
      let row = document.createElement("div");
      row.className = "row";
      row.innerHTML = sodexoMenuBox;
      container.appendChild(row);
      sodexoMenuBox = "";
    }
    let title =
      lang === "fi"
        ? sodexoMenuDataAll.courses[key].title_fi
        : sodexoMenuDataAll.courses[key].title_en;
    sodexoMenuBox += `<div class="col">
      <div class="card">
  <div class="card-header">
    <h5 class='card-title'>${title}</h5>
  </div>
  <div class="card-body">
  <p>Properites : ${sodexoMenuDataAll.courses[key].properties}</p>
      <h6 class="card-subtitle mb-2 text-muted">Category : ${sodexoMenuDataAll.courses[key].category}</h6>
   <p class="card-text">Price : ${sodexoMenuDataAll.courses[key].price}</p>
  </div>
</div>
    </div>`;
  }
}

function uploadFazerData() {
  let fazerMenuBox = ``;
  console.log("fazer menu", fazerMenuDataAll, fazerMenuDataAllEn, lang);
  let fazerDataToUse = lang === "fi" ? fazerMenuDataAll : fazerMenuDataAllEn;
  let container = document.getElementsByClassName("container")[0];
  container.innerHTML = "";
  for (let i = 0; i < fazerDataToUse.SetMenus.length; i++) {
    for (let j = 0; j < fazerDataToUse.SetMenus[i].Meals.length; j++) {
      fazerMenuBox += `<div class="col">
      <div class="card">
  <div class="card-header">
    <h5 class='card-title'>${fazerDataToUse.SetMenus[i].Meals[j].Name}</h5>
  </div>
  <div class="card-body">
  <p class="card-subtitle mb-2 text-muted">RecipeId : ${
    fazerDataToUse.SetMenus[i].Meals[j].RecipeId
  }</p>
   <p class="card-text">Diet : ${fazerDataToUse.SetMenus[i].Meals[j].Diets.join(
     ", "
   )}</p>
  </div>
</div>
    </div>`;
    }
    let row = document.createElement("div");
    row.className = "row";
    row.innerHTML = fazerMenuBox;
    container.appendChild(row);
    fazerMenuBox = "";
  }
}

function uploadStopsData() {
  let container = document.getElementsByClassName("container")[0];
  container.innerHTML = "";
  if (stopsAll) {
    let allOptions = stopsAll.map(
      (stop) => `<option value=${stop}>${stop}</option>`
    );
    let selectBox = `
    <select class="form-select form-select-sm" aria-label=".form-select-sm example">
    {
    ${allOptions}
    }
  </select>`;

    container.innerHTML = selectBox;
    let select = document.getElementsByClassName("form-select")[0];
    select.addEventListener("change", async () => {
      const queryDataByName = `{
    stops(name: "${select.value}") {
      name
      locationType
      lat
      lon
      patterns {
        id
        name
        route {
          gtfsId
          shortName
          longName
        }
        directionId
      }
    }
  }
}`;

      const responseGraphQl = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
        },
        body: queryDataByName,
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("respnse --> ", res);
          let foundStops = res.data.stops;
          let findStops = foundStops.map(
            (
              stop
            ) => `<li href="#" class="list-group-item list-group-item-action">
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">${stop.name}</h5>
      <small class="text-muted">${stop.locationType}</small>
    </div>
    <small class="text-muted">Lat : ${stop.lat}&deg;  Long : ${stop.lon}&deg;</small>
  </li>`
          );
          container.innerHTML += `
        <ul class="list-group">
          ${findStops.join("")}</ul>`;
        })
        .catch((err) => console.log(err, err.response));
    });
  }
}

function uploadMapView() {
  let container = document.getElementsByClassName("container")[0];
  container.innerHTML = `<div id="map1" style="height:600px; width:100%;"></div>`;
  let map = L.map("map1").setView([60.192059, 24.945831], 13);

  var normalTiles = L.tileLayer(
    "https://cdn.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png",
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      maxZoom: 19,
      tileSize: 512,
      zoomOffset: -1,
      id: "hsl-map",
    }
  ).addTo(map);
}

////////////////////////////service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
