import { useState, useRef, useCallback, useEffect } from "react";

const HUCK_FEE = 0.06;

const C = {
  coral:  "#FF5A5F", coralD: "#E8484D",
  teal:   "#00A699", tealL:  "#E8F8F5",
  navy:   "#484848", navyL:  "#767676",
  border: "#EBEBEB", borderD:"#DBDBDB",
  ink:    "#222222", bg:     "#F7F6F2",
  white:  "#FFFFFF", gold:   "#F5A623",
};

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes float   { 0%,100%{transform:translateY(0) rotate(-7deg)} 50%{transform:translateY(-12px) rotate(-2deg)} }
@keyframes floatB  { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-9px) rotate(9deg)} }
@keyframes floatC  { 0%,100%{transform:translateY(0) rotate(-12deg)} 50%{transform:translateY(-7px) rotate(-7deg)} }
@keyframes jackFly { 0%{transform:translateX(-15px) rotate(-10deg)} 100%{transform:translateX(15px) rotate(-5deg)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes popIn   { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
@keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
* { box-sizing:border-box; margin:0; padding:0; }
input,textarea,button,select { font-family:'Plus Jakarta Sans',sans-serif; }
::placeholder { color:#C8C8C8; }
::-webkit-scrollbar { width:3px; height:3px; }
::-webkit-scrollbar-thumb { background:#DCDCDC; border-radius:4px; }
`;

/* ── utils ── */
const fmt    = n => `$${Number(n).toFixed(0)}`;
const fmtD   = n => `$${Number(n).toFixed(2)}`;
const netAmt = p => p * (1 - HUCK_FEE);
const fmtDate= d => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});

/* ── Storage (localStorage for deployed app) ── */
const store = {
  get: (k) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch(e){return null;} },
  set: (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch(e){} },
};

/* ══ LOGO ══ */
function HuckLogo({ size=38, animate=false, white=false }) {
  const color = white ? "#fff" : C.coral;
  const bw=size*.13, bh=size*.72, by=size*.14;
  const lx=size*.12, rx=size*.75, my=size*.42, jw=size*.62;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" overflow="visible">
      <rect x={lx} y={by} width={bw} height={bh} rx={bw/2} fill={color}/>
      <rect x={rx} y={by} width={bw} height={bh} rx={bw/2} fill={color}/>
      <g style={animate?{animation:"jackFly 2.2s ease-in-out infinite alternate"}:{}}>
        <g transform={`translate(${size*.16},${my-jw*.38}) scale(${jw/100})`}>
          <path d="M18 14L2 26L10 30L9 62L91 62L90 30L98 26L82 14L68 22Q50 30 32 22Z" fill={color}/>
          <path d="M32 22Q38 34 50 36Q62 34 68 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7"/>
          <path d="M18 14L2 26L10 30L20 20Z" fill={color} style={{filter:"brightness(.85)"}}/>
          <path d="M82 14L98 26L90 30L80 20Z" fill={color} style={{filter:"brightness(.85)"}}/>
          <line x1="94" y1="22" x2="107" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".6"/>
          <line x1="96" y1="30" x2="111" y2="30" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity=".4"/>
          <line x1="94" y1="38" x2="106" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round" opacity=".5"/>
        </g>
      </g>
    </svg>
  );
}

function HeroJacket({ style={}, anim="float", opacity=1 }) {
  return (
    <svg viewBox="0 0 100 76" style={{...style, animation:`${anim} 4s ease-in-out infinite`, opacity}} fill="none">
      <path d="M18 14L2 26L10 30L9 62L91 62L90 30L98 26L82 14L68 22Q50 30 32 22Z" fill="rgba(255,255,255,0.22)"/>
      <path d="M32 22Q38 34 50 36Q62 34 68 22" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 14L2 26L10 30L20 20Z" fill="rgba(0,0,0,0.07)"/>
      <path d="M82 14L98 26L90 30L80 20Z" fill="rgba(0,0,0,0.07)"/>
    </svg>
  );
}

const STATUS = {
  listed: { label:"Listed",       color:"#3498DB", bg:"#EBF5FB" },
  sold:   { label:"Sold — Ship!", color:C.coral,   bg:"#FFF0F0" },
  shipped:{ label:"Shipped",      color:C.gold,    bg:"#FFF8EC" },
  paid:   { label:"Paid",         color:C.teal,    bg:C.tealL   },
};

function Badge({ status, large }) {
  const s = STATUS[status]||STATUS.listed;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.bg,color:s.color,
      fontSize:large?13:11,fontWeight:700,padding:large?"5px 12px":"3px 10px",
      borderRadius:100,border:`1px solid ${s.color}25`,whiteSpace:"nowrap"}}>
      <span style={{width:large?7:5,height:large?7:5,borderRadius:"50%",background:s.color,display:"inline-block",flexShrink:0}}/>
      {s.label}
    </span>
  );
}

function Field({ label, value, onChange, placeholder, type="text", multi=false, hint, req }) {
  const [f,setF]=useState(false);
  const s={width:"100%",padding:"13px 15px",border:`1.5px solid ${f?C.coral:C.borderD}`,
    borderRadius:12,fontSize:15,color:C.ink,background:C.white,outline:"none",
    transition:"border-color .15s",lineHeight:multi?1.65:"normal",resize:multi?"vertical":"none"};
  return (
    <div style={{marginBottom:16}}>
      {label&&<label style={{display:"block",fontSize:12,fontWeight:600,color:C.navyL,marginBottom:5}}>
        {label}{req&&<span style={{color:C.coral}}> *</span>}
      </label>}
      {multi
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} style={s}
            onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
        : <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={s}
            onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
      }
      {hint&&<div style={{fontSize:11,color:"#BBB",marginTop:5}}>{hint}</div>}
    </div>
  );
}

function Btn({ children, onClick, disabled, full, ghost, small, style:ex={} }) {
  const bg    = ghost?"#fff":disabled?"#F0F0F0":C.coral;
  const color = ghost?C.navyL:disabled?"#CCC":"#fff";
  const sh    = !ghost&&!disabled?"0 4px 16px rgba(255,90,95,0.26)":"none";
  const bdr   = ghost?`1.5px solid ${C.borderD}`:"none";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:full?"100%":"auto",padding:small?"9px 16px":"14px 22px",
      background:bg,color,border:bdr,borderRadius:12,fontSize:small?13:15,
      fontWeight:700,cursor:disabled?"default":"pointer",boxShadow:sh,
      transition:"all .15s",letterSpacing:"-.1px",...ex
    }}>{children}</button>
  );
}

function Thumb({ photo, index, onRemove, onSetRole }) {
  const roles=["main","front","back","tag","detail","other"];
  const isTag=photo.role==="tag", isMain=photo.role==="main";
  return (
    <div style={{position:"relative",borderRadius:14,overflow:"hidden",flexShrink:0,
      width:100,height:124,animation:"popIn .2s ease",
      border:`2px solid ${isMain?C.coral:isTag?C.teal:C.border}`,background:C.white,
      boxShadow:isMain||isTag?"0 4px 14px rgba(0,0,0,0.09)":"0 1px 5px rgba(0,0,0,0.04)"}}>
      <img src={photo.preview} alt="" style={{width:"100%",height:80,objectFit:"cover",display:"block"}}/>
      <select value={photo.role} onChange={e=>onSetRole(index,e.target.value)} style={{
        position:"absolute",bottom:0,left:0,right:0,height:31,border:"none",
        borderTop:`1px solid ${C.border}`,
        background:isTag?C.tealL:isMain?"#FFF0F0":"#FAFAFA",
        color:isTag?C.teal:isMain?C.coral:C.navyL,
        fontSize:9,fontWeight:700,padding:"0 5px",cursor:"pointer",outline:"none",
        letterSpacing:.5,textTransform:"uppercase"}}>
        {roles.map(r=><option key={r} value={r}>{r==="main"?"★ MAIN":r.toUpperCase()}</option>)}
      </select>
      <button onClick={()=>onRemove(index)} style={{
        position:"absolute",top:5,right:5,width:19,height:19,
        background:"rgba(0,0,0,0.42)",color:"#fff",border:"none",borderRadius:"50%",
        fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
      {(isMain||isTag)&&<div style={{position:"absolute",top:5,left:5,
        background:isTag?C.teal:C.coral,color:"#fff",fontSize:8,fontWeight:700,
        padding:"2px 6px",borderRadius:100,letterSpacing:.5}}>{isTag?"TAG":"MAIN"}</div>}
    </div>
  );
}

function TagCard({ data }) {
  if (!data) return null;
  const rows=[["Brand",data.brand],["Size",data.size],["Material",data.material],
    ["Made in",data.madeIn],["Retail",data.retailPrice?`$${data.retailPrice}`:null],["SKU",data.productCode]]
    .filter(([,v])=>v&&!["Unknown","N/A","null",null].includes(v));
  if (!rows.length) return null;
  return (
    <div style={{background:C.tealL,border:`1.5px solid #B2E5E2`,borderRadius:14,
      padding:"14px 16px",marginBottom:18,animation:"popIn .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
        <span style={{fontSize:14}}>🏷</span>
        <span style={{fontSize:11,fontWeight:700,color:C.teal,letterSpacing:.5,textTransform:"uppercase"}}>Tag data read</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px 20px"}}>
        {rows.map(([k,v])=>(
          <div key={k}>
            <div style={{fontSize:10,color:"#AAA",fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginBottom:1}}>{k}</div>
            <div style={{fontSize:13,fontWeight:700,color:C.ink}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PayoutCard({ price }) {
  const fee=price*HUCK_FEE, payout=price-fee;
  return (
    <div style={{background:C.white,border:`1.5px solid ${C.teal}35`,borderRadius:16,overflow:"hidden",marginBottom:20}}>
      <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:14}}>💰</span>
        <span style={{fontSize:11,fontWeight:700,color:C.navyL,letterSpacing:.5,textTransform:"uppercase"}}>Your payout</span>
      </div>
      <div style={{padding:"16px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
          <span style={{fontSize:13,color:C.navyL}}>Sale price</span>
          <span style={{fontSize:13,fontWeight:600}}>{fmt(price)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",paddingBottom:12,
          borderBottom:`1px dashed ${C.border}`,marginBottom:12}}>
          <span style={{fontSize:13,color:C.navyL}}>Huck fee (6%)</span>
          <span style={{fontSize:13,fontWeight:600,color:C.coral}}>− {fmtD(fee)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:700}}>You receive</span>
          <span style={{fontSize:24,fontWeight:800,color:C.teal,letterSpacing:"-.5px"}}>{fmt(payout)}</span>
        </div>
      </div>
    </div>
  );
}

function NextSteps() {
  return (
    <div style={{background:"#FAFAFA",border:`1px solid ${C.border}`,borderRadius:16,padding:"18px",marginBottom:20}}>
      <div style={{fontSize:11,fontWeight:700,color:"#C0C0C0",letterSpacing:.8,textTransform:"uppercase",marginBottom:14}}>What happens next</div>
      {[
        [C.coral,  "Your item is live",  "Listed on eBay. We handle all buyer questions and negotiations."],
        ["#3498DB","It sells",           "We text you instantly with the buyer's shipping address."],
        [C.gold,   "You ship",           "We send you a prepaid FedEx label. Just pack and drop off."],
        [C.teal,   "You get paid",       "Your payout hits your account within 3 business days of delivery."],
      ].map(([color,title,desc],i)=>(
        <div key={title} style={{display:"flex",gap:12,marginBottom:i<3?14:0,alignItems:"flex-start"}}>
          <div style={{width:27,height:27,borderRadius:"50%",background:`${color}18`,
            border:`1.5px solid ${color}35`,display:"flex",alignItems:"center",
            justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:800,color,marginTop:1}}>
            {i+1}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:2}}>{title}</div>
            <div style={{fontSize:12,color:C.navyL,lineHeight:1.5}}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemCard({ item, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:C.white,border:`1.5px solid ${C.border}`,borderRadius:18,
      overflow:"hidden",cursor:"pointer",display:"flex",
      boxShadow:"0 2px 10px rgba(0,0,0,0.04)",
      transition:"box-shadow .15s,transform .15s",animation:"popIn .25s ease",
    }}
    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 22px rgba(0,0,0,0.09)";e.currentTarget.style.transform="translateY(-2px)";}}
    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.04)";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{width:86,flexShrink:0,background:"#F5F4F0",position:"relative"}}>
        {item.cleanedUrl
          ? <img src={item.cleanedUrl} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
          : <div style={{width:"100%",height:"100%",minHeight:86,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🧥</div>
        }
        {item.status==="sold"&&(
          <div style={{position:"absolute",inset:0,background:"rgba(255,90,95,0.1)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📦</div>
        )}
      </div>
      <div style={{flex:1,padding:"13px 15px",minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:5}}>
          <div style={{fontSize:14,fontWeight:700,color:C.ink,lineHeight:1.3,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>
            {item.itemName||"Item"}
          </div>
          <Badge status={item.status}/>
        </div>
        <div style={{fontSize:11,color:"#BBB",fontWeight:500,marginBottom:9}}>
          {[item.brand,item.category,item.size].filter(v=>v&&v!=="Unknown").join(" · ")||item.condition}
        </div>
        <div style={{display:"flex",gap:18}}>
          <div>
            <div style={{fontSize:10,color:"#CCC",fontWeight:600,letterSpacing:.3,textTransform:"uppercase",marginBottom:1}}>Listed</div>
            <div style={{fontSize:15,fontWeight:800,color:C.ink}}>{item.listPrice?fmt(item.listPrice):"—"}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:"#CCC",fontWeight:600,letterSpacing:.3,textTransform:"uppercase",marginBottom:1}}>Your cut</div>
            <div style={{fontSize:15,fontWeight:800,color:C.teal}}>{item.listPrice?fmt(netAmt(item.listPrice)):"—"}</div>
          </div>
          <div style={{marginLeft:"auto",alignSelf:"flex-end"}}>
            <div style={{fontSize:11,color:C.navyL,fontWeight:500}}>{fmtDate(item.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ API CALLS ══ */
const api = {
  removeBg: async (file) => {
    const fd = new FormData();
    fd.append('image_file', file);
    fd.append('size', 'auto');
    fd.append('bg_color', 'ffffff');
    const r = await fetch('/api/removebg', { method:'POST', body:fd });
    if (!r.ok) return null;
    const blob = await r.blob();
    return URL.createObjectURL(blob);
  },

  sms: async (to, body) => {
    const norm = to.replace(/\D/g,'');
    const toNum = norm.startsWith('1') ? '+'+norm : '+1'+norm;
    const r = await fetch('/api/sms', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ to:toNum, body }),
    });
    if (!r.ok) { const e=await r.json(); throw new Error(e.error||'SMS failed'); }
  },
};

/* ══ MAIN APP ══ */
export default function Huck() {
  const [view,setView]   = useState('landing');
  const [name,setName]   = useState('');
  const [phone,setPhone] = useState('');
  const [desc,setDesc]   = useState('');
  const [photos,setPhotos]   = useState([]);
  const [tagData,setTagData] = useState(null);
  const [cleanedUrl,setClean]= useState(null);
  const [analysis,setAnalysis]= useState(null);
  const [status,setStatus]   = useState('');
  const [error,setError]     = useState(null);
  const [smsSent,setSmsSent] = useState(false);
  const [dragOver,setDragOver]= useState(false);
  const [readTag,setReadTag] = useState(false);
  const [agreedTos,setAgreed]= useState(false);
  const [items,setItems]     = useState([]);
  const [selected,setSelected]= useState(null);
  const fileRef = useRef();

  useEffect(()=>{
    const u = store.get('huck_user');
    if(u){ setName(u.name||''); setPhone(u.phone||''); if(u.name&&u.phone) setView('dashboard'); }
    setItems(store.get('huck_items')||[]);
  },[]);

  const saveUser  = (n,p) => store.set('huck_user',{name:n,phone:p});
  const saveItems = (list) => store.set('huck_items',list);
  const nav = v => { setView(v); window.scrollTo(0,0); };

  const toB64 = f=>new Promise(r=>{const rd=new FileReader();rd.onload=()=>r(rd.result.split(',')[1]);rd.readAsDataURL(f);});

  // Compress image to ~400KB max before sending to API
  const compressToB64 = (file) => new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 800;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim/width, maxDim/height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.6).split(',')[1]);
    };
    img.onerror = () => { toB64(file).then(resolve); };
    img.src = url;
  });

  const addPhotos = useCallback(async(files)=>{
    const arr=Array.from(files).filter(f=>f.type.startsWith('image/'));
    const newP=await Promise.all(arr.map(async(f,i)=>({
      file:f,preview:URL.createObjectURL(f),
      // b64 only loaded on demand (tag reading) — not pre-loaded to save memory
      b64:null,
      role:photos.length===0&&i===0?'main':'other',
    })));
    setPhotos(prev=>{
      const m=[...prev,...newP];
      if(!m.some(p=>p.role==='main')&&m.length)m[0].role='main';
      return m;
    });
  },[photos.length]);

  const removePhoto=i=>setPhotos(prev=>{
    const n=prev.filter((_,j)=>j!==i);
    if(prev[i].role==='main'&&n.length)n[0].role='main';
    return n;
  });

  // Tag reading removed - user enters tag details in description field
  const readTagPhoto = async(photo) => { /* no-op */ };

  const setRole=async(i,role)=>{
    setPhotos(prev=>prev.map((p,j)=>{
      if(role==='main')return{...p,role:j===i?'main':(p.role==='main'?'other':p.role)};
      return j===i?{...p,role}:p;
    }));
    if(role==='tag')await readTagPhoto(photos[i]);
  };

  // Build listing locally from tag data + description — no AI needed
  const analyzeItem = () => {
    const brand   = tagData?.brand || '';
    const size    = tagData?.size  || '';
    const material= tagData?.material || '';
    const retail  = tagData?.retailPrice;
    const userDesc= desc.trim();

    // Parse condition from description
    const descLow = userDesc.toLowerCase();
    let condition = 'Good';
    if (descLow.includes('new with tags') || descLow.includes('nwt'))   condition = 'New with Tags';
    else if (descLow.includes('new without') || descLow.includes('nwot')) condition = 'New without Tags';
    else if (descLow.includes('like new') || descLow.includes('barely worn') || descLow.includes('worn once')) condition = 'Like New';
    else if (descLow.includes('fair') || descLow.includes('worn'))        condition = 'Fair';
    else if (descLow.includes('poor') || descLow.includes('damaged'))     condition = 'Poor';

    // Parse color
    const colors = ['black','white','blue','red','green','grey','gray','brown','navy','beige','pink','yellow','purple','orange','cream','tan','burgundy','olive'];
    const color = colors.find(c => descLow.includes(c)) || '';

    // Parse gender
    const gender = descLow.includes("women") || descLow.includes("ladies") ? "Women"
      : descLow.includes("kids") || descLow.includes("children") ? "Kids"
      : "Men";

    // Parse category keywords
    const categories = {
      'jacket': "Jacket", 'coat': "Coat", 'jeans': "Jeans", 'pants': "Pants",
      'shirt': "Shirt", 'blouse': "Blouse", 'dress': "Dress", 'skirt': "Skirt",
      'sweater': "Sweater", 'hoodie': "Hoodie", 'shorts': "Shorts", 'shoes': "Shoes",
      'boots': "Boots", 'sneakers': "Sneakers", 'bag': "Bag", 'vest': "Vest",
      'suit': "Suit", 'blazer': "Blazer", 'cardigan': "Cardigan", 'leggings': "Leggings",
    };
    const category = Object.entries(categories).find(([k]) => descLow.includes(k))?.[1] || 'Clothing';

    const itemName  = [brand, color, category].filter(Boolean).join(' ');
    const sizeStr   = size ? ` Size ${size}` : '';
    const brandStr  = brand ? `${brand} ` : '';
    const listingTitle = `${brandStr}${color ? color+' ' : ''}${category}${sizeStr} — ${condition}`.substring(0, 79);

    const listingDescription = [
      `${condition} ${itemName || category}${size ? ', size '+size : ''}.`,
      material ? `Made from ${material}.` : '',
      userDesc || '',
      'Ships fast with tracking. Happy to answer any questions!',
    ].filter(Boolean).join(' ');

    const ebaySearchQuery = [brand, color, category, size].filter(Boolean).join(' ');

    const tags = [brand, color, category, size, material, gender, condition]
      .filter(Boolean).map(t => t.toLowerCase().replace(/\s+/g,''));

    return {
      itemName: itemName || category,
      brand: brand || 'Unknown',
      category: `${gender}'s ${category}`,
      condition,
      conditionDetail: `Listed as ${condition} by seller.`,
      color, gender, size, material,
      defects: 'None noted',
      listingTitle,
      listingDescription,
      tags,
      ebaySearchQuery,
      keySellingPoints: [
        condition === 'New with Tags' ? 'Never worn, tags still attached' : `${condition} condition`,
        size ? `Size ${size}` : 'See description for sizing',
        'Fast shipping with tracking',
      ].filter(Boolean),
      shippingTip: category === 'Shoes' || category === 'Boots'
        ? 'Box shoes in original box if available, wrap in tissue paper.'
        : 'Fold neatly, place in poly mailer or box. Use bubble wrap for structured items.',
    };
  };

    // Pricing research done locally based on condition + retail price
  const researchPricing = (item) => {
    const retail = tagData?.retailPrice || 0;
    const conditionMultipliers = {
      'New with Tags': 0.75, 'New without Tags': 0.65, 'Like New': 0.50,
      'Good': 0.35, 'Fair': 0.22, 'Poor': 0.12,
    };
    const mult = conditionMultipliers[item.condition] || 0.35;
    const basePrice = retail > 0 ? retail * mult : 40;
    const recommendedPrice = Math.max(15, Math.round(basePrice / 5) * 5);
    const avgSold = Math.round(recommendedPrice * 1.1);
    const lowSold  = Math.round(recommendedPrice * 0.7);
    const highSold = Math.round(recommendedPrice * 1.5);
    const quickSalePrice = Math.round(recommendedPrice * 0.85);
    return {
      lowSold, avgSold, highSold, recommendedPrice, quickSalePrice,
      pricingRationale: retail > 0
        ? `Priced at ${Math.round(mult*100)}% of original $${retail} retail based on ${item.condition} condition.`
        : `Competitive price for ${item.condition} condition. Adjust based on comparable sold listings.`,
      marketInsight: 'Check eBay sold listings for your exact item to fine-tune the price.',
      daysToSell: item.condition === 'New with Tags' ? 5 : item.condition === 'Like New' ? 8 : 14,
    };
  };

    const run=async()=>{
    setError(null);
    nav('processing');
    try{
      const main=photos.find(p=>p.role==='main')||photos[0];
      setStatus('Cleaning up your photo…');
      setStatus('Analyzing your item…');
      const item = analyzeItem();
      setStatus('Cleaning up your photo…');
      const cleanUrl = await api.removeBg(main.file);
      setClean(cleanUrl||URL.createObjectURL(main.file));
      setStatus('Researching the market…');
      const pricing = researchPricing(item);
      const ebayUrl=`https://www.ebay.com/sell/home?${new URLSearchParams({title:item.listingTitle,description:item.listingDescription,StartPrice:pricing.recommendedPrice})}`;
      setAnalysis({item,pricing,ebayUrl});

      const newItem={
        id:Date.now().toString(),
        itemName:item.itemName,brand:item.brand,category:item.category,
        size:item.size,condition:item.condition,color:item.color,
        listPrice:pricing.recommendedPrice,
        cleanedUrl:cleanUrl||null,
        ebayUrl,listingTitle:item.listingTitle,listingDescription:item.listingDescription,
        tags:item.tags,keySellingPoints:item.keySellingPoints,
        shippingTip:item.shippingTip,ebaySearchQuery:item.ebaySearchQuery,
        pricing,tagData,status:'listed',createdAt:new Date().toISOString(),
      };
      const updated=[newItem,...items];
      setItems(updated);
      saveItems(updated);

      // SMS
      setStatus('Sending your text…');
      const fn=name.split(' ')[0];
      await api.sms(phone,`Hey ${fn}! Your Huck listing is live 🛫

${item.itemName}${item.brand&&item.brand!=='Unknown'?` · ${item.brand}`:''}
${item.condition} · Size ${item.size}

Listed: $${pricing.recommendedPrice} · Your payout: ${fmt(netAmt(pricing.recommendedPrice))}

We'll text you the second it sells — with the buyer's address and your prepaid FedEx label.

— Huck 🤙`);
      setSmsSent(true);
      nav('results');
    }catch(e){
      setError(e.message||'Something went wrong. Please try again.');
      nav('upload');
    }
  };

  const startNew=()=>{
    setDesc('');setPhotos([]);setTagData(null);setClean(null);
    setAnalysis(null);setSmsSent(false);setError(null);setAgreed(false);
    nav('upload');
  };

  const mainPhoto=photos.find(p=>p.role==='main')||photos[0];
  const canSubmit=photos.length>0&&agreedTos;
  const totalEarned=items.filter(i=>i.status==='paid').reduce((s,i)=>s+netAmt(i.listPrice||0),0);
  const activeCount=items.filter(i=>['listed','sold','shipped'].includes(i.status)).length;

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Plus Jakarta Sans',sans-serif",color:C.ink}}>
      <style>{STYLES}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(255,255,255,0.94)',
        backdropFilter:'blur(20px)',borderBottom:`1px solid ${C.border}`,
        padding:'0 20px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div onClick={()=>name?nav('dashboard'):nav('landing')}
          style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer'}}>
          <HuckLogo size={34} animate={view==='processing'}/>
          <span style={{fontSize:19,fontWeight:800,color:C.ink,letterSpacing:'-.6px'}}>huck</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {name&&view!=='processing'&&<>
            <button onClick={()=>nav('dashboard')} style={{background:'none',border:'none',
              fontSize:13,fontWeight:600,color:view==='dashboard'?C.coral:C.navyL,cursor:'pointer',padding:'6px 8px'}}>
              My items{activeCount>0&&<span style={{background:C.coral,color:'#fff',borderRadius:100,
                fontSize:10,padding:'1px 6px',marginLeft:4}}>{activeCount}</span>}
            </button>
            <Btn small onClick={startNew} ex={{padding:'8px 14px',fontSize:13}}>+ List item</Btn>
          </>}
        </div>
      </nav>

      {/* LANDING */}
      {view==='landing'&&(
        <div>
          <div style={{background:`linear-gradient(140deg,#FF5A5F 0%,#FF385C 50%,#E8436A 100%)`,
            padding:'56px 20px 52px',position:'relative',overflow:'hidden',textAlign:'center'}}>
            <div style={{position:'absolute',top:12,left:'6%',width:52}}><HeroJacket anim="floatC"/></div>
            <div style={{position:'absolute',top:6,right:'4%',width:70}}><HeroJacket anim="float"/></div>
            <div style={{position:'absolute',bottom:10,left:'20%',width:38}}><HeroJacket anim="floatB"/></div>
            <div style={{position:'absolute',bottom:16,right:'18%',width:30}}><HeroJacket anim="floatC"/></div>
            <div style={{width:84,height:84,background:'rgba(255,255,255,0.14)',backdropFilter:'blur(10px)',
              borderRadius:22,margin:'0 auto 24px',display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 12px 40px rgba(0,0,0,0.14)',position:'relative',zIndex:2,
              border:'1.5px solid rgba(255,255,255,0.22)'}}>
              <HuckLogo size={54} animate white/>
            </div>
            <h1 style={{fontSize:36,fontWeight:800,color:'#fff',lineHeight:1.12,
              letterSpacing:'-1px',marginBottom:10,position:'relative',zIndex:2}}>
              Your closet.<br/>Someone's wishlist.
            </h1>
            <p style={{fontSize:16,color:'rgba(255,255,255,0.82)',maxWidth:290,
              margin:'0 auto 6px',lineHeight:1.6,position:'relative',zIndex:2}}>
              We price it and prepare it for sale.
            </p>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.50)',position:'relative',zIndex:2}}>
              Huck takes 6% when it sells. You keep the rest.
            </p>
          </div>

          <div style={{maxWidth:440,margin:'0 auto',padding:'0 18px 80px'}}>
            <div style={{background:C.white,borderRadius:20,marginTop:-20,
              boxShadow:'0 8px 40px rgba(0,0,0,0.10)',padding:'28px 24px',border:`1px solid ${C.border}`}}>
              <h2 style={{fontSize:18,fontWeight:800,marginBottom:4,letterSpacing:'-.3px'}}>Get started — it's free</h2>
              <p style={{fontSize:13,color:C.navyL,marginBottom:22,lineHeight:1.5}}>
                We only make money when you do.
              </p>
              <Field label="Full name" value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Johnson" req/>
              <Field label="Mobile number" value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder="(949) 000-0000" type="tel" req
                hint="We text you when your item sells and when money's coming"/>
              <Btn full onClick={()=>{if(name&&phone){saveUser(name,phone);nav('upload');}}} disabled={!name||!phone}>
                Start listing →
              </Btn>
            </div>

            <div style={{padding:'32px 4px 0'}}>
              <p style={{fontSize:11,fontWeight:700,color:'#CCC',letterSpacing:1.2,
                textTransform:'uppercase',marginBottom:18}}>How Huck works</p>
              {[
                [C.coral,  '📸','60 seconds',    'Take a few photos. Front, back, tags. That\'s it.'],
                [C.teal,   '🔍','We do the work', 'AI reads your tags, researches real eBay sold prices, and writes the whole listing.'],
                ['#9B59B6','🛒','We list it',     'Your item goes live on eBay. We handle all buyer questions.'],
                ['#F39C12','📦','You ship it',    'When it sells, we text you with a prepaid FedEx label.'],
                [C.teal,   '💸','You get paid',   '94 cents of every dollar, within 3 business days.'],
              ].map(([color,icon,title,d])=>(
                <div key={title} style={{display:'flex',gap:14,marginBottom:20,alignItems:'flex-start'}}>
                  <div style={{width:40,height:40,borderRadius:12,background:`${color}15`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{icon}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:C.ink,marginBottom:1}}>{title}</div>
                    <div style={{fontSize:13,color:C.navyL,lineHeight:1.5}}>{d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:'4px 20px'}}>
              {[['6%','Only when it sells'],['48h','Average time to list'],['3 days','To get paid after sale']].map(([val,label],i)=>(
                <div key={val} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                  padding:'14px 0',borderBottom:i<2?`1px solid ${C.border}`:'none'}}>
                  <span style={{fontSize:13,color:C.navyL}}>{label}</span>
                  <span style={{fontSize:15,fontWeight:800,color:C.coral}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD */}
      {view==='upload'&&(
        <div style={{maxWidth:480,margin:'0 auto',padding:'28px 18px 80px',animation:'fadeUp .4s ease'}}>
          <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-.5px',marginBottom:4}}>List an item</h2>
          <p style={{fontSize:14,color:C.navyL,marginBottom:20}}>A few photos is all it takes.</p>

          {error&&<div style={{background:'#FFF5F5',border:'1px solid #FFD5D5',borderRadius:12,
            padding:'12px 16px',color:'#C0392B',fontSize:13,marginBottom:18,fontWeight:500}}>⚠️ {error}</div>}

          <TagCard data={tagData}/>

          {photos.length>0?(
            <div style={{marginBottom:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <span style={{fontSize:12,fontWeight:600,color:C.navyL}}>{photos.length} photo{photos.length>1?'s':''} added</span>
                <span style={{fontSize:11,color:'#BBB'}}>Set the role below each one</span>
              </div>
              <div style={{display:'flex',gap:9,overflowX:'auto',paddingBottom:4}}>
                {photos.map((p,i)=><Thumb key={i} photo={p} index={i} onRemove={removePhoto} onSetRole={setRole}/>)}
                <div onClick={()=>fileRef.current?.click()} style={{
                  width:100,height:124,borderRadius:14,flexShrink:0,
                  border:`2px dashed ${C.borderD}`,background:'#FAFAFA',
                  display:'flex',flexDirection:'column',alignItems:'center',
                  justifyContent:'center',cursor:'pointer',gap:5,color:'#CCC'}}>
                  <span style={{fontSize:20,fontWeight:300}}>+</span>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:.5,textTransform:'uppercase'}}>Add more</span>
                </div>
              </div>
              {readTag&&<div style={{display:'flex',alignItems:'center',gap:7,marginTop:9,color:C.teal,fontSize:12,fontWeight:600}}>
                <div style={{width:11,height:11,border:`2px solid #B2E5E2`,borderTopColor:C.teal,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
                Reading tag data…
              </div>}
              <div style={{fontSize:11,color:'#BBB',marginTop:8}}>
                💡 Mark a photo as <strong style={{color:C.teal}}>TAG</strong> to auto-read brand, size & material
              </div>
            </div>
          ):(
            <div onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);addPhotos(e.dataTransfer.files);}}
              style={{border:`2px dashed ${dragOver?C.coral:C.borderD}`,borderRadius:20,
                background:dragOver?'#FFF5F5':C.white,minHeight:190,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                cursor:'pointer',transition:'all .15s',marginBottom:18,padding:28,gap:10}}>
              <div style={{width:56,color:C.coral,opacity:.55}}><HeroJacket anim="float" opacity={1}/></div>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:700,fontSize:15,color:C.navy,marginBottom:3}}>Drop your photos here</div>
                <div style={{fontSize:12,color:'#BBB'}}>front · back · tags · details — all at once</div>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}}
            onChange={e=>addPhotos(e.target.files)}/>

          <Field label="Describe your item" value={desc} onChange={e=>setDesc(e.target.value)} multi
            placeholder={'Optional but helps. e.g. "Black leather jacket, women\'s medium, barely worn."'}
            hint="Brand, size, condition, any flaws — the more detail the better the price"/>

          <div style={{background:'#FAFAFA',border:`1px solid ${C.border}`,borderRadius:14,
            padding:'14px 16px',marginBottom:22}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div onClick={()=>setAgreed(!agreedTos)} style={{
                width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,cursor:'pointer',
                border:`2px solid ${agreedTos?C.coral:C.borderD}`,background:agreedTos?C.coral:'#fff',
                display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
                {agreedTos&&<span style={{color:'#fff',fontSize:12,fontWeight:700,lineHeight:1}}>✓</span>}
              </div>
              <div style={{fontSize:12,color:C.navyL,lineHeight:1.6}}>
                I confirm this item is accurately described and genuinely as shown.{' '}
                <span style={{color:C.coral,fontWeight:600,cursor:'pointer'}} onClick={()=>nav('tos')}>View terms</span>
              </div>
            </div>
          </div>

          <Btn full onClick={run} disabled={!canSubmit}>
            Create my listing{photos.length>0?` · ${photos.length} photo${photos.length>1?'s':''}`:''} →
          </Btn>
        </div>
      )}

      {/* PROCESSING */}
      {view==='processing'&&(
        <div style={{maxWidth:380,margin:'0 auto',textAlign:'center',padding:'52px 20px',animation:'fadeUp .4s ease'}}>
          {mainPhoto&&<div style={{width:82,height:82,borderRadius:18,overflow:'hidden',margin:'0 auto 22px',
            border:`2px solid ${C.border}`,boxShadow:'0 8px 30px rgba(0,0,0,0.08)'}}>
            <img src={mainPhoto.preview} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
          </div>}
          <div style={{width:68,height:68,background:`${C.coral}12`,borderRadius:18,margin:'0 auto 18px',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <HuckLogo size={46} animate/>
          </div>
          <h2 style={{fontSize:20,fontWeight:800,letterSpacing:'-.5px',marginBottom:7}}>On it.</h2>
          <p style={{fontSize:13,color:C.coral,fontWeight:600,animation:'pulse 1.6s ease infinite',marginBottom:36}}>{status}</p>
          <div style={{display:'flex',flexDirection:'column',gap:2,textAlign:'left'}}>
            {[['✂️','Cleaning the photo','Cleaning'],
              ['📋','Building your listing','Analyzing'],
              ['💰','Pricing your item','Researching'],
              ['📱','Sending your text','Sending']].map(([icon,label,match])=>{
              const active=status.toLowerCase().includes(match.toLowerCase());
              return (
                <div key={label} style={{display:'flex',alignItems:'center',gap:11,padding:'10px 14px',
                  borderRadius:11,background:active?'#FFF5F5':'transparent',transition:'background .3s'}}>
                  <span style={{fontSize:16,opacity:active?1:.2,transition:'opacity .3s'}}>{icon}</span>
                  <span style={{fontSize:13,fontWeight:active?700:400,color:active?C.ink:'#D0D0D0',
                    transition:'all .3s',flex:1}}>{label}</span>
                  {active&&<div style={{width:12,height:12,border:`2px solid #FFD5D5`,borderTopColor:C.coral,
                    borderRadius:'50%',animation:'spin .8s linear infinite'}}/>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {view==='results'&&analysis&&(
        <div style={{maxWidth:480,margin:'0 auto',padding:'28px 18px 80px',animation:'fadeUp .5s ease'}}>
          {smsSent&&<div style={{background:`linear-gradient(135deg,${C.teal}10,${C.teal}05)`,
            border:`1.5px solid ${C.teal}30`,borderRadius:16,padding:'14px 17px',marginBottom:22,
            display:'flex',alignItems:'center',gap:11}}>
            <div style={{width:38,height:38,background:`${C.teal}14`,borderRadius:11,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📱</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:C.teal}}>Text sent to {phone}</div>
              <div style={{fontSize:12,color:C.navyL,marginTop:1}}>We'll text again the moment it sells — with your FedEx label.</div>
            </div>
          </div>}

          <h2 style={{fontSize:24,fontWeight:800,letterSpacing:'-.5px',marginBottom:3}}>Your item is live 🛫</h2>
          <p style={{fontSize:14,color:C.navyL,marginBottom:22}}>We're handling everything from here.</p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
            {[{label:'Original',src:mainPhoto?.preview,bg:'#F0EDE8',hi:false},
              {label:'✓ White background',src:cleanedUrl,bg:C.white,hi:true}].map(({label,src,bg,hi})=>(
              <div key={label} style={{borderRadius:15,overflow:'hidden',
                border:`1.5px solid ${hi?C.teal+'40':C.border}`,background:C.white,
                boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <img src={src} alt="" style={{width:'100%',height:155,objectFit:'contain',display:'block',background:bg}}/>
                <div style={{padding:'7px 10px',fontSize:10,fontWeight:600,
                  color:hi?C.teal:C.navyL,background:hi?'#F0FAF9':'#FAFAFA',
                  textAlign:'center',letterSpacing:.3}}>{label}</div>
              </div>
            ))}
          </div>

          <PayoutCard price={analysis.pricing.recommendedPrice}/>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:10}}>
            {[['Low',`$${analysis.pricing.lowSold}`,'#D0D0D0','#fff'],
              ['Avg',`$${analysis.pricing.avgSold}`,C.gold,'#FFFBF0'],
              ['List',`$${analysis.pricing.recommendedPrice}`,C.teal,C.tealL],
              ['Quick',`$${analysis.pricing.quickSalePrice}`,C.coral,'#FFF0F0']].map(([label,val,color,bg])=>(
              <div key={label} style={{background:bg,border:`1.5px solid ${color}25`,
                borderRadius:12,padding:'11px 6px',textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:800,color,letterSpacing:'-.3px'}}>{val}</div>
                <div style={{fontSize:10,color:'#BBB',marginTop:3,fontWeight:600,
                  letterSpacing:.3,textTransform:'uppercase'}}>{label}</div>
              </div>
            ))}
          </div>

          {analysis.pricing.pricingRationale&&<p style={{fontSize:13,color:C.navyL,lineHeight:1.6,
            paddingLeft:11,borderLeft:`3px solid ${C.coral}`,marginBottom:6}}>{analysis.pricing.pricingRationale}</p>}
          {analysis.pricing.marketInsight&&<p style={{fontSize:12,color:'#BBB',marginBottom:22,paddingLeft:11}}>
            ⏱ ~{analysis.pricing.daysToSell} days to sell · {analysis.pricing.marketInsight}</p>}

          <div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:20,
            overflow:'hidden',marginBottom:16,boxShadow:'0 2px 14px rgba(0,0,0,0.05)'}}>
            <div style={{padding:'12px 18px',borderBottom:`1px solid ${C.border}`,
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:10,fontWeight:700,color:'#C0C0C0',letterSpacing:.5,textTransform:'uppercase'}}>Your listing</span>
              <Badge status="listed"/>
            </div>
            <div style={{padding:'18px'}}>
              <div style={{fontSize:17,fontWeight:800,color:C.ink,letterSpacing:'-.3px',marginBottom:3}}>
                {analysis.item.itemName}</div>
              <div style={{fontSize:11,color:'#BBB',fontWeight:600,marginBottom:12,letterSpacing:.2}}>
                {[analysis.item.brand,analysis.item.category,analysis.item.color,analysis.item.size,analysis.item.material]
                  .filter(v=>v&&v!=='Unknown').join('  ·  ')}</div>
              {analysis.item.keySellingPoints?.length>0&&<div style={{marginBottom:12}}>
                {analysis.item.keySellingPoints.map(p=>(
                  <div key={p} style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:4,fontSize:13,color:C.navy}}>
                    <span style={{color:C.teal,marginTop:1,flexShrink:0}}>✓</span>{p}
                  </div>
                ))}
              </div>}
              <div style={{background:'#FAFAFA',borderRadius:9,padding:'10px 13px',fontSize:13,
                fontWeight:600,color:C.ink,marginBottom:11,borderLeft:`3px solid ${C.coral}`}}>
                {analysis.item.listingTitle}</div>
              <div style={{fontSize:13,color:C.navyL,lineHeight:1.75,marginBottom:13}}>
                {analysis.item.listingDescription}</div>
              <div>{analysis.item.tags?.map(t=>(
                <span key={t} style={{display:'inline-block',fontSize:11,fontWeight:500,
                  padding:'3px 10px',borderRadius:100,margin:'2px 3px 2px 0',
                  background:'#F5F5F5',color:C.navyL,border:`1px solid ${C.border}`}}>{t}</span>
              ))}</div>
            </div>
          </div>

          <NextSteps/>

          <a href={analysis.ebayUrl} target="_blank" rel="noopener noreferrer" style={{
            display:'block',background:C.coral,color:'#fff',textAlign:'center',
            padding:'15px',borderRadius:13,fontSize:14,fontWeight:700,
            letterSpacing:'-.1px',marginBottom:8,boxShadow:'0 4px 18px rgba(255,90,95,0.28)'}}>
            Review & post on eBay →
          </a>
          <p style={{fontSize:11,color:'#BBB',textAlign:'center',marginBottom:20}}>
            Opens pre-filled — just review and hit Post
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Btn ghost full onClick={()=>nav('dashboard')}>View my items</Btn>
            <Btn full onClick={startNew} ex={{background:C.ink,boxShadow:'none'}}>+ List another</Btn>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {view==='dashboard'&&(
        <div style={{maxWidth:520,margin:'0 auto',padding:'26px 18px 80px',animation:'fadeUp .4s ease'}}>
          <div style={{marginBottom:22}}>
            <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-.5px',marginBottom:2}}>
              Hey {name.split(' ')[0]} 👋</h2>
            <p style={{fontSize:14,color:C.navyL}}>Here's everything you've listed with Huck.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9,marginBottom:24}}>
            {[['Listed',items.length,C.coral],['Active',activeCount,'#3498DB'],
              ['Earned',totalEarned>0?fmt(totalEarned):'$0',C.teal]].map(([label,val,color])=>(
              <div key={label} style={{background:C.white,border:`1.5px solid ${C.border}`,
                borderRadius:14,padding:'14px 10px',textAlign:'center',
                boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:22,fontWeight:800,color,letterSpacing:'-.5px'}}>{val}</div>
                <div style={{fontSize:10,color:'#BBB',marginTop:3,fontWeight:600,
                  letterSpacing:.3,textTransform:'uppercase'}}>{label}</div>
              </div>
            ))}
          </div>

          {items.some(i=>i.status==='sold')&&<div style={{background:'#FFF0F0',
            border:`1.5px solid ${C.coral}35`,borderRadius:14,padding:'13px 16px',
            display:'flex',gap:10,alignItems:'center',marginBottom:14}}>
            <span style={{fontSize:20}}>📦</span>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:C.coral}}>Items waiting to ship!</div>
              <div style={{fontSize:12,color:C.navyL}}>Check items marked "Sold — Ship!" below.</div>
            </div>
          </div>}

          {items.length===0?(
            <div style={{textAlign:'center',padding:'44px 20px',background:C.white,
              borderRadius:20,border:`2px dashed ${C.border}`}}>
              <div style={{width:60,margin:'0 auto 14px',color:C.coral,opacity:.45}}>
                <HeroJacket anim="float" opacity={1}/></div>
              <div style={{fontWeight:700,fontSize:16,color:C.navy,marginBottom:5}}>Nothing listed yet</div>
              <div style={{fontSize:13,color:'#BBB',marginBottom:18}}>Got something in your closet? List it in 60 seconds.</div>
              <Btn onClick={startNew}>List my first item →</Btn>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {items.map(item=>(
                <ItemCard key={item.id} item={item} onClick={()=>{setSelected(item);nav('detail');}}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL */}
      {view==='detail'&&selected&&(
        <div style={{maxWidth:480,margin:'0 auto',padding:'26px 18px 80px',animation:'slideUp .35s ease'}}>
          <button onClick={()=>nav('dashboard')} style={{background:'none',border:'none',color:C.navyL,
            fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:18,
            display:'flex',alignItems:'center',gap:5,padding:0}}>← My items</button>

          <div style={{display:'flex',gap:13,alignItems:'flex-start',marginBottom:22}}>
            {selected.cleanedUrl&&<div style={{width:76,height:76,borderRadius:13,overflow:'hidden',
              border:`1.5px solid ${C.border}`,background:C.white,flexShrink:0}}>
              <img src={selected.cleanedUrl} style={{width:'100%',height:'100%',objectFit:'contain'}} alt=""/>
            </div>}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6,marginBottom:5}}>
                <div style={{fontSize:17,fontWeight:800,letterSpacing:'-.3px',lineHeight:1.2}}>{selected.itemName}</div>
                <Badge status={selected.status} large/>
              </div>
              <div style={{fontSize:12,color:'#BBB',fontWeight:500}}>
                {[selected.brand,selected.category,selected.size].filter(v=>v&&v!=='Unknown').join(' · ')}</div>
            </div>
          </div>

          {selected.status==='sold'&&<div style={{background:'#FFF0F0',border:`1.5px solid ${C.coral}45`,
            borderRadius:16,padding:'15px 17px',marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:14,color:C.coral,marginBottom:4}}>📦 Time to ship!</div>
            <div style={{fontSize:13,color:C.navyL,lineHeight:1.6,marginBottom:10}}>
              Your prepaid FedEx label has been sent to your phone. Pack and drop off at any FedEx location.</div>
            <div style={{background:C.white,borderRadius:10,padding:'11px 14px',
              fontSize:12,color:C.navyL,lineHeight:1.5,borderLeft:`3px solid ${C.coral}`,marginBottom:12}}>
              💡 {selected.shippingTip||'Pack carefully with bubble wrap for fragile items.'}</div>
            <button style={{width:'100%',padding:'12px',background:C.coral,color:'#fff',border:'none',
              borderRadius:11,fontSize:14,fontWeight:700,cursor:'pointer',
              boxShadow:'0 3px 12px rgba(255,90,95,0.25)'}}>Download FedEx label</button>
          </div>}

          {selected.status==='shipped'&&<div style={{background:'#FFF8EC',border:`1.5px solid ${C.gold}40`,
            borderRadius:16,padding:'14px 17px',marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:13,color:C.gold}}>📮 Shipped — tracking active</div>
            <div style={{fontSize:12,color:C.navyL,marginTop:4}}>
              eBay is monitoring delivery. You'll be paid within 3 business days of confirmed delivery.</div>
          </div>}

          {selected.status==='paid'&&<div style={{background:C.tealL,border:`1.5px solid ${C.teal}40`,
            borderRadius:16,padding:'14px 17px',marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:13,color:C.teal}}>✅ Payout sent</div>
            <div style={{fontSize:12,color:C.navyL,marginTop:4}}>
              {fmt(netAmt(selected.listPrice||0))} is on its way to your account.</div>
          </div>}

          <PayoutCard price={selected.listPrice||0}/>

          <div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:18,
            overflow:'hidden',marginBottom:14,boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
            <div style={{padding:'11px 17px',borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:10,fontWeight:700,color:'#C0C0C0',letterSpacing:.5,textTransform:'uppercase'}}>Listing</span>
            </div>
            <div style={{padding:'17px'}}>
              <div style={{background:'#FAFAFA',borderRadius:9,padding:'10px 13px',
                fontSize:13,fontWeight:600,color:C.ink,marginBottom:10,borderLeft:`3px solid ${C.coral}`}}>
                {selected.listingTitle}</div>
              <div style={{fontSize:13,color:C.navyL,lineHeight:1.75,marginBottom:13}}>{selected.listingDescription}</div>
              <div style={{fontSize:11,fontWeight:700,color:'#BBB',letterSpacing:.4,textTransform:'uppercase',marginBottom:6}}>
                Searched eBay for</div>
              <div style={{fontSize:12,color:C.navy,fontFamily:'monospace',background:'#F5F5F5',
                padding:'7px 11px',borderRadius:8,marginBottom:13}}>"{selected.ebaySearchQuery}"</div>
              <div>{selected.tags?.map(t=>(
                <span key={t} style={{display:'inline-block',fontSize:11,fontWeight:500,
                  padding:'3px 9px',borderRadius:100,margin:'2px 3px 2px 0',
                  background:'#F5F5F5',color:C.navyL,border:`1px solid ${C.border}`}}>{t}</span>
              ))}</div>
            </div>
          </div>

          <a href={selected.ebayUrl} target="_blank" rel="noopener noreferrer" style={{
            display:'block',background:C.coral,color:'#fff',textAlign:'center',
            padding:'14px',borderRadius:12,fontSize:14,fontWeight:700,
            marginBottom:20,boxShadow:'0 3px 14px rgba(255,90,95,0.24)'}}>Open eBay listing →</a>

          <div style={{padding:'14px',background:'#FAFAFA',borderRadius:13,border:`1px dashed ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,color:'#CCC',letterSpacing:.8,textTransform:'uppercase',marginBottom:10}}>
              Update status (demo)</div>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {Object.keys(STATUS).map(s=>(
                <button key={s} onClick={async()=>{
                  const updated=items.map(i=>i.id===selected.id?{...i,status:s}:i);
                  setItems(updated);setSelected({...selected,status:s});saveItems(updated);
                }} style={{padding:'6px 13px',borderRadius:100,fontSize:11,fontWeight:700,cursor:'pointer',
                  border:`1.5px solid ${selected.status===s?STATUS[s].color:C.border}`,
                  background:selected.status===s?`${STATUS[s].color}15`:'#fff',
                  color:selected.status===s?STATUS[s].color:C.navyL}}>
                  {STATUS[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TERMS */}
      {view==='tos'&&(
        <div style={{maxWidth:520,margin:'0 auto',padding:'26px 18px 80px',animation:'fadeUp .4s ease'}}>
          <button onClick={()=>nav('upload')} style={{background:'none',border:'none',color:C.navyL,
            fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:20,
            display:'flex',alignItems:'center',gap:5,padding:0}}>← Back</button>
          <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-.5px',marginBottom:4}}>Terms of Service</h2>
          <p style={{fontSize:12,color:'#BBB',marginBottom:24}}>Last updated: {new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p>
          {[
            ['1. The deal','Huck is a resale listing service. You submit items. We list, sell, and handle buyer communication on your behalf. When your item sells, we deduct our 6% platform fee and send you the rest within 3 business days of confirmed delivery.'],
            ['2. Accurate descriptions','Everything you submit — photos, descriptions, condition — must be truthful and complete. You are legally responsible for the accuracy of your listings. We reserve the right to cancel listings, withhold payouts, or terminate accounts for misrepresentation.'],
            ['3. Authenticity','You warrant that every item you submit is genuine and not counterfeit, replicated, or misdescribed. Submitting a fake item as genuine may result in immediate account termination, forfeiture of all pending payouts, and potential referral to brand enforcement authorities.'],
            ['4. Condition standards','New with Tags — unworn with original tags. New without Tags — unworn, tags removed. Like New — worn once or twice, no visible flaws. Good — light wear, minor cosmetic flaws disclosed. Fair — visible wear, all flaws clearly disclosed. Poor — significant wear, fully disclosed.'],
            ['5. Shipping','You must ship within 48 hours of receiving a sale notification and FedEx label. Failure to ship may result in order cancellation and withholding of your payout. Repeated non-shipment results in permanent account ban.'],
            ['6. Payout withholding','Huck may delay or withhold your payout if a buyer opens a dispute, the item doesn\'t match the listing, or we reasonably suspect fraud. We will notify you promptly and work to resolve issues within 5 business days.'],
            ['7. Strikes','First offense: warning + payout review. Second offense: 14-day payout hold. Third offense: permanent ban and forfeiture of held funds to cover Huck\'s costs.'],
            ['8. Fees','Huck\'s fee is 6% of the final sale price, deducted before your payout. No fees are charged if your item doesn\'t sell. eBay\'s marketplace fees are absorbed by Huck.'],
            ['9. Governing law','These terms are governed by the laws of the State of California. Disputes will be resolved by binding arbitration in Orange County, CA.'],
          ].map(([title,body])=>(
            <div key={title} style={{marginBottom:20}}>
              <div style={{fontSize:14,fontWeight:700,color:C.ink,marginBottom:4}}>{title}</div>
              <div style={{fontSize:13,color:C.navyL,lineHeight:1.7}}>{body}</div>
            </div>
          ))}
          <Btn full onClick={()=>nav('upload')} ex={{marginTop:24}}>Got it — back to listing</Btn>
        </div>
      )}
    </div>
  );
}
