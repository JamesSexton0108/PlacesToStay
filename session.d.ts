declare module 'express-session' {
    export interface SessionData {
        username: string | null;
    }
}