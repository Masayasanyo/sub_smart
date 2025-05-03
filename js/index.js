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
			window.location.href = "pages/login.html";
		}
	} catch (error) {
		console.error(`Internal server error.`, error);
		window.location.href = "pages/login.html";
	}
}
checkSession();


// Get youtube by using the url
let srcUrl = "https://www.youtube.com/embed/";
let videoId = '';

document.getElementById("submit-url").addEventListener("click", (e) => {
	e.preventDefault();

    srcUrl = "https://www.youtube.com/embed/";
    videoId = '';

    videoId = document.getElementById("url").value.split("v=")[1];
    srcUrl = srcUrl + videoId;

	document.querySelector(".video").src = srcUrl;

	fetchTranscript();
});


// Fetch subtitle
let transcriptList = [];
let transcript = "";
let enWord = '';
let jaWord = '';

async function fetchTranscript() {
    try {
		const token = localStorage.getItem("jwt");
        const response = await fetch(`${endpoint}/transcript`, {
            method: "POST",
            headers: {
				"Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({videoId: videoId}), 
        });
        const data = await response.json();
        transcriptList = data.data;
        console.log(transcriptList)
        let id = 0;
        for (let i = 0; i < transcriptList.length; i++) {
            const row = transcriptList[i].text.replaceAll("\n", "");
            const wordList = row.split(/\s+/);
            for (let j = 0; j < wordList.length; j++) {
                transcript += `<span id="w-id-${id}" class="word">${wordList[j]} </span>`;
                id++;
            }
        }

        document.querySelector(".transcript").innerHTML = transcript;

        document.querySelectorAll(".word").forEach(word => {
            word.addEventListener("click", async () => {
                word.style.color = "#2973B2";
                await translateText(word.textContent);
            });
        });
    } catch (error) {
        console.error(`Server error`, error);
    }
}


// translate words
async function translateText(text) {
    try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${endpoint}/transcript/translate`, {
            method: "POST",
            headers: {
				"Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({word: text}), 
        });
        const data = await response.json();

		enWord = text;
		jaWord = data.data;
		await applyDictionary();
    } catch (error) {
        return text;
    }
};


// Apply dictionary
let wordsList = [];

async function applyDictionary() {
    document.getElementById("en-meaning").innerHTML = enWord;
	document.getElementById("ja-meaning").innerHTML = jaWord;

	wordsList.push({ en: enWord, ja: jaWord });
};


// Finish study
document.getElementById("finish-study").addEventListener("click", () => {
	const params = new URLSearchParams({ words: JSON.stringify(wordsList) });
	window.location.href = `pages/submit_words.html?${params.toString()}`;
});