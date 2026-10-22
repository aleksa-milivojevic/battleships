import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AudioService {

    private button = new Audio("/audio/button-sound.wav");
    private lobbyMusic = new Audio("/audio/lobby-music.wav");
    private gameMusic = new Audio("/audio/lobby-music.wav");

    private allowed = false;

    constructor() {
        console.log(this.lobbyMusic.volume);
        this.lobbyMusic.loop = true;
        this.gameMusic.loop = true;

        this.button.load();
        this.lobbyMusic.load();
        this.gameMusic.load();

        this.lobbyMusic.volume = 1;
        this.gameMusic.volume = 0;
    }

    plyButtonSound() {
        if (this.button.readyState === HTMLMediaElement.HAVE_FUTURE_DATA)
            this.button.play();
    }

    private musicAllowed() {
        this.lobbyMusic.play();
        this.gameMusic.play();
        this.allowed = true;
    }

    toggleMusic() {
        if (!this.allowed) this.musicAllowed();
        else {
            this.lobbyMusic.volume = (this.lobbyMusic.volume) ? 0 : 1;
        }
    }

    toggleSFX() {
        this.button.volume = (this.button.volume) ? 0 : 1;
    }

    playLobbyMusic() {
        this.gameMusic.volume = 0;
        this.lobbyMusic.currentTime = 0;
        this.lobbyMusic.volume = 1;
        // this.lobbyMusic.play()
        //     .then(() => console.log('Lobby music is playing'))
        //     .catch(err => console.error(err));
    }

    playGameMusic() {
        this.lobbyMusic.volume = 0;
        this.gameMusic.currentTime = 0;
        this.gameMusic.volume = 1;
        // this.gameMusic.play()
        //     .then(() => console.log('Game music is playing'))
        //     .catch(err => console.error(err));
    }
}