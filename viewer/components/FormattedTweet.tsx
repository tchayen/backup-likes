import { StyledLink } from "./StyledLink";

export function FormattedTweet({ tweet }: { tweet: string }) {
  const split = tweet
    .replace(/(https?:\/\/[^\s]+)/g, "§$1§")
    .replace(/(^|\s|\.)@(\w+)/g, "$1§@$2§")
    .replace(/(^|\s)#(\w+)/g, "$1§#$2§")
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
