import { useState } from 'react';

interface ExpandableTextProps {
    text: string | null;
    maxLength?: number;
}

export function ExpandableText({ text = '', maxLength = 50 }: ExpandableTextProps) {
    const [expanded, setExpanded] = useState(false);

    if (!text) {
        return <span className="font-mono text-sm text-gray-300">-</span>;
    }

    if (text.length <= maxLength) {
        return <span className="font-mono text-sm text-gray-300">{text}</span>;
    }

    return (
        <span className="font-mono text-sm text-gray-300">
            {expanded ? text : `${text.slice(0, maxLength)}... `}
            <button onClick={() => setExpanded(!expanded)} className="ml-1 text-cyan-400 underline">
                {expanded ? 'See less' : 'See more'}
            </button>
        </span>
    );
}
