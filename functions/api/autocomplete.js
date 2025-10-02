export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const src = (url.searchParams.get("src")||"").toLowerCase();
  const q = url.searchParams.get("q")||"";
  if(!src||!q) return json({error:"Missing src or q"},400);

  const endpoints={
    google:`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`,
    youtube:`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`,
    amazon:`https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${encodeURIComponent(q)}`,
    walmart:`https://www.walmart.com/typeahead/v3/complete?term=${encodeURIComponent(q)}&max_results=10`,
    etsy:`https://www.etsy.com/suggestions?q=${encodeURIComponent(q)}`,
    pinterest:`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(q)}&data=%7B%22options%22:%7B%22query%22:%22${encodeURIComponent(q)}%22%7D%7D`
  };
  const target=endpoints[src];
  if(!target) return json({error:"Unknown src"},400);
  try{
    const res=await fetch(target,{headers:{"User-Agent":"Mozilla/5.0"}});
    let suggestions=[];
    if(src==="google"||src==="youtube"){
      const d=await res.json(); suggestions=d[1]||[];
    }else if(src==="amazon"){const d=await res.json();suggestions=(d.suggestions||[]).map(x=>x.value);}
    else if(src==="walmart"){const d=await res.json();suggestions=(d.queries||[]).map(x=>x.term);}
    else if(src==="etsy"){const d=await res.json();suggestions=(d.result||[]).map(x=>x.text);}
    else if(src==="pinterest"){const t=await res.text();const m=t.match(/"query":"(.*?)"/g)||[];suggestions=m.map(s=>s.replace(/^"query":"|"+$/g,""));}
    return json({src,q,suggestions});
  }catch(e){return json({src,q,error:e.message},500);}
}
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","access-control-allow-origin":"*"}})}
