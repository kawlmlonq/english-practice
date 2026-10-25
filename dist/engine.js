const LEVELS=['A1','A2','B1','B2'];
function shuffled(list,rng=Math.random){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function selectRound(questions,seen,round=0,level='all',kind='all',rng=Math.random){
 const used=new Set(seen),selected=[];
 function take(pool,n){const fresh=shuffled(pool.filter(q=>!used.has(q.id)),rng);const old=shuffled(pool.filter(q=>used.has(q.id)),rng);selected.push(...fresh.concat(old).slice(0,n))}
 if(level==='all'&&kind==='all'){
  LEVELS.forEach((l,i)=>{take(questions.filter(q=>q.level===l&&q.kind==='grammar'),6);const extra=(i-(round%2)*2+4)%4<2;take(questions.filter(q=>q.level===l&&q.kind==='vocabulary'),extra?7:6)})
 }else{
  const levels=level==='all'?LEVELS:[level];
  levels.forEach((l,i)=>{
   const n=level==='all'?12+((i-(round%2)*2+4)%4<2?1:0):50;
   if(kind==='all'){const grammarN=Math.floor(n/2);take(questions.filter(q=>q.level===l&&q.kind==='grammar'),grammarN);take(questions.filter(q=>q.level===l&&q.kind==='vocabulary'),n-grammarN)}
   else take(questions.filter(q=>q.level===l&&q.kind===kind),n)
  });
 }
 return shuffled(selected,rng);
}

