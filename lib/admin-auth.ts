import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
const COOKIE='gs_admin_session';
function secret(){const s=process.env.ADMIN_API_SECRET;if(!s||s.length<32)throw new Error('ADMIN_API_SECRET must be at least 32 characters');return s;}
function sign(payload:string){return crypto.createHmac('sha256',secret()).update(payload).digest('hex');}
export function createAdminToken(){const payload=Buffer.from(JSON.stringify({role:'admin',exp:Math.floor(Date.now()/1000)+43200})).toString('base64url');return `${payload}.${sign(payload)}`;}
function verify(token:string){try{const [p,s]=token.split('.');if(!p||!s)return false;const a=Buffer.from(sign(p),'hex'),b=Buffer.from(s,'hex');if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;const data=JSON.parse(Buffer.from(p,'base64url').toString());return data.role==='admin'&&data.exp>Math.floor(Date.now()/1000);}catch{return false;}}
export async function isAdmin(){const c=await cookies();const t=c.get(COOKIE)?.value;return !!t&&verify(t);}
export function setAdminCookie(r:NextResponse,t:string){r.cookies.set(COOKIE,t,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:43200});}
export function clearAdminCookie(r:NextResponse){r.cookies.set(COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});}
