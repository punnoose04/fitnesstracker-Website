function setReminder() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value;
    const error = document.getElementById('error-message');

    if (!date || !time || !message) {
        error.style.display = 'block'; // Show the error message if fields are missing
        return; // Stop the function if any field is empty
    } else {
        error.style.display = 'none'; // Hide the error message if all fields are filled
    }

    fetch('/add-reminder', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ date, time, message })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            alert('Reminder set successfully!');
            displayReminder(data.reminder);  // Call to new function to display reminder
            window.location.href = 'fitnessmainpage.html'; // Optional redirect
        } else {
            alert('Failed to set reminder. Error: ' + data.message);
        }
    })
    .catch(error => alert('Error setting reminder: ' + error));
}

function displayReminder(reminder) {
    const reminderList = document.getElementById('reminderList'); // Ensure this ID exists on fitnessmainpage.html
    if (reminderList) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${reminder.date} at ${reminder.time} - ${reminder.message} <button onclick="dismissReminder(this, ${reminder.id})">Dismiss</button>`;
        reminderList.appendChild(listItem);
    }
}