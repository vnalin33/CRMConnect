import api from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Legacy helpers (kept for backward-compatibility if any file still imports them) ──

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

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Fetch the logged-in user's profile from the connector table
 */
export const fetchProfile = async () => {
  const result = await api.get('/connector/profile');
  return result.data;
};

/**
 * Update personal info (name, emailid, mobilenumber, location)
 */
export const updatePersonalInfoApi = async (data) => {
  const result = await api.put('/connector/profile/info', data);
  return result.data;
};

/**
 * Update bank details (ifsc, accountnumber, branch)
 */
export const updateBankDetailsApi = async (data) => {
  const result = await api.put('/connector/profile/bank', data);
  return result.data;
};

/**
 * Update tax details (pan_number, is_gst_registered, gst_number)
 */
export const updateTaxDetailsApi = async (data) => {
  const result = await api.put('/connector/profile/tax', data);
  return result.data;
};

/**
 * Change password
 */
export const changePasswordApi = async ({ oldPassword, newPassword }) => {
  const result = await api.put('/connector/profile/password', {
    oldPassword,
    newPassword,
  });
  return result.data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePictureApi = async (imageUri) => {
  const formData = new FormData();

  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image';

  formData.append('profilePicture', {
    uri: imageUri,
    name: filename,
    type,
  });

  const result = await api.upload('/connector/profile-picture', formData);
  return result.data;
};
