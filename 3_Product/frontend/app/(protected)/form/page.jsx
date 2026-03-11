"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { HelpCircle, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { MADUREZ_TOOLTIPS, blocks } from "@/config/diagnosticForm";

const COLORS = {
  forest: "#2E5339",
  forestLight: "#3c6b4a",
  sage: "#8BAA7C",
  cream: "#FAFAF5",
  sand: "#F0EDE4",
  border: "#EBE4D5",
  text: "#2D3748",
  textLight: "#718096",
  warmGray: "#7c7c72",
  accent: "#D4A843",
  white: "#FFFFFF"
};

function RadioQuestion({ question, value, onChange, comment, onCommentChange }) {
  // Extract otherText from saved value if it starts with "otro:"
  const [otherText, setOtherText] = useState(() => {
    if (value?.startsWith("otro:")) return value.slice(5);
    return "";
  });
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options.map((opt, i) => (
          <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, background: value === opt ? COLORS.sand : "transparent", transition: "background 0.2s" }}>
            <input type="radio" name={question.id} checked={value === opt} onChange={() => onChange(opt)} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.5 }}>{opt}</span>
          </label>
        ))}
        {question.hasOther && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", borderRadius: 8, background: value?.startsWith("otro:") ? COLORS.sand : "transparent" }}>
            <input type="radio" name={question.id} checked={value?.startsWith("otro:")} onChange={() => onChange(`otro:${otherText}`)} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, color: COLORS.textLight }}>Otro:</span>
              <input type="text" value={otherText} onChange={e => { setOtherText(e.target.value); onChange(`otro:${e.target.value}`); }} placeholder="Especificar..." style={{ display: "block", width: "100%", marginTop: 4, padding: "6px 0", border: "none", borderBottom: `1px solid ${COLORS.border}`, background: "transparent", fontSize: 14, color: COLORS.text, outline: "none" }} />
            </div>
          </label>
        )}
      </div>
      {question.hasComment && (
        <div style={{ marginTop: 12, paddingLeft: 12 }}>
          <input type="text" value={comment || ""} onChange={e => onCommentChange(e.target.value)} placeholder="Comentario opcional..." style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: `1px dashed ${COLORS.border}`, background: "transparent", fontSize: 13, color: COLORS.textLight, outline: "none", fontStyle: "italic" }} />
        </div>
      )}
    </div>
  );
}

function CheckboxQuestion({ question, value = [], onChange, comment, onCommentChange }) {
  // Extract otherText from saved values (look for any value starting with "otro:")
  const [otherText, setOtherText] = useState(() => {
    const otherVal = value.find(v => v?.startsWith("otro:"));
    return otherVal ? otherVal.slice(5) : "";
  });
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {question.options.map((opt, i) => (
          <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "6px 12px", borderRadius: 8, background: value.includes(opt) ? COLORS.sand : "transparent", transition: "background 0.2s" }}>
            <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.5 }}>{opt}</span>
          </label>
        ))}
        {question.hasOther && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 12px" }}>
            <input type="checkbox" checked={value.some(v => v.startsWith("otro:"))} onChange={() => { const tag = `otro:${otherText}`; toggle(tag); }} style={{ marginTop: 3, accentColor: COLORS.forest }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: COLORS.textLight }}>Otro:</span>
              <input type="text" value={otherText} onChange={e => setOtherText(e.target.value)} placeholder="Especificar..." style={{ display: "block", width: "100%", marginTop: 4, padding: "6px 0", border: "none", borderBottom: `1px solid ${COLORS.border}`, background: "transparent", fontSize: 14, color: COLORS.text, outline: "none" }} />
            </div>
          </label>
        )}
      </div>
      {question.hasComment && (
        <div style={{ marginTop: 12, paddingLeft: 12 }}>
          <input type="text" value={comment || ""} onChange={e => onCommentChange(e.target.value)} placeholder="Comentario opcional..." style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: `1px dashed ${COLORS.border}`, background: "transparent", fontSize: 13, color: COLORS.textLight, outline: "none", fontStyle: "italic" }} />
        </div>
      )}
    </div>
  );
}

function TextQuestion({ question, value, onChange }) {
  return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={question.optional ? "Opcional..." : "Escribe aquí..."} rows={3} style={{ width: "100%", padding: 12, border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.white, fontSize: 14, color: COLORS.text, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border 0.2s" }} onFocus={e => e.target.style.borderColor = COLORS.sage} onBlur={e => e.target.style.borderColor = COLORS.border} />
  );
}

function InfoQuestion({ question }) {
  return (
    <div style={{ padding: 16, background: COLORS.sand, borderRadius: 8, borderLeft: `3px solid ${COLORS.sage}` }}>
      <p style={{ fontSize: 13, color: COLORS.warmGray, margin: 0, lineHeight: 1.6 }}>{question.description}</p>
    </div>
  );
}

function MatrixQuestion({ question, value = {}, onChange }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const handleSelect = (row, opt) => {
    onChange({ ...value, [row]: opt });
  };

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ minWidth: 500 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 8, marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8 }}>
          <div></div>
          {question.options.map((opt, i) => (
            <div key={i} style={{ fontSize: 12, fontWeight: 600, color: COLORS.textLight, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 20 }}>{opt.split(" ")[0]}</span>
              <span>{opt.substring(2)}</span>
            </div>
          ))}
        </div>

        {question.rows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: i < question.rows.length - 1 ? `1px dashed ${COLORS.border}` : "none" }}>

            <div style={{ fontSize: 14, color: COLORS.text, position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{row}</span>
              {MADUREZ_TOOLTIPS[row] && (
                <div
                  onMouseEnter={() => setActiveTooltip(row)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === row ? null : row)}
                  style={{ cursor: "pointer", color: COLORS.sage }}
                >
                  <HelpCircle size={14} />
                  {activeTooltip === row && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, zIndex: 50, marginTop: 4,
                      background: COLORS.text, color: COLORS.white, padding: "8px 12px",
                      borderRadius: 6, fontSize: 12, lineHeight: 1.4, width: 250,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)", pointerEvents: "none"
                    }}>
                      {MADUREZ_TOOLTIPS[row]}
                    </div>
                  )}
                </div>
              )}
            </div>

            {question.options.map((opt, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "center" }}>
                <input
                  type="radio"
                  name={`${question.id}-${row}`}
                  checked={value[row] === opt}
                  onChange={() => handleSelect(row, opt)}
                  style={{ width: 18, height: 18, accentColor: COLORS.forest, cursor: "pointer" }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FormComponent() {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const topRef = useRef(null);
  const searchParams = useSearchParams();
  const targetCadId = searchParams.get("cad_id");
  const [targetEmail, setTargetEmail] = useState(null);
  const { email: userEmail, isAdmin, loading: authLoading } = useAuth();

  const block = blocks[currentBlock];
  const progress = ((currentBlock) / blocks.length) * 100;

  // Resolve the target email and load answers once auth resolves
  useEffect(() => {
    if (authLoading || !userEmail) return;

    async function init() {
      try {
        let loadEmail = userEmail;

        // Admin viewing a specific CAD's form
        if (targetCadId && isAdmin) {
          const resolvedEmail = await formService.resolveEmail(targetCadId);
          if (resolvedEmail) loadEmail = resolvedEmail;
        }

        setTargetEmail(loadEmail);

        // Load saved answers
        const savedAnswers = await formService.load(loadEmail);
        if (savedAnswers) {
          setAnswers(savedAnswers);
        }
      } catch (err) {
        toast.error("Error cargando el formulario: " + err.message);
      }
    }

    init();
  }, [authLoading, userEmail, isAdmin, targetCadId]);

  const saveAnswers = async (currentAnswers) => {
    if (!targetEmail) return;
    setSaving(true);
    try {
      await formService.save(targetEmail, currentAnswers);
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentBlock]);

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setHasUnsavedChanges(true);
  };

  const handleSaveProgress = async () => {
    const toastId = toast.loading("Guardando progreso...");
    await saveAnswers(answers);
    setHasUnsavedChanges(false);
    toast.success("Progreso guardado correctamente", { id: toastId });
  };

  const handleNextBlock = async () => {
    if (hasUnsavedChanges) {
      await saveAnswers(answers);
      setHasUnsavedChanges(false);
    }
    setCurrentBlock(currentBlock + 1);
  };

  const handleFinalSubmit = async () => {
    if (hasUnsavedChanges) {
      await saveAnswers(answers);
      setHasUnsavedChanges(false);
    }
    setSubmitted(true);
    toast.success("¡Formulario validado y enviado con éxito!");
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🌿</div>
          <h2 style={{ fontSize: 24, color: COLORS.forest, marginBottom: 16, fontWeight: 700 }}>Formulario completado</h2>
          <p style={{ fontSize: 15, color: COLORS.warmGray, lineHeight: 1.7 }}>
            Gracias por dedicar este tiempo. Las respuestas ayudarán a construir una red más fuerte y mejor conectada.
          </p>
          <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 24, fontStyle: "italic" }}>
            "Hay que cuidar la red para que la red nos cuide"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans" style={{ minHeight: "100vh", background: COLORS.cream }}>
      <div ref={topRef} />

      {/* Header */}
      <div style={{ background: COLORS.forest, padding: "20px 24px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, color: COLORS.sage, textTransform: "uppercase", letterSpacing: 2, fontFamily: "system-ui, sans-serif" }}>Red Estatal de CAD</span>
              <h1 style={{ fontSize: 16, color: COLORS.white, margin: "4px 0 0", fontWeight: 400 }}>Formulario de diagnóstico</h1>
            </div>
            <span style={{ fontSize: 12, color: COLORS.sage, fontFamily: "system-ui, sans-serif" }}>
              {currentBlock + 1} / {blocks.length}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 4, marginTop: 4, marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: COLORS.sage, borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>

          {/* Block navigation pills */}
          <div style={{ display: "flex", gap: 4, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
            {blocks.map((b, i) => (
              <button key={i} onClick={() => setCurrentBlock(i)} style={{ flex: "0 0 auto", padding: "4px 10px", borderRadius: 12, border: "none", background: i === currentBlock ? COLORS.sage : "rgba(255,255,255,0.1)", color: i === currentBlock ? COLORS.forest : "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", transition: "all 0.2s", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" }}>
                {b.icon} {b.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 120px" }}>
        {/* Block intro */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{block.icon}</span>
            <h2 style={{ fontSize: 20, color: COLORS.forest, margin: 0, fontWeight: 700 }}>
              {block.title}
            </h2>
          </div>
          <p style={{ fontSize: 14, color: COLORS.warmGray, lineHeight: 1.7, margin: 0, paddingLeft: 0 }}>
            {block.intro}
          </p>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {block.questions.map((q) => (
            <div key={q.id} style={{ background: COLORS.white, borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: COLORS.sage, fontFamily: "system-ui, sans-serif", fontWeight: 600, marginTop: 2, flexShrink: 0 }}>{q.id}</span>
                <p style={{ fontSize: 15, color: COLORS.text, margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                  {q.q}
                  {q.optional && <span style={{ fontSize: 12, color: COLORS.textLight, fontStyle: "italic", fontWeight: 400 }}> (opcional)</span>}
                </p>
              </div>

              {q.type === "radio" && <RadioQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} comment={answers[q.id + "_comment"]} onCommentChange={v => setAnswer(q.id + "_comment", v)} />}
              {q.type === "checkbox" && <CheckboxQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} comment={answers[q.id + "_comment"]} onCommentChange={v => setAnswer(q.id + "_comment", v)} />}
              {q.type === "textarea" && <TextQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />}
              {q.type === "info" && <InfoQuestion question={q} />}
              {q.type === "matrix" && <MatrixQuestion question={q} value={answers[q.id] || {}} onChange={v => setAnswer(q.id, v)} />}
            </div>
          ))}
        </div>
      </div>

      {/* Footer navigation */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.white, borderTop: `1px solid ${COLORS.border}`, padding: "12px 20px", zIndex: 10 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => currentBlock > 0 && setCurrentBlock(currentBlock - 1)} disabled={currentBlock === 0} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.white, color: currentBlock === 0 ? COLORS.border : COLORS.warmGray, fontSize: 14, cursor: currentBlock === 0 ? "default" : "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s" }}>
            ← Anterior
          </button>

          <span style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "system-ui, sans-serif" }}>
            Bloque {currentBlock + 1} de {blocks.length}
          </span>

          {currentBlock < blocks.length - 1 ? (
            <button onClick={handleNextBlock} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: COLORS.forest, color: COLORS.white, fontSize: 14, cursor: saving ? "wait" : "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s", opacity: saving ? 0.7 : 1 }} onMouseEnter={e => !saving && (e.target.style.background = COLORS.forestLight)} onMouseLeave={e => !saving && (e.target.style.background = COLORS.forest)}>
              {saving ? "Guardando..." : "Siguiente →"}
            </button>
          ) : (
            <button onClick={handleFinalSubmit} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, fontSize: 14, cursor: saving ? "wait" : "pointer", fontFamily: "system-ui, sans-serif", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Guardando..." : "Enviar ✓"}
            </button>
          )}
        </div>
      </div>

      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <div style={{ position: "fixed", bottom: 85, right: 24, zIndex: 50 }}>
          <button
            onClick={handleSaveProgress}
            disabled={saving}
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              padding: "12px 24px",
              borderRadius: "30px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              cursor: saving ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar mis cambios"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function FormularioRedCAD() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: COLORS.cream, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: COLORS.forest }}>Cargando formulario...</div></div>}>
      <FormComponent />
    </Suspense>
  );
}
