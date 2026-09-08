import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io"
import { UserService } from "src/database/user/user.service";

@WebSocketGateway({ namespace: 'restriction',  cors: { origin: 'http://localhost:4200', credentials: true } })
export class RestrictionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    
    private ids = new Map<string, string>();
    private sockets = new Map<string, Socket>();

    constructor(
        private userService: UserService
    ) {}

    handleConnection(@ConnectedSocket() client: Socket) {
        client.emit('id-req');
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        const id = this.ids.get(client.id);
        if (!id) return;
        this.ids.delete(client.id);
        this.sockets.delete(id);
    }

    @SubscribeMessage('id-res')
    handleId(@MessageBody('id') id: string, @ConnectedSocket() client: Socket) {
        this.ids.set(client.id, id);
        this.sockets.set(id, client);
    }

    @SubscribeMessage('ban')
    async ban(@MessageBody('target') target: string, @ConnectedSocket() client: Socket) {
        const admin = this.ids.get(client.id);
        if (!admin) return;
        
        try {
            await this.userService.ban(admin, target);
        }
        catch (error) {
            throw new WsException(error.message);
        }

        const targetSock = this.sockets.get(target);
        if (!targetSock) return;
        targetSock.emit('banned');
    }

    @SubscribeMessage('unban')
    async unban(@MessageBody('target') target: string, @ConnectedSocket() client: Socket) {
        const admin = this.ids.get(client.id);
        if (!admin) return;
        
        try {
            await this.userService.unban(admin, target);
        }
        catch (error) {
            throw new WsException(error.message);
        }

        // const targetSock = this.sockets.get(target);
        // if (!targetSock) return;
        // targetSock.emit('unbanned');
    }

    @SubscribeMessage('timeout')
    async timeout(
        @MessageBody('target') target: string,
        @MessageBody('duration') duration: number,
        @ConnectedSocket() client: Socket
    ) {
        const admin = this.ids.get(client.id);
        if (!admin) return;
        
        try {
            await this.userService.timeout(admin, target, duration);
        }
        catch (error) {
            throw new WsException(error.message);
        }

        const targetSock = this.sockets.get(target);
        if (!targetSock) return;
        targetSock.emit('timed-out');
    }

    @SubscribeMessage('untimeout')
    async untimeout(
        @MessageBody('target') target: string,
        @ConnectedSocket() client: Socket
    ) {
        const admin = this.ids.get(client.id);
        if (!admin) return;
        
        try {
            await this.userService.untimeout(admin, target);
        }
        catch (error) {
            throw new WsException(error.message);
        }

        // const targetSock = this.sockets.get(target);
        // if (!targetSock) return;
        // targetSock.emit('timed-out');
    }
}