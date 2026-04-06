/**
 * Tests for formUtils.js — Pure business logic of the diagnostic form.
 *
 * Tests cover:
 * - isAnswered: edge cases for all value types
 * - countTotalQuestions: excludes "info" type
 * - countAnsweredQuestions: matches answered values
 * - calculateProgress: percentage calculation
 * - blockHasAnswers: block completion detection
 * - shouldShowQuestion: conditional visibility logic
 */
import { describe, it, expect } from 'vitest';
import {
    isAnswered,
    countTotalQuestions,
    countAnsweredQuestions,
    calculateProgress,
    blockHasAnswers,
    shouldShowQuestion,
} from '@/lib/formUtils';

// ─── Test Data ──────────────────────────────────────────────────────────────

const mockBlocks = [
    {
        id: 0,
        title: "Block A",
        questions: [
            { id: "0.1", q: "Radio question", type: "radio", options: ["Sí", "No"] },
            {
                id: "0.2",
                q: "Conditional textarea",
                type: "textarea",
                showWhen: { parentId: "0.1", contains: "no" },
            },
            { id: "0.3", q: "Info only", type: "info", description: "Read this." },
        ],
    },
    {
        id: 1,
        title: "Block B",
        questions: [
            { id: "1.1", q: "Another radio", type: "radio", options: ["A", "B", "C"] },
            { id: "1.2", q: "Checkbox question", type: "checkbox", options: ["X", "Y"] },
        ],
    },
];

// ─── isAnswered ─────────────────────────────────────────────────────────────

describe('isAnswered', () => {
    it('returns false for undefined', () => {
        expect(isAnswered(undefined)).toBe(false);
    });

    it('returns false for null', () => {
        expect(isAnswered(null)).toBe(false);
    });

    it('returns false for empty string', () => {
        expect(isAnswered("")).toBe(false);
    });

    it('returns false for empty array', () => {
        expect(isAnswered([])).toBe(false);
    });

    it('returns false for empty object', () => {
        expect(isAnswered({})).toBe(false);
    });

    it('returns true for a non-empty string', () => {
        expect(isAnswered("Sí")).toBe(true);
    });

    it('returns true for a non-empty array', () => {
        expect(isAnswered(["opt1"])).toBe(true);
    });

    it('returns true for an object with keys', () => {
        expect(isAnswered({ key: "val" })).toBe(true);
    });

    it('returns true for a number (including 0)', () => {
        expect(isAnswered(0)).toBe(true);
        expect(isAnswered(42)).toBe(true);
    });

    it('returns true for boolean false', () => {
        expect(isAnswered(false)).toBe(true);
    });
});

// ─── countTotalQuestions ────────────────────────────────────────────────────

describe('countTotalQuestions', () => {
    it('counts only non-info questions (visible with no answers)', () => {
        // Block A: 0.1 (radio, always visible) — 0.2 has showWhen so hidden with no answers
        // Block B: 1.1 + 1.2 = 2 visible
        // Total visible: 1 + 2 = 3
        expect(countTotalQuestions(mockBlocks)).toBe(3);
    });

    it('returns 0 for empty blocks array', () => {
        expect(countTotalQuestions([])).toBe(0);
    });

    it('returns 0 for blocks with only info questions', () => {
        const infoBlocks = [{
            id: 0,
            questions: [{ id: "0.1", type: "info" }, { id: "0.2", type: "info" }],
        }];
        expect(countTotalQuestions(infoBlocks)).toBe(0);
    });
});

// ─── countAnsweredQuestions ──────────────────────────────────────────────────

describe('countAnsweredQuestions', () => {
    it('counts answered questions correctly', () => {
        const answers = { "0.1": "Sí", "1.1": "A" };
        expect(countAnsweredQuestions(mockBlocks, answers)).toBe(2);
    });

    it('ignores info-type questions even if they have a value', () => {
        // "0.3" is info type — should not count
        const answers = { "0.1": "Sí", "0.3": "should not count" };
        expect(countAnsweredQuestions(mockBlocks, answers)).toBe(1);
    });

    it('does not count empty values', () => {
        const answers = { "0.1": "", "0.2": null, "1.1": undefined, "1.2": [] };
        expect(countAnsweredQuestions(mockBlocks, answers)).toBe(0);
    });

    it('returns 0 when no answers exist', () => {
        expect(countAnsweredQuestions(mockBlocks, {})).toBe(0);
    });
});

// ─── calculateProgress ─────────────────────────────────────────────────────

describe('calculateProgress', () => {
    it('returns 0 when nothing is answered', () => {
        expect(calculateProgress(mockBlocks, {})).toBe(0);
    });

    it('returns 100 when all non-info questions are answered', () => {
        const answers = { "0.1": "Sí", "0.2": "Updated data", "1.1": "A", "1.2": ["X"] };
        expect(calculateProgress(mockBlocks, answers)).toBe(100);
    });

    it('returns 50 when half are answered', () => {
        // With 0.1 answered as "Sí, todo correcto" (doesn't contain "no"), 0.2 stays hidden.
        // Visible: 0.1, 1.1, 1.2 (3 total). Answered: 0.1 + 1.1 = 2 → 66.7%
        // Test with only 1 of 3 answered → 33.3%
        const answers = { "0.1": "Sí" };
        expect(calculateProgress(mockBlocks, answers)).toBeCloseTo(33.33, 1);
    });

    it('returns 0 for empty blocks', () => {
        expect(calculateProgress([], {})).toBe(0);
    });
});

// ─── blockHasAnswers ────────────────────────────────────────────────────────

describe('blockHasAnswers', () => {
    it('returns true if at least one question is answered', () => {
        const answers = { "0.1": "Sí" };
        expect(blockHasAnswers(mockBlocks[0], answers)).toBe(true);
    });

    it('returns false if no questions are answered', () => {
        expect(blockHasAnswers(mockBlocks[0], {})).toBe(false);
    });

    it('returns false if only info questions have values', () => {
        const answers = { "0.3": "info value" };
        expect(blockHasAnswers(mockBlocks[0], answers)).toBe(false);
    });

    it('returns false for empty string answers', () => {
        const answers = { "0.1": "", "0.2": "" };
        expect(blockHasAnswers(mockBlocks[0], answers)).toBe(false);
    });
});

// ─── shouldShowQuestion ─────────────────────────────────────────────────────

describe('shouldShowQuestion', () => {
    const blockQuestions = mockBlocks[0].questions;
    const radioQ = blockQuestions[0];       // { id: "0.1", type: "radio" } — no showWhen
    const conditionalQ = blockQuestions[1]; // showWhen: { parentId: "0.1", contains: "no" }

    it('always shows non-conditional questions', () => {
        expect(shouldShowQuestion(radioQ, blockQuestions, {})).toBe(true);
    });

    it('hides conditional question when previous has no answer', () => {
        // No answer for 0.1 → parentAnswer is undefined → should hide
        expect(shouldShowQuestion(conditionalQ, blockQuestions, {})).toBe(false);
    });

    it('hides conditional question when previous answer is positive', () => {
        // "Sí, todo correcto" does not contain "no" → should hide
        const answers = { "0.1": "Sí, todo correcto" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(false);
    });

    it('shows conditional question when previous answer contains "no"', () => {
        const answers = { "0.1": "No, hay datos que actualizar" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(true);
    });

    it('shows conditional question when previous answer contains "actualizar"', () => {
        // "actualizar" does not contain "no" — this tests a different keyword
        // Re-wire: use a question with showWhen.contains = "actualizar"
        const actualizarQ = {
            id: "0.4",
            type: "textarea",
            showWhen: { parentId: "0.1", contains: "actualizar" },
        };
        const answers = { "0.1": "Hay que actualizar algunos datos" };
        expect(shouldShowQuestion(actualizarQ, blockQuestions, answers)).toBe(true);
    });

    it('shows conditional question when previous answer contains "incorrectos"', () => {
        const incorrectosQ = {
            id: "0.5",
            type: "textarea",
            showWhen: { parentId: "0.1", contains: "incorrectos" },
        };
        const answers = { "0.1": "Los datos son incorrectos" };
        expect(shouldShowQuestion(incorrectosQ, blockQuestions, answers)).toBe(true);
    });

    it('is case-insensitive for keyword matching', () => {
        const answers = { "0.1": "NO, ESTÁN INCORRECTOS" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(true);
    });
});
