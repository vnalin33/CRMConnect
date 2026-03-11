/**
 * Service for fetching Bank details
 */

const IFSC_API_URL = 'https://ifsc.razorpay.com';

export const fetchBankDetailsByIfsc = async (ifscCode) => {
    try {
        const response = await fetch(`${IFSC_API_URL}/${ifscCode}`);
        if (!response.ok) {
            return {
                success: false,
                error: 'Invalid IFSC Code'
            };
        }
        
        const data = await response.json();
        return {
            success: true,
            data: {
                branch: `${data.BRANCH}, ${data.CITY}`,
                bank: data.BANK,
                state: data.STATE,
                district: data.DISTRICT
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'Network error or unable to fetch branch details'
        };
    }
};
