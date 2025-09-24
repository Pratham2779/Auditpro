import { hash } from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { File } from '../models/file.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import validator from 'validator'
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import cloudinary from '../configs/cloudinary/index.js';
import { DEFAULT_AVATAR } from '../constants.js';



const allowedRoles = ['admin', 'auditor'];
const allowedGender = ['Male', 'Female','male','female','other','Other'];


const createUser = asyncHandler(async (req, res) => {

    const { fullName, email, password, role, phoneNumber, gender } = req.body;

    if (!fullName || !email || !password || !role || !phoneNumber || !gender) {
        throw new ApiError(400, 'All fields are required');
    }
    if (!validator.isEmail(email)) {
        throw new ApiError(400, 'Invalid email format');
    }
    if (!validator.isMobilePhone(phoneNumber, 'any')) {
        throw new ApiError(400, 'Invalid phone number');
    }
    if (!allowedRoles.includes(role.toLowerCase())) {
        throw new ApiError(400, 'Invalid role');
    }
    
    if (!allowedGender.includes(gender.trim(' '))) {
        throw new ApiError(400, 'Invalid gender');
    }


    const existing = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing) {
        if (existing.email === email) throw new ApiError(400, 'Email already in use');
        if (existing.phoneNumber === phoneNumber)
            throw new ApiError(400, 'Phone number already in use');
    }


    let avatarFileDoc;
    if (req.file?.path) {

        try {
            const uploadRes = await uploadToCloudinary(req.file.path, 'avatars');
            avatarFileDoc = await File.create({
                uploader: req.user._id,
                original_filename: uploadRes.original_filename,
                public_id: uploadRes.public_id,
                url: uploadRes.url,
                downloadUrl: uploadRes.downloadUrl,
            });
        } catch (err) {
            throw new ApiError(500, `Avatar upload failed: ${err.message}`);
        }
    } else {

        avatarFileDoc = await File.create({
            uploader: req.user._id,
            ...DEFAULT_AVATAR
        });
    }


    const hashed = await hash(password, 10);
    const user = await User.create({
        fullName,
        email,
        password: hashed,
        role,
        phoneNumber,
        gender,
        avatar: avatarFileDoc._id,
    });
    if (!user) {
        throw new ApiError(500, 'Failed to create new User');
    }


    return res
        .status(200)
        .json(new ApiResponse(200, user, 'User created successfully!'));
});





const getAllUsers = asyncHandler(async (req, res) => {
    const { role, fullName, email, gender, phoneNumber, search } = req.query;


    const filter = {};
    if (role) filter.role = role;
    if (fullName) filter.fullName = fullName;
    if (email) filter.email = email;
    if (gender) filter.gender = gender;
    if (phoneNumber) filter.phoneNumber = phoneNumber;

    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
            { gender: { $regex: search, $options: 'i' } },
            { role: { $regex: search, $options: 'i' } }
        ];
    }


    const users = await User.find(filter)
        .select("-password -refreshToken -createdAt -updatedAt -otpExpiry -otp")
        .populate('avatar');


    return res.status(200).json(
        new ApiResponse(
            200,
            users,
            "Users fetched successfully"
        )
    );
});




const getUserById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'id missing in params');
    }

    const user = await User.findById(id).select('-password');


    if (!user) {
        throw new ApiError(400, 'User not found');
    }

    return res.status(200).json(new ApiResponse(200, user, 'User found'));

});






const updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const actorId = req.user._id;

    if (req.user.role.toLowerCase() === 'auditor' && userId !== String(actorId)) {
        throw new ApiError(403, 'Access denied: unauthorised');
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, `User ${userId} not found`);

    const { email, phoneNumber } = req.body;
    if (email || phoneNumber) {
        const conflict = await User.findOne({
            $or: [
                email ? { email } : null,
                phoneNumber ? { phoneNumber } : null
            ].filter(Boolean),
            _id: { $ne: userId }
        });

        if (conflict) {
            if (email && conflict.email === email) throw new ApiError(400, 'Email already in use');
            if (phoneNumber && conflict.phoneNumber === phoneNumber) throw new ApiError(400, 'Phone number already in use');
        }
    }

    for (const [key, value] of Object.entries(req.body)) {
        if (key === 'password') {
            user.password = await hash(value, 10);
        } else {
            user[key] = value;
        }
    }

    if (req.file?.path) {
        if (user?.avatar) {
            const oldFile = await File.findById(user?.avatar);

            if (oldFile && oldFile?.public_id !== DEFAULT_AVATAR.public_id) {
                await cloudinary.uploader.destroy(oldFile?.public_id);
               
            }
             await File.findByIdAndDelete(oldFile?._id);
        }

        const uploadRes = await uploadToCloudinary(req.file.path, 'avatars');

        const newFile = await File.create({
            uploader: actorId,
            original_filename: uploadRes.original_filename,
            public_id: uploadRes.public_id,
            url: uploadRes.url,
            downloadUrl: uploadRes.downloadUrl,
        });

        user.avatar = newFile._id;
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user, `User ${userId} updated successfully`)
    );
});



const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    if (!userId) throw new ApiError(400, 'User ID is required');

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (user.avatar) {
        const fileDoc = await File.findById(user.avatar);

        if (fileDoc && fileDoc.public_id !== DEFAULT_AVATAR.public_id) {
            await cloudinary.uploader.destroy(fileDoc.public_id);
        }
        await File.findByIdAndDelete(fileDoc._id);
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, {}, `User ${userId} deleted successfully`)
    );
});


export {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}



