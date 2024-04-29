async function accountCreation() { 
    // Used for sign up
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const missingFields = document.getElementById('missingFields');
    const passwordMismatch = document.getElementById('passwordMismatch');
    const success = document.getElementById('successfulSignup');
    const emailError = document.getElementById('emailError');
    
    passwordMismatch.style.display = 'none';
    missingFields.style.display = 'none';
    success.style.display = 'none';

    if (!password || !confirmPass || !email) {
        missingFields.style.display = 'inline';
        return;
    }

    if (password != confirmPass) {
        passwordMismatch.style.display = 'inline';
        return;
    } else {
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            }); 
            const data = await response.json();
    
            if (response.ok) {
                success.textContent = 'Account created successfully!';
                success.style.display = 'inline';
            } else if (response.status === 409) {
                if (!emailError) { // Create this element if it does not exist
                    console.log("in email error");
                    const emailErrorElement = document.createElement('span');
                    emailErrorElement.id = 'emailError';
                    emailErrorElement.style.color = 'red';
                    document.getElementById('sign-in').appendChild(emailErrorElement);
                }
                emailError.textContent = data.message;
                emailError.style.display = 'inline';
            } 
            else {
                throw new Error(data.message || 'Failed to create account');
            } 
        } catch (error) {
            console.error('Error during account creation:', error);
            alert('Failed to create account. Please try again.');
        }
    }
    // alert('email is' + email + '\n' + 'password is' + password + '\n' + "pass confirm is " + confirmPass);


}

async function accountSignin() {
    // Used for sign in
    const email1 = document.getElementById('signInEmail').value;
    const password1 = document.getElementById('signInPassword').value;
    const missingFields1 = document.getElementById('missingFields1');
    const success1 = document.getElementById('successfulSignup1');
    
    missingFields1.style.display = 'none';
    success1.style.display = 'none';
    // alert('email is' + email1 + '\n' + 'password is' + password1);

    if (!email1 || !password1) {
        missingFields1.style.display = 'inline';
        return;
    }

    try {
        console.log("in accountsignin");
        const response = await fetch('/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email1, password: password1 }),
        });
        const data = await response.json();

        if (response.ok) {
            success1.textContent = 'Successful Sign In!';
            success1.style.color = 'lightgreen';
            success1.style.display = 'inline';
            // alert(data.message);
            window.location.href = '/fitnessmainpage.html';
        } else {
            success1.textContent = 'Either Username or Password is invalid';
            success1.style.color = 'red';
            success1.style.display = 'inline';
            // alert(data.message);
        }
    } catch (error) {
        console.error('Error signing in:', error);
        alert('Error signing in. Please try again later.');
    }

}
