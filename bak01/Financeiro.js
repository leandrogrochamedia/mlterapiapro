
// financeiro.js - Lucro mensal + total
let chartFinanceiroInstance = null;

async function renderFinanceiro(){
  let dataPac=null; 
  try{ const r=await supabaseClient.from('pacotes_financeiro').select('*').eq('therapist_slug', THERAPIST_SLUG).order('created_at',{ascending:false}).limit(200); dataPac=r.data; }catch(e){} 
  if(!dataPac || dataPac.length===0){ try{ const r2=await supabaseClient.from('pacotes_financeiro').select('*').eq('terapeuta_slug', THERAPIST_SLUG).order('created_at',{ascending:false}).limit(200); dataPac=r2.data; }catch(e){} }
  
  const div=document.getElementById('listaFinanceiro');
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();
  
  if(!dataPac||dataPac.length===0){ 
    div.innerHTML='<p style="opacity:.5;text-align:center;padding:16px">Nenhum pacote vendido ainda 💰<br><small>Crie pacotes na ficha do cliente</small></p>'; 
    document.getElementById('kpiFat').innerText='R$ 0'; 
    document.getElementById('kpiFat2').innerText='R$ 0'; 
    document.getElementById('kpiFatMes').innerText='R$ 0';
    document.getElementById('kpiTicket').innerText='R$ 0';
    document.getElementById('kpiPacotes').innerText='0';
    return; 
  }
  
  // Total
  const total=dataPac.filter(p=>p.status==='pago'||p.status==='ativo'||p.status==='concluido').reduce((s,p)=>s+Number(p.valor_total||0),0);
  const totalMes = dataPac.filter(p=>{
    const d = new Date(p.created_at || p.data_venda);
    return d.getMonth()===mesAtual && d.getFullYear()===anoAtual && (p.status==='pago'||p.status==='ativo'||p.status==='concluido');
  }).reduce((s,p)=>s+Number(p.valor_total||0),0);
  
  const ativos = dataPac.filter(p=>p.status==='ativo').length;
  
  document.getElementById('kpiFat').innerText='R$ '+total.toLocaleString('pt-BR'); 
  document.getElementById('kpiFat2').innerText='R$ '+total.toLocaleString('pt-BR'); 
  document.getElementById('kpiFatMes').innerText='R$ '+totalMes.toLocaleString('pt-BR');
  document.getElementById('kpiFatMesLabel').innerText = agora.toLocaleDateString('pt-BR',{month:'long', year:'numeric'});
  document.getElementById('kpiTicket').innerText='R$ '+(total/(dataPac.length||1)).toFixed(0);
  document.getElementById('kpiPacotes').innerText = ativos;
  
  // Lista por mês
  const porMes = {};
  dataPac.forEach(p=>{
    const d = new Date(p.created_at || p.data_venda || new Date());
    const chave = d.toLocaleDateString('pt-BR',{month:'short', year:'2-digit'});
    const chaveOrd = d.getFullYear()+'-'+String(d.getMonth()).padStart(2,'0');
    if(!porMes[chaveOrd]) porMes[chaveOrd] = {label:chave, total:0, qtd:0, pacotes:[]};
    porMes[chaveOrd].total += Number(p.valor_total||0);
    porMes[chaveOrd].qtd += 1;
    porMes[chaveOrd].pacotes.push(p);
  });
  
  const mesesOrdenados = Object.keys(porMes).sort().reverse();
  
  div.innerHTML = mesesOrdenados.map(chave=>{
    const m = porMes[chave];
    return `<div style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:2px solid #f5e6cc">
        <b style="text-transform:capitalize">${m.label}</b>
        <span style="font-weight:900;color:#15803d">R$ ${m.total.toLocaleString('pt-BR')} • ${m.qtd} pacotes</span>
      </div>
      ${m.pacotes.slice(0,10).map(p=>{
        const cli = leads.find(l=> l.id===p.paciente_id || l.origemid===p.paciente_origemid);
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #fdf8f6">
          <div><b>${p.descricao||'Pacote'}</b><br><small style="color:#8a6a68">${cli?.nome||p.paciente_origemid?.slice(0,12)||''} • ${p.status} • ${p.forma_pagamento||''}</small></div>
          <span style="font-weight:800;color:#15803d">R$ ${Number(p.valor_total).toLocaleString('pt-BR')}</span>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
  
  // Gráfico financeiro mensal
  try{
    const ctx = document.getElementById('chartFinanceiro');
    if(ctx){
      if(chartFinanceiroInstance) chartFinanceiroInstance.destroy();
      const labels = mesesOrdenados.slice(0,6).reverse().map(k=>porMes[k].label);
      const valores = mesesOrdenados.slice(0,6).reverse().map(k=>porMes[k].total);
      chartFinanceiroInstance = new Chart(ctx,{
        type:'bar',
        data:{labels, datasets:[{label:'Faturamento', data:valores, backgroundColor:'#7c3aed', borderRadius:8}]},
        options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}
      });
    }
  }catch(e){ console.error('chart financeiro', e); }
}
