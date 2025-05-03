// Backend URL
const endpoint = 'http://localhost:4000';


// Footer
const currentYear = new Date().getFullYear();
document.querySelector("#year").innerHTML = currentYear;


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
function passwordChecker(password) {
    if (
        !password || 
        password.length < 6
    ) {
        document.getElementById('pass-len-err').style.display = 'block';
        return false;
    }

    return true;
}


// Send login form to backend
document.getElementById("login-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const form = document.getElementById("login-form");
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!emailChecker(email)) {
        return;
    }
    
    if (!passwordChecker(password)) {
        return;
    }

    const userData = {
        email: email, 
        password: password, 
    };

    try {
        const response = await fetch(`${endpoint}/accounts/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify(userData), 
        });

        if (response.status === 401) {
            document.getElementById('email-pass-invalid-err').style.display = 'block';
            return;
        }

        const data = await response.json();
        localStorage.setItem('jwt', data.token);
        window.location.href = '../index.html';
    } catch (error) {
        console.error(`Internal server error.`, error);
    }
});


// Hide email error messages
document.getElementById("email").addEventListener("input", () => {
    document.getElementById('email-pass-invalid-err').style.display = 'none';
    document.getElementById('email-err').style.display = 'none';
    document.getElementById('email-invalid-err').style.display = 'none';
    document.getElementById('email-too-long-err').style.display = 'none';
});


// Hide password error messages
document.getElementById("password").addEventListener("input", () => {
    document.getElementById('pass-len-err').style.display = 'none';
});