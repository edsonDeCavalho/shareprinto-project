import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const offerData = await request.json();
    
    console.log('🚫 DEPRECATED: Parallel dispatch blocked - redirecting to sequential system');
    console.log('📤 Received offer data:', offerData);
    
    const {
      orderId,
      description,
      materialType,
      typeOfPrinting,
      estimatedTime,
      cost,
      city,
      numberOfPrints,
      instructions,
      creatorName,
      farmerIds
    } = offerData;

    console.log(`🚫 Blocking parallel dispatch to ${farmerIds?.length || 0} farmers - using sequential instead`);

    // Instead of parallel dispatch, use the sequential offer system
    const sequentialOfferData = {
      orderId,
      description: description || '3D Printing Order',
      materialType: materialType || 'PLA',
      typeOfPrinting: typeOfPrinting || 'FDM',
      estimatedTime: parseInt(estimatedTime?.toString() || '120'),
      cost: parseFloat(cost?.toString() || '50'),
      city: city || 'Paris',
      numberOfPrints: parseInt(numberOfPrints?.toString() || '1'),
      instructions: instructions || '',
      creatorName: creatorName || 'Creator'
    };

    console.log('🎯 Redirecting to sequential offer system:', sequentialOfferData);

    // Call the sequential offer service instead
    const dispatcherUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
    const response = await fetch(`${dispatcherUrl}/api/sequential-offers/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sequentialOfferData),
    });

    if (!response.ok) {
      throw new Error(`Sequential offer service failed: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: `Order sent via sequential dispatch system instead of parallel`,
      sequentialResult: result,
      note: 'This endpoint now uses sequential dispatch instead of parallel dispatch'
    });

  } catch (error) {
    console.error('❌ Error redirecting to sequential system:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process via sequential system', details: error.message },
      { status: 500 }
    );
  }
}

// Send offer to a farmer using the same dispatcher service as admin platform
async function sendOfferToFarmer(farmerId: string, offerDetails: any): Promise<boolean> {
  try {
    console.log(`🎯 Sending offer to farmer ${farmerId} via dispatcher service:`, offerDetails);
    
    // Use the same dispatcher service URL as admin platform
    const dispatcherUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
    
    // Send offer via dispatcher service (same as admin platform)
    const response = await fetch(`${dispatcherUrl}/api/user-status/send-test-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        farmerId: farmerId, // Use the farmer's ID for the backend
        offerData: {
          orderId: offerDetails.orderId,
          description: offerDetails.description,
          materialType: offerDetails.materialType,
          typeOfPrinting: offerDetails.typeOfPrinting,
          estimatedTime: offerDetails.estimatedTime,
          cost: offerDetails.cost,
          city: offerDetails.city,
          numberOfPrints: offerDetails.numberOfPrints,
          instructions: offerDetails.instructions,
          creatorName: offerDetails.creatorName
        }
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log(`✅ Offer sent successfully to farmer ${farmerId} via dispatcher`);
        return true;
      } else {
        console.error(`❌ Dispatcher failed to send offer to farmer ${farmerId}:`, result.error);
        return false;
      }
    } else {
      console.error(`❌ Failed to send offer to farmer ${farmerId}:`, response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error sending offer to farmer ${farmerId}:`, error);
    return false;
  }
}
