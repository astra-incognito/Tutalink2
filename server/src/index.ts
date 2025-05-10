import reviewsRouter from "./routes/reviews";
import sessionsRouter from "./routes/sessions";

// Routes
app.use("/api/reviews", reviewsRouter);
app.use("/api/sessions", sessionsRouter); 