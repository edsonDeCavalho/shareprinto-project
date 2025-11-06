import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In a real implementation, this would be a database
const pendingOffers = new Map<string, any[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: { farmerId: string } }
) {
  try {
    const { farmerId } = params;
    
    console.log(`🔍 Checking for offers for farmer: ${farmerId}`);
    console.log(`📊 Current pending offers map:`, Array.from(pendingOffers.entries()));
    
    // Get pending offers for this farmer
    const farmerOffers = pendingOffers.get(farmerId) || [];
    
    console.log(`📨 Found ${farmerOffers.length} offers for farmer ${farmerId}:`, farmerOffers);
    
    // If there are offers, clear them after returning (to prevent duplicate popups)
    if (farmerOffers.length > 0) {
      console.log(`🧹 Clearing ${farmerOffers.length} offers for farmer ${farmerId} after retrieval`);
      pendingOffers.set(farmerId, []);
    }
    
    return NextResponse.json(farmerOffers);
    
  } catch (error) {
    console.error('❌ Error fetching offers for farmer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { farmerId: string } }
) {
  try {
    const { farmerId } = params;
    const offerData = await request.json();
    
    console.log(`📤 Adding offer for farmer ${farmerId}:`, offerData);
    
    // Add offer to farmer's pending offers
    const farmerOffers = pendingOffers.get(farmerId) || [];
    const newOffer = {
      ...offerData,
      farmerId,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    farmerOffers.push(newOffer);
    pendingOffers.set(farmerId, farmerOffers);
    
    console.log(`✅ Offer added for farmer ${farmerId}. Total offers: ${farmerOffers.length}`);
    console.log(`📋 All offers for farmer ${farmerId}:`, farmerOffers);
    
    return NextResponse.json({
      success: true,
      message: 'Offer added successfully',
      offerCount: farmerOffers.length,
      offer: newOffer
    });
    
  } catch (error) {
    console.error('❌ Error adding offer for farmer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { farmerId: string } }
) {
  try {
    const { farmerId } = params;
    const { orderId } = await request.json();
    
    console.log(`🗑️ Removing offer ${orderId} for farmer ${farmerId}`);
    
    // Remove the specific offer
    const farmerOffers = pendingOffers.get(farmerId) || [];
    const updatedOffers = farmerOffers.filter(offer => offer.orderId !== orderId);
    pendingOffers.set(farmerId, updatedOffers);
    
    console.log(`✅ Offer removed for farmer ${farmerId}. Remaining offers: ${updatedOffers.length}`);
    
    return NextResponse.json({
      success: true,
      message: 'Offer removed successfully',
      offerCount: updatedOffers.length
    });
    
  } catch (error) {
    console.error('❌ Error removing offer for farmer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

