/**
 * Skilizee — Public Media Hosting
 *
 * Instagram publishing is pull-based: `POST /{ig-id}/media` takes an
 * `image_url` and Meta's own servers download it. A file picked in the browser
 * has no public address, so it has to be hosted before it can be published.
 *
 * Uploads land in Firebase Storage (the project already carries firebase-admin
 * credentials) and are made publicly readable so the Graph API can fetch them.
 */

// Instagram rejects images above 8 MB on the container endpoint.
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

// Instagram's Content Publishing API accepts JPEG images only — a PNG or WebP
// passed as `image_url` is rejected at container creation. Anything that is not
// already JPEG is converted on upload rather than failing later against Meta.
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

// Instagram scales anything wider than this down anyway.
const MAX_IMAGE_WIDTH = 1440;

let bucketRef = null;

/**
 * Resolve the Firebase Storage bucket, or null when Storage is unavailable.
 */
async function getBucket() {
  if (bucketRef) return bucketRef;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) return null;

  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

  try {
    const { getApps, getApp, initializeApp, cert } = await import("firebase-admin/app");
    const { getStorage } = await import("firebase-admin/storage");

    const apps = getApps();
    const app = apps.length > 0 ? getApp() : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });

    bucketRef = getStorage(app).bucket(bucketName);
    return bucketRef;
  } catch (err) {
    console.error("[Media Upload] Storage init failed:", err.message);
    return null;
  }
}

/**
 * Validate a file against what Instagram will accept.
 * @param {{ type: string, size: number }} file
 * @returns {string|null} — error message, or null when acceptable
 */
export function validateMediaFile(file) {
  if (!file) return "No file provided";

  const type = (file.type || "").toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.includes(type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(type);

  if (!isImage && !isVideo) {
    return `Unsupported file type "${file.type || "unknown"}". Instagram accepts ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(", ")}.`;
  }

  const limit = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > limit) {
    return `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${limit / 1024 / 1024} MB.`;
  }

  return null;
}

/**
 * Upload a file and return a public, Meta-fetchable URL.
 *
 * @param {File} file — from request.formData()
 * @param {string} accountId
 * @returns {Promise<{ url: string, path: string, contentType: string, size: number }>}
 */
export async function uploadPublicMedia(file, accountId = "skillizee") {
  const invalid = validateMediaFile(file);
  if (invalid) throw new Error(invalid);

  const bucket = await getBucket();
  if (!bucket) {
    throw new Error(
      "Media hosting is not configured. Enable Firebase Storage on this project and set FIREBASE_STORAGE_BUCKET, " +
      "or paste a public https:// image URL instead of uploading a file."
    );
  }

  let buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type;
  let extension = (file.name || "").split(".").pop()?.toLowerCase() || "bin";
  let converted = false;
  let dimensions = null;

  const isImage = ALLOWED_IMAGE_TYPES.includes((file.type || "").toLowerCase());

  if (isImage) {
    const sharp = await loadSharp();

    if (sharp) {
      const image = sharp(buffer);
      const meta = await image.metadata();
      dimensions = { width: meta.width || 0, height: meta.height || 0 };

      const needsConvert = meta.format !== "jpeg";
      const needsResize = (meta.width || 0) > MAX_IMAGE_WIDTH;

      if (needsConvert || needsResize) {
        let pipeline = image;
        if (needsResize) {
          pipeline = pipeline.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });
        }
        buffer = await pipeline.jpeg({ quality: 90 }).toBuffer();
        converted = true;

        const after = await sharp(buffer).metadata();
        dimensions = { width: after.width || 0, height: after.height || 0 };
      }

      contentType = "image/jpeg";
      extension = "jpg";
    } else if (!["image/jpeg", "image/jpg"].includes((file.type || "").toLowerCase())) {
      // No converter available, and Meta will not take this format as-is.
      throw new Error(
        `Instagram only accepts JPEG images, and this file is ${file.type}. ` +
        "Convert it to JPEG and upload again."
      );
    }

    if (buffer.length > MAX_IMAGE_BYTES) {
      throw new Error(
        `Image is ${(buffer.length / 1024 / 1024).toFixed(1)} MB after processing — Instagram's limit is ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`
      );
    }
  }

  const baseName = (file.name || "upload")
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-60) || "upload";
  const path = `social-media/${accountId}/${Date.now()}-${baseName}.${extension}`;

  const blob = bucket.file(path);

  await blob.save(buffer, {
    contentType,
    resumable: false,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  // Meta fetches this anonymously, so it has to be world-readable.
  await blob.makePublic();

  return {
    url: `https://storage.googleapis.com/${bucket.name}/${encodeURI(path)}`,
    path,
    contentType,
    size: buffer.length,
    converted,
    dimensions,
    // Instagram feed accepts 4:5 (0.8) through 1.91:1. Reported, not enforced,
    // so a Facebook-only post is never blocked by an Instagram rule.
    aspectWarning:
      dimensions && dimensions.height > 0 &&
      (dimensions.width / dimensions.height < 0.8 || dimensions.width / dimensions.height > 1.91)
        ? `Aspect ratio ${(dimensions.width / dimensions.height).toFixed(2)}:1 is outside Instagram's 0.8-1.91 range and may be cropped or rejected.`
        : null,
  };
}

/** sharp ships with Next for image optimization; treat it as optional. */
async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default || mod;
  } catch {
    return null;
  }
}
