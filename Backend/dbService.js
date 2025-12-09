import mysql from 'mysql';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
dotenv.config(); 

let usersInstance = null;
let serviceRequestsInstance = null;
let serviceOrdersInstance = null;
let billsInstance = null;
let quotesInstance = null;

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
               clientID VARCHAR(50) PRIMARY KEY, 
               requestIDs JSON,
               firstname VARCHAR(50),
               lastname VARCHAR(50),
               email VARCHAR(100) UNIQUE,
               address VARCHAR(100),
               phoneNumber VARCHAR(20),
               password VARCHAR(100)
            );
         `);
            
         connection.query(`
            CREATE TABLE IF NOT EXISTS service_requests (
               id INT AUTO_INCREMENT UNIQUE,
               status VARCHAR(50),
               requestID VARCHAR(50) PRIMARY KEY,
               clientID VARCHAR(50),
               address VARCHAR(200),
               cleanType VARCHAR(100),
               roomQuantity INT,
               preferredDateTime DATETIME,
               proposedBudget DECIMAL(10,2),
               optionalNote VARCHAR(500),
               photos LONGTEXT,
               chatHistory JSON,
               FOREIGN KEY (clientID) REFERENCES users(clientID)
            );
         `);
         
         connection.query(`
            CREATE TABLE IF NOT EXISTS service_orders (
               id INT AUTO_INCREMENT UNIQUE,
               clientID VARCHAR(50),
               orderID VARCHAR(50) PRIMARY KEY,
               FOREIGN KEY (orderID) REFERENCES service_requests(requestID)
            ); 
         `);
         connection.query(`
            CREATE TABLE IF NOT EXISTS quotes (
               id INT AUTO_INCREMENT UNIQUE,
               quoteID VARCHAR(50) PRIMARY KEY,
               clientID VARCHAR(50),
               status VARCHAR(100),
               decided DATETIME,
               price DECIMAL(10,2),
               windowStart DATETIME,
               windowEnd DATETIME,
               note VARCHAR(1000),
               FOREIGN KEY (billID) REFERENCES service_orders(orderID)
            );
         `);
         connection.query(`
            CREATE TABLE IF NOT EXISTS bills (
               id INT AUTO_INCREMENT UNIQUE,
               clientID VARCHAR(50),
               billID VARCHAR(50) PRIMARY KEY,
               generated DATETIME,
               paid DATETIME,
               total DECIMAL(10, 2),
               FOREIGN KEY (billID) REFERENCES service_orders(orderID)

            );
         `);
         clearInterval(reconnectTimer);
      }
      console.log('db ' + connection.state);  
   });

}
class Users{
   static getUsersInstance(){ 
      usersInstance = usersInstance ? usersInstance : new Users();
      return usersInstance;
   }
   async createUser(options){
      const {firstname, lastname, email, address, phoneNumber, password} = options;
      const clientID = uuidv4();
      
      const hashedPass = await bcrypt.hash(password, 10);
      await new Promise((resolve, reject) => {
         const query = "INSERT INTO users (clientID, requestIDs, firstname, lastname, email, address, phoneNumber, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
         connection.query(query, [clientID, "[]", firstname, lastname, email, address, phoneNumber, hashedPass], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve({ data });
         });
      });
   }
   async validateLogin(email, password){
      //are we anna? this is temporary
      if (email === "anna" && password === "123"){
         return { success: true, clientID: "anna" };
      }

      const realPassword = await new Promise((resolve, reject) => {
         const query = "SELECT clientID, password FROM users WHERE email = ?;";
         connection.query(query, [email], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      const validPass = realPassword.length === 0 ? null : await bcrypt.compare(password, realPassword[0]["password"]);
      if (!validPass){
         return {success: false };
      }
      
      return { success: true, clientID: realPassword[0].clientID };
   }
   async updateUser(email, updatedFields){
      const fields = Object.keys(updatedFields);
      const newValues = fields.map(key => updatedFields[key]);

      const formattedFieldsForQuery = fields.map(key => `${key} = ?`).join(", ");

      await new Promise((resolve, reject) => {
         const query = `UPDATE users SET ${formattedFieldsForQuery} WHERE email = ?;`;
         connection.query(query, [...newValues, email], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
   }

   async getAllUsers(){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT firstname, lastname, clientID, requestIDs FROM users`;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(client =>{
         client["requestIDs"] = JSON.parse(client["requestIDs"])
      })
      return result;
   }  
   async getFrequentClients(){
      const result = await new Promise((resolve, reject) => {
         const query = `
         SELECT firstname, lastname, clientID, requestIDs FROM users 
         ORDER BY JSON_LENGTH(requestIDs) DESC
         `;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(client =>{
         client["requestIDs"] = JSON.parse(client["requestIDs"])
      })
      return result;
   }  
   async getUncommittedClients(){
      const result = await new Promise((resolve, reject) => {
         const query = `
         SELECT firstname, lastname, clientID, requestIDs FROM users 
         WHERE JSON_LENGTH(requestIDs) >= 3 AND clientID NOT IN (SELECT clientID FROM service_orders)
         `;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(client =>{
         client["requestIDs"] = JSON.parse(client["requestIDs"])
      })
      return result;
   }  
   async getProspectiveClients(){
      const result = await new Promise((resolve, reject) => {
         const query = `
         SELECT firstname, lastname, clientID, requestIDs FROM users 
         WHERE JSON_LENGTH(requestIDs) = 0
         `;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(client =>{
         client["requestIDs"] = JSON.parse(client["requestIDs"])
      })
      return result;
   }  
   async getGoodClients(){
      const result = await new Promise((resolve, reject) => {
         const query = `
         SELECT firstname, lastname, clientID, requestIDs FROM users 
         WHERE clientID NOT IN (
            SELECT clientID FROM bills 
            WHERE (paid IS NOT NULL AND paid > DATE_ADD(generated, INTERVAL 24 HOUR))
                  OR (paid IS NULL AND NOW() > DATE_ADD(generated, INTERVAL 24 HOUR))
         )`;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(client =>{
         client["requestIDs"] = JSON.parse(client["requestIDs"])
      })
      return result;
   }  
   async getBadClients(){
      const result = await new Promise((resolve, reject) => {
         const query = `
         SELECT firstname, lastname, clientID, requestIDs FROM users 
         WHERE clientID IN (
            SELECT clientID FROM bills 
            WHERE (paid IS NOT NULL AND paid > DATE_ADD(generated, INTERVAL 24 HOUR))
                  OR (paid IS NULL AND NOW() > DATE_ADD(generated, INTERVAL 24 HOUR))
         )`;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      result.forEach(client =>{
         client["requestIDs"] = JSON.parse(client["requestIDs"])
      })
      return result;
   }  
} 

class ServiceRequests {
   static getServiceRequestInstance() {
        serviceRequestsInstance = serviceRequestsInstance ? serviceRequestsInstance : new ServiceRequests();
        return serviceRequestsInstance;
   } 
   async createServiceRequest(options) {
      const {clientID, address, cleanType, roomQuantity, preferredDateTime, proposedBudget, optionalNote, chatHistory} = options;
      const requestID = uuidv4();

      await new Promise((resolve, reject) => {
         const query = `INSERT INTO service_requests (status, requestID, clientID, address, cleanType, roomQuantity, preferredDateTime, proposedBudget, optionalNote, chatHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
         // status can be:
         //    1) ORDERING
         //    2) BILLING
         //    3) CANCELED
         //    4) COMPLETE
         connection.query(query, ["ORDERING", requestID, clientID, address, cleanType, roomQuantity, preferredDateTime, proposedBudget, optionalNote, "[]"], (err, data) => {
            if (err) reject(new Error(err.message));
            else resolve(data);
         });
      });
   }
   async updateServiceRequest(requestID, updatedFields){
      const fields = Object.keys(updatedFields);
      const newValues = fields.map(key => updatedFields[key]);

      const formattedFieldsForQuery = fields.map(key => `${key} = ?`).join(", ");
      await new Promise((resolve, reject) => {
         const query = `UPDATE service_requests SET ${formattedFieldsForQuery} WHERE requestID = ?`;
         connection.query(query, [...newValues, requestID], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
   }
   async getRequest(requestID){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM service_requests WHERE requestID = ?`;
         connection.query(query, [requestID], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      return result[0];
   }
   async getClientRequests(clientID) {
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM service_requests WHERE clientID = ? ORDER BY preferredDateTime DESC`;
         connection.query(query, [clientID], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      return result;
   }
   async getAllServiceRequests(){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM service_requests ORDER BY preferredDateTime DESC`;
         connection.query(query, [],(err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      return result;
   }
   async getLargestRequests(){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM service_requests ORDER BY roomQuantity DESC`;
         connection.query(query, [],(err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      return result;
   }
}

class ServiceOrders{
   static getServiceOrdersInstance() {
        serviceOrdersInstance = serviceOrdersInstance ? serviceOrdersInstance : new ServiceOrders();
        return serviceOrdersInstance;
   }
   async createServiceOrder(options) {
      const {orderID} = options;

      await new Promise((resolve, reject) => {
         const query = `INSERT INTO service_orders (orderID,) VALUES (?);`;
         connection.query(query, [orderID], (err, data) => {
               if (err) reject(new Error(err.message));
               else resolve(data);
            }
         );
      });
   }

}

class Quotes{
   static getQuotesInstance() {
        quotesInstance = quotesInstance ? quotesInstance : new Quotes();
        return quotesInstance;
   }
   async createQuote(options) {
      const {clientID, status, price, windowStart, windowEnd, note} = options;
      const quoteID = uuidv4();

      await new Promise((resolve, reject) => {
         const query = `INSERT INTO quotes (quoteID, clientID, status, price, windowStart, windowEnd, note) VALUES (?, ?, ?, ?, ?, ?, ?);`;
         connection.query(query, [quoteID, clientID, status, price, windowStart, windowEnd, note], (err, data) => {
               if (err) reject(new Error(err.message));
               else resolve(data);
            }
         );
      });
   }
   async updateQuote(quoteID, fields){
      const colUpdates = Object.entries(fields).map(pair=>{
         return `${pair[0]} = ${typeof pair[1] === "number" ? pair[1] : `'${pair[1]}'`}`;
      }).join(", ");

      await new Promise((resolve, reject) => {
         const query = `UPDATE quotes SET ${colUpdates} WHERE quoteID = ?;`;
         connection.query(query, [quoteID], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
   }
   async getAcceptedQuotes(){
      const result = await new Promise((resolve, reject) => {
         const query = `
         SELECT quoteID, clientID, status, windowStart, windowEnd, note, decided FROM quotes 
         WHERE status = 'ACCEPTED' AND (MONTH(NOW()) = MONTH(decided) AND YEAR(NOW()) = YEAR(decided))
         `;
         connection.query(query, (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      return result;
   }  
}

class Bills{
   static getBillsInstance() {
        billsInstance = billsInstance ? billsInstance : new Bills();
        return billsInstance;
    }

   async createBill(options) {
      const {billID} = options;

      await new Promise((resolve, reject) => {
         const query = `INSERT INTO service_orders (billID,) VALUES (?);`;
         connection.query(query, [billID], (err, data) => {
               if (err) reject(new Error(err.message));
               else resolve(data);
            }
         );
      });
   }

}

export { Users, ServiceRequests, Quotes, ServiceOrders, Bills };
 
