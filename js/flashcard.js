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


// Fetch card
let cardsData = [];
let cardsAgain = [];
let cardsOk = [];

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
            document.getElementById("fc-title").innerHTML = data.card_info.title;
        }

        if (data.cards.length > 0) {
            cardsData = data.cards.filter(card => card.progress === false);
            if (cardsData.length < 1) {
                cardsData= data.cards;
            }
            cardsAgain = [];
            cardsOk = [];
        }

        setCard();
	} catch (error) {
		console.error(`Internal server error.`, error);
	}
}
fetchCard();


// Set card
let cardHtml = document.getElementById("q-word");
let cardTotalHtml = document.getElementById("card-total");
let cardCurrentHtml = document.getElementById("card-current");

let current_card = {
    id: null, 
    index: 0, 
    en: "", 
    ja: "", 
};

function setCard() {
    if (cardsData.length > 0) {
        cardHtml.innerHTML = cardsData[0].ja;
        cardTotalHtml.innerHTML = cardsData.length;
        cardCurrentHtml.innerHTML = 1;

        current_card.id = cardsData[0].id;
        current_card.index = 0;
        current_card.en = cardsData[0].en;
        current_card.ja = cardsData[0].ja;
    } else {
        return;
    }
}

function changeCard() {
    if (cardsData[current_card.index + 1]) {
        cardHtml.innerHTML = cardsData[current_card.index + 1].ja;
        cardCurrentHtml.innerHTML = Number(cardCurrentHtml.innerHTML) + 1;

        current_card.index = current_card.index + 1;
        current_card.id = cardsData[current_card.index].id;
        current_card.en = cardsData[current_card.index].en;
        current_card.ja = cardsData[current_card.index].ja;
    } else {
        current_card = {
            id: null, 
            index: 0, 
            en: "", 
            ja: "", 
        };
        if (cardsAgain.length < 1) {
            document.getElementById('finish-card-msg').style.display = 'flex';
            document.getElementById('main').style.display = 'none';
        } else {
            document.getElementById('score-msg').style.display = 'flex';
            document.getElementById('score-msg-p').innerHTML = 
                `Your score is ${cardsOk.length}/${cardsData.length}.`;
            document.getElementById('main').style.display = 'none';
        }
    }
}


// Flip the cards
document.getElementById("card").addEventListener("click", () => {
    if (document.getElementById("q-word").innerHTML === current_card.en) {
        document.getElementById("q-word").innerHTML = current_card.ja;
    } else {
        document.getElementById("q-word").innerHTML = current_card.en;
    }
});


// Click ok
document.getElementById("ok-btn").addEventListener("click", () => {
    cardsOk.push({ id: current_card.id, en: current_card.en, ja: current_card.ja });
    cardsAgain = cardsAgain.filter(card => card.id !== current_card.id);

    changeCard();
});


// Click again
document.getElementById("again-btn").addEventListener("click", () => {
    cardsAgain.push({ id: current_card.id, en: current_card.en, ja: current_card.ja });
    cardsOk = cardsOk.filter(card => card.id !== current_card.id);

    changeCard();
});


// Shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// Click shuffle button
document.getElementById("shuffle-btn").addEventListener("click", () => {
    cardsData = shuffle(cardsData);
    setCard();
});


// Click ok and submit result
document.querySelectorAll(".result-ok-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        submitResult();
    });
});


// Submit result
async function submitResult() {
    try {
		const token = localStorage.getItem("jwt");
		await fetch(`${endpoint}/flashcards/result`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({ again: cardsAgain, ok: cardsOk }), 
		});
        window.location.href = `flashcard.html?${params.toString()}`;
	} catch (error) {
		console.error(`Internal server error.`, error);
	}
}


// To the edit page
document.getElementById("edit-btn").addEventListener("click", () => {
    window.location.href = `edit_flashcard.html?${params.toString()}`;
});