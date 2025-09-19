import { Schema,model } from "mongoose";

const AuditLogSchema=new Schema(
    {
        auditDate:{
            type:Date,
            default:Date.now,
        },
        counter:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:'Counter'
        },
        auditor:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:'User'

        },
        salesman:{
            type:Schema.Types.ObjectId,
            default:null,
            ref:'Salesman'
        },
        auditStatus:{
            type:String,
            enum: ['approved', 'disapproved','pending','audited'],
            default:'pending'
        },
        auditFile:{
            type:Schema.Types.ObjectId,
            ref:'File',
        },
        reportFile:{
            type:Schema.Types.ObjectId,
            ref:'File',
            default:null
        },
        remark:{
            type:String,
            default:''
        }
    },
    {timestamps:true}
);

const AuditLog=model('AuditLog',AuditLogSchema);

export {AuditLog};