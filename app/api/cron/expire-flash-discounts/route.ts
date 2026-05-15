import { NextResponse } from 'next/server';
import { deactivateExpiredDiscounts } from '@/lib/data';

// Vercel Cron: runs every 15 minutes to deactivate expired flash discounts
// See vercel.json for schedule configuration

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await deactivateExpiredDiscounts();
    return NextResponse.json({
      success: true,
      expired: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Flash discount expiry error:', error);
    return NextResponse.json(
      { error: 'Failed to expire discounts' },
      { status: 500 }
    );
  }
}
