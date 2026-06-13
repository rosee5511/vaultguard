'use client';

import React from 'react';
import { cn } from '@/utils/helpers';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

export function Skeleton({ className, width, height, circle, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-gray-200 dark:bg-dark-elevated rounded-lg',
            circle && 'rounded-full',
            className
          )}
          style={{
            width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
            height: height ? (typeof height === 'number' ? `${height}px` : height) : '1rem',
          }}
        />
      ))}
    </>
  );
}