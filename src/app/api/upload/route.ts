import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { logAudit, AUDIT } from "@/lib/audit";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET_NAME || "wsfa-media";
const CDN_URL = process.env.S3_CDN_URL || "https://storage-wsfa-media.cranl.net";

// Magic number signatures for file type verification
const MAGIC_NUMBERS: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37],
    [0x47, 0x49, 0x46, 0x38, 0x39],
  ],
  "video/mp4": [[0x00, 0x00, 0x00]],
  "video/webm": [[0x1a, 0x45, 0xdf, 0xa3]],
  "video/quicktime": [[0x00, 0x00, 0x00]],
};

function verifyMagicNumber(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_NUMBERS[mimeType];
  if (!signatures) return false;

  if (mimeType === "video/mp4" || mimeType === "video/quicktime") {
    const header = buffer.subarray(0, 12).toString("ascii");
    return header.includes("ftyp");
  }

  if (mimeType === "image/webp") {
    if (buffer.length < 12) return false;
    const riff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const webp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return riff && webp;
  }

  for (const sig of signatures) {
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

// Strip EXIF data from JPEG
function stripJpegExif(buffer: Buffer<ArrayBuffer>): Buffer<ArrayBuffer> {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return buffer;

  const result: Buffer[] = [Buffer.from([0xff, 0xd8])];
  let offset = 2;

  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) break;

    const marker = buffer[offset + 1];
    if (marker === 0xda) {
      result.push(buffer.subarray(offset));
      break;
    }

    if (offset + 3 >= buffer.length) break;
    const segmentLength = buffer.readUInt16BE(offset + 2);

    if (marker === 0xe1) {
      offset += 2 + segmentLength;
      continue;
    }

    result.push(buffer.subarray(offset, offset + 2 + segmentLength));
    offset += 2 + segmentLength;
  }

  return Buffer.concat(result);
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate MIME type
  const allowedTypes = Object.keys(MIME_TO_EXT);
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Validate file size
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large (max ${isVideo ? "50MB" : "5MB"})` },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);

  // Verify magic numbers match claimed MIME type
  if (!verifyMagicNumber(buffer, file.type)) {
    return NextResponse.json(
      { error: "File content does not match its type" },
      { status: 400 }
    );
  }

  // Strip EXIF data from JPEG images (privacy protection)
  if (file.type === "image/jpeg") {
    buffer = stripJpegExif(buffer);
  }

  // Upload to S3-compatible storage
  const ext = MIME_TO_EXT[file.type] || "bin";
  const key = `uploads/${randomUUID()}.${ext}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const url = `${CDN_URL}/${key}`;

  // Audit log
  logAudit(session.user.id, AUDIT.FILE_UPLOAD, "file", key, {
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  });

  return NextResponse.json({ url });
}
