const login = async (email, password) => {
  try {
    const res = await axios.post('http://127.0.0.1:4200/api/v1/users/login', {
      email,
      password,
    });
    console.log(res);
    if (res.data.status === 'success') {
      alert('logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data);
  }
};

console.log(document.querySelector('.form'));
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
