import { endpoint } from "./config.js";


// Get words list data
const params = new URLSearchParams(window.location.search);
const wordsList = JSON.parse(params.get("words"));


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
        if (data.data.length < 1) {
            createCard();
        } else {
            cardsList = data.data;
            setSelect();
        }
	} catch (error) {
		console.error(`Internal server error.`, error);
	}
}
fetchCards();


// Create a card if user does not have any cards.
async function createCard() {
	try {
		const token = localStorage.getItem("jwt");
		await fetch(`${endpoint}/flashcards/create`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ title: "New Card" }), 
		});
        fetchCards
	} catch (error) {
		console.error(`Internal server error.`, error);
	}
}


// Set select and option
function setSelect() {
    document.getElementById("card").innerHTML = cardsList
        .map((card) => {
            return `
                    <option value="${card.id}">${card.title}</option>
                    `;
            })
        .join("");  
}


// Set words list to html
function setWords() {
    document.getElementById("words-list").innerHTML = wordsList
        .map((words, index) => {
            const id = index;
            const enWord = words.en;
            const jaWord = words.ja;

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

                        <svg onclick="cancelWords(${id})" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x cancel-btn" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </li>       
                    `;
            })
        .join("");  
}
setWords();


// Cancel words
function cancelWords(id) {
    const targetId = `w-id-${id}`;
    let currrentHtml = document.querySelectorAll(".words");
    currrentHtml.forEach(html => {
        if (html.id === targetId) {
            html.remove();
        }
    });
    wordsList.splice(id, 1);
    setHtml();
}


// Submit words
document.getElementById("submit-words").addEventListener("click", async () => {
    const card_id = document.getElementById("card").value;

    try {
        const token = localStorage.getItem('jwt');
        await fetch(`${endpoint}/flashcards/add`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }, 
            body: JSON.stringify({ wordsList: wordsList, card_id: card_id }), 
        });
        location.href = 'flashcards.html';
    } catch (error) {
        console.error(`Internal server error.`, error);
    }
});