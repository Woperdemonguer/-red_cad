"use client";
import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Save, CheckCircle2, Home, Info, HelpCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { formService } from "@/lib/supabaseService";
import { isAnswered, countTotalQuestions, countAnsweredQuestions, shouldShowQuestion } from "@/lib/formUtils";
import { MADUREZ_TOOLTIPS, blocks } from "@/config/diagnosticForm";

// Extracted question-type components
import RadioQuestion from "@/components/form/RadioQuestion";
import CheckboxQuestion from "@/components/form/CheckboxQuestion";
import TextQuestion from "@/components/form/TextQuestion";
import InfoQuestion from "@/components/form/InfoQuestion";
import MatrixQuestion from "@/components/form/MatrixQuestion";
import NumericQuestion from "@/components/form/NumericQuestion";
import DropdownQuestion from "@/components/form/DropdownQuestion";

// Tooltip component for per-question help text (hover + click)
function QuestionTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block ml-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-warmGray hover:text-sage transition-colors bg-transparent border-none cursor-pointer p-0"
        aria-label="Más información"
      >
        <HelpCircle size={15} />
      </button>
      {open && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-7 w-72 sm:w-80 bg-sand border border-border rounded-xl p-3.5 text-[13px] text-warmGray leading-relaxed shadow-lg animate-fade-in">
          {text}
          <button onClick={() => setOpen(false)} className="absolute top-1.5 right-2.5 text-warmGray hover:text-text bg-transparent border-none cursor-pointer text-base">×</button>
        </div>
      )}
    </span>
  );
}

function FormComponent() {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const topRef = useRef(null);
  const searchParams = useSearchParams();
  const targetCadId = searchParams.get("cad_id");
  const [targetEmail, setTargetEmail] = useState(null);
  const { email: userEmail, isAdmin, loading: authLoading } = useAuth();

  const block = blocks[currentBlock];

  // F6 fix: Warn on unsaved changes (same pattern as profile page)
  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // G3 fix: Calculate progress — now respects conditional visibility
  const totalQuestions = useMemo(() => countTotalQuestions(blocks, answers), [answers]);
  const answeredQuestions = useMemo(() => countAnsweredQuestions(blocks, answers), [answers]);
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // G2 fix: Check if a block has any answers
  const blockHasAnswers = (blockIndex) => {
    const b = blocks[blockIndex];
    return b.questions.some(q => {
      if (q.type === "info") return false;
      return isAnswered(answers[q.id]);
    });
  };

  // Resolve the target email and load answers once auth resolves
  useEffect(() => {
    if (authLoading || !userEmail) return;

    async function init() {
      try {
        let loadEmail = userEmail;

        // Admin viewing a specific CAD's form
        if (targetCadId && isAdmin) {
          const resolvedEmail = await formService.getFormOwnerEmail(targetCadId);
          if (resolvedEmail) loadEmail = resolvedEmail;
        }

        setTargetEmail(loadEmail);

        // Load saved answers (F1: check for submitted_at)
        const savedData = await formService.load(loadEmail);
        if (savedData) {
          const { submitted_at, ...formAnswers } = savedData;
          setAnswers(formAnswers);
          if (submitted_at) {
            setSubmitted(true);
          }
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
      setLastSavedAt(new Date());
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
    // F1 fix: persist submitted_at timestamp
    const toastId = toast.loading("Enviando formulario...");
    const submittedAnswers = { ...answers, submitted_at: new Date().toISOString() };
    setSaving(true);
    try {
      await formService.save(targetEmail, submittedAnswers);
      setSubmitted(true);
      setHasUnsavedChanges(false);
      toast.success("¡Formulario validado y enviado con éxito!", { id: toastId });
    } catch (err) {
      toast.error("Error al enviar: " + err.message, { id: toastId });
    }
    setSaving(false);
  };

  // Conditional check now uses config-driven showWhen
  const isQuestionVisible = (question) => {
    return shouldShowQuestion(question, blocks, answers);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-[500px] p-10">
          <div className="text-[64px] mb-6">🌿</div>
          <h2 className="text-2xl text-text mb-4 font-bold">Formulario completado</h2>
          <p className="text-[15px] text-warmGray leading-relaxed">
            Gracias por dedicar este tiempo. Las respuestas ayudarán a construir una red más fuerte y mejor conectada.
          </p>
          <p className="text-[13px] text-textLight mt-6 italic">
            "Hay que cuidar la red para que la red nos cuide"
          </p>
          {/* Nav fix: Add "Volver al inicio" button */}
          <Link href="/dashboard" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-accent text-text font-bold rounded-xl hover:bg-accentHover transition-colors">
            <Home size={18} /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans flex flex-col md:flex-row relative" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div ref={topRef} className="absolute -top-20" />

      {/* Sidebar (Desktop) / Top Nav (Mobile) */}
      <div className="w-full md:w-72 md:h-[calc(100vh-64px)] md:sticky md:top-16 md:overflow-y-auto flex-shrink-0 z-20 bg-white border-r border-border">
        <div className="p-6">
          <div className="hidden md:block mb-8">
            <span className="text-[11px] text-warmGray uppercase tracking-[2px] font-sans">Red Estatal de CAD</span>
            <h1 className="text-xl text-text mt-1.5 font-semibold">Formulario de diagnóstico</h1>
          </div>
          
          <div className="md:hidden flex items-center justify-between mb-2">
             <h1 className="text-base text-text font-medium">Formulario de diagnóstico</h1>
             <span className="text-xs text-warmGray">{currentBlock + 1} / {blocks.length}</span>
          </div>

          {/* Progress bar — G3 fix: now tracks answered questions */}
          <div className="hidden md:block h-1.5 bg-sand rounded-sm mb-2">
            <div className="h-full bg-accent rounded-sm transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="hidden md:block text-xs text-warmGray mb-8 text-right">
            {answeredQuestions} / {totalQuestions} preguntas respondidas
          </div>

          {/* Nav List — G2 fix: block completion indicators */}
          <div className="relative flex overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {/* P10 fix: scroll fade for mobile */}
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
            {blocks.map((b, i) => {
              const isActive = i === currentBlock;
              const hasAnswers = blockHasAnswers(i);
              return (
                <button 
                  key={i} 
                  onClick={async () => {
                    if (hasUnsavedChanges) {
                      await saveAnswers(answers);
                      setHasUnsavedChanges(false);
                    }
                    setCurrentBlock(i);
                  }} 
                  className={`flex items-center gap-3 text-left w-auto md:w-full flex-shrink-0 px-3.5 py-2.5 rounded-xl border-none cursor-pointer transition-all ${
                    isActive
                      ? "bg-accentLight text-text font-semibold"
                      : "bg-transparent text-textLight hover:bg-sand"
                  }`}
                >
                  <span className={`text-lg ${isActive ? "opacity-100" : "opacity-70"}`}>{b.icon}</span> 
                  <span className="hidden md:inline text-[13px] leading-tight">{b.title}</span>
                  <span className="md:hidden text-[13px] whitespace-nowrap">{b.title}</span>
                  {hasAnswers && !isActive && (
                    <CheckCircle2 size={14} className="text-sage ml-auto hidden md:block flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full mx-auto pb-24 relative" style={{ maxWidth: 800 }}>
        <div className="px-[5%] py-10">
          {/* Block intro */}
          <div className="mb-10">
            <div className="flex items-center gap-3.5 mb-3">
              <span className="text-[32px]">{block.icon}</span>
              <h2 className="text-2xl text-text m-0 font-bold">{block.title}</h2>
            </div>
            <p className="text-[15px] text-warmGray leading-relaxed m-0">{block.intro}</p>
          </div>

          {/* Intro page — rich content rendering */}
          {block.type === "intro" && block.content && (
            <div className="flex flex-col gap-6">
              {block.content.paragraphs?.map((p, i) => (
                <p key={i} className="text-[15px] text-text leading-relaxed m-0">{p}</p>
              ))}
              {block.content.sections?.map((s, i) => (
                <div key={i} className="bg-sand/50 rounded-2xl px-7 py-5 border border-border/50">
                  <h3 className="text-base text-text font-semibold mb-3">{s.title}</h3>
                  <ul className="m-0 pl-5 flex flex-col gap-1.5">
                    {s.items.map((item, j) => (
                      <li key={j} className="text-[14px] text-warmGray leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {block.content.contact && (
                <div className="bg-white rounded-2xl px-7 py-5 border border-border shadow-sm">
                  <h3 className="text-base text-text font-semibold mb-3">Contacto</h3>
                  <p className="text-[14px] text-warmGray m-0 mb-2">Email: <a href={`mailto:${block.content.contact.email}`} className="text-sage hover:underline">{block.content.contact.email}</a></p>
                  <div className="flex flex-col gap-1">
                    {block.content.contact.people?.map((p, i) => (
                      <p key={i} className="text-[14px] text-warmGray m-0">{p.name} ({p.role}) — {p.phone}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questions rendering */}
          <div className="flex flex-col gap-8">
            {block.questions.map((q) => {
              // Section headers — visual separator within block
              if (q.type === "section") {
                return (
                  <div key={q.id} className="mt-4 first:mt-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-warmGray uppercase tracking-[1.5px] font-semibold whitespace-nowrap">{q.title}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </div>
                );
              }

              // Skip hidden conditional questions
              if (!isQuestionVisible(q)) return null;

              return (
                <div key={q.id} className="bg-white rounded-2xl px-7 py-6 shadow-sm border border-border transition-all duration-300 animate-fade-in">
                  <div className="flex items-start gap-2.5 mb-4">
                    <span className="text-xs text-sage font-sans font-bold mt-0.5 flex-shrink-0 bg-sand px-1.5 py-0.5 rounded">{q.id}</span>
                    <p className="text-base text-text m-0 leading-relaxed font-semibold">
                      {q.q}
                      {q.optional && <span className="text-[13px] text-textLight italic font-normal"> (opcional)</span>}
                      {q.tooltip && <QuestionTooltip text={q.tooltip} />}
                    </p>
                  </div>

                  {q.type === "radio" && <RadioQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} comment={answers[q.id + "_comment"]} onCommentChange={v => setAnswer(q.id + "_comment", v)} />}
                  {q.type === "checkbox" && <CheckboxQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} comment={answers[q.id + "_comment"]} onCommentChange={v => setAnswer(q.id + "_comment", v)} />}
                  {q.type === "textarea" && <TextQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />}
                  {q.type === "info" && <InfoQuestion question={q} />}
                  {q.type === "matrix" && <MatrixQuestion question={q} value={answers[q.id] || {}} onChange={v => setAnswer(q.id, v)} tooltips={MADUREZ_TOOLTIPS} />}
                  {q.type === "numeric" && <NumericQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} comment={answers[q.id + "_comment"]} onCommentChange={v => setAnswer(q.id + "_comment", v)} />}
                  {q.type === "dropdown" && <DropdownQuestion question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />}
                  {q.type === "file" && (
                    <div className="text-[13px] text-warmGray italic bg-sand/50 rounded-lg px-4 py-3">
                      📎 La subida de archivos estará disponible próximamente.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer Navigation */}
        <div className="fixed bottom-0 left-0 md:left-72 right-0 bg-white border-t border-border px-[5%] py-3 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <div className="flex justify-between items-center max-w-[800px] mx-auto">
            <button
              onClick={() => currentBlock > 0 && setCurrentBlock(currentBlock - 1)}
              disabled={currentBlock === 0}
              className={`px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-sans transition-all ${
                currentBlock === 0 ? "text-border cursor-default" : "text-warmGray cursor-pointer hover:bg-sand"
              }`}
            >
              ← Anterior
            </button>

            {/* Save Button + Last Saved timestamp (P9) */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleSaveProgress}
                disabled={saving || !hasUnsavedChanges}
                className={`px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm font-sans transition-all ${
                  hasUnsavedChanges
                    ? "bg-accent text-text border-none cursor-pointer shadow-[0_2px_8px_rgba(232,169,35,0.3)]"
                    : "bg-sand text-warmGray border border-border cursor-default"
                } ${saving ? "cursor-wait scale-95" : "scale-100"}`}
              >
                <Save size={16} />
                {saving ? "Guardando..." : hasUnsavedChanges ? "Guardar" : "✓ Guardado"}
              </button>
              {lastSavedAt && !hasUnsavedChanges && (
                <span className="text-[10px] text-warmGray mt-1">
                  Guardado a las {lastSavedAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>

            {currentBlock < blocks.length - 1 ? (
              <button
                onClick={handleNextBlock}
                disabled={saving}
                className="px-7 py-2.5 rounded-xl border-none bg-accent text-text text-sm font-bold cursor-pointer font-sans transition-all hover:bg-accentHover disabled:opacity-70 disabled:cursor-wait"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={saving}
                className="px-7 py-2.5 rounded-xl border-none bg-forest text-white text-sm font-bold cursor-pointer font-sans disabled:opacity-70"
              >
                {saving ? "Enviando..." : "Enviar ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormularioRedCAD() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-accent">Cargando formulario...</div></div>}>
      <FormComponent />
    </Suspense>
  );
}
