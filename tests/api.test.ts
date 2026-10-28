import test from 'node:test';
import assert from 'node:assert/strict';
// Opt in against an isolated local server: see README. No real marketplace requests are made.
const base=process.env.TEST_BASE_URL;
test('local API authentication, validation, versioning and manual approval (no marketplace calls)',{skip:!base},async()=>{
 const origin=base!; let cookie='';
 async function request(action:string,extra:Record<string,unknown>={},headers:Record<string,string>={}){const r=await fetch(origin+'/api',{method:'POST',headers:{'content-type':'application/json',origin,cookie,...headers},body:JSON.stringify({action,...extra})});return {r,body:await r.json()}}
 let result=await request('saveDraft',{});assert.equal(result.r.status,401);
 result=await request('login',{password:'wrong'});assert.equal(result.r.status,401);
 result=await request('login',{password:process.env.TEST_PASSWORD});assert.equal(result.r.status,200);cookie=result.r.headers.get('set-cookie')!.split(';')[0];
 result=await request('saveDraft',{}, {origin:'https://evil.example'});assert.equal(result.r.status,403);
 result=await request('saveDraft',{value:{title:''}});assert.equal(result.r.status,400);
 const draft={title:'TEST ONLY: Integration draft',marketplace:'Fiverr',description:'TEST description',packages:'TEST Basic USD 100',requirements:'TEST brief',faq:'TEST FAQ',tags:'test',portfolio:'test only'};
 result=await request('saveDraft',{value:draft});assert.equal(result.r.status,200);const row=result.body.drafts.find((d:{content:{title:string}})=>d.content.title===draft.title);assert.ok(row);
 const original=result.body.versions.find((v:{draft_id:number})=>v.draft_id===row.id);result=await request('approve',{id:row.id,versionId:original.id});assert.equal(result.r.status,200);assert.ok(result.body.approvals.some((a:{version_id:number})=>a.version_id===original.id));
 result=await request('saveDraft',{id:row.id,value:{...draft,title:'TEST ONLY: changed'}});const current=result.body.versions.find((v:{draft_id:number})=>v.draft_id===row.id);assert.notEqual(current.id,original.id);assert.equal(result.body.approvals.some((a:{version_id:number})=>a.version_id===current.id),false);result=await request('approve',{id:row.id,versionId:original.id});assert.equal(result.r.status,400);
 result=await request('restore',{id:original.id});assert.equal(result.r.status,200);assert.equal(result.body.drafts.find((d:{id:number})=>d.id===row.id).content.title,draft.title);
 result=await request('generate',{idea:'Build a custom automation',marketplace:'Fiverr'});assert.notEqual(result.r.status,200);assert.match(result.body.error,/Ollama|model/i);
 result=await request('logout');assert.equal(result.r.status,200);
});
