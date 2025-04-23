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


// Send login form to backend
let email = "";

async function fetchAccountData() {
    try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${endpoint}/accounts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, 
                'Content-Type': 'application/json',
            }, 
        });
        const data = await response.json();
        email = data.data.email;
        setHtml();
    } catch (error) {
        console.error(`Internal server error.`, error);
    }
}
fetchAccountData();


// Set html
function setHtml() {
    document.getElementById('email').value = email;
}


// Log out
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem('jwt');
    window.location.href = '../index.html';
});


// Send sign up form to backend
document.getElementById("submit-btn").addEventListener("click", async () => {
        const form = document.getElementById("account-form");
        const formData = new FormData(form);

        const userData = {
            email: formData.get("email"), 
            password: formData.get("password"), 
        }

        try {
            const token = localStorage.getItem("jwt");
            const response = await fetch(`${endpoint}/accounts/update`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(userData), 
            });
            const data = await response.json();
            console.log(data)
            window.location.href = 'login.html';
        } catch (error) {
            console.error(`Internal server error.`, error);
        }
    }
)