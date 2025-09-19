import mongoose from 'mongoose';
import { MONGODB_URI } from '../../constants.js';

const connectDB=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`${MONGODB_URI}/${process.env.MONGODB_NAME}`);

        console.log(`\nMongoDB connection successful Host : [${connectionInstance.connection.host}\n`);

    }
    catch(error){
        console.error("MongoDB connection failed",error);
        process.exit(1);
    }
}

export {connectDB};
