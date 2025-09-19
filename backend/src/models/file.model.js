// import { Schema, model } from "mongoose";

// const FileSchema = new Schema(
//   {
//     uploader: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     original_filename: {
//       type: String,
//       required: true,
//     },
//     public_id: {
//       type: String,
//       required: true,
//     },
//     url: {
//       type: String,
//       required: true,
//     },
//     downloadUrl: {
//       type: String,
//     },
//     uploadedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     parsedJson: {
//       type: [{}],
//       default: [],
//     },
//     unmatchedItems:{
//       type:[{}],
//       defualt:[]
//     },
   

//   },
//   { timestamps: true }
// );

// const File = model('File', FileSchema);

// export { File };





import { Schema, model } from "mongoose";

const FileSchema = new Schema(
  {
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    original_filename: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    downloadUrl: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    parsedJson: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    // Maps for fast lookup by CPC number:
    matchedItems: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    unmatchedItems: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    missingItems: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
  },
  { timestamps: true }
);

const File = model('File', FileSchema);

export { File };
























