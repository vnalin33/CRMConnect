// Sample Data for the App
export const DUMMY_LEADS = [
    { id: '1', name: 'Manoj Kumar', loanType: 'Home Loan', amount: '45.0L', status: 'Approved', date: '12 Jan 2026', progress: 40 },
    { id: '2', name: 'Sujith Singh Barnala', loanType: 'Buisness Loan', amount: '20.0L', status: 'New Lead', date: '14 Feb 2026', progress: 10 },
    { id: '3', name: 'Harigaran', loanType: 'Personal Loan', amount: '25.0L', status: 'Disbursement', date: '20 Jan 2026', progress: 95 },
    { id: '4', name: 'Nalin', loanType: 'Loan Against Property', amount: '30.0L', status: 'Following', date: '25 Jan 2026', progress: 40 },
    { id: '5', name: 'Vijay Singh', loanType: 'Vehicle Loan', amount: '15.0L', status: 'Rejected', date: '30 Jan 2026', progress: 40 },
];

export const LOAN_TYPES = [
    'Home Loan',
    'Personal Loan',
    'Loan Against Property',
    'Business Loan',
];

export const EMPLOYMENT_TYPES = [
    'Salaried',
    'Self Employed',
    'Business Owner',
];

export const PROFILE_MOCK_DATA = {
    name: "User1234",
    role: "Finance Agent",
    rating: "4.2",
    ratingText: "Top Performer",
    stats: {
        leads: { count: '14', label: 'Total Leads' },
        deals: { count: '42', label: 'Closed Deals' },
        month: { count: '17', label: 'This Month' },
    },
    personalInfo: {
        name: "User1234",
        email: "user1234@gmail.com",
        mobile: "9876543210",
        location: "Mumbai, India",
        profileImage: null,
    },
    bankDetails: {
        ifsc: "Not Provided",
        account: "Not Provided",
        branch: "Not Provided"
    },
    settings: {
        notifications: true,
    }
};
