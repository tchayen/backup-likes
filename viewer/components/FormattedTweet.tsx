import { StyledLink } from "./StyledLink";

export function FormattedTweet({ tweet }: { tweet: string }) {
  const split = tweet
    // Filter out images and videos which are attached.
    .replace(
      /https:\/\/twitter\.com\/[A-z]+\/status\/\d+\/(photo|video)\/\d+$/g,
      ""
    )
    // Mark links.
    .replace(/(https?:\/\/[^\s]+)/g, "§$1§")
    // Mark user handles.
    .replace(/(^|\s|\.)@(\w+)/g, "$1§@$2§")
    // Mark hashtags.
    .replace(/(^|\s)#(\w+)/g, "$1§#$2§")
    // Split on new lines.
    .replace(/\n/g, "<br />");

  return (
    <div>
      {split.split("§").map((part, i) => {
        if (part.startsWith("http")) {
          return (
            <StyledLink key={i} href={part}>
              {part}
            </StyledLink>
          );
        }

        if (part.startsWith("@")) {
          return (
            <StyledLink key={i} href={`https://twitter.com/${part.slice(1)}`}>
              {part}
            </StyledLink>
          );
        }

        if (part.startsWith("#")) {
          return (
            <StyledLink
              key={i}
              href={`https://twitter.com/hashtag/${part.slice(1)}`}
            >
              {part}
            </StyledLink>
          );
        }

        return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
}
