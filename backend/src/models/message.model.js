import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject:{
      type:String,
      default:''
    },
    content: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const Message = model('Message', MessageSchema);

export { Message };
