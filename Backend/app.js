import express, { request, response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from "multer";
import { Users, ServiceRequests, Quotes, ServiceOrders, Bills, } from './dbService.js';

dotenv.config();
const multerFormParser = multer();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const users = Users.getUsersInstance();
const serviceRequests = ServiceRequests.getServiceRequestInstance();
const serviceOrders = ServiceOrders.getServiceOrdersInstance();
const bills = Bills.getBillsInstance()
const quotes = Quotes.getQuotesInstance()

function handleError(func){
    return async (req, res) => {
        try{
            return await func(req, res);
        }catch(err){
            console.error(err);
            res.status(500).send("error");
        }
    };
}

const addUser = handleError(async (request, response) => {  
    await users.createUser(request.body); 
    response.send("ok");
});
const logInUser = handleError(async (request, response) => {  
    const {email, password} = request.body;
    const result = await users.validateLogin(email, password);
    response.json(result);
});
const updateUser = handleError(async (request, response) => {  
    const {clientID} = request.params;
    const {updatedFields} = request.body;
    await users.updateUser(clientID, updatedFields);
    response.send("ok");
});
const getUser = handleError(async (req, res) => {
    const { clientID } = req.params;
    const result = await users.getUser(clientID);
    res.json(result);
});
const getAllUsers = handleError(async (request, response) => {
    const result = await users.getAllUsers();
    response.json(result)
})
const getFrequentClients = handleError(async (request, response) => {
    const result = await users.getFrequentClients();
    response.json(result)
})
const getUncommittedClients = handleError(async (request, response) => {
    const result = await users.getUncommittedClients();
    response.json(result)
})
const getProspectiveClients = handleError(async (request, response) => {
    const result = await users.getProspectiveClients();
    response.json(result)
})
const getGoodClients = handleError(async (request, response) => {
    const result = await users.getGoodClients();
    response.json(result)
})
const getBadClients = handleError(async (request, response) => {
    const result = await users.getBadClients();
    response.json(result)
})


const createServiceRequest = handleError(async (req, res) => {
    const data = req.body;
    data["photos"] = JSON.stringify(req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`));
    
    const requestID = await serviceRequests.createServiceRequest(data);
    res.json({ success: true, requestID });
});
const updateServiceRequest = handleError(async (request, response) =>{
    const {requestID} = request.params;
    const {updatedFields} = request.body;
    await serviceRequests.updateServiceRequest(requestID, updatedFields);
    response.send("ok")
})
const getRequests = handleError(async (req, res) => {
    const { clientID } = req.params;
    const result = await serviceRequests.getClientRequests(clientID);
    res.json(result);
});
const getRequest = handleError(async (req, res) => {
    const { requestID } = req.params;
    const result = await serviceRequests.getRequest(requestID);
    res.json(result);
});
const getAllServiceRequests = handleError(async (request, response) => {
    const result = await serviceRequests.getAllServiceRequests();
    response.json(result)
}) 
const getLargestRequests = handleError(async (request, response) => {
    const result = await serviceRequests.getLargestRequests();
    response.json(result);
})


const createQuote = handleError(async (request, response) => {  
    const quoteID = await quotes.createQuote(request.body); 
    response.json({quoteID});
});
const updateQuote = handleError(async (request, response) =>{
    const {quoteID} = request.params;
    const {updatedFields} = request.body;
    await quotes.updateQuote(quoteID, updatedFields);
    response.send("ok");
})
const getAcceptedQuotes = handleError(async (request, response) => {
    const result = await quotes.getAcceptedQuotes();
    response.json(result)
})


const createServiceOrder = handleError(async (request, response) => {
    await serviceOrders.createServiceOrder(request.body);
    response.send("ok");
})
const getServiceOrder = handleError(async (request, response) => {
    const {orderID} = request.params;
    const result = await serviceOrders.getServiceOrder(orderID);
    response.json(result);
})


const createBill = handleError(async (request, response) => {  
    await bills.createBill(request.body); 
    response.send("ok");
});
const updateBill = handleError(async (request, response) =>{
    const {billID} = request.params;
    const {updatedFields} = request.body;
    await bills.updateBill(billID, updatedFields);
    response.send("ok");
})
const getBills = handleError(async (req, res) => {
    const { requestID } = req.params;
    const result = await serviceRequests.getBills(requestID);
    res.json(result);
});
const getOverdueBills = handleError(async (request, response) => {
    const result = await bills.getOverdueBills();
    response.json(result)
})


app.post('/users', multerFormParser.none(),addUser);
app.get("/users", getAllUsers)
app.post("/users/login", multerFormParser.none(), logInUser); 
app.get("/users/frequent", getFrequentClients); 
app.get("/users/uncommitted", getUncommittedClients); 
app.get("/users/prospective", getProspectiveClients); 
app.get("/users/good", getGoodClients); 
app.get("/users/bad", getBadClients); 
app.put("/users/:clientID", updateUser);
app.get("/users/:clientID", getUser);


app.post("/service-requests", upload.array("photos", 5), createServiceRequest);
app.get("/service-requests", getAllServiceRequests);
app.get("/service-requests/several/:clientID", getRequests);
app.get("/service-requests/largest", getLargestRequests);
app.get("/service-requests/:requestID", getRequest);
app.put("/service-requests/:requestID", updateServiceRequest);

app.post("/quotes", createQuote)
app.get("/quotes/accepted", getAcceptedQuotes);
app.put("/quotes/:quoteID", updateQuote);

app.post("/service-orders", createServiceOrder);
app.get("/service-orders/:orderID", getServiceOrder);

app.post("/bills", createBill)
app.get("/bills/overdue", getOverdueBills)
app.get("/bills/:requestID", getBills);
app.put("/bills/:billID", updateBill);

app.listen(process.env.APP_PORT, 
    () => {
        console.log(`I am listening on port ${process.env.APP_PORT}.`);
    }
);

