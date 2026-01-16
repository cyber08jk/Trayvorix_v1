import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@hooks/useAuth'; // Assuming useAuth is exported from here based on App.tsx imports
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';

// Configuration
const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 60 * 1000; // 1 minute warning
// For testing purposes, you can uncomment these lines:
// const TIMEOUT_MS = 1 * 60 * 1000; // 1 minute
// const WARNING_MS = 30 * 1000; // 30 seconds

export function SessionTimeoutHandler() {
    const { user, signOut } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(WARNING_MS / 1000);

    // Refs to store timer IDs and last activity timestamp
    const lastActivityRef = useRef<number>(Date.now());
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timers on activity
    const resetTimers = () => {
        if (!user) return;

        lastActivityRef.current = Date.now();

        // Clear existing timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Hide warning if visible
        if (showWarning) {
            setShowWarning(false);
        }

        // Set new timers
        // Warning timer
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setTimeLeft(WARNING_MS / 1000);

            // Start countdown for the modal UI
            countdownIntervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownIntervalRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        }, TIMEOUT_MS - WARNING_MS);

        // Logout timer
        logoutTimerRef.current = setTimeout(() => {
            handleLogout();
        }, TIMEOUT_MS);
    };

    const handleLogout = async () => {
        // Clear all timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setShowWarning(false);
        await signOut();
        window.location.href = '/login'; // Force redirect to ensure clean state
    };

    // Setup event listeners
    useEffect(() => {
        if (!user) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Throttled event handler to avoid performance hit
        let lastThrottledTime = 0;
        const handleActivity = () => {
            const now = Date.now();
            if (now - lastThrottledTime > 1000) { // Only reset once per second max
                // Only reset if we are NOT currently showing the warning
                // If warning is shown, user must explicitly click "Stay Logged In"
                if (!showWarning) {
                    resetTimers();
                }
                lastThrottledTime = now;
            }
        };

        // Initial setup
        resetTimers();

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [user, showWarning]); // Re-run if user changes or warning state changes

    // If no user, render nothing
    if (!user) return null;

    return (
        <Modal
            isOpen={showWarning}
            onClose={() => { }} // User shouldn't be able to close by clicking outside or escape without choosing
            title="Session Timeout Warning"
            size="sm"
            footer={
                <div className="flex w-full justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                    >
                        Logout Now
                    </Button>
                    <Button
                        variant="primary"
                        onClick={resetTimers}
                    >
                        Stay Logged In
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                    You have been inactive for a while. For your security, you will be automatically logged out in:
                </p>
                <div className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400">
                    {timeLeft} seconds
                </div>
            </div>
        </Modal>
    );
}
