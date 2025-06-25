import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  uploader: f({
    image: { maxFileSize: "8MB" },
    pdf: { maxFileSize: "16MB" },
    text: { maxFileSize: "2MB" },
  })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.ufsUrl,
        name: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
