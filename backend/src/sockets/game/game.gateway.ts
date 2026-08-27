import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { GameService } from "./game.service";

@WebSocketGateway({ namespace: '/game', cors: { origin: 'http://localhost:4200', credentials: true } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    private ids = new Map<string, string>();

    private clients = new Map<string, { opp: string, socket: Socket, field: number[][] }>();

    constructor(
        private gameService: GameService
    ) {}

    handleConnection(@ConnectedSocket() client: Socket) {
        client.emit('id-req');
    }
    
    handleDisconnect(@ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);
        const opp = this.clients.get(id!)?.opp;

        this.clients.delete(id!);
        this.ids.delete(client.id);
        
        if (opp) {
            this.clients.get(opp)?.socket.emit('surrender');
        }
    }

    @SubscribeMessage('id-res')
    handleIds(@MessageBody('id') id: string, @MessageBody('opp') opp: string, @ConnectedSocket() client: Socket) {
        this.clients.set(id, { opp: opp, socket: client, field: [] } )
        this.ids.set(client.id, id);
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
        this.clients.get(opp!)!.socket.emit('ready');
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

        this.clients.get(opp!)?.socket.emit('attack', { result, coords });
        client.emit('report', { result, coords });
    }

    @SubscribeMessage('surrender')
    surrender(@ConnectedSocket() client: Socket) {
        console.log('[surrender]');
        const id = this.ids.get(client.id);
        const opp = this.clients.get(id!)?.opp;
        console.log(`[surrender] id: ${id}, sending to: ${opp}`);

        this.clients.get(opp!)?.socket.emit('surrender');
    }
}