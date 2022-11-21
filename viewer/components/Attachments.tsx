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
              src={attachment.url.replace("https://pbs.twimg.com/", "/assets/")}
              alt="Tweet attachment"
            />
          );
        }
      })}
    </div>
  );
}
