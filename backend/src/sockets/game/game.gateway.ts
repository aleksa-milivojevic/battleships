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
        
        this.clients.get(opp!)?.socket.emit('disconnect');
    }

    @SubscribeMessage('id-res')
    handleIds(@MessageBody('id') id: string, @MessageBody('opp') opp: string, @ConnectedSocket() client: Socket) {
        this.clients.set(id, { opp: opp, socket: client, field: [] } )
        this.ids.set(client.id, id);
    }

    @SubscribeMessage('ready')
    ready(@MessageBody('field') field: string, @ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);
        const opp = this.clients.get(id!)?.opp;
        const fieldMatrix = JSON.parse(field);
        if (!this.gameService.verifyField(fieldMatrix)) {
            throw new WsException('not valid field');
        }
        this.clients.get(id!)!.field = fieldMatrix;
        this.clients.get(opp!)!.socket.emit('ready');
    }

    @SubscribeMessage('attack')
    attack(@MessageBody('coords') coords: string, @ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);
        const opp = this.clients.get(id!)?.opp;
        
        const result = this.gameService.getAttackResult(
            JSON.parse(coords),
            this.clients.get(id!)?.field!
        );

        this.clients.get(opp!)?.socket.emit(result, { coords })
        client.emit('result', { result, coords });
    }
}