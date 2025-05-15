document.addEventListener("DOMContentLoaded", () => {
    updateDates();
    setupMenu();
    setupMembers();
});


function updateDates() {
    const yearElem = document.getElementById("year");
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }
    const lastModifiedElem = document.getElementById("last-modified");
    if (lastModifiedElem) {
        lastModifiedElem.textContent = `Last modified: ${document.lastModified}`;
    }
}


function setupMenu() {
    const hamburger = document.querySelector(".hamburger-menu");
    const nav = document.getElementById("animateme");

    if (hamburger && nav) {
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-controls", "animateme");

        hamburger.addEventListener("click", () => {
            const isActive = nav.classList.toggle("active");
            hamburger.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive.toString());
        });
    }


    document.addEventListener("click", (event) => {
        if (
            hamburger &&
            nav &&
            !hamburger.contains(event.target) &&
            !nav.contains(event.target)
        ) {
            if (nav.classList.contains("active")) {
                nav.classList.remove("active");
            }
            if (hamburger.classList.contains("active")) {
                hamburger.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
            }
        }
    });
}


function setupMembers() {
    const mainContainer = document.getElementById("membersContainer");
    if (!mainContainer) return;


    const membersHeader = document.createElement("h2");
    membersHeader.textContent = "Chamber Members";
    mainContainer.appendChild(membersHeader);


    const cardsContainer = document.createElement("article");
    cardsContainer.id = "cardsContainer";
    mainContainer.appendChild(cardsContainer);


    const gridButton = document.querySelector("#grid");
    const listButton = document.querySelector("#list");

    if (gridButton && listButton) {
        gridButton.addEventListener("click", () => {
            cardsContainer.classList.add("grid");
            cardsContainer.classList.remove("list");
        });
        listButton.addEventListener("click", showList);

        function showList() {
            cardsContainer.classList.add("list");
            cardsContainer.classList.remove("grid");
        }
    }

    async function fetchMembers() {
        try {
            const response = await fetch("data/members.json");
            if (!response.ok) throw new Error("Network response was not ok");
            const members = await response.json();
            displayMembers(members);
        } catch (error) {
            console.error("Error fetching members data:", error);
            const errorMsg = document.createElement("p");
            errorMsg.textContent = "Error loading members data. Please try again later.";
            cardsContainer.appendChild(errorMsg);
        }
    }


    function displayMembers(members) {
        cardsContainer.innerHTML = "";
        members.forEach((member) => {
            const card = document.createElement("div");
            card.classList.add("member-card");
            card.innerHTML = `
                <h2>${member.name}</h2>
                <p><strong>Address:</strong> ${member.address}</p>
                <p><strong>Phone:</strong> ${member.phone}</p>
                <p><strong>Website:</strong> <a href="${member.website}" target="_blank">${member.website}</a></p>
                <p><strong>Membership:</strong> ${getMembershipName(member.membership)}</p>
                <p><img src="images/${member.image}" alt="${member.name} logo" width="16" height="16"></p>
                ${member.description ? `<p>${member.description}</p>` : ""}
            `;
            cardsContainer.appendChild(card);
        });
    }


    function getMembershipName(level) {
        switch (level) {
            case 1:
                return "Member";
            case 2:
                return "Silver";
            case 3:
                return "Gold";
            default:
                return "Unknown";
        }
    }

    fetchMembers();
}




