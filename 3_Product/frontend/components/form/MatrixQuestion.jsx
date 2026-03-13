"use client";
import { useState } from "react";
import { HelpCircle } from "lucide-react";

/**
 * MatrixQuestion — Grid/matrix question with radio buttons per row.
 *
 * Props:
 *   question:  { id, options: string[], rows: string[] }
 *   value:     Record<string, string> — { [rowLabel]: selectedOption }
 *   onChange:  (newValue) => void
 *   tooltips:  Record<string, string> — optional tooltip map for row labels
 */
export default function MatrixQuestion({ question, value = {}, onChange, tooltips = {} }) {
    const [activeTooltip, setActiveTooltip] = useState(null);

    const handleSelect = (row, opt) => {
        onChange({ ...value, [row]: opt });
    };

    return (
        <div className="overflow-x-auto pb-2">
            <div className="min-w-[500px]">
                {/* Column Headers */}
                <div className="grid gap-2 mb-3 border-b border-border pb-2"
                     style={{ gridTemplateColumns: `1fr repeat(${question.options.length}, 1fr)` }}>
                    <div />
                    {question.options.map((opt, i) => (
                        <div key={i} className="text-xs font-semibold text-textLight text-center flex flex-col items-center gap-1">
                            <span className="text-xl">{opt.split(" ")[0]}</span>
                            <span>{opt.substring(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {question.rows.map((row, i) => (
                    <div
                        key={i}
                        className={`grid gap-2 items-center py-2 ${
                            i < question.rows.length - 1 ? "border-b border-dashed border-border" : ""
                        }`}
                        style={{ gridTemplateColumns: `1fr repeat(${question.options.length}, 1fr)` }}
                    >
                        <div className="text-sm text-text relative flex items-center gap-1.5">
                            <span>{row}</span>
                            {tooltips[row] && (
                                <div
                                    onMouseEnter={() => setActiveTooltip(row)}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                    onClick={() => setActiveTooltip(activeTooltip === row ? null : row)}
                                    className="cursor-pointer text-sage"
                                >
                                    <HelpCircle size={14} />
                                    {activeTooltip === row && (
                                        <div className="absolute top-full left-0 z-50 mt-1 bg-text text-white p-2 px-3 rounded-md text-xs leading-snug w-[250px] shadow-lg pointer-events-none">
                                            {tooltips[row]}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {question.options.map((opt, j) => (
                            <div key={j} className="flex justify-center">
                                <input
                                    type="radio"
                                    name={`${question.id}-${row}`}
                                    checked={value[row] === opt}
                                    onChange={() => handleSelect(row, opt)}
                                    className="w-[18px] h-[18px] accent-forest cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
