
import React, { useState } from 'react';
import { PizzaIngredient, PizzaSize } from '../types';

interface PizzaIngredientFormModalProps {
    initialData?: PizzaIngredient | null;
    existingIngredients: PizzaIngredient[];
    onSubmit: (ingredient: PizzaIngredient) => void;
    onClose: () => void;
}

const PizzaIngredientFormModal: React.FC<PizzaIngredientFormModalProps> = ({
    initialData,
    existingIngredients,
    onSubmit,
    onClose
}) => {
    const [name, setName] = useState(initialData?.name || '');
    const [category, setCategory] = useState<string>(initialData?.category || 'A');
    const [prices, setPrices] = useState<Record<string, number>>(
        initialData?.prices || { Pequeña: 1, Mediana: 3, Familiar: 3 }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (!initialData && existingIngredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
            alert('Ya existe un ingrediente con ese nombre');
            return;
        }

        onSubmit({
            name: name.trim(),
            category: category as 'A' | 'B' | 'C',
            prices: prices as Record<PizzaSize, number>
        });
    };

    const handlePriceChange = (size: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPrices(prev => ({ ...prev, [size]: numValue }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                        {initialData ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Ingrediente</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                            placeholder="Ej: Jamón, Pepperoni..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                        <div className="flex gap-2">
                            {['A', 'B', 'C'].map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`flex-1 py-3 rounded-xl font-black transition-all border-2 ${category === cat
                                            ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200'
                                            : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium ml-1 mt-1">
                            {category === 'A' && '🔥 Categoría A: Ingredientes Premium'}
                            {category === 'B' && '🥗 Categoría B: Vegetales y básicos'}
                            {category === 'C' && '✨ Categoría C: Extras especiales'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precios por Tamaño ($)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Pequeña', 'Mediana', 'Familiar'].map((s) => (
                                <div key={s} className="space-y-1">
                                    <div className="text-[9px] font-black text-gray-400 uppercase text-center">{s}</div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={prices[s]}
                                        onChange={(e) => handlePriceChange(s, e.target.value)}
                                        className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-xl outline-none transition-all font-black text-center text-gray-800"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-xs hover:text-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-gray-200 active:scale-95 transition-all"
                        >
                            {initialData ? 'Guardar Cambios' : 'Crear Ingrediente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PizzaIngredientFormModal;
