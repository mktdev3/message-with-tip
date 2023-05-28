import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    address: String,
    message: String,
    tip: Number,
    isValid: Boolean,
    isCompleted: Boolean
},
{
    toObject: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;            
        }
    },
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export const MessageModel = mongoose.models.Message || mongoose.model("Message", MessageSchema)

