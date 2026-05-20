import { Router } from "express";
import {
  createUnsubscribeReport,
  paginateUnsubscribeReports,
} from "../modules/unsubscribe-report/controller/unsubscribe-report.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createUnsubscribeReportSchema } from "../validations/unsubscribe-report.validation";

const router = Router();

router.post(
  "/add",
  auth,
  validate(createUnsubscribeReportSchema),
  createUnsubscribeReport
);

router.get("/paginate", auth, paginateUnsubscribeReports);

export default router;
