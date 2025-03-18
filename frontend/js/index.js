// footer
const currentYear = new Date().getFullYear();
document.querySelector("#year").innerHTML = currentYear;

// submit url
let url = "";
function submitUrl(event) {
    event.preventDefault();
    url = document.getElementById("url").value;
    document.querySelector(".video-container").innerHTML = 
        `<iframe 
            class="video"
            src=${url}  
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen 
        >
        </iframe>`

    fetchTranscript();
}

// translate function
const translateText = async (text) => {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.responseData.translatedText;
    } catch (error) {
        return text;
    }
};

// fetch subtitle
let transcriptList = [];
let transcript = "";

const fetchTranscript = async () => {
    const videoId = url.split("/embed/")[1].split("?")[0];
    try {
        const response = await fetch(`http://localhost:3001/transcript`, {
            method: "POST",
            headers: {
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
            word.addEventListener("click", async function() {
                this.classList.toggle('clicked');
                const translatedWord = await translateText(this.innerHTML);
                this.innerHTML += `(${translatedWord}) `;
            })
        });
    } catch (error) {
        console.error(`Server error`, error);
    }
}

async function submit() {
    let clickedWords = [];
    document.querySelectorAll(".clicked").forEach(word => {
        clickedWords.push(word.innerHTML);
    });

    try {
        const response = await fetch(`http://localhost:3001/flashcard`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({words: clickedWords}), 
        });
    } catch (error) {
        console.error(`Server error`, error);
    }
}

