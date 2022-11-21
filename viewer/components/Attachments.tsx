import { Media } from "@/types";

export function Attachments({ attachments }: { attachments: Media[] }) {
  if (!Array.isArray(attachments)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {attachments.map((attachment: Media) => {
        if (attachment.type === "photo") {
          return (
            <img
              key={attachment.media_key}
              className="overflow-hidden rounded-xl"
              src={attachment.url.replace("https://pbs.twimg.com/", "/images/")}
              alt="Tweet attachment"
            />
          );
        }

        if (attachment.type === "video") {
          return (
            <div
              key={attachment.media_key}
              className="flex max-h-600px justify-center overflow-hidden rounded-xl"
            >
              <video
                poster={attachment.preview_image_url.replace(
                  "https://pbs.twimg.com/",
                  "/images/"
                )}
                src={`/videos/${attachment.media_key}.mp4`}
                controls
              />
            </div>
          );
        }

        if (attachment.type === "animated_gif") {
          return (
            <div
              key={attachment.media_key}
              className="relative flex max-h-600px justify-center overflow-hidden rounded-xl"
            >
              <div className="absolute bottom-1 left-1 rounded bg-slate-600 px-2 py-0.5 font-bold text-white">
                GIF
              </div>
              <video
                className="h-full"
                src={`/videos/${attachment.media_key}.mp4`}
                autoPlay
                loop
                muted
              />
            </div>
          );
        }
      })}
    </div>
  );
}
