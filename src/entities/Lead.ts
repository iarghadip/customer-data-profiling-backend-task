export interface Lead {
    lead_id: number;
    name: string;
    phone: string;
    email: string;
    property_type: "rental" | "sale";
    budget: number;
    location: string;
    preferred_property_type: string;
    contact_date: string;
    inquiry_notes: string;
    is_duplicate: boolean;
}