import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get all reviews for a tutor
router.get("/tutor/:tutorId", async (req, res) => {
  try {
    const { tutorId } = req.params;
    const reviews = await prisma.review.findMany({
      where: {
        tutorId: parseInt(tutorId),
      },
      include: {
        learner: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        session: {
          select: {
            id: true,
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching tutor reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Submit a new review
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { sessionId, rating, comment, tutorId, learnerId } = req.body;

    // Verify the session exists and belongs to the learner
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        learnerId: learnerId,
        status: "completed",
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or not completed" });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        sessionId: sessionId,
      },
    });

    if (existingReview) {
      return res.status(400).json({ error: "Review already exists for this session" });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        tutorId,
        learnerId,
        sessionId,
      },
      include: {
        learner: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Reply to a review
router.post("/:reviewId/reply", authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;
    const userId = req.user.id;

    // Verify the review exists and belongs to the tutor
    const review = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        tutorId: userId,
      },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    // Update the review with the reply
    const updatedReview = await prisma.review.update({
      where: {
        id: parseInt(reviewId),
      },
      data: {
        reply,
      },
      include: {
        learner: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
      },
    });

    res.json(updatedReview);
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({ error: "Failed to reply to review" });
  }
});

export default router; 