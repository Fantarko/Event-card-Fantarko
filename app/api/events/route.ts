import { NextRequest,NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/database/event.model";
import { v2 as clouddinary } from 'cloudinary';
import { rejects } from "assert";
import { Tags } from "lucide-react";

export async function POST(req: NextRequest){
    try{
        await connectToDatabase();

        const formData = await req.formData();

        let event;

        try{
            event = Object.fromEntries(formData.entries());
        }catch(e){
            return NextResponse.json({message:'Invalid event data',error:e instanceof Error?e.message:'Unknown error'}, {status:400})
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({message:'Image file is required'}, {status:400})

            let tags = JSON.parse(formData.get('tags') as string); 
            let agenda = JSON.parse(formData.get('agenda') as string); 
            

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

       const uploadResult = await new Promise((resolve,reject)=>{
        clouddinary.uploader.upload_stream({resource_type:'image',folder:'Dev'},(error,result)=>{
            if(error) return reject(error);
            resolve(result);
        }).end(buffer);
       })
 // 1. ดึง URL จาก Cloudinary
const secureUrl = (uploadResult as { secure_url: string }).secure_url;

// 2. แตกตัวแปรเดิมออกมา แล้วระบุ 'image' ใหม่ให้เป็น String URL
// วิธีนี้เป็นการบังคับเขียนทับ (Override) ค่าที่เป็น File ทิ้งไป 100%
const finalEventData = {
  ...event,
  image: secureUrl, // ตัวนี้สำคัญที่สุด ต้องชื่อ 'image' ตาม Schema
  
  // แปลง Tags และ Agenda ให้เป็น Array (ป้องกัน Error อื่นที่จะตามมา)
  tags: typeof event.tags === 'string' ? (event.tags as string).split(',').map(t => t.trim()) : event.tags,
  agenda: typeof event.agenda === 'string' ? (event.agenda as string).split(',').map(a => a.trim()) : event.agenda,
};

// 3. ส่ง finalEventData (ที่เป็น String URL แล้ว) เข้าไปสร้าง Event
// ✅ แก้จากเดิมที่ส่ง ...event (ซึ่งมี image เป็น File Object) 
// ✅ เปลี่ยนมาส่งข้อมูลที่จัดระเบียบแล้วแทน

const createdEvent = await Event.create({
    ...event,        // ข้อมูลอื่นๆ เช่น title, description
    image: secureUrl, // ต้องระบุเป็น String URL ที่ได้จาก Cloudinary
    tags: tags,       // ใช้ตัวแปรที่ JSON.parse มาแล้ว
    agenda: agenda,   // ใช้ตัวแปรที่ JSON.parse มาแล้ว
});


        return NextResponse.json({message:'Event created successfully',event:createdEvent}, {status:201})
    }catch(e){
        console.error(e);
        return NextResponse.json({message:'Event creation failed',error:e instanceof Error?e.message:'Unknown error'}, {status:500})
    }
}
export async function GET(){
    try{
        await connectToDatabase();
        const events = await Event.find().sort({createdAt:-1});

        return NextResponse.json({events}, {status:200})
    }catch(e){
        console.error(e);
        return NextResponse.json({message:'Failed to fetch events',error:e instanceof Error?e.message:'Unknown error'}, {status:500})
    }
}

// โค้ดที่คุณเขียนคือการสร้าง **API Route** ใน Next.js (App Router) เพื่อทำหน้าที่เป็น Backend ในการรับข้อมูล "กิจกรรม" (Event) พร้อมรูปภาพ แล้วนำไปเก็บไว้ที่ Cloudinary และ MongoDB ครับ

// นี่คือคำอธิบายเจาะลึกแต่ละส่วนเพื่อความเข้าใจที่ชัดเจนครับ:

// ---

// ## 1. การนำเข้าโมดูล (Imports)
// * **`NextRequest, NextResponse`**: ใช้จัดการคำขอ (Request) และการตอบกลับ (Response) ตามมาตรฐานของ Next.js
// * **`connectToDatabase`**: ฟังก์ชันสำหรับเชื่อมต่อกับ MongoDB (ต้องแน่ใจว่าเชื่อมต่อสำเร็จก่อน Query ข้อมูล)
// * **`Event`**: Model ของ Mongoose ที่กำหนดโครงสร้างข้อมูล (Schema) ของกิจกรรม
// * **`v2 as clouddinary`**: เรียกใช้ SDK ของ Cloudinary เพื่ออัปโหลดรูปภาพขึ้นระบบ Cloud

// ---

// ## 2. ฟังก์ชัน POST (การสร้างข้อมูลใหม่)
// ใช้เมื่อผู้ใช้งานกรอกฟอร์มหน้าเว็บและกด "บันทึก" เพื่อส่งข้อมูลมาที่เซิร์ฟเวอร์

// ### ขั้นตอนการเตรียมข้อมูล
// * **`await connectToDatabase()`**: เริ่มการเชื่อมต่อ Database
// * **`req.formData()`**: อ่านข้อมูลที่ส่งมาจาก Frontend ในรูปแบบ `FormData` (ใช้เมื่อมีการส่งไฟล์ เช่น รูปภาพ)
// * **`Object.fromEntries(formData.entries())`**: แปลงข้อมูลจาก FormData ที่อ่านยาก ให้กลายเป็น Object `{ key: value }` ปกติเพื่อให้จัดการง่ายขึ้น

// ### ขั้นตอนการจัดการไฟล์รูปภาพ

// * **`formData.get('image')`**: ดึงไฟล์จากช่องที่ชื่อว่า `image`
// * **`file.arrayBuffer()` และ `Buffer.from(...)`**: แปลงไฟล์ดิบให้เป็น `Buffer` (รูปแบบข้อมูลที่ Node.js ใช้ในการอ่าน/เขียนไฟล์)
// * **`new Promise(...)`**: เนื่องจาก Cloudinary ตัวนี้ทำงานแบบ Callback (สมัยเก่า) เราจึงต้องครอบด้วย Promise เพื่อให้ใช้ `await` ได้
// * **`clouddinary.uploader.upload_stream`**: ส่งข้อมูลภาพ (Buffer) ขึ้นไปที่ Cloudinary โดยเก็บไว้ในโฟลเดอร์ชื่อ `Dev`

// ### ขั้นตอนการจัดรูปแบบข้อมูล (Data Transformation)
// * **`secureUrl`**: คือ URL ของรูปภาพหลังจากอัปโหลดเสร็จ (เช่น `https://res.cloudinary.com/...`)
// * **`...event`**: เป็นการใช้ Spread Operator เพื่อคัดลอกข้อมูลทั้งหมดที่ผู้ใช้ส่งมา (ชื่อ, วันที่, รายละเอียด)
// * **`image: secureUrl`**: เขียนทับฟิลด์ `image` เดิม (ซึ่งเดิมเป็นก้อนไฟล์) ให้กลายเป็น "ลิ้งค์รูปภาพ" แทน
// * **`tags` และ `agenda`**: เช็คว่าถ้าข้อมูลส่งมาเป็น String (เช่น "Music, Art") ให้ใช้ `.split(',')` เพื่อตัดแบ่งให้กลายเป็น Array `['Music', 'Art']` เพื่อให้ตรงกับ Schema ของฐานข้อมูล

// ### การบันทึกผล
// * **`Event.create(finalEventData)`**: นำข้อมูลที่จัดเตรียมเสร็จสรรพ บันทึกลงใน MongoDB
// * **`NextResponse.json(..., {status: 201})`**: ส่งผลลัพธ์กลับไปบอก Frontend ว่า "สร้างสำเร็จแล้วนะ!"

// ---

// ## 3. ฟังก์ชัน GET (การดึงข้อมูล)
// ใช้เมื่อต้องการแสดงรายการกิจกรรมทั้งหมดบนหน้าเว็บไซต์

// * **`Event.find()`**: คำสั่งของ Mongoose เพื่อดึงข้อมูลทั้งหมดจาก Collection
// * **`.sort({createdAt: -1})`**: สั่งให้เรียงลำดับตามวันที่สร้าง โดยเอา **"อันใหม่ล่าสุด"** ขึ้นก่อน
// * **`NextResponse.json({events})`**: ส่งข้อมูล Array ของกิจกรรมทั้งหมดกลับไปให้หน้าบ้าน

// ---

// ## ข้อแนะนำเพิ่มเติม (Pro-Tips)
// 1.  **ตัวสะกด**: ในโค้ดคุณ import มาเป็น `clouddinary` (มี d สองตัว) อย่าลืมตรวจสอบให้ตรงกันตลอดทั้งไฟล์นะครับ (ปกติจะสะกดว่า `cloudinary`)
// 2.  **การล้างข้อมูล**: บรรทัด `import { rejects } from "assert";` ไม่ได้ถูกใช้งาน สามารถลบทิ้งได้ครับ
// 3.  **ความปลอดภัย**: อย่าลืมตั้งค่า Environment Variables (API Key ของ Cloudinary และ MongoDB URI) ในไฟล์ `.env.local` ด้วยนะครับ



// มีส่วนไหนที่อยากให้เจาะลึกเป็นพิเศษไหมครับ เช่น การทำงานของ `Promise` หรือการจัดการ `Buffer`?