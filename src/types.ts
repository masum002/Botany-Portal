/**
 * Types and interfaces for the Botany Honors Educational Application
 */

export interface Book {
  id: string;
  title: string;
  year: '1st-year' | '2nd-year' | '3rd-year' | '4th-year';
  oneDriveLink: string;
  coverUrl?: string;
  createdAt?: any; // Firestore Timestamp
}

export interface ContactQuery {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

export interface PortalSettings {
  appName: string;
  aboutText: string;
  contactText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

