import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false),
  customSlug: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional()
});

const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false),
  customSlug: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createNoteSchema.parse(body);
    
    // 检查自定义slug是否已被使用
    if (validatedData.customSlug) {
      const existingNote = await prisma.note.findUnique({
        where: { customSlug: validatedData.customSlug }
      });
      
      if (existingNote) {
        return NextResponse.json(
          { error: 'Custom URL is already taken' },
          { status: 409 }
        );
      }
    }
    
    const shareToken = validatedData.isPublic ? nanoid(10) : null;
    const customSlug = validatedData.isPublic && validatedData.customSlug 
      ? validatedData.customSlug 
      : null;
    
    const note = await prisma.note.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        language: validatedData.language,
        isPublic: validatedData.isPublic,
        shareToken,
        customSlug
      }
    });
    
    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateNoteSchema.parse(body);
    
    const existingNote = await prisma.note.findUnique({
      where: { id: validatedData.id }
    });
    
    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    // 检查自定义slug是否已被其他笔记使用
    if (validatedData.customSlug && validatedData.customSlug !== existingNote.customSlug) {
      const slugTaken = await prisma.note.findUnique({
        where: { customSlug: validatedData.customSlug }
      });
      
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Custom URL is already taken' },
          { status: 409 }
        );
      }
    }
    
    const shareToken = validatedData.isPublic && !existingNote.shareToken 
      ? nanoid(10) 
      : existingNote.shareToken;
      
    const customSlug = validatedData.isPublic && validatedData.customSlug 
      ? validatedData.customSlug 
      : (validatedData.isPublic ? existingNote.customSlug : null);
    
    const note = await prisma.note.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        language: validatedData.language,
        isPublic: validatedData.isPublic,
        shareToken: validatedData.isPublic ? shareToken : null,
        customSlug
      }
    });
    
    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}