import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false)
});

const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createNoteSchema.parse(body);
    
    const shareToken = validatedData.isPublic ? nanoid(10) : null;
    
    const note = await prisma.note.create({
      data: {
        ...validatedData,
        shareToken
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
    
    const shareToken = validatedData.isPublic && !existingNote.shareToken 
      ? nanoid(10) 
      : existingNote.shareToken;
    
    const note = await prisma.note.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        language: validatedData.language,
        isPublic: validatedData.isPublic,
        shareToken: validatedData.isPublic ? shareToken : null
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