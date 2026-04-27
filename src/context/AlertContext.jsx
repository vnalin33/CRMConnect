import React, { createContext, useContext, useState, useCallback } from 'react';
import AppStatusModal from '../components/common/AppStatusModal';

const AlertContext = createContext({
    showAlert: (config) => {},
    hideAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        type: 'success',
        title: '',
        message: '',
        onClose: null,
        onConfirm: null,
        buttonText: 'Continue',
        cancelText: 'Cancel',
        showConfirm: false,
    });

    const showAlert = useCallback(({ 
        type = 'success', 
        title, 
        message, 
        onClose, 
        onConfirm, 
        buttonText = 'Continue', 
        cancelText = 'Cancel', 
        showConfirm = false 
    }) => {
        setAlertConfig({
            visible: true,
            type,
            title,
            message,
            onClose,
            onConfirm,
            buttonText,
            cancelText,
            showConfirm,
        });
    }, []);

    const hideAlert = useCallback(() => {
        if (alertConfig.onClose) {
            alertConfig.onClose();
        }
        setAlertConfig(prev => ({ ...prev, visible: false }));
    }, [alertConfig]);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <AppStatusModal
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                buttonText={alertConfig.buttonText}
                cancelText={alertConfig.cancelText}
                showConfirm={alertConfig.showConfirm}
                onConfirm={alertConfig.onConfirm}
                onClose={hideAlert}
            />
        </AlertContext.Provider>
    );
};
