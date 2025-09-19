import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __dirname=typeof import.meta.dirname!=='undefined'?import.meta.dirname:dirname(__filename);

const __filename=typeof import.meta.filename!=='undefined'?import.meta.filename:fileURLToPath(import.meta.url);

export {__dirname,__filename};