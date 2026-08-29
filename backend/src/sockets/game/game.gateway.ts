import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { GameService } from "./game.service";
import { ClientInfo } from "./game.dto";

@WebSocketGateway({ namespace: '/game', cors: { origin: 'http://localhost:4200', credentials: true } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    private ids = new Map<string, string>();

    private clients = new Map<string, ClientInfo>();

    private waiting = new Set<string>();

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

        if(clientInfo.socket !== client) {
            this.clients.delete(client.id);
        } 

        clientInfo.socket = null;
        clientInfo.connected = false;
        this.ids.delete(client.id);
        
        const opp = this.clients.get(clientInfo.opp);

        if (opp?.connected) {
            opp.socket?.emit('disconnection');
            this.waiting.add(clientInfo.opp);  
        }
    }

    @SubscribeMessage('id-res')
    handleIds(@MessageBody('id') id: string, @MessageBody('opp') opp: string, @ConnectedSocket() client: Socket) {
        let clientInfo = this.clients.get(id);

        if (!clientInfo) {
            clientInfo = {
                opp,
                socket: client,
                field: [],
                connected: true
            };

            this.clients.set(id, clientInfo);
        } else {
            clientInfo.socket = client;
            clientInfo.connected = true;
        }

        this.ids.set(client.id, id);

        this.checkForReconnect(id, opp);
    }

    @SubscribeMessage('ready')
    ready(@MessageBody('field') field: any, @ConnectedSocket() client: Socket) {
        console.log(typeof field);
        console.log(field);
        const id = this.ids.get(client.id);
        const opp = this.clients.get(id!)?.opp;
        if (!this.gameService.verify(field)) {
            throw new WsException('Field Not Valid');
        }
        this.clients.get(id!)!.field = field;
        this.clients.get(opp!)!.socket?.emit('ready');
    }

    @SubscribeMessage('attack')
    attack(@MessageBody('coords') coords: any, @ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);
        const opp = this.clients.get(id!)?.opp;
        console.log('[attack]: ', id, opp);
        
        const result = this.gameService.getAttackResult(
            coords,
            this.clients.get(id!)?.field!
        );

        this.clients.get(opp!)?.socket?.emit('attack', { result, coords });
        client.emit('report', { result, coords });
    }

    @SubscribeMessage('surrender')
    surrender(@ConnectedSocket() client: Socket) {
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
    }

    checkForReconnect(id: string, opp: string) {
        if (!this.waiting.has(opp)) {
            return;
        }
    
        const opponent = this.clients.get(opp);
    
        if (!opponent || !opponent.connected || !opponent.socket) {
            return;
        }
    
        if (opponent.opp !== id) {
            return;
        }
    
        opponent.socket.emit('reconnect');
    
        this.waiting.delete(opp);
    }
}