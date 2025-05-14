document.addEventListener("DOMContentLoaded", () => {
    const yearElem = document.getElementById("year");
    if (yearElem) yearElem.textContent = new Date().getFullYear();
    const lastModifiedElem = document.getElementById("last-modified");
    if (lastModifiedElem) lastModifiedElem.textContent = `Last modified: ${document.lastModified}`;

    const hamburger = document.querySelector(".hamburger-menu");
    const nav = document.querySelector("#animateme");

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            nav.classList.toggle("active");
            hamburger.classList.toggle("active");
        });
    }

    document.addEventListener("click", (event) => {
        if (hamburger && nav && !hamburger.contains(event.target) && !nav.contains(event.target)) {
            nav.classList.remove("active");
            hamburger.classList.remove("active");
        }
    });

    const mainContainer = document.getElementById("membersContainer");
    if (mainContainer) {
        const header = document.createElement("h2");
        header.textContent = "Chamber Members";
        mainContainer.appendChild(header);

        const toggleBtn = document.createElement("button");
        toggleBtn.classList.add("toggle-btn");
        toggleBtn.textContent = "Switch to List View";
        mainContainer.appendChild(toggleBtn);

        const cardsContainer = document.createElement("div");
        cardsContainer.id = "cardsContainer";
        mainContainer.appendChild(cardsContainer);

        async function fetchMembers() {
            try {
                const response = await fetch("data/members.json");
                if (!response.ok) throw new Error("Network response was not ok");
                const members = await response.json();
                displayMembers(members);
            } catch (error) {
                console.error("Error fetching members data:", error);
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

        toggleBtn.addEventListener("click", () => {
            cardsContainer.classList.toggle("list-view");
            toggleBtn.textContent = cardsContainer.classList.contains("list-view")
                ? "Switch to Grid View"
                : "Switch to List View";
        });

        fetchMembers();
    }
});


