import { ENV } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => {
  return await AsyncStorage.getItem('auth_token');
};

export const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const authHeadersFormData = async () => {
  const token = await getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Fetch the logged-in user's profile from the connector table
 */
export const fetchProfile = async () => {
  const headers = await authHeaders();
  const response = await fetch(`${ENV.API_URL}/connector/profile`, { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to fetch profile');
  }
  return result.data;
};

/**
 * Update personal info (name, emailid, mobilenumber, location)
 */
export const updatePersonalInfoApi = async (data) => {
  const headers = await authHeaders();
  const response = await fetch(`${ENV.API_URL}/connector/profile/info`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to update personal info');
  }
  return result.data;
};

/**
 * Update bank details (ifsc, accountnumber, branch)
 */
export const updateBankDetailsApi = async (data) => {
  const headers = await authHeaders();
  const response = await fetch(`${ENV.API_URL}/connector/profile/bank`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to update bank details');
  }
  return result.data;
};

/**
 * Change password
 */
export const changePasswordApi = async ({ oldPassword, newPassword }) => {
  const headers = await authHeaders();
  const response = await fetch(`${ENV.API_URL}/connector/profile/password`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to change password');
  }
  return result.data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePictureApi = async (imageUri) => {
  const headers = await authHeadersFormData();
  const formData = new FormData();
  
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('profilePicture', {
    uri: imageUri,
    name: filename,
    type,
  });

  const response = await fetch(`${ENV.API_URL}/connector/profile-picture`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to upload profile picture');
  }
  return result.data;
};
