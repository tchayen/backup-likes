import { User } from "@/types";

export function Avatar({ user }: { user: User }) {
  return (
    <div className="h-12 w-12 flex-shrink-0 rounded-full bg-slate-900">
      <img
        className="h-12 w-12 rounded-full"
        src={user.profile_image_url.replace(
          "https://pbs.twimg.com/",
          "/assets/"
        )}
        alt={`Avatar of ${user.name}`}
      />
    </div>
  );
}
