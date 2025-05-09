import { useState } from "react";
import { motion } from "framer-motion";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  color = "text-yellow-400",
  interactive = false,
  onRatingChange,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  // Determine star dimensions based on size prop
  const getStarSize = () => {
    switch (size) {
      case "sm": return "h-3 w-3";
      case "md": return "h-5 w-5";
      case "lg": return "h-7 w-7";
      default: return "h-5 w-5";
    }
  };
  
  const starSize = getStarSize();
  
  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  const handleMouseEnter = (hoveredRating: number) => {
    if (interactive) {
      setHoverRating(hoveredRating);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };
  
  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating > 0 ? hoverRating : rating;
    
    for (let i = 1; i <= maxRating; i++) {
      const difference = displayRating - i;
      
      if (difference >= 0) {
        // Full star
        stars.push(
          <motion.span
            key={i}
            whileHover={{ scale: interactive ? 1.2 : 1 }}
            whileTap={{ scale: interactive ? 0.9 : 1 }}
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
            className={`cursor-${interactive ? 'pointer' : 'default'}`}
            data-testid={`star-${i}`}
          >
            <Star className={`${starSize} ${color} fill-current`} />
          </motion.span>
        );
      } else if (difference > -1 && difference < 0) {
        // Half star
        stars.push(
          <motion.span
            key={i}
            whileHover={{ scale: interactive ? 1.2 : 1 }}
            whileTap={{ scale: interactive ? 0.9 : 1 }}
            onClick={() => handleClick(i - 0.5)}
            onMouseEnter={() => handleMouseEnter(i - 0.5)}
            onMouseLeave={handleMouseLeave}
            className={`cursor-${interactive ? 'pointer' : 'default'}`}
            data-testid={`star-${i}-half`}
          >
            <StarHalf className={`${starSize} ${color} fill-current`} />
          </motion.span>
        );
      } else {
        // Empty star
        stars.push(
          <motion.span
            key={i}
            whileHover={{ scale: interactive ? 1.2 : 1 }}
            whileTap={{ scale: interactive ? 0.9 : 1 }}
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
            className={`cursor-${interactive ? 'pointer' : 'default'}`}
            data-testid={`star-${i}-empty`}
          >
            <Star className={`${starSize} text-gray-300`} />
          </motion.span>
        );
      }
    }
    
    return stars;
  };
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {renderStars()}
    </div>
  );
}
