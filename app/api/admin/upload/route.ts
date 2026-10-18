import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const rawFiles = formData.getAll("files").concat(formData.getAll("file")) as File[];
    const files = rawFiles.filter((f) => f instanceof File && f.size > 0);

    if (!files.length) {
      return NextResponse.json({ error: "No image file was provided." }, { status: 400 });
    }

    const MAX_SIZE = 12 * 1024 * 1024;
    const uploadedUrls: string[] = [];
    const supabase = getSupabaseAdmin();
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_SIZE) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const rawBase = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 40);
      const uniqueFileName = `${rawBase || "mirror"}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

      let fileUrl = "";

      // 1. Try Supabase Storage
      try {
        const storagePath = `products/${uniqueFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(storagePath);

          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn("[Upload API] Supabase storage upload warning:", storageErr);
      }

      // 2. Fallback to local /public/uploads/products
      if (!fileUrl) {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const localFilePath = path.join(uploadDir, uniqueFileName);
        fs.writeFileSync(localFilePath, buffer);
        fileUrl = `/uploads/products/${uniqueFileName}`;
      }

      if (fileUrl) {
        uploadedUrls.push(fileUrl);
      }
    }

    if (!uploadedUrls.length) {
      return NextResponse.json({ error: "Failed to upload images. Please check file format." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (err: any) {
    console.error("POST /api/admin/upload error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload images." },
      { status: 500 }
    );
  }
}
