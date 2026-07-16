type Format = "CSV" | "PDF" | "XLSX" | "URL";
type Source = {
  id: string;
  datasetId: string;
  resourceId: string;
  category: string;
  title: string;
  datasetUrl: string;
  resourceUrl: string;
  format: Format;
  modified: string;
  discovered: boolean;
};

type CkanResource = { id?: string; url?: string; format?: string; name?: string; last_modified?: string; created?: string };
type CkanDataset = {
  id?: string;
  name?: string;
  title?: string;
  metadata_modified?: string;
  organization?: { title?: string; name?: string };
  resources?: CkanResource[];
};

const CATALOG_URL = "https://data.go.th/api/3/action/package_search?q=%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B8%99&rows=1000";
const MAX_ROWS_PER_RESOURCE = 5_000;

const pinned: Source[] = [
  { id:"tourism", datasetId:"62-65", resourceId:"43e922a2-9bd2-4acf-bc9b-ba75bcc49a34", category:"tourism", title:"สถิติจำนวนนักท่องเที่ยวจังหวัดน่าน", datasetUrl:"https://www.data.go.th/dataset/62-65", resourceUrl:"https://nan.gdcatalog.go.th/dataset/d1621f21-b809-4993-8c4a-b7fb1384f9b0/resource/43e922a2-9bd2-4acf-bc9b-ba75bcc49a34/download/untitled.csv", format:"CSV", modified:"2026-05-25", discovered:false },
  { id:"attractions", datasetId:"nan", resourceId:"244f0bb0-9b01-4be8-8510-04eb84b038e9", category:"attraction", title:"แหล่งท่องเที่ยวจังหวัดน่าน ปี 2567", datasetUrl:"https://www.data.go.th/dataset/nan", resourceUrl:"https://nan.gdcatalog.go.th/dataset/e7d4269b-0459-417f-9fe4-b521390e83ad/resource/244f0bb0-9b01-4be8-8510-04eb84b038e9/download/-2567.csv", format:"CSV", modified:"2025-07-25", discovered:false },
  { id:"stays", datasetId:"25675", resourceId:"3eab14c7-60e8-4b92-9de0-26c4a305e8c2", category:"accommodation", title:"สถานพักแรมจังหวัดน่าน ปี 2567", datasetUrl:"https://www.data.go.th/dataset/25675", resourceUrl:"https://nan.gdcatalog.go.th/dataset/da9aea10-6ebe-49bc-81ed-5fefded39032/resource/3eab14c7-60e8-4b92-9de0-26c4a305e8c2/download/-25671.csv", format:"CSV", modified:"2025-07-25", discovered:false },
  { id:"restaurants", datasetId:"nan-1-2567", resourceId:"e20f012b-50a2-46c3-84f9-a2983cb172fd", category:"food", title:"ร้านอาหารจังหวัดน่าน ปี 2567", datasetUrl:"https://www.data.go.th/dataset/nan-1-2567", resourceUrl:"https://nan.gdcatalog.go.th/dataset/509c99b9-1200-421e-8b88-2456c3014210/resource/e20f012b-50a2-46c3-84f9-a2983cb172fd/download/-2567.csv", format:"CSV", modified:"2025-07-25", discovered:false },
  { id:"transport", datasetId:"dataset_99_015", resourceId:"44028694-a6e6-48c0-98df-5a16f1ae438f", category:"transport", title:"รถโดยสารจังหวัดน่าน", datasetUrl:"https://www.data.go.th/dataset/dataset_99_015", resourceUrl:"https://nan.gdcatalog.go.th/dataset/899b16de-9d2e-4b80-a4e6-53d5048b287f/resource/44028694-a6e6-48c0-98df-5a16f1ae438f/download/dataset_99_01.csv", format:"CSV", modified:"2026-05-25", discovered:false },
  { id:"products", datasetId:"dataset_40_20", resourceId:"ddb95bcd-44c9-4c21-bfad-fa6045b30498", category:"local-business", title:"จำนวนใบรับรองมาตรฐานผลิตภัณฑ์ชุมชน (มผช.)", datasetUrl:"https://www.data.go.th/dataset/dataset_40_20", resourceUrl:"https://nan.gdcatalog.go.th/dataset/e6268901-dd56-46a0-8ecf-f9e1f1d41728/resource/ddb95bcd-44c9-4c21-bfad-fa6045b30498/download/untitled.csv", format:"CSV", modified:"2026-05-25", discovered:false },
];

function clean(value: unknown) { return String(value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim(); }
function normalizeUrl(value: string) { try { const url = new URL(value); url.hash=""; return url.toString().replace(/\/$/, "").toLowerCase(); } catch { return value.trim().toLowerCase(); } }
function categoryFor(title: string) {
  if (/นักท่องเที่ยว|ท่องเที่ยว|ผู้เยี่ยมเยือน/.test(title)) return "tourism";
  if (/เทศกาล|ประเพณี|วัฒนธรรม|ปฏิทิน/.test(title)) return "culture";
  if (/แหล่งท่องเที่ยว|สถานที่ท่องเที่ยว/.test(title)) return "attraction";
  if (/โรงแรม|ที่พัก|สถานพักแรม|โฮมสเตย์/.test(title)) return "accommodation";
  if (/อาหาร|ร้านอาหาร/.test(title)) return "food";
  if (/รถ|ขนส่ง|คมนาคม|เดินทาง/.test(title)) return "transport";
  if (/ฝน|อุณหภูมิ|อากาศ|ความชื้น|หมอกควัน|PM2\.5/i.test(title)) return "weather";
  if (/ภัย|เสี่ยง|เตือนภัย|มลพิษ|ขยะ|ป่าไม้/.test(title)) return "safety";
  if (/ประชากร|ผู้สูงอายุ|เด็ก|พิการ/.test(title)) return "inclusion";
  if (/ผลิตภัณฑ์|ชุมชน|รายได้|เศรษฐกิจ|ร้านค้า/.test(title)) return "local-business";
  return "official-context";
}

function isNanDataset(dataset: CkanDataset) {
  const title = clean(dataset.title);
  const organization = clean(dataset.organization?.title || dataset.organization?.name);
  if (/น่านน้ำ/.test(title)) return false;
  return organization === "สำนักงานจังหวัดน่าน" || /จังหวัดน่าน|จ\.น่าน|\bNan\b/i.test(title);
}

function asFormat(resource: CkanResource): Format | null {
  const value = clean(resource.format || resource.url?.split(".").at(-1)).toUpperCase();
  if (value.includes("CSV")) return "CSV";
  if (value.includes("XLSX") || value.includes("XLS")) return "XLSX";
  if (value.includes("PDF")) return "PDF";
  if (value === "URL" || value === "HTML") return "URL";
  return null;
}

function sourceFrom(dataset: CkanDataset, resource: CkanResource): Source | null {
  const format = asFormat(resource), resourceUrl = clean(resource.url), resourceId = clean(resource.id);
  const datasetId = clean(dataset.name || dataset.id);
  if (!format || !resourceUrl || !resourceId || !datasetId) return null;
  return {
    id: `catalog:${datasetId}:${resourceId}`,
    datasetId,
    resourceId,
    category: categoryFor(clean(dataset.title)),
    title: clean(dataset.title),
    datasetUrl: `https://www.data.go.th/dataset/${encodeURIComponent(datasetId)}`,
    resourceUrl,
    format,
    modified: clean(resource.last_modified || dataset.metadata_modified || resource.created).slice(0, 10),
    discovered: true,
  };
}

function decode(buffer: ArrayBuffer) {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  return (utf8.match(/�/g) ?? []).length > 3 ? new TextDecoder("windows-874").decode(buffer) : utf8;
}

function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i=0; i<text.length; i++) {
    const char=text[i], next=text[i+1];
    if (char==='"' && quoted && next==='"') { cell+='"'; i++; }
    else if (char==='"') quoted=!quoted;
    else if (char===',' && !quoted) { row.push(clean(cell)); cell=""; }
    else if ((char==='\n' || char==='\r') && !quoted) { if (char==='\r' && next==='\n') i++; row.push(clean(cell)); if (row.some(Boolean)) rows.push(row); row=[]; cell=""; }
    else cell+=char;
  }
  if (cell || row.length) { row.push(clean(cell)); if (row.some(Boolean)) rows.push(row); }
  const headers=(rows.shift() ?? []).map((value,index)=>clean(value.replace(/^\uFEFF/,"")) || `column_${index+1}`);
  return rows.slice(0, MAX_ROWS_PER_RESOURCE).map(values=>Object.fromEntries(headers.map((header,index)=>[header,clean(values[index])]))).filter(record=>Object.values(record).some(Boolean));
}

function recordKey(record: Record<string,string>) {
  return Object.entries(record).filter(([,value])=>value).map(([key,value])=>`${clean(key).toLowerCase()}=${clean(value).toLowerCase()}`).sort().join("|");
}

function semanticRecordKey(category: string, record: Record<string,string>) {
  const entries=Object.entries(record).filter(([,value])=>value);
  const find=(patterns:RegExp[])=>clean(entries.find(([key])=>patterns.some(pattern=>pattern.test(key)))?.[1]).toLowerCase();
  const name=find([/^ชื่อ/,/สถานที่/,/สถานประกอบการ/,/รายการ/]);
  const district=find([/อำเภอ|เขต/]);
  const year=find([/^ปี$|พ\.ศ\.|ปีงบประมาณ/]);
  const month=find([/^เดือน$|เดือนที่/]);
  // Entity registers often publish the same place in several datasets with different columns.
  // Name + district is the stable identity; statistical rows also include their time grain.
  if(name) return `${category}|${name}|${district}|${year}|${month}`;
  return `${category}|${recordKey(record)}`;
}

function uniqueSources(items: Source[]) {
  const seenResource = new Set<string>(), seenUrl = new Set<string>();
  return items.filter(source => {
    const url = normalizeUrl(source.resourceUrl);
    if (seenResource.has(source.resourceId) || seenUrl.has(url)) return false;
    seenResource.add(source.resourceId); seenUrl.add(url); return true;
  });
}

async function discoverSources() {
  const response = await fetch(CATALOG_URL, { headers:{Accept:"application/json"}, next:{revalidate:1800} });
  if (!response.ok) throw new Error(`catalog:${response.status}`);
  const body = await response.json() as { success?:boolean; result?:{results?:CkanDataset[]} };
  if (!body.success) throw new Error("catalog:invalid-response");
  const datasets=(body.result?.results ?? []).filter(isNanDataset);
  const discovered=datasets.flatMap(dataset=>(dataset.resources ?? []).map(resource=>sourceFrom(dataset,resource)).filter((item):item is Source=>Boolean(item)));
  return { rawMatches:body.result?.results?.length ?? 0, datasets:datasets.length, sources:discovered };
}

async function fetchCsv(source: Source) {
  const response=await fetch(source.resourceUrl,{headers:{Accept:"text/csv,*/*"},next:{revalidate:1800}});
  if(!response.ok) throw new Error(`${source.id}:${response.status}`);
  return parseCsv(decode(await response.arrayBuffer()));
}

export async function GET() {
  let catalog:Awaited<ReturnType<typeof discoverSources>>={rawMatches:0,datasets:0,sources:[]};
  const errors:string[]=[];
  try { catalog=await discoverSources(); } catch(error) { errors.push(error instanceof Error?error.message:"catalog:unavailable"); }

  // Pinned aliases preserve the product contract. Catalog resources are then added only once.
  const sources=uniqueSources([...pinned,...catalog.sources]);
  const csvSources=sources.filter(source=>source.format==="CSV");
  const settled=await Promise.allSettled(csvSources.map(async source=>({source,records:await fetchCsv(source)})));
  const collections:Record<string,Record<string,string>[]>={};
  const allRecords:{sourceId:string;datasetId:string;category:string;title:string;record:Record<string,string>}[]=[];
  let duplicateRecordsRemoved=0;
  const globalSeen=new Set<string>();

  settled.forEach((result,index)=>{
    if(result.status==="rejected") { errors.push(`${csvSources[index].id}:${String(result.reason)}`); return; }
    const localSeen=new Set<string>();
    const records=result.value.records.filter(record=>{const key=recordKey(record);if(!key||localSeen.has(key)){duplicateRecordsRemoved++;return false;}localSeen.add(key);return true;});
    collections[result.value.source.id]=records;
    for(const record of records){
      const key=semanticRecordKey(result.value.source.category,record);
      if(globalSeen.has(key)){duplicateRecordsRemoved++;continue;}
      globalSeen.add(key);
      allRecords.push({sourceId:result.value.source.id,datasetId:result.value.source.datasetId,category:result.value.source.category,title:result.value.source.title,record});
    }
  });

  const required=["tourism","attractions","stays","restaurants","transport"];
  const connected=required.every(id=>collections[id]?.length);
  const sourceStatus=new Map(settled.map((result,index)=>[csvSources[index].id,result.status]));
  return Response.json({
    status:connected?"connected":"partial", province:"น่าน",
    policy:"Official Nan data · automatic catalog discovery · duplicate-safe",
    fetchedAt:new Date().toISOString(),
    catalog:{url:CATALOG_URL,rawMatches:catalog.rawMatches,nanDatasets:catalog.datasets,uniqueResources:sources.length,newResources:sources.filter(source=>source.discovered).length,duplicateResourcesRemoved:pinned.length+catalog.sources.length-sources.length,duplicateRecordsRemoved},
    sources:sources.map(source=>({...source,recordCount:collections[source.id]?.length??null,status:source.format!=="CSV"?"reference":sourceStatus.get(source.id)==="fulfilled"?"connected":"unavailable"})),
    data:collections, officialRecords:allRecords, errors,
    decisionGate:{status:"insufficient",reason:"ข้อมูลทางการใช้เป็นฐานอ้างอิงและบริบทได้ แต่การตัดสินใจรายวันยังต้องมี Community Need, Capacity และ Density ที่ยืนยันล่าสุด"}
  },{status:connected?200:206,headers:{"Cache-Control":"public, max-age=900, s-maxage=1800, stale-while-revalidate=86400"}});
}
