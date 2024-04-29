function addWorkoutForm() {
    // console.log("in workoutform");
    const container = document.getElementById('workoutsContainer');
    const html = `
        <div class="workoutEntry">
            <label>Workout Type:</label>
            <input type="text" name="type[]" pattern="[A-Za-z ]+" title="Please enter valid workout name." placeholder="e.g., Bench Press" required>
            <label>Weight (lbs):</label>
            <input type="number" name="weight[]" min="1" step="1" placeholder="Weight in lbs">
            <label>Sets:</label>
            <input type="number" name="sets[]" min="1" step="1" placeholder="Number of sets">
            <label>Reps:</label>
            <input type="number" name="reps[]" min="1" step="1" placeholder="Number of reps">
            <button type="button" onclick="removeWorkoutForm(this.parentNode)">Remove</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

function removeWorkoutForm(element) {
    element.remove();
}

function checkWorkout(date, workoutType) {
    fetch(`/check-workout-existence?date=${date}&workoutType=${encodeURIComponent(workoutType)}`)
        .then(response => response.json())
        .then(data => {
            const messageDiv = document.getElementById('workout-error-message');
            if (data.exists) {
                messageDiv.textContent = `You have already logged a '${workoutType}' workout on this date.`;
                messageDiv.style.display = 'block'; // Show the message
            } else {
                messageDiv.style.display = 'none'; // Hide the message if no duplicate is found
            }
        })
        .catch(error => {
            console.error('Error checking workout existence:', error);
            messageDiv.textContent = "Error checking for duplicate workouts.";
            messageDiv.style.display = 'block';
        });
}

function submitWorkout(event) {
    event.preventDefault();
    
    const messageContainer = document.getElementById('message-container');
    const filled = document.getElementById('error-message');
    const duplicate = document.getElementById('duplicate');
    filled.style.display = 'none';

    let allFilled = true;
    const date = document.getElementById('date').value;

    const workouts = Array.from(document.querySelectorAll('.workoutEntry')).map(entry => {
        const type = entry.querySelector('[name="type[]"]').value.trim();
        const weight = entry.querySelector('[name="weight[]"]').value.trim();
        const sets = entry.querySelector('[name="sets[]"]').value.trim();
        const reps = entry.querySelector('[name="reps[]"]').value.trim();

        if (!type || !weight || !sets || !reps) {
            allFilled = false;
        }

        return { type, weight, sets, reps };
    });

    if (!allFilled) {
        filled.textContent = "Please enter all data";
        filled.style.display = 'inline';
        return; 
    }
    
    fetch('/submit-workouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, workouts })
    })
    .then(response => {
        if (response.status === 409) {
            return response.json().then(data => { throw new Error(data.message); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        messageContainer.textContent = 'Workout has been successfully logged!';
        messageContainer.style.display = 'block';
    
        document.getElementById('workoutsContainer').innerHTML = '';
        document.querySelector('form').reset(); 

        loadWorkoutHistory();           // Adds newly added information to existing workout history too
    })
    .catch(error => {
        console.error('Error:', error);
        duplicate.textContent = error.message;
        duplicate.style.display = 'block';
    });

}

function signOut() {
    fetch('/signout', { method: 'POST' }) // Assume POST method to handle session destruction on server
    .then(response => {
        if (response.ok) {
            window.location.href = 'index.html'; // Redirect to sign-in page after successful sign-out
        } else {
            alert('Failed to sign out.');
        }
    })
    .catch(error => {
        console.error('Error signing out:', error);
        alert('Error signing out.');
    });
}

function loadWorkoutHistory() {
    fetch('/workouts')
    .then(response => response.json())
    .then(workouts => {
        const logsContainer = document.getElementById('workoutLogs');
        logsContainer.innerHTML = ''; // Clear previous logs

        workouts.forEach(workout => {
            let logEntry = document.getElementById(`log-${workout.date}`);

            const date = new Date(workout.date); // Date object from workout data
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }); // Format as month day year

            if (!logEntry) {
                logEntry = document.createElement('div');
                logEntry.id = `log-${workout.date}`;
                logEntry.innerHTML = `
                    <button class="log-date">${formattedDate}</button>
                    <div class="log-details" style="display:none;"></div>`;
                logsContainer.appendChild(logEntry);
            }
            const details = logEntry.querySelector('.log-details');
            details.innerHTML += `<p><strong>Type:</strong> ${workout.workout_type}, 
                                    <strong>Weight:</strong> ${workout.weight}, 
                                    <strong>Sets:</strong> ${workout.sets}, 
                                    <strong>Reps:</strong> ${workout.reps}</p>`;
        });

        document.querySelectorAll('.log-date').forEach(button => {
            button.onclick = function() {
                const details = this.nextElementSibling;
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            };
        });
    })
    .catch(error => {
        console.error('Error loading workout history:', error);
        logsContainer.textContent = 'Failed to load workout history.';
    });
}

document.addEventListener('DOMContentLoaded', loadWorkoutHistory);

function showWorkoutDetails(workout) {
    // Optionally implement this function to show detailed information or allow editing
    alert(`Showing details for workout: ${workout.workout_type} on ${workout.date}`);
}

function formatTime24To12(time24) {
    const [hours, minutes] = time24.split(':');
    const hoursInt = parseInt(hours, 10);
    const suffix = hoursInt >= 12 ? 'PM' : 'AM';
    const hours12 = ((hoursInt + 11) % 12 + 1); // Converts 0-23 hour format into 1-12 hour format
    return `${hours12}:${minutes} ${suffix}`;
}

function loadReminders() {
    fetch('/get-reminders')
    .then(response => response.json())
    .then(reminders => {
        const reminderPanel = document.getElementById('reminderPanel');
        const reminderList = document.getElementById('reminderList');
        
        // Clear existing reminders before appending new ones
        reminderList.innerHTML = '';

        if (reminders.length > 0) {
            // Display each reminder with a dismiss button
            reminders.forEach(reminder => {
                const listItem = document.createElement('li');

                // Format the date to a more readable form
                const date = new Date(reminder.reminder_date);
                const formattedDate = date.toLocaleDateString(undefined, {
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });

                // Format time from 24-hour to 12-hour AM/PM format
                const formattedTime = formatTime24To12(reminder.reminder_time);

                listItem.innerHTML = `${formattedDate} at ${formattedTime} - ${reminder.message}`;
                const dismissButton = document.createElement('button');
                dismissButton.textContent = 'Dismiss';
                dismissButton.onclick = function() { dismissReminder(reminder.id); };
                listItem.appendChild(dismissButton);
                reminderList.appendChild(listItem);
            });
            reminderPanel.style.display = 'block'; // Show the reminder panel if there are reminders
        } else {
            reminderPanel.style.display = 'none'; // Hide the reminder panel if there are no reminders
        }
    })
    .catch(error => {
        console.error('Error loading reminders:', error);
        document.getElementById('reminderPanel').style.display = 'none'; // Hide if there's an error fetching reminders
    });
}

function dismissReminder(reminderId) {
    fetch(`/dismiss-reminder/${reminderId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadReminders(); // Reload reminders to update the list after deletion
        } else {
            alert('Failed to dismiss reminder');
        }
    })
    .catch(error => alert('Error dismissing reminder: ' + error));
}


document.addEventListener('DOMContentLoaded', loadReminders);
