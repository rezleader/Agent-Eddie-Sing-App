import { type ChallengeCategory } from "@shared/schema";

interface TimelineSegmentProps {
  segment: number;
  isActive: boolean;
  hasChallenges: boolean;
  onClick: () => void;
  isDetected?: boolean;
  isDisabled?: boolean;
  className?: string;
}

const segmentColors: Record<number, string> = {
  1: "bg-chart-1/20 hover:bg-chart-1/30 border-chart-1",
  2: "bg-chart-2/20 hover:bg-chart-2/30 border-chart-2",
  3: "bg-chart-4/20 hover:bg-chart-4/30 border-chart-4",
  4: "bg-chart-5/20 hover:bg-chart-5/30 border-chart-5",
};

const activeColors: Record<number, string> = {
  1: "bg-chart-1/40 border-chart-1 ring-2 ring-chart-1",
  2: "bg-chart-2/40 border-chart-2 ring-2 ring-chart-2",
  3: "bg-chart-4/40 border-chart-4 ring-2 ring-chart-4",
  4: "bg-chart-5/40 border-chart-5 ring-2 ring-chart-5",
};

const detectedColors: Record<number, string> = {
  1: "bg-chart-1/60 border-chart-1 ring-4 ring-chart-1/50 shadow-lg",
  2: "bg-chart-2/60 border-chart-2 ring-4 ring-chart-2/50 shadow-lg",
  3: "bg-chart-4/60 border-chart-4 ring-4 ring-chart-4/50 shadow-lg",
  4: "bg-chart-5/60 border-chart-5 ring-4 ring-chart-5/50 shadow-lg",
};

export function TimelineSegment({ 
  segment, 
  isActive, 
  hasChallenges, 
  onClick,
  isDetected = false,
  isDisabled = false,
  className = "" 
}: TimelineSegmentProps) {
  const timeRange = segment === 1 ? "0-60s" : 
                    segment === 2 ? "60-120s" : 
                    segment === 3 ? "120-180s" : 
                    "180s+";

  const getColors = () => {
    if (isDetected) return detectedColors[segment];
    if (isActive) return activeColors[segment];
    return segmentColors[segment];
  };

  const isClickDisabled = !hasChallenges || isDisabled;

  return (
    <button
      onClick={onClick}
      disabled={isClickDisabled}
      className={`
        flex-1 min-h-24 rounded-xl border-2 transition-all
        flex flex-col items-center justify-center gap-2 p-4
        ${getColors()}
        ${isDisabled ? "opacity-30 cursor-not-allowed grayscale" : ""}
        ${!hasChallenges && !isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        ${!isClickDisabled ? "cursor-pointer hover-elevate active-elevate-2" : ""}
        ${className}
      `}
      data-testid={`segment-${segment}`}
    >
      <div className="text-sm font-bold uppercase tracking-wider">
        Minute {segment}
      </div>
      <div className="text-xs text-muted-foreground">
        {timeRange}
      </div>
      {isDetected && (
        <div className="text-xs font-bold mt-1 text-primary">
          ✓ Scanned
        </div>
      )}
      {!isDetected && hasChallenges && !isDisabled && (
        <div className="text-xs font-semibold mt-1">
          Click for challenges
        </div>
      )}
      {isDisabled && (
        <div className="text-xs mt-1 opacity-50">
          Not scanned
        </div>
      )}
    </button>
  );
}
