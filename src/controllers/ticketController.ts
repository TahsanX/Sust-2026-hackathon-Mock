import { Request, Response, NextFunction } from "express";
import { classifyTicket } from "../services/classifierService";
import { TicketRequestInput } from "../validators/ticketValidator";

export async function sortTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { ticket_id, message } = req.body as TicketRequestInput;
    const result = await classifyTicket(ticket_id, message);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
