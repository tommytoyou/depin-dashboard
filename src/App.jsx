import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const C = {
  bg: '#0a0e17', bgCard: '#111827', bgElevated: '#1a2234', border: '#2d3748',
  textPrimary: '#f1f5f9', textSecondary: '#94a3b8', textMuted: '#64748b',
  accent: '#06b6d4', compute: '#8b5cf6', storage: '#10b981', wireless: '#f59e0b',
  sensors: '#ec4899', energy: '#22c55e', services: '#6366f1', up: '#22c55e', down: '#ef4444',
};

const TOKEN_META = {
  'chainlink': { category: 'Data', color: '#375BD2' },
  'filecoin': { category: 'Storage', color: C.storage },
  'render-token': { category: 'Compute', color: C.compute },
  'bittensor': { category: 'AI/ML', color: C.services },
  'internet-computer': { category: 'Compute', color: C.compute },
  'the-graph': { category: 'Data', color: '#6747ED' },
  'helium': { category: 'Wireless', color: C.wireless },
  'arweave': { category: 'Storage', color: C.storage },
  'akash-network': { category: 'Compute', color: C.compute },
  'iotex': { category: 'IoT', color: '#00D4D5' },
  'io-net': { category: 'Compute', color: C.accent },
  'storj': { category: 'Storage', color: C.storage },
};

const CATEGORIES = [
  { name: 'Compute', projects: null, color: C.compute },
  { name: 'Bandwidth', projects: null, color: C.wireless },
  { name: 'Data', projects: null, color: C.services },
  { name: 'Energy', projects: null, color: C.energy },
  { name: 'Sensors', projects: null, color: C.sensors },
];

const NETWORKS = [
  { name: 'Akash Network', metrics: [{ label: 'Active Providers', value: '71' }, { label: 'GPU Utilization', value: '50%' }, { label: 'Q3 Revenue', value: '$820K' }], source: 'Messari Q3 2025', color: C.compute },
  { name: 'io.net', metrics: [{ label: 'Connected GPUs', value: '100K+' }, { label: 'Compute Hours', value: '1M+' }, { label: 'Countries', value: '130+' }], source: 'io.net Explorer', color: C.accent },
  { name: 'Helium', metrics: [{ label: 'Total Hotspots', value: '962K' }, { label: 'Cities', value: '81K' }, { label: 'Countries', value: '191' }], source: 'Helium Explorer', color: C.wireless },
  { name: 'Filecoin', metrics: [{ label: 'Raw Capacity', value: '7.6 EiB' }, { label: 'Data Stored', value: '2.1 EiB' }, { label: 'Utilization', value: '32%' }], source: 'Filscan', color: C.storage },
  { name: 'Render Network', metrics: [{ label: 'Frames/Month', value: '1.49M' }, { label: 'Fee Burned', value: '$208K' }, { label: 'YoY Growth', value: '+17.7%' }], source: 'Render Foundation', color: C.sensors },
];

const fmt = (v) => v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(0)}M` : `$${v}`;

export default function App() {
  const [tab, setTab] = useState('overview');
  const [tokens, setTokens] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect triggered - Fetch starting');
    async function fetchPrices() {
      try {
        const res = await fetch('/.netlify/functions/prices');
        console.log('Fetch response status:', res.status, res.ok);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        console.log('Full API response:', JSON.stringify(data, null, 2));
        console.log('data.tokens:', data.tokens);
        console.log('data.category:', data.category);
        const enrichedTokens = data.tokens.map(t => ({
          ...t,
          category: TOKEN_META[t.id]?.category || 'Other',
          color: TOKEN_META[t.id]?.color || C.accent,
        }));
        console.log('Enriched tokens:', enrichedTokens);
        setTokens(enrichedTokens);
        if (data.category) {
          setCategory(data.category);
        }
        console.log('State updates called - tokens:', enrichedTokens.length, 'category:', data.category);
      } catch (err) {
        console.error('Error fetching prices:', err);
        console.error('Error details:', err.message, err.stack);
      } finally {
        setLoading(false);
        console.log('Loading set to false');
      }
    }
    fetchPrices();
  }, []);

  const totalMcap = tokens.reduce((s,t) => s + (t.marketCap || 0), 0);

  return (
    <div style={{ minHeight:'100vh', width:'100vw', background:C.bg, display:'flex', justifyContent:'center', fontFamily:'system-ui' }}>
      <div style={{ width:'100%', maxWidth:1400, padding:'0 24px', boxSizing:'border-box' }}>
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
          <h1 style={{ color:C.textPrimary, fontSize:22, fontWeight:'bold', margin:0 }}>DePIN Sector Intelligence</h1>
          <p style={{ color:C.textSecondary, fontSize:13, margin:'6px 0 0' }}>Decentralized Physical Infrastructure Analytics</p>
        </div>

        <div style={{ display:'flex', gap:4, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:4, marginBottom:16 }}>
          {['overview','tokens','networks'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, background: tab===t ? C.accent : 'transparent', color: tab===t ? C.bg : C.textSecondary, border:'none', borderRadius:8, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
              <h3 style={{ color:C.textPrimary, fontSize:12, margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Live Data <span style={{ color:C.textMuted, fontSize:10, fontWeight:'normal' }}>(CoinGecko)</span></h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
                {[
                  { label:'DePIN Market Cap', value: loading ? '...' : category?.marketCap ? fmt(category.marketCap) : fmt(totalMcap) },
                  { label:'Tracked Tokens', value: loading ? '...' : tokens.length },
                  { label:'24h Change', value: loading ? '...' : category?.marketCapChange24h != null ? `${category.marketCapChange24h >= 0 ? '+' : ''}${category.marketCapChange24h.toFixed(2)}%` : '—', isChange: true, positive: category?.marketCapChange24h >= 0 },
                ].map(s => (
                  <div key={s.label} style={{ background:C.bgElevated, borderRadius:8, padding:14 }}>
                    <p style={{ color:C.textMuted, fontSize:10, textTransform:'uppercase', margin:0 }}>{s.label}</p>
                    <p style={{ color: s.isChange ? (s.positive ? C.up : C.down) : C.textPrimary, fontSize:24, fontWeight:'bold', margin:'6px 0 0' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
              <h3 style={{ color:C.textPrimary, fontSize:12, margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Static Metrics</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
                {[
                  { label:'Active Devices', value: '42.7M', source: 'DePINscan' },
                  { label:'Sector ARR', value: '$47.12M', source: 'DePIN Pulse' },
                  { label:'Total Projects', value: '2,354', source: 'DePIN Pulse' },
                ].map(s => (
                  <div key={s.label} style={{ background:C.bgElevated, borderRadius:8, padding:14 }}>
                    <p style={{ color:C.textMuted, fontSize:10, textTransform:'uppercase', margin:0 }}>{s.label}</p>
                    <p style={{ color:C.textPrimary, fontSize:24, fontWeight:'bold', margin:'6px 0 0' }}>{s.value}</p>
                    <p style={{ color:C.textMuted, fontSize:9, margin:'4px 0 0' }}>{s.source}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <h3 style={{ color:C.textPrimary, fontSize:14, margin:'0 0 16px' }}>Project Categories <span style={{ color:C.textMuted, fontSize:10, fontWeight:'normal' }}>(DePIN Pulse)</span></h3>
              <div style={{ display:'flex', gap:24, alignItems:'center' }}>
                <div style={{ width:180, height:180, minWidth:180, minHeight:180, flexShrink:0 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={CATEGORIES.map((c,i) => ({ ...c, value: 1 }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" strokeWidth={0}>{CATEGORIES.map((e,i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer></div>
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10, justifyContent:'center' }}>{CATEGORIES.map(c => (<div key={c.name} style={{ display:'flex', alignItems:'center', gap:10 }}><div style={{ width:12, height:12, borderRadius:6, background:c.color }} /><span style={{ color:C.textSecondary, fontSize:14 }}>{c.name}</span></div>))}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'tokens' && (
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
            <h3 style={{ color:C.textPrimary, fontSize:14, margin:'0 0 12px' }}>DePIN Token Prices</h3>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:40 }}>
                <div style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTopColor:C.accent, borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : tokens.length === 0 ? (
              <p style={{ color:C.textMuted, textAlign:'center', padding:40 }}>Failed to load token data</p>
            ) : (
              tokens.map((t,i) => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ color:C.textMuted, width:20, fontSize:11 }}>{i+1}</span>
                  <div style={{ width:28, height:28, borderRadius:14, background:t.color, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'white', fontSize:10, fontWeight:'bold' }}>{t.symbol.slice(0,2)}</span></div>
                  <div style={{ flex:1 }}><p style={{ color:C.textPrimary, fontWeight:600, fontSize:13, margin:0 }}>{t.symbol}</p><p style={{ color:C.textMuted, fontSize:10, margin:0 }}>{t.name}</p></div>
                  <div style={{ textAlign:'right' }}><p style={{ color:C.textPrimary, fontSize:13, margin:0 }}>${t.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: t.price < 1 ? 4 : 2 })}</p><p style={{ color: t.change24h >= 0 ? C.up : C.down, fontSize:11, margin:0 }}>{t.change24h >= 0 ? '+' : ''}{t.change24h?.toFixed(2)}%</p></div>
                  <div style={{ width:80, textAlign:'right' }}><p style={{ color:C.textSecondary, fontSize:11, margin:0 }}>{fmt(t.marketCap)}</p></div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'networks' && (
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
            <h3 style={{ color:C.textPrimary, fontSize:14, margin:'0 0 16px' }}>Network Benchmarks</h3>
            {NETWORKS.map(net => (
              <div key={net.name} style={{ background:C.bgElevated, borderRadius:10, padding:16, marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}><span style={{ color:C.textPrimary, fontWeight:600 }}>{net.name}</span><span style={{ color:C.textMuted, fontSize:10 }}>{net.source}</span></div>
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${net.metrics.length}, 1fr)`, gap:12 }}>{net.metrics.map(m => (<div key={m.label}><p style={{ color:C.textMuted, fontSize:10, margin:0 }}>{m.label}</p><p style={{ color:C.textPrimary, fontSize:20, fontWeight:'bold', margin:'4px 0 0' }}>{m.value}</p></div>))}</div>
              </div>
            ))}
          </div>
        )}

        <p style={{ color:C.textMuted, fontSize:10, textAlign:'center', marginTop:20 }}>Live data: CoinGecko | Static metrics last updated: Jan 7, 2026</p>
      </div>
    </div>
  );
}
