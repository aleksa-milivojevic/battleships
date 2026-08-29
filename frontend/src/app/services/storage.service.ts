import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    setItem(key: string, value: any): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (err) {
            console.log("Error seting into local storage");
        }
    }

    getItem<T>(key: string): T | null {
        try {
            const data = localStorage.getItem(key);
            if (!data || data === 'undefined') {
                return null;
            }
            else {
                return JSON.parse(data) as T;
            }
        }
        catch (err) {
            console.log("Error extracting from local storage");
            console.error(err);
            return null;
        }
    }

    removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        }
        catch (err) {
            console.log(`Error removing ${key} from storage`);
            console.error(err);
        }
    }

    removeAll() {
        try {
            localStorage.clear();
        }
        catch (err) {
            console.log('Error removing all from storage');
            console.error(err);
        }
    }
}