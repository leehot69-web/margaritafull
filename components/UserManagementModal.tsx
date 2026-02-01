
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface UserManagementModalProps {
    users: User[];
    onSave: (users: User[]) => void;
    onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ users, onSave, onClose }) => {
    const [localUsers, setLocalUsers] = useState<User[]>(JSON.parse(JSON.stringify(users)));
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isFormOpen, setFormOpen] = useState(false);

    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [role, setRole] = useState<UserRole>('mesero');

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setName(user.name);
        setPin(user.pin);
        setRole(user.role);
        setFormOpen(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        setName('');
        setPin('');
        setRole('mesero');
        setFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (localUsers.length <= 1) {
            alert("Debe haber al menos un usuario en el sistema.");
            return;
        }
        if (confirm("¿Eliminar este usuario?")) {
            setLocalUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || pin.length !== 4) {
            alert("Datos inválidos. El PIN debe ser de 4 dígitos.");
            return;
        }

        const newUser: User = {
            id: editingUser ? editingUser.id : Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            pin: pin,
            role: role
        };

        setLocalUsers(prev => {
            if (editingUser) {
                return prev.map(u => u.id === editingUser.id ? newUser : u);
            }
            return [...prev, newUser];
        });
        setFormOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Gestión de Usuarios</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Control de acceso y roles</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <button onClick={handleAdd} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-black uppercase text-xs hover:bg-gray-50 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Agregar Nuevo Usuario
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {localUsers.map(user => (
                            <div key={user.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full border flex items-center justify-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-800 uppercase text-sm">{user.name}</h4>
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {user.role}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400">PIN: ****</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                    <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-300 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Cancelar</button>
                    <button onClick={() => onSave(localUsers)} className="flex-[2] py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-gray-200 active:scale-95 transition-all">Guardar Cambios</button>
                </div>

                {isFormOpen && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-800 uppercase">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button onClick={() => setFormOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre Completo</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl font-bold outline-none" placeholder="Ej: Juan Perez" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">PIN de Acceso (4 dígitos)</label>
                                <input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} required className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl font-black text-2xl tracking-[1em] outline-none text-center" placeholder="****" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Rol en el Sistema</label>
                                <div className="flex gap-2">
                                    {['admin', 'mesero', 'cajero'].map(r => (
                                        <button key={r} type="button" onClick={() => setRole(r as UserRole)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] border-2 transition-all ${role === r ? 'border-red-500 bg-red-50 text-red-600 shadow-lg shadow-red-100' : 'border-gray-100 bg-white text-gray-400'}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-red-100 active:scale-95 transition-all mt-4">
                                Confirmar Datos
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementModal;
