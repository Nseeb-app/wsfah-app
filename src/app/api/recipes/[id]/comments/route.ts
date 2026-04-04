import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mobile";
import { parseBody, commentSchema } from "@/lib/validation";
import { logAudit, AUDIT } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        recipeId: id,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null;

    return NextResponse.json({ comments, nextCursor });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: recipeId } = await params;
  const body = await req.json();
  const parsed = parseBody(commentSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { body: commentBody, parentId } = parsed.data;

  try {
    // Verify recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { authorId: true },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // If parentId is provided, verify it exists and belongs to the same recipe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { recipeId: true },
      });

      if (!parentComment || parentComment.recipeId !== recipeId) {
        return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        authorId: user.id,
        recipeId,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create notification for recipe author (if not commenting on own recipe)
    if (recipe.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: recipe.authorId,
          type: "COMMENT",
          title: "New comment on your recipe",
          body: `Someone commented on your recipe`,
          link: `/recipe/${recipeId}`,
        },
      });
    }

    logAudit(user.id, AUDIT.COMMENT_CREATE, "comment", comment.id);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
