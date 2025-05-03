// Get card id
const params = new URLSearchParams(window.location.search);
const id = params.get("id");


// Backend URL
const endpoint = 'http://localhost:4000';


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


// // Fetch card data
let cardsData = [];

async function fetchCard() {
	try {
		const token = localStorage.getItem("jwt");
		const response = await fetch(`${endpoint}/flashcards`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ card_id: id }), 
		});
		const data = await response.json();

        if (!data.card_info || !data.cards) {
            document.getElementById('card-info-err').style.display = 'block';
            document.getElementById('main').style.display = 'none';
            return;
        } else {
            document.getElementById("fc-title").value = data.card_info.title;
        }

        if (data.cards.length > 0) {
            cardsData = data.cards;
        }

        setHtml();
	} catch (error) {
		console.error(`Internal server error.`, error);
	}
}
fetchCard();


// // Form button
const formHtml = document.getElementById("add-card-form");

document.getElementById("add-btn").addEventListener("click", () => {
    const state = formHtml.style.display;
    if (state === "none" || !state) {
        formHtml.style.display = "flex";
    } else {
        formHtml.style.display = "none";
    }
});


// Add new cards
document.getElementById("add-card-btn").addEventListener("click", async () => {
    const enWord = document.getElementById("new-en").value.trim();
    const jaWord = document.getElementById("new-ja").value.trim();
    if (!enWord || !jaWord) {
        document.getElementById('add-card-err').style.display = 'block';
        return;
    } else {
        document.getElementById("add-card-err").style.display = "none";
    }

    const wordsList = [{ en: enWord, ja: jaWord }];

    try {
        const token = localStorage.getItem("jwt");
        await fetch(`${endpoint}/flashcards/add`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ wordsList: wordsList, card_id: id }), 
        });
        formHtml.style.display = "none";
        fetchCard();
    } catch (error) {
        console.error(`Internal server error.`, error);
    }
});


// Set html
function setHtml() {
    document.getElementById("cards").innerHTML = cardsData
        .map((card) => {
            const id = card.id;
            const enWord = card.en;
            const jaWord = card.ja;

            return `
                    <li class="words" id="w-id-${id}">
                        <div class="dic">
                            <div>
                                <p>EN</p>
                                <p class="en-meaning">${enWord}</p>
                            </div>
            
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-left-right arrow-btn" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5"/>
                            </svg>
            
                            <div>
                                <p>JA</p>
                                <p class="ja-meaning">${jaWord}</p>
                            </div>
                        </div>

                        <svg onclick="deleteWord(${id})" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x cancel-btn" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </li>       
                    `;
            })
        .join("");  
}


// Delete words
function deleteWord(id) {
    cardsData = cardsData.filter(card => card.id !== id);
    setHtml();
}


// Submit cange
document.getElementById("submit-change-btn").addEventListener("click", async () => {
    const title = document.getElementById("fc-title").value;

    try {
        const token = localStorage.getItem("jwt");
        await fetch(`${endpoint}/flashcards/update`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ title: title, wordsList: cardsData, card_id: id }), 
        });
        formHtml.style.display = "none";
        window.location.href = `flashcard.html?${params.toString()}`;
    } catch (error) {
        console.error(`Internal server error.`, error);
    }
});


// Cancel edit
document.getElementById("cancel-edit-btn").addEventListener("click", async () => {
    window.location.href = `flashcard.html?${params.toString()}`;
});