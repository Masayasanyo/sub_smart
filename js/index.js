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
			window.location.href = "pages/login.html";
		}
	} catch (error) {
		console.error(`Internal server error.`, error);
		window.location.href = "pages/login.html";
	}
}
checkSession();


// Get youtube by using the url
let url = "";
document.getElementById("submit-url").addEventListener("click", (e) => {
	e.preventDefault();
	url = document.getElementById("url").value;
	document.querySelector(".video").src = url;

	fetchTranscript();
});

// Fetch subtitle
let transcriptList = [];
let transcript = "";
let enWord = '';
let jaWord = '';

async function fetchTranscript() {
    const videoId = url.split("/embed/")[1].split("?")[0];
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
        let id = 0;
        for (let i = 0; i < transcriptList.length; i++) {
            const row = transcriptList[i].text.replaceAll("\n", "");
            const wordList = row.split(/\s+/);
            for (let j = 0; j < wordList.length; j++) {
                transcript += `<span class="${id} word">${wordList[j]} </span>`;
                id++;
            }
        }

        document.querySelector(".transcript").innerHTML = transcript;

        document.querySelectorAll(".word").forEach(word => {
            word.addEventListener("click", async () => {
                await translateText(word.textContent);
            })
        });
    } catch (error) {
        console.error(`Server error`, error);
    }
}


// translate words
async function translateText(text) {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
		enWord = text;
		jaWord = data.responseData.translatedText;
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