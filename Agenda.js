
// agenda.js - Agenda hoje com paginação 5 + relatório completo
let agendaHojeData = [];
let paginaAgendaHoje = 1;
const ITENS_POR_PAGINA = 5;

async function carregarAgendaHoje(){
  const div=document.getElementById('listaAgendaHoje'); 
  const countEl=document.getElementById('agendaHojeCount');
  if(!div) return;
  try{
    const hoje = new Date().toISOString().slice(0,10);
    let dataAg=null;
    try{ const r=await supabaseClient.from('agendamentos').select('*').eq('therapist_slug', THERAPIST_SLUG).gte('data_agendamento', hoje).order('data_agendamento').limit(100); dataAg=r.data; }catch(e){}
    if(!dataAg || dataAg.length===0){ try{ const r2=await supabaseClient.from('agendamentos').select('*').eq('terapeuta_slug', THERAPIST_SLUG).gte('data_agendamento', hoje).order('data_agendamento').limit(100); dataAg=r2.data; }catch(e){} }
    
    agendaHojeData = dataAg || [];
    if(countEl) countEl.innerText = agendaHojeData.length;
    document.getElementById('kpiAgendaHoje').innerText = agendaHojeData.length;
    
    if(agendaHojeData.length===0){ 
      div.innerHTML='<p style="text-align:center;opacity:.5;padding:12px">Nenhum agendamento hoje ✨</p>'; 
      document.getElementById('paginacaoAgendaHoje').innerHTML='';
      return; 
    }
    
    renderPaginaAgendaHoje();
  }catch(e){ div.innerHTML='<p style="color:#dc2626">Erro: '+e.message+'</p>'; }
}

function renderPaginaAgendaHoje(){
  const div=document.getElementById('listaAgendaHoje');
  const pagDiv=document.getElementById('paginacaoAgendaHoje');
  const totalPaginas = Math.ceil(agendaHojeData.length / ITENS_POR_PAGINA);
  if(paginaAgendaHoje > totalPaginas) paginaAgendaHoje = 1;
  
  const inicio = (paginaAgendaHoje-1)*ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const pagina = agendaHojeData.slice(inicio, fim);
  
  div.innerHTML = pagina.map(a=>{
    const p=leads.find(l=> l.id===a.paciente_id || l.origemid===a.paciente_origemid);
    const nomeCliente = p ? p.nome : (a.paciente_origemid||'').slice(0,12);
    const hora = new Date(a.data_agendamento).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const whatsapp = p?.whatsapp||'';
    return `<div class="agenda-item">
      <div style="flex:1">
        <b>${nomeCliente} • ${hora}</b><br>
        <small style="color:#8a6a68">${a.tipo||'sessão'} • ${a.status} ${a.observacoes? '• '+a.observacoes.slice(0,30):''}</small>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/\D/g,'')}" target="_blank" class="whatsapp-btn" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24"><path d="M19.05 4.91A9.91 9.91 0 0 0 12 0C5.46 0 .3 5.16.3 11.7a11.6 11.6 0 0 0 1.53 5.8L0 24l6.68-1.75A11.5 11.5 0 0 0 12 23.4c6.54 0 11.7-5.16 11.7-11.7 0-3.12-1.21-6.05-3.65-6.79ZM12 21.2a9.36 9.36 0 0 1-4.77-1.3l-.34-.2-3.96 1.04 1.06-3.86-.22-.4a9.31 9.31 0 0 1-1.44-5 9.3 9.3 0 0 1 9.3-9.3c2.48 0 4.8.97 6.55 2.73A9.2 9.2 0 0 1 21.3 11.7a9.32 9.32 0 0 1-9.3 9.5Zm5.32-6.96c-.29-.15-1.7-.84-1.96-.94-.27-.1-.46-.15-.65.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.3-.02-.46.13-.6.13-.13.29-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.36-.03-.5-.07-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49h-.56c-.2 0-.5.07-.77.36-.26.3-1 1-1 2.43 0 1.44 1.03 2.82 1.17 3.02.14.2 2.03 3.1 4.91 4.35.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z"/></svg></a>` : ''}
        <button onclick="abrirFicha('${a.paciente_origemid||a.paciente_id}')" style="padding:6px 10px;border-radius:10px;border:1.5px solid #f5e6cc;background:#fff;font-size:11px;cursor:pointer">Ficha</button>
      </div>
    </div>`;
  }).join('');
  
  // Paginação
  if(totalPaginas <= 1){
    pagDiv.innerHTML='';
    return;
  }
  let htmlPag = `<button class="pag-btn" ${paginaAgendaHoje===1?'disabled':''} onclick="mudarPaginaAgendaHoje(${paginaAgendaHoje-1})">‹</button>`;
  for(let i=1;i<=totalPaginas;i++){
    htmlPag += `<button class="pag-btn ${i===paginaAgendaHoje?'active':''}" onclick="mudarPaginaAgendaHoje(${i})">${i}</button>`;
  }
  htmlPag += `<button class="pag-btn" ${paginaAgendaHoje===totalPaginas?'disabled':''} onclick="mudarPaginaAgendaHoje(${paginaAgendaHoje+1})">›</button>`;
  pagDiv.innerHTML = htmlPag;
}

function mudarPaginaAgendaHoje(nova){
  const total = Math.ceil(agendaHojeData.length / ITENS_POR_PAGINA);
  if(nova < 1 || nova > total) return;
  paginaAgendaHoje = nova;
  renderPaginaAgendaHoje();
}

async function carregarAgenda(){
  const dataInput=document.getElementById('agendaData').value;
  const listaDiv=document.getElementById('listaAgenda');
  try{
    let query = supabaseClient.from('agendamentos').select('*').order('data_agendamento',{ascending:false}).limit(100);
    if(dataInput){
      query = query.gte('data_agendamento', dataInput).lte('data_agendamento', dataInput+'T23:59:59');
    }
    // tenta por therapist_slug e terapeuta_slug
    let {data, error} = await query.eq('therapist_slug', THERAPIST_SLUG);
    if(!data || data.length===0){
      const r2 = await supabaseClient.from('agendamentos').select('*').eq('terapeuta_slug', THERAPIST_SLUG).order('data_agendamento',{ascending:false}).limit(100);
      data = r2.data;
      if(dataInput){
        data = data.filter(a=> a.data_agendamento.slice(0,10) === dataInput);
      }
    }
    
    if(!data||data.length===0){ listaDiv.innerHTML='<p style="text-align:center;opacity:.5;padding:20px">Nenhum agendamento encontrado 📅<br><small>Selecione outra data ou crie um novo</small></p>'; return; }
    
    listaDiv.innerHTML = data.map(a=>{
      const cli = leads.find(l=> l.id===a.paciente_id || l.origemid===a.paciente_origemid);
      const nome = cli?.nome || a.paciente_origemid?.slice(0,12) || 'Cliente';
      const email = cli?.email || '';
      const whats = cli?.whatsapp || '';
      const dataFmt = new Date(a.data_agendamento).toLocaleString('pt-BR',{weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
      return `<div class="agenda-item" style="flex-direction:column;align-items:flex-start">
        <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
          <div><b style="font-size:14px">${nome}</b> • <small style="color:#8a6a68">${dataFmt}</small><br><small style="color:#8a6a68">${email} ${whats? '• '+whats:''}</small></div>
          <span style="background:${a.status==='confirmado'?'#dcfce7': a.status==='cancelado'?'#fef2f2':'#f5f3ff'};color:${a.status==='confirmado'?'#15803d': a.status==='cancelado'?'#dc2626':'#6d28d9'};padding:4px 10px;border-radius:20px;font-size:10px;font-weight:800">${a.status||'agendado'}</span>
        </div>
        <div style="width:100%;margin-top:8px;padding-top:8px;border-top:1px dashed #f5e6cc;font-size:12px">
          <b>Tipo:</b> ${a.tipo||'sessão'} ${a.observacoes? '<br><b>Obs:</b> '+a.observacoes:''}<br>
          <b>ID:</b> ${a.paciente_origemid?.slice(0,16)||a.paciente_id?.slice(0,8)||'-'}
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button onclick="abrirFicha('${a.paciente_origemid||a.paciente_id}')" style="padding:6px 12px;border-radius:10px;border:1.5px solid #f5e6cc;background:#fff;font-size:11px;font-weight:700;cursor:pointer">📄 Ficha</button>
          ${whats? `<a href="https://wa.me/${whats.replace(/\D/g,'')}" target="_blank" class="whatsapp-btn"><svg viewBox="0 0 24 24"><path d="M19.05 4.91A9.91 9.91 0 0 0 12 0C5.46 0 .3 5.16.3 11.7a11.6 11.6 0 0 0 1.53 5.8L0 24l6.68-1.75A11.5 11.5 0 0 0 12 23.4c6.54 0 11.7-5.16 11.7-11.7 0-3.12-1.21-6.05-3.65-6.79ZM12 21.2a9.36 9.36 0 0 1-4.77-1.3l-.34-.2-3.96 1.04 1.06-3.86-.22-.4a9.31 9.31 0 0 1-1.44-5 9.3 9.3 0 0 1 9.3-9.3c2.48 0 4.8.97 6.55 2.73A9.2 9.2 0 0 1 21.3 11.7a9.32 9.32 0 0 1-9.3 9.5Zm5.32-6.96c-.29-.15-1.7-.84-1.96-.94-.27-.1-.46-.15-.65.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.3-.02-.46.13-.6.13-.13.29-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.36-.03-.5-.07-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49h-.56c-.2 0-.5.07-.77.36-.26.3-1 1-1 2.43 0 1.44 1.03 2.82 1.17 3.02.14.2 2.03 3.1 4.91 4.35.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z"/></svg> WhatsApp</a>` : ''}
        </div>
      </div>`;
    }).join('');
  }catch(e){ listaDiv.innerHTML='<p style="color:#dc2626">Erro: '+e.message+'</p>'; }
}

async function criarAgendamento(){
  const clienteId=document.getElementById('agendaCliente').value;
  const data=document.getElementById('agendaDataHora').value;
  const obs=document.getElementById('agendaObs').value;
  if(!clienteId||!data){ alert('Selecione cliente e data'); return; }
  const cli=leads.find(l=> l.id===clienteId || l.origemid===clienteId);
  if(!cli){ alert('Cliente não encontrado'); return; }
  const {error} = await supabaseClient.from('agendamentos').insert([{therapist_slug:THERAPIST_SLUG, therapist_id:TERAPEUTA_DATA?.id, terapeuta_slug:THERAPIST_SLUG, paciente_id:cli.id, paciente_origemid:cli.origemid, data_agendamento:data, observacoes:obs, status:'confirmado', tipo:'sessao'}]);
  if(error){ alert(error.message); return; }
  alert('✅ Agendamento criado!');
  document.getElementById('agendaObs').value='';
  carregarAgenda(); carregarAgendaHoje();
}
