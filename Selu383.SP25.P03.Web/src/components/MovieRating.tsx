import {
  Box,
  Text,
  Group,
  Tooltip,
  Rating,
  useMantineColorScheme,
} from "@mantine/core";

interface MovieRatingProps {
  rating?: string; // MPAA Rating like "PG", "R", etc.
  score?: number; // Optional score out of 10
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const MovieRating = ({
  rating,
  score,
  size = "md",
  showTooltip = true,
}: MovieRatingProps) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  // Mapping of ratings to their meaning
  const ratingDescriptions: Record<string, string> = {
    G: "General Audiences – All ages admitted",
    PG: "Parental Guidance Suggested – Some material may not be suitable for children",
    "PG-13":
      "Parents Strongly Cautioned – Some material may be inappropriate for children under 13",
    R: "Restricted – Under 17 requires accompanying parent or adult guardian",
    "NC-17": "Adults Only – No one 17 and under admitted",
  };

  // Convert size to Mantine-compatible size values
  const sizeValues = {
    sm: {
      badgeSize: "xs",
      fontSize: "xs",
      ratingSize: "xs",
      iconSize: 14,
    },
    md: {
      badgeSize: "sm",
      fontSize: "sm",
      ratingSize: "sm",
      iconSize: 16,
    },
    lg: {
      badgeSize: "md",
      fontSize: "md",
      ratingSize: "md",
      iconSize: 18,
    },
  };

  const currentSize = sizeValues[size];

  // Get badge color based on rating
  const getBadgeColor = (rating: string | undefined) => {
    if (!rating) return isDark ? "gray.6" : "gray.7";
    switch (rating) {
      case "G":
        return "green";
      case "PG":
        return "blue";
      case "PG-13":
        return "yellow";
      case "R":
        return "red";
      case "NC-17":
        return "grape";
      default:
        return isDark ? "gray.6" : "gray.7";
    }
  };

  // Convert score to stars (0-10 scale to 0-5 stars)
  const getStars = (score: number | undefined) => {
    if (typeof score !== "number") return 0;
    return Math.max(0, Math.min(5, score / 2));
  };

  // Format score for display
  const formatScore = (score: number | undefined) => {
    if (typeof score !== "number") return "N/A";
    return score.toFixed(1);
  };

  // Render rating badge with optional tooltip
  const ratingBadge = rating ? (
    <Box
      style={{
        display: "inline-block",
        padding: `${
          size === "sm" ? "2px 6px" : size === "md" ? "3px 8px" : "4px 10px"
        }`,
        borderRadius: "4px",
        backgroundColor: isDark
          ? `var(--mantine-color-${getBadgeColor(rating)}-7)`
          : `var(--mantine-color-${getBadgeColor(rating)}-6)`,
        color: "white",
        fontWeight: 700,
        fontSize: currentSize.fontSize,
      }}
    >
      {rating}
    </Box>
  ) : null;

  return (
    <Group gap={score !== undefined ? "sm" : "xs"} wrap="nowrap" align="center">
      {rating &&
        (showTooltip && ratingDescriptions.hasOwnProperty(rating) ? (
          <Tooltip
            label={
              ratingDescriptions[rating as keyof typeof ratingDescriptions]
            }
            position="top"
            withArrow
          >
            {ratingBadge}
          </Tooltip>
        ) : (
          ratingBadge
        ))}

      {score !== undefined && (
        <Group gap={4} wrap="nowrap" align="center">
          <Rating
            value={getStars(score)}
            fractions={2}
            readOnly
            size={currentSize.ratingSize}
          />
          <Text
            size={currentSize.fontSize}
            fw={500}
            c={isDark ? "gray.3" : "gray.7"}
          >
            {formatScore(score)}/10
          </Text>
        </Group>
      )}
    </Group>
  );
};

export default MovieRating;
