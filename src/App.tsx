import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, TrendingUp, Package, ShoppingCart, Receipt, Plus, ArrowRight, Check, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Helper to format currency
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
};

const InputField = ({ label, value, onChange, suffix, type = "number" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <input
        type={type}
        value={value === '' ? '' : value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? '' : Number(val));
        }}
        className="w-full pl-3 pr-10 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-neutral-100 placeholder-neutral-600"
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-neutral-500 sm:text-sm group-focus-within:text-emerald-500 transition-colors">{suffix}</span>
        </div>
      )}
    </div>
  </div>
);

const Toggle = ({ label, enabled, onChange, description }: any) => (
  <div className="flex items-start justify-between py-3 border-b border-neutral-800/50 last:border-0">
    <div className="flex flex-col pr-4">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      {description && <span className="text-xs text-neutral-500 mt-0.5">{description}</span>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-emerald-500' : 'bg-neutral-700'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'];

const ResultCard = ({ title, result, sellPrice, qty, includeShipping, incomeTaxRate }: any) => {
  const chartData = [
    { name: 'Net Kazanç', value: Math.max(0, result.netProfit) },
    { name: 'Ürün Maliyeti', value: result.c_exVat },
    ...(includeShipping ? [{ name: 'Kargo', value: result.sh_exVat }] : []),
    { name: 'Komisyonlar', value: result.commTotal },
    { name: 'Ödenecek KDV', value: result.kdv_odenecek },
    { name: 'Gelir Vergisi', value: result.tax_gelir },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col h-full relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-900"></div>
      <div className="p-5 border-b border-neutral-800/50 bg-neutral-900/80 flex justify-between items-center">
        <h3 className="font-semibold text-neutral-200 flex items-center gap-2">
          {qty > 1 ? <Package className="w-5 h-5 text-emerald-500" /> : <ShoppingCart className="w-5 h-5 text-emerald-500" />}
          {title}
        </h3>
        <span className="text-lg font-bold text-emerald-400">{formatCurrency(sellPrice)}</span>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-6">
        {/* Net Profit Highlight */}
        <div className={`rounded-xl p-4 border flex justify-between items-center relative overflow-hidden transition-colors ${result.netProfit < 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl ${result.netProfit < 0 ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}></div>
          <div className="relative z-10">
            <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${result.netProfit < 0 ? 'text-rose-400/80' : 'text-emerald-400/80'}`}>Net Kazanç</p>
            <p className={`text-3xl font-bold ${result.netProfit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatCurrency(result.netProfit)}</p>
          </div>
          <div className="text-right relative z-10">
            <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${result.netProfit < 0 ? 'text-rose-400/80' : 'text-emerald-400/80'}`}>Kar Marjı</p>
            <p className={`text-2xl font-bold ${result.netProfit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>%{result.netMargin.toFixed(1)}</p>
          </div>
        </div>

        {/* ROAS Targets */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/50 text-center">
            <p className="text-[10px] font-medium text-rose-500 uppercase tracking-tighter mb-1">Kötü ROAS</p>
            <p className="text-sm font-bold text-rose-400">{result.roas_kötü.toFixed(2)}</p>
          </div>
          <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800 text-center ring-1 ring-emerald-500/20">
            <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-tighter mb-1">Başabaş ROAS</p>
            <p className="text-sm font-bold text-emerald-400">{result.roas_basabas.toFixed(2)}</p>
          </div>
          <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/50 text-center">
            <p className="text-[10px] font-medium text-blue-500 uppercase tracking-tighter mb-1">Çok İyi ROAS</p>
            <p className="text-sm font-bold text-blue-400">{result.roas_iyii.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart */}
        {sellPrice > 0 && (
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#e5e5e5', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#a3a3a3' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-3 mt-auto">
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Gider & Vergi Kırılımı
          </h4>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Ürün Maliyeti (KDV Hariç)</span>
            <span className="font-medium text-neutral-200">{formatCurrency(result.c_exVat)}</span>
          </div>
          
          {includeShipping && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Kargo (KDV Hariç)</span>
              <span className="font-medium text-neutral-200">{formatCurrency(result.sh_exVat)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Komisyonlar (Shopify + POS)</span>
            <span className="font-medium text-rose-400">{formatCurrency(result.commTotal)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Ödenecek KDV</span>
            <span className="font-medium text-rose-400">{formatCurrency(result.kdv_odenecek)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Gelir Vergisi (%{incomeTaxRate})</span>
            <span className="font-medium text-rose-400">{formatCurrency(result.tax_gelir)}</span>
          </div>
          
          <div className="pt-3 mt-3 border-t border-neutral-800 flex justify-between items-center text-sm font-medium">
            <span className="text-neutral-300">Toplam Vergi & Gider</span>
            <span className="text-rose-500">
              {formatCurrency(result.c_exVat + result.sh_exVat + result.commTotal + result.kdv_odenecek + result.tax_gelir)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // Inputs
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [costIncludesVat, setCostIncludesVat] = useState<boolean>(true);
  const [shipping, setShipping] = useState<number | ''>('');
  const [includeShipping, setIncludeShipping] = useState<boolean>(true);
  const [vatRate, setVatRate] = useState<number>(20); // 10 or 20
  const [shopifyComm, setShopifyComm] = useState<number | ''>('');
  const [posComm, setPosComm] = useState<number | ''>('');
  const [incomeTaxRate, setIncomeTaxRate] = useState<number | ''>('');
  const [kdv2Enabled, setKdv2Enabled] = useState<boolean>(true);
  
  // Bundle Inputs
  const [bundleEnabled, setBundleEnabled] = useState<boolean>(false);
  const [bundleQty, setBundleQty] = useState<number | ''>('');
  const [bundlePrice, setBundlePrice] = useState<number | ''>('');

  // Calculation Logic
  const calculate = (sellPriceRaw: number | '', qtyRaw: number | '') => {
    const sellPrice = Number(sellPriceRaw) || 0;
    const qty = Number(qtyRaw) || 1;
    const c = Number(cost) || 0;
    const sh = Number(shipping) || 0;
    const sComm = Number(shopifyComm) || 0;
    const pComm = Number(posComm) || 0;
    const taxRate = Number(incomeTaxRate) || 0;

    const vRate = vatRate / 100;
    
    // Selling Price Breakdown
    const s_exVat = sellPrice / (1 + vRate);
    const kdv_satis = sellPrice - s_exVat;

    // Cost Breakdown
    const totalCost = c * qty;
    const c_exVat = costIncludesVat ? totalCost / (1 + vRate) : totalCost;
    const kdv_alis = costIncludesVat ? totalCost - c_exVat : totalCost * vRate;

    // Shipping Breakdown (Assuming 20% VAT standard for shipping)
    const activeShipping = includeShipping ? sh : 0;
    const sh_exVat = activeShipping / 1.20;
    const kdv_kargo = activeShipping - sh_exVat;

    // Commissions
    const commTotal = sellPrice * ((sComm + pComm) / 100);
    const expenseComm = kdv2Enabled ? commTotal : 0; // If KDV2 is processed, it's an official expense

    // VAT to Pay (Devlet)
    let kdv_odenecek = kdv_satis - kdv_alis - kdv_kargo;
    kdv_odenecek = Math.max(0, kdv_odenecek); // Devreden KDV is not paid this month

    // Gross Profit
    const profit_brut = s_exVat - c_exVat - sh_exVat - expenseComm;

    // Income Tax
    const tax_gelir = Math.max(0, profit_brut * (taxRate / 100));

    // Net Profit
    const netProfit = profit_brut - tax_gelir;
    const netMargin = sellPrice > 0 ? (netProfit / sellPrice) * 100 : 0;

    // ROAS Logic
    // beROAS = Sales / (Sales - Costs - Comm - Shipping)
    const expenses = c_exVat + (includeShipping ? sh_exVat : 0) + commTotal;
    const contribution = s_exVat - expenses;
    const roas_basabas = contribution > 0 ? s_exVat / contribution : 0;
    
    return {
      s_exVat,
      kdv_satis,
      c_exVat,
      kdv_alis,
      sh_exVat,
      kdv_kargo,
      commTotal,
      kdv_odenecek,
      profit_brut,
      tax_gelir,
      netProfit,
      netMargin,
      roas_basabas,
      roas_kötü: roas_basabas > 0 ? roas_basabas * 0.8 : 0,
      roas_iyii: roas_basabas > 0 ? roas_basabas * 1.5 : 0
    };
  };

  const singleResult = useMemo(() => calculate(price, 1), [price, cost, costIncludesVat, shipping, includeShipping, vatRate, shopifyComm, posComm, incomeTaxRate, kdv2Enabled]);
  const bundleResult = useMemo(() => calculate(bundlePrice, bundleQty), [bundlePrice, bundleQty, cost, costIncludesVat, shipping, includeShipping, vatRate, shopifyComm, posComm, incomeTaxRate, kdv2Enabled]);

  // Recommended Price Logic (Exact Mathematical Calculation for 20% Net Margin)
  const recommendedPrices = useMemo(() => {
    const c = Number(cost) || 0;
    const sh = Number(shipping) || 0;
    const sComm = Number(shopifyComm) || 0;
    const pComm = Number(posComm) || 0;
    const taxRate = Number(incomeTaxRate) || 0;
    const vRate = vatRate / 100;

    const totalCost = c;
    const c_exVat = costIncludesVat ? totalCost / (1 + vRate) : totalCost;
    const activeShipping = includeShipping ? sh : 0;
    const sh_exVat = activeShipping / 1.20;

    const C_fixed = c_exVat + sh_exVat;
    const S_factor = (1 / (1 + vRate)) - (((sComm + pComm) / 100) * (kdv2Enabled ? 1 : 0));
    const taxMultiplier = 1 - (taxRate / 100);

    const calculatePriceForMargin = (targetMargin: number) => {
      // NetProfit = SellPrice * targetMargin
      // NetProfit = (SellPrice * S_factor - C_fixed) * taxMultiplier
      // SellPrice * targetMargin = SellPrice * S_factor * taxMultiplier - C_fixed * taxMultiplier
      // SellPrice * (S_factor * taxMultiplier - targetMargin) = C_fixed * taxMultiplier
      const denominator = (S_factor * taxMultiplier) - targetMargin;
      
      if (denominator <= 0) return 0; // Impossible to reach this margin with current costs/taxes
      
      return (C_fixed * taxMultiplier) / denominator;
    };

    return {
      margin15: calculatePriceForMargin(0.15),
      margin20: calculatePriceForMargin(0.20),
      margin25: calculatePriceForMargin(0.25),
    };
  }, [cost, costIncludesVat, shipping, includeShipping, vatRate, shopifyComm, posComm, incomeTaxRate, kdv2Enabled]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans pb-20 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <PieChartIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Weis <span className="text-emerald-500 font-light">E-commerce</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Inputs Card */}
            <div className="bg-neutral-900 rounded-2xl shadow-xl border border-neutral-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                <Receipt className="w-5 h-5 text-emerald-500" />
                Temel Bilgiler
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <InputField label="Satış Fiyatı" value={price} onChange={setPrice} suffix="₺" />
                <InputField label="Ürün Maliyeti" value={cost} onChange={setCost} suffix="₺" />
              </div>

              <div className="space-y-1 mb-6 relative z-10">
                <Toggle 
                  label="Maliyete KDV Dahil" 
                  description="Ürün maliyetini KDV dahil mi girdiniz?"
                  enabled={costIncludesVat} 
                  onChange={setCostIncludesVat} 
                />
                <div className="flex items-center justify-between py-3 border-b border-neutral-800/50">
                  <span className="text-sm font-medium text-neutral-200">Ürün KDV Oranı</span>
                  <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                    <button onClick={() => setVatRate(10)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${vatRate === 10 ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}>%10</button>
                    <button onClick={() => setVatRate(20)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${vatRate === 20 ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}>%20</button>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-6 mt-8 flex items-center gap-2 text-white relative z-10">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Kargo & Komisyonlar
              </h2>

              <div className="space-y-4 mb-6 relative z-10">
                <Toggle 
                  label="Kargo Ücretini Dahil Et" 
                  enabled={includeShipping} 
                  onChange={setIncludeShipping} 
                />
                {includeShipping && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <InputField label="Kargo Ücreti (KDV Dahil)" value={shipping} onChange={setShipping} suffix="₺" />
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <InputField label="Shopify Komisyonu" value={shopifyComm} onChange={setShopifyComm} suffix="%" />
                <InputField label="POS Komisyonu" value={posComm} onChange={setPosComm} suffix="%" />
              </div>

              <div className="space-y-1 mb-2 relative z-10">
                <Toggle 
                  label="KDV2 / Gider Olarak Göster" 
                  description="Komisyonları resmi gider göstererek gelir vergisinden düşer."
                  enabled={kdv2Enabled} 
                  onChange={setKdv2Enabled} 
                />
                <div className="pt-4">
                  <InputField label="Gelir Vergisi Oranı" value={incomeTaxRate} onChange={setIncomeTaxRate} suffix="%" />
                </div>
              </div>
            </div>

            {/* Bundle Toggle Card */}
            <div className="bg-neutral-900 rounded-2xl shadow-xl border border-neutral-800 overflow-hidden">
              <div 
                className="p-6 cursor-pointer flex justify-between items-center hover:bg-neutral-800/50 transition-colors"
                onClick={() => setBundleEnabled(!bundleEnabled)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${bundleEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`}>
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Bundle (Çoklu) Satış</h3>
                    <p className="text-sm text-neutral-500">2'li, 3'lü paket satışları için hesaplama</p>
                  </div>
                </div>
                {bundleEnabled ? <Check className="w-5 h-5 text-emerald-500" /> : <ArrowRight className="w-5 h-5 text-neutral-600" />}
              </div>

              <AnimatePresence>
                {bundleEnabled && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-neutral-800"
                  >
                    <div className="p-6 grid grid-cols-2 gap-4 bg-neutral-950/50">
                      <InputField label="Bundle Adedi" value={bundleQty} onChange={setBundleQty} suffix="Adet" />
                      <InputField label="Bundle Satış Fiyatı" value={bundlePrice} onChange={setBundlePrice} suffix="₺" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Recommended Price Banner */}
            <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Önerilen Satış Fiyatları
                  </h3>
                  <p className="text-sm text-neutral-400 max-w-sm">
                    Maliyet ve vergileriniz hesaplanarak hedeflenen net kar marjlarına ulaşmanız için gereken spesifik satış fiyatları.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div className="flex justify-between items-center bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/50">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">%15 Kar</span>
                    <span className="font-mono font-bold text-neutral-200">{recommendedPrices.margin15 > 0 ? formatCurrency(recommendedPrices.margin15) : '---'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">%20 Kar</span>
                    <span className="font-mono font-bold text-emerald-400 text-lg">{recommendedPrices.margin20 > 0 ? formatCurrency(recommendedPrices.margin20) : '---'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/50">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">%25 Kar</span>
                    <span className="font-mono font-bold text-neutral-200">{recommendedPrices.margin25 > 0 ? formatCurrency(recommendedPrices.margin25) : '---'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className={`grid grid-cols-1 ${bundleEnabled ? 'md:grid-cols-2' : ''} gap-6 items-stretch`}>
              <ResultCard title="Tekli Satış Analizi" result={singleResult} sellPrice={Number(price) || 0} qty={1} includeShipping={includeShipping} incomeTaxRate={Number(incomeTaxRate) || 0} />
              
              {bundleEnabled && (
                <ResultCard title={`${bundleQty || 0}'li Bundle Analizi`} result={bundleResult} sellPrice={Number(bundlePrice) || 0} qty={Number(bundleQty) || 1} includeShipping={includeShipping} incomeTaxRate={Number(incomeTaxRate) || 0} />
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

