import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";

@WebSocketGateway({ namespace: '/queue', cors: { origin: 'http://localhost:4200', credentials: true } })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
    
    private queue = new Map<string,Socket>();
    private ctu = new Map<string,string>();

    handleConnection(@ConnectedSocket() client: Socket) {
        setTimeout(() => client.emit('id-req'), 500);
    }
    
    handleDisconnect(@ConnectedSocket() client: Socket) {
        const id = this.ctu.get(client.id);
        this.ctu.delete(client.id);
        this.queue.delete(id!);
    }

    @SubscribeMessage('id-res')
    matchmaking(@MessageBody('id') id: string, @ConnectedSocket() client: Socket) {
        if (this.queue.size === 0) {
            this.queue.set(id, client);
            this.ctu.set(client.id, id);
            client.emit('in-queue');
        }
        else {
            const [oppId, oppSocket] = this.queue.entries().next().value;

            oppSocket.emit('match-found', { oppId: id });
            client.emit('match-found', { oppId: oppId });
        
            this.queue.delete(oppId);
            this.ctu.delete(oppSocket.id);
        }
    }
}