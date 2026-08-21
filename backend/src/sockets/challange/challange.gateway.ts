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
    private interactions = new Map<string, string[]>();
    
    handleConnection(@ConnectedSocket() client: Socket) {
        console.log("new client ", client.id);
        client.emit('id-request');
    }

    handleDisconnect(@ConnectedSocket() client: any) {
        const id = this.ctu.get(client.id);

        const targets = this.interactions.get(id!);
        
        if (targets) {
            targets.forEach(target => {
                let ctarget = this.utc.get(target);
                ctarget?.emit('disconnection', { source: id });
            });
        }

        this.ctu.delete(client.id);
        this.utc.delete(id!);
        this.interactions.delete(id!);
    }
    
    @SubscribeMessage('id-response')
    handleId(@MessageBody('id') id: string, @ConnectedSocket() client: Socket) {
        console.log("new id: ", id);

        const last = this.utc.get(id);
        if (last !== undefined) {
            this.ctu.delete(last.id);
        }

        this.utc.set(id, client);
        this.ctu.set(client.id, id);
        
        this.interactions.set(id, []);
    }

    @SubscribeMessage('invite')
    handleInvite(@MessageBody() data: ChallangeDto) {
        const target = this.utc.get(data.target);

        if (!target) {
            throw new NotFoundException('user not online');
        }

        this.interactions.get(data.source)?.push(data.target);
        this.interactions.get(data.target)?.push(data.source);

        console.log(this.interactions);

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