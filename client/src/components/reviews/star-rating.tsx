import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "h-3 w-3" : "h-5 w-5";
  return (
    <div className="flex text-yellow-400">
      {[1, 2, 3, 4, 5].map((i) => {
        const star = (
          <Star
            key={i}
            className={`${starSize} ${i <= value ? "fill-current" : ""}`}
          />
        );
        return onChange ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="focus:outline-none"
          >
            {star}
          </button>
        ) : (
          star
        );
      })}
    </div>
  );
}

