import axios from 'axios';
import { env } from '../config/env';

export class KarmaService {

    async isBlacklisted(identity: string): Promise<boolean> {
        try {
            const response = await axios.get(
                `https://adjutor.lendsqr.com/v2/verification/karma/${identity}`,
                {
                    headers: {
                        Authorization: `Bearer ${env.adjutorKey}`
                    }
                }
            );

            const data = response?.data?.data;

            if (!data) {
                return false;
            }

            const amount = parseFloat(data.amount_in_contention || "0");
            const hasDebt = amount > 0;

            const hasReason =
                data.reason !== null &&
                data.reason !== undefined &&
                String(data.reason).trim() !== "";

            const negativeKarmaTypes = ["Fraud", "Loan Default"];
            const karmaLabel = data.karma_type?.karma || "";
            const isNegativeType = negativeKarmaTypes.includes(karmaLabel);

            return hasDebt || hasReason || isNegativeType;

        } catch (error: any) {
            console.error("Karma lookup failed:", error?.response?.data || error.message);

            return false; 
        }
    }
}