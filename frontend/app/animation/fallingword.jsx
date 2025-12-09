"use client";
import React, { useMemo } from "react";
import "./fallingword.css";

export default function FallingWords() {
  const words = [
    "Learn", "Code", "Develop", "Design", "Create", "Innovate", "Build", "Explore",
    "Inspire", "Achieve", "Grow", "Collaborate", "Imagine",
    "Transform", "Empower", "Discover", "Lead", "Succeed"
  ];

  const items = useMemo(() => {
    return words.map((word, i) => {
      const left = Math.random() * 90;
      const duration = 8 + Math.random() * 10;
      const delay = Math.random() * 6;

      return {
        key: `${word}-${i}`,
        word,
        style: {
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }
      };
    });
  }, []);

  return (
    <div className="falling-layer">
      {items.map((item) => (
        <span key={item.key} className="falling-word" style={item.style}>
          {item.word}
        </span>
      ))}
    </div>
  );
}
