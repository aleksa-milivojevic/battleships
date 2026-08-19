import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { ChallangeDto } from "./challange.dto";
import { NotFoundException } from "@nestjs/common";
import { delay } from "rxjs";

@WebSocketGateway({ cors: { origin: 'http://localhost:4200', credentials: true } })
export class ChallangeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    
    @WebSocketServer() server: Server

    private utc = new Map<string, Socket>();
    private ctu = new Map<string, string>();
    
    handleConnection(@ConnectedSocket() client: Socket) {
        console.log("new client ", client.id);
        setTimeout(() => client.emit('id-request'), 200);
    }

    handleDisconnect(@ConnectedSocket() client: any) {
        const id = this.ctu.get(client.id);
        this.ctu.delete(client.id);
        this.utc.delete(id!);
    }
    
    @SubscribeMessage('id-response')
    handleId(@MessageBody('id') id: string, @ConnectedSocket() client: Socket) {
        console.log("new id: ", id);
        this.utc.set(id, client);
        this.ctu.set(client.id, id);
        client.emit('ty');
    }

    @SubscribeMessage('invite')
    handleInvite(@MessageBody() data: ChallangeDto) {
        const target = this.utc.get(data.target);

        if (!target) {
            throw new NotFoundException('user not online');
        }

        target.emit('invite', { source: data.source });
    }

    @SubscribeMessage('accept')
    handleAccept(@MessageBody() data: ChallangeDto) {
        const target = this.utc.get(data.target);

        if (!target) {
            throw new NotFoundException('user went offline');
        }

        target.emit('accept', { source: data.source });
    }
}