// Sample Data for the App
export const DUMMY_LEADS = [
    { id: '1', name: 'Manoj Kumar', loanType: 'Home Loan', amount: '45.0L', status: 'Approved', date: '12 Jan 2026', progress: 40 },
    { id: '2', name: 'Sujith Singh Barnala', loanType: 'Buisness Loan', amount: '20.0L', status: 'New Lead', date: '14 Feb 2026', progress: 10 },
    { id: '3', name: 'Harigaran', loanType: 'Personal Loan', amount: '25.0L', status: 'Disbursement', date: '20 Jan 2026', progress: 95 },
    { id: '4', name: 'Nalin', loanType: 'Loan Against Property', amount: '30.0L', status: 'Following', date: '25 Jan 2026', progress: 40 },
    { id: '5', name: 'Vijay Singh', loanType: 'Vehicle Loan', amount: '15.0L', status: 'Rejected', date: '30 Jan 2026', progress: 40 },
    { id: '6', name: 'Priya Sharma', loanType: 'Home Loan', amount: '55.0L', status: 'Completed', date: '05 Mar 2026', progress: 100 },
    { id: '7', name: 'Arjun Reddy', loanType: 'Business Loan', amount: '35.0L', status: 'Completed', date: '28 Feb 2026', progress: 100 },
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

export const CONCERNS_DATA = [
    {
        id: '#CON-001',
        title: 'Payout Delay',
        description: 'My instant payout for February has been delayed by more than 3 business days. Please look into this urgently.',
        priority: 'High',
        status: 'In Progress',
        category: 'Payout',
        date: '27 Feb 2026',
    },
    {
        id: '#CON-002',
        title: 'Wrong Disbursement Amount',
        description: 'The disbursement amount shown for Manoj Kumar\'s Home Loan does not match the sanction letter.',
        priority: 'High',
        status: 'Pending',
        category: 'Disbursement',
        date: '25 Feb 2026',
    },
    {
        id: '#CON-003',
        title: 'Document Upload Failing',
        description: 'Unable to upload Aadhaar card for documentation. The app shows a timeout error repeatedly.',
        priority: 'Medium',
        status: 'Pending',
        category: 'Technical',
        date: '24 Feb 2026',
    },
    {
        id: '#CON-004',
        title: 'Invoice Mismatch',
        description: 'GST amount on the generated invoice does not match the expected calculation for cycle payout.',
        priority: 'Medium',
        status: 'Resolved',
        category: 'Invoice',
        date: '20 Feb 2026',
    },
    {
        id: '#CON-005',
        title: 'Profile Update Request',
        description: 'Requesting update of phone number and email address on file. Provided new details via email.',
        priority: 'Low',
        status: 'Closed',
        category: 'Account',
        date: '15 Feb 2026',
    },
    {
        id: '#CON-006',
        title: 'Commission Structure Clarification',
        description: 'Need clarification on the new commission structure for Business Loan disbursements effective March.',
        priority: 'Low',
        status: 'Resolved',
        category: 'Payout',
        date: '10 Feb 2026',
    },
];

export const CONCERN_FILTER_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];

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
