-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- AlterTable
ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "customSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "notes_customSlug_key" ON "notes"("customSlug");
