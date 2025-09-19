
import dotenv from 'dotenv';
dotenv.config();

const PROJECT_NAME = process.env.APP_NAME;

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_CLUSTER}.mongodb.net/${process.env.APP_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

const CLOUDINARY_URL = `cloudinary://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_SECRET}@${process.env.CLOUDINARY_CLOUD_NAME}`;

const DEFAULT_AVATAR = {
    original_filename: '1751965464974-defaultUser',
    public_id: 'avatar/ptjst6n6nhogen2cj1ib',
    url: 'https://res.cloudinary.com/centralstore/image/upload/v1751965469/avatar/ptjst6n6nhogen2cj1ib.jpg',
    downloadUrl: 'https://res.cloudinary.com/centralstore/image/upload/fl_attachment:1751965464974-defaultUser/v1751965469/avatar/ptjst6n6nhogen2cj1ib?_a=BAMAK+eA0',
};

export {
    PROJECT_NAME,
    MONGODB_URI,
    CLOUDINARY_URL,
    DEFAULT_AVATAR
}
