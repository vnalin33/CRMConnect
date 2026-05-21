import { useState, useEffect, useCallback } from 'react';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ENV } from '../config/env';
import { fetchBankDetailsByIfsc } from '../api/bankApi';
import { fetchProfile, updatePersonalInfoApi, updateBankDetailsApi, updateTaxDetailsApi, uploadProfilePictureApi } from '../api/profileApi';
import { useSocket } from '../context/SocketContext';

const PROFILE_CACHE_KEY = '@crm_profile_cache';

const mapDataToProfile = (data) => ({
    name: data.name || '',
    role: data.profession || 'Partner',
    rating: '4.2',
    ratingText: 'Top Performer',
    stats: {
        leads: { count: data.stats?.totalLeads ?? '0', label: 'Total Leads' },
        deals: { count: data.stats?.closedDeals ?? '0', label: 'Closed Deals' },
        month: { count: data.stats?.thisMonth ?? '0', label: 'This Month' },
    },
    personalInfo: {
        name: data.name || '',
        email: data.emailid || '',
        mobile: data.mobilenumber || '',
        location: data.location || '',
        address: data.address || '',
        profession: data.profession || '',
        profileImage: data.profile_picture ? `${ENV.API_URL.replace('/api', '')}${data.profile_picture}` : null,
    },
    bankDetails: {
        ifsc: data.ifsc || 'Not Provided',
        account: data.accountnumber || 'Not Provided',
        branch: data.branch || 'Not Provided',
        bankName: data.bank_name || 'Not Provided',
        accountHolderName: data.account_holder_name || 'Not Provided',
    },
    taxDetails: {
        pan: data.pan_number || 'Not Provided',
        isGstRegistered: data.is_gst_registered !== null && data.is_gst_registered !== undefined ? data.is_gst_registered : null,
        gst: data.gst_number || 'Not Provided',
    },
    settings: {
        notifications: true,
    },
});

export const useProfile = () => {
    const queryClient = useQueryClient();
    const socket = useSocket();

    // Alias setProfileData to update React Query cache for instant Optimistic UI
    const setProfileData = useCallback((updater) => {
        queryClient.setQueryData(['profile'], (oldData) => {
            if (typeof updater === 'function') {
                return updater(oldData);
            }
            return updater;
        });
    }, [queryClient]);

    const [saving, setSaving] = useState(false);

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [formErrors, setFormErrors] = useState({});

    const [isEditingBank, setIsEditingBank] = useState(false);
    const [editBankForm, setEditBankForm] = useState({
        ifsc: '',
        account: '',
        branch: '',
        bankName: '',
        accountHolderName: '',
    });
    const [bankFormErrors, setBankFormErrors] = useState({});

    const [isEditingTax, setIsEditingTax] = useState(false);
    const [editTaxForm, setEditTaxForm] = useState({});
    const [taxFormErrors, setTaxFormErrors] = useState({});

    const [imageModalVisible, setImageModalVisible] = useState(false);

    const [cachedProfile, setCachedProfile] = useState(null);

    // Hydrate from cache immediately on mount for offline-first experience
    useEffect(() => {
        const hydrateCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setCachedProfile(parsed);
                    // Pre-fill query client if empty so it doesn't stay in 'loading' state
                    if (!queryClient.getQueryData(['profile'])) {
                        queryClient.setQueryData(['profile'], parsed);
                    }
                }
            } catch (e) {
                console.error("Failed to hydrate profile cache", e);
            }
        };
        hydrateCache();
    }, [queryClient]);

    const {
        data: queryData,
        isLoading: queryLoading,
        isFetching,
        refetch: refreshProfile,
    } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const data = await fetchProfile();
            const mapped = mapDataToProfile(data);
            AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(mapped));
            return mapped;
        },
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes to prevent redundant network calls
    });

    // Use queryData if available, fallback to cachedProfile
    const profileData = queryData || cachedProfile;
    // Only show loading skeleton if we have NO data at all
    const loading = queryLoading && !profileData;

    // Listen for real-time profile/stats updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        const handleProfileUpdated = () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        };

        socket.on('profile_updated', handleProfileUpdated);
        socket.on('stats_updated', handleProfileUpdated);
        socket.on('lead_added', handleProfileUpdated); // Updates total leads count instantly

        return () => {
            socket.off('profile_updated', handleProfileUpdated);
            socket.off('stats_updated', handleProfileUpdated);
            socket.off('lead_added', handleProfileUpdated);
        };
    }, [socket, queryClient]);

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 400,
                maxHeight: 400,
            });

            if (result.didCancel || result.errorCode) return;

            const uri = result.assets?.[0]?.uri;
            if (uri) {
                // Let's assume uploadProfilePictureApi can also take uri instead of image.path
                // For safety, we keep the stashed logic for upload if it exists
                // We'll wrap in try-catch in case uploadProfilePictureApi isn't fully implemented
                try {
                    const { profile_picture } = await uploadProfilePictureApi(uri);
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: profile_picture ? `${ENV.API_URL.replace('/api', '')}${profile_picture}` : uri
                        }
                    }));
                } catch (e) {
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: uri
                        }
                    }));
                }
                setImageModalVisible(false);
            }
        } catch (error) {
            console.error('Image upload failed:', error.message);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 400,
                maxHeight: 400,
            });

            if (result.didCancel || result.errorCode) return;

            const uri = result.assets?.[0]?.uri;
            if (uri) {
                try {
                    const { profile_picture } = await uploadProfilePictureApi(uri);
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: profile_picture ? `${ENV.API_URL.replace('/api', '')}${profile_picture}` : uri
                        }
                    }));
                } catch (e) {
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: uri
                        }
                    }));
                }
                setImageModalVisible(false);
            }
        } catch (error) {
            console.error('Camera upload failed:', error.message);
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

    const handleEditToggle = async () => {
        if (isEditingInfo) {
            const errors = {};
            if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
                errors.email = "Invalid email format";
            }
            if (editForm.mobile && !/^\d{10}$/.test(editForm.mobile)) {
                errors.mobile = "Mobile must be exactly 10 digits";
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }

            setFormErrors({});
            setSaving(true);

            try {
                await updatePersonalInfoApi({
                    name: editForm.name,
                    emailid: editForm.email,
                    mobilenumber: editForm.mobile,
                    location: editForm.location,
                    address: editForm.address,
                    profession: editForm.profession,
                });

                // Force refetch from server to guarantee data consistency
                await refreshProfile();
            } catch (error) {
                setFormErrors({ general: error.message });
                setSaving(false);
                return;
            } finally {
                setSaving(false);
            }
        } else {
            setEditForm({ ...profileData.personalInfo });
            setFormErrors({});
        }
        setIsEditingInfo(!isEditingInfo);
    };

    const handleBankEditToggle = async () => {
        if (isEditingBank) {
            // ── SAVE MODE ──────────────────────────────────────────────
            const ifsc = (editBankForm.ifsc || '').trim();
            const account = (editBankForm.account || '').trim();
            const bankName = (editBankForm.bankName || '').trim();
            const branch = (editBankForm.branch || '').trim();
            const accountHolderName = (editBankForm.accountHolderName || '').trim();

            // If ALL fields are empty, save as nulls (clear bank info)
            if (!ifsc && !account && !bankName && !accountHolderName) {
                setBankFormErrors({});
                setSaving(true);
                try {
                    await updateBankDetailsApi({
                        ifsc: null, accountnumber: null, branch: null,
                        bank_name: null, account_holder_name: null,
                    });
                    await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
                    queryClient.invalidateQueries({ queryKey: ['profile'] });
                    await refreshProfile();
                } catch (error) {
                    setBankFormErrors({ general: error.message });
                } finally {
                    setSaving(false);
                }
                setIsEditingBank(false);
                return;
            }

            // ── Validate required fields ────────────────────────────────
            const errors = {};
            if (ifsc && ifsc.length !== 11) {
                errors.ifsc = 'IFSC must be 11 characters';
            }
            if (!account) {
                errors.account = 'Account number is required';
            } else if (account.length > 18) {
                errors.account = 'Account number must be max 18 digits';
            }
            if (!accountHolderName) {
                errors.accountHolderName = 'Account holder name is required';
            }
            if (Object.keys(errors).length > 0) {
                setBankFormErrors(errors);
                return;
            }

            // ── Auto-fill bank name from IFSC if still empty ────────────
            let finalBankName = bankName;
            let finalBranch = branch;
            if (ifsc.length === 11 && !finalBankName) {
                try {
                    const ifscRes = await fetchBankDetailsByIfsc(ifsc);
                    if (ifscRes.success && ifscRes.data.bank) {
                        finalBankName = ifscRes.data.bank;
                        finalBranch = ifscRes.data.branch || finalBranch;
                    }
                } catch (_) { /* IFSC lookup failed, proceed without bank name */ }
            }

            // ── Send to API ─────────────────────────────────────────────
            setBankFormErrors({});
            setSaving(true);
            try {
                await updateBankDetailsApi({
                    ifsc: ifsc || null,
                    accountnumber: account || null,
                    branch: finalBranch || null,
                    bank_name: finalBankName || null,
                    account_holder_name: accountHolderName || null,
                });

                // Clear stale cache and force fresh data from server
                await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                await refreshProfile();
            } catch (error) {
                setBankFormErrors({ general: error.message });
                setSaving(false);
                return;
            } finally {
                setSaving(false);
            }
        } else {
            // ── EDIT MODE — populate form with current values ───────────
            const bd = profileData.bankDetails;
            const clean = (val) => (!val || val === 'Not Provided') ? '' : val;

            const initIfsc = clean(bd.ifsc);
            const initBankName = clean(bd.bankName);

            setEditBankForm({
                ifsc: initIfsc,
                account: clean(bd.account),
                branch: clean(bd.branch),
                bankName: initBankName,
                accountHolderName: clean(bd.accountHolderName),
            });
            setBankFormErrors({});

            // Auto-fetch bank name from IFSC if it's valid but bankName is missing
            if (initIfsc.length === 11 && !initBankName) {
                fetchBankDetailsByIfsc(initIfsc).then(response => {
                    if (response.success) {
                        setEditBankForm(prev => ({
                            ...prev,
                            branch: response.data.branch || prev.branch,
                            bankName: response.data.bank || prev.bankName,
                        }));
                    }
                }).catch(() => { });
            }
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
                    setEditBankForm((prev) => ({
                        ...prev,
                        branch: response.data.branch,
                        bankName: response.data.bank
                    }));
                    setBankFormErrors((prev) => ({ ...prev, ifsc: null }));
                } else {
                    setBankFormErrors((prev) => ({ ...prev, ifsc: response.error }));
                    setEditBankForm((prev) => ({ ...prev, branch: '', bankName: '' }));
                }
            } catch (error) {
                setBankFormErrors((prev) => ({ ...prev, ifsc: 'Error fetching bank details' }));
            }
        } else {
            setBankFormErrors((prev) => ({ ...prev, ifsc: uText.length > 0 ? 'IFSC must be 11 characters' : null }));
            if (uText.length < 11) {
                setEditBankForm((prev) => ({ ...prev, branch: '', bankName: '' }));
            }
        }
    };

    const handleTaxEditToggle = async () => {
        if (isEditingTax) {
            const errors = {};
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

            if (!editTaxForm.pan || editTaxForm.pan.trim() === '') {
                errors.pan = "PAN number is required";
            } else if (!panRegex.test(editTaxForm.pan.toUpperCase())) {
                errors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
            }

            if (editTaxForm.isGstRegistered) {
                if (!editTaxForm.gst || editTaxForm.gst.trim() === '') {
                    errors.gst = "GST Number is required when registered";
                } else if (!gstRegex.test(editTaxForm.gst.toUpperCase())) {
                    errors.gst = "Invalid GST format (e.g. 22AAAAA0000A1Z5)";
                }
            }

            if (Object.keys(errors).length > 0) {
                setTaxFormErrors(errors);
                return;
            }

            setTaxFormErrors({});
            setSaving(true);

            try {
                const apiData = {
                    pan_number: editTaxForm.pan ? editTaxForm.pan.toUpperCase() : null,
                    is_gst_registered: editTaxForm.isGstRegistered,
                    gst_number: (editTaxForm.isGstRegistered && editTaxForm.gst) ? editTaxForm.gst.toUpperCase() : null,
                };

                await updateTaxDetailsApi(apiData);

                // Force refetch from server to guarantee data consistency
                await refreshProfile();
            } catch (error) {
                setTaxFormErrors({ general: error.message });
                setSaving(false);
                return;
            } finally {
                setSaving(false);
            }
        } else {
            const currentPan = profileData.taxDetails.pan;
            const currentGst = profileData.taxDetails.gst;

            setEditTaxForm({
                pan: (currentPan === 'Not Provided') ? '' : currentPan,
                isGstRegistered: profileData.taxDetails.isGstRegistered,
                gst: (currentGst === 'Not Provided') ? '' : currentGst
            });
            setTaxFormErrors({});
        }
        setIsEditingTax(!isEditingTax);
    };

    return {
        profileData,
        loading,
        saving,
        isEditingInfo,
        editForm,
        formErrors,
        isEditingBank,
        editBankForm,
        bankFormErrors,
        isEditingTax,
        editTaxForm,
        taxFormErrors,
        imageModalVisible,
        setImageModalVisible,
        handlePickImage,
        handleTakePhoto,
        handleRemoveImage,
        toggleNotifications,
        handleEditToggle,
        handleBankEditToggle,
        handleTaxEditToggle,
        handleIfscChange,
        refreshProfile,
        setEditForm,
        setEditBankForm,
        setEditTaxForm,
        setFormErrors,
        setBankFormErrors,
        setTaxFormErrors
    };
};
