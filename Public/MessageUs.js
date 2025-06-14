document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const successDiv = document.getElementById('successMessage');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const user = JSON.parse(localStorage.getItem('user'));

    const body = {
      fromName: name,
      fromEmail: email,
      subject,
      messageBody: message,
      userId: user ? user._id : undefined
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.success) {
        successDiv.textContent = 'Message sent successfully!';
        successDiv.style.display = 'block';
        form.reset();
      } else {
        successDiv.textContent = 'Failed to send message.';
        successDiv.style.display = 'block';
      }
    } catch (err) {
      successDiv.textContent = 'Error sending message.';
      successDiv.style.display = 'block';
    }
  });
});
