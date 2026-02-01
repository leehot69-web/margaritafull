
import React from 'react';
import { CartItem, Table, AppSettings, OrderItem, ModifierGroup, MenuCategory } from '../types';

interface CartScreenProps {
    // Delivery Mode Props
    cart?: CartItem[];
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemoveItem: (id: string) => void;
    onClearCart?: () => void;
    onBackToMenu: () => void;
    onGoToCheckout?: () => void;
    onEditItem: (id: string) => void;
    menu?: MenuCategory[];
    allModifierGroups?: ModifierGroup[];
    activeRate: number;
    isEditing?: boolean;

    // POS Mode Props
    table?: Table | null;
    waiter?: string;
    settings?: AppSettings;
    onOpenConfirmPayModal?: (table: Table) => void;
    onFreeTable?: (table: Table) => void;
    onOpenConfirmSendModal?: (table: Table) => void;
    onOpenMoveTableModal?: (table: Table) => void;
    onOpenPendingPaymentsModal?: () => void;
    onPrintComanda?: (table: Table) => void;
    isPrinterConnected?: boolean;
}

const CartScreen: React.FC<CartScreenProps> = (props) => {
    const { activeRate, isEditing = false } = props;
    const isPosMode = props.table !== undefined;

    // --- MODO DELIVERY / POS SIMPLE ---
    const { cart, onUpdateQuantity, onRemoveItem, onBackToMenu, onGoToCheckout, onEditItem, onClearCart } = props;
    if (!cart) return null;

    const total = cart.reduce((acc, item) => {
        const modTotal = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
        return acc + ((item.price + modTotal) * item.quantity);
    }, 0);

    if (cart.length === 0) {
        return (
            <div className="flex flex-col h-full bg-white overflow-hidden">
                <header className="p-4 flex items-center border-b flex-shrink-0">
                    <button onClick={onBackToMenu} className="p-2 rounded-full active:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="ml-4 text-xl font-bold text-gray-800">Tu Carrito</h1>
                </header>
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Carrito vacío</h2>
                    <p className="text-gray-500 mb-8">¡Agrega algo delicioso!</p>
                    <button onClick={onBackToMenu} className="px-8 py-3 bg-[var(--brand-color)] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">Ir al Menú</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
            <header className="p-4 bg-white shadow-sm flex-shrink-0 z-10 flex items-center justify-between border-b">
                <div className="flex items-center">
                    <button onClick={onBackToMenu} className="p-2 rounded-full active:bg-gray-100 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gray-800 leading-none">Tu Pedido</h1>
                        {isEditing && <span className="text-[10px] font-black text-amber-500 uppercase mt-1">Modificando Cuenta</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onClearCart && (
                        <button
                            type="button"
                            onClick={() => onClearCart()}
                            onTouchEnd={(e) => { e.preventDefault(); onClearCart(); }}
                            className={`p-2 ${isEditing ? 'text-amber-600 bg-amber-50' : 'text-red-600 hover:bg-red-50'} rounded-full transition-colors flex items-center gap-1 px-4 relative z-50`}
                            title={isEditing ? "Abandonar edición" : "Borrar todo el pedido"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            {isEditing && <span className="text-[10px] font-black uppercase">Abandonar</span>}
                        </button>
                    )}
                    {!isEditing && <span className="text-xs font-black uppercase text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{cart.reduce((a, c) => a + c.quantity, 0)} items</span>}
                </div>
            </header>

            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {cart.map(item => {
                    const modTotal = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
                    const unitPrice = item.price + modTotal;
                    const isOriginal = item.isServed;

                    return (
                        <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border ${isOriginal ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'} flex flex-col`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="max-w-[70%]">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base text-gray-800 leading-tight">{item.name}</h3>
                                        {isOriginal && <span className="bg-amber-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full uppercase tracking-tighter">Servido</span>}
                                    </div>
                                    {item.selectedModifiers.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                            {(() => {
                                                const groups: Record<string, string[]> = {};
                                                item.selectedModifiers.forEach(m => {
                                                    if (!groups[m.groupTitle]) groups[m.groupTitle] = [];
                                                    groups[m.groupTitle].push(m.option.name);
                                                });
                                                return Object.entries(groups).map(([groupTitle, options]) => (
                                                    <p key={groupTitle} className="text-[10px] text-gray-500 leading-tight">
                                                        <span className="font-bold uppercase text-[8px] text-gray-400 mr-1">{groupTitle}:</span>
                                                        {options.join(', ')}
                                                    </p>
                                                ));
                                            })()}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900 leading-none text-base">${(unitPrice * item.quantity).toFixed(2)}</p>
                                    <p className="text-xs font-bold text-gray-400">Bs. {((unitPrice * item.quantity) * activeRate).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 border-t border-gray-50 pt-3">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => onRemoveItem(item.id)} className={`text-[10px] ${isOriginal ? 'text-red-400 font-bold' : 'text-red-500 font-black'} uppercase tracking-widest px-2 py-1 rounded active:bg-red-50`}>
                                        {isOriginal ? 'Borrar (PIN)' : 'Borrar'}
                                    </button>
                                    {!isOriginal && <button onClick={() => onEditItem(item.id)} className="text-[10px] text-blue-600 font-black uppercase tracking-widest px-2 py-1 rounded active:bg-blue-50">Editar</button>}
                                    {isOriginal && <span className="text-[9px] font-bold text-amber-600 italic">Previamente enviado</span>}
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border">
                                    {isOriginal ? (
                                        <>
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-gray-300 border border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <span className="font-black text-gray-400 w-6 text-center text-sm">{item.quantity}</span>
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-gray-300 border border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 font-black active:bg-gray-100 border">-</button>
                                            <span className="font-black text-gray-800 w-6 text-center text-sm">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 font-black active:bg-gray-100 border">+</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex-shrink-0 bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 border-t">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Total</span>
                    <div className="text-right">
                        <span className="text-3xl font-black text-gray-900 leading-none">${total.toFixed(2)}</span>
                        <p className="text-sm font-bold text-gray-500">Bs. {(total * activeRate).toFixed(2)}</p>
                    </div>
                </div>

                {onGoToCheckout && (
                    <button
                        onClick={onGoToCheckout}
                        className={`w-full ${isEditing ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'} text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex justify-between px-6 items-center`}
                    >
                        <span>{isEditing ? 'Ir a Cobrar' : 'Continuar'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CartScreen;
