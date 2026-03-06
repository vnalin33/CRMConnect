import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            state.error = null;
        },
        updateToken: (state, action) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
        },
        updateUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        logout: () => initialState,
    },
});

export const {
    setCredentials, updateToken, updateUser,
    setLoading, setError, logout,
} = authSlice.actions;

export default authSlice.reducer;
