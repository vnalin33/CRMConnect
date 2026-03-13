import { useState, useEffect } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import { fetchBankDetailsByIfsc } from '../api/bankApi';
import { PROFILE_MOCK_DATA } from '../api/mockData';

const fetchProfileData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(PROFILE_MOCK_DATA);
        }, 1200);
    });
};

export const useProfile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [formErrors, setFormErrors] = useState({});

    const [isEditingBank, setIsEditingBank] = useState(false);
    const [editBankForm, setEditBankForm] = useState({});
    const [bankFormErrors, setBankFormErrors] = useState({});

    const [imageModalVisible, setImageModalVisible] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                const data = await fetchProfileData();
                if (isMounted) setProfileData(data);
            } catch (error) {
                // Silently handle or use a professional error reporting service
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const handlePickImage = async () => {
        try {
            const image = await ImagePicker.openPicker({
                width: 400,
                height: 400,
                cropping: true,
                cropperCircleOverlay: true,
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });

            setProfileData(prev => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    profileImage: image.path
                }
            }));
            setImageModalVisible(false);
        } catch (error) {
            // Handle picker cancellation or other errors professionally
        }
    };

    const handleTakePhoto = async () => {
        try {
            const image = await ImagePicker.openCamera({
                width: 400,
                height: 400,
                cropping: true,
                cropperCircleOverlay: true,
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });

            setProfileData(prev => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    profileImage: image.path
                }
            }));
            setImageModalVisible(false);
        } catch (error) {
            // Handle camera errors professionally
        }
    };

    const handleRemoveImage = () => {
        setProfileData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                profileImage: null
            }
        }));
        setImageModalVisible(false);
    };

    const toggleNotifications = () => {
        if (!profileData) return;
        setProfileData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                notifications: !prev.settings.notifications
            }
        }));
    };

    const handleEditToggle = () => {
        if (isEditingInfo) {
            const errors = {};
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
                errors.email = "Invalid email format";
            }
            if (!/^\d{10}$/.test(editForm.mobile)) {
                errors.mobile = "Mobile must be exactly 10 digits";
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }

            setFormErrors({});
            setProfileData(prev => ({
                ...prev,
                personalInfo: { ...editForm },
                name: editForm.name
            }));
        } else {
            setEditForm({ ...profileData.personalInfo });
            setFormErrors({});
        }
        setIsEditingInfo(!isEditingInfo);
    };

    const handleBankEditToggle = () => {
        if (isEditingBank) {
            const isIfscEmpty = !editBankForm.ifsc || editBankForm.ifsc.trim() === '';
            const isAccountEmpty = !editBankForm.account || editBankForm.account.trim() === '';

            let finalBankDetails = { ...editBankForm };

            if (isIfscEmpty && isAccountEmpty) {
                finalBankDetails = {
                    ifsc: "Not Provided",
                    account: "Not Provided",
                    branch: "Not Provided"
                };
            } else {
                const errors = {};
                if (!editBankForm.ifsc || editBankForm.ifsc.length !== 11) {
                    errors.ifsc = "IFSC must be 11 characters";
                }
                if (!editBankForm.account || editBankForm.account.trim().length === 0) {
                    errors.account = "Account number is required";
                } else if (editBankForm.account.length > 18) {
                    errors.account = "Account number must be max 18 digits";
                }

                if (Object.keys(errors).length > 0) {
                    setBankFormErrors(errors);
                    return;
                }
            }

            setBankFormErrors({});
            setProfileData(prev => ({
                ...prev,
                bankDetails: finalBankDetails
            }));
        } else {
            const currentIfsc = profileData.bankDetails.ifsc;
            const currentAccount = profileData.bankDetails.account;
            const currentBranch = profileData.bankDetails.branch;

            setEditBankForm({
                ifsc: (currentIfsc === 'Not Provided') ? '' : currentIfsc,
                account: (currentAccount === 'Not Provided') ? '' : currentAccount,
                branch: (currentBranch === 'Not Provided') ? '' : currentBranch
            });
            setBankFormErrors({});
        }
        setIsEditingBank(!isEditingBank);
    };

    const handleIfscChange = async (text) => {
        const uText = text.toUpperCase();
        setEditBankForm((prev) => ({ ...prev, ifsc: uText }));
        if (uText.length === 11) {
            try {
                const response = await fetchBankDetailsByIfsc(uText);
                if (response.success) {
                    setEditBankForm((prev) => ({ ...prev, branch: response.data.branch }));
                    setBankFormErrors((prev) => ({ ...prev, ifsc: null }));
                } else {
                    setBankFormErrors((prev) => ({ ...prev, ifsc: response.error }));
                    setEditBankForm((prev) => ({ ...prev, branch: '' }));
                }
            } catch (error) {
                setBankFormErrors((prev) => ({ ...prev, ifsc: 'Error fetching branch' }));
            }
        } else {
            setBankFormErrors((prev) => ({ ...prev, ifsc: uText.length > 0 ? 'IFSC must be 11 characters' : null }));
            if (uText.length < 11) {
                setEditBankForm((prev) => ({ ...prev, branch: '' }));
            }
        }
    };

    return {
        profileData,
        loading,
        isEditingInfo,
        editForm,
        formErrors,
        isEditingBank,
        editBankForm,
        bankFormErrors,
        imageModalVisible,
        setImageModalVisible,
        handlePickImage,
        handleTakePhoto,
        handleRemoveImage,
        toggleNotifications,
        handleEditToggle,
        handleBankEditToggle,
        handleIfscChange,
        setEditForm,
        setEditBankForm,
        setFormErrors,
        setBankFormErrors
    };
};
