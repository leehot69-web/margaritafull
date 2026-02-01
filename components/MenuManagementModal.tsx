
import React, { useState } from 'react';
import { MenuCategory, MenuItem, ModifierGroup, PizzaIngredient } from '../types';
import MenuItemFormModal from './MenuItemFormModal';
import CategoryFormModal from './CategoryFormModal';
import ModifierGroupFormModal from './ModifierGroupFormModal';
import PizzaIngredientFormModal from './PizzaIngredientFormModal';

interface MenuManagementModalProps {
  menu: MenuCategory[];
  modifierGroups: ModifierGroup[];
  onSave: (menu: MenuCategory[], modifierGroups: ModifierGroup[]) => void;
  onClose: () => void;
  pizzaIngredients: PizzaIngredient[];
  pizzaBasePrices: Record<string, number>;
  onUpdatePizzaConfig: (ingredients: PizzaIngredient[], basePrices: Record<string, number>) => void;
}

const MenuManagementModal: React.FC<MenuManagementModalProps> = (props) => {
  const { menu, modifierGroups, onSave, onClose, pizzaIngredients, pizzaBasePrices, onUpdatePizzaConfig } = props;

  // Estado local para permitir edición antes de guardar definitivamente
  const [localMenu, setLocalMenu] = useState<MenuCategory[]>(JSON.parse(JSON.stringify(menu)));
  const [localModifierGroups, setLocalModifierGroups] = useState<ModifierGroup[]>(JSON.parse(JSON.stringify(modifierGroups)));
  const [localPizzaIngredients, setLocalPizzaIngredients] = useState<PizzaIngredient[]>(JSON.parse(JSON.stringify(pizzaIngredients)));
  const [localPizzaBasePrices, setLocalPizzaBasePrices] = useState<Record<string, number>>(JSON.parse(JSON.stringify(pizzaBasePrices)));

  const [isItemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ categoryTitle: string, item: MenuItem } | null>(null);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  const [isCategoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  const [isModifierGroupFormOpen, setModifierGroupFormOpen] = useState(false);
  const [editingModifierGroup, setEditingModifierGroup] = useState<ModifierGroup | null>(null);

  const [isPizzaIngredientFormOpen, setPizzaIngredientFormOpen] = useState(false);
  const [editingPizzaIngredient, setEditingPizzaIngredient] = useState<PizzaIngredient | null>(null);

  const handleEditPizzaIngredient = (ing: PizzaIngredient) => {
    setEditingPizzaIngredient(ing);
    setPizzaIngredientFormOpen(true);
  };

  const handleAddPizzaIngredient = () => {
    setEditingPizzaIngredient(null);
    setPizzaIngredientFormOpen(true);
  };

  const handleDeletePizzaIngredient = (ingName: string) => {
    if (confirm(`¿Eliminar ingrediente "${ingName}"?`)) {
      setLocalPizzaIngredients(prev => prev.filter(i => i.name !== ingName));
    }
  };

  const handlePizzaIngredientSubmit = (ing: PizzaIngredient) => {
    setLocalPizzaIngredients(prev => {
      if (editingPizzaIngredient) {
        return prev.map(i => i.name === editingPizzaIngredient.name ? ing : i);
      }
      return [...prev, ing];
    });
    setPizzaIngredientFormOpen(false);
    setEditingPizzaIngredient(null);
  };

  const handleBasePriceChange = (size: string, price: number) => {
    setLocalPizzaBasePrices(prev => ({ ...prev, [size]: price }));
  };

  const handleToggleAvailability = (categoryTitle: string, itemName: string) => {
    setLocalMenu(prev => prev.map(category => {
      if (category.title === categoryTitle) {
        return {
          ...category,
          items: category.items.map(item =>
            item.name === itemName ? { ...item, available: !item.available } : item
          ),
        };
      }
      return category;
    }));
  };

  const handleToggleAllInCategory = (categoryTitle: string) => {
    setLocalMenu(prev => prev.map(category => {
      if (category.title === categoryTitle) {
        const shouldMakeAllAvailable = category.items.every(item => !item.available);
        return {
          ...category,
          items: category.items.map(item => ({ ...item, available: shouldMakeAllAvailable })),
        };
      }
      return category;
    }));
  };

  const handleDeleteItem = (categoryTitle: string, itemName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${itemName}"?`)) {
      setLocalMenu(prev => prev.map(category => {
        if (category.title === categoryTitle) {
          return {
            ...category,
            items: category.items.filter(item => item.name !== itemName),
          };
        }
        return category;
      }));
    }
  };

  const handleEditItem = (categoryTitle: string, item: MenuItem) => {
    setEditingItem({ categoryTitle, item });
    setItemFormOpen(true);
  };

  const handleAddItem = (categoryTitle: string) => {
    setAddingToCategory(categoryTitle);
    setItemFormOpen(true);
  };

  const handleItemFormSubmit = (newItem: MenuItem) => {
    setLocalMenu(prev => {
      if (editingItem) {
        return prev.map(category => {
          if (category.title === editingItem.categoryTitle) {
            return {
              ...category,
              items: category.items.map(item =>
                item.name === editingItem.item.name ? { ...newItem, available: item.available } : item
              ),
            };
          }
          return category;
        });
      } else if (addingToCategory) {
        return prev.map(category => {
          if (category.title === addingToCategory) {
            return {
              ...category,
              items: [...category.items, { ...newItem, available: true }],
            };
          }
          return category;
        });
      }
      return prev;
    });
    closeItemForm();
  };

  const closeItemForm = () => {
    setItemFormOpen(false);
    setEditingItem(null);
    setAddingToCategory(null);
  };

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = (categoryTitle: string) => {
    const category = localMenu.find(c => c.title === categoryTitle);
    if (category && category.items.length > 0) {
      alert('No se puede eliminar una categoría que contiene productos.');
      return;
    }
    if (confirm(`¿Eliminar la categoría "${categoryTitle}"?`)) {
      setLocalMenu(prev => prev.filter(c => c.title !== categoryTitle));
    }
  };

  const handleCategoryFormSubmit = (newName: string) => {
    setLocalMenu(prev => {
      if (editingCategory) {
        return prev.map(c => c.title === editingCategory.title ? { ...c, title: newName } : c);
      } else {
        return [...prev, { title: newName, items: [] }];
      }
    });
    closeCategoryForm();
  };

  const closeCategoryForm = () => {
    setCategoryFormOpen(false);
    setEditingCategory(null);
  };

  const handleEditModifierGroup = (group: ModifierGroup) => {
    setEditingModifierGroup(group);
    setModifierGroupFormOpen(true);
  };

  const handleAddModifierGroup = () => {
    setEditingModifierGroup(null);
    setModifierGroupFormOpen(true);
  };

  const handleDeleteModifierGroup = (groupTitle: string) => {
    if (confirm(`¿Está seguro de eliminar el grupo "${groupTitle}"?`)) {
      setLocalModifierGroups(prev => prev.filter(g => g.title !== groupTitle));
      // Limpiar asignaciones en el menú local
      setLocalMenu(prevMenu => prevMenu.map(cat => ({
        ...cat,
        items: cat.items.map(item => ({
          ...item,
          modifierGroupTitles: item.modifierGroupTitles?.filter(t => t !== groupTitle)
        }))
      })));
    }
  };

  const handleModifierGroupFormSubmit = (group: ModifierGroup) => {
    setLocalModifierGroups(prev => {
      if (editingModifierGroup) {
        return prev.map(g => g.title === editingModifierGroup.title ? group : g);
      } else {
        return [...prev, group];
      }
    });
    closeModifierGroupForm();
  };

  const closeModifierGroupForm = () => {
    setModifierGroupFormOpen(false);
    setEditingModifierGroup(null);
  };

  const handleFinalSave = () => {
    onSave(localMenu, localModifierGroups);
    onUpdatePizzaConfig(localPizzaIngredients, localPizzaBasePrices);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800">Gestionar Menú</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-10 p-2 scrollbar-hide">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Categorías y Productos</h2>
                <button onClick={handleAddNewCategory} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-gray-900 text-white rounded-lg">+ Categoría</button>
              </div>
              {localMenu.map(category => (
                <div key={category.title} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-700 uppercase">{category.title}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditCategory(category)} className="p-2 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                      <button onClick={() => handleAddItem(category.title)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-600">+ Producto</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.items.map(item => (
                      <div key={item.name} className={`p-3 rounded-xl flex items-center gap-4 border ${item.available ? 'bg-white border-gray-100' : 'bg-gray-200 border-gray-200 opacity-60'}`}>
                        <div className="flex-grow">
                          <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                          <p className="text-xs font-black text-red-600">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={item.available} onChange={() => handleToggleAvailability(category.title, item.name)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                          </label>
                          <button onClick={() => handleEditItem(category.title, item)} className="p-2 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                          <button onClick={() => handleDeleteItem(category.title, item.name)} className="p-2 text-gray-300 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Grupos de Modificadores</h2>
              <button onClick={handleAddModifierGroup} className="w-full py-4 bg-gray-100 text-gray-600 font-black uppercase text-xs rounded-2xl border-2 border-dashed border-gray-300 hover:bg-gray-200">+ Agregar Nuevo Grupo</button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {localModifierGroups.map(group => (
                  <div key={group.title} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black text-gray-800 text-sm uppercase">{group.title}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditModifierGroup(group)} className="p-1.5 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDeleteModifierGroup(group.title)} className="p-1.5 text-gray-300 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{group.options.length} opciones • {group.selectionType}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Precios Base Pizza</h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(localPizzaBasePrices).map(([size, price]) => (
                  <div key={size} className="p-3 bg-white border rounded-2xl">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">{size}</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => handleBasePriceChange(size, parseFloat(e.target.value) || 0)}
                      className="w-full font-black text-lg text-red-600 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Ingredientes de Pizza</h2>
                <button onClick={handleAddPizzaIngredient} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-orange-500 text-white rounded-lg">+ Ingrediente</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {localPizzaIngredients.map(ing => (
                  <div key={ing.name} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex justify-between items-center text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-gray-800 text-sm uppercase">{ing.name}</h4>
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black rounded uppercase">Cat {ing.category}</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">P: ${ing.prices.Pequeña} • M: ${ing.prices.Mediana} • F: ${ing.prices.Familiar}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditPizzaIngredient(ing)} className="p-1.5 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => handleDeletePizzaIngredient(ing.name)} className="p-1.5 text-gray-300 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex-shrink-0 flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Cancelar</button>
            <button onClick={handleFinalSave} className="flex-[2] py-4 bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-red-100 active:scale-95 transition-all">Guardar Todo el Menú</button>
          </div>
        </div>
      </div>
      {isItemFormOpen && (
        <MenuItemFormModal
          initialData={editingItem?.item}
          allModifierGroups={localModifierGroups}
          onClose={closeItemForm}
          onSubmit={handleItemFormSubmit}
        />
      )}
      {isCategoryFormOpen && (
        <CategoryFormModal
          initialName={editingCategory?.title}
          existingCategories={localMenu.map(c => c.title)}
          onSubmit={handleCategoryFormSubmit}
          onClose={closeCategoryForm}
        />
      )}
      {isModifierGroupFormOpen && (
        <ModifierGroupFormModal
          initialData={editingModifierGroup}
          existingGroups={localModifierGroups}
          onSubmit={handleModifierGroupFormSubmit}
          onClose={closeModifierGroupForm}
        />
      )}
      {isPizzaIngredientFormOpen && (
        <PizzaIngredientFormModal
          initialData={editingPizzaIngredient}
          existingIngredients={localPizzaIngredients}
          onSubmit={handlePizzaIngredientSubmit}
          onClose={() => setPizzaIngredientFormOpen(false)}
        />
      )}
    </>
  );
};

export default MenuManagementModal;
