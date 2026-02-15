const axios = require('axios');

async function testSignup() {
    try {
        const email = `test${Date.now()}@example.com`;
        console.log('Testing signup with', email);
        const res = await axios.post('http://localhost:4000/api/users/signup', {
            name: 'TestUser',
            email: email,
            password: 'password123'
        });
        console.log('Signup Response:', res.status, res.data);
        return { email, password: 'password123' };
    } catch (err) {
        console.error('Signup Error:', err.response ? err.response.data : err.message);
    }
}

async function testLogin(creds) {
    if (!creds) return;
    try {
        console.log('Testing login with', creds.email);
        const res = await axios.post('http://localhost:4000/api/users/login', {
            email: creds.email,
            password: creds.password
        });
        console.log('Login Response:', res.status, res.data);
    } catch (err) {
        console.error('Login Error:', err.response ? err.response.data : err.message);
    }
}

(async () => {
    try {
        const creds = await testSignup();
        await testLogin(creds);
    } catch (e) {
        console.error(e);
    }
})();
