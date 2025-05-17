// User interfaces
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'applicant' | 'admin';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

// Program interfaces
export interface Program {
    id: string;
    name: string;
    description: string;
    requirements: string[];
    duration: string;
    deadline: string;
    isActive: boolean;
}

// Application interfaces
export interface Application {
    id: string;
    applicant: User;
    program: Program;
    status: 'pending' | 'under-review' | 'accepted' | 'rejected';
    submissionDate: string;
    lastUpdated: string;
    notes: ApplicationNote[];
}

export interface ApplicationNote {
    content: string;
    author: User;
    date: string;
}

// Document interfaces
export interface Document {
    id: string;
    application: string;
    name: string;
    type: string;
    path: string;
    uploadDate: string;
    status: 'pending' | 'verified' | 'rejected';
}
