
import React, { useState, useEffect } from 'react';
import { AppSettings, StoreProfile, ThemeName, MenuCategory, MenuItem, ModifierGroup, PizzaIngredient, User, UserRole, RolePermissions } from '../types';
import MenuManagementModal from './MenuManagementModal';
import PriceIncreaseModal from './PriceIncreaseModal';

interface SettingsScreenProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onGoToTables: () => void;
  waiter: string;
  onLogout: () => void;
  waiterAssignments: any;
  onSaveAssignments: any;
  storeProfiles: StoreProfile[];
  onUpdateStoreProfiles: (profiles: StoreProfile[] | ((current: StoreProfile[]) => StoreProfile[])) => void;
  activeTableNumbers: number[];
  onBackupAllSalesData: () => void;
  onClearAllSalesData: () => void;
  onConnectPrinter: () => void;
  onDisconnectPrinter: () => void;
  isPrinterConnected: boolean;
  printerName?: string;
  onPrintTest: () => void;
  pizzaIngredients: PizzaIngredient[];
  pizzaBasePrices: Record<string, number>;
  onUpdatePizzaConfig: (ingredients: PizzaIngredient[], basePrices: Record<string, number>) => void;
}

const StoreProfileEditor: React.FC<{
  profile: StoreProfile;
  onUpdate: (updatedProfile: StoreProfile) => void;
  onPermanentSave: (updatedProfile: StoreProfile) => void;
  onOpenPriceIncreaseModal: (profile: StoreProfile) => void;
  pizzaIngredients: PizzaIngredient[];
  pizzaBasePrices: Record<string, number>;
  onUpdatePizzaConfig: (ingredients: PizzaIngredient[], basePrices: Record<string, number>) => void;
}> = ({ profile, onUpdate, onPermanentSave, onOpenPriceIncreaseModal, pizzaIngredients, pizzaBasePrices, onUpdatePizzaConfig }) => {
  const [isMenuModalOpen, setMenuModalOpen] = useState(false);
  const themes: { name: ThemeName, label: string }[] = [
    { name: 'margarita', label: 'Margarita' },
    { name: 'manga', label: 'Manga' },
    { name: 'red', label: 'Rojo' },
    { name: 'blue', label: 'Azul' },
    { name: 'dark', label: 'Oscuro' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-white rounded-lg border overflow-hidden p-1">
          <img src={profile.logo} alt="logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Perfil del Negocio</h3>
          <p className="text-xs text-gray-500">Configuración visual y datos</p>
        </div>
      </div>

      <input type="text" value={profile.name} onChange={(e) => onUpdate({ ...profile, name: e.target.value })} className="w-full p-3 bg-white border rounded-xl font-bold text-black" placeholder="Nombre" />

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setMenuModalOpen(true)} className="py-3 bg-gray-800 text-white rounded-xl font-bold text-sm">Gestionar Menú</button>
        <button onClick={() => onOpenPriceIncreaseModal(profile)} className="py-3 bg-gray-800 text-white rounded-xl font-bold text-sm">Precios %</button>
      </div>

      <div className="pt-2">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Tema Visual</label>
        <div className="flex gap-2">
          {themes.map(t => (
            <button key={t.name} onClick={() => onUpdate({ ...profile, theme: t.name })} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border-2 transition-all ${profile.theme === t.name ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 bg-white text-gray-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isMenuModalOpen && (
        <MenuManagementModal
          menu={profile.menu}
          modifierGroups={profile.modifierGroups}
          onSave={(newMenu, newGroups) => {
            const updated = { ...profile, menu: newMenu, modifierGroups: newGroups };
            onPermanentSave(updated); // Guardar inmediatamente en el padre
          }}
          onClose={() => setMenuModalOpen(false)}
          pizzaIngredients={pizzaIngredients}
          pizzaBasePrices={pizzaBasePrices}
          onUpdatePizzaConfig={onUpdatePizzaConfig}
        />
      )}
    </div>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = (props) => {
  const {
    settings, onSaveSettings, onGoToTables, waiter, onLogout,
    storeProfiles, onUpdateStoreProfiles, onClearAllSalesData,
    isPrinterConnected, printerName, onConnectPrinter, onDisconnectPrinter, onPrintTest,
    pizzaIngredients, pizzaBasePrices, onUpdatePizzaConfig
  } = props;

  const [localSettings, setLocalSettings] = useState(settings);
  const [localStoreProfiles, setLocalStoreProfiles] = useState(storeProfiles);
  const [isDirty, setIsDirty] = useState(false);

  const [priceIncreaseModalStore, setPriceIncreaseModalStore] = useState<StoreProfile | null>(null);

  // Detectar cambios sin re-sincronizar automáticamente
  useEffect(() => {
    const settingsChanged = JSON.stringify(localSettings) !== JSON.stringify(settings);
    const profilesChanged = JSON.stringify(localStoreProfiles) !== JSON.stringify(storeProfiles);
    setIsDirty(settingsChanged || profilesChanged);
  }, [localSettings, localStoreProfiles, settings, storeProfiles]);


  const handleSave = () => {
    const mainProfile = localStoreProfiles.find(p => p.id === 'main');
    const finalSettings = {
      ...localSettings,
      targetNumber: mainProfile ? mainProfile.whatsappNumber : localSettings.targetNumber
    };

    onSaveSettings(finalSettings);
    onUpdateStoreProfiles(localStoreProfiles);
    setIsDirty(false);
    alert("✅ Configuración guardada correctamente.");
  };

  const handleProfileUpdate = (updatedProfile: StoreProfile) => {
    setLocalStoreProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    if (updatedProfile.id === 'main') {
      setLocalSettings(prev => ({ ...prev, targetNumber: updatedProfile.whatsappNumber }));
    }
  };

  const handlePermanentProfileUpdate = (updatedProfile: StoreProfile) => {
    setLocalStoreProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    if (updatedProfile.id === 'main') {
      const newSettings = { ...localSettings, targetNumber: updatedProfile.whatsappNumber };
      setLocalSettings(newSettings);
      onSaveSettings(newSettings);
    }
    props.onUpdateStoreProfiles([updatedProfile]);
  };

  const handleTestWhatsApp = () => {
    const num = localSettings.targetNumber.replace(/\D/g, '');
    if (!num) { alert("Ingresa un número primero"); return; }
    window.open(`https://wa.me/${num}?text=${encodeURIComponent('Prueba de conexión desde Margarita App 🍕')}`, '_blank');
  };

  const handlePriceIncrease = (percentage: number, categoryTitle: string) => {
    if (!priceIncreaseModalStore) return;
    const updatedProfiles = JSON.parse(JSON.stringify(localStoreProfiles));
    const profileToUpdate = updatedProfiles.find((p: StoreProfile) => p.id === priceIncreaseModalStore.id);
    if (profileToUpdate) {
      profileToUpdate.menu.forEach((cat: MenuCategory) => {
        if (categoryTitle === "TODAS LAS CATEGORÍAS" || cat.title === categoryTitle) {
          cat.items.forEach((item: MenuItem) => {
            item.price = parseFloat((item.price * (1 + percentage / 100)).toFixed(2));
          });
        }
      });
      setLocalStoreProfiles(updatedProfiles);
    }
    setPriceIncreaseModalStore(null);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col bg-white">
      <header className="p-4 flex items-center justify-between border-b">
        <button onClick={onGoToTables} className="p-2 bg-gray-100 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter text-gray-800">Ajustes</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Sesión Activa</p>
            <p className="text-lg font-black text-red-800">{waiter}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-3 bg-white text-red-600 rounded-xl border border-red-100 shadow-sm active:scale-95 transition-all"
            title="Cerrar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {localStoreProfiles.map(profile => (
          <StoreProfileEditor
            key={profile.id}
            profile={profile}
            onUpdate={handleProfileUpdate}
            onPermanentSave={handlePermanentProfileUpdate}
            onOpenPriceIncreaseModal={setPriceIncreaseModalStore}
            pizzaIngredients={pizzaIngredients}
            pizzaBasePrices={pizzaBasePrices}
            onUpdatePizzaConfig={onUpdatePizzaConfig}
          />
        ))}

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 px-1 uppercase text-xs tracking-widest">Hardware de Impresión</h3>

          {/* Card de Impresión USB/Cable (PC) */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-blue-800 uppercase text-[10px]">Modo Sistema (Cable):</span>
              <span className="font-black px-2 py-0.5 rounded-full text-[10px] uppercase bg-blue-100 text-blue-700">
                LISTO / ACTIVO
              </span>
            </div>
            <p className="text-[9px] text-blue-500 font-medium leading-tight">
              Si usas una impresora con cable USB en tu PC, el sistema usará el diálogo de impresión de Windows automáticamente.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-600 uppercase text-[10px]">Bluetooth (Solo Teléfonos):</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${isPrinterConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isPrinterConnected ? `Conectada: ${printerName}` : 'No conectada'}
              </span>
            </div>
            {isPrinterConnected ? (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={onPrintTest} className="py-2.5 bg-blue-500 text-white rounded-lg font-bold text-xs uppercase">Prueba BT</button>
                <button onClick={onDisconnectPrinter} className="py-2.5 bg-gray-600 text-white rounded-lg font-bold text-xs uppercase">Desconectar</button>
              </div>
            ) : (
              <button onClick={onConnectPrinter} className="w-full py-3.5 bg-gray-800 text-white rounded-lg font-bold text-xs uppercase">Buscar Impresora BT</button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 px-1 uppercase text-xs tracking-widest">Finanzas y Staff</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border">
              <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Tasa Paralelo</label>
              <input
                type="number"
                value={localSettings.exchangeRateParallel}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  const newSettings = { ...localSettings, exchangeRateParallel: val };
                  setLocalSettings(newSettings);
                  onSaveSettings(newSettings);
                }}
                className="w-full bg-transparent font-bold text-black outline-none"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border">
              <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Tasa BCV</label>
              <input
                type="number"
                value={localSettings.exchangeRateBCV}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  const newSettings = { ...localSettings, exchangeRateBCV: val };
                  setLocalSettings(newSettings);
                  onSaveSettings(newSettings);
                }}
                className="w-full bg-transparent font-bold text-black outline-none"
              />
            </div>
          </div>

          <div className="p-1 bg-gray-100 rounded-xl flex gap-1">
            <button
              onClick={() => {
                const newSettings = { ...localSettings, activeExchangeRate: 'parallel' as const };
                setLocalSettings(newSettings);
                onSaveSettings(newSettings);
              }}
              className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${localSettings.activeExchangeRate === 'parallel' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              Usar Paralelo
            </button>
            <button
              onClick={() => {
                const newSettings = { ...localSettings, activeExchangeRate: 'bcv' as const };
                setLocalSettings(newSettings);
                onSaveSettings(newSettings);
              }}
              className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${localSettings.activeExchangeRate === 'bcv' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              Usar BCV
            </button>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border">
            <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">WhatsApp de Pedidos (Cocina)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={localSettings.targetNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const newSettings = { ...localSettings, targetNumber: val };
                  setLocalSettings(newSettings);
                  onSaveSettings(newSettings);
                  setLocalStoreProfiles(prev => prev.map(p => p.id === 'main' ? { ...p, whatsappNumber: val } : p));
                }}
                className="flex-grow bg-transparent font-bold text-black outline-none"
                placeholder="Ej: 584120000000"
              />
              <button
                onClick={handleTestWhatsApp}
                className="px-3 py-1 bg-green-500 text-white text-[9px] font-black rounded-lg shadow-sm active:scale-95"
              >
                PROBAR
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-[10px] uppercase">Meseros pueden cobrar</span>
              <span className="text-[9px] text-gray-500 font-medium">Permite a meseros finalizar ventas</span>
            </div>
            <button
              onClick={() => {
                const newSettings = { ...localSettings, waitersCanCharge: !localSettings.waitersCanCharge };
                setLocalSettings(newSettings);
                onSaveSettings(newSettings);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.waitersCanCharge ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.waitersCanCharge ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-gray-800 px-1 uppercase text-[10px] tracking-widest">Accesos por Rol</h3>
            <div className="bg-gray-50 rounded-xl border overflow-hidden divide-y">
              {(['admin', 'mesero', 'cajero'] as UserRole[]).map(role => (
                <div key={role} className="p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-[10px] uppercase text-brand">{role}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['menu', 'reports', 'settings', 'kanban'] as (keyof RolePermissions)[]).map(module => (
                      <button
                        key={module}
                        onClick={() => {
                          const newPermissions = { ...localSettings.rolePermissions[role], [module]: !localSettings.rolePermissions[role][module] };
                          const newSettings = {
                            ...localSettings,
                            rolePermissions: {
                              ...localSettings.rolePermissions,
                              [role]: newPermissions
                            }
                          };
                          setLocalSettings(newSettings);
                          onSaveSettings(newSettings);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${localSettings.rolePermissions[role][module] ? 'bg-brand/5 border-brand/20' : 'bg-gray-50 border-gray-100'}`}
                      >
                        <div className={`w-3 h-3 rounded-full border ${localSettings.rolePermissions[role][module] ? 'bg-brand border-brand' : 'bg-white border-gray-300'}`} />
                        <span className={`text-[9px] font-bold uppercase ${localSettings.rolePermissions[role][module] ? 'text-gray-800' : 'text-gray-400'}`}>
                          {module === 'menu' ? 'Menú' : module === 'reports' ? 'Ventas' : module === 'settings' ? 'Ajustes' : 'Tablero'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* --- GESTIÓN DE USUARIOS / PERSONAL --- */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-end px-1">
              <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Gestión de Personal</h3>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Acceso y Roles</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
              {/* Lista de Usuarios */}
              <div className="divide-y divide-gray-200">
                {localSettings.users.map(user => (
                  <div key={user.id} className="p-4 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm uppercase">{user.name}</p>
                        <div className="flex gap-2 items-center">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {user.role}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 tracking-widest">PIN: {user.pin}</span>
                        </div>
                      </div>
                    </div>
                    {/* Impedir borrar el único admin por accidente */}
                    {(user.role !== 'admin' || localSettings.users.filter(u => u.role === 'admin').length > 1) && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${user.name}?`)) {
                            const newUsers = localSettings.users.filter(u => u.id !== user.id);
                            const newSettings = { ...localSettings, users: newUsers };
                            setLocalSettings(newSettings);
                            onSaveSettings(newSettings);
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulario Agregar Nuevo */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Registrar Nuevo Personal</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    id="new-user-name"
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-red-500 transition-colors"
                    placeholder="Nombre Completo"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      id="new-user-pin"
                      maxLength={4}
                      inputMode="numeric"
                      className="p-4 bg-white border border-gray-200 rounded-xl font-bold text-sm text-center tracking-widest outline-none focus:border-red-500 transition-colors"
                      placeholder="PIN (4 Dígitos)"
                      onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                    />
                    <select
                      id="new-user-role"
                      className="p-4 bg-white border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="mesero">Mesero</option>
                      <option value="admin">Administrador</option>
                      <option value="cajero">Cajero</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const nameInput = document.getElementById('new-user-name') as HTMLInputElement;
                      const pinInput = document.getElementById('new-user-pin') as HTMLInputElement;
                      const roleSelect = document.getElementById('new-user-role') as HTMLSelectElement;

                      if (nameInput.value.trim() && pinInput.value.length === 4) {
                        const newUser: User = {
                          id: Math.random().toString(36).substr(2, 9),
                          name: nameInput.value.trim(),
                          pin: pinInput.value,
                          role: roleSelect.value as UserRole
                        };
                        const newUsers = [...localSettings.users, newUser];
                        const newSettings = { ...localSettings, users: newUsers };
                        setLocalSettings(newSettings);
                        onSaveSettings(newSettings);
                        nameInput.value = '';
                        pinInput.value = '';
                      } else {
                        alert("Por favor completa el nombre y un PIN de 4 dígitos.");
                      }
                    }}
                    className="w-full py-4 bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all"
                  >
                    Agregar Nuevo Miembro
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => onClearAllSalesData()} className="w-full py-4 text-red-600 font-bold bg-red-50 rounded-2xl border border-red-100 uppercase text-xs">Limpiar Historial de Ventas</button>
        </div>

        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`w-full py-5 font-black rounded-2xl shadow-lg uppercase tracking-widest mt-4 transition-all ${isDirty
            ? 'bg-red-600 text-white active:scale-95 shadow-red-200'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          Guardar Cambios
        </button>
      </div>

      {priceIncreaseModalStore && (
        <PriceIncreaseModal
          storeProfile={priceIncreaseModalStore}
          onClose={() => setPriceIncreaseModalStore(null)}
          onConfirm={handlePriceIncrease}
        />
      )}
    </div>
  );
};


export default SettingsScreen;
