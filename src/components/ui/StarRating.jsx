import { FiStar } from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

export default function StarRating({ rating = 0, size = 16, showValue = false }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => (
        <FaStar      key={`f${i}`} size={size} className="text-yellow-400" />
      ))}
      {half && <FaStarHalfAlt size={size} className="text-yellow-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <FiStar      key={`e${i}`} size={size} className="text-gray-300 dark:text-gray-600" />
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-gray-500 dark:text-dark-muted">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
