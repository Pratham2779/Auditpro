import { Schema, model } from "mongoose";

const UserSchema = new Schema(
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
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'auditor'],
            default: 'auditor',
            required: true,
        },
        avatar: {
            type: Schema.Types.ObjectId,
            ref: 'File',  // link to File model
            default: null
        },
        phoneNumber: {
            type: String,
            required: true,
            match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number']
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other','male','female','other'],
            default: 'Male',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        otp: {
            type: String,
            default: null,
        },
        
        otpExpiry: {
            type: Date,
            default: Date.now
        },

        refreshToken: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const User = model('User', UserSchema);

export { User };