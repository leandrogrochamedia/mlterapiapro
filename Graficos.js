
// graficos.js - Charts
function renderGraficos(){
  try{
    const mapa={}; leads.forEach(l=>{ (l.resultadostravas||[]).forEach(t=>{ if(!mapa[t.nome]) mapa[t.nome]=[]; mapa[t.nome].push(t.score); }); });
    const labels=Object.keys(mapa); const medias=labels.map(k=> mapa[k].reduce((a,b)=>a+b,0)/mapa[k].length);
    const ctx1=document.getElementById('chartTravas'); if(charts.travas) charts.travas.destroy(); if(labels.length&&ctx1) charts.travas=new Chart(ctx1,{type:'bar',data:{labels:labels.map(l=>l.replace('TRAVA DA ','')),datasets:[{data:medias,backgroundColor:medias.map(m=> m<4?'#c4b5fd': m<7?'#f9a8d4':'#fca5a5'),borderRadius:8}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{min:0,max:10}}}}});
    const porDia={}; leads.forEach(l=>{ const d=(l.data||'').slice(0,10); porDia[d]=(porDia[d]||0)+1; }); const dias=Object.keys(porDia).sort().slice(-14);
    const ctx2=document.getElementById('chartEvolucao'); if(charts.evo) charts.evo.destroy(); if(ctx2) charts.evo=new Chart(ctx2,{type:'line',data:{labels:dias.map(d=>d.slice(5)),datasets:[{data:dias.map(d=>porDia[d]),borderColor:'#7c3aed',backgroundColor:'rgba(124,58,237,0.1)',tension:0.4,fill:true}]},options:{plugins:{legend:{display:false}}}}});
    const statusCount={}; leads.forEach(l=>{ const s=l.status||'novo'; statusCount[s]=(statusCount[s]||0)+1; });
    const ctx3=document.getElementById('chartStatus'); if(charts.status) charts.status.destroy(); if(ctx3) charts.status=new Chart(ctx3,{type:'doughnut',data:{labels:Object.keys(statusCount),datasets:[{data:Object.values(statusCount),backgroundColor:['#c4b5fd','#f9a8d4','#fde68a','#a7f3d0','#e5e7eb']}]},options:{plugins:{legend:{position:'bottom'}}}});
  }catch(e){ console.error('graficos', e); }
}
function renderGraficos2(){
  try{
    const porDia={}; leads.forEach(l=>{ const d=(l.data||'').slice(0,10); porDia[d]=(porDia[d]||0)+1; }); const dias=Object.keys(porDia).sort().slice(-14);
    const ctx2=document.getElementById('chartEvolucao2'); if(charts.evo2) charts.evo2.destroy(); if(ctx2) charts.evo2=new Chart(ctx2,{type:'line',data:{labels:dias.map(d=>d.slice(5)),datasets:[{data:dias.map(d=>porDia[d]),borderColor:'#7c3aed',backgroundColor:'rgba(124,58,237,0.1)',tension:0.4,fill:true}]},options:{plugins:{legend:{display:false}}}}});
    const mapa={}; leads.forEach(l=>{ (l.resultadostravas||[]).forEach(t=>{ if(!mapa[t.nome]) mapa[t.nome]=[]; mapa[t.nome].push(t.score); }); }); const labels=Object.keys(mapa); const medias=labels.map(k=> mapa[k].reduce((a,b)=>a+b,0)/mapa[k].length);
    const ctx1=document.getElementById('chartTravas2'); if(charts.travas2) charts.travas2.destroy(); if(labels.length&&ctx1) charts.travas2=new Chart(ctx1,{type:'bar',data:{labels:labels.map(l=>l.replace('TRAVA DA ','')),datasets:[{data:medias,backgroundColor:medias.map(m=> m<4?'#c4b5fd': m<7?'#f9a8d4':'#fca5a5'),borderRadius:8}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{min:0,max:10}}}}});
    const statusCount={}; leads.forEach(l=>{ const s=l.status||'novo'; statusCount[s]=(statusCount[s]||0)+1; }); const ctx3=document.getElementById('chartStatus2'); if(charts.status2) charts.status2.destroy(); if(ctx3) charts.status2=new Chart(ctx3,{type:'doughnut',data:{labels:Object.keys(statusCount),datasets:[{data:Object.values(statusCount),backgroundColor:['#c4b5fd','#f9a8d4','#fde68a','#a7f3d0','#e5e7eb']}]},options:{plugins:{legend:{position:'bottom'}}}});
  }catch(e){}
}
