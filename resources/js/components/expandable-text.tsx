import { useState, useMemo } from 'react';

interface ExpandableTextProps {
    text: string | null;
    maxLength?: number;
}

// Strip HTML tags for plain text preview
function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
}

export function ExpandableText({ text = '', maxLength = 50 }: ExpandableTextProps) {
    const [expanded, setExpanded] = useState(false);
    
    const plainText = useMemo(() => stripHtml(text || ''), [text]);

    if (!plainText) {
        return <span className="font-mono text-sm text-gray-500">-</span>;
    }

    if (plainText.length <= maxLength) {
        return <span className="font-mono text-sm text-gray-500">{plainText}</span>;
    }

    return (
        <span className="font-mono text-sm text-gray-500">
            {expanded ? plainText : `${plainText.slice(0, maxLength)}... `}
            <button onClick={() => setExpanded(!expanded)} className="ml-1 text-cyan-400 underline">
                {expanded ? 'See less' : 'See more'}
            </button>
        </span>
    );
}
