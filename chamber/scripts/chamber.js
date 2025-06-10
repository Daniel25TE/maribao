document.addEventListener("DOMContentLoaded", () => {
    setupMenuToggle();
    init();
    updateFooter();
});
const visitsDisplay = document.querySelector(".visits");
if (visitsDisplay) {
    let numVisits = Number(window.localStorage.getItem("numVisits-ls")) || 0;
    let lastVisit = window.localStorage.getItem("lastVisit-ls");
    const currentDate = new Date();
    if (!lastVisit) {
        visitsDisplay.textContent = `Welcome! Let us know if you have any questions.`;
    } else {
        const lastVisitDate = new Date(lastVisit);
        const timeDifferenceInMs = currentDate - lastVisitDate;
        const daysBetweenVisits = Math.floor(timeDifferenceInMs / (1000 * 3600 * 24));

        if (daysBetweenVisits < 1) {
            visitsDisplay.textContent = `Back so soon! Awesome!`;
        } else {
            const dayText = daysBetweenVisits === 1 ? "day" : "days";
            visitsDisplay.textContent = `You last visited ${daysBetweenVisits} ${dayText} ago.`;
        }
    }
    numVisits++;
    localStorage.setItem("numVisits-ls", numVisits);

    window.localStorage.setItem("lastVisit-ls", currentDate.toISOString());
    setTimeout(() => {
        visitsDisplay.classList.add('hide');
    }, 5000);
} else {
    console.log("No '.visits' element found, skipping visit count logic.");
}

function setupMenuToggle() {
    const menuToggle = document.querySelector("#menu-toggle");
    const nav = document.querySelector("nav");

    menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        menuToggle.textContent = nav.classList.contains("active") ? "✖" : "☰";
    });
}

document.querySelectorAll("#navigation a").forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add("active");
    }
});

async function init() {
    try {
        const members = await fetchMembers();
        const directory = document.querySelector("#directory");
        if (directory) {
            const toggleButtons = createToggleButtons();
            directory.appendChild(toggleButtons);

            const displayContainer = document.createElement("article");
            displayContainer.style.minHeight = "400px";
            displayContainer.classList.add("grid");
            directory.appendChild(displayContainer);

            setupToggleView(displayContainer);
            displayMembers(members, displayContainer);
        }

        const homeMembers = document.getElementById("homemembers");
        if (homeMembers) {
            displaySpotlights(members);
        }
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

async function fetchMembers() {
    try {
        const cached = sessionStorage.getItem("membersData");
        if (cached) return JSON.parse(cached);

        const response = await fetch("data/members.json");
        if (!response.ok) throw new Error("Network response error");

        const membersData = await response.json();
        sessionStorage.setItem("membersData", JSON.stringify(membersData));

        return membersData;
    } catch (error) {
        console.error("Error fetching members:", error);
        return [];
    }
}

function createToggleButtons() {
    const btnContainer = document.createElement("div");
    btnContainer.className = "menu";

    const gridButton = document.createElement("button");
    gridButton.id = "grid";
    gridButton.textContent = "Grid View";

    const listButton = document.createElement("button");
    listButton.id = "list";
    listButton.textContent = "List View";

    btnContainer.appendChild(gridButton);
    btnContainer.appendChild(listButton);

    return btnContainer;
}

function createMemberCard(member) {
    const sectionEl = document.createElement("section");

    const img = document.createElement("img");
    img.src = `images/${member.image}`;
    img.alt = member.name;
    img.width = 16;
    img.height = 16;

    const h2 = document.createElement("h2");
    h2.textContent = member.name;

    const address = document.createElement("p");
    address.textContent = member.address;

    const phone = document.createElement("p");
    phone.textContent = member.phone;

    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = "Visit Site";

    const email = document.createElement("p");
    email.textContent = member.email;

    const description = document.createElement("p");
    description.textContent = member.description;

    sectionEl.append(img, h2, address, phone, websiteLink, email, description);

    return sectionEl;
}
function createSpotlightCard(member) {
    const sectionEl = document.createElement("section");
    sectionEl.classList.add("spotlight-card");

    const h3 = document.createElement("h3");
    h3.textContent = member.name;

    const hr = document.createElement("hr");

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("spotlight-content");

    const leftCol = document.createElement("div");
    leftCol.classList.add("spotlight-img");
    const img = document.createElement("img");
    img.src = `images/${member.image}`;
    img.alt = member.name;
    img.width = 100;
    img.height = 100;
    leftCol.appendChild(img);

    const rightCol = document.createElement("div");
    rightCol.classList.add("spotlight-info");

    const phone = document.createElement("p");
    phone.textContent = `Phone: ${member.phone}`;

    const address = document.createElement("p");
    address.textContent = `Address: ${member.address}`;

    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = "Visit Site";

    let membershipText = "";
    switch (member.membership) {
        case 3:
            membershipText = "Gold";
            break;
        case 2:
            membershipText = "Silver";
            break;
        case 1:
            membershipText = "Bronze";
            break;
        default:
            membershipText = member.membership;
    }
    const membershipEl = document.createElement("p");
    membershipEl.textContent = `Membership: ${membershipText}`;

    rightCol.append(phone, address, websiteLink, membershipEl);

    contentDiv.append(leftCol, rightCol);

    sectionEl.append(h3, hr, contentDiv);

    return sectionEl;
}

function displayMembers(members, container) {
    container.innerHTML = "";
    members.forEach(member => {
        const card = createMemberCard(member);
        container.appendChild(card);
    });
}

function displaySpotlights(members) {
    const spotlights = members.filter(member => member.membership >= 2);

    const randomSpotlights = spotlights.sort(() => Math.random() - 0.5).slice(0, 3);

    const spotlightsContainer = document.getElementById("homemembers");
    if (!spotlightsContainer) return;

    spotlightsContainer.innerHTML = "";

    randomSpotlights.forEach(member => {
        const card = createSpotlightCard(member);
        spotlightsContainer.appendChild(card);
    });
}

function setupToggleView(displayContainer) {
    const gridButton = document.querySelector("#grid");
    const listButton = document.querySelector("#list");

    gridButton.addEventListener("click", () => {
        displayContainer.classList.add("grid");
        displayContainer.classList.remove("list");
    });

    listButton.addEventListener("click", () => {
        displayContainer.classList.add("list");
        displayContainer.classList.remove("grid");
    });
}

function updateFooter() {
    const launchYearEl = document.getElementById("launchYear");
    const lastModifiedEl = document.getElementById("lastModified");

    if (launchYearEl && lastModifiedEl) {
        launchYearEl.textContent = new Date().getFullYear();
        lastModifiedEl.textContent = document.lastModified;
    }
}

const currentTemp = document.querySelector('#current-weather');
const weatherIcon = document.querySelector('#weather-icon');
const captionDesc = document.querySelector('.iconcurrent');
const additionalInfo = document.querySelector('#weather-details');
const forecastContainer = document.querySelector('#forecast');

const url = 'https://api.openweathermap.org/data/2.5/forecast?lat=49.75&lon=6.64&units=imperial&appid=56d058cb82bb25bb1fbf5aa56dd47fa9';

async function apiFetch() {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();

            displayResults(data);
            displayForecast(data);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log(error);
    }
}

function displayResults(data) {
    const currentData = data.list[0];
    const temp = currentData.main.temp.toFixed(1);
    const desc = currentData.weather[0].description;
    const iconSrc = `https://openweathermap.org/img/w/${currentData.weather[0].icon}.png`;
    const humidity = currentData.main.humidity;
    const highTemp = currentData.main.temp_max.toFixed(1);
    const lowTemp = currentData.main.temp_min.toFixed(1);
    const sunrise = new Date(data.city.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.city.sunset * 1000).toLocaleTimeString();

    currentTemp.innerHTML = `Current: ${temp}&deg;F`;
    weatherIcon.setAttribute('src', iconSrc);
    weatherIcon.setAttribute('alt', desc);
    captionDesc.textContent = `Short Description: ${desc}`;

    additionalInfo.innerHTML = `
        <p>High: ${highTemp}&deg;F</p>
        <p>Low: ${lowTemp}&deg;F</p>
        <p>Humidity: ${humidity}%</p>
        <p>Sunrise: ${sunrise}</p>
        <p>Sunset: ${sunset}</p>
    `;
}

function displayForecast(data) {
    forecastContainer.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];

    let forecastList = data.list.filter(entry => entry.dt_txt.includes("12:00:00"));

    let uniqueDates = new Set();
    let finalForecasts = forecastList.filter(entry => {
        const dateStr = entry.dt_txt.split(" ")[0];
        return uniqueDates.size < 3 && uniqueDates.add(dateStr);
    });

    forecastContainer.innerHTML = finalForecasts.map(entry => {
        const date = new Date(entry.dt_txt);
        return `
            <div class="forecast-item">
                <p><strong>${date.toLocaleDateString('en-US', { weekday: 'long' })}: ${entry.main.temp.toFixed(1)}&deg;F</strong></p>
                <img src="https://openweathermap.org/img/w/${entry.weather[0].icon}.png" alt="Weather icon" style="width: 50px; height: 50px;">

            </div>
        `;
    }).join("");
}



if (document.querySelector('#current-weather')) {
    apiFetch();
}

document.addEventListener("DOMContentLoaded", () => {
    const myInfo = new URLSearchParams(window.location.search);

    const resultsContainer = document.querySelector("#results");
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <h2>We have recieved your application with the following information:</h2>
            <p>Application for <strong>${myInfo.get('first_name')} ${myInfo.get('last_name')}</strong> on behalf of <strong>${myInfo.get('organization_name')}</strong>
            on ${myInfo.get('timestamp')}</p>
            <p>We'll contact you via email at <strong>${myInfo.get('email')}</strong> or by phone at <strong>${myInfo.get('phone')}</strong></p>

            
            
        `;
    }
});
const nonprofit = document.querySelector("#Non-Profit");
const nonclose = document.querySelector("#non-close");

if (nonprofit && nonclose) {
    nonclose.addEventListener("click", () => nonprofit.close());
    document.getElementById("learn-more-non")?.addEventListener("click", () => {
        nonprofit.showModal();
    });
}

const bronze = document.querySelector("#Bronze");
const brclose = document.querySelector("#bronze-close");

if (bronze && brclose) {
    brclose.addEventListener("click", () => bronze.close());
    document.getElementById("learn-more-bronze")?.addEventListener("click", () => {
        bronze.showModal();
    });
}

const silver = document.querySelector("#Silver");
const siclose = document.querySelector("#silver-close");

if (silver && siclose) {
    siclose.addEventListener("click", () => silver.close());
    document.getElementById("learn-more-silver")?.addEventListener("click", () => {
        silver.showModal();
    });
}

const gold = document.querySelector("#Gold");
const goclose = document.querySelector("#gold-close");

if (gold && goclose) {
    goclose.addEventListener("click", () => gold.close());
    document.getElementById("learn-more-gold")?.addEventListener("click", () => {
        gold.showModal();
    });
}
if (document.getElementById("timestamp")) {
    let now = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");
    document.getElementById("timestamp").value = now;
}





