import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { PortalSettings } from '../types';

const defaultSettings: PortalSettings = {
  appName: 'Botany Web Portal',
  aboutText: 'Botany Web Portal has been developed to help honors students easily find and reference syllabus books, plant taxonomies, and digital lecture notes. Our repository ensures continuous secure access to core plant science literature.',
  contactText: 'If you want any specific books added to our syllabus bookshelves or if you encounter issues during loading, submit a message directly below.',
  contactEmail: 'mahfujar003@gmail.com',
  contactPhone: '+880 1700-000000',
  contactAddress: 'Department of Botany, National University',
  developerPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=400&h=400&q=80',
  developerName: 'Professor Mahfujur Rahman',
  developerTitle: 'Lead Department Curator & Chief Developer',
  developerDescription: 'Empowering honors research scholars by modernizing access to botany literature and botanical mapping databases.',
  aboutDetailed: 'Prof. Mahfujur Rahman is a visionary botany academician and systems engineer. Combining rigorous academic botanical standards with modern cloud-enabled architectures, this portal eliminates barriers to literature. Key plant phylum classifications, cytogenetic manuals, plant tissue culture logs, and environmental research are cataloged in real-time for immediate download.',
  adminWhatsApp: '+880 1700-000000',
  developerFacebook: 'https://facebook.com',
};

const SettingsContext = createContext<{ settings: PortalSettings; loading: boolean }>({
  settings: defaultSettings,
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PortalSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realtime listener for the general portal configuration settings
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          appName: data.appName || defaultSettings.appName,
          aboutText: data.aboutText || defaultSettings.aboutText,
          contactText: data.contactText || defaultSettings.contactText,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          contactAddress: data.contactAddress || defaultSettings.contactAddress,
          developerPhotoUrl: data.developerPhotoUrl || defaultSettings.developerPhotoUrl,
          developerName: data.developerName || defaultSettings.developerName,
          developerTitle: data.developerTitle || defaultSettings.developerTitle,
          developerDescription: data.developerDescription || defaultSettings.developerDescription,
          aboutDetailed: data.aboutDetailed || defaultSettings.aboutDetailed,
          adminWhatsApp: data.adminWhatsApp || defaultSettings.adminWhatsApp,
          developerFacebook: data.developerFacebook || defaultSettings.developerFacebook,
        });
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Using default portal configuration due to loading issue:", error);
      setSettings(defaultSettings);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
