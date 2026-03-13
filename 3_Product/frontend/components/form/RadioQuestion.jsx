"use client";
import { useState } from "react";

/**
 * RadioQuestion — Single-select question with optional "Otro" free-text field.
 *
 * Props:
 *   question:        { id, q, options, hasOther, hasComment }
 *   value:           string — currently selected option
 *   onChange:        (newValue) => void
 *   comment:         string — optional comment text
 *   onCommentChange: (newComment) => void
 */
export default function RadioQuestion({ question, value, onChange, comment, onCommentChange }) {
    const [otherText, setOtherText] = useState(() => {
        if (value?.startsWith("otro:")) return value.slice(5);
        return "";
    });

    return (
        <div>
            <div className="flex flex-col gap-2">
                {question.options.map((opt, i) => (
                    <label
                        key={i}
                        className={`flex items-start gap-2.5 cursor-pointer px-3 py-2 rounded-lg transition-colors ${
                            value === opt ? "bg-sand" : "hover:bg-sand/50"
                        }`}
                    >
                        <input
                            type="radio"
                            name={question.id}
                            checked={value === opt}
                            onChange={() => onChange(opt)}
                            className="mt-0.5 accent-forest"
                        />
                        <span className="text-sm text-text leading-relaxed">{opt}</span>
                    </label>
                ))}
                {question.hasOther && (
                    <label
                        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                            value?.startsWith("otro:") ? "bg-sand" : "hover:bg-sand/50"
                        }`}
                    >
                        <input
                            type="radio"
                            name={question.id}
                            checked={value?.startsWith("otro:")}
                            onChange={() => onChange(`otro:${otherText}`)}
                            className="mt-0.5 accent-forest"
                        />
                        <div className="flex-1">
                            <span className="text-sm text-textLight">Otro:</span>
                            <input
                                type="text"
                                value={otherText}
                                onChange={e => {
                                    setOtherText(e.target.value);
                                    onChange(`otro:${e.target.value}`);
                                }}
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
