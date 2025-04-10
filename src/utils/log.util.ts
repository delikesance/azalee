export class Log {
    private static formatTime(): string {
        const now = new Date();
        const date = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        return `${date} ${time}`;
    }

    public static error(...messages: unknown[]): void {
        console.error(`${this.formatTime()} - Error:`, ...messages);
    }

    public static info(...messages: unknown[]): void {
        console.log(`${this.formatTime()} - Info:`, ...messages);
    }

    public static warning(...messages: unknown[]): void {
        console.warn(`${this.formatTime()} - Warn:`, ...messages);
    }
}
