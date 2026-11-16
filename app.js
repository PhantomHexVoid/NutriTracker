const $=id=>document.getElementById(id);
const defaults={calories:2000,protein:130,carbs:220,fat:70};
function readStored(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value&&typeof value==='object'?value:fallback}catch(e){return fallback}}
let goals={...defaults,...readStored('nt-goals',{})};
let data=readStored('nt-days',{});
let selectedDate=isoDate(new Date()), pendingFood=null, editingFoodId=null, foodValuesPer100=false;
const meals=['Petit-déjeuner','Déjeuner','Dîner','Collation'];
function isoDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function day(){if(!data[selectedDate])data[selectedDate]=[];return data[selectedDate]}
function save(){localStorage.setItem('nt-days',JSON.stringify(data))}
function fmt(n){return Math.round(n*10)/10}
function prettyDate(s){return new Date(s+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function totals(items){return items.reduce((a,x)=>{for(const k of ['calories','protein','carbs','fat'])a[k]+=Number(x[k]||0);return a},{calories:0,protein:0,carbs:0,fat:0})}
function render(){
  const items=day(), t=totals(items), pct=Math.min(100,t.calories/goals.calories*100);
  $('dateLabel').textContent=prettyDate(selectedDate);
  $('caloriesNow').textContent=Math.round(t.calories).toLocaleString('fr-FR');$('calorieGoal').textContent=goals.calories.toLocaleString('fr-FR');
  $('caloriePercent').textContent=Math.round(pct)+' %';$('calorieBar').style.width=pct+'%';
  $('calorieRemaining').textContent=t.calories<=goals.calories?`${Math.round(goals.calories-t.calories)} kcal restantes`:`${Math.round(t.calories-goals.calories)} kcal au-dessus de l'objectif`;
  for(const k of ['protein','carbs','fat']){$(k+'Now').textContent=fmt(t[k])+' g';$(k+'Bar').style.width=Math.min(100,t[k]/goals[k]*100)+'%';$(k+'Meta').textContent=`Objectif : ${goals[k]} g`}
  $('mealList').innerHTML=meals.map(m=>{const group=items.filter(x=>x.meal===m),sum=totals(group);return `<section class="meal-group"><div class="meal-title"><span>${m}</span><small>${Math.round(sum.calories)} kcal</small></div>${group.length?group.map(x=>`<div class="food-row editable-food" data-edit-id="${x.id}" role="button" tabindex="0" aria-label="Modifier ${esc(x.name)}"><div><strong>${esc(x.name)}</strong><small>${x.qty} g · P ${fmt(x.protein)} g · G ${fmt(x.carbs)} g · L ${fmt(x.fat)} g</small></div><div class="food-kcal">${Math.round(x.calories)} kcal <button class="remove-food" data-id="${x.id}" aria-label="Supprimer">×</button></div></div>`).join(''):'<div class="empty">Aucun aliment ajouté</div>'}</section>`}).join('');
  document.querySelectorAll('.remove-food').forEach(b=>b.onclick=e=>{e.stopPropagation();data[selectedDate]=day().filter(x=>x.id!==b.dataset.id);save();render()});
  document.querySelectorAll('.editable-food').forEach(row=>{
    const edit=()=>editFood(row.dataset.editId);
    row.onclick=e=>{if(!e.target.closest('.remove-food'))edit()};
    row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();edit()}};
  });
  renderHistory();
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderHistory(){
  const dates=Object.keys(data).filter(d=>data[d]?.length).sort().reverse().slice(0,7);
  $('historyPanel').innerHTML=dates.length?dates.map(d=>{let c=totals(data[d]).calories;return `<div class="history-row"><span>${new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}</span><div class="history-track"><i style="width:${Math.min(100,c/goals.calories*100)}%"></i></div><b>${Math.round(c)} kcal</b></div>`}).join(''):'<div class="empty">Ton historique apparaîtra ici dès tes premiers repas.</div>';
  $('fullHistory').innerHTML=dates.length?dates.map(d=>{let t=totals(data[d]);return `<div class="history-entry">${prettyDate(d)}<b>${Math.round(t.calories)} kcal</b><div class="hint">Protéines ${fmt(t.protein)} g · Glucides ${fmt(t.carbs)} g · Lipides ${fmt(t.fat)} g</div></div>`}).join(''):'<p class="hint">Aucune journée enregistrée pour le moment.</p>';
}
function openFood(){pendingFood=null;editingFoodId=null;foodValuesPer100=true;setFoodFormMode();activeFoodSource='generic';document.querySelectorAll('.source-tab').forEach(b=>b.classList.toggle('active',b.dataset.source==='generic'));$('foodName').value='';$('foodQty').value=100;$('foodKcal').value='';$('foodProtein').value='';$('foodCarbs').value='';$('foodFat').value='';$('foodSearch').value='';$('searchResults').innerHTML='';$('searchStatus').textContent='Recherche dans la base Ciqual 2025 (aliments génériques).';document.querySelector('[data-tab="search"]').click();$('foodDialog').showModal()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));$('searchPane').hidden=b.dataset.tab!=='search';$('manualPane').hidden=b.dataset.tab!=='manual'});
$('addBtn').onclick=openFood;
let activeFoodSource='generic';
let ciqualFoods=[];
let ciqualReady=false;
fetch('./ciqual-2025.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(rows=>{
  ciqualFoods=rows;ciqualReady=true;
  if($('searchStatus')) $('searchStatus').textContent='Base Ciqual 2025 chargée · 3 484 aliments disponibles hors connexion après le premier chargement.';
}).catch(()=>{
  if($('searchStatus')) $('searchStatus').textContent='Base Ciqual indisponible. Recharge l’application avec une connexion Internet.';
});
// Normalize accents, punctuation and plurals for forgiving local search.
function normFood(s){return String(s||'').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function setFoodFormMode(){
  const suffix=foodValuesPer100?' / 100 g':' (portion)';
  $('foodKcal').parentElement.firstChild.textContent='Calories'+suffix;
  $('foodProtein').parentElement.firstChild.textContent='Prot.'+suffix;
  $('foodCarbs').parentElement.firstChild.textContent='Gluc.'+suffix;
  $('foodFat').parentElement.firstChild.textContent='Lip.'+suffix;
  const hint=$('foodManualHint');
  if(hint)hint.textContent='Renseigne les valeurs nutritionnelles pour 100 g, puis indique la quantité que tu as mangée. Le total sera calculé automatiquement.';
  $('saveFood').textContent=editingFoodId?'Enregistrer les modifications':'Ajouter au journal';
}
function editFood(id){
  const item=day().find(x=>x.id===id);if(!item)return;
  editingFoodId=id;foodValuesPer100=true;pendingFood=null;setFoodFormMode();
  const divisor=item.qty/100||1;
  $('foodName').value=item.name;$('foodQty').value=item.qty;
  $('foodKcal').value=fmt(item.calories/divisor);$('foodProtein').value=fmt(item.protein/divisor);
  $('foodCarbs').value=fmt(item.carbs/divisor);$('foodFat').value=fmt(item.fat/divisor);
  $('mealType').value=item.meal;
  $('searchResults').innerHTML='';$('searchStatus').textContent='Modifie les informations puis enregistre.';
  document.querySelector('[data-tab="manual"]').click();$('foodDialog').showModal();
}
function chooseFood(item){
  pendingFood={name:item.name,qty:100,kcal:Number(item.kcal)||0,protein:Number(item.protein)||0,carbs:Number(item.carbs)||0,fat:Number(item.fat)||0};
  foodValuesPer100=true;setFoodFormMode();document.querySelector('[data-tab="manual"]').click();
  $('foodName').value=item.name;$('foodQty').value=100;$('foodKcal').value=pendingFood.kcal;
  $('foodProtein').value=pendingFood.protein;$('foodCarbs').value=pendingFood.carbs;$('foodFat').value=pendingFood.fat;
  $('searchStatus').textContent='Aliment sélectionné. Vérifie la quantité et les valeurs avant ajout.';
}
document.querySelectorAll('.source-tab').forEach(btn=>btn.onclick=()=>{
  activeFoodSource=btn.dataset.source;
  document.querySelectorAll('.source-tab').forEach(b=>b.classList.toggle('active',b===btn));
  $('searchStatus').textContent=activeFoodSource==='generic'?'Recherche dans les 3 484 aliments Ciqual 2025. Valeurs pour 100 g.':'Recherche de produits emballés dans Open Food Facts.';
  $('searchResults').innerHTML='';
});
$('searchFoods').onclick=async()=>{
 const q=$('foodSearch').value.trim(); if(!q){$('searchStatus').textContent='Saisis un aliment à rechercher.';return}
 $('searchStatus').textContent='Recherche en cours…';$('searchResults').innerHTML='';
 if(activeFoodSource==='generic'){
   const nq=normFood(q);
   const terms=nq.split(' ').filter(Boolean);
   if(!ciqualReady){$('searchStatus').textContent='Chargement de la base alimentaire… Réessaie dans un instant.';return}
   const results=ciqualFoods.map(f=>{
     const n=normFood(f.name), tokens=n.split(' ');
     let score=0, direct=0;
     for(const t of terms){
       // Treat singular/plural as equivalent (lentille/lentilles, haricot/haricots).
       const stem=t.endsWith('s')?t.slice(0,-1):t;
       const matching=tokens.filter(w=>w===t||w===stem||w.startsWith(stem)||stem.startsWith(w));
       if(matching.length){
         score+=matching.length*8;
         if(tokens[0]===t||tokens[0]===stem||tokens[0].startsWith(stem)) {score+=30;direct++;}
       } else if(n.includes(t)) score+=1;
     }
     if(terms.length>1 && terms.every(t=>{
       const stem=t.endsWith('s')?t.slice(0,-1):t;
       return tokens.some(w=>w===t||w===stem||w.startsWith(stem)||stem.startsWith(w));
     })) score+=12;
     // Prefer raw/basic ingredients over prepared dishes when the query names the ingredient.
     if(direct>0 && /fruits, legumes|legumineuses/.test(normFood(f.group))) score+=12;
     if(direct>0 && /preemballe|soupe|salade|galette|saucisse|plat/.test(n)) score-=18;
     return {f,score,direct};
   }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.f.name.localeCompare(b.f.name,'fr')).slice(0,30).map(x=>x.f);
   $('searchStatus').textContent=results.length?`${results.length} aliments trouvés · valeurs pour 100 g`:'Aucun résultat. Essaie un terme plus court ou passe en Produits de marque.';
   $('searchResults').innerHTML=results.map((f,i)=>`<button type="button" class="result-item" data-generic="${i}"><strong>${esc(f.name)}</strong><small>Pour 100 g : ${Math.round(f.kcal)} kcal · P ${fmt(f.protein)} g · G ${fmt(f.carbs)} g · L ${fmt(f.fat)} g</small></button>`).join('');
   document.querySelectorAll('[data-generic]').forEach(b=>b.onclick=()=>chooseFood(results[Number(b.dataset.generic)]));
   return;
 }
 try{
   const url='https://world.openfoodfacts.org/cgi/search.pl?search_terms='+encodeURIComponent(q)+'&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,nutriments,quantity,countries_tags';
   const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);
   const j=await r.json();
   const products=(j.products||[]).filter(p=>p.product_name&&p.nutriments&&p.nutriments['energy-kcal_100g']!==undefined)
    .sort((a,b)=>((b.countries_tags||[]).includes('en:france')?1:0)-((a.countries_tags||[]).includes('en:france')?1:0));
   $('searchStatus').textContent=products.length?`${products.length} produits trouvés · vérifie l'étiquette`:'Aucun produit trouvé. Essaie une autre recherche.';
   $('searchResults').innerHTML=products.map((p,i)=>`<button type="button" class="result-item" data-brand="${i}"><strong>${esc(p.product_name)} ${p.brands?'· '+esc(p.brands):''}</strong><small>Pour 100 g : ${Math.round(p.nutriments['energy-kcal_100g']||0)} kcal · P ${fmt(p.nutriments.proteins_100g||0)} g · G ${fmt(p.nutriments.carbohydrates_100g||0)} g · L ${fmt(p.nutriments.fat_100g||0)} g</small></button>`).join('');
   document.querySelectorAll('[data-brand]').forEach(b=>b.onclick=()=>{const p=products[Number(b.dataset.brand)],n=p.nutriments;chooseFood({name:p.product_name,kcal:n['energy-kcal_100g']||0,protein:n.proteins_100g||0,carbs:n.carbohydrates_100g||0,fat:n.fat_100g||0})});
 }catch(e){$('searchStatus').textContent='Recherche impossible. Vérifie ta connexion ou utilise les aliments courants.'}
};
const closeFoodDialog=$('closeFoodDialog');
if(closeFoodDialog) closeFoodDialog.onclick=()=>{$('foodDialog').close()};
$('saveFood').onclick=()=>{
  let name=$('foodName').value.trim(),qty=Number($('foodQty').value),kcal=Number($('foodKcal').value),p=Number($('foodProtein').value),c=Number($('foodCarbs').value),f=Number($('foodFat').value);
  if(!name||qty<=0||!Number.isFinite(kcal)||!Number.isFinite(p)||!Number.isFinite(c)||!Number.isFinite(f)){alert('Complète le nom, la quantité et les valeurs nutritionnelles.');return}
  const factor=qty/100;
  const values={name,qty,meal:$('mealType').value,calories:kcal*factor,protein:p*factor,carbs:c*factor,fat:f*factor};
  if(editingFoodId){const item=day().find(x=>x.id===editingFoodId);if(item)Object.assign(item,values)}
  else day().push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),...values});
  save();$('foodDialog').close();render()
};
$('settingsBtn').onclick=$('navSettings').onclick=()=>{for(const k of Object.keys(goals))$('goal'+k[0].toUpperCase()+k.slice(1)).value=goals[k];$('settingsDialog').showModal()};
$('saveGoals').onclick=()=>{for(const k of Object.keys(goals)){const v=Number($('goal'+k[0].toUpperCase()+k.slice(1)).value);if(v>0)goals[k]=v}localStorage.setItem('nt-goals',JSON.stringify(goals));render()};
$('prevDay').onclick=()=>{let d=new Date(selectedDate+'T12:00:00');d.setDate(d.getDate()-1);selectedDate=isoDate(d);render()};
$('nextDay').onclick=()=>{let d=new Date(selectedDate+'T12:00:00');d.setDate(d.getDate()+1);selectedDate=isoDate(d);render()};
$('todayBtn').onclick=()=>{selectedDate=isoDate(new Date());render()};
$('importYesterdayBtn').onclick=()=>{
  const previous=new Date(selectedDate+'T12:00:00');
  previous.setDate(previous.getDate()-1);
  const previousDate=isoDate(previous);
  const source=data[previousDate]||[];
  if(!source.length){
    alert(`Aucun repas enregistré le ${prettyDate(previousDate)}.`);
    return;
  }
  const count=source.length;
  const current=data[selectedDate]||[];
  const message=`Importer les ${count} aliment${count>1?'s':''} de ${prettyDate(previousDate)} vers ${prettyDate(selectedDate)} ?\\n\\nLes repas actuels (${current.length} aliment${current.length>1?'s':''}) seront conservés. Les aliments importés seront ajoutés en plus.`;
  if(!confirm(message)) return;
  const copies=source.map((item,index)=>({
    ...item,
    id:(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`)
  }));
  data[selectedDate]=[...current,...copies];
  save();
  render();
  alert(`${count} aliment${count>1?'s':''} importé${count>1?'s':''} avec succès.`);
};

function showHistory(){$('historyDialog').showModal();renderHistory()}
$('historyBtn').onclick=$('navHistory').onclick=showHistory;
$('closeHistory').onclick=()=>$('historyDialog').close();
$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({goals,data},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nutritrack-sauvegarde.json';a.click();URL.revokeObjectURL(a.href)};
$('clearBtn').onclick=()=>{if(confirm('Effacer définitivement tous les repas et objectifs enregistrés sur cet appareil ?')){data={};save();render();$('historyDialog').close()}};

// Persistent light/dark theme preference
const savedTheme=localStorage.getItem('nt-theme')||'light';
document.body.dataset.theme=savedTheme;
function syncThemeButton(){
  const dark=document.body.dataset.theme==='dark';
  $('themeBtn').textContent=dark?'☀':'☾';
  $('themeBtn').setAttribute('aria-label',dark?'Activer le thème clair':'Activer le thème sombre');
  $('themeBtn').title=dark?'Passer au thème clair':'Passer au thème sombre';
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=dark?'#101d18':'#183d32';
}
$('themeBtn').onclick=()=>{
  document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';
  localStorage.setItem('nt-theme',document.body.dataset.theme);
  syncThemeButton();
};
syncThemeButton();

// Reliable update lifecycle: do not activate or reload until the user confirms.
let swRegistration=null, updatePromptShown=false, userRequestedUpdate=false, updateReloadTimer=null;
async function setupUpdates(){
  if(!('serviceWorker' in navigator)) return;
  try{
    swRegistration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
    const check=()=>swRegistration.update().catch(()=>{});
    await check();
    if(swRegistration.waiting && navigator.serviceWorker.controller) showUpdatePrompt();
    swRegistration.addEventListener('updatefound',()=>{
      const installing=swRegistration.installing;if(!installing)return;
      installing.addEventListener('statechange',()=>{
        if(installing.state==='installed' && navigator.serviceWorker.controller) showUpdatePrompt();
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(userRequestedUpdate && !window.__ntReloading){
        window.__ntReloading=true;clearTimeout(updateReloadTimer);window.location.reload();
      }
    });
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
  }catch(e){console.log('Mise à jour indisponible',e)}
}
function showUpdatePrompt(){
  const dlg=$('updateDialog');if(!dlg || dlg.open || updatePromptShown)return;
  updatePromptShown=true;
  const btn=$('installUpdate');if(btn){btn.disabled=false;btn.textContent='Télécharger et installer'}
  dlg.showModal();
}
$('laterUpdate').onclick=()=>{if($('updateDialog').open)$('updateDialog').close();updatePromptShown=false};
$('installUpdate').onclick=async()=>{
  const btn=$('installUpdate');if(!swRegistration)return;
  btn.textContent='Préparation de l’installation…';btn.disabled=true;
  try{
    await swRegistration.update();
    if(!swRegistration.waiting && swRegistration.installing){
      const installing=swRegistration.installing;
      await new Promise(resolve=>{
        const done=()=>{if(['installed','redundant'].includes(installing.state)){installing.removeEventListener('statechange',done);resolve()}};
        installing.addEventListener('statechange',done);done();setTimeout(resolve,12000);
      });
    }
    if(!swRegistration.waiting){btn.disabled=false;btn.textContent='Réessayer l’installation';return}
    userRequestedUpdate=true;
    swRegistration.waiting.postMessage({type:'SKIP_WAITING'});
    updateReloadTimer=setTimeout(()=>{if(userRequestedUpdate&&!window.__ntReloading){window.__ntReloading=true;window.location.reload()}},6000);
  }catch(e){btn.disabled=false;btn.textContent='Réessayer l’installation';console.log('Installation impossible',e)}
};
setupUpdates();
render();

// Failsafe splash dismissal; independent from data loading and app initialization.
function dismissSplash(){const splash=document.getElementById('splash');if(splash)splash.classList.add('hide')}
window.addEventListener('DOMContentLoaded',()=>setTimeout(dismissSplash,1800),{once:true});
window.addEventListener('load',()=>setTimeout(dismissSplash,1800),{once:true});
setTimeout(dismissSplash,4000);


// Barcode scanner: camera via ZXing (Safari fallback) and product lookup via Open Food Facts.
let barcodeReader=null, barcodeControls=null, scannerActive=false;
function stopBarcodeScanner(){
  scannerActive=false;
  try{if(barcodeControls && barcodeControls.stop)barcodeControls.stop()}catch(e){}
  barcodeControls=null;
  const video=$('scannerVideo');
  if(video && video.srcObject){video.srcObject.getTracks().forEach(t=>t.stop());video.srcObject=null}
}
$('openScanner').onclick=async()=>{
  $('scannerPanel').hidden=false;
  $('scannerStatus').textContent='Ouverture de la caméra…';
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    $('scannerStatus').textContent='Caméra indisponible dans ce navigateur. Tu peux saisir le code-barres ci-dessous.';
    return;
  }
  try{
    if(!window.ZXingBrowser || !ZXingBrowser.BrowserMultiFormatReader){
      $('scannerStatus').textContent='Le module de scan n’a pas pu être chargé. Saisis le code-barres manuellement ci-dessous.';
      return;
    }
    stopBarcodeScanner();
    barcodeReader=new ZXingBrowser.BrowserMultiFormatReader();
    scannerActive=true;
    barcodeControls=await barcodeReader.decodeFromVideoDevice(undefined,'scannerVideo',(result,err)=>{
      if(result && scannerActive){
        const code=result.getText();
        $('barcodeInput').value=code;
        stopBarcodeScanner();
        lookupFoodBarcode(code);
      }
    });
    $('scannerStatus').textContent='Place le code-barres dans le cadre. Le scan se déclenche automatiquement.';
  }catch(e){
    stopBarcodeScanner();
    $('scannerStatus').textContent='Impossible d’accéder à la caméra. Vérifie l’autorisation caméra de Safari, ou saisis le code-barres manuellement.';
  }
};
$('closeScanner').onclick=()=>{stopBarcodeScanner();$('scannerPanel').hidden=true};
$('lookupBarcode').onclick=()=>lookupFoodBarcode($('barcodeInput').value);
async function lookupFoodBarcode(raw){
  const code=String(raw||'').replace(/\D/g,'');
  if(!/^\d{8,14}$/.test(code)){
    $('scannerStatus').textContent='Code invalide : saisis un code EAN de 8 à 14 chiffres.';return;
  }
  $('scannerStatus').textContent='Recherche du produit dans Open Food Facts…';
  try{
    const fields='product_name,product_name_fr,brands,nutriments,quantity,serving_size';
    const response=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json?fields='+fields,{cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const data=await response.json();
    if(data.status!==1 || !data.product)throw new Error('Produit introuvable');
    const p=data.product, n=p.nutriments||{};
    const name=(p.product_name_fr||p.product_name||'').trim();
    if(!name)throw new Error('Nom du produit manquant');
    const kcal=Number(n['energy-kcal_100g']) || (Number(n['energy_100g'])/4.184) || 0;
    const protein=Number(n.proteins_100g)||0, carbs=Number(n.carbohydrates_100g)||0, fat=Number(n.fat_100g)||0;
    if(!kcal && !protein && !carbs && !fat)throw new Error('Valeurs nutritionnelles absentes');
    stopBarcodeScanner();$('scannerPanel').hidden=true;
    foodValuesPer100=true;setFoodFormMode();
    document.querySelector('[data-tab="manual"]').click();
    $('foodName').value=name+(p.brands?' — '+p.brands:'');
    $('foodQty').value=100;$('foodKcal').value=Number(kcal.toFixed(1));
    $('foodProtein').value=Number(protein.toFixed(1));$('foodCarbs').value=Number(carbs.toFixed(1));$('foodFat').value=Number(fat.toFixed(1));
    $('searchStatus').textContent='Produit trouvé. Vérifie les valeurs pour 100 g et indique la quantité consommée.';
  }catch(e){
    $('scannerStatus').textContent=e.message==='Produit introuvable'?'Produit non trouvé dans Open Food Facts. Tu peux saisir ses valeurs manuellement.':'Impossible de récupérer les valeurs nutritionnelles. Vérifie ta connexion ou saisis-les manuellement.';
  }
}
