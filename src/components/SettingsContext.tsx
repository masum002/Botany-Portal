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
