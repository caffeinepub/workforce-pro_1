import { cn } from "@/lib/utils";
import { CheckCircle2, LogIn, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface CheckInButtonProps {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isLoading?: boolean;
  variant?: "teal" | "white";
}

export function CheckInButton({
  isCheckedIn,
  onCheckIn,
  onCheckOut,
  isLoading,
  variant = "teal",
}: CheckInButtonProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    if (isLoading) return;
    if (isCheckedIn) onCheckOut();
    else onCheckIn();
  };

  const isOnTeal = variant === "teal";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p
          className={cn(
            "text-3xl font-bold font-mono tabular-nums",
            isOnTeal ? "text-white" : "text-foreground",
          )}
        >
          {time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
        <p
          className={cn(
            "text-sm mt-1",
            isOnTeal ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="relative">
        {!isCheckedIn && (
          <span className="absolute inset-0 rounded-full animate-checkin-pulse" />
        )}
        <motion.button
          data-ocid="checkin.primary_button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1",
            "font-bold text-sm transition-all duration-300 shadow-lg",
            isCheckedIn
              ? isOnTeal
                ? "bg-white text-primary"
                : "bg-success text-white"
              : isOnTeal
                ? "bg-white text-primary"
                : "bg-primary text-white",
            isLoading && "opacity-70 cursor-not-allowed",
          )}
        >
          <AnimatePresence mode="wait">
            {isCheckedIn ? (
              <motion.div
                key="out"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center gap-1"
              >
                <CheckCircle2 className="w-7 h-7" />
                <span className="text-xs font-bold tracking-wide">
                  CHECK OUT
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="in"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center gap-1"
              >
                <LogIn className="w-7 h-7" />
                <span className="text-xs font-bold tracking-wide">
                  CHECK IN
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <p
        className={cn(
          "text-xs",
          isOnTeal ? "text-white/60" : "text-muted-foreground",
        )}
      >
        {isCheckedIn ? "Tap to check out" : "Tap to mark attendance"}
      </p>
    </div>
  );
}
