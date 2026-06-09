import { injectable } from "inversify";
import { Lead } from "../entities/Lead";
import * as fs from "fs";
import * as path from "path";

const DATA_PATH = path.join(__dirname, "../data/sample_lead_data.json");
const OUTPUT_PATH = path.join(__dirname, "../data/analyzed_leads.json");

@injectable()
export class LeadService {

    analyzeLead(): Lead[] {
        const raw = fs.readFileSync(DATA_PATH, "utf-8");
        const leads: Lead[] = JSON.parse(raw);

        const phoneCounts: Record<string, number> = {};
        for (const lead of leads) {
            phoneCounts[lead.phone] = (phoneCounts[lead.phone] || 0) + 1;
        }

        const analyzed = leads.map(lead => ({
            ...lead,
            phone: lead.phone.trim(),
            email: lead.email.trim().toLowerCase(),
            budget: Number(lead.budget),
            is_duplicate: phoneCounts[lead.phone] > 1,
        }));

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(analyzed, null, 2));
        return analyzed;
    }
}