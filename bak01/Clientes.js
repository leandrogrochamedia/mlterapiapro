
// clientes.js - Gestão de clientes V2 - Sem limite, clique no nome abre ficha
let paginaAgendaHoje = 1;
const ITENS_POR_PAGINA_AGENDA = 5;

async function carregarDados(){
  showLoading(true, 'Buscando clientes...');
  try{
    let allLeads = [];
    try{
      const {data} = await supabaseClient.from('leads').select('*').eq('terapeuta_slug', THERAPIST_SLUG).order('data',{ascending:false}).limit(500);
      if(data && data.length>0) allLeads = data;
    }catch(e){}
    if(allLeads.length===0){
      try{
        const {data} = await supabaseClient.from('leads').select('*').eq('therapist_slug', THERAPIST_SLUG).order('data',{ascending:false}).limit(500);
        if(data) allLeads = data;
      }catch(e){}
    }
    leads = allLeads.filter(l=> l.arquivado!==true);
    document.getElementById('dataHoje').innerText = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})+' • '+leads.length+' clientes';
    document.getElementById('kpiTotal').innerText = leads.length;
    document.getElementById('countClientes').innerText = leads.length+' clientes';
    const hoje = new Date().toISOString().slice(0,10);
    document.getElementById('kpiNovos').innerText = leads.filter(l=> (l.data||'').slice(0,10)===hoje).length;

    renderAtencao(); renderClientes(); await carregarAgendaHoje(); await renderFinanceiro(); preencherSelectClientes();
    showLoading(false);
    setTimeout(()=>{ renderGraficoEvolucao(); }, 600);
  }catch(e){ console.error(e); showLoading(false); }
}

function renderAtencao(){
  const div=document.getElementById('listaAtencao'); if(!div) return;
  const at=leads.filter(l=> (l.status||'novo')==='novo' || l.status==='novo_questionario').slice(0,5);
  if(at.length===0){ div.innerHTML='<p style="text-align:center;opacity:.5;padding:12px">Nada urgente ✨</p>'; return; }
  div.innerHTML=at.map(l=>`
    <div class="agenda-item" onclick="abrirFicha('${l.origemid||l.id}')">
      <div>
        <b class="cliente-nome">${l.nome}</b><br>
        <small style="color:#8a6a68">${l.email||''} • ${l.prioridade||'média'}</small>
      </div>
      <a href="https://wa.me/${(l.whatsapp||'').replace(/\D/g,'')}" target="_blank" onclick="event.stopPropagation()" class="whatsapp-btn">
        <svg viewBox="0 0 24 24"><path d="M19.05 4.91A9.91 9.91 0 0 0 12 0C5.46 0 .3 5.16.3 11.7a11.6 11.6 0 0 0 1.53 5.8L0 24l6.68-1.75A11.5 11.5 0 0 0 12 23.4c6.54 0 11.7-5.16 11.7-11.7 0-3.12-1.21-6.05-3.65-6.79ZM12 21.2a9.36 9.36 0 0 1-4.77-1.3l-.34-.2-3.96 1.04 1.06-3.86-.22-.4a9.31 9.31 0 0 1-1.44-5 9.3 9.3 0 0 1 9.3-9.3c2.48 0 4.8.97 6.55 2.73A9.2 9.2 0 0 1 21.3 11.7a9.32 9.32 0 0 1-9.3 9.5Zm5.32-6.96c-.29-.15-1.7-.84-1.96-.94-.27-.1-.46-.15-.65.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.3-.02-.46.13-.6.13-.13.29-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.36-.03-.5-.07-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49h-.56c-.2 0-.5.07-.77.36-.26.3-1 1-1 2.43 0 1.44 1.03 2.82 1.17 3.02.14.2 2.03 3.1 4.91 4.35.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z"/></svg>
        WhatsApp
      </a>
    </div>`).join('');
}

function renderClientes(){
  const tbody=document.getElementById('tbodyClientes'); if(!tbody) return;
  const busca=(document.getElementById('buscaInput')?.value||'').toLowerCase();
  const filtered=leads.filter(l=> !busca || (l.nome||'').toLowerCase().includes(busca) || (l.email||'').toLowerCase().includes(busca) || (l.whatsapp||'').toLowerCase().includes(busca));
  if(filtered.length===0){ tbody.innerHTML='<tr><td colspan="5" style="text-align:center;opacity:.5;padding:20px">Nenhum cliente encontrado</td></tr>'; return; }
  tbody.innerHTML = filtered.map(l=>{
    const top=(l.resultadostravas||[]).length ? [...l.resultadostravas].sort((a,b)=>b.score-a.score)[0] : null;
    return `<tr style="border-bottom:1px solid #f5e6cc">
      <td style="padding:12px"><span class="cliente-nome" onclick="abrirFicha('${l.origemid||l.id}')">${l.nome||''}</span><br><small style="color:#8a6a68">${l.email||''}</small></td>
      <td style="padding:12px"><a href="https://wa.me/${(l.whatsapp||'').replace(/\D/g,'')}" target="_blank" class="whatsapp-btn"><svg viewBox="0 0 24 24"><path d="M19.05 4.91A9.91 9.91 0 0 0 12 0C5.46 0 .3 5.16.3 11.7a11.6 11.6 0 0 0 1.53 5.8L0 24l6.68-1.75A11.5 11.5 0 0 0 12 23.4c6.54 0 11.7-5.16 11.7-11.7 0-3.12-1.21-6.05-3.65-6.79ZM12 21.2a9.36 9.36 0 0 1-4.77-1.3l-.34-.2-3.96 1.04 1.06-3.86-.22-.4a9.31 9.31 0 0 1-1.44-5 9.3 9.3 0 0 1 9.3-9.3c2.48 0 4.8.97 6.55 2.73A9.2 9.2 0 0 1 21.3 11.7a9.32 9.32 0 0 1-9.3 9.5Zm5.32-6.96c-.29-.15-1.7-.84-1.96-.94-.27-.1-.46-.15-.65.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.3-.02-.46.13-.6.13-.13.29-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.36-.03-.5-.07-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49h-.56c-.2 0-.5.07-.77.36-.26.3-1 1-1 2.43 0 1.44 1.03 2.82 1.17 3.02.14.2 2.03 3.1 4.91 4.35.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z"/></svg> ${l.whatsapp||''}</a></td>
      <td style="padding:12px;font-size:12px">${new Date(l.data).toLocaleDateString('pt-BR')}</td>
      <td style="padding:12px"><small style="color:#6d28d9;font-weight:700">${top? top.nome.replace('TRAVA DA ','').slice(0,22) : '-'}</small></td>
      <td style="padding:12px"><button onclick="abrirFicha('${l.origemid||l.id}')" style="font-size:11px;padding:8px 12px;border-radius:8px;border:1.5px solid #f5e6cc;background:#fff;cursor:pointer;font-weight:700">Ficha</button></td>
    </tr>`;
  }).join('');
}
function filtrarClientes(){ renderClientes(); }
function preencherSelectClientes(){ const sel=document.getElementById('agendaCliente'); if(!sel) return; sel.innerHTML='<option value="">Selecione cliente...</option>'+leads.map(l=>`<option value="${l.origemid||l.id}">${l.nome} • ${l.email||''}</option>`).join(''); }

function renderGraficoEvolucao(){
  try{
    const porDia={}; leads.forEach(l=>{ const d=(l.data||'').slice(0,10); porDia[d]=(porDia[d]||0)+1; }); 
    const dias=Object.keys(porDia).sort().slice(-14);
    const ctx=document.getElementById('chartEvolucao'); if(!ctx) return;
    if(window.chartEvo) window.chartEvo.destroy();
    window.chartEvo=new Chart(ctx,{type:'line',data:{labels:dias.map(d=>d.slice(5)),datasets:[{label:'Novos clientes',data:dias.map(d=>porDia[d]), borderColor:'#7c3aed', backgroundColor:'rgba(124,58,237,0.1)', tension:0.4, fill:true}]}, options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}});
  }catch(e){ console.error(e); }
}
