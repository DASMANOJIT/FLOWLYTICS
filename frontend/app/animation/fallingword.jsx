"use client";

import { useState } from "react";
import "./fallingword.css";

export default function FallingWords() {
  const [words] = useState(() => {
    const wordList = [
      "Learn","Code","Develop","Design","Create","Innovate",
      "Build","Explore","Inspire","Achieve","Grow","Collaborate",
      "Imagine","Transform","Empower","Discover","Lead","Succeed"
    ];

    const generated = wordList.map((word) => ({
      word,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`,
    }));
  });

  return (
    <div className="falling-layer">
      {words.map((w, i) => (
        <span
          key={i}
          className="falling-word"
          style={{
            left: w.left,
            animationDuration: w.duration,
            animationDelay: w.delay,
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
}
