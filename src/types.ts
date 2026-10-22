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
  developerPhotoUrl: string;
  developerName: string;
  developerTitle: string;
  developerDescription: string;
  aboutDetailed: string;
  adminWhatsApp: string;
  developerFacebook: string;
}

export interface HandNote {
  id: string;
  title: string;
  subject: string; // e.g. "Plant Physiology", "Cytology & Cytogenetics", "Genetics & Molecular Biology", etc.
  year: '1st-year' | '2nd-year' | '3rd-year' | '4th-year';
  fileUrl: string; // Google Drive / OneDrive / direct PDF link
  authorName?: string; // Contributor / Student / Teacher name
  description?: string;
  downloadsCount?: number;
  coverUrl?: string;
  fileSize?: string;
  createdAt?: any; // Firestore Timestamp
}

