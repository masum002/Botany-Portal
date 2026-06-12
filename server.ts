import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Initialize Firebase client in node specifically for PDF lookup
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const app = express();
const PORT = 3000;

app.use(express.json());

/**
 * Follow redirects for OneDrive short links (e.g. 1drv.ms)
 */
async function resolveFinalUrl(url: string): Promise<string> {
  let currentUrl = url;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(currentUrl, { method: "HEAD", redirect: "manual" });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (location) {
          currentUrl = new URL(location, currentUrl).toString();
          continue;
        }
      }
      break;
    } catch (e) {
      // Fallback if HEAD fails
      break;
    }
  }
  return currentUrl;
}

/**
 * Convert standard sharing OneDrive link to direct raw download link
 */
function getOneDriveDirectLink(url: string): string {
  // Convert redir/embed formats
  if (url.includes("onedrive.live.com/redir") || url.includes("onedrive.live.com/embed")) {
    return url.replace("/redir", "/download").replace("/embed", "/download");
  }
  
  // Convert standard live links that need download parameters
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("onedrive.live.com") || parsed.hostname.includes("livefilestore.com")) {
      if (!parsed.searchParams.has("download")) {
        parsed.searchParams.set("download", "1");
      }
      return parsed.toString();
    }
  } catch (e) {
    // Ignore invalid url parser exceptions
  }
  
  return url;
}

// -------------------------------------------------------------
// Secure API Proxy for masked PDF Streaming
// -------------------------------------------------------------
app.get("/api/pdf/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Fetch original OneDrive location from secure Firestore
    const bookRef = doc(db, "books", bookId);
    const bookDoc = await getDoc(bookRef);
    
    if (!bookDoc.exists()) {
      return res.status(404).send("Textbook details not found.");
    }
    
    const bookData = bookDoc.data();
    const originalLink = bookData.oneDriveLink;
    
    if (!originalLink) {
      return res.status(400).send("Textbook is missing its secure resource pointer.");
    }
    
    // Resolve any shortener / redirect layers
    const expandedUrl = await resolveFinalUrl(originalLink);
    // Format OneDrive parameters into a clean direct file stream
    const directDownloadUrl = getOneDriveDirectLink(expandedUrl);
    
    console.log(`[PDF Proxy] Stream requested for ID ${bookId}`);
    
    // Fetch file from OneDrive server-side
    const fileRes = await fetch(directDownloadUrl);
    if (!fileRes.ok) {
      throw new Error(`OneDrive responded with status code ${fileRes.status}`);
    }
    
    // Mask origin server by delivering clean relative stream types
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="textbook-${bookId}.pdf"`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error: any) {
    console.error("[PDF Proxy Error]:", error);
    res.status(500).send(`Botany Honors secure proxy failed: ${error.message || error}`);
  }
});

// Vite middleware / environment serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA Fallback for client routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Botany Honors Web Application] Running server at http://localhost:${PORT}`);
  });
}

start();
