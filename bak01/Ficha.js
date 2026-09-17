
// ficha.js - Ficha do cliente V2 - pacotes com combo box 2,4,6 sessões

function atualizarPacotePreco(){
  const tipo = Number(document.getElementById('pacoteTipo')?.value || 4);
  const valorSessao = Number(document.getElementById('pacoteValorSessao')?.value || 150);
  const total = tipo * valorSessao;
  const totalEl = document.getElementById('pacoteValor');
  if(totalEl) totalEl.value = total;
  const descEl = document.getElementById('pacoteDesc');
  if(descEl && !descEl.value){
    descEl.value = `Pacote de ${tipo} sessões`;
  } else if(descEl){
    // atualiza número se já tinha pacote
    descEl.value = descEl.value.replace(/\d+\s*sessões/i, `${tipo} sessões`);
  }
}

async function abrirFicha(ident){
  let lead = leads.find(l=> l.id===ident || l.origemid===ident);
  if(!lead){ 
    try{
      const {data} = await supabaseClient.from('leads').select('*').or(`id.eq.${ident},origemid.eq.${ident}`).limit(1).single(); 
      lead=data; 
    }catch(e){}
  }
  if(!lead) return;
  pacienteAtual=lead;
  document.getElementById('fichaNome').innerText=lead.nome||'Sem nome';
  document.getElementById('fichaSub').innerText=(lead.email||'')+' • '+(lead.whatsapp||'');
  document.getElementById('fichaAvatar').innerText=(lead.nome||'M').charAt(0).toUpperCase();
  document.getElementById('fichaWhats').href='https://wa.me/'+(lead.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent('Oi '+ (lead.nome||'')+'! Aqui é a Mariland 💜');
  
  let htmlDados = `<b>Nome:</b> ${lead.nome}<br><b>Email:</b> ${lead.email||'-'}<br><b>WhatsApp:</b> ${lead.whatsapp||'-'}<br><b>Idade:</b> ${lead.idade||'-'} • <b>Profissão:</b> ${lead.profissao||'-'}<br><b>Status:</b> ${lead.status||'novo'}<br><b>Data:</b> ${new Date(lead.data).toLocaleString('pt-BR')}`;
  if(lead.problemas){ htmlDados += `<br><br><b style="color:#dc2626">Problema emocional:</b><br><span style="background:#fef2f2;padding:10px;border-radius:10px;display:block;margin-top:6px;font-size:13px;line-height:1.5">${lead.problemas}</span>`; }
  if(lead.infancia){ htmlDados += `<br><br><b>Infância:</b><br><span style="background:#fffbeb;padding:10px;border-radius:10px;display:block;margin-top:6px;font-size:12px;line-height:1.5">${lead.infancia.slice(0,600)}${lead.infancia.length>600?'...':''}</span>`; }
  if(lead.adolescencia){ htmlDados += `<br><br><b>Adolescência:</b><br><span style="background:#f5f3ff;padding:10px;border-radius:10px;display:block;margin-top:6px;font-size:12px;line-height:1.5">${lead.adolescencia.slice(0,600)}${lead.adolescencia.length>600?'...':''}</span>`; }
  if(lead.vida_adulta){ htmlDados += `<br><br><b>Vida adulta:</b><br><span style="background:#f0fdf4;padding:10px;border-radius:10px;display:block;margin-top:6px;font-size:12px;line-height:1.5">${lead.vida_adulta.slice(0,600)}${lead.vida_adulta.length>600?'...':''}</span>`; }
  document.getElementById('fichaDados').innerHTML=htmlDados;
  
  document.getElementById('fichaTopTravas').innerHTML=(lead.resultadostravas||[]).slice(0,3).map((t,i)=>`<div style="display:flex;justify-content:space-between;padding:10px 12px;background:#fff;border:1.5px solid #f5e6cc;border-radius:12px;font-size:11px;margin-top:8px"><span style="font-weight:600">${i+1}. ${t.nome}</span><b style="color:#6d28d9">${t.score?.toFixed(1)}/10</b></div>`).join('');
  document.getElementById('fichaModal').classList.add('show');
  atualizarPacotePreco();
  await carregarAnamneses(); await carregarAgendamentosFicha(); await carregarPacotesFicha();
}
function fecharFicha(){ document.getElementById('fichaModal').classList.remove('show'); pacienteAtual=null; }
function switchFichaTab(tab){ document.querySelectorAll('[id^="ftab-"]').forEach(d=> d.style.display='none'); const t=document.getElementById('ftab-'+tab); if(t) t.style.display='block'; document.querySelectorAll('.tab-btn').forEach(b=> b.classList.remove('active')); const btn=document.querySelector("[onclick=\"switchFichaTab('"+tab+"')\"]"); if(btn) btn.classList.add('active'); }

async function carregarAnamneses(){
  if(!pacienteAtual) return;
  try{
    let {data} = await supabaseClient.from('anamneses').select('*').or(`client_id.eq.${pacienteAtual.origemid},paciente_id.eq.${pacienteAtual.id}`).order('created_at',{ascending:false});
    if(!data || data.length===0){
      const r2 = await supabaseClient.from('anamneses').select('*').or(`paciente_origemid.eq.${pacienteAtual.origemid},cliente_id.eq.${pacienteAtual.id}`).order('created_at',{ascending:false});
      data = r2.data;
    }
    const div=document.getElementById('listaAnamneses');
    if(!data||data.length===0){ div.innerHTML='<p style="opacity:.5;text-align:center;padding:12px">Nenhuma anamnese registrada ainda<br><small>Clique em + Nova anamnese</small></p>'; return; }
    div.innerHTML=data.map(a=>`<div style="background:#fff;border:1.5px solid #f5e6cc;border-radius:12px;padding:14px;margin-top:10px">
      <div style="display:flex;justify-content:space-between"><b>${a.estado_problema||'Anamnese'}</b><small style="color:#8a6a68">${new Date(a.created_at).toLocaleString('pt-BR')}</small></div>
      ${a.comprometimento? `<div style="margin-top:6px"><small>Comprometimento: ${a.comprometimento}/10</small></div>`:''}
      ${a.observacoes? `<p style="margin-top:8px;font-size:12px;line-height:1.5;background:#fdf8f6;padding:8px;border-radius:8px">${a.observacoes}</p>`:''}
      ${a.plano_terapeutico? `<p style="margin-top:6px;font-size:12px"><b>Plano:</b> ${a.plano_terapeutico}</p>`:''}
    </div>`).join('');
  }catch(e){ document.getElementById('listaAnamneses').innerHTML='<p style="color:#dc2626">Erro: '+e.message+'</p>'; }
}

async function criarAnamnese(){ 
  const estado=prompt('Estado do problema / queixa principal?'); 
  if(!estado) return; 
  const obs=prompt('Observações / histórico (opcional):') || '';
  try{
    const {error} = await supabaseClient.from('anamneses').insert([{client_id:pacienteAtual.origemid, paciente_id:pacienteAtual.id, paciente_origemid:pacienteAtual.origemid, terapeuta_slug:THERAPIST_SLUG, therapist_slug:THERAPIST_SLUG, estado_problema:estado, observacoes:obs, comprometimento:5}]); 
    if(error) throw error;
    alert('✅ Anamnese salva!');
    carregarAnamneses(); 
  }catch(e){ alert('Erro: '+e.message); }
}

async function carregarAgendamentosFicha(){ 
  if(!pacienteAtual) return; 
  try{
    const {data}=await supabaseClient.from('agendamentos').select('*').or(`paciente_id.eq.${pacienteAtual.id},paciente_origemid.eq.${pacienteAtual.origemid}`).order('data_agendamento',{ascending:false}); 
    const div=document.getElementById('listaAgendamentosFicha'); 
    if(!data||data.length===0){ div.innerHTML='<p style="opacity:.5;text-align:center;padding:12px">Nenhum agendamento para este cliente</p>'; return; } 
    div.innerHTML=data.map(a=>`<div style="background:#fff;border:1.5px solid #f5e6cc;border-radius:12px;padding:12px;margin-top:8px"><div style="display:flex;justify-content:space-between"><b>${new Date(a.data_agendamento).toLocaleString('pt-BR')}</b><span style="background:${a.status==='confirmado'?'#dcfce7':'#f5f3ff'};padding:4px 8px;border-radius:20px;font-size:10px;font-weight:800">${a.status}</span></div><small style="color:#8a6a68">${a.tipo||'sessão'} ${a.observacoes? '• '+a.observacoes:''}</small></div>`).join(''); 
  }catch(e){}
}

async function criarAgendamentoFicha(){ 
  if(!pacienteAtual) return; 
  const data=document.getElementById('fichaAgData').value; 
  if(!data) return alert('Selecione data'); 
  try{
    await supabaseClient.from('agendamentos').insert([{therapist_slug:THERAPIST_SLUG, terapeuta_slug:THERAPIST_SLUG, therapist_id:TERAPEUTA_DATA?.id, paciente_id:pacienteAtual.id, paciente_origemid:pacienteAtual.origemid, data_agendamento:data, tipo:'sessao', status:'confirmado'}]); 
    alert('✅ Agendado!');
    carregarAgendamentosFicha(); carregarAgenda(); carregarAgendaHoje();
  }catch(e){ alert('Erro: '+e.message); }
}

async function carregarPacotesFicha(){ 
  if(!pacienteAtual) return; 
  try{
    const {data}=await supabaseClient.from('pacotes_financeiro').select('*').or(`paciente_id.eq.${pacienteAtual.id},paciente_origemid.eq.${pacienteAtual.origemid}`).order('created_at',{ascending:false}); 
    const div=document.getElementById('listaPacotesFicha'); 
    if(!data||data.length===0){ div.innerHTML='<p style="opacity:.5;text-align:center;padding:12px">Nenhum pacote para este cliente</p>'; return; } 
    div.innerHTML=data.map(p=>`<div style="background:#fff;border:1.5px solid #f5e6cc;border-radius:12px;padding:12px;margin-top:8px"><div style="display:flex;justify-content:space-between"><b>${p.descricao}</b><span style="font-weight:900;color:#15803d">R$ ${Number(p.valor_total).toLocaleString('pt-BR')}</span></div><small style="color:#8a6a68">${p.sessoes_usadas||0}/${p.sessoes_total||'?'} sessões • ${p.status} • ${p.forma_pagamento||''}</small></div>`).join(''); 
  }catch(e){}
}

async function criarPacote(){ 
  if(!pacienteAtual) return; 
  const tipo = Number(document.getElementById('pacoteTipo')?.value || 4);
  const valorSessao = Number(document.getElementById('pacoteValorSessao')?.value || 150);
  const total = Number(document.getElementById('pacoteValor')?.value || tipo*valorSessao);
  const desc=document.getElementById('pacoteDesc').value.trim() || `Pacote de ${tipo} sessões`;
  const pag=document.getElementById('pacotePagamento')?.value || 'pix';
  
  if(!total) return alert('Preencha valor'); 
  try{
    const {error} = await supabaseClient.from('pacotes_financeiro').insert([{therapist_slug:THERAPIST_SLUG, terapeuta_slug:THERAPIST_SLUG, therapist_id:TERAPEUTA_DATA?.id, paciente_id:pacienteAtual.id, paciente_origemid:pacienteAtual.origemid, descricao:desc, valor_total:total, valor_sessao:valorSessao, sessoes_total:tipo, sessoes_usadas:0, status:'ativo', forma_pagamento:pag}]); 
    if(error) throw error;
    alert(`✅ Pacote de ${tipo} sessões - R$ ${total} registrado!`);
    document.getElementById('pacoteDesc').value=''; 
    carregarPacotesFicha(); renderFinanceiro(); 
  }catch(e){ alert('Erro: '+e.message); }
}

async function salvarProntuarioSessao(){ 
  if(!pacienteAtual) return; 
  const texto=document.getElementById('prontuarioTexto').value; 
  if(!texto) return alert('Digite algo'); 
  try{
    const atual=pacienteAtual.prontuario||''; 
    const novo=atual+'\n\n['+new Date().toLocaleString('pt-BR')+'] '+texto; 
    const {error} = await supabaseClient.from('leads').update({prontuario:novo}).eq('origemid', pacienteAtual.origemid); 
    if(error) throw error;
    pacienteAtual.prontuario=novo; 
    document.getElementById('prontuarioTexto').value=''; 
    alert('✅ Prontuário salvo!'); 
  }catch(e){ alert('Erro: '+e.message); }
}

function nav(tab){
  document.querySelectorAll('[id^="view-"]').forEach(d=> d.style.display='none');
  const t=document.getElementById('view-'+tab); if(t) t.style.display='block';
  document.querySelectorAll('.dock-btn').forEach(b=> b.classList.remove('active'));
  document.querySelectorAll('[data-tab="'+tab+'"]').forEach(b=> b.classList.add('active'));
  if(tab==='financeiro') renderFinanceiro();
  if(tab==='agenda') carregarAgenda();
}

document.addEventListener('DOMContentLoaded', ()=>{
  atualizarPacotePreco();
});
