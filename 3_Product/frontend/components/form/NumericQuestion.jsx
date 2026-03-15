"use client";

/**
 * NumericQuestion — Numeric input field with optional comment.
 *
 * Props:
 *   question:        { id, q }
 *   value:           number|string — current value
 *   onChange:        (newValue) => void
 *   comment:         string — optional comment text
 *   onCommentChange: (newComment) => void
 */
export default function NumericQuestion({ question, value, onChange, comment, onCommentChange }) {
    return (
        <div>
            <input
                type="number"
                value={value ?? ""}
                onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Indicar número..."
                className="w-full max-w-[200px] py-2.5 px-3 border border-border rounded-lg bg-white text-sm text-text outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 transition-colors"
                min={0}
            />
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
