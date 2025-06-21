import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
    },
    profilePicture: {
        type: String,
        default: "https://i.pinimg.com/736x/c7/e5/3b/c7e53b9868b5e924b4f7bb19993ce2d7.jpg",
    },
    ticketsOwned:[{
        type: String
    }],
    eventsCreated: [{
        type: String
    }],
}, {
    timestamps: true,   
});
const User = mongoose.model("User", UserSchema);
export default User;