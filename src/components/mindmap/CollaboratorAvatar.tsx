import React, { CSSProperties, MouseEvent, KeyboardEvent } from 'react';

interface Collaborator {
    id?: string;
    name?: string;
    initials?: string;
    color?: string;
}

interface Position {
    left: number;
    top: number;
}

interface CollaboratorAvatarProps {
    collaborator?: Collaborator;
    position: Position;
    size?: number;
    onClick?: (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => void;
    title?: string;
    isCountBadge?: boolean;
    count?: number;
}

/**
 * Reusable collaborator avatar badge component
 * Displays initials or count in a circular badge
 */
const CollaboratorAvatar: React.FC<CollaboratorAvatarProps> = ({
    collaborator,
    position,
    size = 28,
    onClick,
    onKeyDown,
    title,
    isCountBadge = false,
    count = 0
}) => {
    const handleClick = (e: MouseEvent<HTMLButtonElement | HTMLDivElement>): void => {
        e.stopPropagation();
        if (onClick) {
            onClick(e);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>): void => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            if (onKeyDown) {
                onKeyDown(e);
            }
        }
    };

    const handleMouseDown = (e: MouseEvent<HTMLButtonElement | HTMLDivElement>): void => {
        e.stopPropagation();
    };

    const style: CSSProperties = {
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isCountBadge ? '#6B7280' : collaborator?.color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: isCountBadge ? 700 : 'bold',
        fontSize: size > 24 ? '0.75rem' : '0.65rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        border: '2px solid white',
        cursor: 'pointer',
        zIndex: 6,
        pointerEvents: 'auto'
    };

    const content = isCountBadge ? `+${count}` : collaborator?.initials;

    if (onClick || onKeyDown) {
        return (
            <button
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onMouseDown={handleMouseDown}
                style={style}
                title={title}
                tabIndex={0}
            >
                {content}
            </button>
        );
    }

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            style={style}
            title={title}
            role="button"
            tabIndex={0}
        >
            {content}
        </div>
    );
};

export default CollaboratorAvatar;
