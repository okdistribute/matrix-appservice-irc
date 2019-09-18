// Ignore definition errors for now.
//@ts-ignore
import { MatrixRoom, RemoteRoom, MatrixUser} from "matrix-appservice-bridge";
import {default as Bluebird} from "bluebird";
import { IrcRoom } from "../models/IrcRoom";
import { IrcClientConfig } from "../models/IrcClientConfig";
import { IrcServer, IrcServerConfig } from "../irc/IrcServer";

export type RoomOrigin = "config"|"provision"|"alias"|"join";
export interface RoomEntry {
    id: string;
    matrix: MatrixRoom;
    remote: RemoteRoom;
    data: {
        origin: RoomOrigin;
    };
}

export interface ChannelMappings {
    [roomId: string]: Array<{networkId: string; channel: string}>;
}

export interface UserFeatures {
    [name: string]: boolean;
}

export interface DataStore {
    setServerFromConfig(server: IrcServer, serverConfig: IrcServerConfig): Promise<void>;

    /**
     * Persists an IRC <--> Matrix room mapping in the database.
     * @param {IrcRoom} ircRoom : The IRC room to store.
     * @param {MatrixRoom} matrixRoom : The Matrix room to store.
     * @param {string} origin : "config" if this mapping is from the config yaml,
     * "provision" if this mapping was provisioned, "alias" if it was created via
     * aliasing and "join" if it was created during a join.
     * @return {Promise}
     */
    storeRoom(ircRoom: IrcRoom, matrixRoom: MatrixRoom, origin: RoomOrigin): Promise<void>;

    /**
     * Get an IRC <--> Matrix room mapping from the database.
     * @param {string} roomId : The Matrix room ID.
     * @param {string} ircDomain : The IRC server domain.
     * @param {string} ircChannel : The IRC channel.
     * @param {string} origin : (Optional) "config" if this mapping was from the config yaml,
     * "provision" if this mapping was provisioned, "alias" if it was created via aliasing and
     * "join" if it was created during a join.
     * @return {Promise} A promise which resolves to a room entry, or null if one is not found.
     */
    getRoom(roomId: string, ircDomain: string, ircChannel: string, origin?: RoomOrigin): Promise<RoomEntry|null>;

    /**
     * Get all Matrix <--> IRC room mappings from the database.
     * @return {Promise} A promise which resolves to a map:
     *      $roomId => [{networkId: 'server #channel1', channel: '#channel2'} , ...]
     */
    getAllChannelMappings(): Promise<ChannelMappings>;

    /**
     * Get provisioned IRC <--> Matrix room mappings from the database where
     * the matrix room ID is roomId.
     * @param {string} roomId : The Matrix room ID.
     * @return {Promise} A promise which resolves to a list
     * of entries.
     */
    getProvisionedMappings(roomId: string): Bluebird<RoomEntry[]>;

    /**
     * Remove an IRC <--> Matrix room mapping from the database.
     * @param {string} roomId : The Matrix room ID.
     * @param {string} ircDomain : The IRC server domain.
     * @param {string} ircChannel : The IRC channel.
     * @param {string} origin : "config" if this mapping was from the config yaml,
     * "provision" if this mapping was provisioned, "alias" if it was created via
     * aliasing and "join" if it was created during a join.
     * @return {Promise}
     */
    removeRoom(roomId: string, ircDomain: string, ircChannel: string, origin: RoomOrigin): Promise<void>;

    /**
     * Retrieve a list of IRC rooms for a given room ID.
     * @param {string} roomId : The room ID to get mapped IRC channels.
     * @return {Promise<Array<IrcRoom>>} A promise which resolves to a list of
     * rooms.
     */
    getIrcChannelsForRoomId(roomId: string): Promise<IrcRoom[]>;


    /**
     * Retrieve a list of IRC rooms for a given list of room IDs. This is significantly
     * faster than calling getIrcChannelsForRoomId for each room ID.
     * @param {string[]} roomIds : The room IDs to get mapped IRC channels.
     * @return {Promise<Map<string, IrcRoom[]>>} A promise which resolves to a map of
     * room ID to an array of IRC rooms.
     */
    getIrcChannelsForRoomIds(roomIds: string[]): Promise<{[roomId: string]: IrcRoom[]}>;

    /**
     * Retrieve a list of Matrix rooms for a given server and channel.
     * @param {IrcServer} server : The server to get rooms for.
     * @param {string} channel : The channel to get mapped rooms for.
     * @return {Promise<Array<MatrixRoom>>} A promise which resolves to a list of rooms.
     */
    getMatrixRoomsForChannel(server: IrcServer, channel: string): Promise<Array<MatrixRoom>>;

    getMappingsForChannelByOrigin(server: IrcServer, channel: string,
                                  origin: RoomOrigin|RoomOrigin[], allowUnset: boolean): Promise<RoomEntry[]>;

    getModesForChannel (server: IrcServer, channel: string): Promise<{[id: string]: string}>;

    setModeForRoom(roomId: string, mode: string, enabled: boolean): Promise<void>;

    setPmRoom(ircRoom: IrcRoom, matrixRoom: MatrixRoom, userId: string, virtualUserId: string): Promise<void>;

    getMatrixPmRoom(realUserId: string, virtualUserId: string): Promise<MatrixRoom|null>;

    getTrackedChannelsForServer(domain: string): Promise<string[]>;

    getRoomIdsFromConfig(): Promise<string[]>;

    removeConfigMappings(): Promise<void>;

    getIpv6Counter(): Promise<number>;

    setIpv6Counter(counter: number): Promise<void>;

    getAdminRoomById(roomId: string): Promise<MatrixRoom|null>;

    storeAdminRoom(room: MatrixRoom, userId: string): Promise<void>;

    upsertRoomStoreEntry(entry: RoomEntry): Promise<void>;

    getAdminRoomByUserId(userId: string): Promise<MatrixRoom|null>;

    storeMatrixUser(matrixUser: MatrixUser): Promise<void>;

    getIrcClientConfig(userId: string, domain: string): Promise<IrcClientConfig|null>;

    storeIrcClientConfig(config: IrcClientConfig): Promise<void>;

    getMatrixUserByLocalpart(localpart: string): Promise<MatrixUser|null>;

    getUserFeatures(userId: string): Promise<UserFeatures>;

    storeUserFeatures(userId: string, features: UserFeatures): Promise<void>;

    storePass(userId: string, domain: string, pass: string): Promise<void>;

    removePass(userId: string, domain: string): Promise<void>;

    getMatrixUserByUsername(domain: string, username: string): Promise<MatrixUser|undefined>;
}