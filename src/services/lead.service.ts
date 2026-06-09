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
            preferred_property_type: lead.preferred_property_type.trim().toLowerCase(),
            is_duplicate: phoneCounts[lead.phone] > 1,
            is_valid_email: this.isValidEmail(lead.email),
            is_valid_phone: this.isValidPhone(lead.phone),
            is_valid_budget: this.isValidBudget(lead.budget, lead.property_type),
            is_valid_property_type: this.isValidPropertyType(lead.preferred_property_type),
        }));

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(analyzed, null, 2));
        return analyzed;
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    private isValidPhone(phone: string): boolean {
        return /^\+\d{11}$/.test(phone);
    }

    private isValidPropertyType(preferred_property_type: string): boolean {
        const allowed = ["apartment", "house", "condo", "townhouse"];
        return allowed.includes(preferred_property_type.trim().toLowerCase());
    }

    private isValidBudget(budget: number, property_type: string): boolean {
        if (budget <= 0) return false;
        if (property_type === "rental") return budget >= 1000 && budget <= 5000;
        if (property_type === "sale") return budget >= 100000;
        return false;
    }

    getLeadSummary() {
        const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
        const leads: Lead[] = JSON.parse(raw);

        const locations = new Set(leads.map(l => l.location));
        const rentals = leads.filter(l => l.property_type === "rental");
        const sales = leads.filter(l => l.property_type === "sale");

        return {
            total_leads: leads.length,
            unique_locations: locations.size,
            avg_budget: {
                rental: rentals.reduce((sum, l) => sum + l.budget, 0) / rentals.length,
                sale: sales.reduce((sum, l) => sum + l.budget, 0) / sales.length,
            }
        };
    }

    getLeadByPhone(phone: string): Lead[] {
        const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
        const leads: Lead[] = JSON.parse(raw);
        return leads.filter(lead => lead.phone === phone);
    }
}