import { Schema, model } from "mongoose";

const SalesmanSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        counter: {
            type: Schema.Types.ObjectId,
            ref: 'Counter',
            required: true,
        },
        avatar: {
            type: Schema.Types.ObjectId,
            ref: 'File',
            default: null
        },
        phoneNumber: {
            type: String,
            required: true,
            match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number']
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Male',
        },

    },
    { timestamps: true }
);

const Salesman = model('Salesman', SalesmanSchema);

export { Salesman };