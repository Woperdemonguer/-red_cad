"use client";

/**
 * DropdownQuestion — Select dropdown for single-choice from a long list.
 *
 * Props:
 *   question: { id, q, options }
 *   value:    string — currently selected option
 *   onChange: (newValue) => void
 */
export default function DropdownQuestion({ question, value, onChange }) {
    return (
        <div>
            <select
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                className="w-full max-w-[400px] py-2.5 px-3 border border-border rounded-lg bg-white text-sm text-text outline-none focus:border-sage focus:ring-1 focus:ring-sage/30 transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
                <option value="">Seleccionar...</option>
                {question.options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}
