import axios from 'axios'

export class KarmaService {

    async isBlacklisted(email:string): Promise<boolean> {
        try {
            // pending when my adjutor sign up issue is resolved
            return false;
        } catch (error : any) {
            return true;
        }
    }
}