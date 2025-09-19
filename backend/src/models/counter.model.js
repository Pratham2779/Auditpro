import { Schema,model } from "mongoose";

const CounterSchema=new Schema(
    {
        name:{
            type:String,
            required:true,
        },
        counterNumber:{
            type:Number,
            required:true,
        },
        location:{
            type:String,
            default:''
        }

    }
);

const Counter=model('Counter',CounterSchema);

export {Counter};