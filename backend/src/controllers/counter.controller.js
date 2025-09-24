import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Counter } from "../models/counter.model.js";


const getAllCounter=asyncHandler(async(req,res)=>{
     const Allcounter=await Counter.find({});
     if(!Allcounter){
        throw new ApiError(400,"fetching all counters failed");
     }
     return res.status(200).json(new ApiResponse(201,Allcounter,'success'));
});


const getCounterById=asyncHandler(async(req,res)=>{

    const id=req?.params?.id;
     const counter=await Counter.findById(id);

     if(!counter){
        throw new ApiError(400,'counter does not exist');
     }

     return res.status(200).json(new ApiResponse(200,counter,'counter found'));

});


const createCounter = asyncHandler(async (req, res) => {
    const { name, counterNumber, location } = req.body;

    if (!name || !counterNumber || !location) {
        throw new ApiError(400, 'All fields are required!');
    }

    // Check for duplicate name
    const existingByName = await Counter.findOne({ name });
    if (existingByName) {
        throw new ApiError(400, 'Counter with this name already exists');
    }

    // Check for duplicate counter number
    const existingByNumber = await Counter.findOne({ counterNumber: Number(counterNumber) });
    if (existingByNumber) {
        throw new ApiError(400, 'Counter number already in use');
    }

    // Check for duplicate location
    const existingByLocation = await Counter.findOne({ location });
    if (existingByLocation) {
        throw new ApiError(400, 'Counter with this location already exists');
    }

    const newCounter = await Counter.create({
        name,
        counterNumber: Number(counterNumber),
        location,
    });

    if (!newCounter) {
        throw new ApiError(400, 'Counter creation failed');
    }

    return res.status(200).json(new ApiResponse(200, newCounter, 'Counter created successfully!'));
});


const updateCounter = asyncHandler(async (req, res) => {
    const counterId = req?.params?.id;
    const { name, counterNumber, location } = req.body;

    const counter = await Counter.findById(counterId);
    if (!counter) {
        throw new ApiError(400, 'Counter to be updated not found!');
    }

    // Check duplicate name (excluding current counter)
    if (name) {
        const existingName = await Counter.findOne({ name, _id: { $ne: counterId } });
        if (existingName) {
            throw new ApiError(400, 'Counter with this name already exists');
        }
        counter.name = name;
    }

    // Check duplicate counterNumber
    if (counterNumber) {
        const existingNumber = await Counter.findOne({ counterNumber, _id: { $ne: counterId } });
        if (existingNumber) {
            throw new ApiError(400, 'Counter with this number already exists');
        }
        counter.counterNumber = counterNumber;
    }

    // Check duplicate location
    if (location) {
        const existingLocation = await Counter.findOne({ location, _id: { $ne: counterId } });
        if (existingLocation) {
            throw new ApiError(400, 'Counter with this location already exists');
        }
        counter.location = location;
    }

    await counter.save();

    return res.status(200).json(new ApiResponse(200, counter, 'Counter updated successfully'));
});




const deleteCounter=asyncHandler(async(req,res)=>{

    const counterId=req?.params?.id;
    

    const counter=await Counter.findByIdAndDelete(counterId);

    const isDeleted=await Counter.findById(counterId);
    if(isDeleted){
        throw new ApiError(400,'Failed to delete counter');
    }
    return res.status(200).json(new ApiResponse(200,{},'Counter deleted successfully!'));

});



export {
    getCounterById,
    getAllCounter,
    createCounter,
    updateCounter,
    deleteCounter
}

