import { controller, httpPost } from "inversify-express-utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { LeadService } from "../services/lead.service";

@controller('')
export class LeadController {
    constructor(
        @inject(LeadService) private _leadService: LeadService
    ) { }

    @httpPost('/analyze')
    analyzeLead(req: Request, res: Response) {
        const result = this._leadService.analyzeLead();
        return res.json({
            info: {
                total: result.length,
                duplicates: result.filter(lead => lead.is_duplicate).length,
                valid_emails: result.filter(lead => lead.is_valid_email).length,
                valid_phones: result.filter(lead => lead.is_valid_phone).length,
                valid_budgets: result.filter(lead => lead.is_valid_budget).length,
                valid_property_types: result.filter(lead => lead.is_valid_property_type).length
            },
            items: result
        });
    }
}