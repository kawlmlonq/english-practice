import fs from 'node:fs';
const base=new URL('./',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,base),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
const vocab=read('vocabulary.txt').map(line=>{const[level,word,meaning,q]=line.split('|');return {level,word,meaning,q}});
const pos={};
// Exclude potentially interchangeable vocabulary from distractor choices.
const groups=[['assessment','evaluation','estimate','forecast','research','survey'],['constraint','obstacle','challenge','risk','disadvantage'],['implication','consequence','result'],['priority','purpose','initiative','commitment','responsibility','accountability'],['skill','knowledge','experience','qualification'],['suggestion','recommendation','decision','solution'],['quality','reliability','accuracy','consistency','efficiency','flexibility'],['income','salary','budget','expense'],['distribution','allocation'],['resource','capacity','quantity','proportion'],['adequate','sufficient','substantial','significant','crucial','valid','relevant'],['conservation','sustainability','biodiversity','environment','wildlife'],['benefit','advantage','opportunity'],['beautiful','clean','fresh'],['happy','excited','surprised','friendly','polite'],['nervous','sad','tired','hungry','thirsty'],['dangerous','careful','healthy','comfortable'],['improve','develop','repair','replace'],['support','encourage','provide','require'],['consider','decide','choose','suggest','explain'],['leave','arrive','cancel','prepare']];
const nounsA1=new Set('apple bread water milk egg rice cheese coffee banana orange carrot potato sugar salt kitchen bedroom bathroom garden window door chair table clock mirror towel teacher student doctor nurse driver farmer sister brother daughter son friend school hospital supermarket library station airport beach park mountain river'.split(' '));
const verbsA2=new Set('boil fry slice stir improve explain invite decide promise borrow lend repair replace cancel collect prepare arrive leave choose'.split(' '));
const adjectivesA2=new Set('healthy delicious fresh spicy comfortable crowded polite friendly nervous excited surprised boring dangerous careful'.split(' '));
const verbsB1=new Set('afford achieve avoid consider encourage manage prevent reduce require support suggest depend involve provide develop'.split(' '));
const verbsB2=new Set('evaluate implement allocate justify acknowledge distinguish'.split(' '));
const adjectivesB2=new Set('valid relevant adequate sufficient significant substantial potential inevitable reluctant ambiguous consistent comprehensive crucial sustainable'.split(' '));
for(const v of vocab)pos[v.level+v.word]=v.level==='A1'?(nounsA1.has(v.word)?'noun':'adjective'):v.level==='A2'?(verbsA2.has(v.word)?'verb':adjectivesA2.has(v.word)?'adjective':'noun'):v.level==='B1'?(verbsB1.has(v.word)?'verb':'noun'):(verbsB2.has(v.word)?'verb':adjectivesB2.has(v.word)?'adjective':'noun');
const questionBank=[];
const referenceBasis={
 A1:{vocabulary:'CEFR Companion Volume 2020 descriptors; Cambridge A2 Key vocabulary list used as a lower-level lexical reference',grammar:'CEFR Companion Volume 2020 descriptors; English Grammar Profile-informed progression'},
 A2:{vocabulary:'Cambridge English A2 Key vocabulary list (August 2025); CEFR Companion Volume 2020',grammar:'CEFR Companion Volume 2020 descriptors; English Grammar Profile-informed progression'},
 B1:{vocabulary:'Cambridge English B1 Preliminary vocabulary list (August 2025); CEFR Companion Volume 2020',grammar:'CEFR Companion Volume 2020 descriptors; English Grammar Profile-informed progression'},
 B2:{vocabulary:'CEFR Companion Volume 2020; English Profile research; Cambridge B2 First Use of English specifications (no official B2 vocabulary list)',grammar:'CEFR Companion Volume 2020 descriptors; English Grammar Profile-informed progression'}
};
const cefrFocus={
 A1:{vocabulary:'basic concrete words in familiar personal and everyday contexts',grammar:'basic sentence patterns, be/do, articles, pronouns, time and place expressions'},
 A2:{vocabulary:'routine transactions, travel, work and daily-life language',grammar:'past and future reference, comparison, quantity, obligation and common verb patterns'},
 B1:{vocabulary:'familiar work, study and social topics with simple reasons and explanations',grammar:'hypothetical meaning, passive, reported/embedded questions, relative clauses and cohesion'},
 B2:{vocabulary:'less concrete topics, precise distinctions and formal or semi-formal contexts',grammar:'complex conditionals, inversion, deduction, causative, participle clauses and nuanced modality'}
};
for(const [i,v] of vocab.entries()){
 const blocked=new Set(groups.filter(g=>g.includes(v.word)).flat());blocked.add(v.word);
 const candidates=vocab.filter(x=>x.level===v.level&&pos[x.level+x.word]===pos[v.level+v.word]&&!blocked.has(x.word));
 if(candidates.length<3)throw Error('Insufficient distractors '+v.word);
 // Spread deterministic choices through the level rather than adjacent, related words.
 const options=[v.word];let j=(i*17)%candidates.length;while(options.length<4){const w=candidates[j%candidates.length].word;if(!options.includes(w))options.push(w);j++}
 questionBank.push({id:'v2-v-'+v.level+'-'+v.word,level:v.level,kind:'vocabulary',topic:'情境單字',word:v.word,meaning:v.meaning,q:v.q,options,answer:v.word,explanation:`${v.word}：${v.meaning}。完整句：${v.q.replace('___',v.word).replace(/ \./g,'.')}`,distractors:options.slice(1).map(w=>({word:w,meaning:vocab.find(x=>x.level===v.level&&x.word===w).meaning}))});
}
for(const item of questionBank.filter(q=>q.kind==='vocabulary')){item.sourceBasis=referenceBasis[item.level].vocabulary;item.cefrFocus=cefrFocus[item.level].vocabulary}
for(const [i,line] of read('grammar.txt').entries()){
 const[level,topic,answer,b,c,d,explanation,stems]=line.split('|');
 const qs=stems.split('~');if(qs.length!==5)throw Error('Need five stems '+topic);
 qs.forEach((q,j)=>questionBank.push({id:`v2-g-${level}-${String(i).padStart(2,'0')}-${j}`,level,kind:'grammar',topic,q,options:[answer,b,c,d],answer,explanation}));
}
for(const item of questionBank.filter(q=>q.kind==='grammar')){item.sourceBasis=referenceBasis[item.level].grammar;item.cefrFocus=cefrFocus[item.level].grammar}
for(const l of ['A1','A2','B1','B2']){const qs=questionBank.filter(q=>q.level===l);if(qs.length!==125)throw Error(l+': '+qs.length);if(qs.filter(q=>q.kind==='vocabulary').length!==65)throw Error('Vocab count '+l)}
if(questionBank.length!==500)throw Error('Expected 500');
fs.writeFileSync(new URL('dist/questions.js',base),'// Original practice content aligned to CEFR reference materials; item difficulty still requires pilot calibration.\nconst bank = '+JSON.stringify(questionBank,null,2)+';\n','utf8');
console.log(JSON.stringify({total:questionBank.length,levels:['A1','A2','B1','B2'].map(level=>({level,grammar:questionBank.filter(q=>q.level===level&&q.kind==='grammar').length,vocabulary:questionBank.filter(q=>q.level===level&&q.kind==='vocabulary').length}))}));

