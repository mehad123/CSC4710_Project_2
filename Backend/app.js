import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from "multer";
import { Users, ServiceRequests, ServiceOrders, Bills } from './dbService.js';

dotenv.config();
const multerFormParser = multer();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const users = Users.getUsersInstance();
const serviceRequests = ServiceRequests.getServiceRequestInstance();
const serviceOrders = ServiceOrders.getServiceOrdersInstance();
const bills = Bills.getBillsInstance()

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

const createServiceRequest = handleError(async (req, res) => {
    const clientID = req.body.clientID;
    const { address, cleanType, roomQuantity, prefDate, budget, note } = req.body;

    let photos = [];
    if (req.files) {
        photos = req.files.map(file => file.filename);
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
const getServiceRequests = handleError(async (req, res) => {
    const { clientID } = req.params;
    const result = await serviceRequests.getRequestsByClient(clientID);
    res.json(result);
});
const getOneServiceRequest = handleError(async (request, response) => {
    const { requestID } = request.params;
    const result = await serviceRequests.getOneRequestByClient(requestID)
    response.json(result)
})
const getAllServiceRequests = handleError(async (request, response) => {
    const result = await serviceRequests.getAllServiceRequests();
    response.json(result)
})

const updateServiceRequest = handleError(async (request, response) =>{
    const {requestID} = request.paramsl
    const {updatedFields} = request.body;
    await serviceRequests.updateServiceRequest(updatedFields, requestID);
    response.send("ok")
})

app.get("/service-requests", getAllServiceRequests);
app.post("/service-requests", multerFormParser.array("photos", 5), createServiceRequest);
app.get("/service-requests/:clientID", getServiceRequests);
app.get("/service-requests/:requestID", getOneServiceRequest);
app.put("/service-requests/:requestID", updateServiceRequest);

app.post('/users', multerFormParser.none(),addUser);
app.post("/users/login", multerFormParser.none(), logInUser); 

app.listen(process.env.APP_PORT, 
    () => {
        console.log(`I am listening on port ${process.env.APP_PORT}.`);
    }
);
