import { Op } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import UserLog from "./user-log.model";
import { User } from "../../user/model/user.model";
class UserLogRepository extends BaseRepository<UserLog> {
    constructor() {
        super(UserLog);
    }

    async createLog(data: any) {
        return this.create(data);
    }

    async filterLogs(filters: any, page: number, limit: number) {
        const where: any = {};

        if (filters.user_id) {
            where.user_id = filters.user_id;
        }

        if (filters.action) {
            where.action = filters.action;
        }

        if (filters.product) {
            where.product = { [Op.iLike]: `%${filters.product}%` };
        }

        if (filters.fromDate && filters.toDate) {
            where.created_at = {
                [Op.between]: [
                    new Date(filters.fromDate),
                    new Date(filters.toDate),
                ],
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await this.model.findAndCountAll({
            where,
            limit,
            offset,
            order: [["created_at", "DESC"]],

            include: [
                {
                    model: User,   // IMPORTANT (not string)
                    as: "user",    // MUST match association alias
                    attributes: ["id", "first_name", "last_name", "email", "role"],
                },
            ],
        });

        return {
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }
}

export default new UserLogRepository();