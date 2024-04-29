const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool( {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

async function checkDatabase(email, password) {
    try {
        // console.log("in checkDatabase");
        const connection = await pool.getConnection();
        console.log("think i got connection");
        const [rows, fields] = await connection.query('SELECT * FROM users WHERE email = ? AND pass = ?', [email, password]);
        connection.release();

        if (rows.length > 0) {
            console.log(rows[0]);
            return rows[0]; // Return the user data if found
        } else {
            return null; // Return null if user not found
        }
    } catch (error) {
        console.error('Error querying database:', error);
        throw error;
    }
}

async function addUser(email, password) {
  try {
    const connection = await pool.getConnection();
    const sql = 'INSERT INTO users (email, pass) VALUES (?, ?)';
    const [result] = await connection.query(sql, [email, password]);
    connection.release();
    return result;
  } catch (error) {
    console.error('Error adding user to database', error);
    throw error;
  }
}

async function emailExists(email) {
  console.log("in checkEmail");
  const connection = await pool.getConnection();
  try {
      const [results] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);
      connection.release();
      console.log("found email");
      return results.length > 0;
  } catch (error) {
      connection.release();
      console.error('Error querying email existence:', error);
      throw error;
  }
}

async function logWorkout(userId, date, workoutType, weight, sets, reps) {
  const connection = await pool.getConnection();
  try {
      const sql = 'INSERT INTO workouts (user_id, date, workout_type, weight, sets, reps) VALUES (?, ?, ?, ?, ?, ?)';
      const [result] = await connection.query(sql, [userId, date, workoutType, parseFloat(weight), parseInt(sets, 10), parseInt(reps, 10)]);
      connection.release();
      return result;
  } catch (error) {
      connection.release();
      console.error('Error logging workout:', error);
      throw error;
  }
}

async function workoutExists(userId, date, workoutType) {
  const connection = await pool.getConnection();
  try {
      const sql = 'SELECT 1 FROM workouts WHERE user_id = ? AND date = ? AND workout_type = ? LIMIT 1';
      const [results] = await connection.query(sql, [userId, date, workoutType]);
      connection.release();
      return results.length > 0;
  } catch (error) {
      connection.release();
      console.error('Error checking for existing workout:', error);
      throw error;
  }
}

async function addReminder(userId, date, time, message) {
  const connection = await pool.getConnection();
  try {
      const sql = 'INSERT INTO reminders (user_id, reminder_date, reminder_time, message) VALUES (?, ?, ?, ?)';
      const [result] = await connection.query(sql, [userId, date, time, message]);
      connection.release();
      return result;
  } catch (error) {
      connection.release();
      console.error('Error adding reminder:', error);
      throw error;
  }
}

async function getReminders(userId) {
  const connection = await pool.getConnection();
  try {
      const sql = 'SELECT * FROM reminders WHERE user_id = ? ORDER BY reminder_date DESC, reminder_time DESC';
      const [reminders] = await connection.query(sql, [userId]);
      connection.release();
      return reminders;
  } catch (error) {
      connection.release();
      console.error('Error fetching reminders:', error);
      throw error;
  }
}

async function getUsers(pool) {
        // console.log("in getusers");
        try {
          const result = await pool.query('SELECT * FROM users');
        //   console.log(result[0]); 
          return result;
        } catch (error) {
          console.error('Error executing query:', error);
          throw error;
        }
}

(async () => {
    try {
      const users = await getUsers(pool); // Assuming 'pool' is defined and accessible
      console.log(users[0]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  })();

module.exports = {
    checkDatabase, addUser, emailExists, logWorkout, workoutExists, pool, addReminder, getReminders
};

