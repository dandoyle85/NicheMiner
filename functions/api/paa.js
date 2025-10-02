export async function onRequestGet(context){
  const { request }=context; const url=new URL(request.url);
  const q=url.searchParams.get("q")||"";
  if(!q) return json({error:"Missing q"},400);
  try{
    const res=await fetch(`https://www.google.com/search?q=${encodeURIComponent(q)}`,{headers:{"User-Agent":"Mozilla/5.0"}});
    const html=await res.text();
    const block=html.toLowerCase().indexOf("people also ask");
    let questions=[];
    if(block!==-1){
      const slice=html.slice(block,block+20000);
      const regex=/>[^<>?]{3,100}\?</g;
      let m;while((m=regex.exec(slice))!==null){const s=m[0].slice(1,-1).trim();if(s.endsWith("?"))questions.push(s);if(questions.length>=20)break;}
    }
    return json({q,questions:[...new Set(questions)]});
  }catch(e){return json({q,error:e.message},500);}
}
function json(b,s=200){return new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json","access-control-allow-origin":"*"}})}
