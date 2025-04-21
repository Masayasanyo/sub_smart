// Backend URL
const endpoint = 'http://localhost:4000';

// Footer
const currentYear = new Date().getFullYear();
document.querySelector("#year").innerHTML = currentYear;

// Send login form to backend
async function login(userData) {
    try {
        const response = await fetch(`${endpoint}/accounts/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify(userData), 
        });
        const data = await response.json();
        localStorage.setItem('jwt', data.token);
        window.location.href = '../index.html';
    } catch (error) {
        console.error(`Internal server error.`, error);
    }
}

// Send sign up form to backend
document.getElementById("signup-btn").addEventListener("click", async () => {
        const form = document.getElementById("signup-form");
        const formData = new FormData(form);
        
        let password = '';
        if (formData.get("password") !== formData.get("confirmed-password")) {
            return;
        } else {
            password = formData.get("password");
        }

        const userData = {
            email: formData.get("email"), 
            password: password, 
        }

        try {
            await fetch(`${endpoint}/accounts/signup`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(userData), 
            });
            await login(userData);
        } catch (error) {
            console.error(`Internal server error.`, error);
        }
    }
)