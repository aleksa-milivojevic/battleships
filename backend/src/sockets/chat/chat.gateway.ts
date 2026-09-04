import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ClientInfo } from "./chat.dto";

@WebSocketGateway({ namespace: '/chat', cors: { origin: 'http://localhost:4200', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    
    private clients = new Map<string,ClientInfo>();
    private ids = new Map<string,string>();

    handleConnection(@ConnectedSocket() client: Socket) {
        client.emit('id-req');
    }
    
    handleDisconnect(@ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);
        if (!id) return;

        this.clients.delete(id);
    }

    @SubscribeMessage('id-res')
    handleId(@MessageBody() data: {id: string, opp: string}, @ConnectedSocket() client: Socket) {
        this.ids.set(client.id, data.id);
        this.clients.set(data.id, { opp: data.opp, socket: client });
        
        const opp = this.clients.get(data.opp);
        if (opp) {
            client.emit('chat-open');
            opp.socket.emit('chat-open');
        }
    }

    @SubscribeMessage('message')
    message(@MessageBody('text') text: string, @ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);
        if (!id) {
            new WsException('Who are you?');
            return;
        }

        const info = this.clients.get(id);
        if (!info) {
            new WsException('Not connected!');
            return;
        }

        const opp = this.clients.get(info.opp);
        if (!opp) {
            new WsException('Cant find opponent!');
            return;
        }
        
        opp.socket.emit('message', { text });
    }

}