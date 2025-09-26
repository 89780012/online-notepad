import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取用户的所有私有笔记
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户的所有私有笔记
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        //isPublic: false // 只同步私有笔记
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true,
      notes: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        userId: note.userId,
        contentHash: note.contentHash,
        noteMode: note.noteMode,
        localId: note.localId
      }))
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// 上传或更新笔记到云端
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const noteData = await request.json();
    
    // 验证必要字段
    if (!noteData.title || !noteData.content || !noteData.contentHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let note;

    if (noteData.cloudNoteId) {
      // 尝试更新现有笔记，如果不存在则创建新笔记
      try {
        note = await prisma.note.update({
          where: {
            id: noteData.cloudNoteId,
            userId: user.id // 确保用户只能更新自己的笔记
          },
          data: {
            title: noteData.title,
            content: noteData.content,
            contentHash: noteData.contentHash,
            noteMode: noteData.noteMode || 'markdown',
            localId: noteData.localId
          }
        });
      } catch (error: unknown) {
        // 如果更新失败（记录不存在），则创建新笔记
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          console.log(`云端笔记 ${noteData.cloudNoteId} 不存在，创建新笔记`);
          note = await prisma.note.create({
            data: {
              title: noteData.title,
              content: noteData.content,
              userId: user.id,
              noteMode: noteData.noteMode || 'markdown',
              contentHash: noteData.contentHash,
              localId: noteData.localId,
              isPublic: false
            }
          });
        } else {
          throw error; // 重新抛出其他错误
        }
      }
    } else {
      // 创建新笔记前，先检查是否已存在相同的 localId 和 contentHash
      if (noteData.localId && noteData.contentHash) {
        const existingNote = await prisma.note.findFirst({
          where: {
            userId: user.id,
            localId: noteData.localId,
            contentHash: noteData.contentHash
          }
        });
        
        if (existingNote) {
          // 如果找到相同的笔记，直接返回现有笔记（幂等性）
          console.log(`检测到重复请求，返回已存在的笔记: ${existingNote.id}`);
          note = existingNote;
        } else {
          // 创建新笔记
          note = await prisma.note.create({
            data: {
              title: noteData.title,
              content: noteData.content,
              userId: user.id,
              noteMode: noteData.noteMode || 'markdown',
              contentHash: noteData.contentHash,
              localId: noteData.localId,
              isPublic: false
            }
          });
        }
      } else {
        // 如果没有 localId 或 contentHash，直接创建（向后兼容）
        note = await prisma.note.create({
          data: {
            title: noteData.title,
            content: noteData.content,
            userId: user.id,
            noteMode: noteData.noteMode || 'markdown',
            contentHash: noteData.contentHash,
            localId: noteData.localId,
            isPublic: false
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      contentHash: note.contentHash,
      noteMode: note.noteMode,
      localId: note.localId
    });

  } catch (error) {
    console.error('Sync POST error:', error);
    
    // 处理Prisma错误
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to sync note' }, { status: 500 });
  }
}

// 删除云端笔记
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // 删除笔记，确保只能删除用户自己的笔记
    await prisma.note.delete({
      where: {
        id: noteId,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Sync DELETE error:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

// 批量同步操作
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operations } = await request.json();
    
    if (!Array.isArray(operations)) {
      return NextResponse.json({ error: 'Operations must be an array' }, { status: 400 });
    }

    const results: Array<{
      localId: string;
      cloudNote?: {
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        contentHash: string | null;
        noteMode: string | null;
        localId: string | null;
      };
      deleted?: boolean;
    }> = [];

    // 使用事务处理批量操作
    await prisma.$transaction(async (tx) => {
      for (const op of operations) {
        switch (op.type) {
          case 'upload':
            const uploaded = await tx.note.create({
              data: {
                title: op.note.title,
                content: op.note.content,
                userId: user.id,
                noteMode: op.note.mode || 'markdown',
                contentHash: op.note.contentHash,
                localId: op.note.id,
                isPublic: false
              }
            });
            results.push({ localId: op.note.id, cloudNote: uploaded });
            break;

          case 'update':
            const updated = await tx.note.update({
              where: { 
                id: op.cloudNoteId,
                userId: user.id 
              },
              data: {
                title: op.note.title,
                content: op.note.content,
                contentHash: op.note.contentHash,
                noteMode: op.note.mode || 'markdown'
              }
            });
            results.push({ localId: op.note.id, cloudNote: updated });
            break;

          case 'delete':
            await tx.note.delete({
              where: { 
                id: op.cloudNoteId,
                userId: user.id 
              }
            });
            results.push({ localId: op.note.id, deleted: true });
            break;

          default:
            console.warn('Unknown operation type:', op.type);
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      results: results.map(result => ({
        ...result,
        cloudNote: result.cloudNote ? {
          ...result.cloudNote,
          createdAt: result.cloudNote.createdAt.toISOString(),
          updatedAt: result.cloudNote.updatedAt.toISOString()
        } : undefined
      }))
    });

  } catch (error) {
    console.error('Batch sync error:', error);
    return NextResponse.json({ error: 'Batch sync failed' }, { status: 500 });
  }
}
