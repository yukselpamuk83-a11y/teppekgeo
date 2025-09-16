
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET: Fetch specific listing
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try to find in job listings
    let listing = await prisma.jobListing.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true, companyName: true } } }
    });

    if (listing) {
      return NextResponse.json({
        success: true,
        listing: {
          ...listing,
          type: 'job',
          userName: listing.user.firstName && listing.user.lastName 
            ? `${listing.user.firstName} ${listing.user.lastName}`
            : listing.user.companyName || 'Anonim'
        }
      });
    }

    // Try to find in CV listings
    const cvListing = await prisma.cvListing.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true } } }
    });

    if (cvListing) {
      return NextResponse.json({
        success: true,
        listing: {
          ...cvListing,
          type: 'cv',
          userName: cvListing.user.firstName && cvListing.user.lastName 
            ? `${cvListing.user.firstName} ${cvListing.user.lastName}`
            : 'Anonim'
        }
      });
    }

    // Try to find in Gold listings
    const goldListing = await prisma.goldListing.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true, companyName: true } } }
    });

    if (goldListing) {
      return NextResponse.json({
        success: true,
        listing: {
          ...goldListing,
          type: 'gold',
          userName: goldListing.user.firstName && goldListing.user.lastName 
            ? `${goldListing.user.firstName} ${goldListing.user.lastName}`
            : goldListing.user.companyName || 'Anonim'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'İlan bulunamadı' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json(
      { success: false, error: 'İlan yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT: Update listing
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { type, ...updateData } = body;

    let updatedListing;

    if (type === 'job') {
      // Check ownership
      const existing = await prisma.jobListing.findUnique({ where: { id } });
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Bu ilanı düzenleme yetkiniz yok' },
          { status: 403 }
        );
      }

      updatedListing = await prisma.jobListing.update({
        where: { id },
        data: updateData
      });
    } else if (type === 'cv') {
      const existing = await prisma.cvListing.findUnique({ where: { id } });
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Bu ilanı düzenleme yetkiniz yok' },
          { status: 403 }
        );
      }

      updatedListing = await prisma.cvListing.update({
        where: { id },
        data: updateData
      });
    } else if (type === 'gold') {
      const existing = await prisma.goldListing.findUnique({ where: { id } });
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Bu ilanı düzenleme yetkiniz yok' },
          { status: 403 }
        );
      }

      updatedListing = await prisma.goldListing.update({
        where: { id },
        data: updateData
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ilan türü' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: 'İlan başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { success: false, error: 'İlan güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE: Delete listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'job') {
      const existing = await prisma.jobListing.findUnique({ where: { id } });
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Bu ilanı silme yetkiniz yok' },
          { status: 403 }
        );
      }

      await prisma.jobListing.delete({ where: { id } });
    } else if (type === 'cv') {
      const existing = await prisma.cvListing.findUnique({ where: { id } });
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Bu ilanı silme yetkiniz yok' },
          { status: 403 }
        );
      }

      await prisma.cvListing.delete({ where: { id } });
    } else if (type === 'gold') {
      const existing = await prisma.goldListing.findUnique({ where: { id } });
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Bu ilanı silme yetkiniz yok' },
          { status: 403 }
        );
      }

      await prisma.goldListing.delete({ where: { id } });
    } else {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ilan türü' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'İlan başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { success: false, error: 'İlan silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
