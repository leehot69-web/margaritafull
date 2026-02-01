
import React, { useState, useEffect } from 'react';
import { AppSettings, StoreProfile, ThemeName, MenuCategory, MenuItem, ModifierGroup, PizzaIngredient, User, UserRole } from '../types';
import MenuManagementModal from './MenuManagementModal';
import PriceIncreaseModal from './PriceIncreaseModal';
import UserManagementModal from './UserManagementModal';

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
      <input type="text" value={profile.whatsappNumber} onChange={(e) => onUpdate({ ...profile, whatsappNumber: e.target.value })} className="w-full p-3 bg-white border rounded-xl font-bold text-black" placeholder="WhatsApp Cocina" />

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
  const [isUserModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    const settingsChanged = JSON.stringify(localSettings) !== JSON.stringify(settings);
    const profilesChanged = JSON.stringify(localStoreProfiles) !== JSON.stringify(storeProfiles);
    setIsDirty(settingsChanged || profilesChanged);
  }, [localSettings, localStoreProfiles, settings, storeProfiles]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onUpdateStoreProfiles(localStoreProfiles);
    setIsDirty(false);
  };

  const handleProfileUpdate = (updatedProfile: StoreProfile) => {
    setLocalStoreProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const handlePermanentProfileUpdate = (updatedProfile: StoreProfile) => {
    setLocalStoreProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    props.onUpdateStoreProfiles([updatedProfile]);
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
          <h3 className="font-bold text-gray-800 px-1 uppercase text-xs tracking-widest">Impresora Bluetooth</h3>
          <div className="p-4 bg-gray-50 rounded-xl border space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-600 uppercase text-[10px]">Estado:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${isPrinterConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isPrinterConnected ? `Conectada: ${printerName}` : 'No conectada'}
              </span>
            </div>
            {isPrinterConnected ? (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={onPrintTest} className="py-2.5 bg-blue-500 text-white rounded-lg font-bold text-xs uppercase">Imprimir Prueba</button>
                <button onClick={onDisconnectPrinter} className="py-2.5 bg-gray-600 text-white rounded-lg font-bold text-xs uppercase">Desconectar</button>
              </div>
            ) : (
              <button onClick={onConnectPrinter} className="w-full py-3.5 bg-gray-800 text-white rounded-lg font-bold text-xs uppercase">Conectar Impresora</button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 px-1 uppercase text-xs tracking-widest">Finanzas y Staff</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border">
              <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Tasa Paralelo</label>
              <input type="number" value={localSettings.exchangeRateParallel} onChange={(e) => setLocalSettings({ ...localSettings, exchangeRateParallel: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent font-bold text-black outline-none" />
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border">
              <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Tasa BCV</label>
              <input type="number" value={localSettings.exchangeRateBCV} onChange={(e) => setLocalSettings({ ...localSettings, exchangeRateBCV: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent font-bold text-black outline-none" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-[10px] uppercase">Meseros pueden cobrar</span>
              <span className="text-[9px] text-gray-500 font-medium">Permite a meseros finalizar ventas</span>
            </div>
            <button
              onClick={() => setLocalSettings({ ...localSettings, waitersCanCharge: !localSettings.waitersCanCharge })}
              className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.waitersCanCharge ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.waitersCanCharge ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <button onClick={() => setUserModalOpen(true)} className="w-full py-4 text-blue-600 font-bold bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center gap-2 uppercase text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Gestionar Usuarios
          </button>
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

      {isUserModalOpen && (
        <UserManagementModal
          users={localSettings.users}
          onSave={(updatedUsers) => {
            setLocalSettings(prev => ({ ...prev, users: updatedUsers }));
            setUserModalOpen(false);
          }}
          onClose={() => setUserModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SettingsScreen;
