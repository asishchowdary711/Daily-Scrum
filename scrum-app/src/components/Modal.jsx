import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        if (!isOpen) return undefined;

        document.body.style.overflow = 'hidden';

        const onEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onEsc);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(2, 6, 23, 0.45)' }}
                onClick={onClose}
            />

            <div className={clsx(
                'relative glass-card p-0 max-h-[85vh] flex flex-col w-full',
                size === 'sm' && 'max-w-[400px]',
                size === 'md' && 'max-w-[560px]',
                size === 'lg' && 'max-w-[720px]'
            )}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-theme shrink-0">
                    <h2 className="text-base font-semibold text-theme-primary">{title}</h2>
                    <button onClick={onClose} className="icon-btn p-1.5 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
