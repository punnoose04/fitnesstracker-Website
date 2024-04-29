Fitness Tracker Website

Overview

The Fitness Tracker Website is designed to help users monitor and enhance their physical activity routines. It provides a platform where users can log workouts, set and manage reminders, and view their workout history. The backend is developed in Node.js with Express and a MySQL database, while the frontend utilizes basic HTML and JavaScript.

Features

User Authentication: Secure login and registration system to manage user accounts.
Workout Logging: Users can log details of each workout session, including type, duration, and intensity.
Workout History: Users can view past workouts to track progress and patterns.
Reminder Setting: Users can set reminders for future workouts to maintain consistency.
Reminder Management: Manage and customize workout reminders.
Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites

Node.js
npm (Node Package Manager)
MySQL
Installation

Clone the repository:
Use the link to your GitHub repository to clone the project to your local machine.
Install the dependencies:
Run the npm install command to install all necessary dependencies.
Set up the MySQL database:
Ensure MySQL is installed and running on your system. Create a database named fitness_tracker and import the provided schema.
Configure your environment variables:
Copy the .env.example file to .env and update it with your database connection settings and any other configurations.
Start the server:
Use the npm start command to start the Node.js server on localhost:3000.
Usage

Once the server is running, navigate to localhost:3000 in your web browser to access the Fitness Tracker Website. From there, you can register a new account or login if you already have one. After logging in, you can start logging workouts, setting reminders, and reviewing your workout history.

Running Tests

To run tests, use the npm test command. This project uses Jest and Supertest for backend testing.
