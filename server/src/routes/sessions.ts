import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get session details
router.get("/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.session.findUnique({
      where: {
        id: parseInt(sessionId),
      },
      include: {
        tutor: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Get learner's sessions
router.get("/learner/:learnerId", authenticateToken, async (req, res) => {
  try {
    const { learnerId } = req.params;
    const sessions = await prisma.session.findMany({
      where: {
        learnerId: parseInt(learnerId),
      },
      include: {
        tutor: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        review: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Add hasReview flag to each session
    const sessionsWithReviewFlag = sessions.map(session => ({
      ...session,
      hasReview: !!session.review,
      review: undefined, // Remove the review object since we only need the flag
    }));

    res.json(sessionsWithReviewFlag);
  } catch (error) {
    console.error("Error fetching learner sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

export default router; 