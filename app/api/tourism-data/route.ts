const DATASET_ID = "trend_domestic_tourists";
const RESOURCE_URL = "https://ckan.mots.go.th/dataset/05595bfe-92c7-49bb-a9b1-4d3516a5d99c/resource/b73f38c0-b87a-4ac2-9ba7-f18a114b1a24/download/trend-domistic-tourists.json";

type TourismRecord = {
  YearInfo:number;
  MonthInfo:number;
  Province:string;
  CityType:string;
  InternalAmount:number;
  InternalIncome:number;
  ForeignerInternalAmount:number;
  ForeignersinternalIncome:number;
  RoomRate:number;
  OR:number;
  ORTotal:number;
};

export async function GET() {
  try {
    const [metadataResponse, resourceResponse] = await Promise.all([
      fetch(`https://www.data.go.th/api/3/action/package_show?id=${DATASET_ID}`, { headers:{ Accept:"application/json" } }),
      fetch(RESOURCE_URL, { headers:{ Accept:"application/json" } }),
    ]);
    if (!metadataResponse.ok || !resourceResponse.ok) throw new Error(`Official source unavailable: metadata ${metadataResponse.status}, resource ${resourceResponse.status}`);
    const metadata = await metadataResponse.json();
    const records = await resourceResponse.json() as TourismRecord[];
    const nanRecords = records.filter(record => record.Province === "น่าน").sort((a,b) => a.YearInfo - b.YearInfo || a.MonthInfo - b.MonthInfo);
    if (!nanRecords.length) throw new Error("Nan records were not found in the official resource");
    return Response.json({
      status:"connected",
      source:"data.go.th · สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา",
      datasetId:metadata.result?.id,
      datasetTitle:metadata.result?.title,
      metadataModified:metadata.result?.metadata_modified,
      resourceUpdated:metadata.result?.resources?.[0]?.resource_last_updated_date,
      latest:nanRecords.at(-1),
      recent:nanRecords.slice(-12),
      recordCount:nanRecords.length,
      datasetUrl:"https://www.data.go.th/dataset/trend_domestic_tourists",
    }, { headers:{ "Cache-Control":"public, max-age=3600, s-maxage=21600", "Access-Control-Allow-Origin":"*" } });
  } catch (error) {
    return Response.json({ status:"error", message:error instanceof Error ? error.message : "Unknown official data error", datasetUrl:"https://www.data.go.th/dataset/trend_domestic_tourists" }, { status:502, headers:{ "Cache-Control":"no-store" } });
  }
}
