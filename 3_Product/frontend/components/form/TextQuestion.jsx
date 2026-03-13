/**
 * TextQuestion — Free-text textarea question.
 *
 * Props:
 *   question: { id, q, optional }
 *   value:    string
 *   onChange: (newValue) => void
 */
export default function TextQuestion({ question, value, onChange }) {
    return (
        <textarea
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={question.optional ? "Opcional..." : "Escribe aquí..."}
            rows={3}
            className="w-full p-3 border border-border rounded-lg bg-white text-sm text-text resize-y outline-none font-[inherit] transition-colors focus:border-sage"
        />
    );
}
