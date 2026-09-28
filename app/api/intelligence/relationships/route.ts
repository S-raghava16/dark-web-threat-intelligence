import { NextResponse } from "next/server";

import {generateRelationships}
from "@/lib/intelligence/relationship-engine";


export async function GET(){

 const relationships =
 await generateRelationships();


 return NextResponse.json({
   relationships
 });

}