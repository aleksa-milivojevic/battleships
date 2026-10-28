import { Injectable, effect, inject, signal } from "@angular/core";
import { StorageService } from "./storage.service";

@Injectable({
    providedIn: 'root'
})
export class AudioService {
    private storage = inject(StorageService);

    private button = new Audio("/audio/button-sound.wav");
    private lobbyMusic = new Audio("/audio/lobby-music.wav");
    private gameMusic = new Audio("/audio/game-music.wav");

    private allowed = signal(false);
    muted = signal(true);
    sfx = signal(true);

    constructor() {
        // this.allowed.set(this.storage.getItem('MUSIC_ALLOWED') ?? this.allowed());
        // this.muted.set(this.storage.getItem('MUSIC_MUTED') ?? this.muted());
        // this.sfx.set(this.storage.getItem('SFX') ?? this.sfx());

        console.log(this.lobbyMusic.volume);
        this.lobbyMusic.loop = true;
        this.gameMusic.loop = true;

        this.button.load();
        this.lobbyMusic.load();
        this.gameMusic.load();

        this.lobbyMusic.volume = 1;
        this.gameMusic.volume = 0;

        // effect(() => {
        //     this.allowed();
        //     this.storage.setItem('MUSIC_ALLOWED', this.allowed());
        // });

        // effect(() => {
        //     this.muted();
        //     this.storage.setItem('MUSIC_MUTED', this.muted());
        // });

        // effect(() => {
        //     this.sfx();
        //     this.storage.setItem('SFX', this.muted());
        // });
    }

    playButtonSound() {
        this.button.currentTime = 0;
        this.button.play().catch(err => console.error(err));
    }

    private musicAllowed() {
        this.lobbyMusic.play().catch(err => console.error(err));
        this.gameMusic.play().catch(err => console.error(err));
        this.allowed.set(true);
    }

    toggleMusic() {
        this.muted.update(o => !o);
        if (!this.allowed()) this.musicAllowed();
        else {
            this.lobbyMusic.volume = (this.lobbyMusic.volume) ? 0 : 1;
        }
    }

    toggleSFX() {
        this.sfx.update(o => !o);
        this.button.volume = (this.button.volume) ? 0 : 1;
    }

    playLobbyMusic() {
        if (this.muted()) return;
        this.gameMusic.volume = 0;
        this.lobbyMusic.currentTime = 0;
        this.lobbyMusic.volume = 1;
    }

    playGameMusic() {
        if (this.muted()) return;
        this.lobbyMusic.volume = 0;
        this.gameMusic.currentTime = 0;
        this.gameMusic.volume = 1;
    }

    stopMusic() {
        this.lobbyMusic.pause();
        this.gameMusic.pause();
        this.lobbyMusic.currentTime = 0;
        this.gameMusic.currentTime = 0;
        this.allowed.set(false);
    }
}