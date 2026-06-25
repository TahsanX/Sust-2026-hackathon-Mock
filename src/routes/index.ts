import { Router } from "express";
import { getHealth } from "../controllers/healthController";
import { sortTicket } from "../controllers/ticketController";
import { validateRequest } from "../middleware/validateRequest";
import { TicketRequestSchema } from "../validators/ticketValidator";

const router = Router();

router.get("/health", getHealth);
router.post("/sort-ticket", validateRequest(TicketRequestSchema), sortTicket);

export default router;
