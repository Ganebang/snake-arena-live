import React from 'react';
import { Radio } from 'lucide-react';

interface LiveIndicatorProps {
    className?: string;
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-md">
                {/* Pulsing dot */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </div>

                {/* Live text */}
                <div className="flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-bold text-red-500 tracking-wide">
                        LIVE
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LiveIndicator;
