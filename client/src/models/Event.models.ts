import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    eventId:{
        type: Number,
        required: true,
        unique: true
    },
    tokenUrl:{
        type: String,
        required: true,
    },
    hash:{
        type: String,
        required: true,
    },
    organizer:{
        type: String,
        required: true,
    },
    chainId:{
        type: String,
        required: true,
    },
    ticketPrice:{
        type: String,
        required: true,
    },
    approved:{
        type: Boolean,
        default: false,
    }
})

const Event = mongoose.models.Event ||  mongoose.model("Event", eventSchema);
export default Event;