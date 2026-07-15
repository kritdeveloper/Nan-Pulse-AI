type Source = { id:string; category:string; title:string; datasetUrl:string; resourceUrl:string; format:"CSV"|"PDF"; modified:string };

const sources:Source[] = [
  { id:"tourism", category:"tourism", title:"สถิติจำนวนนักท่องเที่ยวจังหวัดน่าน", datasetUrl:"https://www.data.go.th/dataset/62-65", resourceUrl:"https://nan.gdcatalog.go.th/dataset/d1621f21-b809-4993-8c4a-b7fb1384f9b0/resource/43e922a2-9bd2-4acf-bc9b-ba75bcc49a34/download/untitled.csv", format:"CSV", modified:"2026-05-25" },
  { id:"attractions", category:"attraction", title:"แหล่งท่องเที่ยวจังหวัดน่าน ปี 2567", datasetUrl:"https://www.data.go.th/dataset/nan", resourceUrl:"https://nan.gdcatalog.go.th/dataset/e7d4269b-0459-417f-9fe4-b521390e83ad/resource/244f0bb0-9b01-4be8-8510-04eb84b038e9/download/-2567.csv", format:"CSV", modified:"2025-07-25" },
  { id:"stays", category:"accommodation", title:"สถานพักแรมจังหวัดน่าน ปี 2567", datasetUrl:"https://www.data.go.th/dataset/25675", resourceUrl:"https://nan.gdcatalog.go.th/dataset/da9aea10-6ebe-49bc-81ed-5fefded39032/resource/3eab14c7-60e8-4b92-9de0-26c4a305e8c2/download/-25671.csv", format:"CSV", modified:"2025-07-25" },
  { id:"restaurants", category:"food", title:"ร้านอาหารจังหวัดน่าน ปี 2567", datasetUrl:"https://www.data.go.th/dataset/nan-1-2567", resourceUrl:"https://nan.gdcatalog.go.th/dataset/509c99b9-1200-421e-8b88-2456c3014210/resource/e20f012b-50a2-46c3-84f9-a2983cb172fd/download/-2567.csv", format:"CSV", modified:"2025-07-25" },
  { id:"transport", category:"transport", title:"รถโดยสารจังหวัดน่าน", datasetUrl:"https://www.data.go.th/dataset/dataset_99_015", resourceUrl:"https://nan.gdcatalog.go.th/dataset/899b16de-9d2e-4b80-a4e6-53d5048b287f/resource/44028694-a6e6-48c0-98df-5a16f1ae438f/download/dataset_99_01.csv", format:"CSV", modified:"2026-05-25" },
  { id:"products", category:"local-business", title:"จำนวนใบรับรองมาตรฐานผลิตภัณฑ์ชุมชน (มผช.)", datasetUrl:"https://www.data.go.th/dataset/dataset_40_20", resourceUrl:"https://nan.gdcatalog.go.th/dataset/e6268901-dd56-46a0-8ecf-f9e1f1d41728/resource/ddb95bcd-44c9-4c21-bfad-fa6045b30498/download/untitled.csv", format:"CSV", modified:"2026-05-25" },
  { id:"calendar", category:"culture", title:"ปฏิทินการท่องเที่ยวประจำปีของจังหวัดน่าน (ททท.น่าน)", datasetUrl:"https://www.data.go.th/dataset/dataset_40_041", resourceUrl:"https://nan.gdcatalog.go.th/dataset/d894f4e9-3322-47b3-b6c8-3d512e1bd22d/resource/81d66d46-676a-4e2f-97c8-90fc886ca33b/download/dataset_40_04.pdf", format:"PDF", modified:"2024-08-26" },
  { id:"registered-restaurants", category:"food", title:"รายชื่อร้านอาหารที่จดทะเบียนโดยท้องถิ่นจังหวัดน่าน", datasetUrl:"https://www.data.go.th/dataset/dataset_40_34", resourceUrl:"https://nan.gdcatalog.go.th/dataset/21eca43d-212a-4b6b-9685-dc3c781e10c3/resource/d9722ea7-dc52-4a75-b8e9-199e597d3386/download/dataset_40_34-.pdf", format:"PDF", modified:"2026-04-25" },
  { id:"rental", category:"transport", title:"ผู้ให้บริการรถเช่า", datasetUrl:"https://www.data.go.th/dataset/dataset_40_35", resourceUrl:"https://nan.gdcatalog.go.th/dataset/5598a3a1-f189-46f1-a8e6-88ab3524b13b/resource/1ef7a529-6d34-4a5f-97ba-b3f70cc07c21/download/dataset_40_35-.pdf", format:"PDF", modified:"2026-04-25" },
];

function decode(buffer:ArrayBuffer) {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  const broken = (utf8.match(/�/g) ?? []).length;
  return broken > 3 ? new TextDecoder("windows-874").decode(buffer) : utf8;
}

function parseCsv(text:string) {
  const rows:string[][] = [];
  let row:string[] = [], cell = "", quoted = false;
  for (let i=0;i<text.length;i++) {
    const char=text[i], next=text[i+1];
    if (char==='"' && quoted && next==='"') { cell+='"'; i++; }
    else if (char==='"') quoted=!quoted;
    else if (char===',' && !quoted) { row.push(cell.trim()); cell=""; }
    else if ((char==='\n' || char==='\r') && !quoted) { if (char==='\r' && next==='\n') i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row=[]; cell=""; }
    else cell+=char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  const headers=(rows.shift() ?? []).map(value=>value.replace(/^\uFEFF/,"").trim());
  return rows.map(values=>Object.fromEntries(headers.map((header,index)=>[header,values[index] ?? ""]))).filter(record=>Object.values(record).some(Boolean));
}

export async function GET() {
  const csvSources=sources.filter(source=>source.format==="CSV");
  const settled=await Promise.allSettled(csvSources.map(async source=>{
    const response=await fetch(source.resourceUrl,{headers:{Accept:"text/csv,*/*"}});
    if(!response.ok) throw new Error(`${source.id}:${response.status}`);
    return {source,records:parseCsv(decode(await response.arrayBuffer()))};
  }));
  const collections:Record<string,Record<string,string>[]>={};
  const errors:string[]=[];
  settled.forEach((result,index)=>{ if(result.status==="fulfilled") collections[result.value.source.id]=result.value.records; else errors.push(`${csvSources[index].id}:${result.reason}`); });
  const required=["tourism","attractions","stays","restaurants","transport"];
  const connected=required.every(id=>collections[id]?.length);
  return Response.json({
    status:connected?"connected":"partial",
    province:"น่าน",
    policy:"Official data only · No mock values",
    fetchedAt:new Date().toISOString(),
    sources:sources.map(source=>({...source,recordCount:collections[source.id]?.length ?? null,status:source.format==="PDF"?"reference":collections[source.id]?.length?"connected":"unavailable"})),
    data:collections,
    errors,
    decisionGate:{status:"insufficient",reason:"data.go.th provides official inventory and historical statistics, but does not provide current community capacity, current visitor density by community, or verified community need. Automated campaign execution is disabled."}
  },{status:connected?200:206,headers:{"Cache-Control":"public, max-age=1800, s-maxage=21600"}});
}
