
import React, { useState } from 'react';
import { MenuItem, ModifierGroup, ModifierAssignment } from '../types';

interface MenuItemFormModalProps {
  initialData?: MenuItem;
  allModifierGroups: ModifierGroup[];
  onSubmit: (item: MenuItem) => void;
  onClose: () => void;
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({ initialData, allModifierGroups, onSubmit, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [description, setDescription] = useState(initialData?.description || '');
  // Initialize state by mapping modifierGroupTitles (which can be string | ModifierAssignment) to a simple string array of unique group titles.
  const [selectedGroupTitles, setSelectedGroupTitles] = useState<string[]>(() => {
    if (!initialData?.modifierGroupTitles) {
      return [];
    }
    const titles = initialData.modifierGroupTitles.map(g => (typeof g === 'string' ? g : g.group));
    return [...new Set(titles)];
  });

  const handleToggleGroup = (title: string) => {
    setSelectedGroupTitles(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const [isPizza, setIsPizza] = useState(initialData?.isPizza || false);
  const [isSpecialPizza, setIsSpecialPizza] = useState(initialData?.isSpecialPizza || false);
  const [defaultIngredients, setDefaultIngredients] = useState<string>(initialData?.defaultIngredients?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price < 0) return;

    // Build a map of original assignments from the initial data, keyed by their group title.
    const originalAssignmentsMap = new Map<string, (string | ModifierAssignment)[]>();
    if (initialData?.modifierGroupTitles) {
      for (const assignment of initialData.modifierGroupTitles) {
        const groupTitle = typeof assignment === 'string' ? assignment : assignment.group;
        if (!originalAssignmentsMap.has(groupTitle)) {
          originalAssignmentsMap.set(groupTitle, []);
        }
        originalAssignmentsMap.get(groupTitle)!.push(assignment);
      }
    }

    const finalModifierGroups = selectedGroupTitles.flatMap(title => {
      if (originalAssignmentsMap.has(title)) {
        return originalAssignmentsMap.get(title)!;
      }
      return title;
    });

    const parsedDefaultIngredients = defaultIngredients.split(',').map(i => i.trim()).filter(i => i !== '');

    onSubmit({
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      available: initialData?.available ?? true,
      modifierGroupTitles: finalModifierGroups,
      isPizza: isPizza,
      isSpecialPizza: isSpecialPizza,
      defaultIngredients: isSpecialPizza ? parsedDefaultIngredients : [],
    });
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex-shrink-0">{initialData ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
        <form className="space-y-6 overflow-y-auto pr-2 flex-grow scrollbar-hide" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
              Nombre del Producto
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 mt-1 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              required
            />
          </div>
          <div>
            <label htmlFor="item-price" className="block text-sm font-medium text-gray-700">
              Precio Base
            </label>
            <input
              id="item-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-3 mt-1 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="item-description" className="block text-sm font-medium text-gray-700">
              Descripción (Opcional)
            </label>
            <textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 mt-1 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
              placeholder="Ej: (tostones, queso, ensalada...)"
              rows={3}
            />
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPizza}
                onChange={(e) => setIsPizza(e.target.checked)}
                className="w-5 h-5 rounded text-orange-600 border-gray-300"
              />
              <span className="font-bold text-orange-800">¿Es una Pizza? (Usa constructor visual)</span>
            </label>

            {isPizza && (
              <div className="ml-8 space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecialPizza}
                    onChange={(e) => setIsSpecialPizza(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 border-gray-300"
                  />
                  <span className="text-sm font-medium text-orange-700">¿Es Pizza Especial? (Sabor predefinido)</span>
                </label>

                {isSpecialPizza && (
                  <div>
                    <label className="text-[11px] font-bold text-orange-400 uppercase tracking-widest ml-1 mb-1 block">Ingredientes Incluidos</label>
                    <input
                      type="text"
                      value={defaultIngredients}
                      onChange={(e) => setDefaultIngredients(e.target.value)}
                      placeholder="Jamón, Champiñón, Maíz..."
                      className="w-full px-4 py-2 text-sm bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    <p className="text-[10px] text-orange-400 mt-1">* Separados por coma</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modifier Group Assignment */}
          {allModifierGroups.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2 mb-3">Asignar Grupos de Modificadores</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {allModifierGroups.map(group => (
                  <label key={group.title} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedGroupTitles.includes(group.title)}
                      onChange={() => handleToggleGroup(group.title)}
                      className="h-5 w-5 rounded text-[var(--brand-color)] border-gray-300 focus:ring-[var(--brand-color)]"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-800">{group.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors"
            >
              {initialData ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemFormModal;
