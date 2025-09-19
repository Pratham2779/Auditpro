import { Salesman } from '../models/salesman.model.js';
import { File } from '../models/file.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import fs from 'fs';
import path from 'path';
import validator from 'validator';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import cloudinary from '../configs/cloudinary/index.js';
import { DEFAULT_AVATAR } from '../constants.js';


const allowedGender = ['Male', 'Female','male','female','other','Other'];



const createSalesman = asyncHandler(async (req, res) => {
    const { fullName, email, counter, phoneNumber, gender } = req.body;


    if (![fullName, email, counter, phoneNumber, gender].every(Boolean)) {
        throw new ApiError(400, 'All fields are required!');
    }
    if (!validator.isEmail(email)) {
        throw new ApiError(400, 'Invalid email');
    }
    if (!validator.isMobilePhone(phoneNumber, 'any')) {
        throw new ApiError(400, 'Invalid phone number');
    }
    if (!allowedGender.includes(gender)) {
        throw new ApiError(400, 'Invalid gender');
    }


    const existing = await Salesman.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing) {
        if (existing.email === email) throw new ApiError(400, 'Email already in use');
        if (existing.phoneNumber === phoneNumber)
            throw new ApiError(400, 'Phone number already in use');
    }


    const salesman = await Salesman.create({ fullName, email, counter, phoneNumber, gender });


    let fileDoc;
    if (req.file?.path) {

        const uploadRes = await uploadToCloudinary(req.file.path, 'avatars');
        fileDoc = await File.create({
            uploader: req.user._id,
            original_filename: uploadRes.original_filename,
            public_id: uploadRes.public_id,
            url: uploadRes.url,
            downloadUrl: uploadRes.downloadUrl,
        });
    } else {

        fileDoc = await File.create({
            uploader: req.user._id,
            ...DEFAULT_AVATAR
        });
    }

    salesman.avatar = fileDoc._id;
    await salesman.save();

    return res
        .status(200)
        .json(new ApiResponse(200, salesman, 'Salesman created successfully'));
});



const getAllSalesman = asyncHandler(async (req, res) => {
    const { fullName, email, counter, phoneNumber, gender, search } = req.query;
    const filter = {};

    if (fullName) filter.fullName = fullName;
    if (email) filter.email = email;
    if (counter) filter.counter = counter;
    if (phoneNumber) filter.phoneNumber = phoneNumber;
    if (gender) filter.gender = gender;

    if (search) {
        const r = { $regex: search, $options: 'i' };
        filter.$or = [
            { fullName: r },
            { email: r },
            { phoneNumber: r },
            { gender: r },
            { counter: r },
        ];
    }

    const list = await Salesman.find(filter).populate('avatar','-__v');
    return res.status(200).json(new ApiResponse(200, list, 'Salesmen fetched successfully'));
});



const getSalesmanById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, 'ID missing');

    const salesman = await Salesman.findById(id).populate('avatar');
    if (!salesman) throw new ApiError(404, 'Salesman not found');

    return res.status(200).json(new ApiResponse(200, salesman, 'Salesman fetched'));
});




const updateSalesman = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const actorId = req.user._id;

    const salesman = await Salesman.findById(id);
    if (!salesman) throw new ApiError(404, `Salesman ${id} not found`);

    const { email, phoneNumber } = req.body;
    if (email || phoneNumber) {
        const conflict = await Salesman.findOne({
            $or: [
                email ? { email } : null,
                phoneNumber ? { phoneNumber } : null
            ].filter(Boolean),
            _id: { $ne: id }
        });
        if (conflict) {
            if (email && conflict.email === email)
                throw new ApiError(400, 'Email already in use');
            if (phoneNumber && conflict.phoneNumber === phoneNumber)
                throw new ApiError(400, 'Phone number already in use');
        }
    }

    if (!req.body.counterId) {
        salesman.counter = null;
    }

    for (const [k, v] of Object.entries(req.body)) {
        salesman[k] = v;
    }

    if (req.file?.path) {
        if (salesman.avatar) {
            const oldFile = await File.findById(salesman.avatar);
            if (oldFile && oldFile.public_id !== DEFAULT_AVATAR.public_id) {
                await cloudinary.uploader.destroy(oldFile.public_id);
                await File.findByIdAndDelete(oldFile._id);
            }
        }

        const uploadRes = await uploadToCloudinary(req.file.path, 'avatars');
        const newFile = await File.create({
            uploader: actorId,
            original_filename: uploadRes.original_filename,
            public_id: uploadRes.public_id,
            url: uploadRes.url,
            downloadUrl: uploadRes.downloadUrl,
        });

        salesman.avatar = newFile._id;

        //  Delete the uploaded local file after uploading to Cloudinary
        try {
            fs.unlinkSync(req.file.path); // or use await fs.promises.unlink(req.file.path);
        } catch (err) {
            console.error('Failed to delete local file:', err);
        }
    }

    await salesman.save();

    return res
        .status(200)
        .json(new ApiResponse(200, salesman, `Salesman ${id} updated`));
});





const deleteSalesman = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, 'ID missing');

    const salesman = await Salesman.findById(id);
    if (!salesman) throw new ApiError(404, 'Salesman not found');

    if (salesman.avatar) {
        const fileDoc = await File.findById(salesman.avatar);
        if (fileDoc) {


            if (fileDoc.public_id !== DEFAULT_AVATAR.public_id) {
                await cloudinary.uploader.destroy(fileDoc.public_id);
                await File.findByIdAndDelete(fileDoc._id);
            }
        }
    }

    await Salesman.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, `Salesman ${id} deleted`));
});


export {
    createSalesman,
    getAllSalesman,
    getSalesmanById,
    updateSalesman,
    deleteSalesman
}

