async function testLogin() {
    console.log('Testing connection to http://localhost:5000/api/auth/login...');
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword'
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);

        if (response.status === 401) {
            console.log('SUCCESS: Backend is reachable and rejected invalid credentials.');
        } else {
            console.log('SUCCESS: Backend responded (status ' + response.status + ')');
        }
    } catch (error) {
        console.error('FAILED: Could not connect to backend:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

testLogin();
