/**
 * Download & Link resolution utility for Hand Notes & Academic Resources
 */

export function resolveDownloadUrl(rawUrl: string): { downloadUrl: string; previewUrl: string; isGoogleDrive: boolean } {
  if (!rawUrl) {
    return { downloadUrl: '', previewUrl: '', isGoogleDrive: false };
  }

  const trimmed = rawUrl.trim();

  // Check Google Drive
  const gDriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return {
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      previewUrl: `https://drive.google.com/file/d/${fileId}/view`,
      isGoogleDrive: true,
    };
  }

  // Check Dropbox
  if (trimmed.includes('dropbox.com')) {
    const dlUrl = trimmed.replace(/[?&]dl=0/, '') + (trimmed.includes('?') ? '&dl=1' : '?dl=1');
    return {
      downloadUrl: dlUrl,
      previewUrl: trimmed,
      isGoogleDrive: false,
    };
  }

  // Generic OneDrive / Direct Link
  return {
    downloadUrl: trimmed,
    previewUrl: trimmed,
    isGoogleDrive: false,
  };
}

/**
 * Triggers safe download or opens in new tab
 */
export function triggerDownload(url: string, filename?: string) {
  const { downloadUrl } = resolveDownloadUrl(url);
  if (!downloadUrl) return;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (filename) {
    link.setAttribute('download', filename);
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
