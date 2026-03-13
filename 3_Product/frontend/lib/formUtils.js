/**
 * formUtils — Pure utility functions for the diagnostic form.
 *
 * Extracted from form/page.jsx to enable unit testing.
 * These functions contain the core business logic of the form:
 * - Answer validation (is a value "answered"?)
 * - Progress calculation
 * - Block completion tracking
 * - Conditional question visibility
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
 * Counts the total number of answerable questions (excludes "info" type).
 *
 * @param {Array} blocks - Array of form blocks from diagnosticForm config
 * @returns {number}
 */
export function countTotalQuestions(blocks) {
    return blocks.reduce(
        (sum, b) => sum + b.questions.filter(q => q.type !== "info").length,
        0
    );
}

/**
 * Counts how many questions have been meaningfully answered.
 *
 * @param {Array} blocks - Array of form blocks
 * @param {Object} answers - Map of questionId → answer value
 * @returns {number}
 */
export function countAnsweredQuestions(blocks, answers) {
    return blocks.reduce((sum, b) => {
        return sum + b.questions.filter(q => {
            if (q.type === "info") return false;
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
    const total = countTotalQuestions(blocks);
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
    return block.questions.some(q => {
        if (q.type === "info") return false;
        return isAnswered(answers[q.id]);
    });
}

/**
 * Determines if a conditional question should be displayed based
 * on the previous question's answer.
 *
 * Rules:
 * - Non-conditional questions are always shown
 * - First question in a block is always shown
 * - Conditional questions appear only if the previous answer
 *   contains negative keywords ("no", "actualizar", "incorrectos")
 *
 * @param {Object} question - The question to check
 * @param {Array} blockQuestions - All questions in the block
 * @param {Object} answers - Current answers map
 * @returns {boolean}
 */
export function shouldShowQuestion(question, blockQuestions, answers) {
    if (!question.conditional) return true;
    const qIndex = blockQuestions.findIndex(q => q.id === question.id);
    if (qIndex <= 0) return true;
    const prevQ = blockQuestions[qIndex - 1];
    const prevAnswer = answers[prevQ.id];
    if (!prevAnswer) return false;
    const negativeKeywords = ["no", "actualizar", "incorrectos"];
    return negativeKeywords.some(kw => prevAnswer.toLowerCase().includes(kw));
}
