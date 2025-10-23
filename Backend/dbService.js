const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");
dotenv.config(); 

let instance = null;
let connection = null;
let reconnectTimer = null;

// in case mysql isn't ready immediately
reconnectTimer = setInterval(connectToMYSQL, 2000);
connectToMYSQL();

function connectToMYSQL(){
   connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,        
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT
   });
   connection.connect((err) => {
      if(err){
         console.log(err.message);
      }
      if (connection.state === "connected"){
         connection.query(`
            CREATE TABLE IF NOT EXISTS users (
               username VARCHAR(50) primary key,
               password VARCHAR(100),
               firstname VARCHAR(50),
               lastname VARCHAR(50),
               salary FLOAT,
               age INTEGER,
               registerday DATE,
               signintime DATETIME
            );
         `);
         clearInterval(reconnectTimer);
      }
      console.log('db ' + connection.state);  
   });

}

class Users{
   static getUsersInstance(){ 
      instance = instance ? instance : new Users();
      return instance;
   }
   async createUser(options){
      const {username, password, firstname, lastname,
         salary, age} = options;

      const hashedPass = await bcrypt.hash(password, 10);
      await new Promise((resolve, reject) => {
         const query = "INSERT INTO users (username, password, firstname, lastname, salary, age, registerday, signintime) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
         connection.query(query, [username, hashedPass, firstname, lastname, salary, age, new Date(), null], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
   }
   async deleteUser(username){
      await new Promise((resolve, reject) => {
         const query = "DELETE FROM users WHERE username = ?;";
         connection.query(query, [username], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
   }
   async updateUser(username, fields){
      const colUpdates = Object.entries(fields).map(pair=>{
         return `${pair[0]} = ${typeof pair[1] === "number" ? pair[1] : `'${pair[1]}'`}`;
      }).join(", ");
      await new Promise((resolve, reject) => {
         const query = `UPDATE users SET ${colUpdates} WHERE username = ?;`;
         connection.query(query, [username], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
   }
   async validateLogin(username, password){
      const realPassword = await new Promise((resolve, reject) => {
         const query = "SELECT password FROM users WHERE username = ?;";
         connection.query(query, [username], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      const validPass = realPassword.length === 0 ? null : await bcrypt.compare(password, realPassword[0]["password"]);
      if (!validPass){
         return {success: false };
      }
      await new Promise((resolve, reject) => {
         const query = "UPDATE users SET signintime = ? WHERE username = ?;";
         connection.query(query, [new Date(), username], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      
      return {success: true};
   }

   async getAllUsers(){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM users`;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   }

   async getUsersByName(name, type){
      //type is fully controlled by backend no risk of sql injection attack 
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM users WHERE ${type} = ?;`;
         connection.query(query, [name], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   }

   async getUsersBySalary(minSalary, maxSalary){
      const result = await new Promise((resolve, reject) => {
         let query = `SELECT * FROM users WHERE 1=1`;
         let params = [];
         if (minSalary) {
            query += " AND salary > ?";
            params.push(minSalary);
         }
         if (maxSalary) {
            query += " AND salary < ?";
            params.push(maxSalary);
         }
         connection.query(query, params, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   }

   async getUsersByAge(minAge, maxAge){
      const result = await new Promise((resolve, reject) => {
         let query = `SELECT * FROM users WHERE 1=1`;
         let params = [];
         if (minAge){
            query += " AND age > ?";
            params.push(minAge);
         } 
         if (maxAge){
            query += " AND age < ?";
            params.push(maxAge);
         } 
         connection.query(query, params, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   }

   async getUsersAfterReg(username){
      let dayRegistered = await new Promise((resolve, reject) => {
         const query = `SELECT registerday FROM users WHERE username = ?;`;
         connection.query(query, [username], (err, data) => {
               if(err) reject(new Error(err.message));
               else if(!data[0]) reject(new Error("no user"));
               else resolve(data[0]["registerday"]);
         });
      });
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM users WHERE DATE(registerday) > DATE(?);`;
         connection.query(query, [dayRegistered], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   }
   async getUsersSameReg(username){
      let dayRegistered = await new Promise((resolve, reject) => {
         const query = `SELECT registerday FROM users WHERE username = ?;`;
         connection.query(query, [username], (err, data) => {
               if(err) reject(new Error(err.message));
               else if(!data[0]) reject(new Error("no user"));
               else resolve(data[0]["registerday"]);
         });
      });
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM users WHERE DATE(registerday) = DATE(?);`;
         connection.query(query, [dayRegistered], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   }
   async getUsersToday(){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM users WHERE DATE(registerday) = CURDATE();`;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   }

   async getUsersNoSignIn(){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM users WHERE signintime IS NULL;`;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(row => {
         delete row["password"];
      });
      return result;
   } 
}


module.exports = Users;
 
