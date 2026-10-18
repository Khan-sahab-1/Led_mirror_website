import {NextResponse} from 'next/server';import {clearAdminCookie} from '@/lib/admin-auth';export async function POST(){const r=NextResponse.json({ok:true});clearAdminCookie(r);return r;}
