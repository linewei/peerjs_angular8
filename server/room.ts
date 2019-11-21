const logger = require('./utils/logger');

export class Candidate {
  id: string;
  refIds: string[] = [];

  constructor(candiId) {
    this.id = candiId;
  }
  addRef(peerId: string) {
    this.refIds = [ ...this.refIds, peerId];
  }

  disconnectRef(peerId: string) {
    this.refIds = this.refIds.filter((id) => {
      return peerId !== id;
    });
  }
}

export class Room {
  id: string;
  candidates: Candidate[] = [];

  constructor(roomId: string) {
    this.id = roomId;
  }

  getCandidate(id: string) {
    return this.candidates.find((candi) => {
      return candi.id === id;
    });
  }

  getOtherCandi(candiId: string) {
    return this.candidates.filter((candi) => {
      return candi.id !== candiId;
    });
  }

  joinRoom(candiId: string) {
    const aCandi = this.getCandidate(candiId);
    if (aCandi) {
      return aCandi;
    }

    const newCandi = new Candidate(candiId);

    this.candidates.map((candi) => {
      candi.addRef(newCandi.id);
      newCandi.addRef(candi.id);
    });

    this.candidates.push(newCandi);

    return newCandi;
  }

  leaveRoom(candiId: string) {
    this.candidates = this.candidates.filter((candi) => {
      return candi.id !== candiId;
    });

    this.candidates.map((candi) => {
      candi.disconnectRef(candiId);
    });
  }
}

export class RoomFactory {
  rooms: Room[] = [];
  crMap: Map<string, Room> = new Map();

  constructor() {
  }

  addRoom(room: Room): void {
    this.rooms.push(room);
  }

  removeRoom(room: Room): void {
    this.rooms = this.rooms.filter((ro) => {
      return ro.id !== room.id;
    });
  }

  addRoomByid(roomId: string, candiId: string) {
    let room = this.findRoom(roomId);

    if (!room) {
      room = new Room(roomId);
      this.addRoom(room);
    }

    room.joinRoom(candiId);
    this.crMap.set(candiId, room);
    return room;
  }

  leaveRoomByid(candiId: string) {
    const room = this.crMap.get(candiId);
    if (room) {
      room.leaveRoom(candiId);

      logger.info(`${candiId} leave room ${room.id}`);

      this.crMap.delete(candiId);
      if (!room.candidates.length) {
        this.removeRoom(room);
        logger.info(`room ${room.id} has 0 candidate, remove it from factory.`);
      }

    }
  }

  findRoom(roomId: string) {
    return this.rooms.find((ro) => {
      return ro.id === roomId;
    });
  }
}
