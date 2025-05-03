import { endpoint } from "./config.js";


// Footer
const currentYear = new Date().getFullYear();
document.querySelector("#year").innerHTML = currentYear;


// Open and close the sidebar
document.getElementById("nav-cancel").addEventListener("click", () => {
    document.getElementById("sidebar").style.display = "none";
});
document.getElementById("open-nav").addEventListener("click", () => {
    document.getElementById("sidebar").style.display = "block";
});
document.getElementById("sidebar").style.display = "none";


// Check if this user has already logged in.
async function checkSession() {
	try {
		const token = localStorage.getItem("jwt");
		const response = await fetch(`${endpoint}/accounts/session`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
		});
		const data = await response.json();
		if (data.isLoggedIn === false) {
			window.location.href = "login.html";
		}
	} catch (error) {
		console.error(`Internal server error.`, error);
		window.location.href = "login.html";
	}
}
checkSession();


// Fetch cards
let cardsList = [];
async function fetchCards() {
	try {
		const token = localStorage.getItem("jwt");
		const response = await fetch(`${endpoint}/flashcards`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
		});
		const data = await response.json();
        cardsList = data.data;
        setHtml();
	} catch (error) {
		console.error(`Internal server error.`, error);
	}
}
fetchCards();


// Display form button
document.getElementById("add-btn").addEventListener("click", () => {
    const state = document.getElementById("create-card-form").style.display;
    if (state === "none" || !state) {
        document.getElementById("create-card-form").style.display = "flex";
    } else {
        document.getElementById("create-card-form").style.display = "none";
    }
});


// Create new cards
document.getElementById("create-card-btn").addEventListener("click", async () => {
    const title = document.getElementById("title").value;

    try {
        const token = localStorage.getItem("jwt");
        await fetch(`${endpoint}/flashcards/create`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ title: title }), 
        });
        document.getElementById("create-card-form").style.display = "none";
        fetchCards()
    } catch (error) {
        console.error(`Internal server error.`, error);
    }
});


// Set list of flashcards on html
function setHtml() {
    document.getElementById("fc-list").innerHTML = cardsList
        .map((card) => {
            return `
                    <li class="fc" id="c-id-${card.id}">
                        <p>${card.title}</p>
                    </li>
                    `;
            })
        .join("");  

    document.querySelectorAll(".fc").forEach(d => {
        const id = Number(d.id.split("-")[2]);
        d.addEventListener("click", () => {
            const params = new URLSearchParams({ id });
            window.location.href = `flashcard.html?${params.toString()}`;
        })
    })
}