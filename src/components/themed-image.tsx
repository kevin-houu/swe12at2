"use client";

import Image from "next/image";

import { useTheme } from "next-themes";

export default function ThemedImage({
  light,
  dark,
  alt,
  width,
  height,
  className,
}: {
  light: string;
  dark: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  let src;

  switch (resolvedTheme) {
    case "light":
      src = light;
      break;
    case "dark":
      src = dark;
      break;
    default:
      src = light;
      break;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
