import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Recent activity for admin dashboard (including reviews)
router.get("/recent-activity", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch recent reviews
    const recentReviews = await prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        learner: { select: { fullName: true } },
      },
    });

    // Format as activity items
    const reviewActivities = recentReviews.map((r) => ({
      type: "review",
      message: "New review submitted",
      user: r.learner.fullName,
      time: r.createdAt,
    }));

    // TODO: Fetch and merge other activity types if needed
    // const otherActivities = ...
    // const allActivities = [...otherActivities, ...reviewActivities].sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(reviewActivities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

router.get("/reviews", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        comment: true,
        learner: { select: { fullName: true } },
        tutor: { select: { fullName: true } }
      },
    });
    res.json(
      reviews.map(r => ({
        id: r.id,
        learner: r.learner.fullName,
        tutor: r.tutor.fullName,
        comment: r.comment,
        time: r.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router; 