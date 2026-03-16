import { useEffect, useRef, useState } from 'react';

interface SwipeConfig {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number; // Minimum distance for swipe (in pixels)
    enabled?: boolean;
}

interface TouchPosition {
    x: number;
    y: number;
    time: number;
}

export function useSwipeGesture<T extends HTMLElement = HTMLDivElement>({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    enabled = true
}: SwipeConfig) {
    const elementRef = useRef<T>(null);
    const touchStart = useRef<TouchPosition | null>(null);
    const [isSwiping, setIsSwiping] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !enabled) return;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            touchStart.current = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
            setIsSwiping(true);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStart.current) return;

            // Prevent default scrolling during swipe
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStart.current.x);
            const deltaY = Math.abs(touch.clientY - touchStart.current.y);

            // If horizontal swipe is dominant, prevent vertical scroll
            if (deltaX > deltaY && deltaX > 10) {
                e.preventDefault();
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStart.current) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStart.current.x;
            const deltaY = touch.clientY - touchStart.current.y;
            const deltaTime = Date.now() - touchStart.current.time;

            // Calculate velocity (pixels per millisecond)
            const velocityX = Math.abs(deltaX) / deltaTime;
            const velocityY = Math.abs(deltaY) / deltaTime;

            // Determine swipe direction
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Check if swipe meets threshold and is fast enough
            if (absX > threshold || absY > threshold) {
                if (absX > absY) {
                    // Horizontal swipe
                    if (deltaX > 0 && onSwipeRight) {
                        onSwipeRight();
                    } else if (deltaX < 0 && onSwipeLeft) {
                        onSwipeLeft();
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0 && onSwipeDown) {
                        onSwipeDown();
                    } else if (deltaY < 0 && onSwipeUp) {
                        onSwipeUp();
                    }
                }
            }

            touchStart.current = null;
            setIsSwiping(false);
        };

        const handleTouchCancel = () => {
            touchStart.current = null;
            setIsSwiping(false);
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchCancel);
        };
    }, [enabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

    return { elementRef, isSwiping };
}

/**
 * Hook for swipeable task cards
 * Provides visual feedback during swipe
 */
export function useSwipeableCard({
    onSwipeLeft,
    onSwipeRight,
    threshold = 100,
    enabled = true
}: Omit<SwipeConfig, 'onSwipeUp' | 'onSwipeDown'>) {
    const elementRef = useRef<HTMLDivElement>(null);
    const touchStart = useRef<TouchPosition | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !enabled) return;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            touchStart.current = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
            setIsSwiping(true);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStart.current) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStart.current.x;
            const deltaY = Math.abs(touch.clientY - touchStart.current.y);

            // Only track horizontal swipes
            if (Math.abs(deltaX) > deltaY) {
                e.preventDefault();
                setSwipeOffset(deltaX);
            }
        };

        const handleTouchEnd = () => {
            if (!touchStart.current) {
                setIsSwiping(false);
                setSwipeOffset(0);
                return;
            }

            const absOffset = Math.abs(swipeOffset);

            if (absOffset > threshold) {
                if (swipeOffset > 0 && onSwipeRight) {
                    onSwipeRight();
                } else if (swipeOffset < 0 && onSwipeLeft) {
                    onSwipeLeft();
                }
            }

            // Reset
            touchStart.current = null;
            setIsSwiping(false);
            setSwipeOffset(0);
        };

        const handleTouchCancel = () => {
            touchStart.current = null;
            setIsSwiping(false);
            setSwipeOffset(0);
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchCancel);
        };
    }, [enabled, threshold, swipeOffset, onSwipeLeft, onSwipeRight]);

    return {
        elementRef,
        isSwiping,
        swipeOffset,
        swipeStyle: {
            transform: `translateX(${swipeOffset}px)`,
            transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }
    };
}
