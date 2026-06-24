import { Bell, PieChart, Plus, Settings, TrendingUp, Wallet } from "lucide-react";
import { GlassCard } from "../../common/components";
import { Link } from "react-router-dom";
import { useState } from "react";
import { strings } from "../../common/texts/strings";
import { useApp } from "../../data/api/AppContext";
import { AddTransactionModal } from "../transactions/ui/AddTransactionModal";

const Dashboard = () => {
    const { accounts, transactions } = useApp();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const totalNetWorth = accounts.reduce((acc, curr) => acc + curr.amount, 0);
    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{strings.appTitle}</h1>
                <div className="flex gap-4">
                    <GlassCard className="p-2 px-4 flex items-center gap-2 cursor-pointer hover-scale">
                        <Bell size={20} className="text-slate-600" />
                        <span className="text-sm font-medium">Alerts</span>
                    </GlassCard>
                    <div className="w-10 h-10 rounded-full clay flex-center cursor-pointer">
                        <Settings size={20} className="text-slate-600" />
                    </div>
                </div>
            </div>

            <div className="grid-auto-fit mb-8">
                <GlassCard className="bg-gradient-primary text-white border-none shadow-xl">
                    <p className="text-indigo-100 mb-1">{strings.totalNetWorth}</p>
                    <h2 className="text-4xl font-bold">₹{totalNetWorth.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-indigo-100 text-sm">
                        <TrendingUp size={16} />
                        <span>+5.2% from last month</span>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">{strings.accounts}</h3>
                        <Plus size={20} className="text-indigo-500 cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-3">
                        {accounts.map(account => (
                            <div key={account.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex-center bg-indigo-50 text-indigo-600">
                                        <Wallet size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium m-0">{account.name}</p>
                                        {account.notes && <p className="text-xs text-slate-500 m-0">{account.notes}</p>}
                                    </div>
                                </div>
                                <p className="font-semibold m-0">₹{account.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <GlassCard className="lg-col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">{strings.recentTransactions}</h3>
                        <Link to="/dashboard/transactions" className="text-sm text-indigo-500 font-medium no-underline hover:underline">View All</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {recentTransactions.length > 0 ? recentTransactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-4 clay">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex-center ${t.direction === 'received' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {t.direction === 'received' ? <TrendingUp size={24} /> : <PieChart size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 m-0">{t.notes || t.categoryLabel}</p>
                                        <p className="text-xs text-slate-500 m-0">{t.categoryLabel} • {new Date(t.spentAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className={`font-bold m-0 ${t.direction === 'received' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.direction === 'received' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </p>
                            </div>
                        )) : (
                            <p className="text-center text-slate-400 py-8">No transactions yet</p>
                        )}
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="font-semibold text-lg mb-4">{strings.finScore}</h3>
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-32 h-32 flex-center">
                            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="72.8" className="text-indigo-500 transition-all" />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="text-3xl font-bold">80</span>
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Health</span>
                            </div>
                        </div>
                        <p className="text-center text-sm text-slate-600 mt-4 px-4">
                            Great job! Your savings rate is excellent this month.
                        </p>
                    </div>
                </GlassCard>
            </div>

            {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />}

            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fab lg:hidden"
                style={{ position: 'fixed', bottom: '100px', right: '24px', zIndex: 60 }}
            >
                <Plus size={32} />
            </button>
        </div>
    );
};

export default Dashboard;
