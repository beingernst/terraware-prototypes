/**
 * Common type definitions for prototypes
 */

export interface BaseEntity {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role?: string;
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'Active' | 'Planning' | 'Completed' | 'On Hold';
  organization?: string;
}

export type Status = 'pending' | 'active' | 'completed' | 'error';
