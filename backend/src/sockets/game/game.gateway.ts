import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { GameService } from "./game.service";
import { ClientInfo } from "./game.dto";
import { BadRequestException } from "@nestjs/common";
import { TimeInterval } from "rxjs/internal/operators/timeInterval";

@WebSocketGateway({ namespace: '/game', cors: { origin: 'http://localhost:4200', credentials: true } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    private ids = new Map<string, string>();

    private clients = new Map<string, ClientInfo>();

    private waiting = new Set<string>();

    private gameInProgress = new Set<string>();

    constructor(
        private gameService: GameService
    ) {}

    handleConnection(@ConnectedSocket() client: Socket) {
        client.emit('id-req');
    }
    
    handleDisconnect(@ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);

        if (!id) return;

        const clientInfo = this.clients.get(id);

        if (!clientInfo) {
            this.clients.delete(client.id);
            return;
        }

        if (clientInfo.socket !== client) {
            this.clients.delete(client.id);
        } 

        clientInfo.socket = null;
        clientInfo.connected = false;
        this.ids.delete(client.id);
        
        if (!this.gameInProgress.has(id)) return;

        const opp = this.clients.get(clientInfo.opp);
        if (!opp?.connected) return;

        this.waiting.add(clientInfo.opp);

        clientInfo.timer = setTimeout(() => {
            clientInfo.timer = null;
            clientInfo.kicked = true;
            opp.socket?.emit('disconnection');
            this.waiting.delete(clientInfo.opp);
            this.oppDisconnect(opp.socket);
        }, 10000);
    }

    @SubscribeMessage('id-res')
    handleIds(@MessageBody('id') id: string, @MessageBody('opp') opp: string, @ConnectedSocket() client: Socket) {
        let clientInfo = this.clients.get(id);

        this.gameInProgress.add(id);

        if (!clientInfo) {
            clientInfo = {
                opp,
                socket: client,
                field: [],
                connected: true,
                timer: null,
                kicked: false
            };

            this.clients.set(id, clientInfo);
        } else {
            if (clientInfo.timer) clearTimeout(clientInfo.timer);
            clientInfo.timer = null;
            clientInfo.socket = client;
            clientInfo.connected = true;
            if (clientInfo.kicked) {
                clientInfo.socket?.emit('kicked'); 
            }   
            else {
                if (this.waiting.has(opp)) this.waiting.delete(opp);
            }
            clientInfo.kicked = false;
        }

        this.ids.set(client.id, id);
    }

    @SubscribeMessage('ready')
    ready(@MessageBody('field') field: any, @ConnectedSocket() client: Socket) {
        console.log(typeof field);
        console.log(field);
        const id = this.ids.get(client.id);
        const opp = this.clients.get(id!)?.opp;
        if (!this.gameService.verify(field)) {
            client.emit('ready-res', { res: 'Invalid' });
        }
        else {
            client.emit('ready-res', { res: 'Approved' });
            this.clients.get(id!)!.field = field;
            this.clients.get(opp!)!.socket?.emit('ready');
        }
    }

    @SubscribeMessage('attack')
    async attack(@MessageBody('coords') coords: any, @ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);

        if (!id) throw new WsException('Client not found');

        const opp = this.clients.get(id)?.opp;

        if (!opp) throw new WsException('Opponent not found');
        
        const result = this.gameService.getAttackResult(
            coords,
            this.clients.get(opp)?.field!
        );

        this.clients.get(opp)?.socket?.emit('attack', { result, coords });
        client.emit('report', { result, coords });

        if (result === 'game-end') {
            this.clients.get(opp)?.socket?.emit('opp-field', { field: this.clients.get(id)?.field });

            const points = await this.gameService.saveMatch(id, opp);
            this.clients.get(opp)?.socket?.emit('points', { points });
            client.emit('points', { points });

            this.gameInProgress.delete(id);
            this.gameInProgress.delete(opp);
        }
    }

    @SubscribeMessage('surrender')
    async surrender(@ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);

        if (!id) {
            throw new WsException('Client not found');
        }

        const player = this.clients.get(id);

        if (!player) {
            throw new WsException('Player not found');
        }

        const opponent = this.clients.get(player.opp);

        if (!opponent?.connected || !opponent.socket) {
            return;
        }

        opponent.socket.emit('surrender');

        const points = await this.gameService.saveMatch(player.opp, id);
        opponent.socket.emit('points', { points });
        client.emit('points', { points });

        this.gameInProgress.delete(id);
        this.gameInProgress.delete(player.opp);
    }

    @SubscribeMessage('opp-disconnect')
    async oppDisconnect(@ConnectedSocket() client: Socket | null) {
        if (!client) return;
        
        const id = this.ids.get(client.id);
        if (!id) throw new WsException('Player not found');

        const player = this.clients.get(id);
        if (!player) throw new WsException('Player info not found');
        
        const points = await this.gameService.saveMatch(id, player.opp);
        player.socket?.emit('points', { points });

        this.gameInProgress.delete(id);
        this.gameInProgress.delete(player.opp);
    }
}