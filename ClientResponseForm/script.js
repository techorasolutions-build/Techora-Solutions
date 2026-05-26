let cur = 0;
const total = 5;
const refs = [];
const selectedColors = [];

/* ── Chip helpers ── */
function toggle(el){ el.classList.toggle('selected'); }
function solo(el, groupId){
  document.getElementById(groupId).querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
}

/* ── Color picker ── */
function pickColor(el){
  if(el.classList.contains('selected')){
    el.classList.remove('selected');
    const i = selectedColors.indexOf(el.title);
    if(i>-1) selectedColors.splice(i,1);
    return;
  }
  if(selectedColors.length >= 2){
    document.querySelectorAll('#colorPicker .color-dot').forEach(d=>{
      if(d.title===selectedColors[0]) d.classList.remove('selected');
    });
    selectedColors.shift();
  }
  el.classList.add('selected');
  selectedColors.push(el.title);
}
function pickCustomColor(inp){
  const existing = document.getElementById('customColorDot');
  if(existing){ existing.classList.remove('selected'); selectedColors.splice(selectedColors.indexOf('Custom'),1); }
  const dot = document.createElement('div');
  dot.className = 'color-dot selected';
  dot.id = 'customColorDot';
  dot.style.background = inp.value;
  dot.title = 'Custom';
  dot.onclick = ()=>pickColor(dot);
  inp.parentNode.insertBefore(dot, inp);
  if(!selectedColors.includes('Custom')) selectedColors.push('Custom:'+inp.value);
}

/* ── Reference URLs ── */
function addRef(){
  const inp = document.getElementById('refInput');
  const v = inp.value.trim();
  if(!v) return;
  refs.push(v); inp.value = '';
  renderRefs();
}
function removeRef(i){ refs.splice(i,1); renderRefs(); }
function renderRefs(){
  document.getElementById('refList').innerHTML = refs.map((r,i)=>
    `<div class="ref-item"><span>${r}</span><button onclick="removeRef(${i})" title="Remove">✕</button></div>`
  ).join('');
}

/* ── Budget ── */
function updateBudget(){
  const v = parseInt(document.getElementById('budget').value);
  document.getElementById('budgetVal').textContent = '₹' + v.toLocaleString('en-IN');
}

/* ── Navigation ── */
function goTo(n){
  if(n < 0 || n >= total) return;
  document.querySelectorAll('.form-section').forEach((s,i)=>s.classList.toggle('active', i===n));
  document.querySelectorAll('.p-label').forEach((l,i)=>{
    l.classList.toggle('active', i===n);
    l.classList.toggle('done', i<n);
  });
  document.getElementById('progressFill').style.width = ((n+1)/total*100)+'%';
  cur = n;
  updateNav();
  window.scrollTo({top:0, behavior:'smooth'});
}

function updateNav(){
  const back = document.getElementById('backBtn');
  const next = document.getElementById('nextBtn');
  back.style.visibility = cur > 0 ? 'visible' : 'hidden';
  next.textContent = cur === total-1 ? 'Submit Project Brief ✓' : 'Next →';
  document.getElementById('stepInfo').textContent = 'Step '+(cur+1)+' of '+total;
}

function navigate(dir){
  if(dir === 1 && cur === total-1){ showPreview(); return; }
  goTo(cur + dir);
}

/* ── Collect helpers ── */
function getChips(id){ return [...document.querySelectorAll('#'+id+' .chip.selected')].map(c=>c.textContent.trim()).join(', ') || '—'; }
function val(id){ return document.getElementById(id)?.value?.trim() || '—'; }

/* ── Submit ── */
// 👇 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiwX2immUAuH_cRi8S86qVGfTRSLmUHPbyzxu147ciRbApTJjIfUA5rMp6IfTEU91K/exec';

let lastPayload = {}; // Store payload for sharing

function collectPayload(){
  return {
    bizName:      val('bizName'),
    contactName:  val('contactName'),
    phone:        val('phone'),
    email:        val('email'),
    address:      val('address'),
    bizType:      getChips('bizType'),
    bizDesc:      val('bizDesc'),
    socialLink:   val('socialLink'),
    goals:        getChips('goals'),
    pages:        getChips('pages'),
    features:     getChips('features'),
    audience:     val('audience'),
    style:        getChips('style'),
    colors:       selectedColors.join(', ') || '—',
    colorNotes:   val('colorNotes'),
    refSites:     refs.join(', ') || '—',
    refNotes:     val('refNotes'),
    device:       getChips('device'),
    logo:         getChips('logo'),
    photos:       getChips('photos'),
    contentReady: getChips('contentReady'),
    lang:         getChips('lang'),
    domain:       val('domain'),
    domainWish:   val('domainWish'),
    hosting:      getChips('hosting'),
    timeline:     getChips('timeline'),
    budget:       document.getElementById('budgetVal').textContent,
    support:      getChips('support'),
    cms:          getChips('cms'),
    notes:        val('notes'),
    source:       getChips('source')
  };
}

function showPreview(){
  const payload = collectPayload();
  const rows = [
    ['Business',     payload.bizName],
    ['Contact',      payload.contactName],
    ['Phone',        payload.phone],
    ['Email',        payload.email],
    ['Address',      payload.address],
    ['Business type',payload.bizType],
    ['Description',  payload.bizDesc],
    ['Social Media', payload.socialLink],
    ['Goals',        payload.goals],
    ['Pages',        payload.pages],
    ['Features',     payload.features],
    ['Audience',     payload.audience],
    ['Visual style', payload.style],
    ['Colours',      payload.colors],
    ['Reference sites',payload.refSites],
    ['Device focus', payload.device],
    ['Logo status',  payload.logo],
    ['Photos',       payload.photos],
    ['Content',      payload.contentReady],
    ['Language',     payload.lang],
    ['Domain',       payload.domain !== '—' ? payload.domain : payload.domainWish],
    ['Hosting',      payload.hosting],
    ['Timeline',     payload.timeline],
    ['Budget',       payload.budget],
    ['Support',      payload.support],
    ['CMS needed',   payload.cms],
    ['Notes',        payload.notes],
    ['Heard via',    payload.source],
  ];

  document.getElementById('previewContent').innerHTML = rows.map(([k,v]) =>
    `<div class="preview-row"><span class="preview-key">${k}</span><span class="preview-val">${v}</span></div>`
  ).join('');

  document.getElementById('previewModal').classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

function closePreview(){
  document.getElementById('previewModal').classList.remove('active');
}

function submitFromPreview(){
  document.getElementById('previewModal').classList.remove('active');
  submit();
}

function submit(){
  const payload = collectPayload();
  lastPayload = payload;

  // Show success immediately — don't make the client wait
  showSuccess(payload);

  // Send data to Google Sheet in the background
  if(SHEET_URL.includes('YOUR_SCRIPT_ID_HERE')){
    console.warn('⚠️ Google Sheet URL not set. Replace SHEET_URL in the script.');
    return;
  }
  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.error('Submission error:', err));
}

function showSuccess(p){
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.getElementById('navBar').style.display = 'none';
  document.getElementById('successWrap').classList.add('active');
  document.getElementById('stepLabels').style.display = 'none';
  document.getElementById('progressFill').parentElement.parentElement.style.display = 'none';

  const rows = [
    ['Business',     p.bizName],
    ['Contact',      p.contactName],
    ['Phone',        p.phone],
    ['Email',        p.email],
    ['Business type',p.bizType],
    ['Goals',        p.goals],
    ['Pages',        p.pages],
    ['Features',     p.features],
    ['Visual style', p.style],
    ['Colours',      p.colors],
    ['Language',     p.lang],
    ['Domain',       p.domain !== '—' ? p.domain : p.domainWish],
    ['Budget',       p.budget],
    ['Timeline',     p.timeline],
    ['Support',      p.support],
    ['Heard via',    p.source],
  ];

  document.getElementById('summaryCard').innerHTML =
    '<div class="summary-title">Submission summary</div>' +
    rows.map(([k,v]) =>
      `<div class="summary-row"><span class="summary-key">${k}</span><span class="summary-val">${v}</span></div>`
    ).join('');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Download & Share Functions ── */
function downloadForm(format){
  if(format === 'json'){
    downloadJSON(lastPayload);
  } else if(format === 'pdf'){
    downloadPDF(lastPayload);
  }
}

function downloadJSON(payload){
  const dataStr = JSON.stringify(payload, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `project-brief-${payload.bizName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(payload){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin + 10;
  
  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Project Brief', margin, y);
  y += 15;
  
  // Data rows
  const rows = [
    ['Business', payload.bizName],
    ['Contact', payload.contactName],
    ['Phone', payload.phone],
    ['Email', payload.email],
    ['Address', payload.address !== '—' ? payload.address : 'Not provided'],
    ['Business Type', payload.bizType],
    ['Description', payload.bizDesc],
    ['Social Media', payload.socialLink],
    ['Goals', payload.goals],
    ['Pages', payload.pages],
    ['Features', payload.features],
    ['Audience', payload.audience],
    ['Visual Style', payload.style],
    ['Colours', payload.colors],
    ['Reference Sites', payload.refSites],
    ['Device Focus', payload.device],
    ['Logo Status', payload.logo],
    ['Photos', payload.photos],
    ['Content Ready', payload.contentReady],
    ['Language', payload.lang],
    ['Domain', payload.domain !== '—' ? payload.domain : payload.domainWish],
    ['Hosting', payload.hosting],
    ['Timeline', payload.timeline],
    ['Budget', payload.budget],
    ['Support', payload.support],
    ['CMS Needed', payload.cms],
    ['Notes', payload.notes],
    ['Heard Via', payload.source]
  ];
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  rows.forEach(([key, value]) => {
    if(y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 102, 102);
    doc.text(key + ':', margin, y);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    const valueText = String(value);
    const splitValue = doc.splitTextToSize(valueText, pageWidth - margin * 2 - 60);
    doc.text(splitValue, margin + 60, y);
    
    y += Math.max(7, splitValue.length * 5) + 2;
  });
  
  // Save the PDF
  doc.save(`project-brief-${payload.bizName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.pdf`);
}

function shareWhatsApp(){
  const msg = `Hi, I've submitted my project brief on Techora Solutions! 

Business: ${lastPayload.bizName}
Contact: ${lastPayload.contactName}
Goals: ${lastPayload.goals}
Budget: ${lastPayload.budget}

Check it out: ${window.location.href}`;
  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

function shareEmail(){
  const subject = `Project Brief: ${lastPayload.bizName}`;
  const body = `I've submitted my project brief for ${lastPayload.bizName} on Techora Solutions.

Business Type: ${lastPayload.bizType}
Goals: ${lastPayload.goals}
Pages: ${lastPayload.pages}
Budget: ${lastPayload.budget}
Timeline: ${lastPayload.timeline}

Check the full brief: ${window.location.href}`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function shareTwitter(){
  const text = `Just submitted my project brief with @TechoraSol for ${lastPayload.bizName}! Ready to build an amazing website. ${window.location.href}`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

function shareFacebook(){
  const url = window.location.href;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareLinkedIn(){
  const url = window.location.href;
  const title = `Project Brief Submitted: ${lastPayload.bizName}`;
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}

updateNav();
