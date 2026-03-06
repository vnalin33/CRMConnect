import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setCredentials, setError } from '../store/authSlice';

// ─── Mock API call (replace with real authService) ───
const loginApi = async (data) => {
    // Simulate network delay
    await new Promise(r => setTimeout(() => r(undefined), 1500));

    // Mock validation
    if (data.password !== 'password123') {
        throw new Error('Invalid credentials. Please try again.');
    }

    return {
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token',
        user: {
            id: 'user_001',
            name: 'User1234',
            email: data.identifier,
            mobile: '+91 XXXXX XXXXX',
            role: 'FinanceAgent',
            rating: 4.2,
            isTopPerformer: true,
        },
    };
};

export const useLogin = () => {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: loginApi,
        onSuccess: data => {
            dispatch(setCredentials(data));
        },
        onError: (error) => {
            dispatch(setError(error.message));
        },
    });
};
