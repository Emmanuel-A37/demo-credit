import axios from 'axios'

export class KarmaService {

    async isBlacklisted(email:string): Promise<boolean> {
        try {
            // pending when my adjutor sign up issue is resolved
            return true;
        } catch (error : any) {
            return false;
        }
    }
}