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
            { id: "0.2", q: "Conditional textarea", type: "textarea", conditional: true },
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
    it('counts only non-info questions', () => {
        // Block A: 2 non-info (radio + textarea), Block B: 2 non-info
        expect(countTotalQuestions(mockBlocks)).toBe(4);
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
        const answers = { "0.1": "Sí", "1.1": "B" };
        expect(calculateProgress(mockBlocks, answers)).toBe(50);
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
    const radioQ = blockQuestions[0];      // { id: "0.1", type: "radio" }
    const conditionalQ = blockQuestions[1]; // { id: "0.2", conditional: true }

    it('always shows non-conditional questions', () => {
        expect(shouldShowQuestion(radioQ, blockQuestions, {})).toBe(true);
    });

    it('hides conditional question when previous has no answer', () => {
        expect(shouldShowQuestion(conditionalQ, blockQuestions, {})).toBe(false);
    });

    it('hides conditional question when previous answer is positive', () => {
        // "Sí, todo correcto" contains no negative keywords
        const answers = { "0.1": "Sí, todo correcto" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(false);
    });

    it('shows conditional question when previous answer contains "no"', () => {
        const answers = { "0.1": "No, hay datos que actualizar" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(true);
    });

    it('shows conditional question when previous answer contains "actualizar"', () => {
        const answers = { "0.1": "Hay que actualizar algunos datos" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(true);
    });

    it('shows conditional question when previous answer contains "incorrectos"', () => {
        const answers = { "0.1": "Los datos son incorrectos" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(true);
    });

    it('is case-insensitive for keyword matching', () => {
        const answers = { "0.1": "NO, ESTÁN INCORRECTOS" };
        expect(shouldShowQuestion(conditionalQ, blockQuestions, answers)).toBe(true);
    });
});
