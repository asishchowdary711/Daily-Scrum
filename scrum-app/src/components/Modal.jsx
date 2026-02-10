import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={clsx(
                "relative glass-card p-0 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col",
                size === 'sm' && "w-[400px]",
                size === 'md' && "w-[560px]",
                size === 'lg' && "w-[720px]",
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
