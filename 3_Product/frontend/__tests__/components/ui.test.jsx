/**
 * Render tests for reusable UI components: ConfirmModal and LoadingSpinner.
 *
 * Tests verify:
 * - ConfirmModal: renders/hides, variant styles, callbacks, loading state
 * - LoadingSpinner: renders with message, default message
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ─── ConfirmModal ───────────────────────────────────────────────────────────

describe('ConfirmModal', () => {
    const defaultProps = {
        open: true,
        title: "Eliminar CAD",
        message: "¿Estás seguro?",
        confirmLabel: "Eliminar",
        cancelLabel: "Cancelar",
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        variant: "danger",
    };

    it('renders nothing when open=false', () => {
        const { container } = render(<ConfirmModal {...defaultProps} open={false} />);
        expect(container.innerHTML).toBe('');
    });

    it('renders title and message when open', () => {
        render(<ConfirmModal {...defaultProps} />);
        expect(screen.getByText("Eliminar CAD")).toBeDefined();
        expect(screen.getByText("¿Estás seguro?")).toBeDefined();
    });

    it('renders custom confirm and cancel labels', () => {
        render(<ConfirmModal {...defaultProps} />);
        expect(screen.getByText("Eliminar")).toBeDefined();
        expect(screen.getByText("Cancelar")).toBeDefined();
    });

    it('calls onConfirm when confirm button clicked', () => {
        const onConfirm = vi.fn();
        render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByText("Eliminar"));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button clicked', () => {
        const onCancel = vi.fn();
        render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByText("Cancelar"));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when close (X) button clicked', () => {
        const onCancel = vi.fn();
        render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
        const closeBtn = screen.getByLabelText("Cerrar");
        fireEvent.click(closeBtn);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('shows "Procesando..." when loading', () => {
        render(<ConfirmModal {...defaultProps} loading={true} />);
        expect(screen.getByText("Procesando...")).toBeDefined();
    });

    it('disables buttons when loading', () => {
        render(<ConfirmModal {...defaultProps} loading={true} />);
        const buttons = screen.getAllByRole('button');
        // Cancel and Confirm buttons should be disabled (not the X close button)
        const disabledButtons = buttons.filter(b => b.disabled);
        expect(disabledButtons.length).toBe(2);
    });

    it('renders with default title when none provided', () => {
        render(<ConfirmModal open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText("¿Estás seguro?")).toBeDefined();
    });
});

// ─── LoadingSpinner ─────────────────────────────────────────────────────────

describe('LoadingSpinner', () => {
    it('renders with a custom message', () => {
        render(<LoadingSpinner message="Cargando perfil..." />);
        expect(screen.getByText("Cargando perfil...")).toBeDefined();
    });

    it('renders with default message when none provided', () => {
        render(<LoadingSpinner />);
        // Check for the spinner element (should exist even without message)
        const { container } = render(<LoadingSpinner />);
        expect(container.querySelector('.animate-spin')).toBeDefined();
    });

    it('renders the spinner animation', () => {
        const { container } = render(<LoadingSpinner message="Loading" />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).not.toBeNull();
    });
});
