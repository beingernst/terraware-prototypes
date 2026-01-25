import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@terraware.io',
    role: 'Admin',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@terraware.io',
    role: 'Project Manager',
    createdAt: '2024-02-20T14:45:00Z',
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@terraware.io',
    role: 'Field Technician',
    createdAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@terraware.io',
    role: 'Data Analyst',
    createdAt: '2024-04-05T11:20:00Z',
  },
];
