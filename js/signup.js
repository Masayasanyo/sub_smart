import { endpoint } from "./config.js";


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


// Email checker
function emailChecker(email) {
    if (!email) {
        document.getElementById('email-err').style.display = 'block';
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email-invalid-err').style.display = 'block';
        return false;
    }

    if (email.length > 254) {
        document.getElementById('email-too-long-err').style.display = 'block';
        return false;
    }

    return true;
}


// Password checker
function passwordChecker(password, confPassword) {
    if (
        !password || 
        !confPassword || 
        password.length < 6 || 
        confPassword.length < 6 
    ) {
        document.getElementById('pass-len-err').style.display = 'block';
        return false;
    }

    if (password !== confPassword) {
        document.getElementById('pass-match-err').style.display = 'block';
        return false;
    }

    return true;
}


// Send sign up form to backend
document.getElementById("signup-btn").addEventListener("click", async () => {
    const form = document.getElementById("signup-form");
    const formData = new FormData(form);
    const email = formData.get("email")?.trim();
    const password = formData.get("password");
    const confPassword = formData.get("confirmed-password");

    if (!emailChecker(email)) {
        return;
    }
    
    if (!passwordChecker(password, confPassword)) {
        return;
    }

    const userData = {
        email: email, 
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
})


// Hide email error messages
document.getElementById("email").addEventListener("input", () => {
    document.getElementById('email-err').style.display = 'none';
    document.getElementById('email-invalid-err').style.display = 'none';
    document.getElementById('email-too-long-err').style.display = 'none';
});


// Hide password error messages
document.getElementById("password").addEventListener("input", () => {
    document.getElementById('pass-len-err').style.display = 'none';
    document.getElementById('pass-match-err').style.display = 'none';
});

document.getElementById("confirmed-password").addEventListener("input", () => {
    document.getElementById('pass-len-err').style.display = 'none';
    document.getElementById('pass-match-err').style.display = 'none';
});