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
            
         // id is mainly if ever we need order of items inserted. 
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
               requestID VARCHAR(50),
               quoteID VARCHAR(50) PRIMARY KEY,
               total DECIMAL(10, 2),
               FOREIGN KEY (billID) REFERENCES service_orders(orderID)
            );
         `);
         connection.query(`
            CREATE TABLE IF NOT EXISTS bills (
               id INT AUTO_INCREMENT UNIQUE,
               billID VARCHAR(50) PRIMARY KEY,
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
   

} 

class ServiceRequests {
   static getServiceRequestInstance() {
        serviceRequestsInstance = serviceRequestsInstance ? serviceRequestsInstance : new ServiceRequests();
        return serviceRequestsInstance;
    } 

   async createServiceRequest(options) {
      const {clientID, address, cleanType, roomQuantity, preferredDateTime, proposedBudget, optionalNote, photos} = options;
      
      await new Promise((resolve, reject) => {
         const query = `
               INSERT INTO service_requests 
               (requestID, clientID, status, address, cleanType, roomQuantity, preferredDateTime, proposedBudget, optionalNote, photos, chatHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
         `;

         // status can be:
         //    1) ORDERING
         //    2) BILLING
         //    3) CANCELED
         //    4) COMPLETE
         connection.query(query, [uuidv4(), clientID, "ORDERING", address, cleanType, roomQuantity, preferredDateTime, proposedBudget, optionalNote, JSON.stringify(photos), "[]"], (err, data) => {
            if (err) reject(new Error(err.message));
            else resolve(data);
         });
      });
   }

   async getOneRequestByClient(requestID){
      const result = await new Promise((resolve, reject) => {
         const query = `SELECT * FROM service_requests WHERE requestID = ? ORDER BY preferredDateTime DESC`;
         connection.query(query, [requestID], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
      return result[0];
   }
   async getRequestsByClient(clientID) {
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
   async updateServiceRequest(updatedFields, requestID){
      const fields = Object.keys(updatedFields);
      const newValues = fields.map(key => updatedFields[key]);

      const formattedFieldsForQuery = fields.map(key => `${key} = ?`).join(", ");
      await new Promise((resolve, reject) => {
         const query = `UPDATE ${formattedFieldsForQuery} FROM service_requests WHERE requestID = ?`;
         connection.query(query, [...newValues, requestID], (err, data) => {
               if(err) reject(new Error(err.message));
               else resolve(data);
         });
      });
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
      const {billID} = options;

      await new Promise((resolve, reject) => {
         const query = `INSERT INTO quotes (billID,) VALUES (?);`;
         connection.query(query, [billID], (err, data) => {
               if (err) reject(new Error(err.message));
               else resolve(data);
            }
         );
      });
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

export { Users, ServiceRequests, ServiceOrders, Bills };
 
