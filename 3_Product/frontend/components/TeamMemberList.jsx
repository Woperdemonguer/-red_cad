"use client";
import { useState } from "react";
import { Users, Trash2, PlusCircle, Edit2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { teamService } from "@/lib/supabaseService";
import ConfirmModal from "@/components/ui/ConfirmModal";

/**
 * TeamMemberList — Shared CRUD component for team members.
 * Used in both CAD profile (cad_users_mapping) and admin profile (admin_users_mapping).
 *
 * Props:
 *   members:        Array of team member objects
 *   onMembersChange: Callback to update parent state with new members array
 *   isAdmin:        Boolean — determines which table to operate on
 *   cadId:          UUID string — required for CAD member operations (null for admin)
 *   title:          Section title
 *   subtitle:       Section description
 *   addLabel:       Label for the add button
 */
export default function TeamMemberList({
    members,
    onMembersChange,
    isAdmin = false,
    cadId = null,
    title = "Accesos y Personas de Contacto",
    subtitle = "",
    addLabel = "Añadir Persona",
}) {
    const [newMember, setNewMember] = useState({ user_email: "", nombre_persona: "", perfil_rol: "", telefono: "" });
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [editMemberData, setEditMemberData] = useState({});
    const [deleteTarget, setDeleteTarget] = useState({ id: null, email: "" });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleAdd = async () => {
        if (!newMember.user_email || !newMember.nombre_persona) {
            toast.error("El correo y el nombre son obligatorios.");
            return;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newMember.user_email)) {
            toast.error("El formato del correo electrónico no es válido.");
            return;
        }

        try {
            const data = await teamService.add(isAdmin, newMember, cadId);
            onMembersChange([...members, data]);
            setNewMember({ user_email: "", nombre_persona: "", perfil_rol: "", telefono: "" });
            toast.success("Persona añadida correctamente");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleRemove = async (id, email) => {
        setDeleteTarget({ id, email });
        setDeleteModalOpen(true);
    };

    const confirmRemove = async () => {
        try {
            await teamService.remove(isAdmin, deleteTarget.id);
            onMembersChange(members.filter(m => m.id !== deleteTarget.id));
            toast.success("Acceso eliminado");
            setDeleteModalOpen(false);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEditStart = (member) => {
        setEditingMemberId(member.id);
        setEditMemberData({ ...member });
    };

    const handleEditCancel = () => {
        setEditingMemberId(null);
        setEditMemberData({});
    };

    const handleUpdate = async () => {
        if (!editMemberData.user_email || !editMemberData.nombre_persona) {
            toast.error("El correo y el nombre son obligatorios.");
            return;
        }

        const toastId = toast.loading("Actualizando datos...");

        try {
            await teamService.update(isAdmin, editingMemberId, editMemberData);
            onMembersChange(members.map(m => m.id === editingMemberId ? { ...m, ...editMemberData } : m));
            setEditingMemberId(null);
            setEditMemberData({});
            toast.success("Datos actualizados", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-bold font-serif text-text mb-2 flex items-center gap-2">
                <Users className="text-accent" size={20} /> {title}
            </h2>
            {subtitle && (
                <p className="text-sm text-textLight mb-6 border-b border-border pb-4">
                    {subtitle}
                </p>
            )}

            {/* Member list */}
            <div className="space-y-4 mb-8">
                {members.map(member => (
                    <div key={member.id} className="flex flex-col md:flex-row md:justify-between md:items-center bg-sand/30 p-4 border border-border rounded-lg gap-4">
                        {editingMemberId === member.id ? (
                            <div className="flex-1 w-full animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <input type="text" placeholder="Nombre completo" value={editMemberData.nombre_persona || ''} onChange={e => setEditMemberData({ ...editMemberData, nombre_persona: e.target.value })} className="px-3 py-1.5 rounded-md border border-border focus:ring-1 focus:ring-accent bg-white text-sm w-full" />
                                    <input type="email" placeholder="Correo (Login)" value={editMemberData.user_email || ''} onChange={e => setEditMemberData({ ...editMemberData, user_email: e.target.value })} className="px-3 py-1.5 rounded-md border border-border focus:ring-1 focus:ring-accent bg-white text-sm w-full" />
                                    <input type="text" placeholder="Cargo o Rol" value={editMemberData.perfil_rol || ''} onChange={e => setEditMemberData({ ...editMemberData, perfil_rol: e.target.value })} className="px-3 py-1.5 rounded-md border border-border focus:ring-1 focus:ring-accent bg-white text-sm w-full" />
                                    <input type="text" placeholder="Teléfono" value={editMemberData.telefono || ''} onChange={e => setEditMemberData({ ...editMemberData, telefono: e.target.value })} className="px-3 py-1.5 rounded-md border border-border focus:ring-1 focus:ring-accent bg-white text-sm w-full" />
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <button type="button" onClick={handleEditCancel} className="text-xs px-3 py-1.5 border border-border text-warmGray rounded-md hover:bg-sand transition-colors font-medium">Cancelar</button>
                                    <button type="button" onClick={handleUpdate} className="text-xs px-3 py-1.5 bg-forest text-white rounded-md hover:bg-forestLight transition-colors font-medium">Guardar</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <div className="font-bold text-text">{member.nombre_persona} <span className="font-normal text-sm text-textLight ml-2">({member.perfil_rol || 'Sin rol definido'})</span></div>
                                    <div className="text-sm text-textLight mt-1">{member.user_email} {member.telefono && `• Tel: ${member.telefono}`}</div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button type="button" onClick={() => handleEditStart(member)} className="text-forest hover:bg-forest/10 p-2 rounded-lg transition-colors" title="Editar datos">
                                        <Edit2 size={18} />
                                    </button>
                                    <button type="button" onClick={() => handleRemove(member.id, member.user_email)} className="text-red hover:bg-red/10 p-2 rounded-lg transition-colors" title="Quitar acceso">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add new member form */}
            <div className="bg-blueBgLight p-5 rounded-lg border border-border">
                <h3 className="text-sm font-bold text-text mb-4">Añadir nueva persona</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="Nombre completo" value={newMember.nombre_persona} onChange={e => setNewMember({ ...newMember, nombre_persona: e.target.value })} className="px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white text-sm" />
                    <input type="email" placeholder="Correo electrónico (Login)" value={newMember.user_email} onChange={e => setNewMember({ ...newMember, user_email: e.target.value })} className="px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white text-sm" />
                    <input type="text" placeholder="Cargo o Rol" value={newMember.perfil_rol} onChange={e => setNewMember({ ...newMember, perfil_rol: e.target.value })} className="px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white text-sm" />
                    <input type="text" placeholder="Teléfono" value={newMember.telefono} onChange={e => setNewMember({ ...newMember, telefono: e.target.value })} className="px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white text-sm" />
                </div>
                <button type="button" onClick={handleAdd} className="text-sm bg-accent text-text font-bold px-4 py-2 rounded-lg hover:bg-accentHover transition-colors flex items-center gap-2 w-full justify-center md:w-auto">
                    <PlusCircle size={16} /> {addLabel}
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                title="Quitar Acceso"
                message={`¿Quitar acceso e información de contacto a ${deleteTarget.email}?`}
                confirmLabel="Quitar acceso"
                onConfirm={confirmRemove}
                onCancel={() => setDeleteModalOpen(false)}
                variant="danger"
            />
        </div>
    );
}
