/**
 * formUtils — Pure utility functions for the diagnostic form.
 *
 * Extracted from form/page.jsx to enable unit testing.
 * These functions contain the core business logic of the form:
 * - Answer validation (is a value "answered"?)
 * - Progress calculation (respecting conditional visibility)
 * - Block completion tracking
 * - Conditional question visibility (config-driven showWhen)
 */

/**
 * Checks if a question's answer counts as "answered" (non-empty).
 * Used for progress tracking and block completion indicators.
 *
 * @param {*} val - The answer value
 * @returns {boolean} - true if the question has been meaningfully answered
 */
export function isAnswered(val) {
    if (val === undefined || val === null || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return false;
    return true;
}

/**
 * Determines if a question should be displayed based on its
 * `showWhen` config property.
 *
 * showWhen supports two modes:
 * - { parentId, condition: "answered" } — show when parent has any answer
 * - { parentId, contains: "text" }      — show when parent answer contains text
 *
 * @param {Object} question - The question to check
 * @param {Array} allBlocks - All form blocks (to find parent across blocks)
 * @param {Object} answers  - Current answers map
 * @returns {boolean}
 */
export function shouldShowQuestion(question, allBlocks, answers) {
    // Questions without showWhen are always visible
    if (!question.showWhen) return true;

    const { parentId, condition, contains } = question.showWhen;
    const parentAnswer = answers[parentId];

    // Mode 1: show when parent is answered (any value)
    if (condition === "answered") {
        return isAnswered(parentAnswer);
    }

    // Mode 2: show when parent answer contains specific text
    if (contains) {
        if (!parentAnswer) return false;
        const answerStr = Array.isArray(parentAnswer)
            ? parentAnswer.join(" ")
            : String(parentAnswer);
        return answerStr.toLowerCase().includes(contains.toLowerCase());
    }

    // Fallback: show the question
    return true;
}

/**
 * Non-answerable question types that are excluded from progress counting.
 */
const NON_ANSWERABLE_TYPES = new Set(["info", "section"]);

/**
 * Counts the total number of answerable, VISIBLE questions.
 * Respects conditional visibility to avoid inflated totals.
 *
 * @param {Array} blocks - Array of form blocks from diagnosticForm config
 * @param {Object} answers - Current answers map (needed for conditional check)
 * @returns {number}
 */
export function countTotalQuestions(blocks, answers = {}) {
    return blocks.reduce((sum, b) => {
        if (!b.questions) return sum;
        return sum + b.questions.filter(q => {
            if (NON_ANSWERABLE_TYPES.has(q.type)) return false;
            // Only count visible questions
            return shouldShowQuestion(q, blocks, answers);
        }).length;
    }, 0);
}

/**
 * Counts how many visible questions have been meaningfully answered.
 *
 * @param {Array} blocks - Array of form blocks
 * @param {Object} answers - Map of questionId → answer value
 * @returns {number}
 */
export function countAnsweredQuestions(blocks, answers) {
    return blocks.reduce((sum, b) => {
        if (!b.questions) return sum;
        return sum + b.questions.filter(q => {
            if (NON_ANSWERABLE_TYPES.has(q.type)) return false;
            if (!shouldShowQuestion(q, blocks, answers)) return false;
            return isAnswered(answers[q.id]);
        }).length;
    }, 0);
}

/**
 * Calculates overall form progress as a percentage (0-100).
 *
 * @param {Array} blocks
 * @param {Object} answers
 * @returns {number}
 */
export function calculateProgress(blocks, answers) {
    const total = countTotalQuestions(blocks, answers);
    if (total === 0) return 0;
    return (countAnsweredQuestions(blocks, answers) / total) * 100;
}

/**
 * Checks if a specific block has at least one answered question.
 * Used for the sidebar completion indicators (✓ icons).
 *
 * @param {Object} block - A single form block
 * @param {Object} answers - Map of questionId → answer value
 * @returns {boolean}
 */
export function blockHasAnswers(block, answers) {
    if (!block.questions) return false;
    return block.questions.some(q => {
        if (NON_ANSWERABLE_TYPES.has(q.type)) return false;
        return isAnswered(answers[q.id]);
    });
}
