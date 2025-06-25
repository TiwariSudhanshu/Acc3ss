import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string;
  email: string;
  walletAddress: string;
  profilePicture: string;
  ticketsOwned: string[];
  eventsCreated: string[];
  isLoggedIn: boolean;
}

const initialState: UserState = {
  name: "",
  email: "",
  walletAddress: "",
  profilePicture:
    "https://i.pinimg.com/736x/c7/e5/3b/c7e53b9868b5e924b4f7bb19993ce2d7.jpg",
  ticketsOwned: [],
  eventsCreated: [],
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, "isLoggedIn">>) {
      return { ...action.payload, isLoggedIn: true };
    },
    logout(state) {
      return { ...initialState };
    },
    updateTickets(state, action: PayloadAction<string[]>) {
      state.ticketsOwned = action.payload;
    },
    updateEvents(state, action: PayloadAction<string[]>) {
      state.eventsCreated = action.payload;
    },
    updateProfilePicture(state, action: PayloadAction<string>) {
      state.profilePicture = action.payload;
    },
    updateUserDetails(
      state,
      action: PayloadAction<{ name: string; email: string }>
    ) {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    addTicketOwned(state, action: PayloadAction<string>) {
      if (!state.ticketsOwned.includes(action.payload)) {
        state.ticketsOwned.push(action.payload);
      }
    },
    addEventCreated(state, action: PayloadAction<string>) {
      if (!state.eventsCreated.includes(action.payload)) {
        state.eventsCreated.push(action.payload);
      }
    },
  },
});

export const {
  setUser,
  logout,
  updateTickets,
  updateEvents,
  updateProfilePicture,
  updateUserDetails,
  addTicketOwned,
  addEventCreated,
} = userSlice.actions;

export default userSlice.reducer;
