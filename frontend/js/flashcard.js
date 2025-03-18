let cardsList = [];

const fetchCards = async () => {
    try {
        const response = await fetch(`http://localhost:3001/flashcard`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }, 
        });
        const data = await response.json();
        cardsList = data.data;

        if (cardsList.length > 0) {
            const newHtml = 
                `<div>1 / ${cardsList.length}</div>
                <div class="card">
                    <p id='0' onclick='flip(0)'>${cardsList[0].heads}</p>
                </div>
                <div class="btns">
                    <button class="btn" id="again" onclick='again(0)'>Again</button>
                    <button class="btn" id="ok" onclick='ok(0)'>OK</button>
                </div>
                `;
            document.querySelector(".flashcard-page").innerHTML = newHtml;
        }
    } catch (error) {
        console.error(`Server error`, error);
    }
}

function flip(id) {
    const newHtml = `<p id='${id}' onclick='flip(${id})'>${cardsList[Number(id)].tails}</p>`;
    document.querySelector(".card").innerHTML = newHtml;
}

function again(id) {
    if (Number(id) + 1 >= cardsList.length) {
        location.reload();
    } else {
        const newHtml = 
                `<div>${Number(id) + 2}/${cardsList.length}</div>
                <div class="card">
                    <p id='${Number(id) + 1}' onclick='flip(${Number(id) + 1})'>
                        ${cardsList[Number(id) + 1].heads}
                    </p>
                </div>
                <div class="btns">
                    <button class="btn" id="again" onclick='again(${Number(id) + 1})'>Again</button>
                    <button class="btn" id="ok" onclick='ok(${Number(id) + 1})'>OK</button>
                </div>
                `;
        document.querySelector(".flashcard-page").innerHTML = newHtml;
    } 
}

async function ok(id) {
    try {
        const response = await fetch(`http://localhost:3001/flashcard/flip`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({cardId: cardsList[Number(id)].id}), 
        });
        const data = await response.json();
    } catch (error) {
        console.error(`Server error`, error);
    }


    if (Number(id) + 1 >= cardsList.length) {
        location.reload();
    } else {
        const newHtml = 
                `<div>${Number(id) + 2}/${cardsList.length}</div>
                <div class="card">
                    <p id='${Number(id) + 1}' onclick='flip(${Number(id) + 1})'>
                        ${cardsList[Number(id) + 1].heads}
                    </p>
                </div>
                <div class="btns">
                    <button class="btn" id="again" onclick='again(${Number(id) + 1})'>Again</button>
                    <button class="btn" id="ok" onclick='ok(${Number(id) + 1})'>OK</button>
                </div>
                `;
        document.querySelector(".flashcard-page").innerHTML = newHtml;
    } 
}

fetchCards();