import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@WebSocketGateway({ namespace: '/game', cors: { origin: 'http://localhost:4200', credentials: true } })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {

    readonly fieldDim = 10;

    private idToOppId = new Map<string, string>();
    private utc = new Map<string, Socket>();
    private ctu = new Map<string, string>();
    private fields = new Map<string, number[][]>();


    handleConnection(@ConnectedSocket() client: Socket) {
        client.emit('id-req');
    }
    
    handleDisconnect(@ConnectedSocket() client: Socket) {
        
    }

    @SubscribeMessage('id-res')
    handleIds(@MessageBody('id') id: string, @MessageBody('opp') opp: string, @ConnectedSocket() client: Socket) {
        this.utc.set(id, client);
        this.ctu.set(client.id, id);
        this.idToOppId.set(id, opp);
    }

    @SubscribeMessage('ready')
    ready(@MessageBody('field') field: string, @ConnectedSocket() client: Socket) {
        const opp = this.getOpp(client.id);
        const id = this.ctu.get(client.id);
        const fieldMatrix = JSON.parse(field);
        if (!this.verifyField(fieldMatrix)) {
            throw new WsException('not valid field');
        }
        this.fields.set(id!, fieldMatrix);
        opp?.emit('ready');
    }

    @SubscribeMessage('attack')
    attack(@MessageBody('coords') coords: string, @ConnectedSocket() client: Socket) {
        const opp = this.getOpp(client.id);
        const result = this.getAttackResult();
        opp?.emit('result', { coords });
        client.emit('result', { coords });
    }

    getOpp(clientId: string) {
        const id = this.ctu.get(clientId);
        const oppId = this.idToOppId.get(id!);
        return this.utc.get(oppId!);
    }

    getAttackResult() {

    }

    verifyField(field: number[][]): boolean {
        return true;
    }
}