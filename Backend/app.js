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
    const {email} = request.params;
    const {updatedFields} = request.body;
    await users.updateUser(email, updatedFields);
    response.send("ok");
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
    const clientID = req.body.clientID;
    const { address, cleanType, roomQuantity, prefDate, budget, note } = req.body;

    let photos = [];
    if (req.files) {
        photos = req.files.map(file => file.buffer.toString("base64"));
    }

    await serviceRequests.createServiceRequest({
        clientID,
        address,
        cleanType,
        roomQuantity: parseInt(roomQuantity),
        preferredDateTime: prefDate,
        proposedBudget: parseFloat(budget),
        optionalNote: note,
        photos
    });

    res.json({ success: true });
});
const updateServiceRequest = handleError(async (request, response) =>{
    const {requestID} = request.params;
    const {updatedFields} = request.body;
    await serviceRequests.updateServiceRequest(requestID, updatedFields);
    response.send("ok")
})
const getRequests = handleError(async (req, res) => {
    const { clientID } = req.params;
    const result = await serviceRequests.getRequests(clientID);
    res.json(result);
});
const getRequest = handleError(async (req, res) => {
    const { requestID } = req.params;
    const result = await serviceRequests.getRequest(requestID);
    if (result && result.photos) {
        if (typeof result.photos === "string") {
            result.photos = JSON.parse(result.photos);
        }
    }
    res.json(result);
});
const getAllServiceRequests = handleError(async (request, response) => {
    const result = await serviceRequests.getAllServiceRequests();
    response.json(result)
})
const getLargestRequests = handleError(async (request, response) => {
    const result = await serviceOrders.getLargestRequests();
    response.json(result);
})


const createQuote = handleError(async (request, response) => {  
    await quotes.createQuote(request.body); 
    response.send("ok");
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
const getOverdueBills = handleError(async (request, response) => {
    const result = await bills.getOverdueBills();
    response.json(result)
})


app.post('/users', multerFormParser.none(),addUser);
app.get("/users", getAllUsers)
app.post("/users/:email", updateUser);
app.post("/users/login", multerFormParser.none(), logInUser); 
app.get("/users/frequent", getFrequentClients); 
app.get("/users/uncommitted", getUncommittedClients); 
app.get("/users/prospective", getProspectiveClients); 
app.get("/users/good", getGoodClients); 
app.get("/users/bad", getBadClients); 

app.post("/service-requests", upload.array("photos", 5), createServiceRequest);
app.get("/service-requests", getAllServiceRequests);
app.put("/service-requests/:requestID", updateServiceRequest);
app.get("/service-requests/:clientID", getRequests);
app.get("/service-requests/request/:requestID", getRequest);
app.get("/service-requests/largest", getLargestRequests);

app.post("/quotes", createQuote)
app.put("/quotes/:quoteID", updateQuote);
app.get("/quotes/accepted", getAcceptedQuotes);

app.post("/bills", createBill)
app.put("/bills/:billID", updateBill);
app.get("/bills/overdue", getOverdueBills)


app.listen(process.env.APP_PORT, 
    () => {
        console.log(`I am listening on port ${process.env.APP_PORT}.`);
    }
);

