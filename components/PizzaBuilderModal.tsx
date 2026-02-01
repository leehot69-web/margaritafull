
import React, { useState, useMemo } from 'react';
import { MenuItem, PizzaSize, PizzaIngredient, PizzaHalf, PizzaIngredientSelection, PizzaConfiguration, CartItem } from '../types';
import { PIZZA_BASE_PRICES, PIZZA_INGREDIENTS } from '../constants';

interface PizzaBuilderModalProps {
    item: MenuItem;
    onClose: () => void;
    onSubmit: (item: MenuItem, pizzaConfig: PizzaConfiguration, quantity: number, extraModifiers: SelectedModifier[]) => void;
    initialCartItem?: CartItem | null;
    activeRate: number;
    isSpecialPizza?: boolean;
    defaultIngredients?: string[];
    pizzaIngredients: PizzaIngredient[];
    pizzaBasePrices: Record<string, number>;
    allModifierGroups: ModifierGroup[];
}

const PizzaBuilderModal: React.FC<PizzaBuilderModalProps> = ({
    item,
    onClose,
    onSubmit,
    initialCartItem,
    activeRate,
    isSpecialPizza = false,
    defaultIngredients = [],
    pizzaIngredients,
    pizzaBasePrices,
    allModifierGroups
}) => {
    // Estados
    const [size, setSize] = useState<PizzaSize>(
        initialCartItem?.pizzaConfig?.size || (isSpecialPizza ? 'Familiar' : 'Mediana')
    );
    const [selectedHalf, setSelectedHalf] = useState<PizzaHalf>('full');
    const [ingredients, setIngredients] = useState<PizzaIngredientSelection[]>(() => {
        if (initialCartItem?.pizzaConfig?.ingredients) {
            return initialCartItem.pizzaConfig.ingredients;
        }
        // Para pizzas especiales, agregar ingredientes por defecto como "full"
        if (isSpecialPizza && defaultIngredients.length > 0) {
            return defaultIngredients.map(name => {
                const ing = pizzaIngredients.find(i => i.name === name);
                if (ing) {
                    return { ingredient: ing, half: 'full' as PizzaHalf };
                }
                return null;
            }).filter(Boolean) as PizzaIngredientSelection[];
        }
        return [];
    });

    const [extraModifiers, setExtraModifiers] = useState<SelectedModifier[]>(() => {
        if (initialCartItem) {
            // Filtrar los que no son de pizza (tamaño e ingredientes que agregamos manualmente en handleAddPizzaToCart)
            const pizzaSpecificGroups = ['Tamaño', '🍕 TODA LA PIZZA', '◐ MITAD IZQUIERDA', '◑ MITAD DERECHA', '✓ INGREDIENTES BASE'];
            return initialCartItem.selectedModifiers.filter(m => !pizzaSpecificGroups.includes(m.groupTitle));
        }
        return [];
    });

    const [quantity, setQuantity] = useState(initialCartItem?.quantity || 1);

    // Grupos de modificadores asignados a este producto
    const assignedModifierGroups = useMemo(() => {
        return (item.modifierGroupTitles || []).map(titleOrAssignment => {
            const groupTitle = typeof titleOrAssignment === 'string' ? titleOrAssignment : titleOrAssignment.group;
            const displayTitle = typeof titleOrAssignment === 'string' ? titleOrAssignment : titleOrAssignment.label;
            const group = allModifierGroups.find(g => g.title === groupTitle);
            return group ? { ...group, displayTitle } : null;
        }).filter(Boolean) as (ModifierGroup & { displayTitle: string })[];
    }, [item.modifierGroupTitles, allModifierGroups]);

    const handleToggleModifier = (group: ModifierGroup & { displayTitle: string }, option: { name: string, price: number }) => {
        if (group.selectionType === 'single') {
            setExtraModifiers(prev => [
                ...prev.filter(m => m.groupTitle !== group.displayTitle),
                { groupTitle: group.displayTitle, option }
            ]);
        } else {
            setExtraModifiers(prev => {
                const exists = prev.find(m => m.groupTitle === group.displayTitle && m.option.name === option.name);
                if (exists) {
                    return prev.filter(m => !(m.groupTitle === group.displayTitle && m.option.name === option.name));
                } else {
                    return [...prev, { groupTitle: group.displayTitle, option }];
                }
            });
        }
    };

    // Calcular precio total
    const totalPrice = useMemo(() => {
        let basePrice = isSpecialPizza ? item.price : pizzaBasePrices[size];

        // Sumar ingredientes
        ingredients.forEach(sel => {
            if (isSpecialPizza && defaultIngredients.includes(sel.ingredient.name)) {
                return;
            }
            const ingPrice = sel.ingredient.prices[size as PizzaSize];
            if (sel.half === 'left' || sel.half === 'right') {
                basePrice += ingPrice / 2;
            } else {
                basePrice += ingPrice;
            }
        });

        // Sumar modificadores extra
        const modsPrice = extraModifiers.reduce((sum, mod) => sum + mod.option.price, 0);
        basePrice += modsPrice;

        return basePrice * quantity;
    }, [size, ingredients, quantity, isSpecialPizza, item.price, defaultIngredients, extraModifiers, pizzaBasePrices]);

    // Agrupar ingredientes por categoría
    const groupedIngredients = useMemo(() => {
        const grouped: Record<string, PizzaIngredient[]> = { A: [], B: [], C: [] };
        pizzaIngredients.forEach(ing => {
            if (!grouped[ing.category]) grouped[ing.category] = [];
            grouped[ing.category].push(ing);
        });
        return grouped;
    }, [pizzaIngredients]);

    // Verificar si un ingrediente está seleccionado
    const getIngredientSelection = (ingredientName: string): PizzaIngredientSelection | undefined => {
        return ingredients.find(sel => sel.ingredient.name === ingredientName);
    };

    // Agregar/modificar ingrediente
    const toggleIngredient = (ingredient: PizzaIngredient) => {
        const existing = getIngredientSelection(ingredient.name);

        if (existing) {
            // Si existe y el half es el mismo, quitar
            if (existing.half === selectedHalf) {
                setIngredients(prev => prev.filter(sel => sel.ingredient.name !== ingredient.name));
            } else {
                // Cambiar el half
                setIngredients(prev => prev.map(sel =>
                    sel.ingredient.name === ingredient.name
                        ? { ...sel, half: selectedHalf }
                        : sel
                ));
            }
        } else {
            // Agregar nuevo
            setIngredients(prev => [...prev, { ingredient, half: selectedHalf }]);
        }
    };

    // Obtener ingredientes por mitad
    const leftIngredients = ingredients.filter(sel => sel.half === 'left' || sel.half === 'full');
    const rightIngredients = ingredients.filter(sel => sel.half === 'right' || sel.half === 'full');

    // Manejar submit
    const handleSubmit = () => {
        const config: PizzaConfiguration = {
            size: isSpecialPizza ? 'Familiar' : size,
            basePrice: isSpecialPizza ? item.price : pizzaBasePrices[size],
            ingredients,
            isSpecialPizza,
            specialPizzaName: isSpecialPizza ? item.name : undefined
        };
        onSubmit(item, config, quantity, extraModifiers);
    };

    // Colores por categoría
    const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
        A: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
        B: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
        C: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
            <div
                className="w-full max-w-lg bg-gradient-to-b from-[#0a3d2c] to-[#051a12] rounded-t-3xl max-h-[95vh] flex flex-col animate-slide-up"
                style={{ boxShadow: '0 -10px 40px rgba(0,212,170,0.3)' }}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {isSpecialPizza ? item.name : '🍕 Arma tu Pizza'}
                        </h2>
                        <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">

                    {/* Selector de tamaño (solo para pizza personalizada) */}
                    {!isSpecialPizza && (
                        <div>
                            <h3 className="text-sm font-black text-[#00D4AA] uppercase tracking-widest mb-3">📏 Tamaño</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Pequeña', 'Mediana', 'Familiar'] as PizzaSize[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={`p-3 rounded-2xl border-2 transition-all ${size === s
                                            ? 'border-[#00D4AA] bg-[#00D4AA]/20 text-white'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="text-lg font-black">${pizzaBasePrices[s]}</div>
                                        <div className="text-[10px] font-bold uppercase">{s}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Visualización de la Pizza */}
                    <div className="flex flex-col items-center">
                        {/* Pizza Visual */}
                        <div className="relative w-56 h-56 mb-4">
                            {/* Círculo base de la pizza */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F4A460] to-[#D2691E] border-4 border-[#8B4513] shadow-[0_0_30px_rgba(0,0,0,0.4)] overflow-hidden">
                                {/* Línea divisoria */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#8B4513]/50 transform -translate-x-1/2" />

                                {/* Mitad izquierda */}
                                <div
                                    className={`absolute top-0 bottom-0 left-0 w-1/2 flex items-center justify-center cursor-pointer transition-all ${selectedHalf === 'left' ? 'bg-[#00D4AA]/30' : 'hover:bg-white/10'
                                        }`}
                                    onClick={() => setSelectedHalf('left')}
                                >
                                    <div className="text-xs text-white font-black text-center px-2 drop-shadow-md">
                                        {leftIngredients.length > 0 ? (
                                            <div className="space-y-0.5">
                                                {leftIngredients.slice(0, 4).map(sel => (
                                                    <div key={sel.ingredient.name} className="truncate text-[9px] uppercase">
                                                        {sel.ingredient.name}
                                                    </div>
                                                ))}
                                                {leftIngredients.length > 4 && (
                                                    <div className="text-[10px]">+{leftIngredients.length - 4}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-white/20">IZQ</span>
                                        )}
                                    </div>
                                </div>

                                {/* Mitad derecha */}
                                <div
                                    className={`absolute top-0 bottom-0 right-0 w-1/2 flex items-center justify-center cursor-pointer transition-all ${selectedHalf === 'right' ? 'bg-[#00D4AA]/30' : 'hover:bg-white/10'
                                        }`}
                                    onClick={() => setSelectedHalf('right')}
                                >
                                    <div className="text-xs text-white font-black text-center px-2 drop-shadow-md">
                                        {rightIngredients.length > 0 ? (
                                            <div className="space-y-0.5">
                                                {rightIngredients.slice(0, 4).map(sel => (
                                                    <div key={sel.ingredient.name} className="truncate text-[9px] uppercase">
                                                        {sel.ingredient.name}
                                                    </div>
                                                ))}
                                                {rightIngredients.length > 4 && (
                                                    <div className="text-[10px]">+{rightIngredients.length - 4}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-white/20">DER</span>
                                        )}
                                    </div>
                                </div>

                                {/* Centro clickeable para toda la pizza */}
                                <div
                                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full cursor-pointer transition-all flex items-center justify-center z-10 ${selectedHalf === 'full'
                                        ? 'bg-[#00D4AA] text-white shadow-[0_0_15px_rgba(0,212,170,0.5)] border-2 border-white'
                                        : 'bg-[#8B4513] text-white/50 hover:bg-[#A0522D] border-2 border-[#8B4513]'
                                        }`}
                                    onClick={() => setSelectedHalf('full')}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Toda</span>
                                </div>
                            </div>
                        </div>

                        {/* Selector de mitad */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedHalf('left')}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedHalf === 'left'
                                    ? 'bg-[#00D4AA] text-white shadow-lg'
                                    : 'bg-white/5 text-gray-500 border border-white/10'
                                    }`}
                            >
                                ◐ Mitad Izq
                            </button>
                            <button
                                onClick={() => setSelectedHalf('full')}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedHalf === 'full'
                                    ? 'bg-[#00D4AA] text-white shadow-lg'
                                    : 'bg-white/5 text-gray-500 border border-white/10'
                                    }`}
                            >
                                ● Toda
                            </button>
                            <button
                                onClick={() => setSelectedHalf('right')}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedHalf === 'right'
                                    ? 'bg-[#00D4AA] text-white shadow-lg'
                                    : 'bg-white/5 text-gray-500 border border-white/10'
                                    }`}
                            >
                                Mitad Der ◑
                            </button>
                        </div>
                    </div>

                    {/* Lista de Ingredientes */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-[#00D4AA] uppercase tracking-widest">🍓 Ingredientes Extras</h3>
                        {(Object.entries(groupedIngredients) as [string, PizzaIngredient[]][]).filter(([_, ings]) => ings.length > 0).map(([category, ings]) => (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${categoryColors[category].bg} ${categoryColors[category].text} border ${categoryColors[category].border}`}>
                                        Categoría {category}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {ings.map(ing => {
                                        const selection = getIngredientSelection(ing.name);
                                        const isDefault = isSpecialPizza && defaultIngredients.includes(ing.name);
                                        const isSelected = !!selection;
                                        const price = ing.prices[size as PizzaSize];

                                        return (
                                            <button
                                                key={ing.name}
                                                onClick={() => toggleIngredient(ing)}
                                                className={`p-3 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${isSelected
                                                    ? `${categoryColors[ing.category].border} ${categoryColors[ing.category].bg}`
                                                    : 'border-white/5 bg-white/[0.03] hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                                        {ing.name}
                                                    </span>
                                                    {isSelected && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-black/40 text-white font-black">
                                                            {selection.half === 'full' ? '●' : selection.half === 'left' ? '◐' : '◑'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-500 mt-1 relative z-10">
                                                    {isDefault ? (
                                                        <span className="text-[#00D4AA]">✓ Incluido</span>
                                                    ) : (
                                                        `+$${price.toFixed(2)}`
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SECCIÓN DE MODIFICADORES ADICIONALES (Bordes, etc) */}
                    {assignedModifierGroups.length > 0 && (
                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-sm font-black text-[#FFD700] uppercase tracking-widest">✨ Agregados Especiales</h3>
                            {assignedModifierGroups.map(group => (
                                <div key={group.displayTitle} className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{group.displayTitle}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {group.options.map(opt => {
                                            const isSelected = !!extraModifiers.find(m => m.groupTitle === group.displayTitle && m.option.name === opt.name);
                                            return (
                                                <button
                                                    key={opt.name}
                                                    onClick={() => handleToggleModifier(group, opt)}
                                                    className={`p-3 rounded-2xl border-2 transition-all text-left ${isSelected
                                                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-white'
                                                        : 'border-white/5 bg-white/[0.03] text-gray-400 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="font-black text-[11px] uppercase truncate">{opt.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                                                        {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Gratis'}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Cantidad */}
                    <div className="flex items-center justify-between bg-white/[0.03] rounded-3xl p-4 border border-white/5">
                        <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Unidades</span>
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black hover:bg-white/20 transition-colors"
                            >
                                −
                            </button>
                            <span className="text-white font-black text-xl w-6 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded-2xl bg-[#00D4AA] flex items-center justify-center text-white font-black hover:bg-[#00B894] transition-colors shadow-lg shadow-[#00D4AA]/20"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer con precio y botón */}
                <div className="p-6 pb-10 border-t border-white/10 bg-black/40 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-6">
                        <div className="shrink-0">
                            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Precio Final</div>
                            <div className="text-3xl font-black text-white">
                                ${totalPrice.toFixed(2)}
                            </div>
                            <div className="text-[10px] font-bold text-gray-500">
                                Bs. {(totalPrice * activeRate).toFixed(2)}
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!isSpecialPizza && ingredients.length === 0}
                            className={`flex-grow h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${(isSpecialPizza || ingredients.length > 0)
                                ? 'bg-gradient-to-r from-[#00D4AA] to-[#00B894] text-white shadow-[0_10px_30px_rgba(0,212,170,0.3)] active:scale-95'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {initialCartItem ? 'Actualizar Pedido' : 'Confirmar Pizza'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
            `}</style>
        </div>
    );
};

export default PizzaBuilderModal;
