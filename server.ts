import express from "express";
import path from "path";
import fs from "fs";
import http from "http";
import https from "https";
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
 * Helper to fetch headers/location via native Node http/https without downloading the body
 */
function getRedirectUrl(urlStr: string, method: "HEAD" | "GET"): Promise<{ status: number; location: string | null }> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.request(
        urlStr,
        {
          method,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*"
          }
        },
        (res) => {
          if (method === "GET") {
            res.destroy(); // immediately abort reading the body
          } else {
            res.resume(); // consume any minimal data
          }
          resolve({
            status: res.statusCode || 0,
            location: res.headers.location || null
          });
        }
      );
      req.on("error", () => {
        resolve({ status: 0, location: null });
      });
      req.setTimeout(4000, () => {
        req.destroy();
        resolve({ status: 0, location: null });
      });
      req.end();
    } catch {
      resolve({ status: 0, location: null });
    }
  });
}

/**
 * Extract and decode the base64-encoded SharePoint Online URL from a redeem parameter if present
 */
function getRedeemedUrl(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    const redeemVal = url.searchParams.get("redeem");
    if (!redeemVal) return null;
    
    let b64 = redeemVal;
    while (b64.length % 4 !== 0) {
      b64 += "=";
    }
    b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(b64, "base64").toString("utf8");
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
      return decoded;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Follow redirects for OneDrive short links (e.g. 1drv.ms)
 * Stops early if we reach a URL that contains onedrive.live.com and is ready for conversion
 */
async function resolveFinalUrl(url: string): Promise<string> {
  let currentUrl = url;
  const maxRedirects = 10;
  
  for (let i = 0; i < maxRedirects; i++) {
    // If the URL is already an easily convertible onedrive.live.com URL, we break early to prevent
    // following further redirects that land on the main HTML web viewer page (which breaks /download replacements).
    // EXCEPT if it contains a "redeem" parameter, in which case we let the redirect resolve to find the SharePoint address.
    if (
      (currentUrl.includes("onedrive.live.com/redir") && !currentUrl.includes("redeem=")) ||
      (currentUrl.includes("onedrive.live.com/embed") && !currentUrl.includes("redeem=")) ||
      currentUrl.includes("onedrive.live.com/download") ||
      (currentUrl.includes("onedrive.live.com") && (currentUrl.includes("resid=") || currentUrl.includes("id=")) && !currentUrl.includes("redeem="))
    ) {
      break;
    }
    
    // Try HEAD first to avoid downloading any file payload
    let result = await getRedirectUrl(currentUrl, "HEAD");
    
    // Fallback to GET headers only if HEAD is unsupported or rejected
    if (result.status === 405 || result.status === 403 || result.status === 400 || result.status === 0) {
      result = await getRedirectUrl(currentUrl, "GET");
    }
    
    if (result.status >= 300 && result.status < 400 && result.location) {
      try {
        const nextUrl = new URL(result.location, currentUrl).toString();
        if (nextUrl === currentUrl) break;
        currentUrl = nextUrl;
      } catch {
        break;
      }
    } else {
      break;
    }
  }
  return currentUrl;
}

/**
 * Generate highly comprehensive, multi-tiered streamable download URLs for any OneDrive link.
 * Sequential backup URLs will be run if the primary option fails.
 */
function getOneDriveDirectCandidates(originalLink: string, expandedLink: string): string[] {
  const candidates: string[] = [];

  // 1. MS Graph Shares API URL Generator
  const toGraphSharesUrl = (url: string) => {
    if (url.includes("api.onedrive.com") || url.includes("/shares/u!")) {
      return url;
    }
    try {
      const b64 = Buffer.from(url).toString("base64");
      const safeB64 = b64
        .replace(/=/g, "")
        .replace(/\//g, "_")
        .replace(/\+/g, "-");
      return `https://api.onedrive.com/v1.0/shares/u!${safeB64}/root/content`;
    } catch {
      return null;
    }
  };

  // 2. Legacy /download Query Params converter for onedrive.live.com
  const toLegacyPersonalUrl = (url: string) => {
    if (url.includes("onedrive.live.com/redir") || url.includes("onedrive.live.com/embed")) {
      return url.replace("/redir", "/download").replace("/embed", "/download");
    }
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("onedrive.live.com") || parsed.hostname.includes("livefilestore.com")) {
        const cid = parsed.searchParams.get("cid");
        const resid = parsed.searchParams.get("resid") || parsed.searchParams.get("id");
        const authkey = parsed.searchParams.get("authkey");
        
        if (cid && resid) {
          const downloadUrl = new URL("https://onedrive.live.com/download");
          downloadUrl.searchParams.set("cid", cid);
          downloadUrl.searchParams.set("resid", resid);
          if (authkey) {
            downloadUrl.searchParams.set("authkey", authkey);
          }
          return downloadUrl.toString();
        }
        
        if (!parsed.searchParams.has("download")) {
          parsed.searchParams.set("download", "1");
        }
        return parsed.toString();
      }
    } catch {
      // ignore
    }
    return null;
  };

  // 3. SharePoint download query formatter
  const toSharepointDownloadUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("sharepoint.com")) {
        parsed.searchParams.set("download", "1");
        return parsed.toString();
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Check if original link or expanded link contains a redeem parameter and decode it
  const redeemOriginal = getRedeemedUrl(originalLink);
  const redeemExpanded = getRedeemedUrl(expandedLink);
  const redeemUrl = redeemOriginal || redeemExpanded;

  if (redeemUrl) {
    // Tier 0a: SharePoint Direct download of the redeem target (Highly reliable!)
    const spRedeem = toSharepointDownloadUrl(redeemUrl);
    if (spRedeem) candidates.push(spRedeem);

    // Tier 0b: Graph Shares API using the redeem target URL
    const graphRedeem = toGraphSharesUrl(redeemUrl);
    if (graphRedeem) candidates.push(graphRedeem);

    // Tier 0c: Standard download query param on redeem target URL
    try {
      const parsed = new URL(redeemUrl);
      if (!parsed.searchParams.has("download")) {
        parsed.searchParams.set("download", "1");
      }
      candidates.push(parsed.toString());
    } catch {
      // ignore
    }

    // Tier 0d: Raw redeem URL
    candidates.push(redeemUrl);
  }

  // Tier 1: Graph Shares API on original link (Best for unresolved 1drv.ms short URLs!)
  const graphOriginal = toGraphSharesUrl(originalLink);
  if (graphOriginal) candidates.push(graphOriginal);

  // Tier 2: Personal OneDrive Legacy download endpoint on expanded link (Best for resolved Live URLs!)
  const legacyExpanded = toLegacyPersonalUrl(expandedLink);
  if (legacyExpanded) candidates.push(legacyExpanded);

  // Tier 3: Graph Shares API on expanded link
  const graphExpanded = toGraphSharesUrl(expandedLink);
  if (graphExpanded) candidates.push(graphExpanded);

  // Tier 4: Personal OneDrive Legacy download on original link
  const legacyOriginal = toLegacyPersonalUrl(originalLink);
  if (legacyOriginal) candidates.push(legacyOriginal);

  // Tier 5: SharePoint force-download on expanded & original links (Best for business/institutional files)
  const spExpanded = toSharepointDownloadUrl(expandedLink);
  if (spExpanded) candidates.push(spExpanded);
  const spOriginal = toSharepointDownloadUrl(originalLink);
  if (spOriginal) candidates.push(spOriginal);

  // Tier 6: Basic download append
  try {
    const parsed = new URL(expandedLink);
    if (!parsed.searchParams.has("download")) {
      parsed.searchParams.set("download", "1");
    }
    candidates.push(parsed.toString());
  } catch {
    // ignore
  }

  // Tier 7: Raw fallbacks as-is
  candidates.push(expandedLink);
  candidates.push(originalLink);

  // Return clean, unique set in priority order
  return Array.from(new Set(candidates));
}

// -------------------------------------------------------------
// Secure API Proxy for Media Information
// -------------------------------------------------------------
app.get("/api/media-info/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Fetch original OneDrive location from secure Firestore
    const bookRef = doc(db, "books", bookId);
    const bookDoc = await getDoc(bookRef);
    
    if (!bookDoc.exists()) {
      return res.status(404).json({ error: "Media catalog entry not found." });
    }
    
    const bookData = bookDoc.data();
    const originalLink = bookData.oneDriveLink;
    
    if (!originalLink) {
      return res.status(400).json({ error: "Media is missing its storage reference." });
    }
    
    // Check if it looks like YouTube or Google Drive first to avoid head request delays
    const isYouTube = originalLink.includes("youtube.com") || originalLink.includes("youtu.be");
    const isGoogleDrive = originalLink.includes("drive.google.com");
    
    if (isYouTube) {
      return res.json({
        contentType: "video/youtube",
        contentLength: "0",
        title: bookData.title,
        year: bookData.year,
        oneDriveLink: originalLink
      });
    }
    
    if (isGoogleDrive) {
      return res.json({
        contentType: "application/gdrive",
        contentLength: "0",
        title: bookData.title,
        year: bookData.year,
        oneDriveLink: originalLink
      });
    }
    
    // Check if file extension of links suggests it's a video file
    const isExtVideo = originalLink.toLowerCase().includes(".mp4") || 
                        originalLink.toLowerCase().includes(".mkv") || 
                        originalLink.toLowerCase().includes(".mov") || 
                        originalLink.toLowerCase().includes(".webm") ||
                        originalLink.toLowerCase().includes(".avi") ||
                        originalLink.toLowerCase().includes(".m4v") ||
                        originalLink.toLowerCase().includes(".mp3") ||
                        originalLink.toLowerCase().includes(".wav");
                        
    let guessContentType = isExtVideo ? "video/mp4" : "application/pdf";
    let guessLength = "0";
    
    try {
      const expandedUrl = await resolveFinalUrl(originalLink);
      const candidates = getOneDriveDirectCandidates(originalLink, expandedUrl);
      
      const requestHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      };
      
      // Ping first 2 candidates with HEAD to check true Content-Type
      for (const url of candidates.slice(0, 2)) {
        try {
          const headRes = await fetch(url, { method: "HEAD", headers: requestHeaders });
          if (headRes.ok) {
            const type = headRes.headers.get("content-type");
            if (type) {
              guessContentType = type;
              guessLength = headRes.headers.get("content-length") || "0";
              break;
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore, fall back to guessed extension values
    }
    
    res.json({
      contentType: guessContentType,
      contentLength: guessLength,
      title: bookData.title,
      year: bookData.year,
      oneDriveLink: originalLink
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || error });
  }
});

// -------------------------------------------------------------
// Secure API Proxy for masked Media Streaming (PDF & Video)
// -------------------------------------------------------------
app.get("/api/pdf/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Fetch original OneDrive location from secure Firestore
    const bookRef = doc(db, "books", bookId);
    const bookDoc = await getDoc(bookRef);
    
    if (!bookDoc.exists()) {
      return res.status(404).send("Document not found.");
    }
    
    const bookData = bookDoc.data();
    const originalLink = bookData.oneDriveLink;
    
    if (!originalLink) {
      return res.status(400).send("Document is missing its secure resource pointer.");
    }
    
    // Resolve shorteners carefully (stopping at easily-convertible .live.com endpoints)
    const expandedUrl = await resolveFinalUrl(originalLink);
    
    // Create candidate fallback download URLs
    const candidates = getOneDriveDirectCandidates(originalLink, expandedUrl);
    
    console.log(`[Media Proxy] Stream requested for ID ${bookId}.`);
    console.log(`[Media Proxy] Unresolved Original Link: ${originalLink}`);
    console.log(`[Media Proxy] Partially Expanded Link: ${expandedUrl}`);
    
    // Dynamic forward of Range headers for iOS & video players seeking compatibility
    const requestHeaders: any = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*"
    };
    if (req.headers.range) {
      requestHeaders["Range"] = req.headers.range;
    }

    let fileRes: any = null;
    let successfulUrl = "";

    // Iterate through candidates in order of descending reliability
    for (const url of candidates) {
      try {
        console.log(`[Media Proxy] Fetching candidate: ${url}`);
        const response = await fetch(url, { headers: requestHeaders });
        if (response.ok || response.status === 206) {
          fileRes = response;
          successfulUrl = url;
          console.log(`[Media Proxy] Successfully reached media payload source via candidate: ${url}`);
          break;
        } else {
          console.warn(`[Media Proxy] Candidate failed with status ${response.status}: ${url}`);
        }
      } catch (err: any) {
        console.warn(`[Media Proxy] Fetching candidate error on ${url}: ${err.message || err}`);
      }
    }

    if (!fileRes) {
      throw new Error("All calculated OneDrive stream pipelines were rejected by Microsoft Servers (Unauthorized or Invalid Resource Link).");
    }
    
    const contentType = fileRes.headers.get("content-type") || "application/pdf";
    console.log(`[Media Proxy] Serving stream content type: ${contentType}`);
    
    if (fileRes.status === 206) {
      res.status(206);
    }
    
    // Deliver clean content stream headers masking raw origin CDN addresses
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    
    const contentRange = fileRes.headers.get("content-range");
    if (contentRange) res.setHeader("Content-Range", contentRange);
    
    const acceptRanges = fileRes.headers.get("accept-ranges");
    if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);
    
    const contentLength = fileRes.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    
    // Determine the safe extension to suggest for file saving
    let ext = "pdf";
    if (contentType.includes("video/mp4") || originalLink.toLowerCase().includes(".mp4")) ext = "mp4";
    else if (contentType.includes("video/webm") || originalLink.toLowerCase().includes(".webm")) ext = "webm";
    else if (contentType.includes("video/")) ext = contentType.split("/")[1] || "mp4";
    else if (contentType.includes("image/")) ext = contentType.split("/")[1] || "jpg";
    
    const isDownload = req.query.download === "true";
    const disposition = isDownload ? "attachment" : "inline";
    res.setHeader("Content-Disposition", `${disposition}; filename="media-${bookId}.${ext}"`);
    
    // Stream response chunk-by-chunk to prevent high server RAM usage (Crucial to prevent crashes on large files!)
    if (fileRes.body) {
      try {
        for await (const chunk of fileRes.body as any) {
          res.write(chunk);
        }
        res.end();
      } catch (err: any) {
        console.warn(`[Media Proxy] Response body stream loop broke: ${err.message || err}. Falling back...`);
        // Fallback to absolute buffer deliver if the stream iter fails mid-way
        try {
          const arrayBuffer = await fileRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.end(buffer);
        } catch {
          // ignore, connection is closed
        }
      }
    } else {
      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    }
  } catch (error: any) {
    console.error("[Media Proxy Error]:", error);
    res.status(500).send(`Botany Honors secure proxy failed: ${error.message || error}`);
  }
});

// Vite middleware / environment serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for client routes in development
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
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
