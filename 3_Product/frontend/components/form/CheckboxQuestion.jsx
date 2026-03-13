"use client";
import { useState } from "react";

/**
 * CheckboxQuestion — Multi-select question with optional "Otro" free-text field.
 *
 * Props:
 *   question:        { id, q, options, hasOther, hasComment }
 *   value:           string[] — currently selected options
 *   onChange:        (newValue) => void
 *   comment:         string — optional comment text
 *   onCommentChange: (newComment) => void
 */
export default function CheckboxQuestion({ question, value: rawValue = [], onChange, comment, onCommentChange }) {
    const value = Array.isArray(rawValue) ? rawValue : [];

    const [otherText, setOtherText] = useState(() => {
        const otherVal = value.find(v => v?.startsWith("otro:"));
        return otherVal ? otherVal.slice(5) : "";
    });

    const toggle = (opt) => {
        const next = value.includes(opt)
            ? value.filter(v => v !== opt)
            : [...value, opt];
        onChange(next);
    };

    return (
        <div>
            <div className="flex flex-col gap-1.5">
                {question.options.map((opt, i) => (
                    <label
                        key={i}
                        className={`flex items-start gap-2.5 cursor-pointer px-3 py-1.5 rounded-lg transition-colors ${
                            value.includes(opt) ? "bg-sand" : "hover:bg-sand/50"
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={value.includes(opt)}
                            onChange={() => toggle(opt)}
                            className="mt-0.5 accent-forest"
                        />
                        <span className="text-sm text-text leading-relaxed">{opt}</span>
                    </label>
                ))}
                {question.hasOther && (
                    <label className="flex items-start gap-2.5 px-3 py-1.5">
                        <input
                            type="checkbox"
                            checked={value.some(v => v.startsWith("otro:"))}
                            onChange={() => {
                                const tag = `otro:${otherText}`;
                                toggle(tag);
                            }}
                            className="mt-0.5 accent-forest"
                        />
                        <div className="flex-1">
                            <span className="text-[13px] text-textLight">Otro:</span>
                            <input
                                type="text"
                                value={otherText}
                                onChange={e => setOtherText(e.target.value)}
                                placeholder="Especificar..."
                                className="block w-full mt-1 py-1.5 border-0 border-b border-border bg-transparent text-sm text-text outline-none focus:border-sage"
                            />
                        </div>
                    </label>
                )}
            </div>
            {question.hasComment && (
                <div className="mt-3 pl-3">
                    <input
                        type="text"
                        value={comment || ""}
                        onChange={e => onCommentChange(e.target.value)}
                        placeholder="Comentario opcional..."
                        className="w-full py-2 border-0 border-b border-dashed border-border bg-transparent text-[13px] text-textLight outline-none italic focus:border-sage"
                    />
                </div>
            )}
        </div>
    );
}
